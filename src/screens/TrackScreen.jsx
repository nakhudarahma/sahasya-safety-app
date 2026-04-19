import React, { useState, useEffect } from 'react';
import { Card, Toast } from '../components/UI.jsx';
import { mockLocationPath } from '../data/mockData.js';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix React-Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function DestinationSelector({ isTracking, setDestinationCoords, setDestination }) {
  useMapEvents({
    click(e) {
      if (!isTracking) {
        setDestinationCoords([e.latlng.lat, e.latlng.lng]);
        setDestination(`Custom: ${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)}`);
      }
    },
  });
  return null;
}

export default function TrackScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startLocation, setStartLocation] = useState('Home');
  const [destination, setDestination] = useState('Select on Map');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [toast, setToast] = useState(null);

  // Shortcuts State
  const [shortcuts, setShortcuts] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [modalMode, setModalMode] = useState('selected'); // selected | current
  const [newShortcutName, setNewShortcutName] = useState('');
  const [newShortcutLocation, setNewShortcutLocation] = useState('');

  const START_COORDS = [19.076, 72.877];

  // Load Shortcuts
  useEffect(() => {
    const saved = localStorage.getItem('sahas_track_shortcuts');
    if (saved) {
      try {
        setShortcuts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse shortcuts', e);
      }
    }
  }, []);

  // Save Shortcuts to LocalStorage
  const saveToStorage = (newShortcuts) => {
    localStorage.setItem('sahas_track_shortcuts', JSON.stringify(newShortcuts));
    setShortcuts(newShortcuts);
  };

  useEffect(() => {
    if (!isTracking) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [isTracking]);

  const handleStart = () => {
    if (!destinationCoords) {
        setToast({ msg: 'Please tap the map to select a destination first.', type: 'warning' });
        return;
    }
    setIsTracking(true);
    setShareLink(`https://sahas.app/track/${Math.random().toString(36).slice(2, 10)}`);
  };

  const handleStop = () => {
    setIsTracking(false);
    setElapsed(0);
    setShareLink('');
  };

  const handleAddShortcut = () => {
    if (!newShortcutName.trim()) return;
    
    // Choose coords/address based on mode
    const coordsToSave = modalMode === 'current' ? START_COORDS : destinationCoords;
    const addressToSave = modalMode === 'current' ? newShortcutLocation.trim() : destination;

    const newShortcut = {
      id: Date.now().toString(),
      name: newShortcutName.trim(),
      coords: coordsToSave,
      address: addressToSave
    };
    const updated = [...shortcuts, newShortcut];
    saveToStorage(updated);
    setNewShortcutName('');
    setNewShortcutLocation('');
    setShowSaveModal(false);
    setToast({ msg: 'Shortcut saved!', type: 'success' });
  };

  const handleDeleteShortcut = (id, e) => {
    e.stopPropagation();
    const updated = shortcuts.filter(s => s.id !== id);
    saveToStorage(updated);
    setToast({ msg: 'Shortcut removed', type: 'info' });
  };

  const useShortcut = (s) => {
    setDestination(s.name);
    setDestinationCoords(s.coords);
    setToast({ msg: `Destination set to ${s.name}`, type: 'success' });
  };

  const copyLink = () => {
    setToast({ msg: 'Live tracking link copied!', type: 'success' });
    setTimeout(() => setToast(null), 2500);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const eta = Math.max(0, 30 - Math.floor(elapsed / 60));

  return (
    <div className="min-h-screen bg-sahas-dark noise screen-enter pb-28">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Save Shortcut Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-xs rounded-3xl p-6 shadow-2xl bg-sahas-card border border-sahas-border animate-scale-in">
            <h3 className="font-syne font-bold text-lg text-sahas-text mb-4 text-center">
              {modalMode === 'current' ? 'Add Location Shortcut' : 'Save Shortcut'}
            </h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-[10px] font-dm font-bold text-sahas-muted mb-1 block uppercase tracking-wide ml-1">Shortcut Name</label>
                <input 
                  type="text"
                  placeholder="E.g. Home, Office"
                  value={newShortcutName}
                  onChange={e => setNewShortcutName(e.target.value)}
                  className="w-full bg-sahas-dark border border-sahas-border rounded-xl px-4 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-teal"
                  autoFocus
                />
              </div>

              {modalMode === 'current' ? (
                <div>
                  <label className="text-[10px] font-dm font-bold text-sahas-muted mb-1 block uppercase tracking-wide ml-1">Location Address / Info</label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="E.g. 123 Street Name"
                      value={newShortcutLocation}
                      onChange={e => setNewShortcutLocation(e.target.value)}
                      className="w-full bg-sahas-dark border border-sahas-border rounded-xl pl-4 pr-12 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-teal"
                    />
                    <button
                      onClick={() => setNewShortcutLocation('Andheri West, Mumbai – Detected')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sahas-teal text-lg"
                    >
                      📍
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-sahas-dark/50 border border-sahas-border rounded-xl">
                   <p className="text-[10px] font-dm text-sahas-muted uppercase tracking-wide mb-0.5">Selected Location</p>
                   <p className="text-xs font-dm text-sahas-text">{destination}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setShowSaveModal(false); setNewShortcutName(''); setNewShortcutLocation(''); }} 
                className="flex-1 py-3 rounded-xl font-dm text-sm text-sahas-soft border border-sahas-border"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddShortcut} 
                className="flex-1 py-3 rounded-xl font-dm font-bold text-sm text-sahas-dark bg-sahas-teal"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sahas-soft text-xs font-dm tracking-widest uppercase">Journey</p>
            <h1 className="font-syne font-800 text-2xl text-sahas-text mt-0.5">
              Live Tracker <span className="text-sahas-red">.</span>
            </h1>
          </div>
          {isTracking && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sahas-red/10 border border-sahas-red/30">
              <span className="w-2 h-2 rounded-full bg-sahas-red rec-dot" />
              <span className="text-xs font-dm text-sahas-red">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="mx-5 mb-4 rounded-3xl overflow-hidden border border-sahas-border relative bg-sahas-card h-72">
        <MapContainer 
          center={START_COORDS}
          zoom={13} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DestinationSelector 
            isTracking={isTracking} 
            setDestinationCoords={setDestinationCoords} 
            setDestination={setDestination} 
          />

          <Marker position={START_COORDS}>
            <Popup>{startLocation || 'Start Location'}</Popup>
          </Marker>

          {destinationCoords && (
            <Marker position={destinationCoords}>
               <Popup>{destination || 'Destination'}</Popup>
            </Marker>
          )}

          {isTracking && destinationCoords && (
             <Polyline 
               positions={[START_COORDS, destinationCoords]} 
               color="#FF2D55" 
               weight={4} 
               dashArray="8, 6" 
               opacity={0.8} 
             />
          )}
        </MapContainer>
        
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-[400] pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sahas-dark/90 backdrop-blur-md shadow-lg border border-sahas-border/50">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-dm text-sahas-text font-medium uppercase tracking-tight">Tap map to set goal</span>
          </div>
        </div>
      </div>

      {/* Shortcuts Area */}
        <div className="px-5 mb-6">
          <p className="text-[10px] font-syne font-bold text-sahas-teal uppercase tracking-widest mb-3 ml-1">Quick Destinations</p>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {/* Add New Shortcut Button */}
            <button
               onClick={() => { setModalMode('current'); setShowSaveModal(true); }}
               className="flex-shrink-0 flex items-center justify-center w-12 h-[42px] bg-sahas-card border border-dashed border-sahas-border rounded-xl hover:border-sahas-teal/50 transition-all"
            >
              <span className="text-xl text-sahas-teal font-light">+</span>
            </button>

            {shortcuts.length === 0 ? (
              <div className="flex-1 py-2.5 flex items-center px-4 bg-sahas-card/30 border border-dashed border-sahas-border/50 rounded-xl">
                <p className="text-[9px] font-dm text-sahas-muted uppercase tracking-tight">No saved spots yet</p>
              </div>
            ) : (
              shortcuts.map(s => (
                <button
                  key={s.id}
                  onClick={() => useShortcut(s)}
                  className="flex-shrink-0 group relative flex items-center justify-center px-4 py-2 min-w-[80px] bg-sahas-card border border-sahas-border rounded-xl hover:border-sahas-teal/50 transition-all"
                >
                  <p className="text-[11px] font-syne font-700 text-sahas-text uppercase tracking-wider">{s.name}</p>
                  <button 
                    onClick={(e) => handleDeleteShortcut(s.id, e)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-sahas-dark border border-sahas-red/30 text-sahas-red text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    ✕
                  </button>
                </button>
              ))
            )}
          </div>
        </div>

      {/* Journey Details */}
      {isTracking ? (
        <div className="px-5 mb-4 animate-slide-up">
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Origin', value: startLocation || 'Current Location' },
                { label: 'Destination', value: destination },
                { label: 'Elapsed', value: formatTime(elapsed) },
                { label: 'ETA', value: `${eta} min` },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-[10px] font-dm text-sahas-soft mb-1 uppercase tracking-wider">{item.label}</p>
                  <p className="font-syne font-700 text-sahas-text text-sm truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-sahas-border pt-4">
              <p className="text-[10px] font-dm text-sahas-soft mb-3 uppercase tracking-wider">Live Updates</p>
              <div className="space-y-2">
                {mockLocationPath.slice(0, 3).map((loc, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${i === 2 ? 'bg-sahas-red' : 'bg-sahas-muted'}`} />
                    <span className="text-[10px] font-dm text-sahas-soft tabular-nums">{loc.time}</span>
                    <span className="text-[10px] font-dm text-sahas-text font-medium flex-1">Near {loc.label || 'Vile Parle'}</span>
                    <span className="text-[9px] font-dm text-sahas-red">Verified</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="px-5 mb-4">
          <Card className="p-5">
            <p className="text-[10px] font-syne font-bold text-sahas-soft mb-4 uppercase tracking-widest">Journey Setup</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-dm font-bold text-sahas-muted mb-1.5 block uppercase tracking-wide">Starting From</label>
                <div className="relative">
                  <input
                    value={startLocation}
                    onChange={e => setStartLocation(e.target.value)}
                    className="w-full bg-sahas-dark border border-sahas-border rounded-xl pl-4 pr-12 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-teal/40 transition-colors"
                  />
                  <button onClick={() => setStartLocation('Current Location (Detected)')} className="absolute right-3 top-1/2 -translate-y-1/2 text-sahas-teal">📍</button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-dm font-bold text-sahas-muted mb-1.5 block uppercase tracking-wide">Final Destination</label>
                <div className="relative">
                  <input
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    className="w-full bg-sahas-dark border border-sahas-border rounded-xl pl-4 pr-12 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-teal/40 transition-colors"
                    placeholder="Where are you going?"
                  />
                  <button 
                    onClick={() => setDestination('Current Location (Detected)')} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sahas-teal"
                  >
                    📍
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Action Button */}
      <div className="px-5">
        {isTracking ? (
          <button
            onClick={handleStop}
            className="w-full py-4 rounded-2xl border border-sahas-red/40 bg-sahas-red/10 text-sahas-red font-syne font-700 text-sm active:scale-95 transition-all shadow-xl shadow-sahas-red/5"
          >
            ■ End Live Journey
          </button>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleStart}
              className={`w-full py-4 rounded-2xl font-syne font-800 text-sm active:scale-95 transition-all ${
                destinationCoords 
                  ? 'bg-gradient-to-r from-sahas-teal to-sahas-green text-sahas-dark shadow-xl shadow-sahas-teal/20'
                  : 'bg-sahas-card border border-sahas-border text-sahas-soft'
              }`}
            >
              {destinationCoords ? '▶ Start Tracking & Share' : 'Choose Goal on Map'}
            </button>
            
            {shareLink && (
              <div className="p-4 rounded-2xl bg-sahas-teal/5 border border-sahas-teal/20 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-syne font-bold text-sahas-teal uppercase tracking-widest">Shareable Link Active</p>
                  <p className="text-[10px] font-dm text-sahas-soft mt-0.5 truncate max-w-[180px]">{shareLink}</p>
                </div>
                <button onClick={copyLink} className="px-4 py-2 rounded-lg bg-sahas-teal text-sahas-dark font-syne font-bold text-[10px]">COPY</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

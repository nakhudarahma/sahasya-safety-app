import React, { useState } from 'react';
import { mockHeatmapZones } from '../data/mockData.js';
import { Card, Toast } from '../components/UI.jsx';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix React-Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map clicks for reporting
function MapClickHandler({ reportMode, setReportPos, setToast, setReportMode }) {
  useMapEvents({
    click(e) {
      if (!reportMode) return;
      setReportPos(e.latlng);
      setToast({ msg: 'Area marked. Fill in report details below.', type: 'warning' });
      setTimeout(() => setToast(null), 3000);
      setReportMode(false);
    },
  });
  return null;
}


const ZONE_COLORS = {
  danger: { fill: 'rgba(255,45,85,0.35)', stroke: '#FF2D55', label: 'text-sahas-red', badge: 'bg-sahas-red/20 border-sahas-red/30 text-sahas-red' },
  caution: { fill: 'rgba(255,184,0,0.28)', stroke: '#FFB800', label: 'text-sahas-amber', badge: 'bg-sahas-amber/20 border-sahas-amber/30 text-sahas-amber' },
  safe: { fill: 'rgba(0,214,143,0.25)', stroke: '#00D68F', label: 'text-sahas-green', badge: 'bg-sahas-green/20 border-sahas-green/30 text-sahas-green' },
};

const FILTERS = ['All', 'Danger', 'Caution', 'Safe'];

export default function MapScreen() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [reportMode, setReportMode] = useState(false);
  const [reportPos, setReportPos] = useState(null);

  const filteredZones = mockHeatmapZones.filter(z =>
    filter === 'All' || z.type === filter.toLowerCase()
  );

  const stats = {
    total: mockHeatmapZones.length,
    danger: mockHeatmapZones.filter(z => z.type === 'danger').length,
    caution: mockHeatmapZones.filter(z => z.type === 'caution').length,
    safe: mockHeatmapZones.filter(z => z.type === 'safe').length,
  };

  const handleMapClick = (e) => {
    // Legacy generic click handler kept for safety, but real map clicks are handled by MapClickHandler component inside MapContainer
  };

  const handleReport = () => {
    setToast({ msg: 'Report submitted to community! Thank you.', type: 'success' });
    setTimeout(() => setToast(null), 3000);
    setReportPos(null);
  };

  return (
    <div className="min-h-screen bg-sahas-dark noise screen-enter pb-28">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sahas-soft text-xs font-dm tracking-widest uppercase">Community</p>
            <h1 className="font-syne font-800 text-2xl text-sahas-text mt-0.5">
              Safety Map <span className="text-sahas-red">.</span>
            </h1>
          </div>
          <button
            onClick={() => setReportMode(!reportMode)}
            className={`px-3 py-2 rounded-xl text-xs font-dm font-medium transition-all ${
              reportMode
                ? 'bg-sahas-red text-white'
                : 'bg-sahas-card border border-sahas-border text-sahas-soft hover:border-sahas-muted'
            }`}
          >
            {reportMode ? '✕ Cancel' : '⚑ Report Area'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-5 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'High Risk', count: stats.danger, color: 'sahas-red' },
            { label: 'Caution', count: stats.caution, color: 'sahas-amber' },
            { label: 'Safe Zones', count: stats.safe, color: 'sahas-green' },
          ].map((s) => (
            <div key={s.label} className="bg-sahas-card border border-sahas-border rounded-2xl p-3 text-center">
              <p className={`font-syne font-800 text-xl text-${s.color}`}>{s.count}</p>
              <p className="text-[10px] font-dm text-sahas-soft mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-dm font-medium transition-all ${
                filter === f
                  ? 'bg-sahas-red text-white'
                  : 'bg-sahas-card border border-sahas-border text-sahas-soft hover:border-sahas-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap/Leaflet Map */}
      <div className="mx-5 mb-4 rounded-2xl overflow-hidden border border-sahas-border relative bg-sahas-card">
        <MapContainer 
          center={[19.076, 72.877]} // Default to Mumbai
          zoom={12} 
          style={{ height: '18rem', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler 
            reportMode={reportMode} 
            setReportPos={setReportPos} 
            setToast={setToast} 
            setReportMode={setReportMode} 
          />

          {/* User location mock */}
          <Marker position={[19.076, 72.877]}>
            <Popup>You are here</Popup>
          </Marker>

          {/* Zone CircleMarkers */}
          {filteredZones.filter(z => z.lat && z.lng).map((zone) => {
            const c = ZONE_COLORS[zone.type];
            return (
              <CircleMarker
                key={zone.id}
                center={[zone.lat, zone.lng]}
                radius={zone.radius * 0.18}
                pathOptions={{
                  color: c.stroke,
                  fillColor: c.stroke,
                  fillOpacity: 0.25,
                  weight: 2,
                }}
                eventHandlers={{ click: () => setSelected(zone.id === selected ? null : zone.id) }}
              >
                <Popup>
                  <strong>{zone.label}</strong><br />
                  <span style={{ color: c.stroke, textTransform: 'capitalize' }}>{zone.type}</span>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Reported Note */}
          {reportPos && (
             <Marker position={[reportPos.lat, reportPos.lng]}>
               <Popup>Reported Area</Popup>
             </Marker>
          )}
        </MapContainer>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-sahas-border flex items-center gap-4">
          {Object.entries(ZONE_COLORS).map(([type, c]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: c.fill, border: `1px solid ${c.stroke}` }} />
              <span className="text-[10px] font-dm text-sahas-soft capitalize">{type}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-3 h-3 rounded-full bg-blue-500/80" />
            <span className="text-[10px] font-dm text-sahas-soft">You</span>
          </div>
        </div>
      </div>

      {/* Selected Zone Info */}
      {selected && (() => {
        const zone = mockHeatmapZones.find(z => z.id === selected);
        const colors = ZONE_COLORS[zone.type];
        return (
          <div className="px-5 mb-4 animate-scale-in">
            <div className={`p-4 rounded-2xl border ${colors.badge}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-syne font-700 text-sm">{zone.label}</p>
                <span className={`text-xs font-dm px-2 py-0.5 rounded-full border ${colors.badge} capitalize`}>
                  {zone.type}
                </span>
              </div>
              <p className="text-xs font-dm opacity-80">
                {zone.type === 'danger'
                  ? '⚠️ Multiple incidents reported. Avoid if possible, especially at night.'
                  : zone.type === 'caution'
                  ? '⚡ Exercise caution. Some reports in this area.'
                  : '✅ Community-marked as safe. Well-lit and patrolled.'}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Report submitted */}
      {reportPos && !reportMode && (
        <div className="px-5 mb-4 animate-scale-in">
          <Card className="p-4">
            <p className="text-xs font-dm text-sahas-soft mb-3 uppercase tracking-wider">Report This Area</p>
            <textarea
              className="w-full bg-sahas-dark border border-sahas-border rounded-xl p-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-amber/50 resize-none h-20"
              placeholder="Describe what you observed..."
            />
            <button
              onClick={handleReport}
              className="w-full mt-3 py-3 rounded-xl bg-sahas-amber/20 border border-sahas-amber/30 text-sahas-amber text-sm font-dm font-medium hover:bg-sahas-amber/30 transition-colors"
            >
              Submit Community Report
            </button>
          </Card>
        </div>
      )}

      {/* Safe Route Button */}
      <div className="px-5">
        <button
          onClick={() => setToast({ msg: 'Safe route calculated to your destination!', type: 'success' })}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-sahas-green/20 to-sahas-teal/20 border border-sahas-green/30 text-sahas-green font-syne font-700 text-sm active:scale-98 transition-all"
        >
          🛡️ Find Safest Route
        </button>
      </div>
    </div>
  );
}

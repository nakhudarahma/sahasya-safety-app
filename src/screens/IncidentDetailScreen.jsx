import React from 'react';
import { Card } from '../components/UI.jsx';
import { useIncidents } from '../hooks/useIncidents.js';

export default function IncidentDetailScreen({ incidentId, onBack }) {
  const { getIncidentById } = useIncidents();
  const incident = getIncidentById(incidentId);

  if (!incident) {
    return (
      <div className="min-h-screen bg-sahas-dark flex items-center justify-center p-5">
        <p className="text-sahas-soft">Incident not found.</p>
        <button onClick={onBack} className="ml-4 text-sahas-teal underline">Go Back</button>
      </div>
    );
  }

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen bg-sahas-dark border-x border-sahas-border pb-28">
      {/* Header Config */}
      <div className="sticky top-0 z-40 bg-sahas-dark/90 backdrop-blur-md px-5 py-4 border-b border-sahas-border flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-sahas-card border border-sahas-border flex items-center justify-center text-sahas-soft hover:text-sahas-text"
        >
          ←
        </button>
        <div>
          <h2 className="font-syne font-700 text-lg text-sahas-text leading-tight">{incident.id}</h2>
          <p className="text-xs font-dm text-sahas-soft">{formatDateTime(incident.date)}</p>
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Core Metadata */}
        <Card className="p-4 border-sahas-red/30">
           <div className="flex justify-between items-center mb-3">
             <h3 className="font-syne font-700 text-sahas-red">{incident.type}</h3>
             <span className="bg-sahas-red/20 text-sahas-red px-2 py-1 rounded text-xs font-dm font-bold">{incident.durationSeconds}s duration</span>
           </div>
           <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">📍</span>
              <span className="text-sm font-dm text-sahas-text">{incident.location}</span>
           </div>
        </Card>

        {/* AI Summary */}
        <div>
          <p className="text-xs font-dm text-sahas-teal mb-2 uppercase tracking-wider flex items-center gap-2">
            <span>✨</span> Automated Summary
          </p>
          <div className="bg-sahas-card border border-sahas-teal/20 rounded-2xl p-4">
             <p className="text-sm font-dm text-sahas-text leading-relaxed">
               {incident.summary}
             </p>
          </div>
        </div>

        {/* Generated Timeline Events */}
        <div>
           <p className="text-xs font-dm text-sahas-soft mb-3 uppercase tracking-wider">Event Timeline</p>
           <div className="w-full bg-sahas-card border border-sahas-border rounded-2xl p-4">
            <div className="space-y-3">
              {incident.timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-sahas-red`} />
                  <span className="text-xs font-dm text-sahas-soft tabular-nums w-12 pt-0.5">{item.time}</span>
                  <span className={`text-sm font-dm flex-1 text-sahas-text`}>
                    {item.event}
                  </span>
                </div>
              ))}
            </div>
           </div>
        </div>

        {/* Locked Evidence Placeholder */}
        <div>
          <p className="text-xs font-dm text-sahas-soft mb-3 uppercase tracking-wider">Secured Evidence (Encrypted)</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-sahas-card border border-sahas-border rounded-xl p-4 flex flex-col items-center justify-center opacity-60">
               <span className="text-2xl mb-2">🎙️</span>
               <span className="text-xs font-dm">Audio Trace</span>
            </div>
            <div className="bg-sahas-card border border-sahas-border rounded-xl p-4 flex flex-col items-center justify-center opacity-60">
               <span className="text-2xl mb-2">📹</span>
               <span className="text-xs font-dm">Video Buffer</span>
            </div>
          </div>
          <button className="w-full mt-3 py-3 rounded-xl bg-sahas-card border border-sahas-muted text-sahas-soft text-sm font-dm font-medium hover:text-sahas-text transition-colors">
            Decrypt and Export Data
          </button>
        </div>

      </div>
    </div>
  );
}

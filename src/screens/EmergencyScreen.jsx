import React, { useState, useEffect, useRef } from 'react';
import { useIncidents } from '../hooks/useIncidents.js';

const COLORS = ['#FF6B35', '#00D68F', '#00C4CC', '#9B59B6', '#FFB800', '#7C3AED'];
const colorFromName = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
};
const getInitials = (name = '') =>
  name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

export default function EmergencyScreen({ onCancel, user }) {
  const [phase, setPhase] = useState('countdown'); // countdown | active | sent
  const [countdown, setCountdown] = useState(5);
  const [elapsed, setElapsed] = useState(0);
  const [alertsSent, setAlertsSent] = useState([]);
  const [recording, setRecording] = useState(false);
  const intervalRef = useRef(null);
  
  const { saveIncident } = useIncidents(user);

  // Build real contacts list from user's emergency contacts
  const contacts = (user?.emergencyContacts || []).map(c => ({
    ...c,
    initials: getInitials(c.name),
    color: colorFromName(c.name),
  }));

  // Countdown phase
  useEffect(() => {
    if (phase === 'countdown' && countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    if (phase === 'countdown' && countdown === 0) {
      setPhase('active');
      setRecording(true);
    }
  }, [phase, countdown]);

  // Active phase: send alerts to contacts
  useEffect(() => {
    if (phase !== 'active') return;

    // Simulate sending alerts progressively to real emergency contacts
    contacts.forEach((c, i) => {
      setTimeout(() => {
        setAlertsSent(prev => [...prev, c.id]);
      }, (i + 1) * 1200);
    });

    // Elapsed timer
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleCancel = () => {
    clearInterval(intervalRef.current);
    
    // Save to Incident Vault if it was actually activated
    if (phase === 'active') {
      const generatedTimeline = [
        { time: formatTime(elapsed > 5 ? elapsed - 5 : 0), event: 'Pre-buffer captured (5s)' },
        { time: formatTime(0), event: 'SOS Triggered' },
        { time: formatTime(1), event: 'Recording started' },
        { time: formatTime(elapsed), event: 'Emergency Cancelled by user' }
      ];
      
      saveIncident({
        type: 'SOS Triggered',
        durationSeconds: elapsed,
        timeline: generatedTimeline
      });
    }
    
    onCancel();
  };

  if (phase === 'countdown') {
    return (
      <div className="fixed inset-0 bg-sahas-dark flex flex-col items-center justify-center z-50 screen-enter">
        {/* Background pulse */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at center, #FF2D55 0%, transparent 60%)' }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-sahas-red/40 flex items-center justify-center mb-6">
            <span className="text-2xl">🚨</span>
          </div>
          <p className="font-syne font-700 text-sahas-soft text-sm uppercase tracking-widest mb-4">
            Emergency Alert Sending In
          </p>
          <div
            className="text-8xl font-syne font-800 text-sahas-red"
            style={{ textShadow: '0 0 40px rgba(255,45,85,0.6)' }}
          >
            {countdown}
          </div>
          <p className="text-sahas-soft font-dm text-sm mt-4 mb-10">
            Audio & video recording will start
          </p>

          <button
            onClick={handleCancel}
            className="px-10 py-3.5 rounded-2xl border border-sahas-muted bg-sahas-card text-sahas-text font-syne font-600 text-sm hover:border-sahas-soft transition-colors"
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-sahas-dark flex flex-col z-50 screen-enter overflow-y-auto pb-8">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-15"
        style={{ background: 'radial-gradient(circle at center top, #FF2D55 0%, transparent 50%)' }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Top Status Bar */}
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rec-dot w-3 h-3 rounded-full bg-sahas-red" />
              <span className="font-syne font-700 text-sahas-red text-sm uppercase tracking-widest">SOS Active</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-sahas-card border border-sahas-border">
              <span className="font-dm text-sm text-sahas-text tabular-nums">{formatTime(elapsed)}</span>
            </div>
          </div>
        </div>

        {/* Center: SOS indicator */}
        <div className="flex flex-col items-center py-6 px-5">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-48 h-48 rounded-full border-2 border-sahas-red/20 animate-ping-slow" />
            <div className="absolute w-36 h-36 rounded-full border-2 border-sahas-red/30" />
            <div
              className="w-28 h-28 rounded-full bg-gradient-to-br from-sahas-red to-sahas-orange flex flex-col items-center justify-center"
              style={{ boxShadow: '0 0 50px rgba(255,45,85,0.5)' }}
            >
              <span className="text-3xl mb-0.5">📡</span>
              <span className="font-syne font-800 text-white text-[10px] tracking-widest">LIVE</span>
            </div>
          </div>

          {/* Recording indicators */}
          <div className="flex gap-4 mb-6">
            {[
              { icon: '🎙️', label: 'Audio', active: recording },
              { icon: '📹', label: 'Video', active: recording },
              { icon: '📍', label: 'Location', active: true },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                  item.active
                    ? 'bg-sahas-red/15 border-sahas-red/40'
                    : 'bg-sahas-card border-sahas-border'
                }`}>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <div className="flex items-center gap-1">
                  {item.active && <span className="w-1.5 h-1.5 rounded-full bg-sahas-red rec-dot" />}
                  <span className="text-[10px] font-dm text-sahas-soft">{item.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Evidence Timeline */}
          <div className="w-full bg-sahas-card border border-sahas-border rounded-2xl p-4 mb-4">
            <p className="text-xs font-dm text-sahas-soft mb-3 uppercase tracking-wider">Evidence Timeline</p>
            <div className="space-y-2">
              {[
                { time: formatTime(elapsed > 5 ? elapsed - 5 : 0), event: 'Pre-buffer captured (5s)', done: true },
                { time: formatTime(0), event: 'SOS Triggered', done: true },
                { time: formatTime(elapsed > 2 ? elapsed - 1 : 1), event: 'Recording started', done: elapsed > 1 },
                { time: formatTime(elapsed), event: 'Location locked: Andheri West', done: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.done ? 'bg-sahas-red' : 'bg-sahas-muted'}`} />
                  <span className="text-xs font-dm text-sahas-soft tabular-nums w-10">{item.time}</span>
                  <span className={`text-xs font-dm flex-1 ${item.done ? 'text-sahas-text' : 'text-sahas-muted'}`}>
                    {item.event}
                  </span>
                  {item.done && <span className="text-xs text-sahas-green">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Status */}
        <div className="px-5 mb-4">
          <p className="text-xs font-dm text-sahas-soft mb-3 uppercase tracking-wider">Alert Status</p>
          <div className="space-y-2">
            {contacts.length === 0 ? (
              <div className="p-4 rounded-xl bg-sahas-card border border-dashed border-sahas-muted text-center">
                <p className="text-xs font-dm text-sahas-soft">No emergency contacts set.</p>
                <p className="text-xs font-dm text-sahas-muted mt-1">Add contacts in your Profile to alert them during SOS.</p>
              </div>
            ) : (
              contacts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-sahas-card border border-sahas-border">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-syne font-700 flex-shrink-0"
                    style={{ background: `${c.color}20`, color: c.color, border: `1.5px solid ${c.color}40` }}
                  >
                    {c.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-dm text-sahas-text">{c.name}</p>
                    <p className="text-xs font-dm text-sahas-soft">{c.phone}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {alertsSent.includes(c.id) ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-sahas-green" />
                        <span className="text-xs font-dm text-sahas-green">Alerted</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-sahas-amber animate-pulse" />
                        <span className="text-xs font-dm text-sahas-amber">Sending…</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cancel Button */}
        <div className="px-5 mt-auto">
          <button
            onClick={handleCancel}
            className="w-full py-4 rounded-2xl border border-sahas-muted bg-sahas-card text-sahas-soft font-syne font-600 text-sm hover:border-sahas-red/40 hover:text-sahas-red transition-all active:scale-98"
          >
            ✕ Cancel Emergency
          </button>
          <p className="text-center text-xs font-dm text-sahas-muted mt-3">
            Evidence is secured even if alert is cancelled
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card, Avatar, Toast } from '../components/UI.jsx';
import { mockUser, safetyTips } from '../data/mockData.js';
import { useIncidents } from '../hooks/useIncidents.js';

const SHOW_DEMO_PANEL = false;

export default function HomeScreen({ onSOSActivate, onNavigate, user }) {
  const [safetyLevel, setSafetyLevel] = useState('safe'); // safe | caution | danger
  const [tipIndex, setTipIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [shakeDetect, setShakeDetect] = useState(false);

  // Rotate safety tips
  useEffect(() => {
    const t = setInterval(() => setTipIndex(i => (i + 1) % safetyTips.length), 5000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSOSPress = () => {
    onSOSActivate();
  };

  const { incidents } = useIncidents();
  
  // Calculate dynamic dashboard data
  const safetyScore = Math.max(0, 100 - (incidents.length * 12));
  const scoreColor = safetyScore > 80 ? 'text-sahas-green' : safetyScore > 50 ? 'text-sahas-amber' : 'text-sahas-red';
  
  const recentIncidents = incidents.slice(0, 2);

  const handleFakeCall = () => onNavigate('fakecall');
  const handleTrack = () => onNavigate('track');
  const handleTimer = () => onNavigate('timer');

  const safetyColors = {
    safe: { dot: 'bg-sahas-green', text: 'text-sahas-green', label: 'Area Safe', border: 'border-sahas-green/30' },
    caution: { dot: 'bg-sahas-amber', text: 'text-sahas-amber', label: 'Use Caution', border: 'border-sahas-amber/30' },
    danger: { dot: 'bg-sahas-red', text: 'text-sahas-red', label: 'High Risk Zone', border: 'border-sahas-red/30' },
  };
  const sc = safetyColors[safetyLevel];

  return (
    <div className="min-h-screen bg-sahas-dark noise screen-enter pb-28 pt-4">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Primary Top Metric: Safety Score */}
      <div className="px-5 mb-6">
         <Card className="p-3 flex items-center justify-between border-[#FF8FA3]/50 bg-[#FF8FA3]/5">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-sahas-card border border-sahas-border shadow-sm`}>
                 <span className={`font-syne font-800 text-xl leading-none ${scoreColor}`}>{safetyScore}</span>
               </div>
               <div>
                 <p className="text-xs font-dm text-sahas-text uppercase tracking-wider font-medium">Safety Rating</p>
                 <p className="text-[10px] font-dm text-sahas-soft">Based on recent data</p>
               </div>
            </div>
            <div className="px-3 py-1.5 rounded-full border border-sahas-muted bg-sahas-dark flex items-center gap-1.5 opacity-80">
               <span className={`w-1.5 h-1.5 rounded-full ${scoreColor} animate-pulse`} />
               <span className="text-[10px] font-dm text-sahas-soft uppercase tracking-wider">Live</span>
            </div>
         </Card>
      </div>

      {/* SOS Button - Core Primary Actions */}
      <div className="flex flex-col items-center pt-4 pb-12 px-5">
        
        {/* Outer glow rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-[240px] h-[240px] rounded-full border border-sahas-red/10 animate-ping-slow" />
          <div className="absolute w-[200px] h-[200px] rounded-full border border-sahas-red/15" />
          
          {/* Main SOS Button */}
          <button
            onPointerDown={handleSOSPress}
            className="relative w-40 h-40 rounded-full bg-[#FF6F91] flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-transform sos-ripple"
            style={{ boxShadow: '0 0 50px rgba(255,111,145,0.4), 0 0 100px rgba(255,111,145,0.15)' }}
          >
            <span className="text-5xl mb-1">🆘</span>
            <span className="font-syne font-800 text-white text-sm tracking-widest uppercase">Hold SOS</span>
          </button>
        </div>

        <p className="text-sahas-soft text-xs font-dm mt-8 text-center max-w-[260px] opacity-70">
          Press & hold strictly in emergencies. Audio, video, and live location will be shared immediately.
        </p>
      </div>

      {/* Secondary Information: Alerts & Status */}
      <div className="px-5 mb-6">
        <p className="text-sahas-soft text-xs font-dm mb-3 tracking-widest uppercase">Insights & Reports</p>
        
        {/* Journey Status */}
        <Card className="p-3 mb-3 flex items-center justify-between overflow-hidden">
           <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg opacity-80">📍</span>
              <p className="text-[11px] sm:text-xs font-dm text-sahas-text uppercase tracking-wider">Journey Status</p>
           </div>
           <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#FF8FA3]/10 border border-[#FF8FA3]/30 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF8FA3]" />
              <span className="font-syne font-700 text-[10px] text-[#FF8FA3] uppercase">Inactive</span>
           </div>
        </Card>

        {/* Nearby Risk Alerts */}
        <Card className="p-4 mb-3 border-sahas-amber/20 bg-sahas-amber/5">
          <p className="text-[10px] font-dm text-sahas-amber uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>⚠️</span> Nearby Alerts
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
               <span className="text-xs mt-0.5">📍</span>
               <p className="text-xs font-dm text-sahas-text">Unlit area reported 200m ahead.</p>
            </div>
            <div className="flex items-start gap-2">
               <span className="text-xs mt-0.5">👥</span>
               <p className="text-xs font-dm text-sahas-text">Suspicious gathering near station.</p>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
             <p className="text-[10px] font-dm text-sahas-soft uppercase tracking-wider flex items-center gap-2">
               <span>🕒</span> Recent Activity
             </p>
             <button onClick={() => onNavigate('vault')} className="text-[10px] font-dm text-sahas-teal p-2 -m-2 active:scale-95 transition-transform">View All →</button>
          </div>
          <div className="space-y-2">
            {recentIncidents.length === 0 ? (
              <p className="text-xs font-dm text-sahas-muted">No recent activity.</p>
            ) : (
              recentIncidents.map(inc => (
                <div key={inc.id} className="flex justify-between items-center bg-sahas-dark rounded-xl p-2.5 border border-sahas-border">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sahas-red" />
                    <span className="text-[11px] font-dm text-sahas-text">{inc.type}</span>
                  </div>
                  <span className="text-[9px] font-dm text-sahas-soft opacity-80 uppercase tracking-widest">
                    {new Date(inc.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-5">
        <p className="text-sahas-soft text-xs font-dm mb-3 tracking-widest uppercase">Quick Actions</p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: '📍', label: 'Track Me', action: handleTrack, highlight: false },
            { icon: '⏱️', label: 'Check-in', action: handleTimer, highlight: false },
            { icon: '📞', label: 'Fake Call', action: handleFakeCall, highlight: false },
            { icon: '🗺️', label: 'Safe Map', action: () => onNavigate('map'), highlight: false },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-sahas-card border border-sahas-border hover:border-sahas-muted active:scale-95 transition-all"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] font-dm text-sahas-soft leading-tight text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sahas-soft text-xs font-dm tracking-widest uppercase">Emergency Contacts</p>
          <button 
            onClick={() => onNavigate('profile')}
            className="text-xs text-sahas-teal font-dm p-2 -m-2 active:scale-95 transition-transform"
          >
            Manage →
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {(user?.emergencyContacts || []).map((c, idx) => {
            const COLORS = ['#FF6B35', '#00D68F', '#00C4CC', '#FF2D55', '#FFB800', '#7C3AED'];
            const color = COLORS[idx % COLORS.length];
            const initials = c.name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
            return (
              <button
                key={c.id}
                onClick={() => showToast(`Calling ${c.name}...`, 'info')}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-syne font-700 text-sm"
                  style={{ background: `${color}20`, border: `2px solid ${color}44`, color: color }}
                >
                  {initials}
                </div>
                <span className="text-xs font-dm text-sahas-soft">{c.name}</span>
              </button>
            );
          })}
          <button
            onClick={() => onNavigate('profile')}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="w-12 h-12 rounded-full bg-sahas-card border-2 border-dashed border-sahas-muted flex items-center justify-center">
              <span className="text-sahas-soft text-xl">+</span>
            </div>
            <span className="text-xs font-dm text-sahas-soft">Add</span>
          </button>
        </div>
      </div>

      {/* Safety Tip */}
      <div className="px-5 mb-5">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sahas-teal/10 to-sahas-green/10 border border-sahas-teal/20">
          <div className="flex gap-3">
            <span className="text-lg flex-shrink-0">💡</span>
            <div>
              <p className="text-xs font-dm text-sahas-teal mb-1 uppercase tracking-wider">Safety Tip</p>
              <p className="text-sm font-dm text-sahas-text transition-all">{safetyTips[tipIndex]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Level Selector (Demo) */}
      {SHOW_DEMO_PANEL && (
        <div className="px-5">
          <Card className="p-4">
            <p className="text-xs font-dm text-sahas-soft mb-3 uppercase tracking-wider">Demo: Set Area Safety</p>
            <div className="flex gap-2">
              {['safe', 'caution', 'danger'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSafetyLevel(level)}
                  className={`flex-1 py-2 rounded-xl text-xs font-dm font-medium capitalize transition-all ${
                    safetyLevel === level
                      ? level === 'safe' ? 'bg-sahas-green text-sahas-dark'
                      : level === 'caution' ? 'bg-sahas-amber text-sahas-dark'
                      : 'bg-sahas-red text-white'
                      : 'bg-sahas-muted/30 text-sahas-soft'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

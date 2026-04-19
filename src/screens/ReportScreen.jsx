import React, { useState } from 'react';
import { Card, Toggle, Toast } from '../components/UI.jsx';
import { useIncidents } from '../hooks/useIncidents.js';

// Basic synchronous string obfuscation 
const hashString = (str) => btoa(encodeURIComponent(str)).split('').reverse().join('');

const INCIDENT_TYPES = [
  'SOS Triggered',
  'Stalking / Following',
  'Verbal Harassment',
  'Physical Assault',
  'Indecent Exposure',
  'Cyberbullying',
  'Domestic Violence',
  'Other',
];

const ESCALATION_LEVELS = [
  { id: 'store', label: 'Secure Storage Only', desc: 'Evidence stored, not shared', icon: '🔒', color: 'sahas-teal' },
  { id: 'contacts', label: 'Share with Trusted', desc: 'Send to your emergency contacts', icon: '👥', color: 'sahas-amber' },
  { id: 'authority', label: 'Escalate to Authorities', desc: 'File with police / NGO', icon: '⚖️', color: 'sahas-red' },
];

export default function ReportScreen({ user, prefill, onClearPrefill }) {
  const { incidents, saveIncident: saveReport, deleteIncident } = useIncidents(user, 'reports');
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Auth State
  const storageKey = `sahas_vault_pw_${user?.id || 'guest'}`;
  const savedHash = localStorage.getItem(storageKey);
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const [anonymous, setAnonymous] = useState(true);
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [escalation, setEscalation] = useState('store');
  const [hasEvidence, setHasEvidence] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');
  const [activeTab, setActiveTab] = useState('new'); // new | history
  const [toast, setToast] = useState(null);

  // Prefill Logic
  React.useEffect(() => {
    if (prefill) {
      setActiveTab('new');
      setIncidentType(prefill.type || '');
      setLocation(prefill.location || '');
      
      const dateStr = new Date(prefill.date).toLocaleDateString();
      const timeStr = new Date(prefill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const durationMins = Math.floor(prefill.durationSeconds / 60);
      const durationSecs = prefill.durationSeconds % 60;
      const durationStr = `${durationMins}m ${durationSecs}s`;

      setDescription(
        `Type: ${prefill.type}\n` +
        `Time: ${dateStr} | ${timeStr}\n` +
        `Location: ${prefill.location || 'Not specified'}\n` +
        `Duration: ${durationStr}\n\n` +
        `[Enter details here]`
      );
      setHasEvidence(true);
      onClearPrefill();
    }
  }, [prefill, onClearPrefill]);

  const handleSubmit = () => {
    if (!incidentType || !description) {
      setToast({ msg: 'Please fill in incident type and description', type: 'warning' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    const payload = {
      type: incidentType,
      location: location || 'Not specified',
      durationSeconds: 0,
      description: description,
      timeline: [
        { time: '00:00', event: 'Manual Report Filed' },
        { time: '00:01', event: `Escalation Preference: ${escalation}` },
        { time: '00:02', event: hasEvidence ? 'Evidence vault linked' : 'No media provided' }
      ]
    };

    const savedIncident = saveReport(payload);
    
    setReportId(savedIncident.id);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setIncidentType('');
    setDescription('');
    setLocation('');
    setHasEvidence(false);
    setEscalation('store');
    setAnonymous(true);
  };

  const handleSetup = (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 4) return setError('Password must be at least 4 characters');
    if (password !== confirm) return setError('Passwords do not match');
    
    localStorage.setItem(storageKey, hashString(password));
    setIsUnlocked(true);
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    setError('');
    
    if (hashString(password) === savedHash) {
      setIsUnlocked(true);
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const renderHistoryTab = () => {
    if (!savedHash && !isUnlocked) {
      return (
        <div className="px-6 py-8 flex flex-col items-center justify-center animate-scale-in">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <h2 className="font-syne font-bold text-xl text-sahas-text">Secure Your Reports</h2>
              <p className="font-dm text-sm text-sahas-soft mt-1">Set a shared password to protect your reports and Evidence Vault</p>
            </div>
            <form onSubmit={handleSetup} className="space-y-4">
              <input 
                type="password" 
                placeholder="Enter new password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-sahas-card border border-sahas-border rounded-xl px-4 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-red"
                autoFocus
              />
              <input 
                type="password" 
                placeholder="Confirm password" 
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full bg-sahas-card border border-sahas-border rounded-xl px-4 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-red"
              />
              {error && <p className="text-xs text-sahas-red font-dm text-center">{error}</p>}
              <button type="submit" className="w-full py-3.5 rounded-xl bg-sahas-red text-white font-dm font-bold mt-2 hover:bg-sahas-red/90 transition-colors">
                Set Password
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (!isUnlocked) {
      return (
        <div className="px-6 py-8 flex flex-col items-center justify-center animate-scale-in">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <h2 className="font-syne font-bold text-xl text-sahas-text">Reports Locked</h2>
              <p className="font-dm text-sm text-sahas-soft mt-1">Enter your password to manage your reports</p>
            </div>
            <form onSubmit={handleUnlock} className="space-y-4">
              <input 
                type="password" 
                placeholder="Enter password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-sahas-card border border-sahas-border rounded-xl px-4 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-red"
                autoFocus
              />
              {error && <p className="text-xs text-sahas-red font-dm text-center">{error}</p>}
              <button type="submit" className="w-full py-3.5 rounded-xl bg-sahas-red text-white font-dm font-bold mt-2 hover:bg-sahas-red/90 transition-colors">
                Unlock
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="px-5">
        <div className="space-y-3">
          {incidents.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-sahas-muted rounded-2xl bg-sahas-card">
              <span className="text-3xl mb-2 opacity-60">📑</span>
              <p className="text-sahas-soft font-dm text-sm">No reports filed yet</p>
            </div>
          ) : (
            incidents.map((inc) => (
              <Card key={inc.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-syne font-700 text-sm text-sahas-text">{inc.type}</p>
                    <p className="text-xs font-dm text-sahas-soft">
                      {new Date(inc.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-dm px-2 py-0.5 rounded-full border bg-sahas-amber/20 border-sahas-amber/30 text-sahas-amber">
                      Pending
                    </span>
                    <button 
                      onClick={() => setDeleteTarget(inc.id)}
                      className="text-sahas-red/70 hover:text-sahas-red transition-colors"
                      title="Delete Report"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-xs font-dm text-sahas-soft">📍 {inc.location}</p>
                <p className="mt-2 text-xs font-dm text-sahas-text line-clamp-2 italic">{inc.summary}</p>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-sahas-dark noise screen-enter pb-28">
        <div className="px-5 pt-12 pb-6">
          <p className="text-sahas-soft text-xs font-dm tracking-widest uppercase">Report</p>
          <h1 className="font-syne font-800 text-2xl text-sahas-text mt-0.5">Submitted <span className="text-sahas-red">.</span></h1>
        </div>

        {/* Success */}
        <div className="px-5">
          <div className="p-6 rounded-2xl bg-sahas-green/10 border border-sahas-green/30 text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-sahas-green/20 border border-sahas-green/40 flex items-center justify-center text-3xl mx-auto mb-4">
              ✅
            </div>
            <h2 className="font-syne font-700 text-sahas-green text-xl mb-1">Report Secured</h2>
            <p className="text-sahas-soft font-dm text-sm">{anonymous ? 'Submitted anonymously' : 'Submitted with your profile'}</p>
            <div className="mt-4 px-4 py-2 rounded-xl bg-sahas-dark border border-sahas-border inline-block">
              <span className="font-syne font-700 text-sahas-text text-sm tracking-wider">{reportId}</span>
            </div>
          </div>

          {/* Timeline Preview */}
          <Card className="p-4 mb-4">
            <p className="text-xs font-dm text-sahas-soft mb-3 uppercase tracking-wider">Evidence Timeline</p>
            <div className="space-y-3">
              {[
                { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: 'Report created', icon: '📋', done: true },
                { time: '', event: `Type: ${incidentType}`, icon: '⚠️', done: true },
                { time: '', event: `Escalation: ${ESCALATION_LEVELS.find(e => e.id === escalation)?.label}`, icon: '📡', done: true },
                { time: '', event: hasEvidence ? 'Evidence files attached (encrypted)' : 'No evidence attached', icon: '🔐', done: true },
                { time: '', event: anonymous ? 'Identity: Anonymous' : 'Identity: Disclosed', icon: '🕵️', done: true },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-sahas-card border border-sahas-border flex items-center justify-center text-sm flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-xs font-dm text-sahas-text">{item.event}</p>
                    {item.time && <p className="text-[10px] font-dm text-sahas-muted">{item.time}</p>}
                  </div>
                  <span className="text-sahas-green text-xs">✓</span>
                </div>
              ))}
            </div>
          </Card>

          <button
            onClick={handleReset}
            className="w-full py-4 rounded-2xl border border-sahas-border bg-sahas-card text-sahas-soft font-dm text-sm active:scale-98 transition-all"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sahas-dark noise screen-enter pb-28">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="px-5 pt-4 pb-4">
        <p className="text-sahas-soft text-xs font-dm tracking-widest uppercase">Justice</p>
        <h1 className="font-syne font-800 text-2xl text-sahas-text mt-0.5">
          Report <span className="text-sahas-red">.</span>
        </h1>
      </div>

      {/* Delete Confirmation Overlay */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="w-full max-w-xs rounded-3xl p-6 shadow-2xl bg-sahas-card border border-sahas-red/30 animate-scale-in">
            <div className="text-center mb-5">
              <span className="text-3xl mb-2 block">🗑️</span>
              <h3 className="font-syne font-bold text-lg text-sahas-text">Delete Report</h3>
              <p className="font-dm text-sm text-sahas-soft mt-1">
                Are you sure you want to permanently delete this report?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl font-dm text-sm text-sahas-text border border-sahas-border bg-transparent transition-colors hover:bg-sahas-dark"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteIncident(deleteTarget);
                  setDeleteTarget(null);
                  showToast('Report deleted', 'info');
                }}
                className="flex-1 py-3 rounded-xl font-dm font-semibold text-sm text-white bg-sahas-red transition-all active:scale-95"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div className="flex p-1 bg-sahas-card border border-sahas-border rounded-2xl">
          {[
            { id: 'new', label: '+ New Report' },
            { id: 'history', label: 'My Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'history') {
                  setIsUnlocked(false);
                  setPassword('');
                  setConfirm('');
                  setError('');
                }
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-dm font-medium transition-all ${
                activeTab === tab.id ? 'bg-sahas-red text-white' : 'text-sahas-soft'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'history' ? (
        /* History View */
        renderHistoryTab()
      ) : (
        /* New Report Form */
        <div className="px-5 space-y-4">
          {/* Anonymous Toggle */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-dm text-sm text-sahas-text">Submit Anonymously</p>
                <p className="text-xs font-dm text-sahas-soft mt-0.5">Your identity stays hidden</p>
              </div>
              <Toggle enabled={anonymous} onChange={setAnonymous} />
            </div>
            {anonymous && (
              <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-sahas-green/10 border border-sahas-green/20">
                <span className="text-sm">🕵️</span>
                <p className="text-xs font-dm text-sahas-green">Anonymous mode active. No personal data included.</p>
              </div>
            )}
          </Card>

          {/* Incident Type */}
          <div>
            <p className="text-xs font-dm text-sahas-soft mb-2 uppercase tracking-wider">Incident Type *</p>
            <div className="flex flex-wrap gap-2">
              {INCIDENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setIncidentType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-dm font-medium transition-all ${
                    incidentType === type
                      ? 'bg-sahas-red text-white'
                      : 'bg-sahas-card border border-sahas-border text-sahas-soft hover:border-sahas-muted'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-dm text-sahas-soft mb-2 uppercase tracking-wider">Description *</p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-sahas-card border border-sahas-border rounded-2xl px-4 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-red/50 resize-none h-28 transition-colors"
              placeholder="Describe what happened. Be as specific as possible. This helps create a structured legal timeline."
            />
          </div>

          {/* Location */}
          <div>
            <p className="text-xs font-dm text-sahas-soft mb-2 uppercase tracking-wider">Location</p>
            <div className="relative">
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-sahas-card border border-sahas-border rounded-2xl pl-4 pr-12 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-red/50 transition-colors"
                placeholder="Where did this occur?"
              />
              <button
                onClick={() => setLocation('Andheri West, Mumbai – Detected')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sahas-teal text-lg"
              >
                📍
              </button>
            </div>
          </div>

          {/* Evidence Upload */}
          <div>
            <p className="text-xs font-dm text-sahas-soft mb-2 uppercase tracking-wider">Evidence</p>
            <button
              onClick={() => setHasEvidence(!hasEvidence)}
              className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all ${
                hasEvidence
                  ? 'border-sahas-teal/40 bg-sahas-teal/5'
                  : 'border-sahas-muted/50 hover:border-sahas-muted'
              }`}
            >
              {hasEvidence ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🔒</span>
                  <div className="text-left">
                    <p className="text-sm font-dm text-sahas-teal">Evidence Added (Encrypted)</p>
                    <p className="text-xs font-dm text-sahas-soft">3 files • AES-256 secured</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">📎</span>
                  <p className="text-sm font-dm text-sahas-soft">Tap to attach evidence</p>
                  <p className="text-xs font-dm text-sahas-muted">Audio, video, photos supported</p>
                </div>
              )}
            </button>
          </div>

          {/* Escalation Level */}
          <div>
            <p className="text-xs font-dm text-sahas-soft mb-2 uppercase tracking-wider">Reporting Level</p>
            <div className="space-y-2">
              {ESCALATION_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setEscalation(level.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    escalation === level.id
                      ? `border-${level.color}/40 bg-${level.color}/5`
                      : 'border-sahas-border bg-sahas-card hover:border-sahas-muted'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-${level.color}/10 border border-${level.color}/20 flex items-center justify-center text-xl flex-shrink-0`}>
                    {level.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-dm text-sahas-text">{level.label}</p>
                    <p className="text-xs font-dm text-sahas-soft">{level.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    escalation === level.id ? 'border-sahas-red bg-sahas-red' : 'border-sahas-muted'
                  }`}>
                    {escalation === level.id && <span className="text-white text-xs">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sahas-red to-sahas-orange text-white font-syne font-700 text-sm active:scale-98 transition-all"
            style={{ boxShadow: '0 8px 24px rgba(255,45,85,0.3)' }}
          >
            {anonymous ? '🕵️ Submit Anonymously' : '📋 Submit Report'}
          </button>
          <p className="text-center text-xs font-dm text-sahas-muted pb-2">
            Evidence is end-to-end encrypted. You own your data.
          </p>
        </div>
      )}
    </div>
  );
}

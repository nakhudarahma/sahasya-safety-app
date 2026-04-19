import React, { useState, useEffect } from 'react';
import { Card, SectionHeader } from '../components/UI.jsx';
import { useIncidents } from '../hooks/useIncidents.js';

// Basic synchronous string obfuscation 
const hashString = (str) => btoa(encodeURIComponent(str)).split('').reverse().join('');

export default function EvidenceVaultScreen({ onNavigateToIncident, onReportIncident, user }) {
  const { incidents, deleteIncident } = useIncidents(user);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Vault Authentication State
  const storageKey = `sahas_vault_pw_${user?.id || 'guest'}`;
  const savedHash = localStorage.getItem(storageKey);
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
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

  // --- Auth Views ---
  if (!savedHash && !isUnlocked) {
    return (
      <div className="min-h-screen bg-sahas-dark flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h2 className="font-syne font-bold text-2xl text-sahas-text">Secure Your Vault</h2>
            <p className="font-dm text-sm text-sahas-soft mt-1">Set a password to protect your incident evidence</p>
          </div>
          <form onSubmit={handleSetup} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter new password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-sahas-card border border-sahas-border rounded-xl px-4 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-teal"
              autoFocus
            />
            <input 
              type="password" 
              placeholder="Confirm password" 
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full bg-sahas-card border border-sahas-border rounded-xl px-4 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-teal"
            />
            {error && <p className="text-xs text-sahas-red font-dm text-center">{error}</p>}
            <button type="submit" className="w-full py-3.5 rounded-xl bg-sahas-teal text-sahas-dark font-dm font-bold mt-2">
              Set Password
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-sahas-dark flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h2 className="font-syne font-bold text-2xl text-sahas-text">Vault Locked</h2>
            <p className="font-dm text-sm text-sahas-soft mt-1">Enter your password to access evidence</p>
          </div>
          <form onSubmit={handleUnlock} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Vault Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-sahas-card border border-sahas-border rounded-xl px-4 py-3 text-sm font-dm text-sahas-text outline-none focus:border-sahas-teal"
              autoFocus
            />
            {error && <p className="text-xs text-sahas-red font-dm text-center">{error}</p>}
            <button type="submit" className="w-full py-3.5 rounded-xl bg-sahas-teal text-sahas-dark font-dm font-bold mt-2">
              Unlock Vault
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sahas-dark noise screen-enter pb-28">
      {/* Header */}
      <div className="px-5 pt-4 pb-6">
        <p className="text-sahas-soft text-xs font-dm tracking-widest uppercase">Post-Incident</p>
        <h1 className="font-syne font-800 text-2xl text-sahas-text mt-0.5">
          Evidence Vault <span className="text-sahas-red">.</span>
        </h1>
        <p className="text-sahas-soft text-xs font-dm mt-1.5">
          Securely locked incident logs and captured media
        </p>
      </div>

      {/* Delete Confirmation Overlay */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="w-full max-w-xs rounded-3xl p-6 shadow-2xl bg-sahas-card border border-sahas-red/30 animate-scale-in">
            <div className="text-center mb-5">
              <span className="text-3xl mb-2 block">🗑️</span>
              <h3 className="font-syne font-bold text-lg text-sahas-text">Delete Incident</h3>
              <p className="font-dm text-sm text-sahas-soft mt-1">
                Are you sure you want to permanently delete all evidence for this incident?
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
                }}
                className="flex-1 py-3 rounded-xl font-dm font-semibold text-sm text-white bg-sahas-red transition-all active:scale-95"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incidents List */}
      <div className="px-5 mb-5 space-y-4">
        {incidents.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-sahas-muted rounded-2xl bg-sahas-card">
            <span className="text-3xl mb-2 opacity-60">🗄️</span>
            <p className="text-sahas-soft font-dm text-sm">No incidents recorded yet</p>
          </div>
        ) : (
          incidents.map((incident) => (
            <Card 
              key={incident.id} 
              className="p-4 transition-all hover:border-sahas-teal/50" 
              onClick={() => onNavigateToIncident(incident.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-syne font-700 text-sahas-text text-lg">{incident.type}</h3>
                  <p className="text-xs font-dm text-sahas-soft">{formatDateTime(incident.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-sahas-red/15 text-sahas-red px-2 py-1 rounded text-xs font-bold font-dm">
                    {formatDuration(incident.durationSeconds)}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onReportIncident(incident); }}
                    className="p-1 px-2 text-sahas-soft hover:text-sahas-teal hover:bg-sahas-teal/10 rounded-md transition-colors"
                    title="Generate Report"
                  >
                    📋
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(incident.id); }}
                    className="p-1 px-2 text-sahas-red/70 hover:text-sahas-red hover:bg-sahas-red/10 rounded-md transition-colors"
                    title="Delete Evidence"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sahas-soft text-sm">📍</span>
                <span className="text-xs font-dm text-sahas-text">{incident.location}</span>
              </div>
              <div className="mt-3 flex gap-2">
                 <span className="bg-sahas-card border border-sahas-border px-2 py-1 text-[10px] rounded text-sahas-soft">🎙️ Audio</span>
                 <span className="bg-sahas-card border border-sahas-border px-2 py-1 text-[10px] rounded text-sahas-soft">📹 Video</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

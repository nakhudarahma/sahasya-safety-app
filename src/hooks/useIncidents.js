import { useState, useEffect } from 'react';

// AI Summary string mapping based on duration length and events
const generateAISummary = (durationSeconds) => {
  if (durationSeconds < 10) {
    return "User triggered SOS but cancelled shortly after. Likely a false alarm or test of the system.";
  } else if (durationSeconds < 60) {
    return "SOS was active for a brief period. Audio/Video recording was started and contacts were alerted. The user terminated the alert within a minute, suggesting the immediate threat was resolved or they reached a safe area.";
  } else if (durationSeconds < 300) {
    return "Extended incident recorded. Emergency contacts were fully notified alongside active location tracking. The situation sustained for several minutes, indicating a potential escalation that eventually subsided.";
  } else {
    return "A critical extended event occurred lasting over 5 minutes. Continuous tracking and recording were engaged. Significant evidence was collected and all contacts were pinged.";
  }
};

const DUMMY_INCIDENTS = [
  {
    id: `INC-778102`,
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    location: 'Bandra West, Mumbai',
    type: 'SOS Triggered',
    durationSeconds: 145,
    summary: generateAISummary(145),
    timeline: [
      { time: '00:00', event: 'SOS Triggered' },
      { time: '00:01', event: 'Recording started' },
      { time: '00:25', event: 'High-risk location detected' },
      { time: '02:25', event: 'Emergency Cancelled by user' }
    ],
    evidence: { notes: 'Suspicious vehicle followed me near the station.', screenshots: [] }
  },
  {
    id: `INC-332901`,
    date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    location: 'Juhu Tara Road',
    type: 'ALERT Triggered',
    durationSeconds: 30,
    summary: generateAISummary(30),
    timeline: [
      { time: '00:00', event: 'SOS Triggered' },
      { time: '00:15', event: 'Audio recording locked' },
      { time: '00:30', event: 'Emergency Cancelled by user' }
    ],
    evidence: { notes: 'Testing system with contacts.', screenshots: [] }
  },
  {
    id: `INC-990144`,
    date: new Date(Date.now() - 86400000 * 12).toISOString(), // 12 days ago
    location: 'Lower Parel',
    type: 'SOS Triggered',
    durationSeconds: 340,
    summary: generateAISummary(340),
    timeline: [
      { time: '00:00', event: 'SOS Triggered' },
      { time: '01:05', event: 'Continuous movement detected' },
      { time: '03:40', event: 'Approaching hospital zone' },
      { time: '05:40', event: 'Emergency Cancelled by user' }
    ],
    evidence: { notes: '', screenshots: [] }
  }
];

const DUMMY_REPORTS = [
  {
    id: `RPT-772199`,
    date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    location: 'Lower Parel Station',
    type: 'Stalking / Following',
    durationSeconds: 0,
    summary: 'A suspicious individual was following me from the station exit to my apartment bloc.',
    timeline: [
      { time: '00:00', event: 'Manual Report Filed' }
    ],
    evidence: { notes: '', screenshots: [] }
  }
];

export const useIncidents = (user, domain = 'vault') => {
  const [incidents, setIncidents] = useState([]);
  const storageKey = `sahas_${domain}_${user?.id || 'guest'}`;

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        setIncidents(JSON.parse(raw));
      } catch (_) {}
    } else {
      // Seed dummy data based on domain
      const seedData = domain === 'reports' ? DUMMY_REPORTS : DUMMY_INCIDENTS;
      localStorage.setItem(storageKey, JSON.stringify(seedData));
      setIncidents(seedData);
    }
  }, [storageKey, domain]);

  const saveIncident = (payload) => {
    const id = `INC-${Date.now().toString().slice(-6)}`;
    const newIncident = {
      id,
      date: new Date().toISOString(),
      location: payload.location || 'Andheri West, Mumbai (Locked)',
      type: payload.type || 'SOS Triggered',
      durationSeconds: payload.durationSeconds || 0,
      timeline: payload.timeline || [],
      summary: payload.description || generateAISummary(payload.durationSeconds || 0)
    };

    setIncidents(prev => {
      const updated = [newIncident, ...prev];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    
    return newIncident;
  };

  const deleteIncident = (id) => {
    setIncidents(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const getIncidentById = (id) => {
    return incidents.find(i => i.id === id) || null;
  };

  return { incidents, saveIncident, deleteIncident, getIncidentById };
};

// Mock data for SAHAS app

export const mockUser = {
  name: 'Priya Sharma',
  initials: 'PS',
  email: 'priya.sharma@gmail.com',
  phone: '+91 98765 43210',
  checkinTimer: 30,
  telegramLinked: true,
};

export const mockContacts = [
  { id: 1, name: 'Mom', relation: 'Mother', phone: '+91 99887 76655', initials: 'M', color: '#FF6B35' },
  { id: 2, name: 'Riya Mehta', relation: 'Best Friend', phone: '+91 88776 65544', initials: 'RM', color: '#00D68F' },
  { id: 3, name: 'Dr. Anita', relation: 'Colleague', phone: '+91 77665 54433', initials: 'DA', color: '#00C4CC' },
];

export const mockIncidents = [
  {
    id: 1,
    time: '22:34',
    date: '2026-04-10',
    type: 'SOS Triggered',
    location: 'Andheri West, Mumbai',
    status: 'resolved',
    evidence: true,
  },
  {
    id: 2,
    time: '19:12',
    date: '2026-04-08',
    type: 'Check-in Missed',
    location: 'Bandra Station, Mumbai',
    status: 'reported',
    evidence: false,
  },
];

export const mockHeatmapZones = [
  { id: 1, x: 25, y: 30, lat: 19.0437, lng: 72.8527, type: 'danger',  label: 'Dharavi',      radius: 60 },
  { id: 2, x: 60, y: 20, lat: 19.0722, lng: 72.9005, type: 'caution', label: 'Kurla Jn.',    radius: 50 },
  { id: 3, x: 75, y: 55, lat: 19.0596, lng: 72.8656, type: 'safe',    label: 'BKC',          radius: 55 },
  { id: 4, x: 40, y: 65, lat: 19.0401, lng: 72.8636, type: 'caution', label: 'Sion',         radius: 45 },
  { id: 5, x: 15, y: 70, lat: 19.0487, lng: 72.9162, type: 'danger',  label: 'Govandi',      radius: 40 },
  { id: 6, x: 85, y: 30, lat: 19.1176, lng: 72.9060, type: 'safe',    label: 'Powai',        radius: 60 },
  { id: 7, x: 50, y: 85, lat: 19.0627, lng: 72.9007, type: 'safe',    label: 'Chembur',      radius: 50 },
  { id: 8, x: 30, y: 50, lat: 19.0178, lng: 72.8478, type: 'caution', label: 'Dharavi Rd',   radius: 35 },
  { id: 9, x: 55, y: 15, lat: 19.0550, lng: 72.8405, type: 'danger',  label: 'Wadala',       radius: 45 },
  { id:10, x: 70, y: 40, lat: 19.1136, lng: 72.8697, type: 'safe',    label: 'Andheri West', radius: 55 },
  { id:11, x: 20, y: 45, lat: 19.0760, lng: 72.8777, type: 'caution', label: 'Saki Naka',    radius: 40 },
  { id:12, x: 45, y: 25, lat: 18.9388, lng: 72.8354, type: 'safe',    label: 'Colaba',       radius: 50 },
  { id:13, x: 35, y: 80, lat: 19.0176, lng: 72.9100, type: 'danger',  label: 'Mankhurd',     radius: 45 },
  { id:14, x: 80, y: 70, lat: 19.1307, lng: 72.9160, type: 'caution', label: 'Ghatkopar',    radius: 50 },
];

export const mockLocationPath = [
  { lat: 19.076, lng: 72.877, time: '21:00', label: 'Home' },
  { lat: 19.079, lng: 72.881, time: '21:05' },
  { lat: 19.082, lng: 72.885, time: '21:10' },
  { lat: 19.085, lng: 72.889, time: '21:15' },
  { lat: 19.089, lng: 72.892, time: '21:20', label: 'Office' },
];

export const mockReports = [
  {
    id: 'RPT-001',
    date: '2026-04-10 22:34',
    type: 'Stalking/Following',
    location: 'Andheri West, Mumbai',
    status: 'Under Review',
    anonymous: true,
  },
];

export const safetyTips = [
  'Share your live location before night travel',
  'Set check-in timers on solo trips',
  'Know your nearest police station',
  'Keep trusted contacts updated',
];

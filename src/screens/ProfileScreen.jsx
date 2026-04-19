import React, { useState } from 'react';
import { Card, Toggle, Divider, Toast } from '../components/UI.jsx';

// Avatar colour palette (cycles by index)
const COLORS = ['#FF6B35', '#00D68F', '#00C4CC', '#FF2D55', '#FFB800', '#7C3AED'];

// Derive display-friendly fields from a raw stored contact
const enrichContact = (c, idx) => ({
  ...c,
  initials: c.name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?',
  color:    COLORS[idx % COLORS.length],
  relation: c.relation || 'Emergency Contact',
});

export default function ProfileScreen({ user, onLogout, updateEmergencyContacts, updateProfile, onOpenAboutMe }) {
  // Seed from real auth data; fall back to empty list (not mock data)
  const [contacts, setContacts] = useState(() =>
    (user?.emergencyContacts ?? []).map(enrichContact)
  );
  
  // Contacts editing state
  const [editing, setEditing] = useState(null); // null | 'new' | contact.id
  const [form, setForm] = useState({ name: '', phone: '' });
  
  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name ?? 'User');

  const [locationSharing,   setLocationSharing]   = useState(true);
  const [saveHistory,       setSaveHistory]       = useState(true);
  const [riskAlerts,        setRiskAlerts]        = useState(true);
  const [sosNotifications,  setSosNotifications]  = useState(true);
  const [toast,             setToast]             = useState(null);
  const [confirmOverlay,    setConfirmOverlay]    = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setForm({ name: '', phone: '' });
    setEditing('new');
  };

  const openEdit = (contact) => {
    setForm({ name: contact.name, phone: contact.phone || '' });
    setEditing(contact.id);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', phone: '' });
  };

  const handleSaveContact = () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    if (!name || !phone) {
      showToast('Both name and phone are required', 'error');
      return;
    }

    const isNew = editing === 'new';
    setConfirmOverlay({
      title: isNew ? 'Add Contact?' : 'Update Contact?',
      message: `Are you sure you want to ${isNew ? 'add' : 'update'} this contact?`,
      onConfirm: () => {
        let updatedList;
        if (isNew) {
          const newC = { id: Date.now().toString(), name, phone: form.phone.trim() };
          updatedList = [...contacts, newC];
          showToast('Contact added', 'success');
        } else {
          updatedList = contacts.map(c => 
            c.id === editing ? { ...c, name, phone: form.phone.trim() } : c
          );
          showToast('Contact updated', 'success');
        }

        updateEmergencyContacts(updatedList);
        setContacts(updatedList.map(enrichContact));
        cancelEdit();
        setConfirmOverlay(null);
      }
    });
  };

  const removeContact = (id) => {
    setConfirmOverlay({
      title: 'Remove Contact?',
      message: 'Are you sure you want to remove this contact?',
      onConfirm: () => {
        const updatedList = contacts.filter((x) => x.id !== id);
        updateEmergencyContacts(updatedList);
        setContacts(updatedList.map(enrichContact));
        showToast('Contact removed', 'info');
        setConfirmOverlay(null);
      }
    });
  };

  // Derive display values from the real logged-in user
  const displayName    = user?.name     ?? 'User';
  const displayEmail   = user?.email    ?? '';
  const displayInitials = user?.initials ?? displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-sahas-dark noise screen-enter pb-28">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Universal confirmation overlay */}
      {confirmOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div
            className="w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-scale-in"
            style={{ background: '#FCE4EC', border: '1px solid #F8BBD0' }}
          >
            <div className="text-center mb-5">
              <h3 className="font-syne font-bold text-lg text-sahas-text">{confirmOverlay.title}</h3>
              <p className="font-dm text-sm text-sahas-soft mt-1">
                {confirmOverlay.message}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOverlay(null)}
                className="flex-1 py-3 rounded-xl font-dm text-sm text-sahas-text border border-sahas-border bg-white transition-colors hover:bg-sahas-card"
              >
                Cancel
              </button>
              <button
                onClick={confirmOverlay.onConfirm}
                className="flex-1 py-3 rounded-xl font-dm font-semibold text-sm text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #FF2D55 0%, #FF6B35 100%)' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-4 pb-6">
        <p className="text-sahas-soft text-xs font-dm tracking-widest uppercase">Account</p>
        <h1 className="font-syne font-800 text-2xl text-sahas-text mt-0.5">
          Profile &amp; Settings <span className="text-sahas-red">.</span>
        </h1>
      </div>

      {/* 1. Account / Profile Info */}
      <div className="px-5 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-syne font-800 text-xl"
                style={{
                  background: 'rgba(255,45,85,0.12)',
                  border: '2px solid rgba(255,45,85,0.3)',
                  color: '#FF2D55',
                }}
              >
                {displayInitials}
              </div>
              {/* Online dot */}
              <span
                className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white"
                style={{ background: '#00D68F' }}
              />
            </div>
            <div className="flex-1">
              {editingProfile ? (
                 <div className="space-y-2">
                   <input
                     type="text"
                     value={profileName}
                     onChange={(e) => setProfileName(e.target.value)}
                     className="w-full bg-sahas-dark border border-sahas-border rounded-lg px-3 py-1.5 text-sm font-dm text-sahas-text outline-none focus:border-sahas-teal/60 transition-colors"
                     autoFocus
                   />
                   <div className="flex gap-2">
                     <button
                       onClick={() => {
                          if (!profileName.trim()) return showToast('Name required', 'error');
                          updateProfile(profileName);
                          setEditingProfile(false);
                          showToast('Profile updated', 'success');
                       }}
                       className="px-3 py-1.5 rounded-lg bg-sahas-teal text-sahas-dark text-xs font-dm font-bold"
                     >
                       Save
                     </button>
                     <button
                       onClick={() => setEditingProfile(false)}
                       className="px-3 py-1.5 rounded-lg border border-sahas-muted text-sahas-soft text-xs font-dm"
                     >
                       Cancel
                     </button>
                   </div>
                 </div>
              ) : (
                <>
                  <h2 className="font-syne font-700 text-lg text-sahas-text">{displayName}</h2>
                  <p className="text-xs font-dm text-sahas-soft">{displayEmail}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className="text-xs font-dm px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,214,143,0.12)', color: '#00D68F' }}
                    >
                      ✓ Verified
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 1.5. About Me Option */}
      <div className="px-5 mb-6">
        <button 
          onClick={onOpenAboutMe}
          className="w-full flex items-center justify-between p-4 bg-sahas-card border border-sahas-border rounded-2xl hover:border-sahas-red/30 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center">
            <div className="text-left">
              <p className="text-sm font-dm text-sahas-text font-semibold">About Me</p>
              <p className="text-[10px] font-dm text-sahas-soft uppercase tracking-wider">Identity & Medical Info</p>
            </div>
          </div>
          <span className="text-sahas-soft group-hover:text-sahas-red transition-colors">
            →
          </span>
        </button>
      </div>

      {/* 2. Trusted Contacts */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-dm text-sahas-soft uppercase tracking-wider">Trusted Contacts</p>
          {editing === null && (
            <button onClick={openAdd} className="text-xs text-sahas-teal font-dm p-2 -m-2 active:scale-95 transition-transform">+ Add</button>
          )}
        </div>

        {/* Inline Add/Edit Form */}
        {editing !== null && (
          <Card className="p-4 mb-4 border border-sahas-teal/40 animate-scale-in">
            <p className="text-xs font-dm text-sahas-teal mb-3 uppercase tracking-wider">
              {editing === 'new' ? '+ New Contact' : '✎ Edit Contact'}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-dm text-sahas-soft mb-1 block">
                  Name <span className="text-sahas-red">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveContact()}
                  placeholder="Contact Name"
                  maxLength={30}
                  autoFocus
                  className="w-full bg-sahas-dark border border-sahas-border rounded-xl px-4 py-2.5 text-sm font-dm text-sahas-text outline-none focus:border-sahas-teal/60 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-dm text-sahas-soft mb-1 block">
                  Phone <span className="text-sahas-red">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveContact()}
                  placeholder="Phone Number"
                  className="w-full bg-sahas-dark border border-sahas-border rounded-xl px-4 py-2.5 text-sm font-dm text-sahas-text outline-none focus:border-sahas-teal/60 transition-colors"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveContact}
                  className="flex-1 py-2.5 rounded-xl bg-sahas-teal text-sahas-dark text-sm font-dm font-bold active:scale-95 transition-all"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 py-2.5 rounded-xl border border-sahas-muted bg-sahas-card text-sahas-soft text-sm font-dm active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-2">
          {contacts.length === 0 && editing === null && (
             <div className="py-6 text-center border border-dashed border-sahas-border rounded-2xl">
               <p className="text-sahas-soft font-dm text-sm mb-1">No contacts added</p>
               <button onClick={openAdd} className="text-xs text-sahas-teal font-dm p-2 -m-2 active:scale-95 transition-transform">Tap here to add</button>
             </div>
          )}
          {contacts.map((c) => (
            <Card key={c.id} className="p-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-syne font-700 text-sm flex-shrink-0"
                  style={{ background: `${c.color}20`, border: `2px solid ${c.color}40`, color: c.color }}
                >
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-dm text-sahas-text truncate">{c.name}</p>
                  <p className="text-xs font-dm text-sahas-soft truncate">{c.phone || 'No phone'}</p>
                </div>
                {editing !== c.id && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => openEdit(c)}
                      className="w-7 h-7 rounded-lg bg-sahas-dark border border-sahas-border flex items-center justify-center text-xs text-sahas-soft hover:text-sahas-teal transition-colors"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => removeContact(c.id)}
                      className="w-7 h-7 rounded-lg bg-sahas-dark border border-sahas-border flex items-center justify-center text-xs text-sahas-soft hover:text-sahas-red transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Privacy Settings */}
      <div className="px-5 mb-6">
        <p className="text-xs font-dm text-sahas-soft mb-3 uppercase tracking-wider">Privacy Settings</p>
        <Card className="p-4 space-y-4">
          <Toggle label="Share Live Location"   enabled={locationSharing} onChange={setLocationSharing} />
          <Divider />
          <Toggle label="Save Incident History" enabled={saveHistory}     onChange={setSaveHistory}     />
        </Card>
      </div>

      {/* 4. Notification Preferences */}
      <div className="px-5 mb-6">
        <p className="text-xs font-dm text-sahas-soft mb-3 uppercase tracking-wider">Notification Preferences</p>
        <Card className="p-4 space-y-4">
          <Toggle label="Nearby Risk Alerts"      enabled={riskAlerts}       onChange={setRiskAlerts}       />
          <Divider />
          <Toggle label="SOS Push Notifications"  enabled={sosNotifications} onChange={setSosNotifications} />
        </Card>
      </div>

      {/* 5. Account Actions */}
      <div className="px-5 mb-5">
        <p className="text-xs font-dm text-sahas-soft mb-3 uppercase tracking-wider">Account Actions</p>
        <div className="space-y-3">
          {!editingProfile && (
            <button
              onClick={() => {
                setProfileName(displayName);
                setEditingProfile(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-left p-4 rounded-xl bg-sahas-card border border-sahas-border text-sahas-text text-sm font-dm flex justify-between items-center transition-colors hover:border-sahas-teal/50"
            >
              <span>Edit Profile</span>
              <span className="text-sahas-soft">✎</span>
            </button>
          )}

          <button
            id="logout-btn"
            onClick={() => setConfirmOverlay({
              title: 'Log out?',
              message: "You'll need to sign in again to access Sahasya.",
              onConfirm: () => {
                setConfirmOverlay(null);
                onLogout();
              }
            })}
            className="w-full py-4 rounded-xl border font-dm text-sm flex justify-center items-center gap-2 transition-colors hover:bg-red-50"
            style={{ borderColor: 'rgba(255,45,85,0.3)', color: '#FF2D55' }}
          >
            <span>Log Out Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

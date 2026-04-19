import React, { useState } from 'react';
import { Card, Divider } from '../components/UI.jsx';

const hashString = (str) => btoa(encodeURIComponent(str)).split('').reverse().join('');

export default function AboutMeScreen({ user, onBack, updatePersonalInfo }) {
  const [view, setView] = useState('display'); // 'display' | 'auth' | 'edit'
  const info = (user?.personalInfo && Object.keys(user.personalInfo).length > 0) ? user.personalInfo : null;

  // Auth State
  const storageKey = `sahas_vault_pw_${user?.id || 'guest'}`;
  const savedHash = localStorage.getItem(storageKey);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Edit State
  const initialFormData = {
    fullName: info?.fullName || user?.name || '',
    maritalStatus: info?.maritalStatus || '',
    partnerName: info?.partnerName || '',
    partnerPhone: info?.partnerPhone || '',
    momName: info?.momName || '',
    momPhone: info?.momPhone || '',
    dadName: info?.dadName || '',
    dadPhone: info?.dadPhone || '',
    occupationType: info?.schoolOffice ? info.schoolOffice.split(' - ')[0] : '',
    schoolOffice: (info?.schoolOffice && info.schoolOffice.includes(' - ')) ? info.schoolOffice.split(' - ')[1] : '',
    emergencyContactName: info?.emergencyContactName || user?.emergencyContacts?.[0]?.name || '',
    emergencyContactPhone: info?.emergencyContactPhone || user?.emergencyContacts?.[0]?.phone || '',
    age: info?.age || '',
    bloodGroup: info?.bloodGroup || '',
    homeAddress: info?.homeAddress || '',
    medicalInfo: info?.medicalInfo || ''
  };

  // Special case for 'None' occupation
  if (info?.schoolOffice === 'None') {
    initialFormData.occupationType = 'None';
    initialFormData.schoolOffice = '';
  }

  const [formData, setFormData] = useState(initialFormData);
  const [editError, setEditError] = useState('');

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const OCCUPATION_TYPES = ['School', 'College', 'Office', 'None'];
  const MARITAL_STATUSES = ['Married', 'Unmarried'];

  const handleStartEdit = () => {
    setView('auth');
  };

  const handleAuth = (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!savedHash) {
      if (password.length < 4) return setAuthError('Password must be at least 4 characters');
      localStorage.setItem(storageKey, hashString(password));
      setView('edit');
    } else {
      if (hashString(password) === savedHash) {
        setView('edit');
      } else {
        setAuthError('Incorrect password.');
      }
    }
    setPassword('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    setEditError('');

    const { fullName, maritalStatus, occupationType, schoolOffice, emergencyContactName, emergencyContactPhone, age, bloodGroup, homeAddress } = formData;

    if (!fullName.trim()) return setEditError('Full name is required.');
    
    // Parents are always mandatory
    if (!formData.momName.trim() || !formData.momPhone.trim()) return setEditError('Mother details are required.');
    if (!formData.dadName.trim() || !formData.dadPhone.trim()) return setEditError('Father details are required.');

    if (!maritalStatus) return setEditError('Marital status is required.');
    if (maritalStatus === 'Married') {
      if (!formData.partnerName.trim() || !formData.partnerPhone.trim()) return setEditError('Partner details are required.');
    }

    if (!occupationType) return setEditError('Please select occupation.');
    if (occupationType !== 'None' && !schoolOffice.trim()) return setEditError('Institution name is required.');
    
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) return setEditError('Emergency contact is required.');
    if (!age || isNaN(age)) return setEditError('Valid age is required.');
    if (!bloodGroup) return setEditError('Blood group is required.');
    if (!homeAddress.trim()) return setEditError('Home address is required.');

    const updatedInfo = {
      ...formData,
      fullName: fullName.trim(),
      schoolOffice: occupationType === 'None' ? 'None' : `${occupationType} - ${schoolOffice.trim()}`,
      age: parseInt(age, 10),
      medicalInfo: formData.medicalInfo.trim()
    };

    updatePersonalInfo(updatedInfo);
    setView('display');
  };

  const inputBase = "w-full rounded-xl px-4 py-3 font-dm text-sm text-sahas-text bg-sahas-dark border border-sahas-border transition-all outline-none focus:border-sahas-red";

  // --- RENDERING ---

  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-sahas-dark flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center animate-scale-in">
          <h2 className="font-syne font-800 text-3xl text-sahas-text mb-2 tracking-tight">
            {!savedHash ? 'Security Setup' : 'Authentication Required'}
          </h2>
          <p className="font-dm text-sm text-sahas-soft mb-8 leading-relaxed px-4">
            {!savedHash 
              ? 'Set a secure password to protect your personal and medical information.' 
              : 'Enter your password to verify your identity and edit your personal details.'}
          </p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password"
              placeholder={!savedHash ? 'Enter a new password' : 'Enter Password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputBase}
              autoFocus
            />
            {authError && <p className="text-xs text-sahas-red font-dm animate-shake">{authError}</p>}
            
            <div className="flex gap-3 pt-6">
              <button 
                type="button"
                onClick={() => setView('display')}
                className="flex-1 py-4 rounded-2xl border border-sahas-border text-sahas-soft font-dm font-bold text-sm hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-[1.5] py-4 rounded-2xl text-white font-syne font-bold text-sm shadow-xl transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #00C4CC 0%, #00D68F 100%)',
                  boxShadow: '0 8px 25px -5px rgba(0, 214, 143, 0.4)'
                }}
              >
                {!savedHash ? 'Set Security Password' : 'Confirm Identity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'edit') {
    return (
      <div className="min-h-screen bg-sahas-dark flex flex-col p-6 overflow-y-auto">
        <div className="max-w-md mx-auto w-full animate-slide-up">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-syne font-bold text-2xl text-sahas-text">Edit Details</h2>
              <p className="font-dm text-sm text-sahas-soft mt-1">Update your information below</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4 font-dm">
              <div>
                <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className={inputBase}
                />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Mother Name</label>
                    <input 
                      type="text" 
                      value={formData.momName}
                      onChange={e => setFormData({...formData, momName: e.target.value})}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Phone</label>
                    <input 
                      type="tel" 
                      value={formData.momPhone}
                      onChange={e => setFormData({...formData, momPhone: e.target.value})}
                      className={inputBase}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Father Name</label>
                    <input 
                      type="text" 
                      value={formData.dadName}
                      onChange={e => setFormData({...formData, dadName: e.target.value})}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Phone</label>
                    <input 
                      type="tel" 
                      value={formData.dadPhone}
                      onChange={e => setFormData({...formData, dadPhone: e.target.value})}
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Marital Status</label>
                <select 
                  value={formData.maritalStatus}
                  onChange={e => setFormData({...formData, maritalStatus: e.target.value})}
                  className={inputBase}
                >
                  <option value="" disabled>Select</option>
                  {MARITAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {formData.maritalStatus === 'Married' && (
                <div className="animate-slide-up grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Partner Name</label>
                    <input 
                      type="text" 
                      value={formData.partnerName}
                      onChange={e => setFormData({...formData, partnerName: e.target.value})}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Phone</label>
                    <input 
                      type="tel" 
                      value={formData.partnerPhone}
                      onChange={e => setFormData({...formData, partnerPhone: e.target.value})}
                      className={inputBase}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Occupation</label>
                  <select 
                    value={formData.occupationType}
                    onChange={e => setFormData({...formData, occupationType: e.target.value})}
                    className={inputBase}
                  >
                    <option value="" disabled>Select</option>
                    {OCCUPATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {formData.occupationType !== 'None' && (
                  <div>
                    <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Institution Name</label>
                    <input 
                      type="text" 
                      value={formData.schoolOffice}
                      onChange={e => setFormData({...formData, schoolOffice: e.target.value})}
                      className={inputBase}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Blood Group</label>
                  <select 
                    value={formData.bloodGroup}
                    onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                    className={inputBase}
                  >
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Address</label>
                <textarea 
                  value={formData.homeAddress}
                  onChange={e => setFormData({...formData, homeAddress: e.target.value})}
                  className={`${inputBase} h-20 resize-none`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Primary Emergency Contact</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} className={inputBase} placeholder="Name" />
                  <input type="tel" value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} className={inputBase} placeholder="Phone" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-sahas-soft uppercase tracking-widest block mb-1.5 ml-1">Medical Info / Allergy (Optional)</label>
                <textarea 
                  value={formData.medicalInfo}
                  onChange={e => setFormData({...formData, medicalInfo: e.target.value})}
                  placeholder="Any allergies or medical conditions?"
                  className={`${inputBase} h-20 resize-none`}
                />
              </div>
            </div>

            {editError && <p className="text-xs text-sahas-red font-dm text-center">{editError}</p>}

            <div className="flex gap-4 pt-4 pb-10">
              <button type="button" onClick={() => setView('display')} className="flex-1 py-4 rounded-xl border border-sahas-border text-sahas-soft font-dm font-bold text-sm">Cancel</button>
              <button type="submit" className="flex-2 py-4 rounded-xl bg-sahas-red text-white font-dm font-bold text-sm shadow-xl shadow-sahas-red/20">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sahas-dark noise flex flex-col pt-6 pb-20">
      <div className="px-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sahas-soft text-xs font-dm tracking-widest uppercase mb-1">Personal Details</p>
          <h1 className="font-syne font-800 text-3xl text-sahas-text">About Me <span className="text-sahas-red">.</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleStartEdit} className="px-4 py-2 rounded-xl bg-sahas-card border border-sahas-border text-xs font-dm font-bold text-sahas-soft hover:text-sahas-red transition-all">Edit</button>
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-sahas-card border border-sahas-border flex items-center justify-center text-sahas-soft hover:text-sahas-red transition-colors">✕</button>
        </div>
      </div>

      <div className="px-5 space-y-6 flex-1 overflow-y-auto pb-10">
        {!info ? (
          <div className="text-center py-20 bg-sahas-card rounded-3xl border border-dashed border-sahas-border">
            <span className="text-4xl mb-4 block">📋</span>
            <p className="text-sahas-soft font-dm text-sm">No profile information found.</p>
          </div>
        ) : (
          <>
            <div className="animate-slide-up">
              <p className="text-[10px] font-syne font-bold text-sahas-red uppercase tracking-widest mb-3 ml-1">Identity & Occupation</p>
              <Card className="p-5 space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs font-dm text-sahas-soft uppercase mb-1">Full Name</span>
                  <span className="text-base font-dm text-sahas-text font-semibold">{info.fullName}</span>
                </div>
                <Divider />
                <div className="flex flex-col">
                  <span className="text-xs font-dm text-sahas-soft uppercase mb-1">Occupation / Institution</span>
                  <span className="text-base font-dm text-sahas-text font-semibold">{info.schoolOffice}</span>
                </div>
              </Card>
            </div>

            <div className="animate-slide-up">
              <p className="text-[10px] font-syne font-bold text-sahas-red uppercase tracking-widest mb-3 ml-1">Family & Emergency</p>
              <Card className="p-5 space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-dm text-sahas-soft uppercase mb-1">Mother</span>
                    <span className="text-base font-dm text-sahas-text font-semibold">{info.momName}</span>
                    <span className="text-sm font-dm text-sahas-soft">{info.momPhone}</span>
                  </div>
                  <Divider />
                  <div className="flex flex-col">
                    <span className="text-xs font-dm text-sahas-soft uppercase mb-1">Father</span>
                    <span className="text-base font-dm text-sahas-text font-semibold">{info.dadName}</span>
                    <span className="text-sm font-dm text-sahas-soft">{info.dadPhone}</span>
                  </div>
                  {info.maritalStatus === 'Married' && (
                    <>
                      <Divider />
                      <div className="flex flex-col">
                        <span className="text-xs font-dm text-sahas-soft uppercase mb-1">Partner</span>
                        <span className="text-base font-dm text-sahas-text font-semibold">{info.partnerName}</span>
                        <span className="text-sm font-dm text-sahas-soft">{info.partnerPhone}</span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>

            <div className="animate-slide-up">
              <p className="text-[10px] font-syne font-bold text-sahas-red uppercase tracking-widest mb-3 ml-1">Medical & Primary Contact</p>
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-dm text-sahas-soft uppercase mb-1">Age</span>
                    <span className="text-base font-dm text-sahas-text font-semibold">{info.age} Yrs</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-dm text-sahas-soft uppercase mb-1">Blood Group</span>
                    <span className="text-xl font-syne font-800 text-sahas-red">{info.bloodGroup}</span>
                  </div>
                </div>
                <Divider />
                <div className="flex flex-col">
                  <span className="text-xs font-dm text-sahas-soft uppercase mb-1">Emergency Contact</span>
                  <span className="text-base font-dm text-sahas-text font-semibold">{info.emergencyContactName}</span>
                  <span className="text-sm font-dm text-sahas-soft">{info.emergencyContactPhone}</span>
                </div>
                {info.medicalInfo && (
                  <>
                    <Divider />
                    <div className="flex flex-col">
                      <span className="text-xs font-dm text-sahas-soft uppercase mb-1">Medical Notes</span>
                      <p className="text-sm font-dm text-sahas-text leading-relaxed">{info.medicalInfo}</p>
                    </div>
                  </>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

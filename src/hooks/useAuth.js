// useAuth.js — localStorage-based auth for Sahasya (no backend)
import { useState, useCallback } from 'react';

const USERS_KEY   = 'sahasya_users';
const SESSION_KEY = 'sahasya_session';

// ── helpers ──────────────────────────────────────────────────────────────────
const readUsers   = ()       => JSON.parse(localStorage.getItem(USERS_KEY)   || '[]');
const writeUsers  = (users)  => localStorage.setItem(USERS_KEY,   JSON.stringify(users));
const readSession = ()       => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
const writeSession = (sess)  => localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
const dropSession  = ()      => localStorage.removeItem(SESSION_KEY);

// Simple non-cryptographic scramble — keeps raw password off localStorage.
// Not secure for sensitive data but appropriate for a local-only demo app.
const obfuscate = (str) =>
  btoa(encodeURIComponent(str))
    .split('')
    .reverse()
    .join('');

// ── hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  // Rehydrate session from localStorage on first render
  const [user, setUser] = useState(() => readSession());

  // ── signup ────────────────────────────────────────────────────────────────
  const signup = useCallback((name, email, password, emergencyContacts = []) => {
    const trimmedEmail = email.trim().toLowerCase();
    const users = readUsers();

    if (users.find((u) => u.email === trimmedEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const initials = name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Normalise contacts — only keep entries with at least a name
    const cleanContacts = emergencyContacts
      .filter((c) => c.name.trim())
      .map((c, i) => ({
        id:    c.id || `${Date.now()}-${i}`,
        name:  c.name.trim(),
        phone: c.phone.trim(),
      }));

    const newUser = {
      id:               Date.now().toString(),
      name:             name.trim(),
      email:            trimmedEmail,
      _p:               obfuscate(password),
      initials,
      emergencyContacts: cleanContacts,
      onboardingCompleted: false,
      personalInfo:      {},
      createdAt:         new Date().toISOString(),
    };

    writeUsers([...users, newUser]);

    const session = {
      id:               newUser.id,
      name:             newUser.name,
      email:            newUser.email,
      initials,
      emergencyContacts: cleanContacts,
      onboardingCompleted: false,
      personalInfo:      {},
    };
    writeSession(session);
    setUser(session);
    return { success: true };
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback((email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const users = readUsers();

    const found = users.find(
      (u) => u.email === trimmedEmail && u._p === obfuscate(password)
    );

    if (!found) {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }

    const session = {
      id:               found.id,
      name:             found.name,
      email:            found.email,
      initials:         found.initials,
      emergencyContacts: found.emergencyContacts || [],
      onboardingCompleted: found.onboardingCompleted || false,
      personalInfo:      found.personalInfo || {},
    };
    writeSession(session);
    setUser(session);
    return { success: true };
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    dropSession();
    setUser(null);
  }, []);

  // ── update features ───────────────────────────────────────────────────────
  const updateEmergencyContacts = useCallback((newContacts) => {
    if (!user) return false;

    // Normalise just like in signup
    const cleanContacts = newContacts
      .filter((c) => c.name && c.name.trim())
      .map((c, i) => ({
        id:    c.id || `${Date.now()}-${i}`,
        name:  c.name.trim(),
        phone: (c.phone || '').trim(),
      }));

    const users = readUsers();
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, emergencyContacts: cleanContacts } : u
    );
    writeUsers(updatedUsers);

    const updatedSession = { ...user, emergencyContacts: cleanContacts };
    writeSession(updatedSession);
    setUser(updatedSession);
    
    return true;
  }, [user]);

  const updateProfile = useCallback((name) => {
    if (!user) return false;
    
    const newName = name.trim();
    if (!newName) return false;
    
    const initials = newName
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const users = readUsers();
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, name: newName, initials } : u
    );
    writeUsers(updatedUsers);

    const updatedSession = { ...user, name: newName, initials };
    writeSession(updatedSession);
    setUser(updatedSession);
    
    return true;
  }, [user]);

  const completeOnboarding = useCallback((personalInfo) => {
    if (!user) return false;

    const users = readUsers();
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, onboardingCompleted: true, personalInfo } : u
    );
    writeUsers(updatedUsers);

    const updatedSession = { ...user, onboardingCompleted: true, personalInfo };
    writeSession(updatedSession);
    setUser(updatedSession);
    
    return true;
  }, [user]);

  const updatePersonalInfo = useCallback((personalInfo) => {
    if (!user) return false;

    const users = readUsers();
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, personalInfo } : u
    );
    writeUsers(updatedUsers);

    const updatedSession = { ...user, personalInfo };
    writeSession(updatedSession);
    setUser(updatedSession);
    
    return true;
  }, [user]);

  return { user, login, signup, logout, updateEmergencyContacts, updateProfile, completeOnboarding, updatePersonalInfo, isLoggedIn: !!user };
}

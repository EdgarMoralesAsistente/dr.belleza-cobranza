import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Workspace Scopes
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.setCustomParameters({
  prompt: 'select_account',
});

// Session & in-memory token storage
let cachedAccessToken: string | null =
  typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('google_access_token') : null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (!cachedAccessToken && typeof sessionStorage !== 'undefined') {
        cachedAccessToken = sessionStorage.getItem('google_access_token');
      }
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might need re-prompt or was cleared on refresh
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('google_access_token');
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso para Google Sheets.');
    }

    cachedAccessToken = credential.accessToken;
    if (typeof sessionStorage !== 'undefined' && cachedAccessToken) {
      sessionStorage.setItem('google_access_token', cachedAccessToken);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!cachedAccessToken && typeof sessionStorage !== 'undefined') {
    cachedAccessToken = sessionStorage.getItem('google_access_token');
  }
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  if (typeof sessionStorage !== 'undefined') {
    if (token) {
      sessionStorage.setItem('google_access_token', token);
    } else {
      sessionStorage.removeItem('google_access_token');
    }
  }
};

export const logOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('google_access_token');
  }
};

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.setCustomParameters({
  prompt: 'consent'
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedGoogleUser: User | null = null;

// Multi-tab Master Token synchronization via BroadcastChannel
const authChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('sim_sekolah_master_google_sync')
  : null;

type AuthListener = (token: string | null, user: User | null) => void;
const authListeners: Set<AuthListener> = new Set();

const notifyListeners = () => {
  authListeners.forEach(listener => {
    try {
      listener(cachedAccessToken, cachedGoogleUser);
    } catch (e) {
      console.warn('Auth listener error:', e);
    }
  });
};

if (authChannel) {
  authChannel.onmessage = (event) => {
    if (event.data?.type === 'SYNC_MASTER_TOKEN' && event.data?.token) {
      cachedAccessToken = event.data.token;
      cachedGoogleUser = event.data.user || cachedGoogleUser;
      notifyListeners();
    } else if (event.data?.type === 'REQUEST_MASTER_TOKEN') {
      if (cachedAccessToken) {
        authChannel.postMessage({
          type: 'SYNC_MASTER_TOKEN',
          token: cachedAccessToken,
          user: cachedGoogleUser ? { email: cachedGoogleUser.email, displayName: cachedGoogleUser.displayName } : null
        });
      }
    } else if (event.data?.type === 'CLEAR_MASTER_TOKEN') {
      cachedAccessToken = null;
      cachedGoogleUser = null;
      notifyListeners();
    }
  };

  // Ask any existing active tab for the active master token
  try {
    authChannel.postMessage({ type: 'REQUEST_MASTER_TOKEN' });
  } catch {
    // Ignore initial post message errors in restricted environments
  }
}

export const subscribeGoogleAuth = (listener: AuthListener) => {
  authListeners.add(listener);
  listener(cachedAccessToken, cachedGoogleUser);
  return () => {
    authListeners.delete(listener);
  };
};

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedGoogleUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        notifyListeners();
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedGoogleUser = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export class GoogleAuthError extends Error {
  code: string;
  isCancelled: boolean;
  isBlocked: boolean;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'GoogleAuthError';
    this.code = code;
    this.isCancelled = code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request';
    this.isBlocked = code === 'auth/popup-blocked';
  }
}

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new GoogleAuthError('Gagal mendapatkan token akses dari Google.', 'auth/no-token');
    }
    cachedAccessToken = credential.accessToken;
    cachedGoogleUser = result.user;

    // Broadcast master token to all tabs and windows
    if (authChannel) {
      authChannel.postMessage({
        type: 'SYNC_MASTER_TOKEN',
        token: cachedAccessToken,
        user: { email: result.user.email, displayName: result.user.displayName }
      });
    }

    notifyListeners();
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    const code = error?.code || 'auth/unknown';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      console.warn('Google Sign In popup ditutup oleh pengguna.');
      throw new GoogleAuthError(
        'Jendela login ditutup sebelum proses selesai. Anda juga dapat menggunakan Metode 2 (Google Apps Script) untuk inisialisasi langsung tanpa login popup.',
        code
      );
    }
    if (code === 'auth/popup-blocked') {
      console.warn('Google Sign In popup diblokir oleh browser.');
      throw new GoogleAuthError(
        'Jendela popup login diblokir oleh browser. Izinkan popup untuk situs ini atau gunakan Metode 2 (Google Apps Script).',
        code
      );
    }
    console.warn('Google Sign In:', error?.message || error);
    throw new GoogleAuthError(error?.message || 'Gagal login dengan akun Google.', code);
  } finally {
    isSigningIn = false;
  }
};

export const getCachedGoogleToken = (): string | null => {
  return cachedAccessToken;
};

export const getCachedGoogleUser = (): User | null => {
  return cachedGoogleUser;
};

export const setCachedGoogleToken = (token: string | null, user?: User | null) => {
  cachedAccessToken = token;
  if (user !== undefined) cachedGoogleUser = user;
  if (authChannel) {
    if (token) {
      authChannel.postMessage({
        type: 'SYNC_MASTER_TOKEN',
        token,
        user: user ? { email: user.email, displayName: user.displayName } : null
      });
    } else {
      authChannel.postMessage({ type: 'CLEAR_MASTER_TOKEN' });
    }
  }
  notifyListeners();
};

export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedGoogleUser = null;
  if (authChannel) {
    authChannel.postMessage({ type: 'CLEAR_MASTER_TOKEN' });
  }
  notifyListeners();
};

// Send HTTP POST to Google Apps Script Web App (Permanent 24/7 Webhook Sync across all accounts & devices)
export const sendWebhookSync = async (webhookUrl: string, payload: any): Promise<{ success: boolean; message: string }> => {
  const cleanUrl = webhookUrl.trim();
  if (!cleanUrl) {
    throw new Error('URL Webhook tidak boleh kosong.');
  }

  // 1. Direct fetch to Google Apps Script Web App
  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({ success: true, message: 'OK' }));
      return {
        success: data.success !== false,
        message: data.message || 'Data berhasil dikirim ke Webhook Google Apps Script.'
      };
    }
  } catch (directErr) {
    console.warn('Direct webhook attempt failed, trying server proxy fallback...', directErr);
  }

  // 2. Server proxy fallback (bypasses browser CORS / strict device restrictions)
  try {
    const isAkademik = cleanUrl.includes('akademik') || (payload.datasets && payload.datasets.USERS) || payload.sheetName === 'USERS';
    const proxyRes = await fetch('/api/sheets-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: isAkademik ? 'akademik' : 'keuangan',
        payload
      })
    });
    if (proxyRes.ok) {
      const pData = await proxyRes.json();
      return {
        success: pData.success,
        message: pData.data?.message || 'Data berhasil dikirim via Server Webhook Sync.'
      };
    }
  } catch (proxyErr) {
    console.warn('Server proxy fallback notice:', proxyErr);
  }

  throw new Error('Gagal menghubungi Webhook Google Apps Script. Pastikan Web App di-deploy dengan opsi "Who has access: Anyone".');
};

// Google Sheets API v4 Client Helpers
export interface SheetMeta {
  sheetId: number;
  title: string;
  rowCount: number;
  columnCount: number;
}

export const fetchSpreadsheetInfo = async (
  spreadsheetId: string,
  accessToken: string
): Promise<{ title: string; sheets: SheetMeta[] }> => {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${res.status}: Gagal membaca spreadsheet.`);
  }

  const data = await res.json();
  const sheets: SheetMeta[] = (data.sheets || []).map((s: any) => ({
    sheetId: s.properties?.sheetId || 0,
    title: s.properties?.title || '',
    rowCount: s.properties?.gridProperties?.rowCount || 0,
    columnCount: s.properties?.gridProperties?.columnCount || 0
  }));

  return {
    title: data.properties?.title || '',
    sheets
  };
};

export const readSheetData = async (
  spreadsheetId: string,
  range: string,
  accessToken: string
): Promise<any[][]> => {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${res.status}: Gagal membaca range ${range}.`);
  }

  const data = await res.json();
  return data.values || [];
};

export const writeSheetData = async (
  spreadsheetId: string,
  range: string,
  values: any[][],
  accessToken: string
): Promise<{ updatedRows: number; updatedColumns: number; updatedCells: number }> => {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${res.status}: Gagal memperbarui range ${range}.`);
  }

  const data = await res.json();
  return {
    updatedRows: data.updatedRows || 0,
    updatedColumns: data.updatedColumns || 0,
    updatedCells: data.updatedCells || 0
  };
};

export const createMissingSheets = async (
  spreadsheetId: string,
  missingTitles: string[],
  accessToken: string
) => {
  if (missingTitles.length === 0) return;

  const requests = missingTitles.map(title => ({
    addSheet: {
      properties: {
        title
      }
    }
  }));

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${res.status}: Gagal membuat tab baru di spreadsheet.`);
  }

  return await res.json();
};

export const clearSheetData = async (
  spreadsheetId: string,
  range: string,
  accessToken: string
) => {
  const encodedRange = encodeURIComponent(range);
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  ).catch(err => console.warn('Clear sheet warning:', err));
};

export const appendSheetData = async (
  spreadsheetId: string,
  range: string,
  values: any[][],
  accessToken: string
): Promise<{ updatedRows: number }> => {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${res.status}: Gagal menambahkan baris.`);
  }

  const data = await res.json();
  return { updatedRows: data.updates?.updatedRows || 0 };
};

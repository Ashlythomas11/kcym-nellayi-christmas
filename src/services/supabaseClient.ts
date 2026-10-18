import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'kcym_supabase_url';
const STORAGE_KEY_ANON = 'kcym_supabase_anon_key';

const fetchDrawSettingsWithoutCache: typeof fetch = (input, init) => {
  const requestUrl = input instanceof Request ? input.url : String(input);
  if (
    !requestUrl.includes('/rest/v1/draw_settings')
    && !requestUrl.includes('/rest/v1/published_draw_settings')
  ) {
    return fetch(input, init);
  }

  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  headers.set('Cache-Control', 'no-cache, no-store, max-age=0');
  headers.set('Pragma', 'no-cache');

  return fetch(input, {
    ...init,
    cache: 'no-store',
    headers,
  });
};

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  // A deployment's environment variables must be consistent for every visitor.
  // Do not let browser-local credentials override (or be mixed with) them.
  if (envUrl || envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  let localUrl = '';
  let localKey = '';
  try {
    localUrl = localStorage.getItem(STORAGE_KEY_URL)?.trim() || '';
    localKey = localStorage.getItem(STORAGE_KEY_ANON)?.trim() || '';
  } catch (error) {
    console.warn('Unable to read saved Supabase settings.', error);
  }

  return {
    url: localUrl,
    anonKey: localKey,
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  try {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_ANON);
  } catch (error) {
    console.error('Unable to save Supabase settings in this browser.', error);
    throw new Error('Supabase settings could not be saved in this browser.');
  }
}

export function isSupabaseConfiguredByEnvironment(): boolean {
  return Boolean(
    (import.meta.env.VITE_SUPABASE_URL || '').trim()
    || (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
  );
}

function isValidSupabaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname));
  } catch {
    return false;
  }
}

function isPlaceholderKey(value: string): boolean {
  return /your-|placeholder|replace[-_ ]?me|\*{3,}/i.test(value);
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return isValidSupabaseUrl(url) && anonKey.length > 20 && !isPlaceholderKey(anonKey);
}

let clientInstance: SupabaseClient | null = null;
let clientCredentials = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!isValidSupabaseUrl(url) || anonKey.length <= 20 || isPlaceholderKey(anonKey)) return null;

  const credentialsKey = `${url}\n${anonKey}`;
  if (!clientInstance || clientCredentials !== credentialsKey) {
    try {
      clientInstance = createClient(url, anonKey, {
        global: {
          fetch: fetchDrawSettingsWithoutCache,
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      clientCredentials = credentialsKey;
    } catch (err) {
      clientInstance = null;
      clientCredentials = '';
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return clientInstance;
}

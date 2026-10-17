import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed.' });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid request.' });
  }

  if (!isRecord(payload)) {
    return jsonResponse(400, { error: 'Invalid request.' });
  }
  const { username, password } = payload;
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password ||
    username.length > 64 ||
    password.length > 1024
  ) {
    return jsonResponse(400, { error: 'Invalid username or password.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Username login Edge Function is missing required Supabase secrets.');
    return jsonResponse(500, { error: 'Administrator sign-in is temporarily unavailable.' });
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: account, error: lookupError } = await serviceClient
    .from('admin_usernames')
    .select('email')
    .eq('username', username.trim().toLowerCase())
    .maybeSingle();

  if (lookupError) {
    console.error('Username lookup failed:', lookupError.message);
    return jsonResponse(500, { error: 'Administrator sign-in is temporarily unavailable.' });
  }
  if (!account) {
    return jsonResponse(401, { error: 'Invalid username or password.' });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error: authError } = await authClient.auth.signInWithPassword({
    email: account.email,
    password,
  });

  if (authError || !data.session || !data.user) {
    return jsonResponse(401, { error: 'Invalid username or password.' });
  }

  const role = data.user.app_metadata?.role;
  if (role !== 'superadmin' && role !== 'organizer') {
    return jsonResponse(403, { error: 'This account is not authorized to access the administrator portal.' });
  }

  return jsonResponse(200, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

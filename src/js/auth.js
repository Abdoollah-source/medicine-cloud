let supabase = null;

async function getClient() {
  if (supabase) return supabase;
  const url = window.MC_SUPABASE_URL;
  const anonKey = window.MC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  if (window.supabase?.createClient) {
    supabase = window.supabase.createClient(url, anonKey);
  } else {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      supabase = createClient(url, anonKey);
    } catch (e) {
      console.error('Failed to load Supabase client:', e);
      return null;
    }
  }
  return supabase;
}

function showAuthError(message) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = message || 'Access not granted. Please sign in with an invited email.';
  el.style.display = 'block';
}

async function checkAllowlist(session) {
  const client = await getClient();
  if (!client || !session?.user?.email) return false;

  const email = session.user.email.toLowerCase();
  try {
    const { data, error } = await client
      .from('allowed_users')
      .select('email')
      .eq('email', email);
    if (error) throw error;
    if (!data || data.length === 0) {
      await client.auth.signOut();
      return false;
    }
    return true;
  } catch (err) {
    console.error('Allowlist check failed:', err);
    try { await client.auth.signOut(); } catch (_) {}
    return false;
  }
}

async function signInWithGoogle() {
  const client = await getClient();
  if (!client) {
    showAuthError('Authentication service is unavailable. Please try again later.');
    return;
  }
  const { error } = await client.auth.signInWithOAuth({ provider: 'google' });
  if (error) {
    console.error('Google sign-in error:', error);
    showAuthError('Sign-in failed. Please try again.');
  }
}

async function signOut() {
  const client = await getClient();
  if (client) {
    await client.auth.signOut();
  }
  window.location.href = 'login.html';
}

async function initAuth() {
  const client = await getClient();
  if (!client) return;

  const { data: { session } } = await client.auth.getSession();
  if (session) {
    const allowed = await checkAllowlist(session);
    if (!allowed) {
      showAuthError('Access not granted. Please sign in with an invited email.');
      return;
    }
    if (window.location.pathname.endsWith('login.html') || window.location.pathname === '/' || window.location.pathname === '') {
      window.location.replace('dashboard.html');
      return;
    }
  }

  client.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      const allowed = await checkAllowlist(session);
      if (allowed) {
        window.location.replace('dashboard.html');
      } else {
        showAuthError('Access not granted. Please sign in with an invited email.');
      }
    }
  });
}

async function requireAuth() {
  // Public share or PDF-render bypass — do not redirect unauthenticated visitors
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('share') || urlParams.has('token')) {
    return null;
  }

  const client = await getClient();
  if (!client) {
    window.location.replace('login.html');
    return null;
  }

  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    window.location.replace('login.html');
    return null;
  }

  const allowed = await checkAllowlist(session);
  if (!allowed) {
    window.location.replace('login.html');
    return null;
  }

  return session;
}

export { getClient, showAuthError, checkAllowlist, signInWithGoogle, signOut, initAuth, requireAuth };

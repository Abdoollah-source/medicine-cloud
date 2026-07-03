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
  console.log('checkAllowlist: Checking session for user:', session?.user?.email);
  const client = await getClient();
  if (!client) {
    console.warn('checkAllowlist: Supabase client is not initialized');
    return false;
  }
  if (!session?.user?.email) {
    console.warn('checkAllowlist: No email found in session');
    return false;
  }

  const email = session.user.email.toLowerCase();
  console.log('checkAllowlist: Querying database for email:', email);
  try {
    const { data, error } = await client
      .from('allowed_users')
      .select('email')
      .eq('email', email);
    
    if (error) {
      console.error('checkAllowlist: Database query error:', error);
      throw error;
    }
    console.log('checkAllowlist: Database returned rows:', data);
    if (!data || data.length === 0) {
      console.warn('checkAllowlist: Email not found in allowed list. Logging out.');
      await client.auth.signOut();
      return false;
    }
    console.log('checkAllowlist: Allowed successfully!');
    return true;
  } catch (err) {
    console.error('checkAllowlist: Catch block caught error:', err);
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
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/pages/login.html',
      queryParams: {
        prompt: 'select_account'
      }
    }
  });
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
  console.log('initAuth: Initializing auth state...');
  const client = await getClient();
  if (!client) {
    console.warn('initAuth: No client available');
    return;
  }

  const { data: { session } } = await client.auth.getSession();
  console.log('initAuth: Current session on load:', session);
  if (session) {
    const allowed = await checkAllowlist(session);
    console.log('initAuth: Allowlist status on load:', allowed);
    if (!allowed) {
      showAuthError('Access not granted. Please sign in with an invited email.');
      return;
    }
    if (window.location.pathname.includes('login') || window.location.pathname === '/' || window.location.pathname === '') {
      console.log('initAuth: User allowed, redirecting to dashboard.html');
      window.location.replace('dashboard.html');
      return;
    }
  }

  client.auth.onAuthStateChange(async (event, session) => {
    console.log('initAuth: onAuthStateChange fired:', event, session);
    if (event === 'SIGNED_IN' && session) {
      const allowed = await checkAllowlist(session);
      console.log('initAuth: onAuthStateChange allowlist status:', allowed);
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

  console.log('requireAuth: Checking auth status...');
  const client = await getClient();
  if (!client) {
    console.warn('requireAuth: No client, redirecting to login.html');
    window.location.replace('login.html');
    return null;
  }

  const { data: { session } } = await client.auth.getSession();
  console.log('requireAuth: Session status:', session);
  if (!session) {
    console.warn('requireAuth: No session, redirecting to login.html');
    window.location.replace('login.html');
    return null;
  }

  const allowed = await checkAllowlist(session);
  console.log('requireAuth: Allowlist status:', allowed);
  if (!allowed) {
    console.warn('requireAuth: User not allowed, redirecting to login.html');
    window.location.replace('login.html');
    return null;
  }

  return session;
}

export { getClient, showAuthError, checkAllowlist, signInWithGoogle, signOut, initAuth, requireAuth };

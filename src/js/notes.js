import { getClient } from './auth.js';

async function createNote(noteJson) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client.from('notes').insert(noteJson).select().single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function getNote(id) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client.from('notes').select('*').eq('id', id).single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function listNotes() {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function listTrash() {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client
      .from('notes')
      .select('*')
      .order('deleted_at', { ascending: false });
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function updateNote(id, patch) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client.from('notes').update(patch).eq('id', id).select().single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function softDeleteNote(id) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client
      .from('notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function restoreNote(id) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client
      .from('notes')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function hardDeleteNote(id) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client.from('notes').delete().eq('id', id).select().single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function revokeSharing(id) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client
      .from('notes')
      .update({ is_public: false, share_token: null })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function enableSharing(id) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const shareToken = crypto.randomUUID();
    const { data, error } = await client
      .from('notes')
      .update({ is_public: true, share_token: shareToken })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function getNoteByShareToken(token) {
  const client = await getClient();
  if (!client) return { data: null, error: new Error('Supabase client not available') };
  try {
    const { data, error } = await client
      .from('notes')
      .select('*')
      .eq('share_token', token)
      .single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

export { createNote, getNote, listNotes, listTrash, updateNote, softDeleteNote, restoreNote, hardDeleteNote, enableSharing, revokeSharing, getNoteByShareToken };

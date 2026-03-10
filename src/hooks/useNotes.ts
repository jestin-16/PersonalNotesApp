import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Note } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async (noteDetails: Partial<Note> = {}) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            title: noteDetails.title || '',
            content: noteDetails.content || '',
            user_id: user.id,
            folder_id: noteDetails.folder_id || null,
            is_pinned: noteDetails.is_pinned || false,
            is_favorite: noteDetails.is_favorite || false,
            is_archived: noteDetails.is_archived || false,
            is_trashed: noteDetails.is_trashed || false,
            tags: noteDetails.tags || [],
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setNotes((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!user) return false;
    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n))
    );

    try {
      const { error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        // Revert on error
        fetchNotes();
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return false;
    // Optimistic deletion from UI (actually we should just move to trash, but let's implement hard delete too if needed)
    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) {
        fetchNotes();
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  };

  const moveToTrash = async (id: string) => {
    return updateNote(id, { is_trashed: true });
  };
  
  const restoreFromTrash = async (id: string) => {
    return updateNote(id, { is_trashed: false });
  };

  return {
    notes,
    loading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    moveToTrash,
    restoreFromTrash
  };
}

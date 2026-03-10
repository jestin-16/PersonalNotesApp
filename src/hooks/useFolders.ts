import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Folder } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = async (name: string, parent_id: string | null = null) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([
          {
            name,
            user_id: user.id,
            parent_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setFolders((prev) => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  };

  const updateFolder = async (id: string, updates: Partial<Folder>) => {
    if (!user) return false;
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));

    try {
      const { error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id);

      if (error) {
        fetchFolders();
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error updating folder:', error);
      return false;
    }
  };

  const deleteFolder = async (id: string) => {
    if (!user) return false;
    setFolders((prev) => prev.filter((f) => f.id !== id));

    try {
      const { error } = await supabase.from('folders').delete().eq('id', id);
      if (error) {
        fetchFolders();
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  };

  return {
    folders,
    loading,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  };
}

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Edit3, LogOut, FileText, Search, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<{ id?: string; title: string; content: string }>({
    title: '',
    content: '',
  });

  const wordCount = currentNote.content.trim() ? currentNote.content.trim().split(/\s+/).length : 0;

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (currentNote.id) {
        const { error } = await supabase
          .from('notes')
          .update({ title: currentNote.title, content: currentNote.content })
          .eq('id', currentNote.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('notes').insert([
          {
            title: currentNote.title,
            content: currentNote.content,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentNote({ title: '', content: '' });
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note');
    }
  };

  const openEditor = (note?: Note) => {
    if (note) {
      setCurrentNote(note);
    } else {
      setCurrentNote({ title: '', content: '' });
    }
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Vault Notes</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center text-[13px] text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                {user?.email}
              </div>
              <button
                onClick={signOut}
                className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          /* --- REFINED EDITOR VIEW --- */
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
              <button onClick={() => setIsEditing(false)} className="hover:text-indigo-600 transition-colors">Notes</button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-zinc-900 font-medium">{currentNote.id ? 'Edit Note' : 'New Note'}</span>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02),0_20px_25px_-5px_rgba(0,0,0,0.03)] overflow-hidden">
              <form onSubmit={handleSaveNote}>
                <div className="p-8 space-y-6">
                  <input
                    type="text"
                    required
                    placeholder="Untitled Note"
                    className="w-full text-4xl font-bold placeholder:text-zinc-200 border-none focus:ring-0 p-0"
                    value={currentNote.title}
                    onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                  />
                  
                  <div className="flex items-center gap-2 pb-4 border-b border-zinc-100">
                    <button type="button" onClick={() => setCurrentNote(p => ({...p, content: p.content + '\n- '}))} className="text-xs font-medium px-3 py-1.5 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors border border-zinc-200">List</button>
                    <button type="button" onClick={() => setCurrentNote(p => ({...p, content: p.content + '\n- [ ] '}))} className="text-xs font-medium px-3 py-1.5 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors border border-zinc-200">Task</button>
                    <div className="h-4 w-[1px] bg-zinc-200 mx-1" />
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">{wordCount} Words</span>
                  </div>

                  <textarea
                    required
                    rows={12}
                    placeholder="Start writing..."
                    className="w-full text-lg leading-relaxed placeholder:text-zinc-300 border-none focus:ring-0 p-0 resize-none"
                    value={currentNote.content}
                    onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                  />
                </div>

                <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* --- REFINED DASHBOARD VIEW --- */
          <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Your Workspace</h2>
                <p className="text-zinc-500 text-sm mt-1">Manage and organize your thoughts.</p>
              </div>
              <button
                onClick={() => openEditor()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                New Entry
              </button>
            </header>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-3xl bg-white/50">
                <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-zinc-300" />
                </div>
                <h3 className="text-lg font-semibold">No notes yet</h3>
                <p className="text-zinc-500 text-sm">Your creative space is waiting for its first entry.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="group relative bg-white border border-zinc-200 rounded-2xl p-6 transition-all duration-300 hover:border-indigo-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(note.created_at), 'MMM d')}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditor(note)} className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-500 hover:text-indigo-600 transition-colors">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 hover:bg-red-50 rounded-md text-zinc-500 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                      {note.title}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="mt-6 pt-4 border-t border-zinc-50 flex justify-end">
                       <button onClick={() => openEditor(note)} className="text-[12px] font-bold text-indigo-600 flex items-center gap-1 hover:gap-2 transition-all">
                        View Note <ChevronRight className="h-3 w-3" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
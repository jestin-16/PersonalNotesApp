import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Trash2,
  Edit3,
  LogOut,
  FileText,
  Search,
  Clock,
  ChevronRight,
  Folder,
  MoreHorizontal,
  User2,
} from 'lucide-react';
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
    <div className="min-h-screen bg-[#f4f5f7] text-zinc-900 font-sans flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 bg-white border-r border-zinc-200 px-6 py-6 gap-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">MINO</span>
        </div>

        <div>
          <button
            onClick={() => openEditor()}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium shadow-sm hover:bg-zinc-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-3 w-3" />
              Add new
            </span>
            <span className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-lime-400" />
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span className="h-2 w-2 rounded-full bg-rose-400" />
            </span>
          </button>
        </div>

        <nav className="space-y-1 text-sm">
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-zinc-900 text-white">
            <FileText className="h-4 w-4" />
            <span>Notes</span>
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-100">
            <Clock className="h-4 w-4" />
            <span>Calendar</span>
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-100">
            <Folder className="h-4 w-4" />
            <span>Archive</span>
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-100">
            <Trash2 className="h-4 w-4" />
            <span>Trash</span>
          </button>
        </nav>

        <div className="mt-auto text-xs text-zinc-500 bg-zinc-50 rounded-xl p-3 border border-zinc-200">
          <p className="font-semibold text-zinc-800 mb-1">Want unlimited notes?</p>
          <p className="mb-3">Upgrade to pro to unlock folders, themes, and more.</p>
          <button className="w-full rounded-lg bg-indigo-600 text-white py-1.5 text-xs font-semibold hover:bg-indigo-700">
            Upgrade pro
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center px-4 sm:px-8 justify-between gap-4">
          <div className="flex items-center gap-3 md:hidden">
            <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight">My Notes</span>
          </div>

          <div className="hidden md:block text-lg font-semibold tracking-tight">MY NOTES</div>

          <div className="flex-1 max-w-xl">
            <div className="flex items-center gap-2 bg-zinc-100 rounded-full px-3 py-1.5 text-xs text-zinc-500">
              <Search className="h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none outline-none flex-1 text-xs placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs text-zinc-500">{user?.email}</span>
            <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs">
              <User2 className="h-4 w-4" />
            </div>
            <button
              onClick={signOut}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto">
          {isEditing ? (
            /* Editor view stays centered, simple */
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Notes
                </button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-zinc-900 font-medium">
                  {currentNote.id ? 'Edit Note' : 'New Note'}
                </span>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                <form onSubmit={handleSaveNote}>
                  <div className="p-8 space-y-6">
                    <input
                      type="text"
                      required
                      placeholder="Untitled Note"
                      className="w-full text-3xl font-semibold placeholder:text-zinc-200 border-none focus:ring-0 p-0"
                      value={currentNote.title}
                      onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                    />

                    <div className="flex items-center gap-2 pb-4 border-b border-zinc-100">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentNote((p) => ({ ...p, content: p.content + '\n- ' }))
                        }
                        className="text-xs font-medium px-3 py-1.5 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors border border-zinc-200"
                      >
                        List
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentNote((p) => ({ ...p, content: p.content + '\n- [ ] ' }))
                        }
                        className="text-xs font-medium px-3 py-1.5 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors border border-zinc-200"
                      >
                        Task
                      </button>
                      <div className="h-4 w-px bg-zinc-200 mx-1" />
                      <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                        {wordCount} Words
                      </span>
                    </div>

                    <textarea
                      required
                      rows={12}
                      placeholder="Start writing..."
                      className="w-full text-sm leading-relaxed placeholder:text-zinc-300 border-none focus:ring-0 p-0 resize-none"
                      value={currentNote.content}
                      onChange={(e) =>
                        setCurrentNote({ ...currentNote, content: e.target.value })
                      }
                    />
                  </div>

                  <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Recent Folders section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Recent Folders</h2>
                  </div>
                  <div className="flex gap-4 text-xs text-zinc-500">
                    <button className="border-b-2 border-zinc-900 pb-1 text-zinc-900 font-medium">
                      Todays
                    </button>
                    <button className="pb-1 hover:text-zinc-900">This Week</button>
                    <button className="pb-1 hover:text-zinc-900">This Month</button>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-32 rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {notes.slice(0, 3).map((note, idx) => {
                      const colors = [
                        'bg-sky-100 text-sky-900',
                        'bg-rose-100 text-rose-900',
                        'bg-amber-100 text-amber-900',
                      ];
                      const color = colors[idx % colors.length];
                      return (
                        <div
                          key={note.id}
                          className={`rounded-2xl ${color} p-4 flex flex-col justify-between shadow-sm`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="h-8 w-8 rounded-xl bg-white/70 flex items-center justify-center">
                              <Folder className="h-4 w-4" />
                            </div>
                            <button className="text-zinc-500/70 hover:text-zinc-700">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                          <div>
                            <div className="text-sm font-semibold line-clamp-1">{note.title}</div>
                            <div className="text-[11px] mt-1 opacity-80">
                              {format(new Date(note.created_at), 'dd/MM/yyyy')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button className="rounded-2xl border border-dashed border-zinc-300 text-zinc-400 text-xs flex items-center justify-center">
                      New folder
                    </button>
                  </div>
                )}
              </section>

              {/* My Notes section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">My Notes</h2>
                  <div className="flex gap-4 text-xs text-zinc-500">
                    <button className="border-b-2 border-zinc-900 pb-1 text-zinc-900 font-medium">
                      Todays
                    </button>
                    <button className="pb-1 hover:text-zinc-900">This Week</button>
                    <button className="pb-1 hover:text-zinc-900">This Month</button>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-40 rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200"
                      />
                    ))}
                  </div>
                ) : notes.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-3xl bg-white">
                    <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-zinc-300" />
                    </div>
                    <h3 className="text-lg font-semibold">No notes yet</h3>
                    <p className="text-zinc-500 text-sm mt-1">
                      Your creative space is waiting for its first entry.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {notes.map((note, idx) => {
                      const colors = [
                        'bg-lime-100 text-lime-900',
                        'bg-rose-100 text-rose-900',
                        'bg-sky-100 text-sky-900',
                      ];
                      const color = colors[idx % colors.length];
                      return (
                        <div
                          key={note.id}
                          className={`rounded-2xl ${color} p-4 flex flex-col justify-between shadow-sm`}
                        >
                          <div className="flex justify-between items-start mb-3 text-[11px]">
                            <span>{format(new Date(note.created_at), 'dd/MM/yyyy')}</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold mb-2 line-clamp-1">
                              {note.title || 'Untitled'}
                            </div>
                            <p className="text-[11px] leading-relaxed line-clamp-3 opacity-80 whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-[11px]">
                            <button
                              onClick={() => openEditor(note)}
                              className="underline underline-offset-2"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-rose-700 hover:underline underline-offset-2"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => openEditor()}
                      className="rounded-2xl border border-dashed border-zinc-300 text-zinc-400 text-xs flex items-center justify-center"
                    >
                      New Note
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
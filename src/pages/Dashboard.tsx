import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Edit2, LogOut, FileText } from 'lucide-react';
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

  const wordCount = currentNote.content.trim()
    ? currentNote.content.trim().split(/\s+/).length
    : 0;

  const charCount = currentNote.content.length;

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
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({ title: currentNote.title, content: currentNote.content })
          .eq('id', currentNote.id);

        if (error) throw error;
      } else {
        // Create new note
        const { error } = await supabase
          .from('notes')
          .insert([
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur border-b border-zinc-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-indigo-600 mr-2" />
              <h1 className="text-xl font-bold text-zinc-900">Personal Notes</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-zinc-500 mr-4 hidden sm:block">{user?.email}</span>
              <button
                onClick={signOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-zinc-500 hover:text-zinc-700 focus:outline-none transition"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
        {isEditing ? (
          <div className="bg-white/90 shadow-xl rounded-2xl border border-zinc-200/80 p-6 sm:p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-2 text-zinc-900">
              {currentNote.id ? 'Edit Note' : 'Create New Note'}
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              Capture your thoughts, ideas, and todos in a clean, focused editor.
            </p>
            <form onSubmit={handleSaveNote} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-xs font-semibold tracking-wide text-zinc-600 uppercase">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  placeholder="e.g. Daily planning, Project ideas, Books to read..."
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white/80 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none sm:text-sm px-4 py-2.5"
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="block text-xs font-semibold tracking-wide text-zinc-600 uppercase">
                  Content
                </label>

                <div className="mt-2 mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                  <span className="font-medium mr-2">Quick insert:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentNote((prev) => ({
                        ...prev,
                        content: (prev.content ? prev.content + '\n' : '') + '- ',
                      }))
                    }
                    className="px-2.5 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 shadow-sm"
                  >
                    Bulleted list
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentNote((prev) => ({
                        ...prev,
                        content: (prev.content ? prev.content + '\n' : '') + '1. ',
                      }))
                    }
                    className="px-2.5 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 shadow-sm"
                  >
                    Numbered list
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentNote((prev) => ({
                        ...prev,
                        content: (prev.content ? prev.content + '\n' : '') + '- [ ] ',
                      }))
                    }
                    className="px-2.5 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 shadow-sm"
                  >
                    Checklist
                  </button>
                </div>

                <textarea
                  id="content"
                  required
                  rows={8}
                  placeholder="- Capture key points&#10;- Break work into tasks&#10;- Add checklists with the toolbar above"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white/80 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none sm:text-sm px-4 py-3 font-mono text-sm"
                  value={currentNote.content}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                />
                <div className="mt-1 flex justify-between text-xs text-zinc-500">
                  <span>{wordCount} words</span>
                  <span>{charCount} characters</span>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-zinc-200 shadow-sm text-sm font-medium rounded-full text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Your Notes</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {notes.length === 0 ? 'You have no notes yet. Start by creating one.' : `You have ${notes.length} note${notes.length === 1 ? '' : 's'} saved.`}
                </p>
              </div>
              <button
                onClick={() => openEditor()}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-14 bg-white/90 rounded-2xl border border-zinc-200/80 border-dashed shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                  <FileText className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-zinc-900">No notes yet</h3>
                <p className="mt-1 text-sm text-zinc-500">Get started by creating a new note.</p>
                <div className="mt-6">
                  <button
                    onClick={() => openEditor()}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white/90 overflow-hidden shadow-sm rounded-2xl border border-zinc-200/80 hover:shadow-lg hover:-translate-y-0.5 transition duration-200 flex flex-col group"
                  >
                    <div className="p-5 flex-1">
                      <h3 className="text-base font-semibold text-zinc-900 line-clamp-1 mb-1.5 group-hover:text-indigo-600">
                        {note.title}
                      </h3>
                      <p className="text-sm text-zinc-600 line-clamp-4 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                    <div className="bg-zinc-50 px-5 py-3 border-t border-zinc-100 flex justify-between items-center">
                      <span className="text-xs text-zinc-500">
                        {format(new Date(note.created_at), 'MMM d, yyyy')}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditor(note)}
                          className="p-1 text-zinc-400 hover:text-indigo-600 transition"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-zinc-400 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

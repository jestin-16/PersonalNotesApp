import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Plus,
  Trash2,
  LogOut,
  FileText,
  Search,
  Clock,
  ChevronRight,
  Folder,
  MoreHorizontal,
  User2,
  Calendar,
  Layers,
  Settings,
  Bell,
  Menu,
} from "lucide-react";
import { format } from "date-fns";

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
  const [currentNote, setCurrentNote] = useState<{
    id?: string;
    title: string;
    content: string;
  }>({
    title: "",
    content: "",
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const wordCount = currentNote.content.trim()
    ? currentNote.content.trim().split(/\s+/).length
    : 0;

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
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
          .from("notes")
          .update({ title: currentNote.title, content: currentNote.content })
          .eq("id", currentNote.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("notes").insert([
          {
            title: currentNote.title || "Untitled",
            content: currentNote.content,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentNote({ title: "", content: "" });
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Error saving note");
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Error deleting note");
    }
  };

  const openEditor = (note?: Note) => {
    if (note) {
      setCurrentNote(note);
    } else {
      setCurrentNote({ title: "", content: "" });
    }
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800 font-sans flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 px-6 py-6 flex flex-col gap-8 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Minote
          </span>
        </div>

        <div>
          <button
            onClick={() => {
              openEditor();
              setSidebarOpen(false);
            }}
            className="group flex flex-col items-center justify-center w-full py-4 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Plus className="h-6 w-6 mb-1 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-sm font-semibold tracking-wide">
              Create Note
            </span>
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Menu
          </div>
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-medium transition-colors">
            <Layers className="h-5 w-5" />
            <span>All Notes</span>
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
            <Calendar className="h-5 w-5" />
            <span>Calendar</span>
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
            <Folder className="h-5 w-5" />
            <span>Projects</span>
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
            <Trash2 className="h-5 w-5" />
            <span>Trash</span>
          </button>
        </nav>

        <div className="mt-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
            <p className="relative font-bold mt-1">Upgrade to Pro</p>
            <p className="relative text-xs text-slate-300 mb-4 mt-1 leading-relaxed">
              Get unlimited folders, advanced themes, and team sharing.
            </p>
            <button className="relative w-full rounded-xl bg-white text-slate-900 py-2 text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors">
              Upgrade Now
            </button>
          </div>

          <div className="flex items-center gap-3 mt-6 px-2">
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <User2 className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-700">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content grid */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 sm:px-8 justify-between gap-4 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 md:hidden hover:bg-slate-100 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="text-2xl font-bold tracking-tight text-slate-800">
              {isEditing ? "Editor" : "Dashboard"}
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden sm:flex justify-end">
            <div className="flex items-center gap-2 bg-slate-100/80 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-full px-4 py-2 text-sm text-slate-500 transition-all w-64 focus-within:w-full focus-within:bg-white focus-within:border-indigo-300 focus-within:shadow-sm focus-within:ring-2 focus-within:ring-indigo-100">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes..."
                className="bg-transparent border-none outline-none flex-1 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-white box-content"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto custom-scrollbar relative">
          {isEditing ? (
            /* Premium Editor view */
            <div className="max-w-4xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 hover:text-indigo-600 transition-colors font-medium bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 hover:border-indigo-200"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Back to Notes
                </button>
                <ChevronRight className="h-4 w-4 text-slate-300 mx-1" />
                <span className="text-slate-600 font-semibold bg-white/50 px-3 py-1.5 rounded-full border border-transparent">
                  {currentNote.id ? "Edit Note" : "Drafting New Note"}
                </span>
                <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                  {wordCount} W
                </span>
              </div>

              <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <form onSubmit={handleSaveNote} className="flex-1 flex flex-col">
                  <div className="px-8 sm:px-12 pt-10 pb-6 flex-1 flex flex-col">
                    <input
                      type="text"
                      placeholder="Give it a brilliant title..."
                      className="w-full text-4xl sm:text-5xl font-bold tracking-tight text-slate-800 placeholder:text-slate-200 border-none focus:ring-0 p-0 bg-transparent transition-all hover:placeholder:text-slate-300 focus:placeholder:text-transparent"
                      value={currentNote.title}
                      onChange={(e) =>
                        setCurrentNote({ ...currentNote, title: e.target.value })
                      }
                    />

                    <div className="flex items-center gap-3 mt-6 pb-6 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentNote((p) => ({
                            ...p,
                            content: p.content + "\n• ",
                          }))
                        }
                        className="text-sm font-semibold px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 text-slate-600 transition-all border border-slate-200"
                      >
                        Bullet List
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentNote((p) => ({
                            ...p,
                            content: p.content + "\n[ ] ",
                          }))
                        }
                        className="text-sm font-semibold px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 text-slate-600 transition-all border border-slate-200"
                      >
                        Checklist
                      </button>
                    </div>

                    <div className="flex-1 mt-6">
                      <textarea
                        required
                        placeholder="Start typing your masterpiece..."
                        className="w-full h-full min-h-[400px] text-lg leading-relaxed placeholder:text-slate-300 border-none focus:ring-0 p-0 resize-none text-slate-600 bg-transparent custom-scrollbar"
                        value={currentNote.content}
                        onChange={(e) =>
                          setCurrentNote({
                            ...currentNote,
                            content: e.target.value,
                          })
                        }
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="px-8 sm:px-12 py-5 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 flex justify-between items-center z-10">
                    <p className="text-xs text-slate-400 font-medium hidden sm:block">
                      Last edited just now
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 sm:flex-none px-6 py-2.5 font-bold text-slate-500 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 sm:flex-none px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in duration-500">
              {/* Dynamic Folders Gallery */}
              <section>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Collections
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Your recent project spaces
                    </p>
                  </div>
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    See all <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-36 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {notes.slice(0, 3).map((note, idx) => {
                      const styles = [
                        "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 text-blue-900 group-hover:border-blue-300",
                        "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100 text-rose-900 group-hover:border-rose-300",
                        "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 text-amber-900 group-hover:border-amber-300",
                      ];
                      const iconStyles = [
                        "bg-blue-100/50 text-blue-600",
                        "bg-rose-100/50 text-rose-600",
                        "bg-amber-100/50 text-amber-600",
                      ];
                      const style = styles[idx % styles.length];
                      const iconStyle = iconStyles[idx % iconStyles.length];

                      return (
                        <div
                          key={`folder-${note.id}`}
                          className={`group cursor-pointer rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 ${style}`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div
                              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${iconStyle}`}
                            >
                              <Folder className="h-5 w-5" />
                            </div>
                            <button className="text-slate-400 hover:text-slate-800 p-1 bg-white/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                          <div>
                            <div className="text-base font-bold line-clamp-1 mb-1">
                              {note.title || "Untitled Project"}
                            </div>
                            <div className="text-xs font-medium opacity-70">
                              Updated{" "}
                              {format(new Date(note.created_at), "MMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-400 hover:text-indigo-600 transition-all flex flex-col items-center justify-center p-5 gap-2 h-[140px] group">
                      <div className="h-10 w-10 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                        <Plus className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-sm">New Folder</span>
                    </button>
                  </div>
                )}
              </section>

              {/* Masonry-style Notes Grid */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Recent Notes
                    </h2>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button className="px-4 py-1.5 bg-white text-slate-800 text-sm font-bold rounded-lg shadow-sm">
                      Grid
                    </button>
                    <button className="px-4 py-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold rounded-lg transition-colors">
                      List
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-48 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
                      />
                    ))}
                  </div>
                ) : notes.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <FileText className="h-10 w-10 text-indigo-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      No notes yet
                    </h3>
                    <p className="text-slate-500 mb-6 text-center max-w-sm">
                      Your creative space is waiting for its first entry. Capture
                      your thoughts, ideas, and tasks right here.
                    </p>
                    <button
                      onClick={() => openEditor()}
                      className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Start Writing
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="group bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-200 transition-all"
                      >
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {format(new Date(note.created_at), "MMM d, yyyy")}
                          </p>
                          <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {note.title || "Untitled"}
                          </h3>
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditor(note)}
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Edit Note
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
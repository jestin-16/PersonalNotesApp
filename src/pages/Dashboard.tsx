import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Plus,
  Trash2,
  LogOut,
  Search,
  ChevronRight,
  Folder,
  MoreHorizontal,
  User2,
  Calendar,
  Menu,
} from "lucide-react";
import { format, startOfWeek, startOfDay, startOfMonth } from "date-fns";

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

  // Tab state
  const [folderTab, setFolderTab] = useState("This Week");
  const [noteTab, setNoteTab] = useState("Todays");

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

  const handleDeleteNote = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
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
    <div className="min-h-screen bg-[#FDFEFE] text-[#111] font-sans flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar  */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[280px] bg-[#F7F9FB] px-8 py-10 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-8 rounded-full bg-[#1A3B8B] flex items-center justify-center">
            <div className="h-4 w-4 bg-[#7D9DE5] rounded-tl-full rounded-br-full mix-blend-screen opacity-80"></div>
          </div>
          <span className="text-[20px] font-bold tracking-[0.15em] text-[#0A1A44]">
            MINO
          </span>
        </div>

        <div className="mb-12">
          <button
            onClick={() => {
              openEditor();
              setSidebarOpen(false);
            }}
            className="flex items-center gap-4 w-full text-slate-800 font-bold text-[14px] transition-all text-left mb-6 hover:text-black hover:scale-[1.02] transform origin-left"
          >
            <div className="bg-[#111] text-white p-1 rounded-md flex justify-center items-center shadow-md">
              <Plus className="h-[14px] w-[14px]" />
            </div>
            Add new
          </button>

          <div className="flex flex-col gap-[10px] ml-2 mt-2">
            <span className="h-[9px] w-[9px] rounded-full bg-[#F5E271] shadow-sm" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#65B7EE] shadow-sm" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#E5484D] shadow-sm" />
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="flex items-center gap-4 w-full px-2 py-2 text-[#A0A4AB] hover:text-[#111] font-semibold transition-colors rounded-lg hover:bg-black/5">
            <Calendar className="h-5 w-5 stroke-[1.5]" />
            <span className="text-[14px]">Calander</span>
          </button>
          <button className="flex items-center gap-4 w-full px-2 py-2 text-[#A0A4AB] hover:text-[#111] font-semibold transition-colors rounded-lg hover:bg-black/5">
            <Folder className="h-5 w-5 stroke-[1.5]" />
            <span className="text-[14px]">Archive</span>
          </button>
          <button className="flex items-center gap-4 w-full px-2 py-2 text-[#A0A4AB] hover:text-[#111] font-semibold transition-colors rounded-lg hover:bg-black/5">
            <Trash2 className="h-5 w-5 stroke-[1.5]" />
            <span className="text-[14px]">Trash</span>
          </button>
        </nav>

        <div className="mt-auto items-center flex flex-col relative w-full pt-8">
          <p className="text-[#A0A4AB] text-[10px] leading-[1.6] text-center mb-6 px-2 font-semibold">
            Want to access unlimited<br />notes taking experience<br />& lot's of feature?
          </p>
          <div className="h-28 w-28 bg-transparent flex items-end justify-center mb-6 relative hover:scale-105 transition-transform cursor-pointer">
            {/* Decorative Graphic representation */}
            <div className="absolute inset-x-2 bottom-0 h-[45%] bg-[#F5E271] rounded-t-xl z-0 border-2 border-dashed border-[#E5D261] opacity-30"></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <User2 className="h-14 w-14 text-[#2D3F75]" />
            </div>
          </div>
          <button className="w-full rounded-lg bg-[#2D3F75] text-white py-3 text-[13px] font-bold shadow-lg shadow-[#2D3F75]/30 hover:bg-[#1f2b53] hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-[#2D3F75]/20">
            Upgrade pro
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F0F2F5] shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] pt-4 pr-4 pb-4">

        {/* Inner Content Wrapper */}
        <div className="bg-[#FAFBFD] w-full h-full rounded-[40px] shadow-sm border border-white flex flex-col overflow-hidden relative">

          {/* Top Header */}
          <header className="h-[100px] flex items-center px-12 justify-between shrink-0 bg-transparent">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-500 md:hidden hover:bg-slate-200 rounded-lg"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="text-[32px] font-extrabold tracking-tight text-[#111]">
                MY NOTES
              </div>
            </div>

            <div className="flex-1 max-w-[450px] hidden lg:flex mx-8">
              <div className="flex items-center gap-3 bg-[#F4F6F9] rounded-xl px-5 py-3 w-full border border-transparent focus-within:bg-white focus-within:border-[#E1E5ED] focus-within:shadow-sm transition-all duration-300">
                <Search className="h-5 w-5 text-[#A0A4AB]" />
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent border-none outline-none flex-1 placeholder:text-[#A0A4AB] text-[15px] font-medium text-[#111]"
                />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <span className="text-[13px] font-bold text-[#111] hidden sm:block">Sayef mahmud</span>
              <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-md overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-[#A0A4AB] transition-all">
                {user?.email ? (
                  <div className="w-full h-full bg-[#111] text-white flex items-center justify-center font-bold text-sm">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <img src="https://ui-avatars.com/api/?name=Sayef+Mahmud&background=0D8ABC&color=fff&bold=true" alt="Sayef mahmud" className="w-full h-full object-cover" />
                )}
              </div>
              <button className="text-[#111] hover:bg-black/5 p-2 rounded-lg transition-colors hidden sm:block">
                <Menu className="h-6 w-6 stroke-[2]" />
              </button>
              <button
                onClick={signOut}
                className="text-[#A0A4AB] hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors ml-1"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5 stroke-[2]" />
              </button>
            </div>
          </header>

          <main className="flex-1 px-12 pb-12 overflow-y-auto custom-scrollbar relative z-0">
            {isEditing ? (
              /* Editor view matching minimal approach */
              <div className="max-w-4xl h-full flex flex-col pt-4">
                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1 hover:text-slate-800 text-slate-500 transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Back
                  </button>
                </div>

                <div className="flex-1 bg-white rounded-[32px] p-10 flex flex-col shadow-sm border border-[#eaedf1]">
                  <form onSubmit={handleSaveNote} className="flex-1 flex flex-col">
                    <input
                      type="text"
                      placeholder="Title..."
                      className="w-full text-5xl font-bold tracking-tight text-slate-800 placeholder:text-slate-200 border-none focus:ring-0 p-0 bg-transparent mb-8"
                      value={currentNote.title}
                      onChange={(e) =>
                        setCurrentNote({ ...currentNote, title: e.target.value })
                      }
                    />
                    <div className="flex-1">
                      <textarea
                        required
                        placeholder="Contents..."
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
                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-[#111] text-white font-bold rounded-xl hover:bg-black transition-all"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="max-w-[1400px] flex flex-col gap-[50px]">

                {/* Recent Folders */}
                <section>
                  <div className="mb-6">
                    <h2 className="text-[22px] font-bold text-[#111] mb-5 tracking-tight">
                      Recent Folders
                    </h2>
                    <div className="flex gap-10 text-[13px] font-bold text-[#B0B3BC]">
                      <button
                        onClick={() => setFolderTab('Todays')}
                        className={`pb-2 ${folderTab === 'Todays' ? 'text-[#111] border-b-[2px] border-[#111]' : 'hover:text-[#111] transition-colors'}`}
                      >Todays</button>
                      <button
                        onClick={() => setFolderTab('This Week')}
                        className={`pb-2 ${folderTab === 'This Week' ? 'text-[#111] border-b-[2px] border-[#111]' : 'hover:text-[#111] transition-colors'}`}
                      >This Week</button>
                      <button
                        onClick={() => setFolderTab('This Month')}
                        className={`pb-2 ${folderTab === 'This Month' ? 'text-[#111] border-b-[2px] border-[#111]' : 'hover:text-[#111] transition-colors'}`}
                      >This Month</button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-[180px] min-w-[260px] rounded-[28px] bg-slate-200 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-6 overflow-x-auto pb-6 pt-2 -mt-2 -ml-2 pl-2 custom-scrollbar">
                      {/* Visual cards mapping specific to layout structure */}
                      {notes.slice(0, 3).map((note, idx) => {
                        const styleSets = [
                          { bg: "bg-[#DDEBFF]", iconBg: "bg-[#7198FE]", text: "text-[#111]" }, // Light Blue
                          { bg: "bg-[#FBD6D6]", iconBg: "bg-[#C4806A]", text: "text-[#111]" }, // Light Pink
                          { bg: "bg-[#FEF8DD]", iconBg: "bg-[#C6CD55]", text: "text-[#111]" }, // Light Yellow
                        ];

                        const theme = styleSets[idx % styleSets.length];

                        return (
                          <div
                            key={`folder-${note.id}`}
                            className={`min-w-[260px] h-[190px] rounded-[28px] p-7 flex flex-col justify-between cursor-pointer hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 ${theme.bg} ${theme.text}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className={`h-[52px] w-[52px] shrink-0 rounded-2xl flex items-center justify-center ${theme.iconBg} -ml-1 -mt-1 shadow-sm`}>
                                {/* Solid page icon approximation */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" />
                                </svg>
                              </div>
                              <button className="text-[#111]/40 hover:text-[#111] transition-colors p-1">
                                <MoreHorizontal className="h-6 w-6" strokeWidth={3} />
                              </button>
                            </div>
                            <div>
                              <div className="text-[18px] font-bold line-clamp-1 mb-1.5 tracking-tight">
                                {note.title || "Untitled Folder"}
                              </div>
                              <div className="text-[11px] font-bold opacity-40 uppercase tracking-wider">
                                {format(new Date(note.created_at), "dd/MM/yyyy")}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <button className="min-w-[160px] h-[190px] rounded-[28px] border-[2px] border-dashed border-[#D1D5DC] hover:border-[#111] hover:bg-black/5 transition-all flex flex-col items-center justify-center gap-4 group">
                        <div className="bg-[#111] h-12 w-12 rounded-[18px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                          <Folder className="h-6 w-6 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-[13px] text-[#111]">New folder</span>
                      </button>
                    </div>
                  )}
                </section>

                {/* My Notes Section */}
                <section>
                  <div className="mb-6 flex flex-col">
                    <h2 className="text-[22px] font-bold text-[#111] mb-5 tracking-tight">
                      My Notes
                    </h2>
                    <div className="flex justify-between items-end w-full">
                      <div className="flex gap-10 text-[13px] font-bold text-[#B0B3BC]">
                        <button
                          onClick={() => setNoteTab('Todays')}
                          className={`pb-2 ${noteTab === 'Todays' ? 'text-[#111] border-b-[2px] border-[#111]' : 'hover:text-[#111] transition-colors'}`}
                        >Todays</button>
                        <button
                          onClick={() => setNoteTab('This Week')}
                          className={`pb-2 ${noteTab === 'This Week' ? 'text-[#111] border-b-[2px] border-[#111]' : 'hover:text-[#111] transition-colors'}`}
                        >This Week</button>
                        <button
                          onClick={() => setNoteTab('This Month')}
                          className={`pb-2 ${noteTab === 'This Month' ? 'text-[#111] border-b-[2px] border-[#111]' : 'hover:text-[#111] transition-colors'}`}
                        >This Month</button>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-[#B0B3BC] pb-2">
                        <ChevronRight className="h-3 w-3 rotate-180 cursor-pointer hover:text-[#111] transition-colors stroke-[3]" />
                        <span>December 2021</span>
                        <ChevronRight className="h-3 w-3 cursor-pointer hover:text-[#111] transition-colors stroke-[3]" />
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-[360px] rounded-[28px] bg-slate-200 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-10">
                      {notes.map((note, idx) => {
                        const cardThemes = [
                          { bg: "bg-[#DFE572]", text: "text-[#3F4420]" }, // Yellow
                          { bg: "bg-[#EDA7A9]", text: "text-[#592D30]" }, // Pinkish Red
                          { bg: "bg-[#7DB9E0]", text: "text-[#243F57]" }, // Blue
                        ];
                        const theme = cardThemes[idx % cardThemes.length];

                        return (
                          <div
                            key={note.id}
                            className={`group rounded-[28px] p-8 flex flex-col h-[360px] cursor-pointer hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-1.5 transition-all duration-300 relative ${theme.bg} ${theme.text}`}
                          >
                            <div className="text-[10px] font-black opacity-60 mb-5 uppercase tracking-widest">
                              {format(new Date(note.created_at), "dd/MM/yyyy")}
                            </div>
                            <div className="flex justify-between items-start mb-6">
                              <h3 className="text-[24px] font-bold leading-[1.2] line-clamp-2 pr-6 tracking-tight">
                                {note.title || "Untitled"}
                              </h3>
                              <button
                                onClick={(e) => { e.stopPropagation(); openEditor(note); }}
                                className="h-8 w-8 rounded-[10px] bg-[#111] text-white flex items-center justify-center shrink-0 hover:scale-110 transition-transform shadow-md"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M15.232 5.232L18.768 8.768M16.732 3.732C17.1226 3.34142 17.6523 3.122 18.2045 3.122C18.7567 3.122 19.2864 3.34142 19.677 3.732C20.0676 4.12258 20.287 4.65228 20.287 5.2045C20.287 5.75671 20.0676 6.28641 19.677 6.677L6.5 19.853L2 22L4.147 17.5L17.276 4.372Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-[14px] font-medium leading-[1.6] line-clamp-5 opacity-80 whitespace-pre-wrap flex-1 w-[90%]">
                              {note.content}
                            </p>
                            <div className="mt-6 pt-5 flex items-center justify-between text-[11px] font-bold">
                              <div className="flex items-center gap-2 opacity-80">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                <span className="uppercase">{format(new Date(note.created_at), "hh:mm a, eeee")}</span>
                              </div>
                              <button
                                onClick={(e) => handleDeleteNote(note.id, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:underline decoration-2 underline-offset-2 uppercase tracking-wide"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        onClick={() => openEditor()}
                        className="h-[360px] rounded-[28px] border-[2px] border-dashed border-[#D1D5DC] hover:border-[#111] hover:bg-black/5 transition-all flex flex-col items-center justify-center gap-5 group"
                      >
                        <div className="bg-[#111] h-14 w-14 rounded-[20px] shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          {/* Solid page + addition combined conceptually into a document icon */}
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2ZM13 14V11H11V14H8V16H11V19H13V16H16V14H13Z" />
                          </svg>
                        </div>
                        <span className="font-bold text-[14px] text-[#111]">New Note</span>
                      </button>
                    </div>
                  )}
                </section>

              </div>
            )}
          </main>
        </div>
      </div>

      {/* Global Scrollbar Reset for this specific component */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 0px;
          width: 0px;
        }
      `}</style>

    </div>
  );
}
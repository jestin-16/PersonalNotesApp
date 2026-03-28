import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '../components/Sidebar';
import { NoteEditor } from '../components/NoteEditor';
import { CommandPalette } from '../components/CommandPalette';
import { SourceCard } from '../components/SourceCard';
import { NotebookGuide } from '../components/NotebookGuide';
import { AIChat } from '../components/AIChat';
import { useNotes } from '../hooks/useNotes';
import { useFolders } from '../hooks/useFolders';
import { Note } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Sparkles, FileText, Plus, Search, PanelRightClose, PanelRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Data hooks
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote, moveToTrash } = useNotes();
  const { folders, loading: foldersLoading, createFolder } = useFolders();

  // App State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'archive' | 'trash'>('notes');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'chat'>('chat');
  
  // NotebookLM Specific State
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Editor state
  const [isSaving, setIsSaving] = useState(false);

  // Derived state
  const displayedNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           n.content?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === 'trash') return n.is_trashed;
      if (activeTab === 'archive') return n.is_archived && !n.is_trashed;
      
      if (n.is_trashed || n.is_archived) return false;
      if (activeFolderId) return n.folder_id === activeFolderId;
      return true;
    });
  }, [notes, activeTab, activeFolderId, searchQuery]);

  const selectedNotes = useMemo(() => 
    notes.filter(n => selectedSourceIds.includes(n.id)),
    [notes, selectedSourceIds]
  );

  const getListTitle = () => {
    if (activeTab === 'trash') return 'Trash';
    if (activeTab === 'archive') return 'Archive';
    if (activeFolderId) {
      const folder = folders.find(f => f.id === activeFolderId);
      return folder ? folder.name : 'Unknown Folder';
    }
    return 'Sources';
  };

  // Handlers
  const handleToggleSource = (id: string) => {
    setSelectedSourceIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSelectNote = (note: Note) => {
    setCurrentNote(note);
    setViewMode('editor');
  };

  const handleNewNote = async () => {
    const newNote = await createNote({ folder_id: activeFolderId, title: 'Untitled Note' });
    if (newNote) {
      setCurrentNote(newNote);
      setViewMode('editor');
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    setIsSaving(true);
    await updateNote(id, updates);
    setIsSaving(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafd] overflow-hidden text-slate-800 font-sans">
      
      <Sidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        folders={folders}
        activeFolderId={activeFolderId}
        onSelectFolder={setActiveFolderId}
        onNewNote={handleNewNote}
        onNewFolder={async () => {
          const name = window.prompt("Enter notebook name:");
          if (name) await createFolder(name);
        }}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userEmail={user?.email}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* NotebookLM Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-md">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="font-bold text-xl text-slate-800 tracking-tight">NotebookLM</h1>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden md:block" />
            <h2 className="text-slate-500 font-medium hidden md:block">{getListTitle()}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-full text-sm w-64 transition-all outline-none"
              />
            </div>
            <button 
              onClick={() => setGuideOpen(!guideOpen)}
              className={`p-2 rounded-lg transition-colors ${guideOpen ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {guideOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Sources Grid */}
          <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Sources
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {displayedNotes.length}
                </span>
              </h3>
              <button 
                onClick={handleNewNote}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notesLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
                </div>
              ) : displayedNotes.length > 0 ? (
                displayedNotes.map(note => (
                  <SourceCard 
                    key={note.id}
                    note={note}
                    isSelected={selectedSourceIds.includes(note.id)}
                    onSelect={handleSelectNote}
                    onToggleSelection={handleToggleSource}
                  />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="p-3 bg-slate-50 rounded-full mb-3">
                    <FileText className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">No sources found</p>
                  <button onClick={handleNewNote} className="text-xs text-blue-600 mt-2 font-semibold">
                    Add your first note
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Middle Column: Editor/Chat */}
          <div className="flex-1 relative flex flex-col bg-[#f8fafd] overflow-hidden">
            {/* View Mode Switcher */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex bg-white/80 backdrop-blur-md p-1 rounded-full border border-slate-200 shadow-sm">
              <button 
                onClick={() => setViewMode('chat')}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AI Chat
              </button>
              <button 
                onClick={() => {
                  if (currentNote) setViewMode('editor');
                }}
                disabled={!currentNote}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'editor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Note Editor
              </button>
            </div>

            <main className="flex-1 p-6 pt-16 overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {viewMode === 'chat' ? (
                  <motion.div 
                    key="chat"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="h-full"
                  >
                    <AIChat selectedNotes={selectedNotes} />
                  </motion.div>
                ) : currentNote && (
                  <motion.div 
                    key="editor"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    <NoteEditor 
                      note={currentNote} 
                      onClose={() => setViewMode('chat')}
                      onUpdate={handleUpdateNote}
                      isSaving={isSaving}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>

          {/* Right Column: Notebook Guide */}
          <AnimatePresence>
            {guideOpen && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-slate-200 bg-white shrink-0 overflow-hidden hidden xl:flex flex-col"
              >
                <div className="p-6 h-full">
                  <NotebookGuide selectedNotes={selectedNotes} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <CommandPalette 
        notes={notes.filter(n => !n.is_trashed)} 
        folders={folders}
        onSelectNote={(note) => {
          if (note.folder_id) setActiveFolderId(note.folder_id);
          else setActiveFolderId(null);
          setActiveTab('notes');
          handleSelectNote(note);
        }}
        onSelectFolder={(id) => {
          setActiveFolderId(id);
          setActiveTab('notes');
        }}
        onClose={() => {}}
      />
    </div>
  );
}
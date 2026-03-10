import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '../components/Sidebar';
import { NoteList } from '../components/NoteList';
import { NoteEditor } from '../components/NoteEditor';
import { CommandPalette } from '../components/CommandPalette';
import { useNotes } from '../hooks/useNotes';
import { useFolders } from '../hooks/useFolders';
import { Note } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Menu } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Data hooks
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote, moveToTrash, restoreFromTrash } = useNotes();
  const { folders, loading: foldersLoading, createFolder } = useFolders();

  // App State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'archive' | 'trash'>('notes');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  
  // Editor state
  const [isSaving, setIsSaving] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N for New Note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewNote();
      }
      
      // Ctrl+D to delete currently open note
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        if (currentNote) {
          e.preventDefault();
          handleTrash(currentNote.id);
          setCurrentNote(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentNote, activeFolderId]);

  // Derived state for NoteList
  const displayedNotes = notes.filter(n => {
    if (activeTab === 'trash') return n.is_trashed;
    if (activeTab === 'archive') return n.is_archived && !n.is_trashed;
    
    // activeTab === 'notes'
    // Exclude trashed and archived
    if (n.is_trashed || n.is_archived) return false;
    
    // Filter by folder
    if (activeFolderId) return n.folder_id === activeFolderId;
    return true; // All Notes
  });

  const getListTitle = () => {
    if (activeTab === 'trash') return 'Trash';
    if (activeTab === 'archive') return 'Archive';
    if (activeFolderId) {
      const folder = folders.find(f => f.id === activeFolderId);
      return folder ? folder.name : 'Unknown Folder';
    }
    return 'All Notes';
  };

  // Handlers
  const handleNewNote = async () => {
    const newNote = await createNote({ folder_id: activeFolderId });
    if (newNote) {
      setCurrentNote(newNote);
    }
  };

  const handleNewFolder = async () => {
    const name = window.prompt("Enter folder name:");
    if (name) {
      const folder = await createFolder(name);
      if (folder) {
        setActiveFolderId(folder.id);
        setActiveTab('notes');
      }
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    setIsSaving(true);
    await updateNote(id, updates);
    setIsSaving(false);
  };

  const handlePin = async (id: string, is_pinned: boolean) => {
    await updateNote(id, { is_pinned });
  };

  const handleStar = async (id: string, is_favorite: boolean) => {
    await updateNote(id, { is_favorite });
  };

  const handleArchive = async (id: string, is_archived: boolean) => {
    await updateNote(id, { is_archived });
    if (currentNote?.id === id) setCurrentNote(null);
  };

  const handleTrash = async (id: string) => {
    if (activeTab === 'trash') {
      if (window.confirm("Permanently delete this note?")) {
        await deleteNote(id);
      }
    } else {
      await moveToTrash(id);
      if (currentNote?.id === id) setCurrentNote(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#fdfdfd] overflow-hidden text-slate-800 font-sans">
      
      <Sidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        folders={folders}
        activeFolderId={activeFolderId}
        onSelectFolder={setActiveFolderId}
        onNewNote={handleNewNote}
        onNewFolder={handleNewFolder}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userEmail={user?.email}
      />

      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="md:hidden h-14 border-b border-slate-200 flex items-center px-4 bg-white shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-md">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="ml-2 font-bold text-slate-800 shrink-0">{getListTitle()}</h1>
        </header>

        <AnimatePresence mode="wait">
          {currentNote ? (
            <NoteEditor 
              key="editor"
              note={currentNote} 
              onClose={() => setCurrentNote(null)}
              onUpdate={handleUpdateNote}
              isSaving={isSaving}
            />
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full"
            >
              <NoteList 
                title={getListTitle()}
                notes={displayedNotes}
                loading={notesLoading || foldersLoading}
                onSelectNote={setCurrentNote}
                onPin={handlePin}
                onStar={handleStar}
                onArchive={handleArchive}
                onTrash={handleTrash}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CommandPalette 
        notes={notes.filter(n => !n.is_trashed)} 
        folders={folders}
        onSelectNote={(note) => {
          if (note.folder_id) setActiveFolderId(note.folder_id);
          else setActiveFolderId(null);
          setActiveTab('notes');
          setCurrentNote(note);
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
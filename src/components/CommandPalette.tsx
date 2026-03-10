import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Folder, Check, X } from 'lucide-react';
import { Note, Folder as FolderType } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface CommandPaletteProps {
  notes: Note[];
  folders: FolderType[];
  onSelectNote: (note: Note) => void;
  onSelectFolder: (folderId: string) => void;
  onClose: () => void;
}

export function CommandPalette({ notes, folders, onSelectNote, onSelectFolder, onClose }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed inset-x-4 top-16 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full max-w-[600px] z-[60]"
          >
            <Command
              className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[60vh]"
              loop
            >
              <div className="flex items-center px-4 py-3 border-b border-slate-100">
                <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                <Command.Input 
                  autoFocus
                  placeholder="Ask AI, Search notes, or jump to a folder..." 
                  className="w-full bg-transparent outline-none text-[15px] font-medium placeholder:text-slate-400"
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                <button onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <Command.List className="overflow-y-auto custom-scrollbar p-2">
                <Command.Empty className="py-12 text-center text-sm text-slate-500 font-medium">
                  No results found for "{inputValue}".
                  {inputValue.length > 3 && (
                     <div className="mt-4 flex justify-center">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                           ✨ Ask AI to write about "{inputValue}"
                        </button>
                     </div>
                  )}
                </Command.Empty>

                {notes.length > 0 && (
                  <Command.Group heading="Notes" className="text-xs font-bold text-slate-400 px-2 py-3 [&_[cmdk-group-heading]]:mb-2">
                    {notes.map(note => (
                      <Command.Item
                        key={note.id}
                        value={`${note.title} ${note.content}`}
                        onSelect={() => {
                          onSelectNote(note);
                          handleClose();
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full aria-selected:bg-slate-100 cursor-pointer transition-colors outline-none text-slate-800"
                      >
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0">
                           <span className="text-[14px] font-medium truncate">{note.title || 'Untitled'}</span>
                           <span className="text-[11px] text-slate-400 line-clamp-1 truncate block opacity-80 mt-0.5">
                              {note.content.replace(/<[^>]+>/g, '').trim()}
                           </span>
                        </div>
                        <span className="text-[10px] whitespace-nowrap text-slate-400 font-semibold px-2">
                           {format(new Date(note.updated_at || note.created_at), 'MMM d')}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {folders.length > 0 && (
                  <Command.Group heading="Folders" className="text-xs font-bold text-slate-400 px-2 py-3 border-t border-slate-100 [&_[cmdk-group-heading]]:mb-2">
                    {folders.map(folder => (
                      <Command.Item
                        key={folder.id}
                        value={folder.name}
                        onSelect={() => {
                          onSelectFolder(folder.id);
                          handleClose();
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg aria-selected:bg-slate-100 cursor-pointer transition-colors outline-none text-slate-800"
                      >
                        <Folder className="h-4 w-4 text-slate-400" />
                        <span className="text-[14px] font-medium">{folder.name}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
              
              <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1 min-w-[20px] text-center shadow-sm">↑</kbd><kbd className="bg-white border border-slate-200 rounded px-1 min-w-[20px] text-center shadow-sm">↓</kbd> to navigate</span>
                  <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1 pb-0.5 min-w-[24px] text-center shadow-sm">↵</kbd> to select</span>
                </div>
                <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1.5 shadow-sm">esc</kbd> to close</span>
              </div>
            </Command>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}

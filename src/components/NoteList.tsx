import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NoteCard } from './NoteCard';
import { Note } from '../types';
import { 
  Search,
  Plus,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  onSelectNote: (note: Note) => void;
  onPin: (id: string, is_pinned: boolean) => void;
  onStar: (id: string, is_favorite: boolean) => void;
  onArchive: (id: string, is_archived: boolean) => void;
  onTrash: (id: string) => void;
  title: string;
  onNewNote: () => void;
}

// Staggered grid container variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export function NoteList({
  notes,
  loading,
  onSelectNote,
  onPin,
  onStar,
  onTrash,
  title,
  onNewNote
}: NoteListProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');

  // Generate dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good evening';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    
    // Extract first name or just use general greeting
    const name = user?.email?.split('@')[0];
    const capitalizedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
    
    setGreeting(`${timeGreeting}${capitalizedName ? `, ${capitalizedName}` : ''}`);
  }, [user]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = filterTag ? note.tags?.includes(filterTag) : true;
      
      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, filterTag]);

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
  const regularNotes = filteredNotes.filter(n => !n.is_pinned);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-bg-base)]">
      
      {/* Notion-style Header Area */}
      <div className="px-6 md:px-12 pt-10 pb-6 shrink-0 z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {title === 'All Notes' && (
            <p className="text-[14px] font-medium text-slate-500 mb-1 tracking-tight">
              {greeting}
            </p>
          )}
          <h1 className="text-[32px] md:text-[36px] font-bold tracking-tight text-slate-900 leading-none">
            {title}
          </h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/* Notion/Linear style search bar */}
          <div className="relative group w-full sm:max-w-[340px]">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[var(--color-border-base)] rounded-[14px] text-[14px] font-medium transition-all outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50 shadow-sm placeholder:text-slate-400 text-slate-800"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick Add Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNewNote}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-[14px] text-[14px] font-semibold hover:bg-slate-800 transition-colors shadow-sm shadow-slate-900/10 group"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
            Create Note
          </motion.button>
        </motion.div>
      </div>
      
      {/* Tags Filter (if applicable) */}
      {allTags.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="px-6 md:px-12 pb-6 shrink-0 overflow-x-auto custom-scrollbar flex gap-2"
        >
           <button
              onClick={() => setFilterTag(null)}
              className={`px-3 py-1.5 text-[12px] font-semibold rounded-full whitespace-nowrap transition-all ${
                filterTag === null ? 'bg-slate-800 text-white shadow-sm' : 'bg-white border border-[var(--color-border-subtle)] text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              All
            </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1.5 text-[12px] font-semibold rounded-full whitespace-nowrap transition-all border ${
                filterTag === tag ? 'bg-brand-50 border-brand-200 text-brand-700 shadow-sm' : 'bg-white border-[var(--color-border-subtle)] text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              #{tag}
            </button>
          ))}
        </motion.div>
      )}

      {/* Main Grid Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-32 custom-scrollbar">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/50 border border-white/60 animate-pulse rounded-[24px] h-[260px] shadow-sm" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full min-h-[400px] flex flex-col items-center justify-center text-center max-w-md mx-auto"
          >
            <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
              {searchQuery ? (
                <Search className="h-10 w-10 text-slate-300" />
              ) : (
                <Sparkles className="h-10 w-10 text-brand-300" />
              )}
            </div>
            <h3 className="text-[20px] font-bold text-slate-800 mb-2">
              {searchQuery ? 'No exact matches' : 'It\'s empty here'}
            </h3>
            <p className="text-[15px] text-slate-500 font-medium mb-8 leading-relaxed">
              {searchQuery 
                ? `We couldn't find any notes matching "${searchQuery}". Try a different keyword.` 
                : "You don't have any notes in this view yet. Create one to capture your thoughts."}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNewNote}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl shadow-sm hover:border-slate-300 transition-all"
              >
                <Plus className="h-4 w-4" />
                Write a note
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-10">
            {pinnedNotes.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-slate-400/80 uppercase tracking-[0.15em] mb-4 flex items-center gap-3">
                  Pinned Notes
                </h3>
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                >
                  <AnimatePresence>
                    {pinnedNotes.map(note => (
                      <NoteCard 
                        key={note.id} 
                        note={note} 
                        layout="grid"
                        onClick={() => onSelectNote(note)}
                        onPin={onPin}
                        onStar={onStar}
                        onTrash={onTrash}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {regularNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h3 className="text-[11px] font-bold text-slate-400/80 uppercase tracking-[0.15em] mb-4 flex items-center gap-3 mt-6">
                    Recent Notes
                  </h3>
                )}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                >
                  <AnimatePresence>
                    {regularNotes.map(note => (
                      <NoteCard 
                        key={note.id} 
                        note={note} 
                        layout="grid"
                        onClick={() => onSelectNote(note)}
                        onPin={onPin}
                        onStar={onStar}
                        onTrash={onTrash}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

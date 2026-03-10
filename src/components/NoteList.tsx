import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NoteCard } from './NoteCard';
import { Note } from '../types';
import { 
  LayoutGrid, 
  List, 
  Search,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  onSelectNote: (note: Note) => void;
  onPin: (id: string, is_pinned: boolean) => void;
  onStar: (id: string, is_favorite: boolean) => void;
  onArchive: (id: string, is_archived: boolean) => void;
  onTrash: (id: string) => void;
  title: string;
}

export function NoteList({
  notes,
  loading,
  onSelectNote,
  onPin,
  onStar,
  onArchive,
  onTrash,
  title
}: NoteListProps) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

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
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 shrink-0 flex items-center justify-between z-10">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#111]">{title}</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative group hidden sm:block">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600" />
            <input 
              type="text"
              placeholder="Filter notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-48 focus:w-64 transition-all outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-md transition-colors ${layout === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded-md transition-colors ${layout === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="px-8 pb-4 shrink-0 overflow-x-auto custom-scrollbar flex gap-2">
           <button
              onClick={() => setFilterTag(null)}
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                filterTag === null ? 'bg-[#111] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All
            </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors border ${
                filterTag === tag ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-24 custom-scrollbar">
        {loading ? (
          <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-4xl'}`}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`bg-slate-100 animate-pulse rounded-2xl ${layout === 'grid' ? 'h-[240px]' : 'h-[80px]'}`} />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No notes found</h3>
            <p className="text-slate-500 font-medium max-w-sm">
              We couldn't find any notes matching your search or filter.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {pinnedNotes.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="h-px bg-slate-200 flex-1"></span>
                  Pinned
                  <span className="h-px bg-slate-200 flex-1"></span>
                </h3>
                <AnimatePresence mode="popLayout">
                  <div className={`grid gap-5 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-4xl'}`}>
                    {pinnedNotes.map(note => (
                      <NoteCard 
                        key={note.id} 
                        note={note} 
                        layout={layout}
                        onClick={() => onSelectNote(note)}
                        onPin={onPin}
                        onStar={onStar}
                        onArchive={onArchive}
                        onTrash={onTrash}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}

            {regularNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 mt-2">
                    <span className="h-px bg-slate-200 flex-1"></span>
                    Recent
                    <span className="h-px bg-slate-200 flex-1"></span>
                  </h3>
                )}
                <AnimatePresence mode="popLayout">
                  <div className={`grid gap-5 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-4xl'}`}>
                    {regularNotes.map(note => (
                      <NoteCard 
                        key={note.id} 
                        note={note} 
                        layout={layout}
                        onClick={() => onSelectNote(note)}
                        onPin={onPin}
                        onStar={onStar}
                        onArchive={onArchive}
                        onTrash={onTrash}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Note } from '../types';
import { 
  Pin, 
  Star, 
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onPin?: (id: string, is_pinned: boolean) => void;
  onStar?: (id: string, is_favorite: boolean) => void;
  onArchive?: (id: string, is_archived: boolean) => void;
  onTrash?: (id: string) => void;
  layout?: 'grid' | 'list';
}

// Framer motion variants for staggered grid entrances
export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export function NoteCard({ 
  note, 
  onClick, 
  onPin, 
  onStar, 
  onTrash,
  layout = 'grid' 
}: NoteCardProps) {

  const textPreview = note.content
    .replace(/<[^>]+>/g, '') 
    .replace(/[#*`~>-]/g, ' ') 
    .trim();

  const isPinnedOrStarred = note.is_pinned || note.is_favorite;

  if (layout === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        layout
        whileHover={{ scale: 1.01, x: 4 }}
        whileTap={{ scale: 0.99 }}
        className="group flex items-center justify-between p-4 rounded-xl border border-[var(--color-border-subtle)] bg-white hover:border-slate-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
        onClick={onClick}
      >
        {isPinnedOrStarred && (
           <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-300 to-amber-500 rounded-l-xl"></div>
        )}
        <div className="flex items-center gap-4 flex-1 min-w-0 pl-2">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {note.is_pinned && <Pin className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
              {note.is_favorite && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
              <h3 className="text-[15px] font-semibold text-slate-900 truncate tracking-tight">
                {note.title || 'Untitled Note'}
              </h3>
            </div>
            <p className="text-[13px] text-slate-500 truncate font-medium">
              {textPreview || 'Empty note...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 shrink-0 pl-4">
          <div className="flex gap-1.5 hidden md:flex">
            {note.tags?.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                #{tag}
              </span>
            ))}
          </div>
          <div className="text-[12px] font-medium text-slate-400 w-20 text-right">
            {format(new Date(note.updated_at || note.created_at), 'MMM d, yy')}
          </div>
          
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
             <button title="Delete" onClick={(e) => { e.stopPropagation(); onTrash?.(note.id); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
             </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid Layout
  return (
    <motion.div
      variants={cardVariants}
      layout
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col p-6 rounded-[24px] h-[260px] border border-[var(--color-border-subtle)] bg-white shadow-sm hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-all cursor-pointer relative overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="absolute top-5 right-5 flex items-center gap-1.5 z-10 transition-opacity">
        {note.is_pinned && (
          <div className="h-7 w-7 rounded-full bg-amber-50 border border-amber-100/50 flex items-center justify-center shadow-sm">
            <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <h3 className="text-[18px] font-bold text-slate-900 leading-tight mb-2.5 line-clamp-2 pr-10 tracking-tight">
          {note.title || 'Untitled Note'}
        </h3>
        <p className="text-[14px] font-medium text-slate-500 leading-relaxed line-clamp-4 whitespace-pre-wrap flex-1">
          {textPreview || 'Start writing...'}
        </p>
      </div>

      <div className="mt-5 pt-4 flex flex-col gap-3 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-slate-100 before:via-slate-200/60 before:to-transparent">
        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-1.5 overflow-hidden">
            {note.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap bg-slate-50 text-slate-600 border border-slate-200/50">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-[11.5px] font-semibold text-slate-400 flex items-center gap-1.5">
            {format(new Date(note.updated_at || note.created_at), 'MMMM d, yyyy')}
          </div>
          
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity scale-95 group-hover:scale-100 duration-200">
            <button 
              title="Pin"
              onClick={(e) => { e.stopPropagation(); onPin?.(note.id, !note.is_pinned); }} 
              className="p-1.5 text-slate-400 hover:text-amber-500 bg-white hover:bg-slate-50 rounded-lg ml-1 transition-colors"
            >
              <Pin className="h-4 w-4" />
            </button>
            <button 
              title="Delete"
              onClick={(e) => { e.stopPropagation(); onTrash?.(note.id); }} 
              className="p-1.5 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-lg ml-1 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

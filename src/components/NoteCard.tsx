import React from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Note } from '../types';
import { 
  Pin, 
  Star, 
  Clock, 
  MoreVertical,
  Trash2,
  ArchiveRestore,
  Archive
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

export function NoteCard({ 
  note, 
  onClick, 
  onPin, 
  onStar, 
  onArchive, 
  onTrash,
  layout = 'grid' 
}: NoteCardProps) {

  // A helper to strip HTML and Markdown for the preview snippet
  // We'll just do a very basic regex for now
  const textPreview = note.content
    .replace(/<[^>]+>/g, '') // remove html tags 
    .replace(/[#*`~>-]/g, ' ') // remove some markdowns
    .trim();

  // Color generator based on id hash for visual variety similar to Linear/Craft
  const getColorScheme = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const themes = [
      { bg: "bg-white", border: "border-slate-200", hover: "hover:border-slate-300", tag: "bg-slate-100 text-slate-600" },
      { bg: "bg-blue-50/50", border: "border-blue-100", hover: "hover:border-blue-200", tag: "bg-blue-100 text-blue-700" },
      { bg: "bg-emerald-50/50", border: "border-emerald-100", hover: "hover:border-emerald-200", tag: "bg-emerald-100 text-emerald-700" },
      { bg: "bg-amber-50/50", border: "border-amber-100", hover: "hover:border-amber-200", tag: "bg-amber-100 text-amber-700" },
    ];
    return themes[sum % themes.length];
  };

  const theme = getColorScheme(note.id);

  if (layout === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: 4 }}
        className={cn(
          "group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
          theme.bg, theme.border, theme.hover
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {note.is_pinned && <Pin className="h-3 w-3 text-emerald-500 fill-emerald-500 shrink-0" />}
              {note.is_favorite && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
              <h3 className="text-sm font-semibold text-slate-800 truncate">
                {note.title || 'Untitled'}
              </h3>
            </div>
            <p className="text-sm text-slate-500 truncate mt-0.5">
              {textPreview || 'No content...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pl-4">
          <div className="flex gap-1.5 hidden md:flex">
            {note.tags?.slice(0, 2).map((tag, i) => (
              <span key={i} className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", theme.tag)}>
                #{tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-slate-400 w-24 text-right">
            {format(new Date(note.updated_at || note.created_at), 'MMM d, yyyy')}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button title="Delete" onClick={(e) => { e.stopPropagation(); onTrash?.(note.id); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                <Trash2 className="h-3.5 w-3.5" />
             </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid Layout
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex flex-col p-5 rounded-2xl h-[240px] border shadow-sm transition-all cursor-pointer relative overflow-hidden",
        theme.bg, theme.border, theme.hover
      )}
      onClick={onClick}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {note.is_pinned && (
          <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <Pin className="h-3 w-3 text-emerald-600 fill-emerald-600" />
          </div>
        )}
        {note.is_favorite && (
          <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <h3 className="text-[17px] font-bold text-slate-800 leading-tight mb-2 line-clamp-2 pr-12">
          {note.title || 'Untitled'}
        </h3>
        <p className="text-sm font-medium text-slate-500/80 leading-relaxed line-clamp-4 whitespace-pre-wrap">
          {textPreview || 'No content...'}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200/50 flex flex-col gap-3">
        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-1.5 overflow-hidden">
            {note.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", theme.tag)}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            {format(new Date(note.updated_at || note.created_at), 'MMM d, yyyy')}
          </div>
          
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              title="Pin"
              onClick={(e) => { e.stopPropagation(); onPin?.(note.id, !note.is_pinned); }} 
              className="p-1.5 text-slate-400 hover:text-emerald-500 bg-white shadow-sm rounded-md ml-1"
            >
              <Pin className="h-3 w-3" />
            </button>
            <button 
              title="Delete"
              onClick={(e) => { e.stopPropagation(); onTrash?.(note.id); }} 
              className="p-1.5 text-slate-400 hover:text-red-500 bg-white shadow-sm rounded-md ml-1"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import React from 'react';
import { FileText, MoreVertical, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Note } from '../types';

interface SourceCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: (note: Note) => void;
  onToggleSelection: (id: string) => void;
}

export const SourceCard: React.FC<SourceCardProps> = ({ note, isSelected, onSelect, onToggleSelection }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`group relative flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected 
          ? 'bg-blue-50 border-blue-200 shadow-sm' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
      onClick={() => onSelect(note)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
          <FileText className="h-5 w-5" />
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(note.id);
          }}
          className={`p-1 rounded-full transition-colors ${
            isSelected ? 'text-blue-600' : 'text-slate-300 hover:text-slate-600'
          }`}
        >
          <CheckCircle2 className={`h-5 w-5 ${isSelected ? 'fill-blue-600 text-white' : ''}`} />
        </button>
      </div>
      
      <h3 className="font-medium text-slate-800 line-clamp-1 mb-1">{note.title || 'Untitled Source'}</h3>
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
        {note.content?.replace(/[#*`]/g, '').slice(0, 100) || 'No content...'}
      </p>
      
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
          {new Date(note.updated_at).toLocaleDateString()}
        </span>
        <MoreVertical className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
      </div>
    </motion.div>
  );
};

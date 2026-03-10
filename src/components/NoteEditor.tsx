import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Note } from '../types';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Bold, 
  Italic, 
  Strikethrough, 
  Code,
  CheckSquare,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface NoteEditorProps {
  note: Note;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  isSaving: boolean;
}

export function NoteEditor({ note, onClose, onUpdate, isSaving }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTitle(note.title || '');
    setContent(note.content || '');
  }, [note.id]);

  const triggerSave = (newTitle: string, newContent: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate(note.id, { 
        title: newTitle, 
        content: newContent 
      });
    }, 1000);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    triggerSave(val, content);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands",
        emptyEditorClass: 'is-editor-empty before:text-slate-300 before:pointer-events-none',
      }),
      CharacterCount,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: note.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      triggerSave(title, html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-brand-500',
      },
    },
  });

  const words = editor?.storage.characterCount.words() || 0;
  const readingTime = Math.ceil(words / 200);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!editor) return null;

  return (
    <motion.div
      key="editor"
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute inset-0 bg-[var(--color-bg-base)] z-30 flex flex-col md:p-4"
    >
      <div className="flex-1 bg-white md:rounded-[24px] shadow-sm flex flex-col overflow-hidden relative border border-[var(--color-border-subtle)] md:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {/* Minimal Editor Top Bar */}
        <header className="h-16 flex items-center px-4 md:px-8 justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ x: -2 }}
              onClick={onClose}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-semibold text-[13px] px-2 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </motion.button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div className="text-[12px] font-medium text-slate-400 hidden sm:flex items-center gap-2.5">
              <span>{words} words</span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span>{readingTime} min read</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[12px] font-semibold text-slate-400">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                Saving
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                Saved
              </span>
            )}
            <span className="hidden sm:inline-block text-slate-400">
              Edited {format(new Date(note.updated_at || note.created_at), 'MMM d, h:mm a')}
            </span>
            <button className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors ml-1">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Editor Main Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-16 py-12 custom-scrollbar relative">
          <div className="max-w-[720px] mx-auto">
            <input
              type="text"
              placeholder="Untitled"
              className="w-full text-4xl md:text-[42px] font-bold tracking-tight text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 p-0 bg-transparent mb-10 leading-tight"
              value={title}
              onChange={handleTitleChange}
            />

            {/* Tiptap Bubble Menu */}
            {editor && (
              <BubbleMenu editor={editor} className="flex bg-white rounded-xl shadow-lg shadow-black/5 overflow-hidden p-1 border border-slate-200 backdrop-blur-md">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn("p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors", editor.isActive('bold') && 'bg-slate-100 text-slate-900')}
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn("p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors", editor.isActive('italic') && 'bg-slate-100 text-slate-900')}
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={cn("p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors", editor.isActive('strike') && 'bg-slate-100 text-slate-900')}
                >
                  <Strikethrough className="h-4 w-4" />
                </button>
                <div className="w-px bg-slate-200 mx-1 my-1"></div>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={cn("p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors", editor.isActive('code') && 'bg-slate-100 text-slate-900')}
                >
                  <Code className="h-4 w-4" />
                </button>
              </BubbleMenu>
            )}

            {/* Tiptap Floating Menu (Slash commands replacement) */}
            {editor && (
              <FloatingMenu editor={editor} className="flex bg-white rounded-xl shadow-lg shadow-black/5 overflow-hidden p-1 border border-slate-200">
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={cn("p-1.5 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors hover:text-slate-900", editor.isActive('heading', { level: 1 }) && 'bg-slate-100 text-slate-900')}
                >
                  <Heading1 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={cn("p-1.5 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors hover:text-slate-900", editor.isActive('heading', { level: 2 }) && 'bg-slate-100 text-slate-900')}
                >
                  <Heading2 className="h-4 w-4" />
                </button>
                <div className="w-px bg-slate-200 mx-1 my-1"></div>
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={cn("p-1.5 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors hover:text-slate-900", editor.isActive('bulletList') && 'bg-slate-100 text-slate-900')}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={cn("p-1.5 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors hover:text-slate-900", editor.isActive('orderedList') && 'bg-slate-100 text-slate-900')}
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleTaskList().run()}
                  className={cn("p-1.5 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors hover:text-slate-900", editor.isActive('taskList') && 'bg-slate-100 text-slate-900')}
                >
                  <CheckSquare className="h-4 w-4" />
                </button>
                <div className="w-px bg-slate-200 mx-1 my-1"></div>
                <button
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={cn("p-1.5 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors hover:text-slate-900", editor.isActive('blockquote') && 'bg-slate-100 text-slate-900')}
                >
                  <Quote className="h-4 w-4" />
                </button>
              </FloatingMenu>
            )}

            <EditorContent editor={editor} className="pb-32 text-slate-700 text-[15px] leading-relaxed" />
          </div>
        </div>
      </div>
      
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #cbd5e1;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .ProseMirror ul[data-type="taskList"] p {
          margin: 0;
        }
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        .ProseMirror ul[data-type="taskList"] li > label {
          margin-right: 0.75rem;
          margin-top: 0.25rem;
          user-select: none;
        }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
          appearance: none;
          background-color: #fff;
          margin: 0;
          font: inherit;
          color: currentColor;
          width: 1.1em;
          height: 1.1em;
          border: 1.5px solid #cbd5e1;
          border-radius: 0.25em;
          display: grid;
          place-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]::before {
          content: "";
          width: 0.6em;
          height: 0.6em;
          transform: scale(0);
          transition: 120ms transform ease-in-out;
          box-shadow: inset 1em 1em white;
          background-color: CanvasText;
          transform-origin: bottom left;
          clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]:checked {
          background-color: var(--color-brand-500);
          border-color: var(--color-brand-500);
        }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]:checked::before {
          transform: scale(1);
        }
        .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div {
          color: #94a3b8;
          text-decoration: line-through;
        }
        
        .ProseMirror pre {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #334155;
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.875rem;
        }
        .ProseMirror code {
          background: #f1f5f9;
          color: #ef4444;
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        .ProseMirror pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </motion.div>
  );
}

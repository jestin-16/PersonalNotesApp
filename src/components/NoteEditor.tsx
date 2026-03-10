import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Note } from '../types';
import { motion, AnimatePresence } from 'motion/react';
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
  Heading3,
  Quote
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
  
  // Local debounced state
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTitle(note.title || '');
    setContent(note.content || '');
  }, [note.id]); // Only reset when note ID changes

  const triggerSave = (newTitle: string, newContent: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate(note.id, { 
        title: newTitle, 
        content: newContent 
      });
    }, 1000); // Debounce save by 1 second
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
        placeholder: "Press '/' for commands, or start typing...",
        emptyEditorClass: 'is-editor-empty',
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
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px]',
      },
    },
  });

  // Calculate reading time
  const words = editor?.storage.characterCount.words() || 0;
  const readingTime = Math.ceil(words / 200);

  // Keyboard shortcut to close
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
      className="h-full flex flex-col pt-2 md:pt-4 absolute inset-0 bg-[#F0F2F5] z-30"
    >
      <div className="flex-1 bg-white md:rounded-tl-[40px] shadow-sm flex flex-col md:ml-4 overflow-hidden relative border-l border-t border-white">
        
        {/* Editor Top Bar */}
        <header className="h-[70px] flex items-center px-6 md:px-10 justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 hover:text-slate-800 text-slate-500 transition-colors font-medium text-sm bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div className="text-xs font-semibold text-slate-400 hidden sm:flex items-center gap-3">
              <span>{words} words</span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span>{readingTime} min read</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Saved
              </span>
            )}
            <span className="hidden sm:inline-block ml-2 opacity-60 font-medium">
              Last edited {format(new Date(note.updated_at || note.created_at), 'hh:mm a')}
            </span>
          </div>
        </header>

        {/* Editor Main Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-16 py-10 custom-scrollbar relative">
          <div className="max-w-[800px] mx-auto">
            <input
              type="text"
              placeholder="Note Title"
              className="w-full text-[40px] md:text-[48px] font-extrabold tracking-tight text-slate-900 placeholder:text-slate-200 border-none outline-none focus:ring-0 p-0 bg-transparent mb-8"
              value={title}
              onChange={handleTitleChange}
            />

            {/* Tiptap Bubble Menu */}
            {editor && (
              <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-[#111] text-white rounded-xl shadow-xl overflow-hidden p-1 border border-slate-700">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn("p-2 rounded-lg hover:bg-white/20 transition-colors", editor.isActive('bold') && 'bg-white/20')}
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn("p-2 rounded-lg hover:bg-white/20 transition-colors", editor.isActive('italic') && 'bg-white/20')}
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={cn("p-2 rounded-lg hover:bg-white/20 transition-colors", editor.isActive('strike') && 'bg-white/20')}
                >
                  <Strikethrough className="h-4 w-4" />
                </button>
                <div className="w-px bg-white/20 mx-1 my-1"></div>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={cn("p-2 rounded-lg hover:bg-white/20 transition-colors", editor.isActive('code') && 'bg-white/20')}
                >
                  <Code className="h-4 w-4" />
                </button>
              </BubbleMenu>
            )}

            {/* Tiptap Floating Menu (Slash commands replacement) */}
            {editor && (
              <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-white rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] overflow-hidden p-1 border border-slate-200">
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={cn("p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors", editor.isActive('heading', { level: 1 }) && 'bg-slate-100 text-black')}
                >
                  <Heading1 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={cn("p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors", editor.isActive('heading', { level: 2 }) && 'bg-slate-100 text-black')}
                >
                  <Heading2 className="h-4 w-4" />
                </button>
                <div className="w-px bg-slate-200 mx-1 my-1"></div>
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={cn("p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors", editor.isActive('bulletList') && 'bg-slate-100 text-black')}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={cn("p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors", editor.isActive('orderedList') && 'bg-slate-100 text-black')}
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleTaskList().run()}
                  className={cn("p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors", editor.isActive('taskList') && 'bg-slate-100 text-black')}
                >
                  <CheckSquare className="h-4 w-4" />
                </button>
                <div className="w-px bg-slate-200 mx-1 my-1"></div>
                <button
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={cn("p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors", editor.isActive('blockquote') && 'bg-slate-100 text-black')}
                >
                  <Quote className="h-4 w-4" />
                </button>
              </FloatingMenu>
            )}

            <EditorContent editor={editor} className="pb-32" />
          </div>
        </div>
      </div>
      
      {/* Tiptap Tailwind Prosemirror Custom Styles overrides */}
      <style>{`
        .ProseMirror {
          color: #334155;
          line-height: 1.7;
          font-size: 1.125rem;
        }
        .ProseMirror p {
          margin-bottom: 1.25em;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          color: #0f172a;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-top: 2em;
          margin-bottom: 1em;
        }
        .ProseMirror h1 { font-size: 2.25rem; line-height: 1.2; }
        .ProseMirror h2 { font-size: 1.5rem; }
        .ProseMirror h3 { font-size: 1.25rem; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
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
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .ProseMirror ul[data-type="taskList"] li > label {
          margin-right: 0.75rem;
          user-select: none;
        }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
          appearance: none;
          background-color: #fff;
          margin: 0;
          font: inherit;
          color: currentColor;
          width: 1.25em;
          height: 1.25em;
          border: 2px solid #cbd5e1;
          border-radius: 0.25em;
          display: grid;
          place-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]::before {
          content: "";
          width: 0.65em;
          height: 0.65em;
          transform: scale(0);
          transition: 120ms transform ease-in-out;
          box-shadow: inset 1em 1em white;
          background-color: CanvasText;
          transform-origin: bottom left;
          clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]:checked {
          background-color: #10b981;
          border-color: #10b981;
        }
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]:checked::before {
          transform: scale(1);
        }
        .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div {
          color: #94a3b8;
          text-decoration: line-through;
        }
        
        /* standard lists */
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #cbd5e1;
          padding-left: 1rem;
          color: #64748b;
          font-style: italic;
          margin: 1.5rem 0;
        }
        .ProseMirror pre {
          background: #0f172a;
          color: #f8fafc;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: monospace;
          font-size: 0.875rem;
          margin: 1.5rem 0;
        }
        .ProseMirror code {
          background: #f1f5f9;
          color: #ef4444;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: monospace;
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

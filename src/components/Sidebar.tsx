import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Archive,
  Search,
  FolderOpen,
  Settings,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Folder } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  folders: Folder[];
  activeFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onNewNote: () => void;
  onNewFolder: () => void;
  activeTab: 'notes' | 'archive' | 'trash';
  onSelectTab: (tab: 'notes' | 'archive' | 'trash') => void;
  userEmail?: string;
}

export function Sidebar({
  isOpen,
  setIsOpen,
  folders,
  activeFolderId,
  onSelectFolder,
  onNewNote,
  onNewFolder,
  activeTab,
  onSelectTab,
  userEmail
}: SidebarProps) {
  const { signOut } = useAuth();
  const [foldersExpanded, setFoldersExpanded] = useState(true);

  // Derive a unique active ID for the layoutId animation
  const currentActiveId = activeTab === 'notes' && activeFolderId !== null 
    ? `folder-${activeFolderId}` 
    : activeTab;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-white md:bg-[var(--color-bg-base)] border-r border-[var(--color-border-subtle)] flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-5 flex items-center justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2.5"
          >
            <div className="h-8 w-8 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
              <span className="font-bold text-[13px] tracking-tight">JN</span>
            </div>
            <span className="text-[16px] font-semibold tracking-tight text-slate-800 truncate max-w-[140px]">
              {userEmail ? userEmail.split('@')[0] : 'Workspace'}
            </span>
          </motion.div>
        </div>

        <div className="px-4 py-1">
          <motion.button
            whileHover={{ scale: 0.98 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNewNote}
            className="group flex items-center gap-2 w-full bg-white border border-[var(--color-border-base)] shadow-sm text-slate-700 font-semibold text-[14px] px-3 py-2.5 rounded-[14px] hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-all"
          >
            <div className="bg-slate-100 group-hover:bg-brand-100 p-1 rounded-md transition-colors">
              <Plus className="h-3.5 w-3.5 group-hover:text-brand-600" />
            </div>
            New Note
          </motion.button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 mt-4 space-y-6 custom-scrollbar">
          
          <div className="space-y-[2px]">
            <NavItem 
              icon={<Search className="h-4 w-4" />}
              label="Search"
              onClick={() => {
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'k', 'ctrlKey': true}));
              }}
              shortcut="Ctrl K"
            />
            <NavItem 
              id="notes"
              activeId={currentActiveId}
              icon={<FolderOpen className="h-4 w-4" />}
              label="All Notes"
              onClick={() => {
                onSelectTab('notes');
                onSelectFolder(null);
                setIsOpen(false);
              }}
            />
          </div>

          <div>
            <div className="px-2 mb-1.5 flex items-center justify-between group">
              <button 
                onClick={() => setFoldersExpanded(!foldersExpanded)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                <ChevronRight className={cn("h-3 w-3 transition-transform", foldersExpanded && "rotate-90")} />
                Folders
              </button>
              <button 
                onClick={onNewFolder}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-md transition-all"
                title="New Folder"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <AnimatePresence initial={false}>
              {foldersExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-[2px] mt-1 overflow-hidden"
                >
                  {folders.length === 0 ? (
                    <div className="px-7 py-2 text-xs text-slate-400 italic font-medium">No folders yet</div>
                  ) : (
                    folders.map(folder => (
                      <NavItem 
                        key={folder.id}
                        id={`folder-${folder.id}`}
                        activeId={currentActiveId}
                        label={folder.name}
                        onClick={() => {
                          onSelectTab('notes');
                          onSelectFolder(folder.id);
                          setIsOpen(false);
                        }}
                        indent={1}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-[2px]">
            <div className="px-2 mb-1.5 mt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Storage</span>
            </div>
            <NavItem 
              id="archive"
              activeId={currentActiveId}
              icon={<Archive className="h-4 w-4" />}
              label="Archive"
              onClick={() => {
                onSelectTab('archive');
                setIsOpen(false);
              }}
            />
            <NavItem 
              id="trash"
              activeId={currentActiveId}
              icon={<Trash2 className="h-4 w-4" />}
              label="Trash"
              onClick={() => {
                onSelectTab('trash');
                setIsOpen(false);
              }}
            />
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[var(--color-border-subtle)] mt-auto">
           <button 
             onClick={signOut}
             className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-200/50 transition-colors group cursor-pointer"
           >
              <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-400 to-indigo-400 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {userEmail?.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex flex-col items-start min-w-0">
                    <span className="text-[13px] font-semibold text-slate-700 truncate w-[100px] text-left">
                       {userEmail}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">Free plan</span>
                 </div>
              </div>
              <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors shrink-0" />
           </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ 
  id,
  activeId,
  icon, 
  label, 
  onClick, 
  shortcut,
  indent = 0
}: { 
  id?: string;
  activeId?: string;
  icon?: React.ReactNode; 
  label: string; 
  onClick: () => void;
  shortcut?: string;
  indent?: number;
}) {
  const isActive = id === activeId;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-[14px] font-medium group",
        isActive 
          ? "text-brand-700" 
          : "text-slate-600 hover:text-slate-900",
        indent > 0 && "pl-8"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute inset-0 bg-brand-50 rounded-xl"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <div className="flex items-center gap-2.5 truncate relative z-10">
        {icon && (
          <span className={cn(
            "transition-colors", 
            isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
          )}>
            {icon}
          </span>
        )}
        <span className={cn("truncate", !icon && indent > 0 && "relative before:absolute before:-left-4 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-slate-200", isActive && "before:bg-brand-400 font-semibold")}>
          {label}
        </span>
      </div>
      {shortcut && (
        <span className="relative z-10 text-[10px] font-bold text-slate-400 border border-slate-200/60 rounded-[4px] px-1.5 py-0.5 shadow-sm bg-white">
          {shortcut}
        </span>
      )}
    </button>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Archive,
  Search,
  FolderOpen,
  Settings,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Folder } from '../types';

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
  const [foldersExpanded, setFoldersExpanded] = useState(true);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[#F7F9FB] border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="h-7 w-7 rounded-md bg-[#111] flex items-center justify-center text-white px-1 shadow-sm">
              <span className="font-bold text-sm tracking-tighter">JN</span>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-[#111] truncate max-w-[140px]">
              {userEmail ? userEmail.split('@')[0] : 'Workspace'}
            </span>
          </motion.div>
        </div>

        <div className="px-4 py-2">
          <button
            onClick={onNewNote}
            className="flex items-center gap-2 w-full bg-white border border-slate-200 shadow-sm text-slate-800 font-medium text-[14px] px-3 py-2 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6 custom-scrollbar">
          
          <div className="space-y-0.5">
            <NavItem 
              icon={<Search className="h-4 w-4" />}
              label="Search"
              onClick={() => {
                // Trigger global search cmdk
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'k', 'ctrlKey': true}));
              }}
              shortcut="Ctrl K"
            />
            <NavItem 
              icon={<FolderOpen className="h-4 w-4" />}
              label="All Notes"
              isActive={activeTab === 'notes' && activeFolderId === null}
              onClick={() => {
                onSelectTab('notes');
                onSelectFolder(null);
                setIsOpen(false);
              }}
            />
            <NavItem 
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              onClick={() => {}}
            />
          </div>

          <div>
            <div className="px-2 mb-1 flex items-center justify-between group">
              <button 
                onClick={() => setFoldersExpanded(!foldersExpanded)}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
              >
                <ChevronRight className={cn("h-3 w-3 transition-transform", foldersExpanded && "rotate-90")} />
                Folders
              </button>
              <button 
                onClick={onNewFolder}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-all"
                title="New Folder"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            
            {foldersExpanded && (
              <div className="space-y-0.5 mt-1">
                {folders.length === 0 ? (
                  <div className="px-6 py-2 text-xs text-slate-400 italic">No folders yet</div>
                ) : (
                  folders.map(folder => (
                    <NavItem 
                      key={folder.id}
                      label={folder.name}
                      isActive={activeTab === 'notes' && activeFolderId === folder.id}
                      onClick={() => {
                        onSelectTab('notes');
                        onSelectFolder(folder.id);
                        setIsOpen(false);
                      }}
                      indent={1}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <div className="px-2 mb-1 mt-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage</span>
            </div>
            <NavItem 
              icon={<Archive className="h-4 w-4" />}
              label="Archive"
              isActive={activeTab === 'archive'}
              onClick={() => {
                onSelectTab('archive');
                setIsOpen(false);
              }}
            />
            <NavItem 
              icon={<Trash2 className="h-4 w-4" />}
              label="Trash"
              isActive={activeTab === 'trash'}
              onClick={() => {
                onSelectTab('trash');
                setIsOpen(false);
              }}
            />
          </div>

        </nav>
      </aside>
    </>
  );
}

function NavItem({ 
  icon, 
  label, 
  isActive, 
  onClick, 
  shortcut,
  indent = 0
}: { 
  icon?: React.ReactNode; 
  label: string; 
  isActive?: boolean; 
  onClick: () => void;
  shortcut?: string;
  indent?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-colors text-sm font-medium",
        isActive 
          ? "bg-black/5 text-black" 
          : "text-slate-600 hover:bg-black/5 hover:text-black",
        indent > 0 && "pl-6"
      )}
    >
      <div className="flex items-center gap-2 truncate">
        {icon && <span className={cn("text-slate-400", isActive && "text-slate-800")}>{icon}</span>}
        <span className="truncate">{label}</span>
      </div>
      {shortcut && (
        <span className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 shadow-sm bg-white">
          {shortcut}
        </span>
      )}
    </button>
  );
}

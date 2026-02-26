
"use client"

import React, { useState } from 'react';
import { useStore } from '@/app/lib/store';
import { 
  FolderIcon, 
  FileText, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  MoreVertical, 
  Trash2, 
  Upload,
  Search,
  BookOpen,
  Edit2,
  Loader2,
  LogOut,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  useAuth,
  initiateGoogleSignIn,
  initiateSignOut
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Sidebar = () => {
  const { setActiveNote } = useStore();
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const foldersQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return collection(db, 'users', user.uid, 'folders');
  }, [user, db]);

  const { data: folders, isLoading: foldersLoading } = useCollection(foldersQuery);

  const handleCreateFolder = (parentId: string | null = null) => {
    if (!user || !db) return;
    const colRef = collection(db, 'users', user.uid, 'folders');
    const newId = doc(colRef).id;
    addDocumentNonBlocking(colRef, {
      id: newId,
      name: 'New Folder',
      parentId,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const handleFileUpload = async (folderId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx,.txt';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file || !user || !db) return;

      const fileName = file.name.replace(/\.[^/.]+$/, "");
      
      try {
        if (file.name.toLowerCase().endsWith('.docx')) {
          const reader = new FileReader();
          reader.onload = async (res) => {
            const arrayBuffer = res.target?.result as ArrayBuffer;
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ arrayBuffer });
            createNote(folderId, fileName, result.value);
          };
          reader.readAsArrayBuffer(file);
        } else {
          const reader = new FileReader();
          reader.onload = (res) => {
            createNote(folderId, fileName, res.target?.result as string);
          };
          reader.readAsText(file);
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Upload Error", description: "Failed to parse document." });
      }
    };
    input.click();
  };

  const createNote = (folderId: string, title: string, content: string = '') => {
    if (!user || !db) return;
    const colRef = collection(db, 'users', user.uid, 'folders', folderId, 'notes');
    const newId = doc(colRef).id;
    addDocumentNonBlocking(colRef, {
      id: newId,
      title,
      content,
      folderId,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    toast({ title: "Note Created", description: `"${title}" added successfully.` });
  };

  return (
    <div className="w-72 border-r bg-white h-full flex flex-col shadow-sm">
      <div className="p-6 border-b flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">DocuSpark</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            placeholder="Search folders..." 
            className="w-full pl-9 bg-background/50 border-none rounded-md h-9 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-4 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Folders
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleCreateFolder()}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        {foldersLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-1">
            {folders?.filter(f => !f.parentId).map(folder => (
              <FolderItem 
                key={folder.id} 
                folder={folder} 
                onUpload={() => handleFileUpload(folder.id)}
                allFolders={folders}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-background/30 mt-auto">
        {user && !user.isAnonymous ? (
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-primary/5 text-primary">
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.displayName || user.email}</p>
              <button 
                onClick={() => initiateSignOut(auth)}
                className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 mt-0.5"
              >
                <LogOut className="h-2.5 w-2.5" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase px-2 mb-1">Account</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-xs h-9 bg-white border-dashed border-2"
              onClick={() => initiateGoogleSignIn(auth)}
            >
              <LogIn className="w-3 h-3 mr-2 text-primary" />
              Sign in with Google
            </Button>
            <p className="text-[9px] text-muted-foreground px-2 text-center italic">Link your account to save notes forever.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const FolderItem = ({ folder, onUpload, allFolders }: { folder: any, onUpload: () => void, allFolders: any[] }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const { user } = useUser();
  const db = useFirestore();
  const { setActiveNote } = useStore();
  
  const notesQuery = useMemoFirebase(() => {
    if (!user || !db || !folder.id) return null;
    return collection(db, 'users', user.uid, 'folders', folder.id, 'notes');
  }, [user, db, folder.id]);

  const { data: notes } = useCollection(notesQuery);
  const subfolders = allFolders.filter(f => f.parentId === folder.id);

  const handleRename = () => {
    if (newName.trim() && user && db) {
      const docRef = doc(db, 'users', user.uid, 'folders', folder.id);
      updateDocumentNonBlocking(docRef, { name: newName.trim(), updatedAt: new Date().toISOString() });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (user && db) {
      const docRef = doc(db, 'users', user.uid, 'folders', folder.id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  const handleAddNote = () => {
    if (!user || !db) return;
    const colRef = collection(db, 'users', user.uid, 'folders', folder.id, 'notes');
    const newId = doc(colRef).id;
    addDocumentNonBlocking(colRef, {
      id: newId,
      title: 'New Note',
      content: '',
      folderId: folder.id,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="select-none">
      <div 
        className="group flex items-center py-1.5 px-4 hover:bg-secondary cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center flex-1 min-w-0">
          {isOpen ? <ChevronDown className="w-3 h-3 mr-1 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 mr-1 text-muted-foreground" />}
          <FolderIcon className="w-4 h-4 mr-2 text-primary/70 fill-primary/10" />
          <span className="text-sm font-medium truncate text-foreground/80">{folder.name}</span>
        </div>
        
        <div className="hidden group-hover:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAddNote(); }}>
                <Plus className="w-3.5 h-3.5 mr-2" /> New Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpload(); }}>
                <Upload className="w-3.5 h-3.5 mr-2" /> Upload File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              placeholder="Folder name"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isOpen && (
        <div className="pl-6 border-l border-border/50 ml-6 mt-0.5 space-y-0.5">
          {subfolders.map(sub => (
            <FolderItem key={sub.id} folder={sub} onUpload={onUpload} allFolders={allFolders} />
          ))}
          {notes?.map(note => (
            <NoteItem key={note.id} note={note} folderId={folder.id} />
          ))}
        </div>
      )}
    </div>
  );
};

const NoteItem = ({ note, folderId }: { note: any, folderId: string }) => {
  const { activeNoteId, setActiveNote } = useStore();
  const { user } = useUser();
  const db = useFirestore();
  const isActive = activeNoteId === note.id;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user && db) {
      const docRef = doc(db, 'users', user.uid, 'folders', folderId, 'notes', note.id);
      deleteDocumentNonBlocking(docRef);
      if (isActive) setActiveNote(null);
    }
  };

  return (
    <div 
      className={cn(
        "group flex items-center py-1.5 px-3 rounded-md cursor-pointer transition-colors mr-2",
        isActive ? "bg-primary text-white" : "hover:bg-secondary text-foreground/70"
      )}
      onClick={() => setActiveNote(note.id, folderId)}
    >
      <FileText className={cn("w-3.5 h-3.5 mr-2 shrink-0", isActive ? "text-white" : "text-muted-foreground")} />
      <span className="text-sm truncate flex-1 font-medium">{note.title || 'Untitled Note'}</span>
      <div className="hidden group-hover:block ml-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-5 w-5", isActive ? "text-white/80 hover:bg-white/20 hover:text-white" : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive")}
          onClick={handleDelete}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

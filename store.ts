
import { create } from 'zustand';

interface DocuSparkState {
  activeNoteId: string | null;
  activeFolderId: string | null;
  activeNoteFolderId: string | null; // Track which folder the active note belongs to
  
  // Actions
  setActiveNote: (id: string | null, folderId?: string | null) => void;
  setActiveFolder: (id: string | null) => void;
}

export const useStore = create<DocuSparkState>((set) => ({
  activeNoteId: null,
  activeFolderId: 'root',
  activeNoteFolderId: null,

  setActiveNote: (id, folderId = null) => set({ 
    activeNoteId: id,
    activeNoteFolderId: folderId 
  }),
  setActiveFolder: (id) => set({ activeFolderId: id }),
}));

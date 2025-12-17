import { create } from 'zustand';

interface ReservaModalStore {
  isOpen: boolean;
  propiedad: any | null;
  onOpen: (propiedad: any) => void;
  onClose: () => void;
}

export const useReservaModal = create<ReservaModalStore>((set) => ({
  isOpen: false,
  propiedad: null,
  onOpen: (propiedad) => set({ isOpen: true, propiedad }),
  onClose: () => set({ isOpen: false, propiedad: null }),
}));
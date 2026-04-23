import { create } from 'zustand';
import { BrandData, SnapshotData, SalesData, InventoryData } from '@/types';

interface DashboardState {
  // Active brand
  activeBrandId: string | null;
  setActiveBrandId: (id: string | null) => void;

  // Brands list
  brands: BrandData[];
  setBrands: (brands: BrandData[]) => void;

  // Active brand's snapshots
  snapshots: SnapshotData[];
  setSnapshots: (snapshots: SnapshotData[]) => void;

  // SP-API Data
  salesData: SalesData[];
  setSalesData: (data: SalesData[]) => void;
  inventoryData: InventoryData[];
  setInventoryData: (data: InventoryData[]) => void;


  // UI states
  isDataEntryMode: boolean;
  setDataEntryMode: (mode: boolean) => void;

  isExportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;

  isSharePanelOpen: boolean;
  setSharePanelOpen: (open: boolean) => void;

  // Refresh trigger
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeBrandId: null,
  setActiveBrandId: (id) => set({ activeBrandId: id }),

  brands: [],
  setBrands: (brands) => set({ brands }),

  snapshots: [],
  setSnapshots: (snapshots) => set({ snapshots }),

  salesData: [],
  setSalesData: (data) => set({ salesData: data }),
  
  inventoryData: [],
  setInventoryData: (data) => set({ inventoryData: data }),


  isDataEntryMode: false,
  setDataEntryMode: (mode) => set({ isDataEntryMode: mode }),

  isExportModalOpen: false,
  setExportModalOpen: (open) => set({ isExportModalOpen: open }),

  isSharePanelOpen: false,
  setSharePanelOpen: (open) => set({ isSharePanelOpen: open }),

  refreshKey: 0,
  triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}));

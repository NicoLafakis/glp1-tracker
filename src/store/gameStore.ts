import { create } from 'zustand'
import type {
  GameScreen,
  SimulationConfig,
  SimulationProgress,
  BusinessType,
  SalesStyle,
  DistributionType,
  TimeFrame
} from '@/types'

interface GameState {
  // Current screen
  screen: GameScreen
  setScreen: (screen: GameScreen) => void

  // Menu navigation
  menuIndex: number
  setMenuIndex: (index: number) => void

  // Simulation configuration
  config: SimulationConfig
  updateConfig: (updates: Partial<SimulationConfig>) => void
  setBusinessType: (type: BusinessType) => void
  setSalesStyle: (style: SalesStyle) => void
  setDistributionType: (type: DistributionType) => void
  setTimeFrame: (frame: TimeFrame) => void
  setRecordCount: (type: keyof SimulationConfig['recordCounts'], count: number) => void

  // Simulation progress
  progress: SimulationProgress
  updateProgress: (updates: Partial<SimulationProgress>) => void

  // HubSpot connection
  hubspotConnected: boolean
  hubspotPortalId: string | null
  setHubspotConnection: (connected: boolean, portalId?: string) => void

  // UI State
  showConfirmDialog: boolean
  setShowConfirmDialog: (show: boolean) => void

  // Log messages for the simulation
  logs: string[]
  addLog: (message: string) => void
  clearLogs: () => void

  // Reset
  resetSimulation: () => void
}

const defaultConfig: SimulationConfig = {
  businessType: 'saas',
  businessName: 'Acme Corp',
  salesStyle: 'hybrid',
  distributionType: 'growth',
  timeFrame: '6_months',
  recordCounts: {
    contacts: 500,
    companies: 100,
    deals: 75,
    tickets: 50,
  },
  options: {
    includeActivities: true,
    includeNotes: true,
    realisticTimestamps: true,
    progressiveLifecycle: true,
  },
}

const defaultProgress: SimulationProgress = {
  status: 'idle',
  currentPhase: '',
  totalRecords: 0,
  createdRecords: 0,
  errors: [],
}

export const useGameStore = create<GameState>((set) => ({
  // Screen management
  screen: 'title',
  setScreen: (screen) => set({ screen, menuIndex: 0 }),

  // Menu
  menuIndex: 0,
  setMenuIndex: (menuIndex) => set({ menuIndex }),

  // Configuration
  config: defaultConfig,
  updateConfig: (updates) => set((state) => ({
    config: { ...state.config, ...updates }
  })),
  setBusinessType: (businessType) => set((state) => ({
    config: { ...state.config, businessType }
  })),
  setSalesStyle: (salesStyle) => set((state) => ({
    config: { ...state.config, salesStyle }
  })),
  setDistributionType: (distributionType) => set((state) => ({
    config: { ...state.config, distributionType }
  })),
  setTimeFrame: (timeFrame) => set((state) => ({
    config: { ...state.config, timeFrame }
  })),
  setRecordCount: (type, count) => set((state) => ({
    config: {
      ...state.config,
      recordCounts: { ...state.config.recordCounts, [type]: count }
    }
  })),

  // Progress
  progress: defaultProgress,
  updateProgress: (updates) => set((state) => ({
    progress: { ...state.progress, ...updates }
  })),

  // HubSpot
  hubspotConnected: false,
  hubspotPortalId: null,
  setHubspotConnection: (connected, portalId) => set({
    hubspotConnected: connected,
    hubspotPortalId: portalId ?? null
  }),

  // UI
  showConfirmDialog: false,
  setShowConfirmDialog: (showConfirmDialog) => set({ showConfirmDialog }),

  // Logs
  logs: [],
  addLog: (message) => set((state) => ({
    logs: [...state.logs.slice(-50), `[${new Date().toLocaleTimeString()}] ${message}`]
  })),
  clearLogs: () => set({ logs: [] }),

  // Reset
  resetSimulation: () => set({
    config: defaultConfig,
    progress: defaultProgress,
    logs: [],
    screen: 'menu',
  }),
}))

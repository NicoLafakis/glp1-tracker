// Business Types
export type BusinessType =
  | 'saas'
  | 'ecommerce'
  | 'agency'
  | 'real_estate'
  | 'healthcare'
  | 'finance'
  | 'manufacturing'
  | 'education'
  | 'nonprofit'
  | 'consulting'

export type SalesStyle =
  | 'inbound'
  | 'outbound'
  | 'hybrid'
  | 'plg' // Product-led growth
  | 'enterprise'
  | 'smb'

export type DistributionType =
  | 'steady'      // Even distribution over time
  | 'growth'      // Growing over time (startup pattern)
  | 'seasonal'    // Peaks and valleys
  | 'burst'       // Concentrated in short periods
  | 'decline'     // Decreasing over time

export type TimeFrame =
  | '30_days'
  | '90_days'
  | '6_months'
  | '1_year'
  | '2_years'

// Simulation Configuration
export interface SimulationConfig {
  businessType: BusinessType
  businessName: string
  salesStyle: SalesStyle
  distributionType: DistributionType
  timeFrame: TimeFrame
  recordCounts: {
    contacts: number
    companies: number
    deals: number
    tickets: number
  }
  options: {
    includeActivities: boolean
    includeNotes: boolean
    realisticTimestamps: boolean
    progressiveLifecycle: boolean
  }
}

// HubSpot Record Types
export interface Contact {
  id?: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  company?: string
  jobTitle?: string
  lifecycleStage: 'subscriber' | 'lead' | 'mql' | 'sql' | 'opportunity' | 'customer' | 'evangelist'
  leadStatus?: string
  createdAt: Date
  lastModified: Date
}

export interface Company {
  id?: string
  name: string
  domain: string
  industry: string
  employeeCount?: number
  annualRevenue?: number
  type: 'prospect' | 'partner' | 'reseller' | 'vendor' | 'customer'
  createdAt: Date
  lastModified: Date
}

export interface Deal {
  id?: string
  name: string
  stage: string
  amount: number
  closeDate: Date
  pipeline: string
  probability: number
  createdAt: Date
  lastModified: Date
}

export interface Ticket {
  id?: string
  subject: string
  description: string
  status: 'new' | 'waiting' | 'in_progress' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  createdAt: Date
  lastModified: Date
}

// Activity Types
export interface Activity {
  id?: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  subject: string
  body?: string
  timestamp: Date
  duration?: number // For calls/meetings in minutes
  outcome?: string
}

// Simulation State
export interface SimulationProgress {
  status: 'idle' | 'configuring' | 'running' | 'paused' | 'completed' | 'error'
  currentPhase: string
  totalRecords: number
  createdRecords: number
  currentRecord?: string
  errors: string[]
  startedAt?: Date
  estimatedCompletion?: Date
}

// Game Screen State
export type GameScreen =
  | 'title'
  | 'menu'
  | 'connect_hubspot'
  | 'select_business'
  | 'select_sales_style'
  | 'select_distribution'
  | 'select_timeframe'
  | 'select_records'
  | 'confirm'
  | 'running'
  | 'complete'
  | 'history'
  | 'settings'

// User & Auth
export interface User {
  id: string
  email: string
  name?: string
  hubspotConnected: boolean
  hubspotPortalId?: string
  createdAt: Date
}

export interface SimulationHistory {
  id: string
  userId: string
  config: SimulationConfig
  status: 'completed' | 'failed' | 'cancelled'
  recordsCreated: number
  startedAt: Date
  completedAt?: Date
  errors?: string[]
}

// OpenAI Generation Types
export interface GenerationRequest {
  type: 'contact' | 'company' | 'deal' | 'ticket' | 'activity'
  businessContext: {
    businessType: BusinessType
    businessName: string
    salesStyle: SalesStyle
    industry?: string
  }
  existingRecords?: string[] // For deduplication
  count: number
}

export interface GeneratedRecord {
  type: string
  data: Record<string, unknown>
  associations?: {
    type: string
    id: string
  }[]
}

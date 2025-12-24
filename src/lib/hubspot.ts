import type { Contact, Company, Deal, Ticket, Activity } from '@/types'

// HubSpot API configuration
const HUBSPOT_API_BASE = 'https://api.hubapi.com'

// OAuth configuration
export const HUBSPOT_OAUTH_CONFIG = {
  clientId: process.env.HUBSPOT_CLIENT_ID!,
  clientSecret: process.env.HUBSPOT_CLIENT_SECRET!,
  redirectUri: process.env.HUBSPOT_REDIRECT_URI || 'http://localhost:3000/api/hubspot/callback',
  scopes: [
    'crm.objects.contacts.write',
    'crm.objects.contacts.read',
    'crm.objects.companies.write',
    'crm.objects.companies.read',
    'crm.objects.deals.write',
    'crm.objects.deals.read',
    'crm.objects.owners.read',
    'tickets',
  ],
}

// Generate OAuth authorization URL
export function getOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: HUBSPOT_OAUTH_CONFIG.clientId,
    redirect_uri: HUBSPOT_OAUTH_CONFIG.redirectUri,
    scope: HUBSPOT_OAUTH_CONFIG.scopes.join(' '),
    state,
  })

  return `https://app.hubspot.com/oauth/authorize?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: HUBSPOT_OAUTH_CONFIG.clientId,
      client_secret: HUBSPOT_OAUTH_CONFIG.clientSecret,
      redirect_uri: HUBSPOT_OAUTH_CONFIG.redirectUri,
      code,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: HUBSPOT_OAUTH_CONFIG.clientId,
      client_secret: HUBSPOT_OAUTH_CONFIG.clientSecret,
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

// Get portal info
export async function getPortalInfo(accessToken: string): Promise<{
  portalId: string
  accountType: string
}> {
  const response = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/' + accessToken, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get portal info')
  }

  const data = await response.json()
  return {
    portalId: data.hub_id.toString(),
    accountType: data.hub_domain,
  }
}

// HubSpot API client class
export class HubSpotClient {
  private accessToken: string
  private baseUrl = HUBSPOT_API_BASE

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HubSpot API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // Create a contact
  async createContact(contact: Partial<Contact>): Promise<string> {
    const properties: Record<string, string | number> = {
      email: contact.email!,
      firstname: contact.firstName!,
      lastname: contact.lastName!,
    }

    if (contact.phone) properties.phone = contact.phone
    if (contact.jobTitle) properties.jobtitle = contact.jobTitle
    if (contact.company) properties.company = contact.company
    if (contact.lifecycleStage) properties.lifecyclestage = contact.lifecycleStage
    if (contact.leadStatus) properties.hs_lead_status = contact.leadStatus

    const result = await this.request<{ id: string }>('/crm/v3/objects/contacts', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    })

    return result.id
  }

  // Create a company
  async createCompany(company: Partial<Company>): Promise<string> {
    const properties: Record<string, string | number> = {
      name: company.name!,
      domain: company.domain!,
    }

    if (company.industry) properties.industry = company.industry
    if (company.employeeCount) properties.numberofemployees = company.employeeCount
    if (company.annualRevenue) properties.annualrevenue = company.annualRevenue
    if (company.type) properties.type = company.type

    const result = await this.request<{ id: string }>('/crm/v3/objects/companies', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    })

    return result.id
  }

  // Create a deal
  async createDeal(deal: Partial<Deal>): Promise<string> {
    const properties: Record<string, string | number> = {
      dealname: deal.name!,
      amount: deal.amount!,
      dealstage: deal.stage!,
    }

    if (deal.pipeline) properties.pipeline = deal.pipeline
    if (deal.closeDate) properties.closedate = deal.closeDate.toISOString().split('T')[0]
    if (deal.probability) properties.hs_deal_stage_probability = deal.probability

    const result = await this.request<{ id: string }>('/crm/v3/objects/deals', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    })

    return result.id
  }

  // Create a ticket
  async createTicket(ticket: Partial<Ticket>): Promise<string> {
    const statusMap: Record<string, string> = {
      new: '1',
      waiting: '2',
      in_progress: '3',
      closed: '4',
    }

    const priorityMap: Record<string, string> = {
      low: 'LOW',
      medium: 'MEDIUM',
      high: 'HIGH',
      urgent: 'URGENT',
    }

    const properties: Record<string, string | number> = {
      subject: ticket.subject!,
      content: ticket.description!,
      hs_pipeline: '0',
      hs_pipeline_stage: statusMap[ticket.status!] || '1',
    }

    if (ticket.priority) properties.hs_ticket_priority = priorityMap[ticket.priority]
    if (ticket.category) properties.hs_ticket_category = ticket.category

    const result = await this.request<{ id: string }>('/crm/v3/objects/tickets', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    })

    return result.id
  }

  // Create an engagement (activity)
  async createEngagement(
    activity: Partial<Activity>,
    associations?: { contactIds?: string[]; companyIds?: string[]; dealIds?: string[] }
  ): Promise<string> {
    const engagementTypeMap: Record<string, string> = {
      call: 'CALL',
      email: 'EMAIL',
      meeting: 'MEETING',
      note: 'NOTE',
      task: 'TASK',
    }

    const engagementType = engagementTypeMap[activity.type!]

    const engagement: Record<string, unknown> = {
      type: engagementType,
      timestamp: activity.timestamp?.getTime() || Date.now(),
    }

    const metadata: Record<string, unknown> = {}

    switch (activity.type) {
      case 'call':
        metadata.body = activity.body
        metadata.durationMilliseconds = (activity.duration || 0) * 60 * 1000
        metadata.status = 'COMPLETED'
        if (activity.outcome) metadata.disposition = activity.outcome
        break
      case 'email':
        metadata.subject = activity.subject
        metadata.text = activity.body
        break
      case 'meeting':
        metadata.title = activity.subject
        metadata.body = activity.body
        metadata.startTime = activity.timestamp?.getTime()
        metadata.endTime = (activity.timestamp?.getTime() || 0) + (activity.duration || 30) * 60 * 1000
        break
      case 'note':
        metadata.body = activity.body
        break
      case 'task':
        metadata.subject = activity.subject
        metadata.body = activity.body
        metadata.status = 'COMPLETED'
        break
    }

    const associationsPayload: Record<string, number[]> = {}
    if (associations?.contactIds?.length) {
      associationsPayload.contactIds = associations.contactIds.map(id => parseInt(id))
    }
    if (associations?.companyIds?.length) {
      associationsPayload.companyIds = associations.companyIds.map(id => parseInt(id))
    }
    if (associations?.dealIds?.length) {
      associationsPayload.dealIds = associations.dealIds.map(id => parseInt(id))
    }

    const result = await this.request<{ engagement: { id: string } }>(
      '/engagements/v1/engagements',
      {
        method: 'POST',
        body: JSON.stringify({
          engagement,
          metadata,
          associations: associationsPayload,
        }),
      }
    )

    return result.engagement.id
  }

  // Create association between records
  async createAssociation(
    fromObjectType: string,
    fromId: string,
    toObjectType: string,
    toId: string,
    associationType: string
  ): Promise<void> {
    await this.request(
      `/crm/v4/objects/${fromObjectType}/${fromId}/associations/${toObjectType}/${toId}`,
      {
        method: 'PUT',
        body: JSON.stringify([
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: this.getAssociationTypeId(fromObjectType, toObjectType, associationType),
          },
        ]),
      }
    )
  }

  private getAssociationTypeId(from: string, to: string, type: string): number {
    // HubSpot's standard association type IDs
    const associations: Record<string, number> = {
      'contact_to_company': 1,
      'company_to_contact': 2,
      'deal_to_contact': 3,
      'contact_to_deal': 4,
      'deal_to_company': 5,
      'company_to_deal': 6,
      'ticket_to_contact': 15,
      'contact_to_ticket': 16,
      'ticket_to_company': 25,
      'company_to_ticket': 26,
    }

    const key = `${from}_to_${to}`
    return associations[key] || 1
  }

  // Batch create contacts
  async batchCreateContacts(contacts: Partial<Contact>[]): Promise<string[]> {
    const inputs = contacts.map(contact => ({
      properties: {
        email: contact.email!,
        firstname: contact.firstName!,
        lastname: contact.lastName!,
        phone: contact.phone || '',
        jobtitle: contact.jobTitle || '',
        company: contact.company || '',
        lifecyclestage: contact.lifecycleStage || 'lead',
      },
    }))

    const result = await this.request<{ results: { id: string }[] }>(
      '/crm/v3/objects/contacts/batch/create',
      {
        method: 'POST',
        body: JSON.stringify({ inputs }),
      }
    )

    return result.results.map(r => r.id)
  }

  // Batch create companies
  async batchCreateCompanies(companies: Partial<Company>[]): Promise<string[]> {
    const inputs = companies.map(company => ({
      properties: {
        name: company.name!,
        domain: company.domain!,
        industry: company.industry || '',
        numberofemployees: company.employeeCount?.toString() || '',
        annualrevenue: company.annualRevenue?.toString() || '',
        type: company.type || 'prospect',
      },
    }))

    const result = await this.request<{ results: { id: string }[] }>(
      '/crm/v3/objects/companies/batch/create',
      {
        method: 'POST',
        body: JSON.stringify({ inputs }),
      }
    )

    return result.results.map(r => r.id)
  }

  // Batch create deals
  async batchCreateDeals(deals: Partial<Deal>[]): Promise<string[]> {
    const inputs = deals.map(deal => ({
      properties: {
        dealname: deal.name!,
        amount: deal.amount?.toString() || '0',
        dealstage: deal.stage || 'appointmentscheduled',
        closedate: deal.closeDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      },
    }))

    const result = await this.request<{ results: { id: string }[] }>(
      '/crm/v3/objects/deals/batch/create',
      {
        method: 'POST',
        body: JSON.stringify({ inputs }),
      }
    )

    return result.results.map(r => r.id)
  }

  // Get default pipeline
  async getDefaultPipeline(): Promise<string> {
    const result = await this.request<{ results: { id: string }[] }>(
      '/crm/v3/pipelines/deals'
    )

    return result.results[0]?.id || 'default'
  }
}

// Calculate realistic timestamps based on distribution and timeframe
export function calculateTimestamp(
  distributionType: string,
  timeframeDays: number,
  progress: number // 0 to 1
): Date {
  const now = new Date()
  let daysAgo: number

  switch (distributionType) {
    case 'steady':
      // Linear distribution
      daysAgo = timeframeDays * (1 - progress)
      break

    case 'growth':
      // Exponential - more records toward the end
      daysAgo = timeframeDays * Math.pow(1 - progress, 2)
      break

    case 'decline':
      // Inverse exponential - more records at the start
      daysAgo = timeframeDays * (1 - Math.pow(progress, 2))
      break

    case 'seasonal':
      // Sine wave pattern
      const wave = Math.sin(progress * Math.PI * 4) * 0.3 + 0.7
      daysAgo = timeframeDays * (1 - progress * wave)
      break

    case 'burst':
      // Concentrated bursts
      const burstPhase = Math.floor(progress * 4)
      const burstProgress = (progress * 4) % 1
      daysAgo = timeframeDays * ((3 - burstPhase + burstProgress * 0.2) / 4)
      break

    default:
      daysAgo = timeframeDays * (1 - progress)
  }

  // Add some randomness (up to 12 hours)
  const randomHours = Math.random() * 12
  const timestamp = new Date(now.getTime() - (daysAgo * 24 + randomHours) * 60 * 60 * 1000)

  return timestamp
}

// Get timeframe in days
export function getTimeframeDays(timeframe: string): number {
  const map: Record<string, number> = {
    '30_days': 30,
    '90_days': 90,
    '6_months': 180,
    '1_year': 365,
    '2_years': 730,
  }
  return map[timeframe] || 180
}

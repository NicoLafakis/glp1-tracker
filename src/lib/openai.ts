import OpenAI from 'openai'
import type { BusinessType, SalesStyle, Contact, Company, Deal, Ticket, Activity } from '@/types'

// Initialize OpenAI client - will use OPENAI_API_KEY env var
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Model selection based on task complexity
const MODELS = {
  // Complex theme/scenario generation
  FULL: 'gpt-4.1',
  // Standard record generation
  STANDARD: 'gpt-4.1-mini',
  // Simple/high-volume fields
  FAST: 'gpt-4.1-nano',
} as const

// Business context for themed generation
interface BusinessContext {
  businessType: BusinessType
  businessName: string
  salesStyle: SalesStyle
  industry: string
  existingCompanyNames: string[]
  existingContactEmails: string[]
  existingDealNames: string[]
}

// Function schemas for structured output
const contactSchema = {
  type: 'function' as const,
  function: {
    name: 'create_contacts',
    description: 'Generate realistic contact records for the CRM',
    parameters: {
      type: 'object',
      properties: {
        contacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              firstName: { type: 'string', description: 'Realistic first name' },
              lastName: { type: 'string', description: 'Realistic last name' },
              email: { type: 'string', description: 'Professional email address' },
              phone: { type: 'string', description: 'Phone number in E.164 format' },
              jobTitle: { type: 'string', description: 'Job title appropriate for the industry' },
              company: { type: 'string', description: 'Company name (should match existing companies when possible)' },
              lifecycleStage: {
                type: 'string',
                enum: ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'],
              },
              leadSource: { type: 'string', description: 'How they found the business' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
            },
            required: ['firstName', 'lastName', 'email', 'jobTitle', 'lifecycleStage'],
          },
        },
      },
      required: ['contacts'],
    },
  },
}

const companySchema = {
  type: 'function' as const,
  function: {
    name: 'create_companies',
    description: 'Generate realistic company records for the CRM',
    parameters: {
      type: 'object',
      properties: {
        companies: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Realistic company name for the industry' },
              domain: { type: 'string', description: 'Company website domain' },
              industry: { type: 'string', description: 'Industry classification' },
              employeeCount: { type: 'number', description: 'Approximate number of employees' },
              annualRevenue: { type: 'number', description: 'Approximate annual revenue in USD' },
              type: {
                type: 'string',
                enum: ['prospect', 'partner', 'reseller', 'vendor', 'customer'],
              },
              description: { type: 'string', description: 'Brief company description' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              linkedinUrl: { type: 'string', description: 'LinkedIn company page URL' },
            },
            required: ['name', 'domain', 'industry', 'type'],
          },
        },
      },
      required: ['companies'],
    },
  },
}

const dealSchema = {
  type: 'function' as const,
  function: {
    name: 'create_deals',
    description: 'Generate realistic deal/opportunity records for the CRM',
    parameters: {
      type: 'object',
      properties: {
        deals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Deal name (typically Company - Product/Service)' },
              amount: { type: 'number', description: 'Deal value in USD' },
              stage: {
                type: 'string',
                enum: ['appointmentscheduled', 'qualifiedtobuy', 'presentationscheduled', 'decisionmakerboughtin', 'contractsent', 'closedwon', 'closedlost'],
              },
              probability: { type: 'number', description: 'Win probability 0-100' },
              dealType: { type: 'string', enum: ['newbusiness', 'existingbusiness'] },
              description: { type: 'string', description: 'Brief deal description' },
              lossReason: { type: 'string', description: 'If closed lost, why' },
            },
            required: ['name', 'amount', 'stage', 'probability'],
          },
        },
      },
      required: ['deals'],
    },
  },
}

const ticketSchema = {
  type: 'function' as const,
  function: {
    name: 'create_tickets',
    description: 'Generate realistic support ticket records for the CRM',
    parameters: {
      type: 'object',
      properties: {
        tickets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              subject: { type: 'string', description: 'Ticket subject line' },
              description: { type: 'string', description: 'Detailed ticket description' },
              status: {
                type: 'string',
                enum: ['new', 'waiting', 'in_progress', 'closed'],
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
              },
              category: { type: 'string', description: 'Ticket category' },
              resolution: { type: 'string', description: 'If closed, how it was resolved' },
            },
            required: ['subject', 'description', 'status', 'priority'],
          },
        },
      },
      required: ['tickets'],
    },
  },
}

const activitySchema = {
  type: 'function' as const,
  function: {
    name: 'create_activities',
    description: 'Generate realistic activity records (calls, emails, meetings, notes)',
    parameters: {
      type: 'object',
      properties: {
        activities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['call', 'email', 'meeting', 'note', 'task'],
              },
              subject: { type: 'string', description: 'Activity subject/title' },
              body: { type: 'string', description: 'Activity content/notes' },
              duration: { type: 'number', description: 'Duration in minutes (for calls/meetings)' },
              outcome: { type: 'string', description: 'Outcome of the activity' },
              direction: { type: 'string', enum: ['inbound', 'outbound'], description: 'For calls/emails' },
            },
            required: ['type', 'subject', 'body'],
          },
        },
      },
      required: ['activities'],
    },
  },
}

// Build the system prompt for themed generation
function buildSystemPrompt(context: BusinessContext): string {
  const salesStyleDescriptions: Record<SalesStyle, string> = {
    inbound: 'leads primarily come through content marketing, SEO, and word of mouth',
    outbound: 'sales team actively prospects and reaches out to potential customers',
    hybrid: 'combination of inbound marketing and outbound sales efforts',
    plg: 'product-led growth where users self-serve and upgrade based on product usage',
    enterprise: 'complex sales cycles targeting large organizations with multiple stakeholders',
    smb: 'high-velocity sales targeting small and medium businesses with shorter cycles',
  }

  const businessTypeDescriptions: Record<BusinessType, string> = {
    saas: 'B2B software-as-a-service company selling subscription-based software',
    ecommerce: 'online retail business selling products directly to consumers',
    agency: 'professional services agency providing creative, marketing, or technical services',
    real_estate: 'real estate company dealing with property sales, rentals, or development',
    healthcare: 'healthcare organization providing medical services or health technology',
    finance: 'financial services company offering banking, investment, or insurance products',
    manufacturing: 'manufacturing company producing and selling physical goods',
    education: 'educational institution or edtech company providing learning services',
    consulting: 'consulting firm providing business advisory and professional services',
    nonprofit: 'nonprofit organization focused on charitable or social causes',
  }

  return `You are generating realistic CRM data for a ${businessTypeDescriptions[context.businessType]}.

Business Context:
- Company Name: ${context.businessName}
- Industry: ${context.industry}
- Sales Approach: ${salesStyleDescriptions[context.salesStyle]}

CRITICAL RULES:
1. ALL data must look completely realistic - as if it came from a real business
2. Names should be diverse and realistic (mix of ethnicities, genders)
3. Email addresses should use realistic domains (not example.com)
4. Company names should sound like real businesses in the ${context.industry} industry
5. Job titles should be appropriate for the industry and company size
6. Deal amounts should be realistic for the business type
7. NEVER duplicate any of these existing records:
   - Existing company names: ${context.existingCompanyNames.slice(-20).join(', ') || 'None yet'}
   - Existing emails: ${context.existingContactEmails.slice(-20).join(', ') || 'None yet'}
   - Existing deal names: ${context.existingDealNames.slice(-20).join(', ') || 'None yet'}

Generate data that tells a coherent story of a real business operation.`
}

// Generate contacts
export async function generateContacts(
  context: BusinessContext,
  count: number,
  batchSize: number = 10
): Promise<Partial<Contact>[]> {
  const results: Partial<Contact>[] = []

  for (let i = 0; i < count; i += batchSize) {
    const currentBatch = Math.min(batchSize, count - i)

    const response = await openai.chat.completions.create({
      model: MODELS.STANDARD,
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        {
          role: 'user',
          content: `Generate ${currentBatch} unique, realistic contact records for this ${context.businessType} business.

Ensure a realistic distribution of:
- Lifecycle stages (more leads than customers, some MQLs/SQLs)
- Job titles appropriate for decision makers and users
- Mix of company sizes and types
- Geographic diversity

Each contact should feel like a real person who would interact with this business.`,
        },
      ],
      tools: [contactSchema],
      tool_choice: { type: 'function', function: { name: 'create_contacts' } },
      temperature: 0.8,
    })

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments)
      results.push(...parsed.contacts)

      // Update context with new emails to prevent duplicates
      context.existingContactEmails.push(
        ...parsed.contacts.map((c: { email: string }) => c.email)
      )
    }
  }

  return results
}

// Generate companies
export async function generateCompanies(
  context: BusinessContext,
  count: number,
  batchSize: number = 10
): Promise<Partial<Company>[]> {
  const results: Partial<Company>[] = []

  for (let i = 0; i < count; i += batchSize) {
    const currentBatch = Math.min(batchSize, count - i)

    const response = await openai.chat.completions.create({
      model: MODELS.STANDARD,
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        {
          role: 'user',
          content: `Generate ${currentBatch} unique, realistic company records that would be customers/prospects of this ${context.businessType} business.

Ensure variety in:
- Company sizes (startups to enterprises)
- Company types (prospects, customers, partners)
- Industries that would buy from a ${context.businessType}
- Geographic locations

Each company should have a believable name and realistic revenue/employee figures.`,
        },
      ],
      tools: [companySchema],
      tool_choice: { type: 'function', function: { name: 'create_companies' } },
      temperature: 0.8,
    })

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments)
      results.push(...parsed.companies)

      // Update context with new company names
      context.existingCompanyNames.push(
        ...parsed.companies.map((c: { name: string }) => c.name)
      )
    }
  }

  return results
}

// Generate deals
export async function generateDeals(
  context: BusinessContext,
  count: number,
  companyNames: string[],
  batchSize: number = 10
): Promise<Partial<Deal>[]> {
  const results: Partial<Deal>[] = []

  for (let i = 0; i < count; i += batchSize) {
    const currentBatch = Math.min(batchSize, count - i)
    const relevantCompanies = companyNames.slice(i, i + currentBatch * 2)

    const response = await openai.chat.completions.create({
      model: MODELS.STANDARD,
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        {
          role: 'user',
          content: `Generate ${currentBatch} unique, realistic deal/opportunity records for this ${context.businessType} business.

Use these company names for the deals: ${relevantCompanies.join(', ')}

Ensure realistic distribution of:
- Deal stages (most in early stages, fewer closed won/lost)
- Deal amounts appropriate for ${context.businessType} (${context.salesStyle} sales model)
- Win probabilities that match the stage
- Mix of new business and existing business deals

Deal names should follow format: "Company Name - Product/Service Type"`,
        },
      ],
      tools: [dealSchema],
      tool_choice: { type: 'function', function: { name: 'create_deals' } },
      temperature: 0.7,
    })

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments)
      results.push(...parsed.deals)

      context.existingDealNames.push(
        ...parsed.deals.map((d: { name: string }) => d.name)
      )
    }
  }

  return results
}

// Generate tickets
export async function generateTickets(
  context: BusinessContext,
  count: number,
  batchSize: number = 10
): Promise<Partial<Ticket>[]> {
  const results: Partial<Ticket>[] = []

  for (let i = 0; i < count; i += batchSize) {
    const currentBatch = Math.min(batchSize, count - i)

    const response = await openai.chat.completions.create({
      model: MODELS.STANDARD,
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        {
          role: 'user',
          content: `Generate ${currentBatch} realistic support ticket records for this ${context.businessType} business.

Tickets should reflect real issues customers would have:
- Product/service questions
- Technical issues
- Billing inquiries
- Feature requests
- Complaints

Distribution: Most should be closed, some in progress, few new/waiting.
Priority: Mostly low/medium, occasional high, rare urgent.`,
        },
      ],
      tools: [ticketSchema],
      tool_choice: { type: 'function', function: { name: 'create_tickets' } },
      temperature: 0.8,
    })

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments)
      results.push(...parsed.tickets)
    }
  }

  return results
}

// Generate activities for a record
export async function generateActivities(
  context: BusinessContext,
  recordType: 'contact' | 'company' | 'deal',
  recordName: string,
  count: number
): Promise<Partial<Activity>[]> {
  const response = await openai.chat.completions.create({
    model: MODELS.FAST, // Use nano for high-volume activity generation
    messages: [
      { role: 'system', content: buildSystemPrompt(context) },
      {
        role: 'user',
        content: `Generate ${count} realistic activity records (calls, emails, meetings, notes) for a ${recordType} named "${recordName}" in this ${context.businessType} business.

Activities should tell a story of the relationship:
- Initial outreach or inbound inquiry
- Follow-up conversations
- Meetings and demos
- Internal notes about the account
- Tasks for follow-up

Make the content realistic and specific to ${context.businessType}.`,
      },
    ],
    tools: [activitySchema],
    tool_choice: { type: 'function', function: { name: 'create_activities' } },
    temperature: 0.9,
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (toolCall?.function?.arguments) {
    const parsed = JSON.parse(toolCall.function.arguments)
    return parsed.activities
  }

  return []
}

// Generate a themed business name based on business type
export async function generateBusinessName(businessType: BusinessType): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODELS.FAST,
    messages: [
      {
        role: 'user',
        content: `Generate a single realistic, professional business name for a ${businessType} company. Just the name, nothing else.`,
      },
    ],
    temperature: 0.9,
    max_tokens: 50,
  })

  return response.choices[0]?.message?.content?.trim() || 'Acme Corp'
}

// Create the business context object
export function createBusinessContext(
  businessType: BusinessType,
  businessName: string,
  salesStyle: SalesStyle
): BusinessContext {
  const industryMap: Record<BusinessType, string> = {
    saas: 'Software & Technology',
    ecommerce: 'Retail & E-commerce',
    agency: 'Professional Services',
    real_estate: 'Real Estate',
    healthcare: 'Healthcare & Medical',
    finance: 'Financial Services',
    manufacturing: 'Manufacturing',
    education: 'Education & Training',
    consulting: 'Business Consulting',
    nonprofit: 'Nonprofit & Social Services',
  }

  return {
    businessType,
    businessName,
    salesStyle,
    industry: industryMap[businessType],
    existingCompanyNames: [],
    existingContactEmails: [],
    existingDealNames: [],
  }
}

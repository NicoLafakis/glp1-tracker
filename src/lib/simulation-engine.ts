import type { SimulationConfig } from '@/types'
import {
  generateContacts,
  generateCompanies,
  generateDeals,
  generateTickets,
  generateActivities,
  createBusinessContext,
} from './openai'
import {
  HubSpotClient,
  calculateTimestamp,
  getTimeframeDays,
} from './hubspot'

export interface SimulationCallbacks {
  onProgress: (phase: string, current: number, total: number, recordName?: string) => void
  onLog: (message: string) => void
  onError: (error: string) => void
  onComplete: () => void
}

export interface SimulationState {
  isPaused: boolean
  isCancelled: boolean
}

export class SimulationEngine {
  private config: SimulationConfig
  private hubspot: HubSpotClient
  private callbacks: SimulationCallbacks
  private state: SimulationState

  // Track created records
  private createdCompanies: { id: string; name: string }[] = []
  private createdContacts: { id: string; email: string; name: string }[] = []
  private createdDeals: { id: string; name: string }[] = []
  private createdTickets: { id: string; subject: string }[] = []

  constructor(
    config: SimulationConfig,
    accessToken: string,
    callbacks: SimulationCallbacks
  ) {
    this.config = config
    this.hubspot = new HubSpotClient(accessToken)
    this.callbacks = callbacks
    this.state = { isPaused: false, isCancelled: false }
  }

  pause() {
    this.state.isPaused = true
    this.callbacks.onLog('Simulation paused')
  }

  resume() {
    this.state.isPaused = false
    this.callbacks.onLog('Simulation resumed')
  }

  cancel() {
    this.state.isCancelled = true
    this.callbacks.onLog('Simulation cancelled')
  }

  private async waitWhilePaused(): Promise<boolean> {
    while (this.state.isPaused && !this.state.isCancelled) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    return !this.state.isCancelled
  }

  async run(): Promise<void> {
    const context = createBusinessContext(
      this.config.businessType,
      this.config.businessName,
      this.config.salesStyle
    )

    const timeframeDays = getTimeframeDays(this.config.timeFrame)
    const totalRecords =
      this.config.recordCounts.companies +
      this.config.recordCounts.contacts +
      this.config.recordCounts.deals +
      this.config.recordCounts.tickets

    let completedRecords = 0

    try {
      // Phase 1: Generate and create companies
      this.callbacks.onLog('Starting company generation...')
      this.callbacks.onProgress('companies', 0, this.config.recordCounts.companies)

      const companyData = await generateCompanies(
        context,
        this.config.recordCounts.companies
      )

      for (let i = 0; i < companyData.length; i++) {
        if (!(await this.waitWhilePaused())) return

        const company = companyData[i]
        try {
          // Add timestamp
          const timestamp = calculateTimestamp(
            this.config.distributionType,
            timeframeDays,
            i / companyData.length
          )

          const companyId = await this.hubspot.createCompany({
            ...company,
            createdAt: timestamp,
            lastModified: timestamp,
          })

          this.createdCompanies.push({ id: companyId, name: company.name! })
          completedRecords++

          this.callbacks.onProgress(
            'companies',
            i + 1,
            this.config.recordCounts.companies,
            company.name
          )
          this.callbacks.onLog(`Created company: ${company.name}`)
        } catch (error) {
          this.callbacks.onError(`Failed to create company ${company.name}: ${error}`)
        }

        // Rate limiting - HubSpot allows 100 requests per 10 seconds
        if ((i + 1) % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Phase 2: Generate and create contacts
      this.callbacks.onLog('Starting contact generation...')
      this.callbacks.onProgress('contacts', 0, this.config.recordCounts.contacts)

      const contactData = await generateContacts(
        context,
        this.config.recordCounts.contacts
      )

      for (let i = 0; i < contactData.length; i++) {
        if (!(await this.waitWhilePaused())) return

        const contact = contactData[i]
        try {
          const timestamp = calculateTimestamp(
            this.config.distributionType,
            timeframeDays,
            i / contactData.length
          )

          // Assign to a random company if available
          if (this.createdCompanies.length > 0 && Math.random() > 0.2) {
            const randomCompany =
              this.createdCompanies[
                Math.floor(Math.random() * this.createdCompanies.length)
              ]
            contact.company = randomCompany.name
          }

          const contactId = await this.hubspot.createContact({
            ...contact,
            createdAt: timestamp,
            lastModified: timestamp,
          })

          this.createdContacts.push({
            id: contactId,
            email: contact.email!,
            name: `${contact.firstName} ${contact.lastName}`,
          })
          completedRecords++

          this.callbacks.onProgress(
            'contacts',
            i + 1,
            this.config.recordCounts.contacts,
            `${contact.firstName} ${contact.lastName}`
          )
          this.callbacks.onLog(`Created contact: ${contact.firstName} ${contact.lastName}`)

          // Create association with company if applicable
          if (contact.company) {
            const company = this.createdCompanies.find(c => c.name === contact.company)
            if (company) {
              await this.hubspot.createAssociation(
                'contacts',
                contactId,
                'companies',
                company.id,
                'contact_to_company'
              )
            }
          }
        } catch (error) {
          this.callbacks.onError(`Failed to create contact ${contact.email}: ${error}`)
        }

        if ((i + 1) % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Phase 3: Generate and create deals
      this.callbacks.onLog('Starting deal generation...')
      this.callbacks.onProgress('deals', 0, this.config.recordCounts.deals)

      const dealData = await generateDeals(
        context,
        this.config.recordCounts.deals,
        this.createdCompanies.map(c => c.name)
      )

      for (let i = 0; i < dealData.length; i++) {
        if (!(await this.waitWhilePaused())) return

        const deal = dealData[i]
        try {
          const createdTimestamp = calculateTimestamp(
            this.config.distributionType,
            timeframeDays,
            i / dealData.length
          )

          // Calculate close date based on stage
          const daysToClose = deal.stage?.includes('closed') ? 0 : Math.floor(Math.random() * 60) + 15
          const closeDate = new Date(createdTimestamp.getTime() + daysToClose * 24 * 60 * 60 * 1000)

          const dealId = await this.hubspot.createDeal({
            ...deal,
            closeDate,
            createdAt: createdTimestamp,
            lastModified: createdTimestamp,
          })

          this.createdDeals.push({ id: dealId, name: deal.name! })
          completedRecords++

          this.callbacks.onProgress(
            'deals',
            i + 1,
            this.config.recordCounts.deals,
            deal.name
          )
          this.callbacks.onLog(`Created deal: ${deal.name}`)

          // Associate with a company
          if (this.createdCompanies.length > 0) {
            const randomCompany =
              this.createdCompanies[Math.floor(Math.random() * this.createdCompanies.length)]
            await this.hubspot.createAssociation(
              'deals',
              dealId,
              'companies',
              randomCompany.id,
              'deal_to_company'
            )

            // Also associate with a contact from that company or random
            if (this.createdContacts.length > 0) {
              const randomContact =
                this.createdContacts[Math.floor(Math.random() * this.createdContacts.length)]
              await this.hubspot.createAssociation(
                'deals',
                dealId,
                'contacts',
                randomContact.id,
                'deal_to_contact'
              )
            }
          }
        } catch (error) {
          this.callbacks.onError(`Failed to create deal ${deal.name}: ${error}`)
        }

        if ((i + 1) % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Phase 4: Generate and create tickets
      if (this.config.recordCounts.tickets > 0) {
        this.callbacks.onLog('Starting ticket generation...')
        this.callbacks.onProgress('tickets', 0, this.config.recordCounts.tickets)

        const ticketData = await generateTickets(
          context,
          this.config.recordCounts.tickets
        )

        for (let i = 0; i < ticketData.length; i++) {
          if (!(await this.waitWhilePaused())) return

          const ticket = ticketData[i]
          try {
            const timestamp = calculateTimestamp(
              this.config.distributionType,
              timeframeDays,
              i / ticketData.length
            )

            const ticketId = await this.hubspot.createTicket({
              ...ticket,
              createdAt: timestamp,
              lastModified: timestamp,
            })

            this.createdTickets.push({ id: ticketId, subject: ticket.subject! })
            completedRecords++

            this.callbacks.onProgress(
              'tickets',
              i + 1,
              this.config.recordCounts.tickets,
              ticket.subject
            )
            this.callbacks.onLog(`Created ticket: ${ticket.subject}`)

            // Associate with a contact
            if (this.createdContacts.length > 0) {
              const randomContact =
                this.createdContacts[Math.floor(Math.random() * this.createdContacts.length)]
              await this.hubspot.createAssociation(
                'tickets',
                ticketId,
                'contacts',
                randomContact.id,
                'ticket_to_contact'
              )
            }
          } catch (error) {
            this.callbacks.onError(`Failed to create ticket ${ticket.subject}: ${error}`)
          }

          if ((i + 1) % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }

      // Phase 5: Generate activities for records
      if (this.config.options.includeActivities) {
        this.callbacks.onLog('Generating activities...')

        const totalActivities =
          this.createdContacts.length * 2 +
          this.createdDeals.length * 3

        let activityCount = 0

        // Create activities for contacts
        for (const contact of this.createdContacts.slice(0, 50)) {
          if (!(await this.waitWhilePaused())) return

          try {
            const activities = await generateActivities(
              context,
              'contact',
              contact.name,
              2
            )

            for (const activity of activities) {
              const timestamp = new Date(
                Date.now() - Math.random() * timeframeDays * 24 * 60 * 60 * 1000
              )

              await this.hubspot.createEngagement(
                { ...activity, timestamp },
                { contactIds: [contact.id] }
              )
              activityCount++
            }

            this.callbacks.onProgress('activities', activityCount, totalActivities, contact.name)
          } catch (error) {
            this.callbacks.onError(`Failed to create activities for ${contact.name}: ${error}`)
          }
        }

        // Create activities for deals
        for (const deal of this.createdDeals.slice(0, 30)) {
          if (!(await this.waitWhilePaused())) return

          try {
            const activities = await generateActivities(
              context,
              'deal',
              deal.name,
              3
            )

            for (const activity of activities) {
              const timestamp = new Date(
                Date.now() - Math.random() * timeframeDays * 24 * 60 * 60 * 1000
              )

              await this.hubspot.createEngagement(
                { ...activity, timestamp },
                { dealIds: [deal.id] }
              )
              activityCount++
            }

            this.callbacks.onProgress('activities', activityCount, totalActivities, deal.name)
          } catch (error) {
            this.callbacks.onError(`Failed to create activities for ${deal.name}: ${error}`)
          }
        }
      }

      this.callbacks.onLog('Simulation complete!')
      this.callbacks.onComplete()
    } catch (error) {
      this.callbacks.onError(`Simulation failed: ${error}`)
      throw error
    }
  }

  getStats() {
    return {
      companies: this.createdCompanies.length,
      contacts: this.createdContacts.length,
      deals: this.createdDeals.length,
      tickets: this.createdTickets.length,
    }
  }
}

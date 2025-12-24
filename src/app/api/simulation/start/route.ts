import { NextRequest, NextResponse } from 'next/server'
import type { SimulationConfig } from '@/types'

export async function POST(request: NextRequest) {
  const connectionCookie = request.cookies.get('hubspot_connection')?.value

  if (!connectionCookie) {
    return NextResponse.json(
      { error: 'HubSpot not connected' },
      { status: 401 }
    )
  }

  try {
    const connection = JSON.parse(connectionCookie)
    const config: SimulationConfig = await request.json()

    // Validate config
    if (!config.businessType || !config.salesStyle || !config.distributionType || !config.timeFrame) {
      return NextResponse.json(
        { error: 'Invalid simulation configuration' },
        { status: 400 }
      )
    }

    // Calculate total records
    const totalRecords =
      config.recordCounts.contacts +
      config.recordCounts.companies +
      config.recordCounts.deals +
      config.recordCounts.tickets

    // Return simulation ID and access token for client-side execution
    // In a production app, you'd queue this as a background job
    return NextResponse.json({
      success: true,
      simulationId: `sim_${Date.now()}`,
      accessToken: connection.accessToken,
      totalRecords,
      config,
    })
  } catch (error) {
    console.error('Error starting simulation:', error)
    return NextResponse.json(
      { error: 'Failed to start simulation' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear the HubSpot connection cookie
  response.cookies.delete('hubspot_connection')

  return response
}

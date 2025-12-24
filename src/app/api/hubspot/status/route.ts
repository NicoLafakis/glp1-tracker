import { NextRequest, NextResponse } from 'next/server'
import { refreshAccessToken } from '@/lib/hubspot'

export async function GET(request: NextRequest) {
  const connectionCookie = request.cookies.get('hubspot_connection')?.value

  if (!connectionCookie) {
    return NextResponse.json({
      connected: false,
      portalId: null,
    })
  }

  try {
    const connection = JSON.parse(connectionCookie)

    // Check if token is expired or will expire soon
    const isExpiringSoon = connection.expiresAt < Date.now() + 5 * 60 * 1000

    if (isExpiringSoon && connection.refreshToken) {
      // Refresh the token
      const newTokens = await refreshAccessToken(connection.refreshToken)

      const updatedConnection = {
        ...connection,
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresAt: Date.now() + newTokens.expiresIn * 1000,
      }

      const response = NextResponse.json({
        connected: true,
        portalId: connection.portalId,
      })

      response.cookies.set('hubspot_connection', JSON.stringify(updatedConnection), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      })

      return response
    }

    return NextResponse.json({
      connected: true,
      portalId: connection.portalId,
    })
  } catch (error) {
    console.error('Error checking HubSpot status:', error)
    return NextResponse.json({
      connected: false,
      portalId: null,
      error: 'Failed to verify connection',
    })
  }
}

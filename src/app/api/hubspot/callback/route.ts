import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, getPortalInfo } from '@/lib/hubspot'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Check for errors from HubSpot
  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  // Verify state token
  const storedState = request.cookies.get('hubspot_oauth_state')?.value
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL('/?error=invalid_state', request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=no_code', request.url)
    )
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Get portal info
    const portalInfo = await getPortalInfo(tokens.accessToken)

    // Store in session/cookie for now (in production, store in DB with user association)
    const response = NextResponse.redirect(new URL('/?connected=true', request.url))

    // Store connection info in an encrypted cookie
    const connectionData = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
      portalId: portalInfo.portalId,
    }

    response.cookies.set('hubspot_connection', JSON.stringify(connectionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    // Clear the state cookie
    response.cookies.delete('hubspot_oauth_state')

    return response
  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('Failed to connect')}`, request.url)
    )
  }
}

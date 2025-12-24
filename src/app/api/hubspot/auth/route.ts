import { NextResponse } from 'next/server'
import { getOAuthUrl } from '@/lib/hubspot'
import { randomBytes } from 'crypto'

export async function GET() {
  // Generate a state token for CSRF protection
  const state = randomBytes(16).toString('hex')

  // Store state in a cookie for verification on callback
  const authUrl = getOAuthUrl(state)

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('hubspot_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  })

  return response
}

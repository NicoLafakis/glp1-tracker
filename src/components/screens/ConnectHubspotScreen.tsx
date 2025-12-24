'use client'

import React, { useState, useEffect } from 'react'

interface ConnectHubspotScreenProps {
  isConnected: boolean
  portalId: string | null
  onConnect: () => void
  onDisconnect: () => void
  onBack: () => void
}

export function ConnectHubspotScreen({
  isConnected,
  portalId,
  onConnect,
  onDisconnect,
  onBack,
}: ConnectHubspotScreenProps) {
  const [frame, setFrame] = useState(0)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % 4), 300)
    return () => clearInterval(interval)
  }, [])

  const handleConnect = () => {
    setConnecting(true)
    onConnect()
  }

  const orbFrames = ['○', '◔', '◑', '◕']

  return (
    <div className="w-full h-full flex flex-col p-4 pixel-text">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-[10px] text-gb-darkest mb-1">HUBSPOT CONNECTION</h1>
        <div className="w-40 h-0.5 bg-gb-dark mx-auto" />
      </div>

      {/* Connection status display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Animated orb */}
        <div className="mb-6 relative">
          <div
            className={`text-6xl ${isConnected ? 'text-gb-darkest' : 'text-gb-dark'}`}
            style={{ fontFamily: 'monospace' }}
          >
            {isConnected ? '●' : orbFrames[frame]}
          </div>
          {isConnected && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gb-darkest rounded-full flex items-center justify-center">
              <span className="text-gb-lightest text-[8px]">✓</span>
            </div>
          )}
        </div>

        {/* Status text */}
        <div className="text-center mb-4">
          {connecting ? (
            <>
              <div className="text-[10px] text-gb-darkest mb-2">CONNECTING...</div>
              <div className="text-[8px] text-gb-dark">
                Waiting for HubSpot authorization
              </div>
            </>
          ) : isConnected ? (
            <>
              <div className="text-[10px] text-gb-darkest mb-2">CONNECTED</div>
              <div className="text-[8px] text-gb-dark">
                Portal ID: {portalId}
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] text-gb-darkest mb-2">NOT CONNECTED</div>
              <div className="text-[8px] text-gb-dark px-8 text-center leading-relaxed">
                Connect your HubSpot sandbox to start generating data
              </div>
            </>
          )}
        </div>

        {/* Action button */}
        <div className="mt-4">
          {connecting ? (
            <div className="px-6 py-3 bg-gb-dark text-gb-light text-[10px]">
              <span className="loading-dots">WAITING</span>
            </div>
          ) : isConnected ? (
            <button
              onClick={onDisconnect}
              className="px-6 py-3 bg-gb-light text-gb-darkest border-2 border-gb-darkest text-[10px] hover:bg-gb-dark hover:text-gb-lightest hover:border-gb-dark transition-colors"
            >
              DISCONNECT
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="px-6 py-3 bg-gb-darkest text-gb-lightest text-[10px] hover:bg-gb-dark transition-colors"
            >
              CONNECT HUBSPOT
            </button>
          )}
        </div>

        {/* OAuth info */}
        {!isConnected && !connecting && (
          <div className="mt-6 px-6 text-center">
            <div className="text-[7px] text-gb-dark leading-relaxed">
              You will be redirected to HubSpot to authorize this app.
              Use a SANDBOX portal for testing.
            </div>
          </div>
        )}
      </div>

      {/* Required scopes info */}
      <div className="mt-4 p-2 bg-gb-light border border-gb-dark">
        <div className="text-[8px] text-gb-darkest mb-1">REQUIRED PERMISSIONS:</div>
        <div className="text-[7px] text-gb-dark space-y-0.5">
          <div>• crm.objects.contacts.write</div>
          <div>• crm.objects.companies.write</div>
          <div>• crm.objects.deals.write</div>
          <div>• crm.objects.owners.read</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-[8px] text-gb-dark">
        <span>B BACK</span>
        <span>{isConnected ? '' : 'A CONNECT'}</span>
      </div>
    </div>
  )
}

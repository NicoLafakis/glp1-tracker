'use client'

import React, { useEffect, useCallback } from 'react'
import { GameboyShell } from '@/components/game/GameboyShell'
import {
  TitleScreen,
  MenuScreen,
  SelectBusinessScreen,
  SelectSalesStyleScreen,
  SelectDistributionScreen,
  SelectTimeframeScreen,
  SelectRecordsScreen,
  ConfirmScreen,
  SimulationScreen,
  ConnectHubspotScreen,
  CompleteScreen,
} from '@/components/screens'
import { useGameStore } from '@/store/gameStore'
import type { BusinessType, SalesStyle, DistributionType, TimeFrame } from '@/types'

// Menu item indices
const MENU_ITEMS = ['new', 'connect', 'history', 'settings'] as const

// Business types for navigation
const BUSINESS_TYPES: BusinessType[] = [
  'saas', 'ecommerce', 'agency', 'real_estate', 'healthcare',
  'finance', 'manufacturing', 'education', 'consulting', 'nonprofit'
]

const SALES_STYLES: SalesStyle[] = [
  'inbound', 'outbound', 'hybrid', 'plg', 'enterprise', 'smb'
]

const DISTRIBUTION_TYPES: DistributionType[] = [
  'steady', 'growth', 'seasonal', 'burst', 'decline'
]

const TIMEFRAMES: TimeFrame[] = [
  '30_days', '90_days', '6_months', '1_year', '2_years'
]

const RECORD_TYPES = ['contacts', 'companies', 'deals', 'tickets'] as const

export default function Home() {
  const {
    screen,
    setScreen,
    menuIndex,
    setMenuIndex,
    config,
    setBusinessType,
    setSalesStyle,
    setDistributionType,
    setTimeFrame,
    setRecordCount,
    progress,
    updateProgress,
    hubspotConnected,
    hubspotPortalId,
    setHubspotConnection,
    logs,
    addLog,
    clearLogs,
    resetSimulation,
  } = useGameStore()

  // Check HubSpot connection status on mount
  useEffect(() => {
    checkHubspotStatus()
  }, [])

  const checkHubspotStatus = async () => {
    try {
      const response = await fetch('/api/hubspot/status')
      const data = await response.json()
      setHubspotConnection(data.connected, data.portalId)
    } catch (error) {
      console.error('Failed to check HubSpot status:', error)
    }
  }

  // Handle A button press (select/confirm)
  const handleAPress = useCallback(() => {
    switch (screen) {
      case 'title':
        setScreen('menu')
        break

      case 'menu':
        const selectedMenuItem = MENU_ITEMS[menuIndex]
        if (selectedMenuItem === 'new') {
          if (hubspotConnected) {
            setScreen('select_business')
          } else {
            setScreen('connect_hubspot')
          }
        } else if (selectedMenuItem === 'connect') {
          setScreen('connect_hubspot')
        } else if (selectedMenuItem === 'history') {
          // TODO: Implement history screen
          addLog('History feature coming soon!')
        } else if (selectedMenuItem === 'settings') {
          // TODO: Implement settings screen
          addLog('Settings feature coming soon!')
        }
        setMenuIndex(0)
        break

      case 'select_business':
        setBusinessType(BUSINESS_TYPES[menuIndex])
        setMenuIndex(0)
        setScreen('select_sales_style')
        break

      case 'select_sales_style':
        setSalesStyle(SALES_STYLES[menuIndex])
        setMenuIndex(0)
        setScreen('select_distribution')
        break

      case 'select_distribution':
        setDistributionType(DISTRIBUTION_TYPES[menuIndex])
        setMenuIndex(0)
        setScreen('select_timeframe')
        break

      case 'select_timeframe':
        setTimeFrame(TIMEFRAMES[menuIndex])
        setMenuIndex(0)
        setScreen('select_records')
        break

      case 'select_records':
        setScreen('confirm')
        break

      case 'confirm':
        if (hubspotConnected) {
          startSimulation()
        }
        break

      case 'connect_hubspot':
        if (!hubspotConnected) {
          // Redirect to HubSpot OAuth
          window.location.href = '/api/hubspot/auth'
        }
        break

      case 'complete':
        resetSimulation()
        setScreen('menu')
        break
    }
  }, [screen, menuIndex, hubspotConnected])

  // Handle B button press (back/cancel)
  const handleBPress = useCallback(() => {
    switch (screen) {
      case 'menu':
        setScreen('title')
        break

      case 'select_business':
        setScreen('menu')
        setMenuIndex(0)
        break

      case 'select_sales_style':
        setScreen('select_business')
        setMenuIndex(BUSINESS_TYPES.indexOf(config.businessType))
        break

      case 'select_distribution':
        setScreen('select_sales_style')
        setMenuIndex(SALES_STYLES.indexOf(config.salesStyle))
        break

      case 'select_timeframe':
        setScreen('select_distribution')
        setMenuIndex(DISTRIBUTION_TYPES.indexOf(config.distributionType))
        break

      case 'select_records':
        setScreen('select_timeframe')
        setMenuIndex(TIMEFRAMES.indexOf(config.timeFrame))
        break

      case 'confirm':
        setScreen('select_records')
        break

      case 'connect_hubspot':
        setScreen('menu')
        setMenuIndex(1)
        break

      case 'running':
        // Pause or show cancel confirmation
        if (progress.status === 'running') {
          updateProgress({ status: 'paused' })
        }
        break

      case 'complete':
        resetSimulation()
        setScreen('menu')
        break
    }
  }, [screen, config])

  // Handle up navigation
  const handleUpPress = useCallback(() => {
    switch (screen) {
      case 'menu':
        setMenuIndex(Math.max(0, menuIndex - 1))
        break

      case 'select_business':
        setMenuIndex(Math.max(0, menuIndex - 1))
        break

      case 'select_sales_style':
        setMenuIndex(Math.max(0, menuIndex - 1))
        break

      case 'select_distribution':
        setMenuIndex(Math.max(0, menuIndex - 1))
        break

      case 'select_timeframe':
        setMenuIndex(Math.max(0, menuIndex - 1))
        break

      case 'select_records':
        setMenuIndex(Math.max(0, menuIndex - 1))
        break
    }
  }, [screen, menuIndex])

  // Handle down navigation
  const handleDownPress = useCallback(() => {
    switch (screen) {
      case 'menu':
        setMenuIndex(Math.min(MENU_ITEMS.length - 1, menuIndex + 1))
        break

      case 'select_business':
        setMenuIndex(Math.min(BUSINESS_TYPES.length - 1, menuIndex + 1))
        break

      case 'select_sales_style':
        setMenuIndex(Math.min(SALES_STYLES.length - 1, menuIndex + 1))
        break

      case 'select_distribution':
        setMenuIndex(Math.min(DISTRIBUTION_TYPES.length - 1, menuIndex + 1))
        break

      case 'select_timeframe':
        setMenuIndex(Math.min(TIMEFRAMES.length - 1, menuIndex + 1))
        break

      case 'select_records':
        setMenuIndex(Math.min(RECORD_TYPES.length - 1, menuIndex + 1))
        break
    }
  }, [screen, menuIndex])

  // Handle left/right for record count adjustment
  const handleLeftPress = useCallback(() => {
    if (screen === 'select_records') {
      const recordType = RECORD_TYPES[menuIndex]
      const currentCount = config.recordCounts[recordType]
      const step = recordType === 'contacts' ? 50 : 10
      const min = recordType === 'tickets' ? 0 : recordType === 'contacts' ? 50 : 10
      setRecordCount(recordType, Math.max(min, currentCount - step))
    }
  }, [screen, menuIndex, config])

  const handleRightPress = useCallback(() => {
    if (screen === 'select_records') {
      const recordType = RECORD_TYPES[menuIndex]
      const currentCount = config.recordCounts[recordType]
      const step = recordType === 'contacts' ? 50 : 10
      const max = recordType === 'contacts' ? 2000 : recordType === 'tickets' ? 200 : 500
      setRecordCount(recordType, Math.min(max, currentCount + step))
    }
  }, [screen, menuIndex, config])

  // Start simulation
  const startSimulation = async () => {
    setScreen('running')
    clearLogs()

    updateProgress({
      status: 'running',
      currentPhase: 'Starting...',
      totalRecords:
        config.recordCounts.contacts +
        config.recordCounts.companies +
        config.recordCounts.deals +
        config.recordCounts.tickets,
      createdRecords: 0,
      errors: [],
      startedAt: new Date(),
    })

    addLog('Initializing simulation...')
    addLog(`Business Type: ${config.businessType}`)
    addLog(`Sales Style: ${config.salesStyle}`)

    try {
      const response = await fetch('/api/simulation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error('Failed to start simulation')
      }

      const data = await response.json()
      addLog(`Simulation ID: ${data.simulationId}`)
      addLog('Connecting to HubSpot API...')

      // In production, the simulation would run server-side
      // For now, we'll simulate progress on the client
      simulateProgress(data)
    } catch (error) {
      addLog(`Error: ${error}`)
      updateProgress({
        status: 'error',
        errors: [`${error}`],
      })
    }
  }

  // Simulate progress for demo purposes
  // In production, this would be replaced with real API calls
  const simulateProgress = async (data: { totalRecords: number }) => {
    const phases = ['companies', 'contacts', 'deals', 'tickets', 'activities']
    const phaseCounts = [
      config.recordCounts.companies,
      config.recordCounts.contacts,
      config.recordCounts.deals,
      config.recordCounts.tickets,
      Math.round(config.recordCounts.contacts * 0.5),
    ]

    let totalCreated = 0

    for (let p = 0; p < phases.length; p++) {
      const phase = phases[p]
      const count = phaseCounts[p]

      if (count === 0) continue

      addLog(`\nStarting ${phase} phase...`)
      updateProgress({ currentPhase: phase })

      for (let i = 0; i < count; i++) {
        // Check if cancelled or paused
        const currentProgress = useGameStore.getState().progress
        if (currentProgress.status === 'paused') {
          addLog('Simulation paused...')
          // Wait for resume
          await new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              const state = useGameStore.getState().progress
              if (state.status !== 'paused') {
                clearInterval(checkInterval)
                resolve()
              }
            }, 500)
          })
          addLog('Simulation resumed!')
        }

        if (useGameStore.getState().progress.status === 'error') {
          return
        }

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100))

        totalCreated++

        // Log every 10 records or last record of phase
        if (i % 10 === 0 || i === count - 1) {
          const recordName = generateSampleName(phase)
          addLog(`Created ${phase.slice(0, -1)}: ${recordName}`)
          updateProgress({
            createdRecords: totalCreated,
            currentRecord: recordName,
          })
        }
      }

      addLog(`✓ ${phase} phase complete (${count} records)`)
    }

    addLog('\n═══════════════════════')
    addLog('SIMULATION COMPLETE!')
    addLog(`Total records created: ${totalCreated}`)
    addLog('═══════════════════════')

    updateProgress({
      status: 'completed',
      createdRecords: totalCreated,
      currentPhase: 'Complete',
    })

    // Transition to complete screen after a moment
    setTimeout(() => {
      setScreen('complete')
    }, 1500)
  }

  // Generate sample names for demo
  const generateSampleName = (phase: string): string => {
    const names = {
      companies: ['TechCorp Inc', 'Global Solutions', 'Innovative Labs', 'Prime Industries', 'NextGen Systems'],
      contacts: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rivera'],
      deals: ['Enterprise Package', 'Annual Contract', 'Pilot Program', 'Expansion Deal', 'Renewal Q4'],
      tickets: ['Login Issue', 'Feature Request', 'Billing Question', 'Integration Help', 'Setup Support'],
      activities: ['Discovery Call', 'Follow-up Email', 'Demo Meeting', 'Check-in Note', 'Proposal Task'],
    }
    const list = names[phase as keyof typeof names] || ['Record']
    return list[Math.floor(Math.random() * list.length)]
  }

  // Handle HubSpot disconnect
  const handleHubspotDisconnect = async () => {
    try {
      await fetch('/api/hubspot/disconnect', { method: 'POST' })
      setHubspotConnection(false)
      addLog('Disconnected from HubSpot')
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  // Render current screen
  const renderScreen = () => {
    switch (screen) {
      case 'title':
        return <TitleScreen onStart={handleAPress} />

      case 'menu':
        return (
          <MenuScreen
            selectedIndex={menuIndex}
            hubspotConnected={hubspotConnected}
            onSelect={(index) => {
              setMenuIndex(index)
              handleAPress()
            }}
          />
        )

      case 'connect_hubspot':
        return (
          <ConnectHubspotScreen
            isConnected={hubspotConnected}
            portalId={hubspotPortalId}
            onConnect={() => {
              window.location.href = '/api/hubspot/auth'
            }}
            onDisconnect={handleHubspotDisconnect}
            onBack={handleBPress}
          />
        )

      case 'select_business':
        return (
          <SelectBusinessScreen
            selectedIndex={menuIndex}
            currentSelection={config.businessType}
            onSelect={(type) => {
              setBusinessType(type)
              setMenuIndex(0)
              setScreen('select_sales_style')
            }}
            onBack={handleBPress}
          />
        )

      case 'select_sales_style':
        return (
          <SelectSalesStyleScreen
            selectedIndex={menuIndex}
            currentSelection={config.salesStyle}
            onSelect={(style) => {
              setSalesStyle(style)
              setMenuIndex(0)
              setScreen('select_distribution')
            }}
            onBack={handleBPress}
          />
        )

      case 'select_distribution':
        return (
          <SelectDistributionScreen
            selectedIndex={menuIndex}
            currentSelection={config.distributionType}
            onSelect={(type) => {
              setDistributionType(type)
              setMenuIndex(0)
              setScreen('select_timeframe')
            }}
            onBack={handleBPress}
          />
        )

      case 'select_timeframe':
        return (
          <SelectTimeframeScreen
            selectedIndex={menuIndex}
            currentSelection={config.timeFrame}
            onSelect={(frame) => {
              setTimeFrame(frame)
              setMenuIndex(0)
              setScreen('select_records')
            }}
            onBack={handleBPress}
          />
        )

      case 'select_records':
        return (
          <SelectRecordsScreen
            selectedIndex={menuIndex}
            recordCounts={config.recordCounts}
            onUpdateCount={setRecordCount}
            onConfirm={() => setScreen('confirm')}
            onBack={handleBPress}
          />
        )

      case 'confirm':
        return (
          <ConfirmScreen
            config={config}
            hubspotConnected={hubspotConnected}
            onConfirm={startSimulation}
            onBack={handleBPress}
          />
        )

      case 'running':
        return (
          <SimulationScreen
            config={config}
            progress={progress}
            logs={logs}
            onPause={() => updateProgress({ status: 'paused' })}
            onResume={() => updateProgress({ status: 'running' })}
            onCancel={() => {
              updateProgress({ status: 'error', errors: ['Cancelled by user'] })
              setScreen('menu')
            }}
          />
        )

      case 'complete':
        return (
          <CompleteScreen
            progress={progress}
            onReturnToMenu={() => {
              resetSimulation()
              setScreen('menu')
            }}
            onViewInHubSpot={() => {
              if (hubspotPortalId) {
                window.open(`https://app.hubspot.com/contacts/${hubspotPortalId}`, '_blank')
              }
            }}
          />
        )

      default:
        return <TitleScreen onStart={handleAPress} />
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <GameboyShell
        onAPress={handleAPress}
        onBPress={handleBPress}
        onUpPress={handleUpPress}
        onDownPress={handleDownPress}
        onLeftPress={handleLeftPress}
        onRightPress={handleRightPress}
        onStartPress={handleAPress}
        onSelectPress={() => {
          // Toggle some info or settings
        }}
      >
        {renderScreen()}
      </GameboyShell>
    </main>
  )
}

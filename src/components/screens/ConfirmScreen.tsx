'use client'

import React, { useState, useEffect } from 'react'
import type { SimulationConfig } from '@/types'

interface ConfirmScreenProps {
  config: SimulationConfig
  hubspotConnected: boolean
  onConfirm: () => void
  onBack: () => void
}

const businessLabels: Record<string, string> = {
  saas: 'SAAS',
  ecommerce: 'E-COMMERCE',
  agency: 'AGENCY',
  real_estate: 'REAL ESTATE',
  healthcare: 'HEALTHCARE',
  finance: 'FINANCE',
  manufacturing: 'MANUFACTURING',
  education: 'EDUCATION',
  consulting: 'CONSULTING',
  nonprofit: 'NONPROFIT',
}

const salesLabels: Record<string, string> = {
  inbound: 'INBOUND',
  outbound: 'OUTBOUND',
  hybrid: 'HYBRID',
  plg: 'PRODUCT-LED',
  enterprise: 'ENTERPRISE',
  smb: 'SMB',
}

const distributionLabels: Record<string, string> = {
  steady: 'STEADY',
  growth: 'GROWTH',
  seasonal: 'SEASONAL',
  burst: 'BURST',
  decline: 'DECLINE',
}

const timeframeLabels: Record<string, string> = {
  '30_days': '30 DAYS',
  '90_days': '90 DAYS',
  '6_months': '6 MONTHS',
  '1_year': '1 YEAR',
  '2_years': '2 YEARS',
}

export function ConfirmScreen({
  config,
  hubspotConnected,
  onConfirm,
  onBack,
}: ConfirmScreenProps) {
  const [showCursor, setShowCursor] = useState(true)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 500)
    return () => clearInterval(interval)
  }, [])

  const totalRecords = Object.values(config.recordCounts).reduce((a, b) => a + b, 0)
  const estimatedActivities = Math.round(totalRecords * 2.5)

  const handleConfirm = () => {
    if (!hubspotConnected) return
    setConfirmed(true)
    setTimeout(onConfirm, 500)
  }

  return (
    <div className="w-full h-full flex flex-col p-3 pixel-text">
      {/* Header */}
      <div className="text-center mb-3">
        <h1 className="text-[10px] text-gb-darkest mb-1">CONFIRM SIMULATION</h1>
        <div className="w-40 h-0.5 bg-gb-dark mx-auto" />
      </div>

      {/* Config summary */}
      <div className="flex-1 space-y-1 text-[8px]">
        <div className="flex justify-between border-b border-gb-dark pb-1">
          <span className="text-gb-dark">BUSINESS:</span>
          <span className="text-gb-darkest">{businessLabels[config.businessType]}</span>
        </div>
        <div className="flex justify-between border-b border-gb-dark pb-1">
          <span className="text-gb-dark">SALES STYLE:</span>
          <span className="text-gb-darkest">{salesLabels[config.salesStyle]}</span>
        </div>
        <div className="flex justify-between border-b border-gb-dark pb-1">
          <span className="text-gb-dark">DISTRIBUTION:</span>
          <span className="text-gb-darkest">{distributionLabels[config.distributionType]}</span>
        </div>
        <div className="flex justify-between border-b border-gb-dark pb-1">
          <span className="text-gb-dark">TIMEFRAME:</span>
          <span className="text-gb-darkest">{timeframeLabels[config.timeFrame]}</span>
        </div>

        {/* Record counts */}
        <div className="mt-2 pt-2 border-t-2 border-gb-darkest">
          <div className="text-[9px] text-gb-darkest mb-2">RECORDS TO CREATE:</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex justify-between">
              <span className="text-gb-dark">Contacts:</span>
              <span className="text-gb-darkest">{config.recordCounts.contacts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gb-dark">Companies:</span>
              <span className="text-gb-darkest">{config.recordCounts.companies}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gb-dark">Deals:</span>
              <span className="text-gb-darkest">{config.recordCounts.deals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gb-dark">Tickets:</span>
              <span className="text-gb-darkest">{config.recordCounts.tickets}</span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="mt-2 p-2 bg-gb-dark text-gb-lightest">
          <div className="flex justify-between text-[9px]">
            <span>TOTAL RECORDS:</span>
            <span className="font-bold">{totalRecords.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[7px] mt-1 text-gb-light">
            <span>+ Est. Activities:</span>
            <span>~{estimatedActivities.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Connection status warning */}
      {!hubspotConnected && (
        <div className="my-2 p-2 border-2 border-gb-darkest bg-gb-light">
          <div className="text-[8px] text-gb-darkest text-center">
            ⚠ CONNECT HUBSPOT FIRST
          </div>
          <div className="text-[7px] text-gb-dark text-center mt-1">
            Go back to connect your portal
          </div>
        </div>
      )}

      {/* Confirm prompt */}
      <div className="mt-3 text-center">
        {hubspotConnected ? (
          <div className={`text-[10px] ${confirmed ? 'text-gb-dark' : 'text-gb-darkest'}`}>
            {confirmed ? (
              'STARTING...'
            ) : (
              <>
                START SIMULATION?{showCursor ? '▮' : ' '}
              </>
            )}
          </div>
        ) : (
          <div className="text-[10px] text-gb-dark">
            HUBSPOT NOT CONNECTED
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-3 text-[8px] text-gb-dark">
        <span>B BACK</span>
        <span>{hubspotConnected ? 'A START' : ''}</span>
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import type { TimeFrame } from '@/types'

interface SelectTimeframeScreenProps {
  selectedIndex: number
  currentSelection: TimeFrame
  onSelect: (frame: TimeFrame) => void
  onBack: () => void
}

const timeframes: { id: TimeFrame; label: string; days: number; desc: string }[] = [
  { id: '30_days', label: '30 DAYS', days: 30, desc: 'Quick demo data' },
  { id: '90_days', label: '90 DAYS', days: 90, desc: 'Quarterly view' },
  { id: '6_months', label: '6 MONTHS', days: 180, desc: 'Half year history' },
  { id: '1_year', label: '1 YEAR', days: 365, desc: 'Full annual cycle' },
  { id: '2_years', label: '2 YEARS', days: 730, desc: 'Deep history' },
]

export function SelectTimeframeScreen({
  selectedIndex,
  onSelect,
  onBack,
}: SelectTimeframeScreenProps) {
  return (
    <div className="w-full h-full flex flex-col p-4 pixel-text">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-[10px] text-gb-darkest mb-1">SELECT TIMEFRAME</h1>
        <div className="w-40 h-0.5 bg-gb-dark mx-auto" />
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-4 h-4 flex items-center justify-center text-[8px] ${
              step <= 4 ? 'bg-gb-darkest text-gb-lightest' : 'bg-gb-dark text-gb-light'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Info text */}
      <div className="text-center text-[7px] text-gb-dark mb-4 px-4">
        DATA WILL BE BACKDATED FROM TODAY
      </div>

      {/* Timeframe list */}
      <div className="flex-1">
        <div className="space-y-2">
          {timeframes.map((item, index) => {
            const isSelected = index === selectedIndex
            // Calculate end date display
            const endDate = new Date()
            const startDate = new Date(endDate.getTime() - item.days * 24 * 60 * 60 * 1000)

            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`
                  w-full flex items-center gap-2 px-3 py-3
                  transition-all duration-100
                  ${isSelected
                    ? 'bg-gb-dark text-gb-lightest'
                    : 'bg-transparent text-gb-darkest'
                  }
                `}
              >
                {/* Selection arrow */}
                <span className={`text-sm ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                  ▸
                </span>

                {/* Label and info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]">{item.label}</span>
                    <span className={`text-[7px] ${isSelected ? 'text-gb-light' : 'text-gb-dark'}`}>
                      {item.desc}
                    </span>
                  </div>
                  {/* Date range */}
                  <div className={`text-[7px] mt-1 ${isSelected ? 'text-gb-light' : 'text-gb-dark'}`}>
                    {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' → '}
                    {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-[8px] text-gb-dark">
        <span>B BACK</span>
        <span>{selectedIndex + 1}/{timeframes.length}</span>
        <span>A SELECT</span>
      </div>
    </div>
  )
}

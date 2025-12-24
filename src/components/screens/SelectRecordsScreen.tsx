'use client'

import React, { useState } from 'react'
import type { SimulationConfig } from '@/types'

interface SelectRecordsScreenProps {
  selectedIndex: number
  recordCounts: SimulationConfig['recordCounts']
  onUpdateCount: (type: keyof SimulationConfig['recordCounts'], count: number) => void
  onConfirm: () => void
  onBack: () => void
}

const recordTypes: { id: keyof SimulationConfig['recordCounts']; label: string; icon: string; min: number; max: number; step: number }[] = [
  { id: 'contacts', label: 'CONTACTS', icon: '👤', min: 50, max: 2000, step: 50 },
  { id: 'companies', label: 'COMPANIES', icon: '🏢', min: 10, max: 500, step: 10 },
  { id: 'deals', label: 'DEALS', icon: '💰', min: 10, max: 500, step: 10 },
  { id: 'tickets', label: 'TICKETS', icon: '🎫', min: 0, max: 200, step: 10 },
]

export function SelectRecordsScreen({
  selectedIndex,
  recordCounts,
  onUpdateCount,
  onConfirm,
  onBack,
}: SelectRecordsScreenProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAdjust = (type: keyof SimulationConfig['recordCounts'], delta: number) => {
    const config = recordTypes.find(r => r.id === type)!
    const current = recordCounts[type]
    const newValue = Math.max(config.min, Math.min(config.max, current + delta * config.step))
    onUpdateCount(type, newValue)
  }

  const totalRecords = Object.values(recordCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="w-full h-full flex flex-col p-4 pixel-text">
      {/* Header */}
      <div className="text-center mb-3">
        <h1 className="text-[10px] text-gb-darkest mb-1">RECORD COUNTS</h1>
        <div className="w-40 h-0.5 bg-gb-dark mx-auto" />
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-4 h-4 flex items-center justify-center text-[8px] ${
              step <= 5 ? 'bg-gb-darkest text-gb-lightest' : 'bg-gb-dark text-gb-light'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Record type list */}
      <div className="flex-1">
        <div className="space-y-2">
          {recordTypes.map((item, index) => {
            const isSelected = index === selectedIndex
            const count = recordCounts[item.id]
            const percentage = ((count - item.min) / (item.max - item.min)) * 100

            return (
              <div
                key={item.id}
                className={`
                  w-full px-3 py-2 transition-all duration-100
                  ${isSelected ? 'bg-gb-dark text-gb-lightest' : 'bg-transparent text-gb-darkest'}
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  {/* Selection arrow */}
                  <span className={`text-sm ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                    ▸
                  </span>

                  {/* Icon */}
                  <span className="w-5 text-center text-sm">{item.icon}</span>

                  {/* Label */}
                  <span className="text-[9px] flex-1">{item.label}</span>

                  {/* Count with arrows */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdjust(item.id, -1)}
                      className={`text-xs px-1 ${isSelected ? 'hover:text-white' : ''}`}
                    >
                      ◀
                    </button>
                    <span className="text-[10px] w-12 text-center font-bold">
                      {count}
                    </span>
                    <button
                      onClick={() => handleAdjust(item.id, 1)}
                      className={`text-xs px-1 ${isSelected ? 'hover:text-white' : ''}`}
                    >
                      ▶
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="ml-7 h-2 bg-gb-light border border-gb-darkest">
                  <div
                    className="h-full bg-gb-darkest transition-all duration-150"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Total summary */}
      <div className="mt-3 p-2 border-2 border-gb-darkest bg-gb-light">
        <div className="flex justify-between items-center text-[9px]">
          <span className="text-gb-dark">TOTAL RECORDS:</span>
          <span className="text-gb-darkest font-bold">{totalRecords.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-[7px] text-gb-dark mt-1">
          <span>+ ACTIVITIES & NOTES</span>
          <span>~{Math.round(totalRecords * 2.5).toLocaleString()}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-3 text-[8px] text-gb-dark">
        <span>B BACK</span>
        <span>◀▶ ADJUST</span>
        <span>A CONTINUE</span>
      </div>
    </div>
  )
}

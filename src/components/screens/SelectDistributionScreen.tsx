'use client'

import React from 'react'
import type { DistributionType } from '@/types'

interface SelectDistributionScreenProps {
  selectedIndex: number
  currentSelection: DistributionType
  onSelect: (type: DistributionType) => void
  onBack: () => void
}

const distributionTypes: { id: DistributionType; label: string; pattern: string; desc: string }[] = [
  { id: 'steady', label: 'STEADY', pattern: '▁▂▂▂▂▂▂▂▂▁', desc: 'Even over time' },
  { id: 'growth', label: 'GROWTH', pattern: '▁▁▂▃▄▅▆▇██', desc: 'Startup pattern' },
  { id: 'seasonal', label: 'SEASONAL', pattern: '▂▆█▃▁▂▆█▃▁', desc: 'Peaks & valleys' },
  { id: 'burst', label: 'BURST', pattern: '▁▁▁██▁▁██▁', desc: 'Campaign spikes' },
  { id: 'decline', label: 'DECLINE', pattern: '██▇▆▅▄▃▂▁▁', desc: 'Winding down' },
]

export function SelectDistributionScreen({
  selectedIndex,
  onSelect,
  onBack,
}: SelectDistributionScreenProps) {
  return (
    <div className="w-full h-full flex flex-col p-4 pixel-text">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-[10px] text-gb-darkest mb-1">RECORD DISTRIBUTION</h1>
        <div className="w-40 h-0.5 bg-gb-dark mx-auto" />
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-4 h-4 flex items-center justify-center text-[8px] ${
              step <= 3 ? 'bg-gb-darkest text-gb-lightest' : 'bg-gb-dark text-gb-light'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Info text */}
      <div className="text-center text-[7px] text-gb-dark mb-4 px-4">
        HOW RECORDS ARE SPREAD OVER YOUR SELECTED TIMEFRAME
      </div>

      {/* Distribution list */}
      <div className="flex-1">
        <div className="space-y-2">
          {distributionTypes.map((item, index) => {
            const isSelected = index === selectedIndex

            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2
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

                {/* Label and pattern */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px]">{item.label}</span>
                    <span className={`text-[7px] ${isSelected ? 'text-gb-light' : 'text-gb-dark'}`}>
                      {item.desc}
                    </span>
                  </div>
                  {/* Visual pattern */}
                  <div className="font-mono text-[10px] tracking-widest">
                    {item.pattern}
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
        <span>{selectedIndex + 1}/{distributionTypes.length}</span>
        <span>A SELECT</span>
      </div>
    </div>
  )
}

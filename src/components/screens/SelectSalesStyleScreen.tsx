'use client'

import React from 'react'
import type { SalesStyle } from '@/types'

interface SelectSalesStyleScreenProps {
  selectedIndex: number
  currentSelection: SalesStyle
  onSelect: (style: SalesStyle) => void
  onBack: () => void
}

const salesStyles: { id: SalesStyle; label: string; icon: string; desc: string }[] = [
  { id: 'inbound', label: 'INBOUND', icon: '📥', desc: 'Leads come to you' },
  { id: 'outbound', label: 'OUTBOUND', icon: '📤', desc: 'You reach out first' },
  { id: 'hybrid', label: 'HYBRID', icon: '🔄', desc: 'Mix of both styles' },
  { id: 'plg', label: 'PRODUCT-LED', icon: '🚀', desc: 'Product drives growth' },
  { id: 'enterprise', label: 'ENTERPRISE', icon: '🏢', desc: 'Large account focus' },
  { id: 'smb', label: 'SMB', icon: '🏪', desc: 'Small business focus' },
]

export function SelectSalesStyleScreen({
  selectedIndex,
  onSelect,
  onBack,
}: SelectSalesStyleScreenProps) {
  return (
    <div className="w-full h-full flex flex-col p-4 pixel-text">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-[10px] text-gb-darkest mb-1">SELECT SALES STYLE</h1>
        <div className="w-40 h-0.5 bg-gb-dark mx-auto" />
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-4 h-4 flex items-center justify-center text-[8px] ${
              step <= 2 ? 'bg-gb-darkest text-gb-lightest' : 'bg-gb-dark text-gb-light'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Sales style list */}
      <div className="flex-1">
        <div className="space-y-2">
          {salesStyles.map((item, index) => {
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

                {/* Icon */}
                <span className="w-6 text-center">{item.icon}</span>

                {/* Label and description */}
                <div className="flex-1 text-left">
                  <div className="text-[10px]">{item.label}</div>
                  <div className={`text-[7px] ${isSelected ? 'text-gb-light' : 'text-gb-dark'}`}>
                    {item.desc}
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
        <span>{selectedIndex + 1}/{salesStyles.length}</span>
        <span>A SELECT</span>
      </div>
    </div>
  )
}

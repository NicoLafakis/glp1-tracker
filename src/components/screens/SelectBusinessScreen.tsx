'use client'

import React from 'react'
import type { BusinessType } from '@/types'

interface SelectBusinessScreenProps {
  selectedIndex: number
  currentSelection: BusinessType
  onSelect: (type: BusinessType) => void
  onBack: () => void
}

const businessTypes: { id: BusinessType; label: string; icon: string; desc: string }[] = [
  { id: 'saas', label: 'SAAS', icon: '☁', desc: 'Software subscriptions' },
  { id: 'ecommerce', label: 'E-COMMERCE', icon: '🛒', desc: 'Online retail store' },
  { id: 'agency', label: 'AGENCY', icon: '🎨', desc: 'Creative services' },
  { id: 'real_estate', label: 'REAL ESTATE', icon: '🏠', desc: 'Property sales' },
  { id: 'healthcare', label: 'HEALTHCARE', icon: '⚕', desc: 'Medical services' },
  { id: 'finance', label: 'FINANCE', icon: '💰', desc: 'Financial services' },
  { id: 'manufacturing', label: 'MANUFACTURING', icon: '🏭', desc: 'Industrial goods' },
  { id: 'education', label: 'EDUCATION', icon: '📚', desc: 'Learning services' },
  { id: 'consulting', label: 'CONSULTING', icon: '💼', desc: 'Business advisory' },
  { id: 'nonprofit', label: 'NONPROFIT', icon: '❤', desc: 'Charitable org' },
]

export function SelectBusinessScreen({
  selectedIndex,
  onSelect,
  onBack,
}: SelectBusinessScreenProps) {
  const visibleStart = Math.max(0, Math.min(selectedIndex - 2, businessTypes.length - 5))
  const visibleItems = businessTypes.slice(visibleStart, visibleStart + 5)

  return (
    <div className="w-full h-full flex flex-col p-4 pixel-text">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-[10px] text-gb-darkest mb-1">SELECT BUSINESS TYPE</h1>
        <div className="w-40 h-0.5 bg-gb-dark mx-auto" />
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-4 h-4 flex items-center justify-center text-[8px] ${
              step === 1 ? 'bg-gb-darkest text-gb-lightest' : 'bg-gb-dark text-gb-light'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Scroll indicator - up */}
      {visibleStart > 0 && (
        <div className="text-center text-gb-dark text-xs mb-1">▲</div>
      )}

      {/* Business list */}
      <div className="flex-1">
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const actualIndex = businessTypes.findIndex(b => b.id === item.id)
            const isSelected = actualIndex === selectedIndex

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

      {/* Scroll indicator - down */}
      {visibleStart + 5 < businessTypes.length && (
        <div className="text-center text-gb-dark text-xs mt-1">▼</div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-[8px] text-gb-dark">
        <span>B BACK</span>
        <span>{selectedIndex + 1}/{businessTypes.length}</span>
        <span>A SELECT</span>
      </div>
    </div>
  )
}

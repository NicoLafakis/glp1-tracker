'use client'

import React from 'react'

interface MenuScreenProps {
  selectedIndex: number
  hubspotConnected: boolean
  onSelect: (index: number) => void
}

const menuItems = [
  { id: 'new', label: 'NEW SIMULATION', icon: '▶' },
  { id: 'connect', label: 'CONNECT HUBSPOT', icon: '⚡' },
  { id: 'history', label: 'HISTORY', icon: '📋' },
  { id: 'settings', label: 'SETTINGS', icon: '⚙' },
]

export function MenuScreen({ selectedIndex, hubspotConnected, onSelect }: MenuScreenProps) {
  return (
    <div className="w-full h-full flex flex-col p-4 pixel-text">
      {/* Header */}
      <div className="text-center mb-6 pt-2">
        <h1 className="text-sm text-gb-darkest mb-1">MAIN MENU</h1>
        <div className="w-32 h-0.5 bg-gb-dark mx-auto" />
      </div>

      {/* Connection status */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div
          className={`w-2 h-2 rounded-full ${hubspotConnected ? 'bg-gb-darkest animate-pulse' : 'bg-gb-dark'}`}
        />
        <span className="text-[8px] text-gb-dark">
          {hubspotConnected ? 'HUBSPOT CONNECTED' : 'NOT CONNECTED'}
        </span>
      </div>

      {/* Menu items */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onSelect(index)}
              className={`
                w-full flex items-center gap-3 px-4 py-3
                transition-all duration-100
                ${selectedIndex === index
                  ? 'bg-gb-dark text-gb-lightest'
                  : 'bg-transparent text-gb-darkest hover:bg-gb-dark hover:bg-opacity-30'
                }
              `}
            >
              {/* Selection arrow */}
              <span
                className={`transition-opacity ${selectedIndex === index ? 'opacity-100' : 'opacity-0'}`}
              >
                ▸
              </span>

              {/* Icon */}
              <span className="text-sm w-6">{item.icon}</span>

              {/* Label */}
              <span className="text-[10px] tracking-wide">{item.label}</span>

              {/* Connection indicator for CONNECT HUBSPOT */}
              {item.id === 'connect' && hubspotConnected && (
                <span className="ml-auto text-[8px]">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="text-center text-[8px] text-gb-dark mt-4">
        ↑↓ SELECT • A CONFIRM
      </div>

      {/* Decorative pixels */}
      <div className="absolute bottom-4 left-4 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-gb-dark opacity-30" />
        ))}
      </div>
      <div className="absolute bottom-4 right-4 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-gb-dark opacity-30" />
        ))}
      </div>
    </div>
  )
}

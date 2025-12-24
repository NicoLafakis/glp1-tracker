'use client'

import React from 'react'

interface GameboyShellProps {
  children: React.ReactNode
  onAPress?: () => void
  onBPress?: () => void
  onUpPress?: () => void
  onDownPress?: () => void
  onLeftPress?: () => void
  onRightPress?: () => void
  onStartPress?: () => void
  onSelectPress?: () => void
}

export function GameboyShell({
  children,
  onAPress,
  onBPress,
  onUpPress,
  onDownPress,
  onStartPress,
  onSelectPress,
}: GameboyShellProps) {
  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          onUpPress?.()
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          onDownPress?.()
          break
        case 'Enter':
        case ' ':
        case 'z':
        case 'Z':
          e.preventDefault()
          onAPress?.()
          break
        case 'Escape':
        case 'x':
        case 'X':
        case 'Backspace':
          e.preventDefault()
          onBPress?.()
          break
        case 'Tab':
          e.preventDefault()
          onSelectPress?.()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onAPress, onBPress, onUpPress, onDownPress, onStartPress, onSelectPress])

  return (
    <div className="relative select-none">
      {/* Main Gameboy body */}
      <div
        className="relative rounded-[20px] p-6 pb-8"
        style={{
          background: 'linear-gradient(180deg, #c4c4c4 0%, #a0a0a0 50%, #8a8a8a 100%)',
          boxShadow: `
            inset 0 2px 0 rgba(255,255,255,0.3),
            inset 0 -2px 0 rgba(0,0,0,0.2),
            0 10px 30px rgba(0,0,0,0.4),
            0 5px 15px rgba(0,0,0,0.3)
          `,
          width: '380px',
        }}
      >
        {/* Top ridge/vent lines */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-1 rounded-full"
              style={{ background: 'linear-gradient(180deg, #7a7a7a 0%, #9a9a9a 100%)' }}
            />
          ))}
        </div>

        {/* Screen bezel */}
        <div
          className="rounded-lg p-4 mb-6 mt-4"
          style={{
            background: 'linear-gradient(145deg, #5c5c6c 0%, #4a4a5a 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {/* Screen frame with "DOT MATRIX" label area */}
          <div className="mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-700 shadow-inner" style={{
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 0 4px rgba(255,0,0,0.3)'
            }} />
            <span className="text-[8px] text-gray-400 tracking-widest font-pixel">
              DOT MATRIX WITH STEREO SOUND
            </span>
          </div>

          {/* LCD Screen */}
          <div
            className="lcd-screen rounded relative overflow-hidden"
            style={{
              width: '320px',
              height: '288px',
              boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.3)',
            }}
          >
            <div className="scanlines" />
            <div className="relative z-0 w-full h-full">
              {children}
            </div>
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center mb-4">
          <span
            className="font-pixel text-lg tracking-wider font-bold italic"
            style={{
              background: 'linear-gradient(180deg, #1a1a8c 0%, #0a0a4c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '1px 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            HubSpot CRM
          </span>
          <span className="text-[10px] text-gray-600 ml-1 font-pixel">SIMULATOR</span>
        </div>

        {/* Controls area */}
        <div className="flex justify-between items-center px-4">
          {/* D-Pad */}
          <div className="dpad">
            <button
              onClick={onUpPress}
              className="dpad-btn dpad-up active:bg-gray-700"
              aria-label="Up"
            >
              <span className="text-gray-500 text-xs">▲</span>
            </button>
            <button
              onClick={onDownPress}
              className="dpad-btn dpad-down active:bg-gray-700"
              aria-label="Down"
            >
              <span className="text-gray-500 text-xs">▼</span>
            </button>
            <button
              className="dpad-btn dpad-left active:bg-gray-700"
              aria-label="Left"
            >
              <span className="text-gray-500 text-xs">◀</span>
            </button>
            <button
              className="dpad-btn dpad-right active:bg-gray-700"
              aria-label="Right"
            >
              <span className="text-gray-500 text-xs">▶</span>
            </button>
            <div className="dpad-center" />
          </div>

          {/* A/B Buttons */}
          <div className="flex gap-3 -rotate-[25deg]">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onBPress}
                className="gb-button-b active:translate-y-1 active:shadow-none"
                aria-label="B Button - Back"
              >
                <span className="text-[10px] font-pixel text-purple-200">B</span>
              </button>
              <span className="text-[8px] text-gray-600 rotate-[25deg]">BACK</span>
            </div>
            <div className="flex flex-col items-center gap-1 -mt-4">
              <button
                onClick={onAPress}
                className="gb-button-a active:translate-y-1 active:shadow-none"
                aria-label="A Button - Select"
              >
                <span className="text-[10px] font-pixel text-purple-200">A</span>
              </button>
              <span className="text-[8px] text-gray-600 rotate-[25deg]">OK</span>
            </div>
          </div>
        </div>

        {/* Start/Select buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={onSelectPress}
            className="flex flex-col items-center gap-1"
            aria-label="Select"
          >
            <div
              className="w-12 h-3 rounded-full active:bg-gray-600"
              style={{
                background: 'linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%)',
                transform: 'rotate(-25deg)',
              }}
            />
            <span className="text-[8px] text-gray-600 font-pixel">SELECT</span>
          </button>
          <button
            onClick={onStartPress}
            className="flex flex-col items-center gap-1"
            aria-label="Start"
          >
            <div
              className="w-12 h-3 rounded-full active:bg-gray-600"
              style={{
                background: 'linear-gradient(180deg, #5a5a5a 0%, #4a4a4a 100%)',
                transform: 'rotate(-25deg)',
              }}
            />
            <span className="text-[8px] text-gray-600 font-pixel">START</span>
          </button>
        </div>

        {/* Speaker grille */}
        <div className="absolute bottom-4 right-6 grid grid-cols-6 gap-1 rotate-[-25deg]">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #6a6a6a 0%, #5a5a5a 100%)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls hint */}
      <div className="text-center mt-4 text-gray-500 text-xs font-pixel space-y-1">
        <p>↑↓ Navigate • Enter/Z = A • Esc/X = B</p>
      </div>
    </div>
  )
}

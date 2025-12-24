'use client'

import React, { useState, useEffect } from 'react'

interface TitleScreenProps {
  onStart: () => void
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  const [showPress, setShowPress] = useState(true)
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowPress(prev => !prev)
    }, 500)
    return () => clearInterval(blinkInterval)
  }, [])

  useEffect(() => {
    const animInterval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4)
    }, 200)
    return () => clearInterval(animInterval)
  }, [])

  // Pixel art logo frames
  const logoFrames = [
    '◆',
    '◇',
    '◆',
    '◇',
  ]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 pixel-text">
      {/* Animated pixel decoration */}
      <div className="flex gap-2 mb-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="text-gb-dark text-lg"
            style={{
              opacity: (animationStep + i) % 5 === 0 ? 1 : 0.3,
              transition: 'opacity 0.1s',
            }}
          >
            {logoFrames[animationStep]}
          </span>
        ))}
      </div>

      {/* Main title */}
      <div className="text-center mb-2">
        <h1 className="text-xl text-gb-darkest leading-relaxed tracking-tight">
          HUBSPOT
        </h1>
        <h2 className="text-lg text-gb-darkest">
          CRM SIMULATOR
        </h2>
      </div>

      {/* Decorative line */}
      <div className="w-48 h-1 bg-gb-dark my-4" />

      {/* Subtitle */}
      <p className="text-[8px] text-gb-dark text-center mb-8 leading-relaxed">
        GENERATE REALISTIC<br />
        SANDBOX DATA
      </p>

      {/* Version */}
      <div className="text-[8px] text-gb-dark mb-8">
        v1.0.0
      </div>

      {/* Press start prompt */}
      <button
        onClick={onStart}
        className={`text-xs text-gb-darkest transition-opacity ${showPress ? 'opacity-100' : 'opacity-0'}`}
      >
        PRESS START
      </button>

      {/* Copyright */}
      <div className="absolute bottom-4 text-[6px] text-gb-dark">
        © 2024 CRM SIMULATOR
      </div>

      {/* Pixel art corners */}
      <div className="absolute top-4 left-4">
        <div className="w-4 h-4 border-t-4 border-l-4 border-gb-dark" />
      </div>
      <div className="absolute top-4 right-4">
        <div className="w-4 h-4 border-t-4 border-r-4 border-gb-dark" />
      </div>
      <div className="absolute bottom-12 left-4">
        <div className="w-4 h-4 border-b-4 border-l-4 border-gb-dark" />
      </div>
      <div className="absolute bottom-12 right-4">
        <div className="w-4 h-4 border-b-4 border-r-4 border-gb-dark" />
      </div>
    </div>
  )
}

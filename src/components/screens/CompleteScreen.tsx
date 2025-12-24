'use client'

import React, { useState, useEffect } from 'react'
import type { SimulationProgress } from '@/types'

interface CompleteScreenProps {
  progress: SimulationProgress
  onReturnToMenu: () => void
  onViewInHubSpot: () => void
}

export function CompleteScreen({
  progress,
  onReturnToMenu,
  onViewInHubSpot,
}: CompleteScreenProps) {
  const [frame, setFrame] = useState(0)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % 8), 150)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const celebrationFrames = ['★', '☆', '✦', '✧', '★', '☆', '✦', '✧']
  const isError = progress.status === 'error'

  // Calculate duration
  const duration = progress.startedAt
    ? Math.round((new Date().getTime() - new Date(progress.startedAt).getTime()) / 1000)
    : 0
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60

  return (
    <div className="w-full h-full flex flex-col p-4 pixel-text">
      {/* Celebration header */}
      <div className="text-center mb-4">
        {!isError && (
          <div className="flex justify-center gap-1 mb-2">
            {[0, 1, 2, 3, 4].map(i => (
              <span
                key={i}
                className="text-gb-darkest text-lg"
                style={{ opacity: (frame + i) % 5 === 0 ? 1 : 0.4 }}
              >
                {celebrationFrames[(frame + i) % 8]}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-sm text-gb-darkest mb-1">
          {isError ? 'SIMULATION FAILED' : 'SIMULATION COMPLETE!'}
        </h1>
        <div className="w-40 h-0.5 bg-gb-dark mx-auto" />
      </div>

      {/* Stats panel */}
      {showStats && (
        <div className="flex-1 animate-pixel-fade">
          <div className="p-3 bg-gb-light border-2 border-gb-darkest mb-3">
            <div className="text-[10px] text-gb-darkest mb-2 text-center">
              ═══ RESULTS ═══
            </div>

            <div className="space-y-2 text-[9px]">
              <div className="flex justify-between border-b border-gb-dark pb-1">
                <span className="text-gb-dark">Records Created:</span>
                <span className="text-gb-darkest font-bold">{progress.createdRecords}</span>
              </div>
              <div className="flex justify-between border-b border-gb-dark pb-1">
                <span className="text-gb-dark">Total Target:</span>
                <span className="text-gb-darkest">{progress.totalRecords}</span>
              </div>
              <div className="flex justify-between border-b border-gb-dark pb-1">
                <span className="text-gb-dark">Duration:</span>
                <span className="text-gb-darkest">
                  {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
                </span>
              </div>
              <div className="flex justify-between border-b border-gb-dark pb-1">
                <span className="text-gb-dark">Errors:</span>
                <span className={progress.errors.length > 0 ? 'text-gb-darkest' : 'text-gb-dark'}>
                  {progress.errors.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gb-dark">Success Rate:</span>
                <span className="text-gb-darkest font-bold">
                  {progress.totalRecords > 0
                    ? Math.round((progress.createdRecords / progress.totalRecords) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Error summary if any */}
          {progress.errors.length > 0 && (
            <div className="p-2 bg-gb-dark text-gb-lightest mb-3 max-h-20 overflow-y-auto">
              <div className="text-[8px] mb-1">ERRORS:</div>
              {progress.errors.slice(0, 5).map((err, i) => (
                <div key={i} className="text-[7px] text-gb-light break-all">
                  • {err}
                </div>
              ))}
              {progress.errors.length > 5 && (
                <div className="text-[7px] text-gb-light">
                  ...and {progress.errors.length - 5} more
                </div>
              )}
            </div>
          )}

          {/* Trophy / result icon */}
          <div className="text-center mb-4">
            {!isError ? (
              <div className="inline-block p-3 bg-gb-darkest text-gb-lightest">
                <span className="text-2xl">🏆</span>
              </div>
            ) : (
              <div className="inline-block p-3 bg-gb-dark text-gb-light">
                <span className="text-2xl">⚠</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          onClick={onViewInHubSpot}
          className="w-full py-2 bg-gb-darkest text-gb-lightest text-[9px] hover:bg-gb-dark transition-colors"
        >
          VIEW IN HUBSPOT →
        </button>
        <button
          onClick={onReturnToMenu}
          className="w-full py-2 bg-gb-light text-gb-darkest border border-gb-darkest text-[9px] hover:bg-gb-dark hover:text-gb-lightest hover:border-gb-dark transition-colors"
        >
          RETURN TO MENU
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-3 text-[7px] text-gb-dark">
        Data has been created in your HubSpot portal
      </div>
    </div>
  )
}

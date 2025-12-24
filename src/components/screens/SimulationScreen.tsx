'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { SimulationConfig, SimulationProgress } from '@/types'

interface SimulationScreenProps {
  config: SimulationConfig
  progress: SimulationProgress
  logs: string[]
  onPause: () => void
  onResume: () => void
  onCancel: () => void
}

export function SimulationScreen({
  config,
  progress,
  logs,
  onPause,
  onResume,
  onCancel,
}: SimulationScreenProps) {
  const [frame, setFrame] = useState(0)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Animation frame
  useEffect(() => {
    if (progress.status !== 'running') return
    const interval = setInterval(() => setFrame(f => (f + 1) % 4), 200)
    return () => clearInterval(interval)
  }, [progress.status])

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const spinnerFrames = ['◐', '◓', '◑', '◒']
  const progressPercent = progress.totalRecords > 0
    ? Math.round((progress.createdRecords / progress.totalRecords) * 100)
    : 0

  const getPhaseIcon = () => {
    switch (progress.currentPhase) {
      case 'companies': return '🏢'
      case 'contacts': return '👤'
      case 'deals': return '💰'
      case 'tickets': return '🎫'
      case 'activities': return '📝'
      case 'associations': return '🔗'
      default: return '⚡'
    }
  }

  return (
    <div className="w-full h-full flex flex-col p-3 pixel-text">
      {/* Header with spinner */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {progress.status === 'running' && (
          <span className="text-lg text-gb-darkest">{spinnerFrames[frame]}</span>
        )}
        <h1 className="text-[10px] text-gb-darkest">
          {progress.status === 'running' ? 'SIMULATING...' :
           progress.status === 'paused' ? 'PAUSED' :
           progress.status === 'completed' ? 'COMPLETE!' :
           progress.status === 'error' ? 'ERROR' : 'STARTING...'}
        </h1>
        {progress.status === 'running' && (
          <span className="text-lg text-gb-darkest">{spinnerFrames[(frame + 2) % 4]}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[8px] text-gb-dark mb-1">
          <span>{progress.createdRecords} / {progress.totalRecords}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-4 bg-gb-light border-2 border-gb-darkest relative overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              background: `repeating-linear-gradient(
                90deg,
                var(--gb-darkest) 0px,
                var(--gb-darkest) 4px,
                var(--gb-dark) 4px,
                var(--gb-dark) 8px
              )`,
            }}
          />
          {/* Scanline effect on progress */}
          {progress.status === 'running' && (
            <div
              className="absolute top-0 bottom-0 w-2 bg-gb-lightest opacity-30"
              style={{
                left: `${progressPercent}%`,
                animation: 'pulse 1s infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* Current phase */}
      <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-gb-dark text-gb-lightest">
        <span className="text-sm">{getPhaseIcon()}</span>
        <span className="text-[9px] uppercase">
          {progress.currentPhase || 'Initializing'}
        </span>
        {progress.currentRecord && (
          <span className="text-[7px] text-gb-light ml-auto truncate max-w-32">
            {progress.currentRecord}
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-2 text-[8px]">
        <div className="p-2 bg-gb-light border border-gb-dark">
          <div className="text-gb-dark">CONTACTS</div>
          <div className="text-gb-darkest font-bold">{config.recordCounts.contacts}</div>
        </div>
        <div className="p-2 bg-gb-light border border-gb-dark">
          <div className="text-gb-dark">COMPANIES</div>
          <div className="text-gb-darkest font-bold">{config.recordCounts.companies}</div>
        </div>
        <div className="p-2 bg-gb-light border border-gb-dark">
          <div className="text-gb-dark">DEALS</div>
          <div className="text-gb-darkest font-bold">{config.recordCounts.deals}</div>
        </div>
        <div className="p-2 bg-gb-light border border-gb-dark">
          <div className="text-gb-dark">TICKETS</div>
          <div className="text-gb-darkest font-bold">{config.recordCounts.tickets}</div>
        </div>
      </div>

      {/* Log output */}
      <div
        ref={logContainerRef}
        className="flex-1 bg-gb-darkest text-gb-lightest p-2 overflow-y-auto font-mono"
        style={{ fontSize: '7px', lineHeight: '1.4' }}
      >
        {logs.length === 0 ? (
          <div className="text-gb-dark">Waiting for logs...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="break-all">
              {log}
            </div>
          ))
        )}
        {progress.status === 'running' && (
          <span className="inline-block animate-blink">▮</span>
        )}
      </div>

      {/* Error display */}
      {progress.errors.length > 0 && (
        <div className="mt-2 p-2 bg-gb-light border-2 border-gb-darkest text-[7px] text-gb-darkest max-h-16 overflow-y-auto">
          {progress.errors.slice(-3).map((err, i) => (
            <div key={i}>⚠ {err}</div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center mt-2 text-[8px]">
        {progress.status === 'running' ? (
          <>
            <button
              onClick={onPause}
              className="px-3 py-1 bg-gb-dark text-gb-lightest hover:bg-gb-darkest"
            >
              PAUSE
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-gb-light text-gb-darkest border border-gb-darkest hover:bg-gb-dark hover:text-gb-lightest"
            >
              CANCEL
            </button>
          </>
        ) : progress.status === 'paused' ? (
          <>
            <button
              onClick={onResume}
              className="px-3 py-1 bg-gb-dark text-gb-lightest hover:bg-gb-darkest"
            >
              RESUME
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-gb-light text-gb-darkest border border-gb-darkest hover:bg-gb-dark hover:text-gb-lightest"
            >
              CANCEL
            </button>
          </>
        ) : progress.status === 'completed' ? (
          <div className="w-full text-center text-gb-darkest">
            A RETURN TO MENU
          </div>
        ) : (
          <div className="w-full text-center text-gb-dark">
            <span className="loading-dots">LOADING</span>
          </div>
        )}
      </div>
    </div>
  )
}

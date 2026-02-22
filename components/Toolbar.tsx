'use client';

import { useCallback } from 'react';
import type { Tool } from '@/lib/types';
import { TOOL_LABELS, DRAWING_INSTRUCTIONS, ANNOTATION_COLORS } from '@/lib/constants';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const TOOLS: Tool[] = [
  'pointer',
  'target_zone',
  'depth_point',
  'isobath',
  'dropoff',
  'spawn_zone',
  'accumulation_zone',
  'note',
];

function ToolIcon({ tool, active }: { tool: Tool; active: boolean }) {
  const color = active ? '#ffffff' : 'var(--text-secondary, #8888a0)';
  const size = 16;

  switch (tool) {
    case 'pointer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        </svg>
      );
    case 'target_zone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'depth_point':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v4M12 18v4" />
        </svg>
      );
    case 'isobath':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M3 12c3-4 6 4 9 0s6 4 9 0" />
        </svg>
      );
    case 'dropoff':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M3 8h8v8h8" strokeDasharray="4 2" />
        </svg>
      );
    case 'spawn_zone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l9 6v6l-9 6-9-6V9z" />
        </svg>
      );
    case 'accumulation_zone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l9 6v6l-9 6-9-6V9z" strokeDasharray="4 2" />
        </svg>
      );
    case 'note':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
        </svg>
      );
  }
}

function getToolColor(tool: Tool): string | undefined {
  if (tool === 'pointer' || tool === 'note') return undefined;
  return ANNOTATION_COLORS[tool];
}

export function Toolbar({ activeTool, onToolChange }: ToolbarProps) {
  const instruction = DRAWING_INSTRUCTIONS[activeTool];

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % TOOLS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + TOOLS.length) % TOOLS.length;
    }
    if (nextIndex !== currentIndex) {
      onToolChange(TOOLS[nextIndex]);
      const btn = document.querySelector(`[data-tool="${TOOLS[nextIndex]}"]`) as HTMLElement;
      btn?.focus();
    }
  }, [onToolChange]);

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        role="toolbar"
        aria-label="Outils d'annotation"
        className="flex items-center gap-px rounded-2xl p-1 shadow-xl shadow-black/40 ring-1 ring-[var(--border)] backdrop-blur-xl"
        style={{ background: 'rgba(10, 10, 22, 0.7)' }}
      >
        {TOOLS.map((tool, i) => {
          const isActive = activeTool === tool;
          const accentColor = getToolColor(tool);
          return (
            <button
              key={tool}
              data-tool={tool}
              onClick={() => onToolChange(tool)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              role="radio"
              aria-checked={isActive}
              aria-label={TOOL_LABELS[tool]}
              tabIndex={isActive ? 0 : -1}
              className={`btn-press relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] font-medium tracking-wide transition-all duration-150 ${
                isActive
                  ? 'bg-white/12 text-white'
                  : 'text-[var(--text-secondary)] hover:bg-white/6 hover:text-[var(--text-primary)]'
              }`}
              style={isActive && accentColor ? { boxShadow: `inset 0 -2px 0 0 ${accentColor}` } : undefined}
            >
              <ToolIcon tool={tool} active={isActive} />
              <span className="hidden lg:inline">{TOOL_LABELS[tool]}</span>
            </button>
          );
        })}
      </div>

      {instruction && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl px-4 py-2 text-xs font-medium text-[var(--text-secondary)] shadow-lg shadow-black/30 ring-1 ring-[var(--border)] backdrop-blur-xl"
          style={{ background: 'rgba(10, 10, 22, 0.75)' }}
        >
          {instruction}
          <span className="mx-1.5 text-[var(--text-tertiary)]">·</span>
          <kbd className="rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--text-tertiary)]">Échap</kbd>
          <span className="ml-1 text-[var(--text-tertiary)]">pour annuler</span>
        </div>
      )}
    </div>
  );
}

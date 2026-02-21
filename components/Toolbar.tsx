'use client';

import type { Tool } from '@/lib/types';
import { TOOL_LABELS, DRAWING_INSTRUCTIONS } from '@/lib/constants';

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
  const color = active ? '#ffffff' : '#ffffff80';
  const size = 18;

  switch (tool) {
    case 'pointer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        </svg>
      );
    case 'target_zone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'depth_point':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v4M12 18v4" />
        </svg>
      );
    case 'isobath':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M3 12c3-4 6 4 9 0s6 4 9 0" />
        </svg>
      );
    case 'dropoff':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M3 8h8v8h8" strokeDasharray="4 2" />
        </svg>
      );
    case 'spawn_zone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round">
          <path d="M12 3l9 6v6l-9 6-9-6V9z" />
        </svg>
      );
    case 'accumulation_zone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round">
          <path d="M12 3l9 6v6l-9 6-9-6V9z" strokeDasharray="4 2" />
        </svg>
      );
    case 'note':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      );
  }
}

export function Toolbar({ activeTool, onToolChange }: ToolbarProps) {
  const instruction = DRAWING_INSTRUCTIONS[activeTool];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-0.5 rounded-2xl border border-white/8 bg-[var(--panel-raised)]/90 p-1 shadow-lg shadow-black/30 backdrop-blur-md">
        {TOOLS.map((tool) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            className={`btn-press flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] font-medium tracking-wide transition-all duration-150 ${
              activeTool === tool
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/50 hover:bg-white/8 hover:text-white/80'
            }`}
            title={TOOL_LABELS[tool]}
          >
            <ToolIcon tool={tool} active={activeTool === tool} />
            <span className="hidden lg:inline">{TOOL_LABELS[tool]}</span>
          </button>
        ))}
      </div>

      {instruction && (
        <div className="rounded-xl bg-[var(--accent)]/90 px-3.5 py-2 text-xs font-medium text-white shadow-lg shadow-blue-900/30 backdrop-blur-sm">
          {instruction} — <kbd className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">Échap</kbd> pour annuler
        </div>
      )}
    </div>
  );
}

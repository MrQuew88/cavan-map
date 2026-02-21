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
  const color = active ? '#ffffff' : '#ffffff99';
  const size = 20;

  switch (tool) {
    case 'pointer':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        </svg>
      );
    case 'target_zone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'depth_point':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v4M12 18v4" />
        </svg>
      );
    case 'isobath':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M3 12c3-4 6 4 9 0s6 4 9 0" />
        </svg>
      );
    case 'dropoff':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M3 8h8v8h8" strokeDasharray="4 2" />
        </svg>
      );
    case 'spawn_zone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M12 3l9 6v6l-9 6-9-6V9z" />
        </svg>
      );
    case 'accumulation_zone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M12 3l9 6v6l-9 6-9-6V9z" strokeDasharray="4 2" />
        </svg>
      );
    case 'note':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
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
      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#1a1a2e]/95 px-2 py-1.5 backdrop-blur-sm">
        {TOOLS.map((tool) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
              activeTool === tool
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
            title={TOOL_LABELS[tool]}
          >
            <ToolIcon tool={tool} active={activeTool === tool} />
            <span className="hidden lg:inline">{TOOL_LABELS[tool]}</span>
          </button>
        ))}
      </div>

      {instruction && (
        <div className="rounded-lg bg-blue-600/90 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
          {instruction} — Press <kbd className="rounded bg-white/20 px-1">Esc</kbd> to cancel
        </div>
      )}
    </div>
  );
}

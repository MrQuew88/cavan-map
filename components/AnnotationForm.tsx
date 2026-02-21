'use client';

import { useState, useEffect } from 'react';
import type { Annotation, AnnotationType } from '@/lib/types';
import { SEASONS, CONFIDENCE_LEVELS, PRIORITIES } from '@/lib/constants';

interface AnnotationFormProps {
  annotation: Annotation;
  mode: 'create' | 'edit';
  onSave: (annotation: Annotation) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function AnnotationForm({
  annotation,
  mode,
  onSave,
  onCancel,
  onDelete,
}: AnnotationFormProps) {
  const [data, setData] = useState<Annotation>(annotation);

  useEffect(() => {
    setData(annotation);
  }, [annotation]);

  const update = (field: string, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value } as Annotation));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <h3 className="text-lg font-semibold text-white">
        {mode === 'create' ? 'New' : 'Edit'} {typeLabel(data.type)}
      </h3>

      <Field label="Notes">
        <textarea
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          className="input-field min-h-[60px] resize-y"
          placeholder="Add notes..."
        />
      </Field>

      {renderTypeFields(data, update)}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {mode === 'create' ? 'Create' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/20"
        >
          Cancel
        </button>
        {mode === 'edit' && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-red-600/20 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-600/30"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-white/50">{label}</span>
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o.charAt(0).toUpperCase() + o.slice(1)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function renderTypeFields(
  data: Annotation,
  update: (field: string, value: unknown) => void
) {
  switch (data.type) {
    case 'target_zone':
      return (
        <>
          <SelectField label="Priority" value={data.priority} options={PRIORITIES} onChange={(v) => update('priority', v)} />
          <SelectField label="Season" value={data.season} options={SEASONS} onChange={(v) => update('season', v)} />
          <Field label="Species">
            <input type="text" value={data.species} onChange={(e) => update('species', e.target.value)} className="input-field" placeholder="e.g. Pike, Perch" />
          </Field>
          <Field label="Technique">
            <input type="text" value={data.technique} onChange={(e) => update('technique', e.target.value)} className="input-field" placeholder="e.g. Lure, Fly" />
          </Field>
        </>
      );
    case 'depth_point':
      return (
        <Field label="Depth">
          <div className="flex gap-2">
            <input type="number" step="0.1" value={data.depth} onChange={(e) => update('depth', parseFloat(e.target.value) || 0)} className="input-field flex-1" />
            <select value={data.unit} onChange={(e) => update('unit', e.target.value)} className="input-field w-16">
              <option value="m">m</option>
              <option value="ft">ft</option>
            </select>
          </div>
        </Field>
      );
    case 'isobath':
      return (
        <Field label="Depth">
          <div className="flex gap-2">
            <input type="number" step="0.1" value={data.depth} onChange={(e) => update('depth', parseFloat(e.target.value) || 0)} className="input-field flex-1" />
            <select value={data.unit} onChange={(e) => update('unit', e.target.value)} className="input-field w-16">
              <option value="m">m</option>
              <option value="ft">ft</option>
            </select>
          </div>
        </Field>
      );
    case 'dropoff':
      return (
        <>
          <Field label="Shallow Depth">
            <div className="flex gap-2">
              <input type="number" step="0.1" value={data.shallowDepth} onChange={(e) => update('shallowDepth', parseFloat(e.target.value) || 0)} className="input-field flex-1" />
              <select value={data.unit} onChange={(e) => update('unit', e.target.value)} className="input-field w-16">
                <option value="m">m</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </Field>
          <Field label="Deep Depth">
            <input type="number" step="0.1" value={data.deepDepth} onChange={(e) => update('deepDepth', parseFloat(e.target.value) || 0)} className="input-field flex-1" />
          </Field>
        </>
      );
    case 'spawn_zone':
      return (
        <>
          <Field label="Species">
            <input type="text" value={data.species} onChange={(e) => update('species', e.target.value)} className="input-field" />
          </Field>
          <SelectField label="Season" value={data.season} options={SEASONS} onChange={(v) => update('season', v)} />
          <SelectField label="Confidence" value={data.confidence} options={CONFIDENCE_LEVELS} onChange={(v) => update('confidence', v)} />
        </>
      );
    case 'accumulation_zone':
      return (
        <>
          <Field label="Food Type">
            <input type="text" value={data.foodType} onChange={(e) => update('foodType', e.target.value)} className="input-field" placeholder="e.g. Insects, Algae" />
          </Field>
          <SelectField label="Season" value={data.season} options={SEASONS} onChange={(v) => update('season', v)} />
          <SelectField label="Confidence" value={data.confidence} options={CONFIDENCE_LEVELS} onChange={(v) => update('confidence', v)} />
        </>
      );
    case 'note':
      return null;
  }
}

function typeLabel(type: AnnotationType): string {
  const labels: Record<AnnotationType, string> = {
    target_zone: 'Target Zone',
    depth_point: 'Depth Point',
    isobath: 'Isobath',
    dropoff: 'Drop-off',
    spawn_zone: 'Spawn Zone',
    accumulation_zone: 'Accumulation Zone',
    note: 'Note',
  };
  return labels[type];
}

'use client';

import { useState, useEffect } from 'react';
import type { Annotation, AnnotationType } from '@/lib/types';
import {
  SEASONS,
  CONFIDENCE_LEVELS,
  PRIORITIES,
  ANNOTATION_LABELS,
  SEASON_LABELS,
  CONFIDENCE_LABELS,
  PRIORITY_LABELS,
} from '@/lib/constants';

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
      <h3 className="text-base font-semibold text-white">
        {mode === 'create' ? 'Nouveau' : 'Modifier'} — {ANNOTATION_LABELS[data.type]}
      </h3>

      <Field label="Notes">
        <textarea
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          className="input-field min-h-[60px] resize-y"
          placeholder="Ajouter des notes…"
        />
      </Field>

      {renderTypeFields(data, update)}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="btn-press flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[var(--accent-hover)]"
        >
          {mode === 'create' ? 'Créer' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-press rounded-xl bg-white/8 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors duration-150 hover:bg-white/14"
        >
          Annuler
        </button>
        {mode === 'edit' && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="btn-press rounded-xl bg-red-500/15 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors duration-150 hover:bg-red-500/25"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  labelMap,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  labelMap: Record<string, string>;
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
            {labelMap[o] ?? o}
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
          <SelectField label="Priorité" value={data.priority} options={PRIORITIES} labelMap={PRIORITY_LABELS} onChange={(v) => update('priority', v)} />
          <SelectField label="Saison" value={data.season} options={SEASONS} labelMap={SEASON_LABELS} onChange={(v) => update('season', v)} />
          <Field label="Espèce">
            <input type="text" value={data.species} onChange={(e) => update('species', e.target.value)} className="input-field" placeholder="ex. Brochet, Perche" />
          </Field>
          <Field label="Technique">
            <input type="text" value={data.technique} onChange={(e) => update('technique', e.target.value)} className="input-field" placeholder="ex. Leurre, Mouche" />
          </Field>
        </>
      );
    case 'depth_point':
      return (
        <Field label="Profondeur">
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
        <Field label="Profondeur">
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
          <Field label="Profondeur faible">
            <div className="flex gap-2">
              <input type="number" step="0.1" value={data.shallowDepth} onChange={(e) => update('shallowDepth', parseFloat(e.target.value) || 0)} className="input-field flex-1" />
              <select value={data.unit} onChange={(e) => update('unit', e.target.value)} className="input-field w-16">
                <option value="m">m</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </Field>
          <Field label="Profondeur forte">
            <input type="number" step="0.1" value={data.deepDepth} onChange={(e) => update('deepDepth', parseFloat(e.target.value) || 0)} className="input-field flex-1" />
          </Field>
        </>
      );
    case 'spawn_zone':
      return (
        <>
          <Field label="Espèce">
            <input type="text" value={data.species} onChange={(e) => update('species', e.target.value)} className="input-field" />
          </Field>
          <SelectField label="Saison" value={data.season} options={SEASONS} labelMap={SEASON_LABELS} onChange={(v) => update('season', v)} />
          <SelectField label="Confiance" value={data.confidence} options={CONFIDENCE_LEVELS} labelMap={CONFIDENCE_LABELS} onChange={(v) => update('confidence', v)} />
        </>
      );
    case 'accumulation_zone':
      return (
        <>
          <Field label="Type de nourriture">
            <input type="text" value={data.foodType} onChange={(e) => update('foodType', e.target.value)} className="input-field" placeholder="ex. Insectes, Algues" />
          </Field>
          <SelectField label="Saison" value={data.season} options={SEASONS} labelMap={SEASON_LABELS} onChange={(v) => update('season', v)} />
          <SelectField label="Confiance" value={data.confidence} options={CONFIDENCE_LEVELS} labelMap={CONFIDENCE_LABELS} onChange={(v) => update('confidence', v)} />
        </>
      );
    case 'note':
      return null;
  }
}

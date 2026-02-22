'use client';

import { useState, useEffect, useRef } from 'react';
import type { Annotation, AnnotationType } from '@/lib/types';
import {
  SEASONS,
  CONFIDENCE_LEVELS,
  PRIORITIES,
  ANNOTATION_LABELS,
  ANNOTATION_COLORS,
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
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setData(annotation);
  }, [annotation]);

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const first = formRef.current?.querySelector('textarea, input, select') as HTMLElement;
      first?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [annotation.id]);

  const update = (field: string, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value } as Annotation));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  const accentColor = ANNOTATION_COLORS[data.type];

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="stagger-enter flex flex-col gap-4 p-4" aria-label={`${mode === 'create' ? 'Créer' : 'Modifier'} ${ANNOTATION_LABELS[data.type]}`}>
      <div className="flex items-center gap-2.5">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}50` }}
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {mode === 'create' ? 'Nouveau' : 'Modifier'} — {ANNOTATION_LABELS[data.type]}
        </h3>
      </div>

      <Field label="Notes" htmlFor={`notes-${annotation.id}`}>
        <textarea
          id={`notes-${annotation.id}`}
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          className="input-field min-h-[64px] resize-y"
          placeholder="Ajouter des notes…"
        />
      </Field>

      {renderTypeFields(data, update, annotation.id)}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="btn-press flex-1 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors duration-150"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--bg)',
          }}
        >
          {mode === 'create' ? 'Créer' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-press rounded-xl bg-white/6 px-4 py-2.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:bg-white/10"
        >
          Annuler
        </button>
        {mode === 'edit' && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="btn-press rounded-xl px-4 py-2.5 text-[13px] font-medium text-[var(--destructive)] transition-colors duration-150"
            style={{ backgroundColor: 'var(--destructive-muted)' }}
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectField({
  label,
  id,
  value,
  options,
  labelMap,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  options: readonly string[];
  labelMap: Record<string, string>;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label} htmlFor={id}>
      <select
        id={id}
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
  update: (field: string, value: unknown) => void,
  annId: string
) {
  switch (data.type) {
    case 'target_zone':
      return (
        <>
          <SelectField label="Priorité" id={`priority-${annId}`} value={data.priority} options={PRIORITIES} labelMap={PRIORITY_LABELS} onChange={(v) => update('priority', v)} />
          <SelectField label="Saison" id={`season-${annId}`} value={data.season} options={SEASONS} labelMap={SEASON_LABELS} onChange={(v) => update('season', v)} />
          <Field label="Espèce" htmlFor={`species-${annId}`}>
            <input id={`species-${annId}`} type="text" value={data.species} onChange={(e) => update('species', e.target.value)} className="input-field" placeholder="ex. Brochet, Perche" />
          </Field>
          <Field label="Technique" htmlFor={`technique-${annId}`}>
            <input id={`technique-${annId}`} type="text" value={data.technique} onChange={(e) => update('technique', e.target.value)} className="input-field" placeholder="ex. Leurre, Mouche" />
          </Field>
        </>
      );
    case 'depth_point':
      return (
        <Field label="Profondeur" htmlFor={`depth-${annId}`}>
          <div className="flex gap-2">
            <input id={`depth-${annId}`} type="number" step="0.1" value={data.depth} onChange={(e) => update('depth', parseFloat(e.target.value) || 0)} className="input-field flex-1" />
            <select aria-label="Unité" value={data.unit} onChange={(e) => update('unit', e.target.value)} className="input-field w-16">
              <option value="m">m</option>
              <option value="ft">ft</option>
            </select>
          </div>
        </Field>
      );
    case 'isobath':
      return (
        <Field label="Profondeur" htmlFor={`depth-${annId}`}>
          <div className="flex gap-2">
            <input id={`depth-${annId}`} type="number" step="0.1" value={data.depth} onChange={(e) => update('depth', parseFloat(e.target.value) || 0)} className="input-field flex-1" />
            <select aria-label="Unité" value={data.unit} onChange={(e) => update('unit', e.target.value)} className="input-field w-16">
              <option value="m">m</option>
              <option value="ft">ft</option>
            </select>
          </div>
        </Field>
      );
    case 'dropoff':
      return (
        <>
          <Field label="Profondeur faible" htmlFor={`shallow-${annId}`}>
            <div className="flex gap-2">
              <input id={`shallow-${annId}`} type="number" step="0.1" value={data.shallowDepth} onChange={(e) => update('shallowDepth', parseFloat(e.target.value) || 0)} className="input-field flex-1" />
              <select aria-label="Unité" value={data.unit} onChange={(e) => update('unit', e.target.value)} className="input-field w-16">
                <option value="m">m</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </Field>
          <Field label="Profondeur forte" htmlFor={`deep-${annId}`}>
            <input id={`deep-${annId}`} type="number" step="0.1" value={data.deepDepth} onChange={(e) => update('deepDepth', parseFloat(e.target.value) || 0)} className="input-field flex-1" />
          </Field>
        </>
      );
    case 'spawn_zone':
      return (
        <>
          <Field label="Espèce" htmlFor={`species-${annId}`}>
            <input id={`species-${annId}`} type="text" value={data.species} onChange={(e) => update('species', e.target.value)} className="input-field" />
          </Field>
          <SelectField label="Saison" id={`season-${annId}`} value={data.season} options={SEASONS} labelMap={SEASON_LABELS} onChange={(v) => update('season', v)} />
          <SelectField label="Confiance" id={`confidence-${annId}`} value={data.confidence} options={CONFIDENCE_LEVELS} labelMap={CONFIDENCE_LABELS} onChange={(v) => update('confidence', v)} />
        </>
      );
    case 'accumulation_zone':
      return (
        <>
          <Field label="Type de nourriture" htmlFor={`foodtype-${annId}`}>
            <input id={`foodtype-${annId}`} type="text" value={data.foodType} onChange={(e) => update('foodType', e.target.value)} className="input-field" placeholder="ex. Insectes, Algues" />
          </Field>
          <SelectField label="Saison" id={`season-${annId}`} value={data.season} options={SEASONS} labelMap={SEASON_LABELS} onChange={(v) => update('season', v)} />
          <SelectField label="Confiance" id={`confidence-${annId}`} value={data.confidence} options={CONFIDENCE_LEVELS} labelMap={CONFIDENCE_LABELS} onChange={(v) => update('confidence', v)} />
        </>
      );
    case 'note':
      return null;
  }
}

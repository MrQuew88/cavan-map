'use client';

import { useState, useEffect, useRef } from 'react';
import type { Annotation, Spot } from '@/lib/types';
import {
  ANNOTATION_LABELS,
  ANNOTATION_COLORS,
} from '@/lib/constants';

interface AnnotationFormProps {
  annotation: Annotation;
  mode: 'create' | 'edit';
  spots: Spot[];
  onSave: (annotation: Annotation) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function AnnotationForm({
  annotation,
  mode,
  spots,
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
    <form ref={formRef} onSubmit={handleSubmit} className="stagger-enter flex flex-col gap-4 p-4" aria-label={`${mode === 'create' ? 'Cr\u00e9er' : 'Modifier'} ${ANNOTATION_LABELS[data.type]}`}>
      <div className="flex items-center gap-2.5">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 8px ${accentColor}50`,
            animation: 'dot-pulse 200ms ease-out',
          }}
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {mode === 'create' ? 'Nouveau' : 'Modifier'} \u2014 {ANNOTATION_LABELS[data.type]}
        </h3>
      </div>

      <Field label="Notes" htmlFor={`notes-${annotation.id}`}>
        <textarea
          id={`notes-${annotation.id}`}
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          className="input-field min-h-[64px] resize-y"
          placeholder="Ajouter des notes\u2026"
        />
      </Field>

      <Field label="Spot" htmlFor={`spot-${annotation.id}`}>
        <select
          id={`spot-${annotation.id}`}
          value={data.spotId ?? ''}
          onChange={(e) => update('spotId', e.target.value || null)}
          className="input-field"
        >
          <option value="">Non class\u00e9</option>
          {spots.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </Field>

      {renderTypeFields(data, update, annotation.id)}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="btn-press flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-150"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--bg)',
          }}
        >
          {mode === 'create' ? 'Cr\u00e9er' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-press rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150"
          style={{ backgroundColor: 'rgba(205, 180, 140, 0.06)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(205, 180, 140, 0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(205, 180, 140, 0.06)')}
        >
          Annuler
        </button>
        {mode === 'edit' && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="btn-press rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--destructive)] transition-colors duration-150"
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
      <label htmlFor={htmlFor} className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function DepthInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="input-field w-full pr-10"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm font-medium text-[var(--text-tertiary)]">
          m
        </span>
      </div>
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
          <Field label="Titre" htmlFor={`title-${annId}`}>
            <input id={`title-${annId}`} type="text" value={data.title} onChange={(e) => update('title', e.target.value)} className="input-field" placeholder="ex. Pointe nord, Baie est" />
          </Field>
          <DepthInput id={`depth-${annId}`} label="Profondeur" value={data.depth} onChange={(v) => update('depth', v)} />
        </>
      );
    case 'depth_point':
      return (
        <DepthInput id={`depth-${annId}`} label="Profondeur" value={data.depth} onChange={(v) => update('depth', v)} />
      );
    case 'isobath':
      return (
        <DepthInput id={`depth-${annId}`} label="Profondeur" value={data.depth} onChange={(v) => update('depth', v)} />
      );
    case 'dropoff':
      return (
        <>
          <DepthInput id={`shallow-${annId}`} label="Profondeur faible" value={data.shallowDepth} onChange={(v) => update('shallowDepth', v)} />
          <DepthInput id={`deep-${annId}`} label="Profondeur forte" value={data.deepDepth} onChange={(v) => update('deepDepth', v)} />
        </>
      );
    case 'spawn_zone':
      return (
        <>
          <Field label="Titre" htmlFor={`title-${annId}`}>
            <input id={`title-${annId}`} type="text" value={data.title} onChange={(e) => update('title', e.target.value)} className="input-field" placeholder="ex. Fray\u00e8re nord" />
          </Field>
          <DepthInput id={`depth-${annId}`} label="Profondeur" value={data.depth} onChange={(v) => update('depth', v)} />
          <Field label="Substrat" htmlFor={`substrate-${annId}`}>
            <input id={`substrate-${annId}`} type="text" value={data.substrate} onChange={(e) => update('substrate', e.target.value)} className="input-field" placeholder="ex. Gravier, Sable" />
          </Field>
        </>
      );
    case 'accumulation_zone':
      return (
        <>
          <Field label="Titre" htmlFor={`title-${annId}`}>
            <input id={`title-${annId}`} type="text" value={data.title} onChange={(e) => update('title', e.target.value)} className="input-field" placeholder="ex. Zone d'accumulation est" />
          </Field>
          <Field label="Description" htmlFor={`description-${annId}`}>
            <textarea id={`description-${annId}`} value={data.description} onChange={(e) => update('description', e.target.value)} className="input-field min-h-[64px] resize-y" placeholder="D\u00e9crire la zone\u2026" />
          </Field>
          <Field label="Conditions d'activation" htmlFor={`activation-${annId}`}>
            <textarea id={`activation-${annId}`} value={data.activationConditions} onChange={(e) => update('activationConditions', e.target.value)} className="input-field min-h-[64px] resize-y" placeholder="ex. Vent d'est, mont\u00e9e des eaux" />
          </Field>
        </>
      );
    case 'note':
      return null;
  }
}

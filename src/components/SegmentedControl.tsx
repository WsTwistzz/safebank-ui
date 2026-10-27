import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './SegmentedControl.module.css';

export interface SegmentOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  label: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  /** Optional id of the panel controlled by this tablist. */
  panelId?: string;
  className?: string;
}

export function SegmentedControl({
  label,
  options,
  value,
  onChange,
  panelId,
  className,
}: SegmentedControlProps) {
  const refs = useRef(new Map<string, HTMLButtonElement>());

  const activate = (index: number) => {
    const next = options[(index + options.length) % options.length];
    if (!next) return;
    onChange(next.value);
    refs.current.get(next.value)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = options.findIndex((option) => option.value === value);
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        activate(index + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        activate(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        activate(0);
        break;
      case 'End':
        event.preventDefault();
        activate(options.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={[styles.root, className ?? ''].filter(Boolean).join(' ')}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              if (node) refs.current.set(option.value, node);
              else refs.current.delete(option.value);
            }}
            type="button"
            role="tab"
            id={`${label}-${option.value}`}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            className={[styles.tab, selected ? styles.selected : ''].filter(Boolean).join(' ')}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

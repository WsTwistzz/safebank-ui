import type { ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Card.module.css';

export interface CardProps {
  title?: string;
  meta?: string;
  value?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  ariaLabel?: string;
}

export function Card({ title, meta, value, footer, children, ariaLabel }: CardProps) {
  return (
    <section className={styles.card} aria-label={ariaLabel}>
      {title || value ? (
        <div className={styles.header}>
          <div className={styles.headText}>
            {title ? <h3 className={styles.title}>{title}</h3> : null}
            {meta ? <p className={styles.meta}>{meta}</p> : null}
          </div>
          {value ? <div className={styles.value}>{value}</div> : null}
        </div>
      ) : null}
      {children}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
}

export interface ListItemProps {
  title: string;
  subtitle?: string;
  value?: ReactNode;
  leading?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function ListItem({
  title,
  subtitle,
  value,
  leading,
  chevron = false,
  onClick,
  disabled = false,
  ariaLabel,
}: ListItemProps) {
  const content = (
    <>
      {leading}
      <span className={styles.body}>
        <span className={styles.listTitle}>{title}</span>
        {subtitle ? <span className={styles.listSubtitle}>{subtitle}</span> : null}
      </span>
      {value ? <span className={styles.listValue}>{value}</span> : null}
      {chevron ? (
        <span className={styles.chevron} aria-hidden="true">
          <Icon name="chevron-right" size={16} />
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={styles.listItem}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={styles.listItem} aria-label={ariaLabel}>
      {content}
    </div>
  );
}

export function List({ children, ariaLabel }: { children: ReactNode; ariaLabel?: string }) {
  return (
    <div className={styles.list} role="list" aria-label={ariaLabel}>
      {children}
    </div>
  );
}

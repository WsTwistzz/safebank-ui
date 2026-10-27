import { Icon } from './Icon';
import type { IconName } from './Icon';
import styles from './BottomNav.module.css';

export type NavKey = 'home' | 'assistant' | 'profile';

const items: { key: NavKey; label: string; icon: IconName }[] = [
  { key: 'home', label: '首页', icon: 'home' },
  { key: 'assistant', label: '小安', icon: 'assistant' },
  { key: 'profile', label: '个人', icon: 'person' },
];

export interface BottomNavProps {
  value: NavKey;
  onChange: (value: NavKey) => void;
}

export function BottomNav({ value, onChange }: BottomNavProps) {
  return (
    <nav className={styles.nav} aria-label="主导航">
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            className={[styles.item, active ? styles.active : ''].filter(Boolean).join(' ')}
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange(item.key)}
          >
            <span className={item.key === 'assistant' ? styles.assistantIcon : styles.icon} aria-hidden="true">
              <Icon name={item.icon} size={item.key === 'assistant' ? 17 : 20} />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

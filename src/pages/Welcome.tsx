import { useEffect, useRef } from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { useSession } from '../app/SessionProvider';
import { useDocumentTitle } from '../app/hooks';
import { PATHS } from '../app/paths';
import styles from './welcome.module.css';

interface NavigateDetail {
  target: 'login' | 'register';
  href: string;
}

/**
 * 欢迎页使用交付包里的 safebank-welcome Web Component（Shadow DOM，自带玻璃交互）。
 * 组件点击时派发可取消的 safebank-navigate，由这里接管到 React Router。
 */
export function WelcomePage() {
  const navigate = useNavigate();
  const loginHref = useHref(PATHS.login);
  const { markAppVisited } = useSession();
  const hostRef = useRef<HTMLDivElement | null>(null);
  useDocumentTitle('欢迎 · SafeBank');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const onNavigate = (event: Event) => {
      const custom = event as CustomEvent<NavigateDetail>;
      if (custom.detail?.target !== 'login' && custom.detail?.target !== 'register') return;
      // 当前原型共用演示客户入口；保留意图以便后续接入独立注册流程。
      event.preventDefault();
      markAppVisited();
      navigate(PATHS.login, { replace: true, state: { intent: custom.detail.target } });
    };

    host.addEventListener('safebank-navigate', onNavigate as EventListener);
    return () => host.removeEventListener('safebank-navigate', onNavigate as EventListener);
  }, [markAppVisited, navigate]);

  return (
    <div className={styles.page}>
      <main id="main-content" className={styles.screen}>
        <div ref={hostRef} className={styles.host}>
          <safebank-welcome
            aria-label="SafeBank 欢迎页"
            login-url={loginHref}
            register-url={loginHref}
          />
        </div>
      </main>
    </div>
  );
}
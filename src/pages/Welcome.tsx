import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { markAppVisited } = useSession();
  const hostRef = useRef<HTMLDivElement | null>(null);
  useDocumentTitle('欢迎 · SafeBank');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const onNavigate = (event: Event) => {
      const custom = event as CustomEvent<NavigateDetail>;
      // 接管跳转：不离开 SPA，也不依赖组件写死的 href
      event.preventDefault();
      markAppVisited();
      navigate(PATHS.login, { replace: true });
      // 保留 detail 以便将来区分登录/注册
      void custom.detail;
    };

    host.addEventListener('safebank-navigate', onNavigate as EventListener);
    return () => host.removeEventListener('safebank-navigate', onNavigate as EventListener);
  }, [markAppVisited, navigate]);

  return (
    <div className={styles.page}>
      <main id="main-content" className={styles.screen}>
        <div ref={hostRef} className={styles.host}>
          <safebank-welcome login-url="/login" register-url="/login" />
        </div>
      </main>
    </div>
  );
}
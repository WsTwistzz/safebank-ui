import { useCallback, useEffect, useRef } from 'react';
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
 * 欢迎页使用交付包里的 safebank-welcome Web Component（Shadow DOM，玻璃银行卡 + 香槟金体系）。
 *
 * - 组件升级后接管渲染；模板没有 slot，因此下面的 light DOM 只在组件未加载时显示，
 *   既保证无 JS 时可用，也让测试可以拿到可读标题与两个入口。
 * - 组件派发可取消的 safebank-navigate，由这里接进 React Router，保持 SPA 跳转。
 */
export function WelcomePage() {
  const navigate = useNavigate();
  const { markAppVisited } = useSession();
  const hostRef = useRef<HTMLDivElement | null>(null);
  useDocumentTitle('欢迎 · SafeBank');

  const enterLogin = useCallback(() => {
    markAppVisited();
    navigate(PATHS.login, { replace: true });
  }, [markAppVisited, navigate]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const onNavigate = (event: Event) => {
      const custom = event as CustomEvent<NavigateDetail>;
      event.preventDefault();
      // 两个入口都进入登录：只标记已访问，不建立会话
      markAppVisited();
      navigate(PATHS.login, { replace: true });
      void custom.detail;
    };

    host.addEventListener('safebank-navigate', onNavigate as EventListener);
    return () => host.removeEventListener('safebank-navigate', onNavigate as EventListener);
  }, [markAppVisited, navigate]);

  return (
    <div className={styles.page}>
      <main id="main-content" className={styles.screen}>
        <div ref={hostRef} className={styles.host}>
          <safebank-welcome login-url="/login" register-url="/login">
            {/* 组件未加载时的降级内容（有 Shadow DOM 后不显示） */}
            <div className={styles.fallback}>
              <p className={styles.fallbackBrand}>SafeBank</p>
              <p className={styles.fallbackEyebrow}>WELCOME TO SAFE BANK</p>
              <h1 className={styles.fallbackTitle}>
                Take control of
                <br />
                your money
              </h1>
              <p className={styles.fallbackDesc}>
                账户、转账与理财，在同一个安静、清晰的空间里完成。每一步都可回退，每一次确认都有记录。
              </p>
              <div className={styles.fallbackActions}>
                <button type="button" className={styles.fallbackPrimary} onClick={enterLogin}>
                  开始使用
                </button>
                <button type="button" className={styles.fallbackSecondary} onClick={enterLogin}>
                  已有账户？登录
                </button>
              </div>
            </div>
          </safebank-welcome>
        </div>
      </main>
    </div>
  );
}
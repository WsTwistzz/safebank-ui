import { useNavigate } from 'react-router-dom';
import { useSession } from '../app/SessionProvider';
import { useDocumentTitle } from '../app/hooks';
import { PATHS } from '../app/paths';
import styles from './welcome.module.css';

export function WelcomePage() {
  const navigate = useNavigate();
  const { markAppVisited } = useSession();
  useDocumentTitle('欢迎 · SafeBank');

  /** 三个入口都只做导航：写入「已访问」并 replace 到登录；不建立会话、不发起业务请求。 */
  const proceed = () => {
    markAppVisited();
    navigate(PATHS.login, { replace: true });
  };

  return (
    <div className={styles.page}>
      <main id="main-content" className={styles.screen}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            SB
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>SafeBank</span>
            <span className={styles.brandSub}>GATEWAY</span>
          </span>
        </div>

        <svg
          className={styles.art}
          viewBox="0 0 360 240"
          role="presentation"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="180" cy="128" r="96" fill="none" stroke="var(--sb-line-strong)" strokeWidth="1" />
          <circle cx="180" cy="128" r="70" fill="none" stroke="var(--sb-gold-line)" strokeWidth="1" />
          <path
            d="M96 150c14-6 26-14 34-24 8-10 18-14 28-10 8 3 12 10 10 17-2 8-10 12-18 12h-14"
            fill="none"
            stroke="var(--sb-ink-2)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M264 150c-14-6-26-14-34-24-8-10-18-14-28-10-8 3-12 10-10 17 2 8 10 12 18 12h14"
            fill="none"
            stroke="var(--sb-ink-2)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="180" cy="120" r="26" fill="var(--sb-copper-soft)" stroke="var(--sb-copper)" strokeWidth="2" />
          <path d="M180 108v24M174 114h9a5 5 0 0 1 0 10h-9" fill="none" stroke="var(--sb-copper-deep)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M300 52v10M295 57h10" stroke="var(--sb-copper)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="66" cy="196" r="5" fill="none" stroke="var(--sb-copper)" strokeWidth="1.4" />
        </svg>

        <p className={styles.eyebrow}>WELCOME TO SAFE BANK</p>
        <h1 className={styles.title}>
          Take control of
          <br />
          your money
        </h1>
        <p className={styles.copy}>
          账户、转账与理财，在同一个安静、清晰的空间里完成。每一步都可回退，每一次确认都有记录。
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={proceed}>
            开始使用
          </button>
          <button type="button" className={styles.link} onClick={proceed}>
            已有账户？<b>登录</b>
          </button>
          <button type="button" className={styles.skip} onClick={proceed}>
            跳过引导
          </button>
        </div>
      </main>
      <p className={styles.foot}>演示环境 · 模拟数据 · 不接入真实银行认证</p>
    </div>
  );
}
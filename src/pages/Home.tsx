import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton } from '../components/Button';
import { Icon } from '../components/Icon';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import { StateView } from '../components/StateView';
import { useHomeService } from '../services/home/HomeService';
import { MockHomeService } from '../services/home/MockHomeService';
import type { MockHomeScenario } from '../services/home/MockHomeService';
import type { HomeBill, HomeSummary, HomeTransaction, HomeUpcoming } from '../services/home/types';
import { GatewayOfflineError } from '../services/approval/shared';
import { formatCents } from '../components/AmountText';
import { useSession } from '../app/SessionProvider';
import { useDocumentTitle } from '../app/hooks';
import { PATHS } from '../app/paths';
import { readAmountHidden, writeAmountHidden } from '../app/viewState';
import { getScroll, isVisitedPath } from '../app/scrollMemory';
import { applyScroll } from '../app/scroll';
import styles from '../layout/layout.module.css';
import h from './home.module.css';

type ModuleStatus = 'initial' | 'loading' | 'loaded' | 'empty' | 'error';

export function HomePage() {
  const navigate = useNavigate();
  const home = useHomeService();
  const { customer } = useSession();
  useDocumentTitle('首页 · SafeBank');

  const [hidden, setHidden] = useState<boolean>(readAmountHidden);
  const [offline, setOffline] = useState(false);

  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<ModuleStatus>('initial');
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [upcoming, setUpcoming] = useState<HomeUpcoming | null>(null);
  const [upcomingStatus, setUpcomingStatus] = useState<ModuleStatus>('initial');
  const [upcomingError, setUpcomingError] = useState<string | null>(null);

  const [recent, setRecent] = useState<HomeTransaction[]>([]);
  const [recentStatus, setRecentStatus] = useState<ModuleStatus>('initial');
  const [recentError, setRecentError] = useState<string | null>(null);

  const [bill, setBill] = useState<HomeBill | null>(null);
  const [billStatus, setBillStatus] = useState<ModuleStatus>('initial');
  const [billError, setBillError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const summarySeq = useRef(0);
  const upcomingSeq = useRef(0);
  const recentSeq = useRef(0);
  const billSeq = useRef(0);
  // 已成功加载的权威数据：用于「同一客户重试失败时保留旧数据」，跨客户时会被清空。
  const summaryRef = useRef<HomeSummary | null>(null);
  const upcomingRef = useRef<HomeUpcoming | null>(null);
  const recentRef = useRef<HomeTransaction[]>([]);
  const billRef = useRef<HomeBill | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const toggleHidden = () => {
    setHidden((prev) => {
      writeAmountHidden(!prev);
      return !prev;
    });
  };

  const amount = (cents: number) => (hidden ? '••••' : formatCents(cents));

  const loadSummary = useCallback(
    async (customerId: string) => {
      const seq = ++summarySeq.current;
      setSummaryStatus('loading');
      setSummaryError(null);
      try {
        const data = await home.getSummary(customerId);
        if (seq !== summarySeq.current) return;
        summaryRef.current = data;
        setSummary(data);
        setSummaryStatus('loaded');
        setOffline(false);
      } catch (error) {
        if (seq !== summarySeq.current) return;
        if (error instanceof GatewayOfflineError) setOffline(true);
        setSummaryError('资产摘要加载失败');
        setSummaryStatus(summaryRef.current ? 'loaded' : 'error');
      }
    },
    [home, summary],
  );

  const loadUpcoming = useCallback(async () => {
    const seq = ++upcomingSeq.current;
    setUpcomingStatus('loading');
    setUpcomingError(null);
    try {
      const data = await home.getUpcoming();
      if (seq !== upcomingSeq.current) return;
      upcomingRef.current = data;
      setUpcoming(data);
      setUpcomingStatus(data.count === 0 ? 'empty' : 'loaded');
    } catch (error) {
      if (seq !== upcomingSeq.current) return;
      if (error instanceof GatewayOfflineError) setOffline(true);
      setUpcomingError('待扣加载失败');
      setUpcomingStatus(upcomingRef.current ? 'loaded' : 'error');
    }
  }, [home, upcoming]);

  const loadRecent = useCallback(async () => {
    const seq = ++recentSeq.current;
    setRecentStatus('loading');
    setRecentError(null);
    try {
      const data = await home.getRecentTransactions();
      if (seq !== recentSeq.current) return;
      recentRef.current = data;
      setRecent(data);
      setRecentStatus(data.length === 0 ? 'empty' : 'loaded');
    } catch (error) {
      if (seq !== recentSeq.current) return;
      if (error instanceof GatewayOfflineError) setOffline(true);
      setRecentError('最近交易加载失败');
      setRecentStatus(recentRef.current.length === 0 ? 'error' : 'loaded');
    }
  }, [home, recent]);

  const loadBill = useCallback(async () => {
    const seq = ++billSeq.current;
    setBillStatus('loading');
    setBillError(null);
    try {
      const data = await home.getMonthlyBill();
      if (seq !== billSeq.current) return;
      billRef.current = data;
      setBill(data);
      setBillStatus('loaded');
    } catch (error) {
      if (seq !== billSeq.current) return;
      if (error instanceof GatewayOfflineError) setOffline(true);
      setBillError('账单加载失败');
      setBillStatus(billRef.current ? 'loaded' : 'error');
    }
  }, [home, bill]);

  // 客户切换：立即作废旧请求并清空上一客户的事实数据；同一客户重试则保留已加载数据。
  const loadedCustomerRef = useRef<string | null>(null);
  useEffect(() => {
    const changed = loadedCustomerRef.current !== null && loadedCustomerRef.current !== customer.customerId;
    loadedCustomerRef.current = customer.customerId;

    if (changed) {
      summarySeq.current += 1;
      upcomingSeq.current += 1;
      recentSeq.current += 1;
      billSeq.current += 1;
      summaryRef.current = null;
      upcomingRef.current = null;
      recentRef.current = [];
      billRef.current = null;
      setSummary(null);
      setSummaryStatus('initial');
      setSummaryError(null);
      setUpcoming(null);
      setUpcomingStatus('initial');
      setUpcomingError(null);
      setRecent([]);
      setRecentStatus('initial');
      setRecentError(null);
      setBill(null);
      setBillStatus('initial');
      setBillError(null);
    }

    void loadSummary(customer.customerId);
    void loadUpcoming();
    void loadRecent();
    void loadBill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.customerId, home]);

  /**
   * 首页内容分模块异步加载，首屏骨架高度不足会让浏览器把恢复的 scrollY 钳制到较小值。
   * 这里在挂载后逐帧尝试恢复，直到「文档足够高且位置命中」，并有明确的终止条件：
   * - 命中（误差 ≤ 8px）→ 结束；
   * - 用户主动滚动/按键 → 立即放弃，不抢回旧位置；
   * - 最多 180 帧（约 3s）或内容本身不足一屏 → 结束，不循环重试。
   */
  const scrollRestoreStartedRef = useRef(false);
  useEffect(() => {
    if (scrollRestoreStartedRef.current) return;
    scrollRestoreStartedRef.current = true;
    // 与路由侧保持一致的路径口径：BASE_URL 非根时去掉子路径前缀
    const base = import.meta.env.BASE_URL || '/';
    const rawPath = window.location.pathname;
    const path =
      base !== '/' && rawPath.startsWith(base)
        ? '/' + rawPath.slice(base.length)
        : rawPath;
    if (!isVisitedPath(path)) return;
    const target = getScroll(path);
    if (target <= 0) return;

    let frames = 0;
    let cancelled = false;
    let done = false;
    const stop = () => {
      done = true;
      window.removeEventListener('wheel', onUserIntent);
      window.removeEventListener('touchmove', onUserIntent);
      window.removeEventListener('keydown', onUserIntent);
    };
    function onUserIntent() {
      cancelled = true;
      stop();
    }
    window.addEventListener('wheel', onUserIntent, { passive: true });
    window.addEventListener('touchmove', onUserIntent, { passive: true });
    window.addEventListener('keydown', onUserIntent);

    const tick = () => {
      if (done) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (!cancelled && maxScroll >= target - 2) {
        applyScroll(target);
        if (Math.abs((window.scrollY ?? 0) - target) <= 8) {
          stop();
          return;
        }
      }
      frames += 1;
      if (cancelled || frames > 600) {
        stop();
        return;
      }
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
    return stop;
  }, []);

  const isMock = home instanceof MockHomeService;
  const applyScenario = (patch: Partial<MockHomeScenario>) => {
    if (isMock) (home as MockHomeService).setScenario(patch);
  };

  const reloadAll = () => {
    void loadSummary(customer.customerId);
    void loadUpcoming();
    void loadRecent();
    void loadBill();
  };

  return (
    <div className={styles.content}>
      <div className={h.head}>
        <span className={h.mark} aria-hidden="true">
          {summary?.customer.avatarText ?? customer.customerName.slice(0, 1)}
        </span>
        <span className={h.headMain}>
          <span className={h.headTitle}>{summary?.customer.name ?? customer.customerName} · Everyday</span>
          <span className={h.headSub}>Connected · 账户安全连接</span>
        </span>
        <span className={h.secure}>
          <Icon name="shield" size={13} />
          安全
        </span>
      </div>

      {offline ? (
        <div className={h.banner} role="status">
          <Icon name="wifi-off" size={14} />
          <span className={h.bannerText}>当前离线，已加载内容会保留，但不代表最新数据。</span>
          <Button variant="secondary" onClick={reloadAll}>
            重试
          </Button>
        </div>
      ) : null}

      {/* 资产 */}
      <section className={h.hero} aria-label="总资产">
        <div className={h.heroTop}>
          <span className={h.label}>Total balance · 总资产</span>
          <IconButton label={hidden ? '显示金额' : '隐藏金额'} aria-pressed={hidden} onClick={toggleHidden}>
            <Icon name={hidden ? 'eye-off' : 'eye'} size={16} />
          </IconButton>
        </div>

        {summaryStatus === 'initial' || (summaryStatus === 'loading' && !summary) ? (
          <div role="status" aria-live="polite">
            <Skeleton height={34} />
            <div style={{ height: 8 }} />
            <Skeleton height={12} />
            <span className={h.note}>正在加载资产…</span>
          </div>
        ) : null}

        {summaryError ? (
          <div className={h.cardError} role="alert">
            <Icon name="alert" size={13} />
            <span className={h.cardErrorText}>{summaryError}</span>
            <Button variant="secondary" onClick={() => void loadSummary(customer.customerId)}>
              重试
            </Button>
          </div>
        ) : null}

        {summary ? (
          <>
            <span className={h.total}>{amount(summary.totalCents)}</span>
            <div className={h.subRow}>
              <span>活期 {amount(summary.currentCents)}</span>
              <span aria-hidden="true">·</span>
              <span>储蓄 {amount(summary.savingsCents)}</span>
            </div>
            <div className={h.heroActions}>
              <button type="button" className={h.primary} onClick={() => navigate(PATHS.transfer)}>
                转账
                <Icon name="arrow-right" size={14} />
              </button>
              <button type="button" className={h.ghost} onClick={() => navigate(PATHS.bills)}>
                账单
              </button>
            </div>
            <p className={h.note}>{summary.dataNote}</p>
          </>
        ) : null}
      </section>

      {/* 待扣 */}
      {upcomingStatus === 'error' ? (
        <div className={h.cardError} role="alert">
          <Icon name="alert" size={13} />
          <span className={h.cardErrorText}>{upcomingError}</span>
          <Button variant="secondary" onClick={() => void loadUpcoming()}>
            重试
          </Button>
        </div>
      ) : upcomingStatus === 'loading' && !upcoming ? (
        <div className={h.banner} role="status">
          <span className={h.bannerText}>正在加载未来 7 天待扣…</span>
        </div>
      ) : upcoming && upcoming.count > 0 ? (
        <button
          type="button"
          className={h.notice}
          aria-label={`查看未来 7 天待扣款，共 ${upcoming.count} 笔，${hidden ? '金额已隐藏' : `合计 ${formatCents(upcoming.totalCents)}`}`}
          onClick={() => navigate(PATHS.subscriptions)}
        >
          <Icon name="clock" size={18} />
          <span className={h.noticeMain}>
            <span className={h.noticeTitle}>未来 7 天有 {upcoming.count} 笔待扣</span>
            <span className={h.noticeSub}>{upcoming.sourceSummary || '订阅自动扣款'} · 请预留余额</span>
          </span>
          <span className={h.noticeValue}>
            {amount(upcoming.totalCents)} ›
          </span>
        </button>
      ) : upcoming && upcoming.count === 0 ? (
        <div className={h.banner} role="status">
          <span className={h.bannerText}>未来 7 天无待扣。</span>
        </div>
      ) : null}

      {/* 快捷操作 */}
      <div className={h.sectionHead}>
        <span className={h.sectionTitle}>Quick actions · 一键办理</span>
      </div>
      <div className={h.quick}>
        <button type="button" className={h.quickCard} onClick={() => navigate(PATHS.wealth)}>
          <span className={h.quickTitle}>理财收益</span>
          <span className={h.quickDesc}>查看资产表现</span>
        </button>
        <button type="button" className={h.quickCard} onClick={() => navigate(PATHS.cards)}>
          <span className={h.quickTitle}>卡片管理</span>
          <span className={h.quickDesc}>账户与卡片设置</span>
        </button>
      </div>

      {/* 最近交易 */}
      <div className={h.sectionHead}>
        <span className={h.sectionTitle}>最近交易</span>
        <button type="button" className={h.sectionMore} onClick={() => navigate(PATHS.bills)}>
          全部 ›
        </button>
      </div>

      {recentStatus === 'loading' && recent.length === 0 ? (
        <SkeletonText lines={3} />
      ) : null}

      {recentError ? (
        <div className={h.cardError} role="alert">
          <Icon name="alert" size={13} />
          <span className={h.cardErrorText}>{recentError}</span>
          <Button variant="secondary" onClick={() => void loadRecent()}>
            重试
          </Button>
        </div>
      ) : null}

      {recentStatus === 'empty' ? (
        <StateView
          state="empty"
          compact
          title="最近没有交易"
          description="这个月还没有流水，可以先转一笔。"
          actionLabel="去转账"
          onAction={() => navigate(PATHS.transfer)}
        />
      ) : null}

      {recent.length > 0 ? (
        <div>
          {recent.map((tx) => (
            <button key={tx.id} type="button" className={h.tx} onClick={() => navigate(PATHS.bills)}>
              <span className={h.avatar} aria-hidden="true">
                {tx.name.slice(0, 1)}
              </span>
              <span className={h.txMain}>
                <span className={h.txName}>{tx.name}</span>
                <span className={h.txMeta}>
                  {tx.time} · {tx.category}
                </span>
              </span>
              <span className={[h.txAmt, tx.direction === 'in' ? h.in : h.out].filter(Boolean).join(' ')}>
                {hidden ? '••••' : `${tx.amountCents < 0 ? '−' : '+'}${formatCents(Math.abs(tx.amountCents))}`}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {/* 账单入口 */}
      {billError ? (
        <div className={h.cardError} role="alert">
          <Icon name="alert" size={13} />
          <span className={h.cardErrorText}>{billError}</span>
          <Button variant="secondary" onClick={() => void loadBill()}>
            重试
          </Button>
        </div>
      ) : billStatus === 'loading' && !bill ? (
        <div className={h.banner} role="status">
          <span className={h.bannerText}>正在加载本月账单…</span>
        </div>
      ) : bill ? (
        <button
          type="button"
          className={h.billLink}
          aria-label={`查看 ${bill.month} 账单，本月支出${hidden ? '金额已隐藏' : ` ${formatCents(bill.expenseCents)}`}`}
          onClick={() => navigate(PATHS.bills)}
        >
          <Icon name="chart" size={18} />
          <span className={h.billMain}>
            <span className={h.billTitle}>{bill.month} 账单</span>
            <span className={h.billSub}>查看支出分类与异常交易</span>
          </span>
          <span className={h.billValue}>{amount(bill.expenseCents)} ›</span>
        </button>
      ) : null}

      {isMock ? (
        <div className={h.demoPanel} aria-label="演示场景（仅演示）">
          <span className={styles.sectionLabel}>演示场景（仅演示）</span>
          <div className={h.demoGrid}>
            <Button
              variant="secondary"
              onClick={() => {
                applyScenario({ failSummaryOnce: true });
                void loadSummary(customer.customerId);
              }}
            >
              资产失败一次
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                applyScenario({ failUpcomingOnce: true });
                void loadUpcoming();
              }}
            >
              待扣失败一次
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                applyScenario({ failRecentOnce: true });
                void loadRecent();
              }}
            >
              交易失败一次
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                applyScenario({ failBillOnce: true });
                void loadBill();
              }}
            >
              账单失败一次
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                applyScenario({ emptyRecent: true });
                void loadRecent();
              }}
            >
              空交易
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                applyScenario({ emptyUpcoming: true });
                void loadUpcoming();
              }}
            >
              无待扣
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                applyScenario({ offline: true });
                reloadAll();
              }}
            >
              离线
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                applyScenario({ offline: false, emptyRecent: false, emptyUpcoming: false });
                reloadAll();
              }}
            >
              恢复正常
            </Button>
          </div>
          <p className={h.demoNote}>演示场景只改变 mock 返回；接入真实服务时整块移除。</p>
        </div>
      ) : null}
    </div>
  );
}
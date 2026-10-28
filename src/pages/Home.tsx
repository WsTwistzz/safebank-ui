import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandSymbol } from '../components/BrandSymbol';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Sheet } from '../components/Sheet';
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
  const [allocationOpen, setAllocationOpen] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'out' | 'in'>('all');
  const togglePrivacy = () => setHidden((previous) => {
    writeAmountHidden(!previous);
    return !previous;
  });
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

  const amount = (cents: number) => (hidden ? '••••' : formatCents(cents));

  /** 目标简报的金额表达：整数大号 + 小数降一级，且不带货币符号 */
  const splitCents = (cents: number) => {
    const [int, dec] = (Math.abs(cents) / 100).toFixed(2).split('.');
    return { int: int.replace(/\B(?=(\d{3})+(?!\d))/g, ','), dec };
  };

  /** 目标简报里「活期 / 储蓄」不带货币符号，保留两位小数与千分位 */
  const plainAmount = (cents: number) =>
    hidden
      ? '••••'
      : (cents / 100).toLocaleString('zh-CN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  /** 待扣等简短金额：整元时不显示 .00 */
  const amountShort = (cents: number) => {
    if (hidden) return '••••';
    const yuan = cents / 100;
    return Number.isInteger(yuan)
      ? `¥${yuan.toLocaleString('zh-CN')}`
      : `¥${yuan.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
  };

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
    [home],
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
  }, [home]);

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
  }, [home]);

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
  }, [home]);

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

  const holdingsCents = summary ? Math.max(0, summary.totalCents - summary.currentCents - summary.savingsCents) : 0;
  const assets = summary ? [
    { name: '活期', value: summary.currentCents, className: h.current },
    { name: '储蓄', value: summary.savingsCents, className: h.savings },
    ...(holdingsCents > 0 ? [{ name: '理财', value: holdingsCents, className: h.holdings }] : []),
  ] : [];
  const visibleTransactions = recent.filter(tx => transactionFilter === 'all' || tx.direction === transactionFilter);

  return (
    <div className={h.body}>
      <div className={h.head}>
        <span className={h.mark} aria-hidden="true">
          <BrandSymbol width={34} height={34} />
        </span>
        <span className={h.headMain}>
          <span className={h.headSub}>SafeBank · 日常账户</span>
          <span className={h.headTitle}>你好，{summary?.customer.name ?? customer.customerName}</span>
        </span>
        <button type="button" className={h.secure} aria-label="查看账户与安全设置" onClick={() => navigate(PATHS.profile)}>
          <Icon name="shield" size={17} />
          <span>安全连接</span>
        </button>
      </div>

      {offline ? (
        <div className={h.inlineAlert} role="status">
          <Icon name="wifi-off" size={13} />
          <span>当前离线，已加载内容会保留，但不代表最新数据。</span>
          <Button variant="secondary" onClick={reloadAll}>
            重试
          </Button>
        </div>
      ) : null}

      {/* 资产 */}
      <section className={h.hero} aria-label="总资产">
        <div className={h.heroTop}>
          <span className={h.label}>总资产 <span>人民币</span></span>
          <button type="button" className={h.privacy} onClick={togglePrivacy} aria-label={hidden ? '显示金额' : '隐藏金额'} aria-pressed={hidden}>
            <Icon name={hidden ? 'eye-off' : 'eye'} size={18} />
          </button>
        </div>

        {summaryStatus === 'initial' || (summaryStatus === 'loading' && !summary) ? (
          <div role="status" aria-live="polite">
            <Skeleton height={34} />
            <div style={{ height: 8 }} />
            <Skeleton height={12} />
            <div style={{ height: 6 }} />
            <span className={h.note}>正在加载资产…</span>
          </div>
        ) : null}

        {summaryError ? (
          <div className={h.inlineAlert} role="alert">
            <Icon name="alert" size={13} />
            <span>{summaryError}</span>
            <Button variant="secondary" onClick={() => void loadSummary(customer.customerId)}>
              重试
            </Button>
          </div>
        ) : null}

        {summary ? (
          <>
            <div className={h.amount} data-testid="home-total">
              {hidden ? (
                '••••'
              ) : (
                <>
                  {splitCents(summary.totalCents).int}
                  <small>.{splitCents(summary.totalCents).dec}</small>
                </>
              )}
            </div>
            <button type="button" className={h.allocationLink} onClick={() => setAllocationOpen(true)} aria-label="查看资产分布">
              <span className={h.subRow}>
                <span data-testid="home-current">活期 {plainAmount(summary.currentCents)}</span>
                <span data-testid="home-savings">储蓄 {plainAmount(summary.savingsCents)}</span>
              </span>
              <Icon name="chevron-right" size={15} />
            </button>
            <div className={h.allocationTrack} aria-hidden="true">
              {assets.map(asset => <span key={asset.name} className={asset.className} style={{ flex: Math.max(0, asset.value) }} />)}
            </div>
            <div className={h.statusRow}>
              <span className={h.accountState}><span /> 资金，由你掌控</span>
              <button type="button" className={h.heroDetail} onClick={() => setAllocationOpen(true)}>资产详情 <Icon name="arrow-right" size={15} /></button>
            </div>
          </>
        ) : null}
      </section>

      {/* 待扣 */}
      {upcomingStatus === 'error' ? (
        <div className={h.inlineAlert} role="alert">
          <Icon name="alert" size={13} />
          <span>{upcomingError}</span>
          <Button variant="secondary" onClick={() => void loadUpcoming()}>
            重试
          </Button>
        </div>
      ) : upcomingStatus === 'loading' && !upcoming ? (
        <div className={h.noticeMuted} role="status">
          正在加载未来 7 天待扣…
        </div>
      ) : upcoming && upcoming.count > 0 ? (
        <button
          type="button"
          className={h.notice}
          aria-label={`查看未来 7 天待扣款，共 ${upcoming.count} 笔，${hidden ? '金额已隐藏' : `合计 ${formatCents(upcoming.totalCents)}`}`}
          onClick={() => navigate(PATHS.subscriptions)}
        >
          <Icon name="clock" size={15} />
          <span className={h.noticeMain}>
            <b>未来 7 天有 {upcoming.count} 笔待扣</b>
            <small>{upcoming.sourceSummary || '云音乐、视频会员'} · 请预留余额</small>
          </span>
          <span className={h.noticeValue}>{amountShort(upcoming.totalCents)} · 查看 ›</span>
        </button>
      ) : upcoming && upcoming.count === 0 ? (
        <div className={h.noticeMuted} role="status">
          未来 7 天无待扣。
        </div>
      ) : null}

      <div className={h.quick} aria-label="常用服务">
        {([
          ['send', '转账', PATHS.transfer], ['bill', '账单', PATHS.bills],
          ['chart', '理财', PATHS.wealth], ['card', '卡片', PATHS.cards],
        ] as const).map(([icon, label, path]) => (
          <button key={path} type="button" className={h.quickCard} onClick={() => navigate(path)}>
            <span className={h.qicon}><Icon name={icon} size={21} /></span><span>{label}</span>
          </button>
        ))}
      </div>
      <button type="button" className={h.assistantCard} onClick={() => navigate(PATHS.assistant)}>
        <span className={h.assistantIcon}><Icon name="agent-mark" size={25} /></span>
        <span className={h.assistantCopy}><b>复杂的事，交给小安。</b><small>说出需求，先看计划，再由你确认。</small></span>
        <Icon name="arrow-right" size={18} />
      </button>

      {/* 最近交易 */}
      <div className={h.section}>
        <div className={h.sectionHead}>
          <b>最近交易</b>
          <button type="button" className={h.sectionMore} onClick={() => navigate(PATHS.bills)}>
            全部 ›
          </button>
        </div>

        <div className={h.filters} role="group" aria-label="交易筛选">
          {([['all', '全部'], ['out', '支出'], ['in', '收入']] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={transactionFilter === value} onClick={() => setTransactionFilter(value)}>{label}</button>
          ))}
        </div>
        {recentStatus === 'loaded' && recent.length > 0 && visibleTransactions.length === 0 ? <p className={h.emptyFilter}>最近没有{transactionFilter === 'in' ? '收入' : '支出'}记录</p> : null}
        {recentStatus === 'loading' && recent.length === 0 ? <SkeletonText lines={3} /> : null}

        {recentError ? (
          <div className={h.inlineAlert} role="alert">
            <Icon name="alert" size={13} />
            <span>{recentError}</span>
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
          <div className={h.list}>
            {visibleTransactions.map((tx) => (
              <button key={tx.id} type="button" className={h.tx} onClick={() => navigate(PATHS.bills)}>
                <span className={h.avatar} aria-hidden="true">
                  <Icon name={tx.direction === 'in' ? 'send' : tx.category.includes('餐') ? 'card' : 'bill'} size={18} />
                </span>
                <span className={h.txMain}>
                  <b>{tx.name}</b>
                  <small>
                    {tx.time} · {tx.category}
                  </small>
                </span>
                <span className={[h.txAmt, tx.direction === 'in' ? h.in : h.out].filter(Boolean).join(' ')}>
                  {hidden
                    ? '••••'
                    : `${tx.amountCents < 0 ? '−' : '+'}${(Math.abs(tx.amountCents) / 100).toLocaleString(
                        'zh-CN',
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                      )}`}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* 账单入口 */}
      {billError ? (
        <div className={h.inlineAlert} role="alert">
          <Icon name="alert" size={13} />
          <span>{billError}</span>
          <Button variant="secondary" onClick={() => void loadBill()}>
            重试
          </Button>
        </div>
      ) : billStatus === 'loading' && !bill ? (
        <div className={h.noticeMuted} role="status">
          正在加载本月账单…
        </div>
      ) : bill ? (
        <button
          type="button"
          className={h.billLink}
          aria-label={`查看 ${bill.month} 账单，本月支出${hidden ? '金额已隐藏' : ` ${formatCents(bill.expenseCents)}`}`}
          onClick={() => navigate(PATHS.bills)}
        >
          <Icon name="bill" size={15} />
          <span className={h.billMain}>
            <b>{bill.month} 账单</b>
            <small>查看支出分类与异常交易</small>
          </span>
          <strong>{amount(bill.expenseCents)} ›</strong>
        </button>
      ) : null}

      {isMock && import.meta.env.DEV ? (
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
          <p className={h.demoNote}>演示场景只改变 mock 返回；生产构建不显示此区块。</p>
        </div>
      ) : null}
      <Sheet open={allocationOpen} title="资产分布" description="当前账户的资产构成，金额单位为人民币。" onClose={() => setAllocationOpen(false)}>
        <div className={h.sheetTotal}><span>总资产</span><strong>{summary ? amount(summary.totalCents) : '正在加载…'}</strong></div>
        {assets.map(asset => <div key={asset.name} className={h.assetRow}>
          <span className={`${h.assetDot} ${asset.className}`} /><span>{asset.name}</span><strong>{amount(asset.value)}</strong>
        </div>)}
        <p className={h.detailNote}>{summary?.dataNote || '以当前演示账户数据为准。'} 小安不会在未经你确认时执行资金操作。</p>
      </Sheet>
    </div>
  );
}

import { Navigate, Outlet, createBrowserRouter, useLocation } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { StateView } from '../components/StateView';
import { useSession } from './SessionProvider';
import { PATHS } from './paths';
import { AppShellPrimary, AppShellSecondary } from '../layout/AppShell';
import { WelcomePage } from '../pages/Welcome';
import { LoginPage } from '../pages/Login';
import { HomePage } from '../pages/Home';
import { AssistantPage } from '../pages/Assistant';
import { ProfilePage } from '../pages/Profile';
import { TransferPage } from '../pages/Transfer';
import { BillsPage } from '../pages/Bills';
import { CardsPage } from '../pages/Cards';
import { SubscriptionsPage } from '../pages/Subscriptions';
import { WealthPage } from '../pages/Wealth';
import { WealthHoldingsPage } from '../pages/WealthHoldings';
import { NotFoundPage } from '../pages/NotFound';
import ComponentsPage from '../pages/dev/ComponentsPage';
import layoutStyles from '../layout/layout.module.css';

/** resolving 时的轻量加载态：不闪现欢迎/登录/首页，也不使用整页遮罩。 */
function ResolvingScreen() {
  return (
    <div className={layoutStyles.page}>
      <main id="main-content" className={layoutStyles.main}>
        <StateView state="loading" title="正在准备" description="正在恢复演示会话，请稍候。" />
      </main>
    </div>
  );
}

/** 会话恢复前只显示加载态，防止任何具象页面闪现。 */
function SessionGate() {
  const { status } = useSession();
  if (status === 'resolving') return <ResolvingScreen />;
  return <Outlet />;
}

/** 保护一级与二级业务页：未登录 → 欢迎（首次）或登录（已访问），并记录深链接目标。 */
function RequireAuth() {
  const { status, hasVisitedApp } = useSession();
  const location = useLocation();
  if (status === 'anonymous') {
    if (!hasVisitedApp) return <Navigate to={PATHS.welcome} replace />;
    return <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** 欢迎页只对「首次、未登录」可见；已登录或已访问则重定向。 */
function WelcomeGate() {
  const { status, hasVisitedApp } = useSession();
  if (status === 'authenticated') return <Navigate to={PATHS.home} replace />;
  if (hasVisitedApp) return <Navigate to={PATHS.login} replace />;
  return <WelcomePage />;
}

/** 登录页：已登录则直接进首页。 */
function LoginGate() {
  const { status } = useSession();
  if (status === 'authenticated') return <Navigate to={PATHS.home} replace />;
  return <LoginPage />;
}

type ShellComponent = () => JSX.Element;
type PageComponent = () => JSX.Element;

function protectedRoute(path: string, Shell: ShellComponent, Page: PageComponent): RouteObject {
  return {
    path,
    element: <RequireAuth />,
    children: [{ element: <Shell />, children: [{ index: true, element: <Page /> }] }],
  };
}

export const routes: RouteObject[] = [
  {
    element: <SessionGate />,
    children: [
      { path: PATHS.welcome, element: <WelcomeGate /> },
      { path: PATHS.login, element: <LoginGate /> },
      { path: PATHS.devComponents, element: <ComponentsPage /> },
      protectedRoute(PATHS.home, AppShellPrimary, HomePage),
      protectedRoute(PATHS.assistant, AppShellPrimary, AssistantPage),
      protectedRoute(PATHS.profile, AppShellPrimary, ProfilePage),
      protectedRoute(PATHS.transfer, AppShellSecondary, TransferPage),
      protectedRoute(PATHS.bills, AppShellSecondary, BillsPage),
      protectedRoute(PATHS.cards, AppShellSecondary, CardsPage),
      protectedRoute(PATHS.subscriptions, AppShellSecondary, SubscriptionsPage),
      protectedRoute(PATHS.wealth, AppShellSecondary, WealthPage),
      protectedRoute(PATHS.wealthHoldings, AppShellSecondary, WealthHoldingsPage),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes, {
  future: { v7_relativeSplatPath: true },
});
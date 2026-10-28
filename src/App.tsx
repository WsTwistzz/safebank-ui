import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { SessionProvider } from './app/SessionProvider';
import { ThemeProvider } from './app/ThemeProvider';
import { ToastProvider } from './components/Toast';
import { TransferServiceProvider } from './services/transfer/TransferService';
import { BillsServiceProvider } from './services/bills/BillsService';
import { CardsServiceProvider } from './services/cards/CardsService';
import { SubscriptionsServiceProvider } from './services/subscriptions/SubscriptionsService';
import { WealthServiceProvider } from './services/wealth/WealthService';
import { AssistantServiceProvider } from './services/assistant/AssistantService';
import { ProfileServiceProvider } from './services/profile/ProfileService';
import { AuthServiceProvider } from './services/auth/AuthService';
import { HomeServiceProvider } from './services/home/HomeService';
import { useSheenPointer } from './app/useSheenPointer';

export default function App() {
  // 全局只挂一次：让带 data-sb-sheen 的表面跟随指针产生极淡的高光。
  useSheenPointer();

  // 使用手动滚动恢复，避免浏览器原生 scrollRestoration 与我们按路径的恢复逻辑互相覆盖。
  useEffect(() => {
    try {
      window.history.scrollRestoration = 'manual';
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ThemeProvider>
      <SessionProvider>
        <AuthServiceProvider>
          <TransferServiceProvider>
            <BillsServiceProvider>
              <CardsServiceProvider>
                <SubscriptionsServiceProvider>
                  <WealthServiceProvider>
                    <AssistantServiceProvider>
                      <HomeServiceProvider>
                        <ProfileServiceProvider>
                          <ToastProvider>
                            <RouterProvider router={router} />
                          </ToastProvider>
                        </ProfileServiceProvider>
                      </HomeServiceProvider>
                    </AssistantServiceProvider>
                  </WealthServiceProvider>
                </SubscriptionsServiceProvider>
              </CardsServiceProvider>
            </BillsServiceProvider>
          </TransferServiceProvider>
        </AuthServiceProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
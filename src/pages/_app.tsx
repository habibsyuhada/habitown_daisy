import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useEffect } from "react";
import { useAppSelector } from "@/hooks/redux";
import type { RootState } from '@/store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Wrapper component to handle theme initialization
function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((state: RootState) => state.theme.current);

  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeInitializer>
          <Component {...pageProps} />
        </ThemeInitializer>
      </QueryClientProvider>
    </Provider>
  );
}

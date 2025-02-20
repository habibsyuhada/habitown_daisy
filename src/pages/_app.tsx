import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setTheme } from "@/store/themeSlice";

// Wrapper component to handle theme initialization
function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.theme.current);

  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ThemeInitializer>
        <Component {...pageProps} />
      </ThemeInitializer>
    </Provider>
  );
}

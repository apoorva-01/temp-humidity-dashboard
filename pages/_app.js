import '../styles/globals.css'
import React, { useEffect } from 'react';
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import { LayoutProvider } from "../utils/LayoutContext";
import useAppStore from '../stores/useAppStore';
import Themes from "../themes";

function ThemedApp({ Component, pageProps }) {
  const { theme } = useAppStore();
  const currentTheme = theme === 'dark' ? Themes.dark : Themes.default;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <SnackbarProvider
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Component {...pageProps} />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default function MyApp({ Component, pageProps }) {
  // Remove JSS server-side styles
  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <LayoutProvider>
      <ThemedApp Component={Component} pageProps={pageProps} />
    </LayoutProvider>
  );
}


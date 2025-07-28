import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
// components
import Devices from "../components/Data/Devices";
import Layout from "../Layout/Layout"
import useAppStore from '../stores/useAppStore';
import { useRouter } from 'next/router';

export async function getServerSideProps(ctx) {
  const { req, res } = ctx;
  
  try {
    // Check for auth token in cookies
    const token = req.cookies.token;
    if (!token) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // If we have a token, return success
    return {
      props: {
        isAuthenticated: true
      }
    };
  } catch (error) {
    console.error('Error in devices page:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}

export default function DevicePage({ isAuthenticated }) {
  const { user } = useAppStore();
  const router = useRouter();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Add router event listeners for loading state
    const handleStart = (url) => {
      if (url.startsWith('/device-info')) {
        setIsLoading(true);
      }
    };
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Show loading state while checking auth
  if (!isAuthenticated) {
    return (
      <Layout>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh' 
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ 
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        p: 3
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 5,
            color: theme.palette.text.primary,
            fontWeight: 600
          }}
        >
          Devices
        </Typography>
        <Devices />
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}
          open={isLoading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="primary" />
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                color: 'white'
              }}
            >
              Loading Device Info...
            </Typography>
          </Box>
        </Backdrop>
      </Box>
    </Layout>
  );
}

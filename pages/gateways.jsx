import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
// components
import Gateways from "../components/Data/Gateways";
import Layout from "../Layout/Layout"
import useAppStore from '../stores/useAppStore';
import { useRouter } from 'next/router';

export default function GatewayPage() {
  const { user, isAuthenticated } = useAppStore();
  const router = useRouter();
  const theme = useTheme();
  
  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

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
          Gateways
        </Typography>
        <Gateways />
      </Box>
    </Layout>
  );
}

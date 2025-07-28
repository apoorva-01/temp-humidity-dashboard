import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { ResponsiveContainer } from "recharts";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import Layout from "../../Layout/Layout"
import { useRouter } from 'next/router'
import useAppStore from '../../stores/useAppStore';
import GatewayInfo from "../../components/Data/GatewayInfo";
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function GatewayPage({ }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const { id } = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const Gatewaysdata = {
    labels: ["Off", "Active", "Never Seen"],
    datasets: [
      {
        label: "Status",
        data: [0, 1, 0],
        backgroundColor: [
          theme.palette.error.main + '33',  // Off - with 20% opacity
          theme.palette.info.main + '33',   // Active - with 20% opacity
          theme.palette.warning.main + '33', // Never Seen - with 20% opacity
        ],
        borderColor: [
          theme.palette.error.main,
          theme.palette.info.main,
          theme.palette.warning.main,
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
            size: isMobile ? 12 : 14
          }
        }
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        bodyFont: {
          family: theme.typography.fontFamily
        },
        titleFont: {
          family: theme.typography.fontFamily,
          weight: 'bold'
        }
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  return (
    <Layout>
      <Box sx={{ width: '100%', p: isMobile ? 2 : 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <GatewayInfo gatewayID={id} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Gateway Status" 
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  '& .MuiCardHeader-title': {
                    fontSize: '1.2rem',
                    fontWeight: 500,
                    color: '#fff'
                  }
                }}
              />
              <CardContent sx={{ height: isMobile ? '300px' : '400px', p: 2 }}>
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                  <Doughnut data={Gatewaysdata} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}



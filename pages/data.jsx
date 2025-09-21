import React, { useEffect } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Layout from "../Layout/Layout"
import Entries from '../models/Entries';
import db from '../utils/db';
import useAppStore from '../stores/useAppStore';
import { useRouter } from 'next/router';
import { getAllowedDeviceEUIs } from '../utils/deviceConfig';
import { formatDateForDisplay } from '../utils/dateUtils';

export default function Payload({ entries }) {
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
        width: '100%',
        p: 3
      }}>
        <Typography variant="h4" sx={{ mb: 3, color: theme.palette.text.primary }}>
          Device Data History
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Latest {entries.length} entries
        </Typography>
        
        <TableContainer 
          component={Paper} 
          sx={{ 
            maxWidth: '100%',
            overflowX: 'auto',
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.customShadows.widget
          }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="device data table">
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100]
              }}>
                <TableCell>Device Name</TableCell>
                <TableCell>Device EUI Number</TableCell>
                <TableCell>Humidity % RH</TableCell>
                <TableCell>Temperature °C</TableCell>
                <TableCell>Date-Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((element) => {
                var formattted_time = formatDateForDisplay(element.timestamp);
                return (
                  <TableRow 
                    key={element._id || element.timestamp}
                    sx={{ 
                      '&:nth-of-type(odd)': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? theme.palette.grey[900] 
                          : theme.palette.grey[50]
                      },
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }}
                  >
                    <TableCell>{element.deviceName}</TableCell>
                    <TableCell>{element.devEUI}</TableCell>
                    <TableCell>{parseFloat(element.humidity).toFixed(2)}</TableCell>
                    <TableCell>{parseFloat(element.temperature).toFixed(2)}</TableCell>
                    <TableCell>{formattted_time}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    await db.connect();
    
    // Get allowed device EUIs from configuration
    const allowedEUIs = getAllowedDeviceEUIs();
    
    // Filter entries to only include allowed device EUIs
    const entries = await Entries.find({ 
      devEUI: { $in: allowedEUIs } 
    }).sort({ 'timestamp': -1 }).limit(300).lean();
    
    await db.disconnect();
    
    return {
      props: {
        entries: entries.map(db.convertDocToObj),
      },
    };
  } catch (error) {
    console.error('Error fetching entries:', error);
    await db.disconnect();
    
    return {
      props: {
        entries: [],
      },
    };
  }
}

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  TablePagination
} from "@mui/material";
import { filterAllowedDevices } from "../../utils/deviceConfig";
import { formatDateForDisplay } from "../../utils/dateUtils";
var _ = require("lodash");

export default function Devices() {
  const [devices, setDevices] = useState({
    totalCount: 0,
    result: [],
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const requestOptions = {
          method: "GET",
          headers: {
            "Grpc-Metadata-Authorization": 'Bearer ' + process.env.NEXT_PUBLIC_CHIRPSTACK_API_KEY_SECRET,
          },
        };
        
        const offset = page * rowsPerPage;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CHIRPSTACK_URL}/api/devices?limit=${rowsPerPage}&offset=${offset}&applicationID=${process.env.NEXT_PUBLIC_CHIRPSTACK_APPLICATION_ID}`,
          requestOptions
        );
        const data = await response.json();
        
        // Filter devices to only show allowed EUIs
        const filteredDevices = filterAllowedDevices(data.result || []);
        
        setDevices({ 
          result: filteredDevices, 
          totalCount: filteredDevices.length 
        });
      } catch (error) {
        console.error('Error fetching devices:', error);
        alert('Please check your internet connection. Either there is no internet connection or the signals are weak');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const array = _.toArray(devices.result);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper 
      sx={{ 
        maxWidth: '100%',
        overflowX: 'auto',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.customShadows.widget
      }}
    >
      <TableContainer>
        <Table aria-label="devices table">
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: theme.palette.primary.main,
              '& th': { 
                color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.common.white,
                fontSize: '1rem',
                fontWeight: 600,
                padding: '16px',
              }
            }}>
              <TableCell>Device EUI Number</TableCell>
              <TableCell>Device Name</TableCell>
              <TableCell>Last Seen At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {array.map((element) => {
              const formattted_last_seen = element.lastSeenAt 
                ? formatDateForDisplay(element.lastSeenAt)
                : 'Never Seen';
                
              return (
                <TableRow 
                  key={element.devEUI}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.palette.action.hover 
                    },
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Link 
                      href={`/device-info/${element.devEUI}`} 
                      passHref
                      style={{ 
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {element.devEUI}
                    </Link>
                  </TableCell>
                  <TableCell>{element.name}</TableCell>
                  <TableCell>{formattted_last_seen}</TableCell>
                </TableRow>
              );
            })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={parseInt(devices.totalCount, 10)}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        />
      </Paper>
    );
  }

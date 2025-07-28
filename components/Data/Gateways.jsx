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
  CircularProgress,
  TablePagination
} from "@mui/material";
var _ = require("lodash");

export default function Gateways() {
  const [gateways, setGateways] = useState({
    totalCount: 0,
    result: []
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchGateways = async () => {
      setLoading(true);
      try {
        const requestOptions = {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Grpc-Metadata-Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_CHIRPSTACK_API_KEY_SECRET,
          },
        };
        
        const offset = page * rowsPerPage;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CHIRPSTACK_URL}/api/gateways?limit=${rowsPerPage}&offset=${offset}&organizationID=${process.env.NEXT_PUBLIC_CHIRPSTACK_ORGANISATION_ID}`,
          requestOptions
        );
        const data = await response.json();
        setGateways({ result: data.result || [], totalCount: data.totalCount || 0 });
      } catch (error) {
        console.error('Error fetching gateways:', error);
        alert('Please check your internet connection. Either there is no internet connection or the signals are weak');
      } finally {
        setLoading(false);
      }
    };

    fetchGateways();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const array = _.toArray(gateways.result);

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
        <Table aria-label="gateways table">
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
              <TableCell>Gateway ID</TableCell>
              <TableCell>Gateway Name</TableCell>
              <TableCell>Last Seen At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {array.map((element) => {
              const formattted_last_seen = element.lastSeenAt 
                ? new Date(element.lastSeenAt).toLocaleString()
                : 'Never Seen';

              return (
                <TableRow 
                  key={element.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.palette.action.hover 
                    },
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Link 
                      href={`/gateway-info/${element.id}`} 
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
                      {element.id}
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
        count={parseInt(gateways.totalCount, 10)}
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


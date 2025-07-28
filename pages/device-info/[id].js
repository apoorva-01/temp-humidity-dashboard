import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { format, addDays } from 'date-fns';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SaveIcon from '@mui/icons-material/Save';
import Entries from '../../models/Entries';
import DeviceCalibration from '../../models/DeviceCalibration';
import db from '../../utils/db';
import { ResponsiveContainer } from "recharts";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ListItem from "@mui/material/ListItem";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import axios from "axios";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import OutboundIcon from "@mui/icons-material/Outbound";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import Layout from "../../Layout/Layout"
import useAppStore from '../../stores/useAppStore';
import { useSnackbar } from 'notistack';
import DeviceInfo from "../../components/Data/DeviceInfo";
import DatePickerComponent from "../../components/DatePickerComponent/DatePickerComponent";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useRouter } from 'next/router';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TuneIcon from '@mui/icons-material/Tune';
import RefreshIcon from '@mui/icons-material/Refresh';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  ChartTooltip,
  Legend,
  Filler
);

export default function DevicePage({ tempArray, humArray, deviceCalibration }) {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAppStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.isAdmin || false;
  
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0);

  useEffect(() => {
    // Only show loading state for initial load, not the notification
    const initialLoad = async () => {
      setLoading(true);
      try {
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_Chart_API_Python_Link}`, {
          start_date: startDate,
          end_date: endDate,
          deviceEUI: id
        });
        setTempMinArray(data.tempData.minArray);
        setTempMaxArray(data.tempData.maxArray);
        setTempAvgArray(data.tempData.avgArray);
        setHumMinArray(data.humData.minArray);
        setHumMaxArray(data.humData.maxArray);
        setHumAvgArray(data.humData.avgArray);
      } catch (e) {
        console.error('Error loading initial data:', e);
        enqueueSnackbar('Error loading initial data', { 
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' }
        });
      } finally {
        setLoading(false);
      }
    };
    
    initialLoad();
  }, []);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [startDate, SetStartDate] = useState(format(currentDate, "yyyy-MM-dd"));
  const [endDate, SetEndDate] = useState(format(addDays(currentDate, 1), "yyyy-MM-dd"));
  const [current_humidity_calibration, setCurrent_humidity_calibration] = useState(deviceCalibration?.humidity_calibration);
  const [current_temperature_calibration, setCurrent_temperature_calibration] = useState(deviceCalibration?.temperature_calibration);

  const [tempMinArray, setTempMinArray] = useState([]);
  const [tempMaxArray, setTempMaxArray] = useState([]);
  const [tempAvgArray, setTempAvgArray] = useState([]);
  const [humMinArray, setHumMinArray] = useState([]);
  const [humMaxArray, setHumMaxArray] = useState([]);
  const [humAvgArray, setHumAvgArray] = useState([]);

  async function chartDataFilter() {
    closeSnackbar();
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_Chart_API_Python_Link}`, {
        start_date: startDate,
        end_date: endDate,
        deviceEUI: id
      });
      setTempMinArray(data.tempData.minArray);
      setTempMaxArray(data.tempData.maxArray);
      setTempAvgArray(data.tempData.avgArray);
      setHumMinArray(data.humData.minArray);
      setHumMaxArray(data.humData.maxArray);
      setHumAvgArray(data.humData.avgArray);
      
      // Only show success notification for manual refresh
      enqueueSnackbar('Data filtered successfully', { 
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      });
    } catch (e) {
      console.error('Error filtering data:', e);
      enqueueSnackbar('Error filtering data', { 
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateCallibration() {
    closeSnackbar();
    setLoading(true);
    try {
      await axios.put('/api/device-calibration/set-device-calibration', {
        temperatureCalibration: current_temperature_calibration,
        humidityCalibration: current_humidity_calibration,
        devEUI: id
      });
      enqueueSnackbar('Calibration updated successfully', { 
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      });
    } catch (err) {
      console.error('Error updating calibration:', err);
      enqueueSnackbar('Error updating calibration', { 
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      });
    } finally {
      setLoading(false);
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          boxWidth: isMobile ? 10 : 20,
          padding: isMobile ? 10 : 20,
          font: {
            family: theme.typography.fontFamily,
            size: isMobile ? 10 : 12
          }
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 10,
        bodyFont: {
          family: theme.typography.fontFamily
        },
        titleFont: {
          family: theme.typography.fontFamily,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: isMobile ? 5 : 8,
          font: {
            family: theme.typography.fontFamily,
            size: isMobile ? 10 : 12
          }
        },
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        }
      },
      x: {
        ticks: {
          maxTicksLimit: isMobile ? 6 : 12,
          maxRotation: isMobile ? 45 : 0,
          font: {
            family: theme.typography.fontFamily,
            size: isMobile ? 10 : 12
          }
        },
        grid: {
          display: false
        }
      },
    },
  };

  const Temperaturedata = {
    labels: ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", 
             "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"],
    datasets: [
      {
        label: "Min Temperature",
        data: tempMinArray,
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.light + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: "Max Temperature",
        data: tempMaxArray,
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.light + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: "Average Temperature",
        data: tempAvgArray,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
    ],
  };

  const Humiditydata = {
    labels: ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", 
             "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"],
    datasets: [
      {
        label: "Min Humidity",
        data: humMinArray,
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.light + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: "Max Humidity",
        data: humMaxArray,
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.light + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: "Average Humidity",
        data: humAvgArray,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
    ],
  };

  return (
    <Layout>
      <Box sx={{ width: '100%', p: isMobile ? 2 : 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DeviceInfo deviceID={id} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            {isAdmin && (
              <Card>
                <CardHeader
                  title="Data Filter"
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Refresh Data">
                        <IconButton 
                          onClick={chartDataFilter}
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <DatePickerComponent
                        startDate={startDate}
                        SetStartDate={SetStartDate}
                        endDate={endDate}
                        SetEndDate={SetEndDate}
                      />
                    </Grid>
                    
                    <Grid item xs={12} container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Temperature Calibration"
                          type="number"
                          value={current_temperature_calibration}
                          onChange={(e) => setCurrent_temperature_calibration(e.target.value)}
                          InputProps={{
                            endAdornment: <Typography variant="caption">°C</Typography>
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Humidity Calibration"
                          type="number"
                          value={current_humidity_calibration}
                          onChange={(e) => setCurrent_humidity_calibration(e.target.value)}
                          InputProps={{
                            endAdornment: <Typography variant="caption">%</Typography>
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={updateCallibration}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          sx={{
                            color: '#fff', // Ensures text color is white for contrast on primary button
                            fontWeight: 600
                          }}
                        >
                          Update Calibration
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {!isAdmin && (
              <Card>
                <CardHeader
                  title="Data Filter"
                  action={
                    <Tooltip title="Refresh Data">
                      <IconButton 
                        onClick={chartDataFilter}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <DatePickerComponent
                        startDate={startDate}
                        SetStartDate={SetStartDate}
                        endDate={endDate}
                        SetEndDate={SetEndDate}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Temperature Trends" 
                subheader="24-hour temperature variation"
              />
              <Divider />
              <CardContent sx={{ height: isMobile ? '300px' : '400px', p: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <Line data={Temperaturedata} options={chartOptions} />
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Humidity Trends" 
                subheader="24-hour humidity variation"
              />
              <Divider />
              <CardContent sx={{ height: isMobile ? '300px' : '400px', p: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <Line data={Humiditydata} options={chartOptions} />
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const { id } = ctx.query;
  const { req } = ctx;

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

  await db.connect();
  const result = await Entries.find({ devEUI: id }).lean()
  const deviceCalibration = await DeviceCalibration.find({ devEUI: id }).lean();
  await db.disconnect();

  if (result.length > 0) {
    return {
      props: {
        tempArray: [],
        humArray: [],
        deviceCalibration:  JSON.parse(JSON.stringify(deviceCalibration.map(db.convertDocToObj)))[0]
      },
    };
  }
  else {
    return {
      props: {
        tempArray: [],
        humArray: [],
        deviceCalibration: JSON.parse(JSON.stringify(deviceCalibration.map(db.convertDocToObj)))[0]
      },
    };
  }
}
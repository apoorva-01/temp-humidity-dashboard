import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import moment from 'moment'
import axios from 'axios';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Layout from "../Layout/Layout"
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import Box from "@mui/material/Box";
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button";
import DatePickerComponent from "../components/DatePickerComponent/DatePickerComponent";
import { ResponsiveContainer } from "recharts"
import { Line } from "react-chartjs-2";
import { DashboardSkeleton } from "../components/ui/Loading/LoadingSkeletons";
import useAppStore from "../stores/useAppStore";
import { getAllowedDeviceEUIs } from "../utils/deviceConfig";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DeviceCompare() {
    const router = useRouter();
    const { isAuthenticated, initialize } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0);
    const abortControllerRef = React.useRef(null);
    
    // Get allowed device EUIs and create dynamic structure
    const allowedEUIs = getAllowedDeviceEUIs();
    const deviceSuffixes = allowedEUIs.map(eui => eui.slice(-4));
    
    // Create initial state structure dynamically
    const createInitialFetchedData = () => {
        const data = {};
        deviceSuffixes.forEach(suffix => {
            data[`tempData${suffix}`] = [];
            data[`humData${suffix}`] = [];
        });
        return data;
    };

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        chartDataFilter();
    }, [isAuthenticated, router]);

    // If not authenticated, show loading skeleton
    if (!isAuthenticated) {
        return <Layout><DashboardSkeleton /></Layout>;
    }

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [startDate, SetStartDate] = useState(moment(currentDate, "YYYY-MM-DDTHH:mm:ss").format("YYYY-MM-DD"));
    const [endDate, SetEndDate] = useState(moment(currentDate, "YYYY-MM-DDTHH:mm:ss").add(1, 'days').format("YYYY-MM-DD"));
    const [fetchedData, SetFetchedData] = useState(createInitialFetchedData());

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 5000; // 5 seconds

    async function chartDataFilter(retryCount = 0) {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        closeSnackbar();
        setError(null);
        setIsLoading(true);
        try {
            // Create axios instance with custom config
            const axiosInstance = axios.create({
                httpsAgent: new (require('https').Agent)({  
                    rejectUnauthorized: false
                }),
                timeout: 60000, // Increase timeout to 60 seconds
                signal,
            });

            const baseUrl = process.env.NEXT_PUBLIC_Chart_API_Python_Link?.replace(/\/+$/, '');

            if (!baseUrl) {
                throw new Error('API URL is not configured');
            }

            const { data } = await axiosInstance.post(`${baseUrl}/all-devices-comparison`, {
                start_date: startDate,
                end_date: endDate,
                device_euis: allowedEUIs
            });
            SetFetchedData(data);
            enqueueSnackbar('Data loaded successfully', { variant: 'success' });
        }
        catch (e) {
            if (axios.isCancel(e)) {
                console.log("Request canceled:", e.message);
                return;
            }
            console.error('Error fetching data:', e);
            
            // Retry logic for timeout errors
            if (e.code === 'ECONNABORTED' && retryCount < MAX_RETRIES) {
                enqueueSnackbar(`Request timed out. Retrying in ${RETRY_DELAY/1000} seconds...`, { 
                    variant: 'warning',
                    autoHideDuration: RETRY_DELAY
                });
                await sleep(RETRY_DELAY);
                return chartDataFilter(retryCount + 1);
            }

            setError(e.message || 'Error fetching data');
            enqueueSnackbar(
                `Error loading data${retryCount > 0 ? ' after ' + (retryCount + 1) + ' attempts' : ''}. Please try again later.`, 
                { variant: 'error' }
            );
        }
        finally {
            setIsLoading(false);
        }
    }

    const [value, setValue] = React.useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // Define colors for each zone
    const zoneColors = ['red', 'green', 'violet', 'orange', 'blue', 'black', 'purple', 'brown', 'pink', 'gray'];

    // Helper function to create chart data dynamically
    const createChartData = (dataType, metric) => {
        const labels = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];
        
        const datasets = deviceSuffixes.map((suffix, index) => ({
            label: `Zone ${index + 1}`,
            data: fetchedData[`${dataType}Data${suffix}`]?.[`${metric}Array`] || [],
            borderColor: zoneColors[index % zoneColors.length],
            borderWidth: 1,
        }));

        return { labels, datasets };
    };

    // Create dynamic chart data
    const MaxHumiditydata = createChartData('hum', 'max');
    const MaxTemperaturedata = createChartData('temp', 'max');
    const AverageHumiditydata = createChartData('hum', 'avg');
    const AverageTemperaturedata = createChartData('temp', 'avg');
    const MinHumiditydata = createChartData('hum', 'min');
    const MinTemperaturedata = createChartData('temp', 'min');


    return (
        <Layout>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Filter by Date Range
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm>
                  <DatePickerComponent
                    startDate={startDate}
                    SetStartDate={SetStartDate}
                    endDate={endDate}
                    SetEndDate={SetEndDate}
                  />
                </Grid>
                <Grid item xs={12} sm="auto">
                  <Button 
                    fullWidth
                    onClick={() => chartDataFilter()} 
                    variant="contained"
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <FilterAltIcon />}
                    disabled={isLoading}
                    style={{ color: '#fff' }}
                  >
                    {isLoading ? 'Loading...' : 'Filter'}
                  </Button>
                </Grid>
              </Grid>
              {error && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                    {error}
                </Alert>
              )}
            </Paper>
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList centered onChange={handleChange} aria-label="lab API tabs example">
                            <Tab label="Average" value="1" />
                            <Tab label="Minimum" value="2" />
                            <Tab label="Maximum" value="3" />
                        </TabList>
                    </Box>

                    <TabPanel value="1">
                        <Grid container spacing={2}>
                            <Grid item sm={12} md={6}>
                                <div style={{ border: "2px solid #9013FE", borderRadius: "1rem" }} >
                                    <ResponsiveContainer className="p-0" width="100%" height="100%">
                                        <>
                                            <div
                                                className="p-1"
                                                style={{
                                                    backgroundColor: "#9013FE",
                                                    borderRadius: "1rem",
                                                    color: "#fff",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <h5>Temperature Trend</h5>
                                            </div>
                                            <div style={{ padding: "3px" }}>
                                                <Line
                                                    height={150}
                                                    data={AverageTemperaturedata}
                                                />
                                            </div>
                                        </>
                                    </ResponsiveContainer>
                                </div>
                            </Grid>
                            <Grid item sm={12} md={6}>
                                <div style={{ border: "2px solid #9013FE", borderRadius: "1rem" }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <>
                                            <div
                                                className="p-1"
                                                style={{
                                                    backgroundColor: "#9013FE",
                                                    borderRadius: "1rem",
                                                    color: "#fff",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <h5>Humidity Trend</h5>
                                            </div>
                                            <div style={{ padding: "3px" }}>
                                                <Line
                                                    height={150}
                                                    data={AverageHumiditydata}

                                                />
                                            </div>
                                        </>
                                    </ResponsiveContainer>
                                </div>
                            </Grid>
                        </Grid>






                    </TabPanel>
                    <TabPanel value="2">

                    <Grid container spacing={2}>
                            <Grid item sm={12} md={6}>
                                <div style={{ border: "2px solid #9013FE", borderRadius: "1rem" }} >
                                    <ResponsiveContainer className="p-0" width="100%" height="100%">
                                        <>
                                            <div
                                                className="p-1"
                                                style={{
                                                    backgroundColor: "#9013FE",
                                                    borderRadius: "1rem",
                                                    color: "#fff",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <h5>Temperature Trend</h5>
                                            </div>
                                            <div style={{ padding: "3px" }}>
                                                <Line
                                                    height={150}
                                                    data={MinTemperaturedata}
                                                />
                                            </div>
                                        </>
                                    </ResponsiveContainer>
                                </div>
                                </Grid>
                            <Grid item sm={12} md={6}>
                                <div style={{ border: "2px solid #9013FE", borderRadius: "1rem" }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <>
                                            <div
                                                className="p-1"
                                                style={{
                                                    backgroundColor: "#9013FE",
                                                    borderRadius: "1rem",
                                                    color: "#fff",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <h5>Humidity Trend</h5>
                                            </div>
                                            <div style={{ padding: "3px" }}>
                                                <Line
                                                    height={150}
                                                    data={MinHumiditydata}

                                                />
                                            </div>
                                        </>
                                    </ResponsiveContainer>
                                </div>
                                </Grid>
                        </Grid>




                    </TabPanel>
                    <TabPanel value="3">

                    <Grid container spacing={2}>
                            <Grid item sm={12} md={6}>
                                <div style={{ border: "2px solid #9013FE", borderRadius: "1rem" }} >
                                    <ResponsiveContainer className="p-0" width="100%" height="100%">
                                        <>
                                            <div
                                                className="p-1"
                                                style={{
                                                    backgroundColor: "#9013FE",
                                                    borderRadius: "1rem",
                                                    color: "#fff",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <h5>Temperature Trend</h5>
                                            </div>
                                            <div style={{ padding: "3px" }}>
                                                <Line
                                                    height={150}
                                                    data={MaxTemperaturedata}
                                                />
                                            </div>
                                        </>
                                    </ResponsiveContainer>
                                </div>
                                </Grid>
                            <Grid item sm={12} md={6}>
                                <div style={{ border: "2px solid #9013FE", borderRadius: "1rem" }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <>
                                            <div
                                                className="p-1"
                                                style={{
                                                    backgroundColor: "#9013FE",
                                                    borderRadius: "1rem",
                                                    color: "#fff",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <h5>Humidity Trend</h5>
                                            </div>
                                            <div style={{ padding: "3px" }}>
                                                <Line
                                                    height={150}
                                                    data={MaxHumiditydata}

                                                />
                                            </div>
                                        </>
                                    </ResponsiveContainer>
                                </div>
                                </Grid>
                        </Grid>




                    </TabPanel>
                </TabContext>
            </Box>
        </Layout>
    );
}

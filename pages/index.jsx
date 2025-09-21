import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Layout from "../Layout/Layout";
import useDeviceStore from "../stores/useDeviceStore";
import useAppStore from "../stores/useAppStore";
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import { DashboardSkeleton, ErrorState, EmptyState } from "../components/ui/Loading/LoadingSkeletons";
import { DeviceDataExporter } from "../utils/dataExport";
import Organisation from "../models/Organisation";
import db from '../utils/db';
import PageTitle from "../components/ui/PageTitle/PageTitle";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TempGauge from "../components/ui/LiveData/TempGauge";
import HumidityGauge from "../components/ui/LiveData/HumidityGauge";
import RouterIcon from '@mui/icons-material/Router';
import WifiIcon from '@mui/icons-material/Wifi';
import WarningIcon from '@mui/icons-material/Warning';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { formatLastSeen, getMinutesSince, isDeviceOnline } from "../utils/dateUtils";

const StatWidget = ({ title, value, change, icon, color, alertZones }) => {
  const theme = useTheme();
  const ChangeIcon = change > 0 ? ArrowUpwardIcon : ArrowDownwardIcon;
  const changeColor = change > 0 ? theme.palette.success.main : theme.palette.error.main;

  // Create alert tooltip content
  const getAlertTooltipContent = () => {
    if (!alertZones || alertZones.length === 0) return "";
    
    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" gutterBottom>Zones in Alert:</Typography>
        {alertZones.map((zone, index) => (
          <Typography key={index} variant="body2" sx={{ color: 'inherit' }}>
            {zone.name}: {zone.tempAlert ? '🌡️' : ''}{zone.humAlert ? '💧' : ''} 
            ({zone.temp.toFixed(1)}°C, {zone.hum.toFixed(1)}%)
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Tooltip 
      title={title === "IN ALERT" && alertZones?.length > 0 ? getAlertTooltipContent() : ""}
      placement="bottom"
      arrow
    >
      <Card sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: theme.spacing(2), 
        boxShadow: theme.customShadows.widget, 
        borderRadius: '12px',
        cursor: title === "IN ALERT" && alertZones?.length > 0 ? 'pointer' : 'default'
      }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: color + '20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          fontSize: '2rem'
        }}>
          {icon}
        </Box>
      </Card>
    </Tooltip>
  );
};

const trafficData = [
  { name: 'Jan 00', Website: 400, Blog: 240, Social: 200 },
  { name: 'Jan 02', Website: 300, Blog: 139, Social: 221 },
  { name: 'Jan 03', Website: 200, Blog: 980, Social: 229 },
  { name: 'Jan 04', Website: 278, Blog: 390, Social: 200 },
  { name: 'Jan 05', Website: 189, Blog: 480, Social: 218 },
  { name: 'Jan 06', Website: 239, Blog: 380, Social: 250 },
  { name: 'Jan 07', Website: 349, Blog: 430, Social: 210 },
  { name: 'Jan 08', Website: 450, Blog: 220, Social: 280 },
  { name: 'Jan 09', Website: 320, Blog: 550, Social: 190 },
  { name: 'Jan 10', Website: 210, Blog: 330, Social: 240 },
  { name: 'Jan 11', Website: 360, Blog: 470, Social: 260 },
  { name: 'Jan 12', Website: 180, Blog: 280, Social: 150 },
];

const incomeData = [{ name: 'Percent', value: 75 }];
const incomeColors = ['#4caf50', '#E0E0E0'];

function DeviceCard({ device }) {
  const theme = useTheme();
  const isAlert = !device.isWithinNormalRange;
  const lastSeenMinutes = getMinutesSince(device.timestamp);
  const isOnline = isDeviceOnline(device.timestamp);
  const lastSeenFormatted = formatLastSeen(device.timestamp);

  return (
    <Card sx={{ 
      boxShadow: theme.customShadows.widget, 
      borderRadius: '12px',
      borderTop: `4px solid ${isAlert ? theme.palette.error.main : (isOnline ? theme.palette.success.main : theme.palette.grey[400])}`
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
                <Typography variant="h6">{device.deviceName}</Typography>
                <Typography variant="body2" color="textSecondary">Last seen: {lastSeenFormatted}</Typography>
            </Box>
            <Chip
                size="small"
                label={isOnline ? 'Online' : 'Offline'}
                color={isOnline ? 'success' : 'error'}
                variant="filled"
            />
        </Box>
        <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="h6" align="center" gutterBottom>
                Temperature
              </Typography>
              <Box display="flex" justifyContent="center">
                <TempGauge value={device.temperature} />
              </Box>
              <Typography variant="h5" align="center" sx={{mt: 1, fontWeight: 'bold'}}>{device.temperature.toFixed(1)}°C</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6" align="center" gutterBottom>
                Humidity
              </Typography>
              <Box display="flex" justifyContent="center">
                <HumidityGauge value={device.humidity} />
              </Box>
              <Typography variant="h5" align="center" sx={{mt: 1, fontWeight: 'bold'}}>{device.humidity.toFixed(1)}%</Typography>
            </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

function Dashboard({ stats, zones, onRefresh, onExport, isRefreshing }) {
  const theme = useTheme();

  return (
    <Box>
       {/* <PageTitle title="Minimal Dashboard" breadcrumbs={[{ label: 'Dashboards', path: '/' }, { label: 'Minimal Dashboard' }]} /> */}
       
       <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ mb: 2 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={onRefresh} disabled={isRefreshing} color="primary">
              <RefreshIcon sx={{ transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 1s' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Data">
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => onExport('excel')} size="small">
              Export
            </Button>
          </Tooltip>
        </Box>

       <Grid container spacing={4}>
        {/* Stat Widgets */}
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget title="TOTAL DEVICES" value={stats.totalDevices || 0} color={theme.palette.success.main} icon={<RouterIcon fontSize="inherit" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget title="ONLINE NOW" value={stats.onlineDevices || 0} color={theme.palette.primary.main} icon={<WifiIcon fontSize="inherit"/>} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget 
            title="IN ALERT" 
            value={stats.alertsCount || 0} 
            color={theme.palette.error.main} 
            icon={<WarningIcon fontSize="inherit"/>}
            alertZones={stats.alertZones} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget title="AVG. TEMP" value={`${stats.averageTemperature || 0}°C`} color={theme.palette.warning.main} icon={<ThermostatIcon fontSize="inherit"/>} />
        </Grid>

        {/* Traffic Sources Chart */}
        {/* <Grid item xs={12} lg={8}>
          <Card sx={{ p: 2, boxShadow: theme.customShadows.widget, borderRadius: '12px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Traffic Sources</Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke={theme.palette.success.main} tickLine={false} axisLine={false} />
                  <RechartsTooltip />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar yAxisId="left" dataKey="Website" fill={theme.palette.primary.main} />
                  <Line yAxisId="right" type="monotone" dataKey="Blog" stroke={theme.palette.success.main} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid> */}

        {/* Income Chart */}
        {/* <Grid item xs={12} lg={4}>
          <Card sx={{ p: 2, boxShadow: theme.customShadows.widget, borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Income</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                    stroke="none"
                  >
                     {incomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={incomeColors[index % incomeColors.length]} />
                    ))}
                  </Pie>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="32" fontWeight="bold">
                    75%
                  </text>
                </PieChart>
              </ResponsiveContainer>
              <Typography variant="subtitle1" align="center">32% Spendings Target</Typography>
            </CardContent>
          </Card>
        </Grid> */}

        {/* Devices List */}
        <Grid item xs={12}>
          {/* <Typography variant="h6" gutterBottom>Devices</Typography> */}
          <Grid container spacing={4}>
            {zones && zones.length > 0 ? (
              zones.map(device => (
                <Grid item xs={12} sm={6} md={4} key={device.deviceName}>
                  <DeviceCard device={device} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography>No devices to display.</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
       </Grid>
    </Box>
  )
}

export default function LiveData({ organisation }) {
  const router = useRouter();
  const { 
    lastEntries: devices, 
    isLoading: loading, 
    error, 
    lastUpdated,
    stats: baseStats,
    fetchDeviceData: fetchDevices, 
    startAutoRefresh,
    stopAutoRefresh,
    exportDeviceData
  } = useDeviceStore();
  
  const { 
    isAuthenticated, 
    settings,
    showError,
    showSuccess,
    initialize 
  } = useAppStore();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate stats including correct alertsCount
  const calculateStats = (devices, organisation) => {
    if (!devices || !devices.length) {
      return {
        totalDevices: 0,
        onlineDevices: 0,
        alertsCount: 0,
        averageTemperature: 0,
        alertZones: []
      };
    }

    const now = new Date();
    let totalTemp = 0;
    let onlineCount = 0;
    let alertCount = 0;
    let alertZones = [];

    // Get thresholds from organization settings
    const tempThresholds = organisation[0]?.settings?.temperatureThresholds || { min: 20, max: 26 };
    const humThresholds = organisation[0]?.settings?.humidityThresholds || { min: 40, max: 60 };

    devices.forEach(device => {
      const lastSeenMinutes = getMinutesSince(device.timestamp);
      const isOnline = isDeviceOnline(device.timestamp);

      if (isOnline) {
        onlineCount++;
        totalTemp += device.temperature;

        // Check if temperature or humidity is outside thresholds
        const isTempOutOfRange = 
          device.temperature < tempThresholds.min || 
          device.temperature > tempThresholds.max;
        
        const isHumOutOfRange = 
          device.humidity < humThresholds.min || 
          device.humidity > humThresholds.max;

        if (isTempOutOfRange || isHumOutOfRange) {
          alertCount++;
          alertZones.push({
            name: device.deviceName,
            temp: device.temperature,
            hum: device.humidity,
            tempAlert: isTempOutOfRange,
            humAlert: isHumOutOfRange
          });
        }
      }
    });

    return {
      totalDevices: devices.length,
      onlineDevices: onlineCount,
      alertsCount: alertCount,
      averageTemperature: onlineCount ? (totalTemp / onlineCount).toFixed(1) : 0,
      alertZones
    };
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDevices();
      startAutoRefresh();
    }
    return () => stopAutoRefresh();
  }, [isAuthenticated, fetchDevices, startAutoRefresh, stopAutoRefresh]);

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return <DashboardSkeleton />;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchDevices();
      showSuccess('Data refreshed successfully');
    } catch (err) {
      showError(err.message || 'An error occurred while refreshing data.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async (format = 'excel') => {
    try {
      const exporter = new DeviceDataExporter(devices);
      await exporter.export(format);
      showSuccess(`Data successfully exported to ${format.toUpperCase()}`);
    } catch (err) {
      showError(err.message || 'An error occurred while exporting data.');
    }
  };

  if (loading && !isRefreshing) {
    return <Layout><DashboardSkeleton /></Layout>;
  }

  if (error) {
    return <Layout><ErrorState message={error} onRetry={handleRefresh} /></Layout>;
  }
  
  const zones = devices?.map((device) => {
    const tempThresholds = organisation.settings?.temperatureThresholds;
    const humThresholds = organisation.settings?.humidityThresholds;

    const isTempNormal = !tempThresholds || (device.temperature >= tempThresholds.min && device.temperature <= tempThresholds.max);
    const isHumNormal = !humThresholds || (device.humidity >= humThresholds.min && device.humidity <= humThresholds.max);

    return {
      ...device,
      isWithinNormalRange: isTempNormal && isHumNormal,
    };
  }) || [];

  // Calculate current stats
  const stats = calculateStats(devices, organisation);

  return (
    <Layout>
      <Dashboard 
        stats={stats} 
        zones={zones}
        onRefresh={handleRefresh}
        onExport={handleExport}
        isRefreshing={isRefreshing}
      />
    </Layout>
  );
}

// Enhanced getServerSideProps with better error handling
export async function getServerSideProps() {
  try {
    await db.connect();
    const organisation = await Organisation.find({}).lean();
    await db.disconnect();
    
    return {
      props: {
        organisation: organisation.map(db.convertDocToObj),
      },
    };
  } catch (error) {
    console.error('Error fetching organization data:', error);
    await db.disconnect();
    
    return {
      props: {
        organisation: [{
          Alert: '',
          name: 'Default Organization'
        }],
      },
    };
  }
}

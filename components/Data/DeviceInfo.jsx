import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CircularProgress from '@mui/material/CircularProgress';
import { format } from 'date-fns';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function DeviceInfo({ deviceID }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CHIRPSTACK_URL}/api/devices/${deviceID}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Grpc-Metadata-Authorization": `Bearer ${process.env.NEXT_PUBLIC_CHIRPSTACK_API_KEY_SECRET}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch device info');
        }
        
        const data = await response.json();
        setDeviceInfo({
          devEUI: data.device.devEUI,
          tags: data.device.tags,
          variables: data.device.variables,
          skipFCntCheck: data.device.skipFCntCheck,
          referenceAltitude: data.device.referenceAltitude,
          name: data.device.name,
          deviceProfileID: data.device.deviceProfileID,
          description: data.device.description,
          applicationID: data.device.applicationID,
          deviceStatusMargin: data.deviceStatusMargin,
          deviceStatusBattery: data.deviceStatusBattery,
          location: data.location,
          lastSeenAt: data.lastSeenAt,
        });
      } catch (err) {
        setError('Failed to load device information. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceInfo();
  }, [deviceID]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, bgcolor: '#fff3f3' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!deviceInfo) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>No device information available.</Typography>
      </Paper>
    );
  }

  const formattedLastSeen = deviceInfo.lastSeenAt 
    ? format(new Date(deviceInfo.lastSeenAt), 'PPpp')
    : 'Never';

  const InfoRow = ({ icon, label, value }) => (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        py: 1.5,
        px: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 2,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        minWidth: isMobile ? '100%' : '200px',
        color: 'primary.main'
      }}>
        {icon}
        <Typography sx={{ ml: 1, fontWeight: 500 }}>{label}</Typography>
      </Box>
      <Typography 
        sx={{ 
          flex: 1,
          wordBreak: 'break-word',
          textAlign: isMobile ? 'center' : 'left',
          width: '100%'
        }}
      >
        {value || 'N/A'}
      </Typography>
    </Box>
  );

  return (
    <Paper 
      elevation={2}
      sx={{
        mb: 4,
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <DeviceHubIcon />
        <Typography variant="h6" component="h2" sx={{ color: '#fff' }}>
          {deviceInfo.name || 'Unnamed Device'}
        </Typography>
      </Box>

      <Box>
        <InfoRow
          icon={<DeviceHubIcon />}
          label="Device EUI"
          value={deviceInfo.devEUI}
        />
        <InfoRow
          icon={<AccessTimeIcon />}
          label="Last Seen"
          value={formattedLastSeen}
        />
        <InfoRow
          icon={<BatteryChargingFullIcon />}
          label="Battery Status"
          value={`${deviceInfo.deviceStatusBattery || 0}%`}
        />
        <InfoRow
          icon={<SignalCellularAltIcon />}
          label="Signal Margin"
          value={`${deviceInfo.deviceStatusMargin || 0} dB`}
        />
        <InfoRow
          icon={<LocationOnIcon />}
          label="Location"
          value={deviceInfo.location || 'Not Available'}
        />
      </Box>

      {/* {deviceInfo.description && (
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Description
          </Typography>
          <Typography variant="body2">
            {deviceInfo.description}
          </Typography>
        </Box>
      )} */}
    </Paper>
  );
}

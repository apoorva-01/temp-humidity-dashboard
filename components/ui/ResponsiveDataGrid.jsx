import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  WifiOff as OfflineIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DeviceDataExporter } from '../../utils/dataExport';

// Custom cell renderers
const StatusChip = ({ isOnline, isAlert }) => {
  if (!isOnline) {
    return (
      <Chip
        icon={<OfflineIcon />}
        label="Offline"
        size="small"
        color="error"
        variant="outlined"
      />
    );
  }
  
  if (isAlert) {
    return (
      <Chip
        icon={<WarningIcon />}
        label="Alert"
        size="small"
        color="warning"
        variant="filled"
      />
    );
  }
  
  return (
    <Chip
      icon={<CheckCircleIcon />}
      label="Normal"
      size="small"
      color="success"
      variant="outlined"
    />
  );
};

const TemperatureCell = ({ value, min = 18, max = 25 }) => {
  const isOutOfRange = value < min || value > max;
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography
        variant="body2"
        color={isOutOfRange ? 'error' : 'textPrimary'}
        fontWeight={isOutOfRange ? 'bold' : 'normal'}
      >
        {parseFloat(value).toFixed(1)}°C
      </Typography>
      {isOutOfRange && (
        <Tooltip title="Temperature out of normal range">
          <ErrorIcon color="error" fontSize="small" />
        </Tooltip>
      )}
    </Box>
  );
};

const HumidityCell = ({ value, min = 40, max = 60 }) => {
  const isOutOfRange = value < min || value > max;
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography
        variant="body2"
        color={isOutOfRange ? 'error' : 'textPrimary'}
        fontWeight={isOutOfRange ? 'bold' : 'normal'}
      >
        {parseFloat(value).toFixed(1)}%
      </Typography>
      {isOutOfRange && (
        <Tooltip title="Humidity out of normal range">
          <ErrorIcon color="error" fontSize="small" />
        </Tooltip>
      )}
    </Box>
  );
};

const SignalStrengthCell = ({ rssi, snr }) => {
  if (!rssi) return <Typography variant="body2" color="textSecondary">N/A</Typography>;
  
  const getSignalQuality = (rssi) => {
    if (rssi > -70) return { label: 'Excellent', color: 'success' };
    if (rssi > -85) return { label: 'Good', color: 'info' };
    if (rssi > -100) return { label: 'Fair', color: 'warning' };
    return { label: 'Poor', color: 'error' };
  };
  
  const quality = getSignalQuality(rssi);
  
  return (
    <Box>
      <Typography variant="body2">
        {rssi} dBm
      </Typography>
      <Chip
        label={quality.label}
        size="small"
        color={quality.color}
        variant="outlined"
        sx={{ fontSize: '0.75rem', height: '20px' }}
      />
    </Box>
  );
};

const ResponsiveDataGrid = ({
  devices = [],
  loading = false,
  onRefresh,
  onDeviceClick,
  onExport,
  settings = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchText, setSearchText] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  // Define columns
  const columns = useMemo(() => {
    const baseColumns = [
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => {
          const isOnline = params.row.isOnline;
          const isAlert = !params.row.isWithinNormalRange;
          return <StatusChip isOnline={isOnline} isAlert={isAlert} />;
        },
        sortable: false,
        filterable: false,
      },
      {
        field: 'deviceName',
        headerName: 'Device Name',
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'temperature',
        headerName: 'Temperature',
        width: 140,
        type: 'number',
        renderCell: (params) => (
          <TemperatureCell 
            value={params.value}
            min={settings.temperatureThresholds?.min}
            max={settings.temperatureThresholds?.max}
          />
        ),
      },
      {
        field: 'humidity',
        headerName: 'Humidity',
        width: 120,
        type: 'number',
        renderCell: (params) => (
          <HumidityCell 
            value={params.value}
            min={settings.humidityThresholds?.min}
            max={settings.humidityThresholds?.max}
          />
        ),
      },
      {
        field: 'timestamp',
        headerName: 'Last Seen',
        width: 160,
        type: 'dateTime',
        valueGetter: (params) => new Date(params.value),
        renderCell: (params) => (
          <Typography variant="body2">
            {format(new Date(params.value), 'MMM dd, HH:mm')}
          </Typography>
        ),
      }
    ];

    // Add conditional columns based on settings and screen size
    if (!isMobile) {
      if (settings.dashboard?.showSignalStrength) {
        baseColumns.push({
          field: 'signal',
          headerName: 'Signal',
          width: 120,
          renderCell: (params) => (
            <SignalStrengthCell 
              rssi={params.row.rssi}
              snr={params.row.snr}
            />
          ),
          sortable: false,
        });
      }

      baseColumns.push({
        field: 'devEUI',
        headerName: 'Device EUI',
        width: 180,
        renderCell: (params) => (
          <Typography variant="body2" fontFamily="monospace" fontSize="0.875rem">
            {params.value}
          </Typography>
        ),
      });

      if (settings.dashboard?.showBatteryLevels) {
        baseColumns.push({
          field: 'batteryLevel',
          headerName: 'Battery',
          width: 100,
          type: 'number',
          renderCell: (params) => {
            if (!params.value) return <Typography variant="body2" color="textSecondary">N/A</Typography>;
            
            const getBatteryColor = (level) => {
              if (level > 60) return 'success';
              if (level > 30) return 'warning';
              return 'error';
            };

            return (
              <Chip
                label={`${params.value}%`}
                size="small"
                color={getBatteryColor(params.value)}
                variant="outlined"
              />
            );
          },
        });
      }
    }

    // Actions column
    baseColumns.push({
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => onDeviceClick?.(params.row)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton size="small">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    });

    return baseColumns;
  }, [isMobile, settings, onDeviceClick]);

  // Prepare rows data
  const rows = useMemo(() => {
    return devices.map(device => ({
      id: device._id || device.devEUI,
      ...device,
      isOnline: (() => {
        const lastSeen = new Date(device.timestamp);
        const now = new Date();
        const diffMinutes = (now - lastSeen) / (1000 * 60);
        return diffMinutes <= 10;
      })(),
    }));
  }, [devices]);

  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    
    return rows.filter(row =>
      row.deviceName.toLowerCase().includes(searchText.toLowerCase()) ||
      row.devEUI.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [rows, searchText]);

  // Handle export
  const handleExport = async (format) => {
    setExportAnchorEl(null);
    
    try {
      const exporter = new DeviceDataExporter(devices);
      
      if (format === 'excel') {
        await exporter.exportToExcel();
      } else if (format === 'csv') {
        await exporter.exportToCSV();
      } else if (format === 'json') {
        await exporter.exportToJSON();
      }
      
      onExport?.(format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <Paper sx={{ width: '100%', height: 600 }}>
      {/* Toolbar */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="h6" component="h2">
            Device Data ({filteredRows.length} devices)
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {/* Search */}
            <TextField
              size="small"
              placeholder="Search devices..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            
            {/* Filter Button */}
            <Tooltip title="Filters">
              <IconButton
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                color="primary"
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
            
            {/* Export Button */}
            <Tooltip title="Export Data">
              <IconButton
                onClick={(e) => setExportAnchorEl(e.currentTarget)}
                color="primary"
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            
            {/* Refresh Button */}
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Data Grid */}
      <DataGrid
        rows={filteredRows}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        rowsPerPageOptions={[5, 10, 25, 50]}
        loading={loading}
        disableSelectionOnClick
        disableColumnMenu={isMobile}
        density={isMobile ? 'compact' : 'standard'}
        components={{
          Toolbar: !isMobile ? GridToolbar : null,
        }}
        componentsProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={{
          border: 0,
          '& .MuiDataGrid-cell': {
            borderColor: theme.palette.divider,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.grey[50],
            borderColor: theme.palette.divider,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        initialState={{
          sorting: {
            sortModel: [{ field: 'timestamp', sort: 'desc' }],
          },
        }}
      />

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>
          Show All Devices
        </MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>
          Show Alert Devices Only
        </MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>
          Show Online Devices Only
        </MenuItem>
        <MenuItem onClick={() => setFilterAnchorEl(null)}>
          Show Offline Devices Only
        </MenuItem>
      </Menu>

      {/* Export Menu */}
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={() => setExportAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExport('excel')}>
          Export as Excel
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default ResponsiveDataGrid; 
# Device Configuration Guide

This guide explains how to configure which devices are displayed in your application.

## Configuration

The application now supports filtering devices based on their EUIs (Extended Unique Identifiers) using environment variables.

### Environment Variables

Add the following variables to your `.env` or `.env.local` file:

```bash
# Server-side filtering (for API endpoints)
DEVICE_EUIS=a8404151518379f9,a8404181e18379fd,a8404152a1837a0e,a840417eb1837a01,a84041c2718379fe,a84041b931837a0a

# Client-side filtering (for browser-side filtering) 
NEXT_PUBLIC_DEVICE_EUIS=a8404151518379f9,a8404181e18379fd,a8404152a1837a0e,a840417eb1837a01,a84041c2718379fe,a84041b931837a0a
```

### Adding/Removing Devices

To add or remove devices from the display:

1. Edit your `.env` or `.env.local` file
2. Update the `DEVICE_EUIS` and `NEXT_PUBLIC_DEVICE_EUIS` values with your desired device EUIs
3. Separate multiple EUIs with commas
4. Restart your development server for changes to take effect

**Example:**
```bash
# To show only 3 devices
DEVICE_EUIS=device1,device2,device3
NEXT_PUBLIC_DEVICE_EUIS=device1,device2,device3
```

### How It Works

The filtering occurs in four places:

1. **Dashboard (index.jsx)**: Uses the `/api/lastEntries` endpoint which filters devices server-side using the `DEVICE_EUIS` environment variable.

2. **Devices Page (devices.jsx)**: Uses the `Devices` component which filters the ChirpStack API response client-side using the `NEXT_PUBLIC_DEVICE_EUIS` environment variable.

3. **Data History Page (data.jsx)**: Filters device entries server-side during `getServerSideProps` using the `DEVICE_EUIS` environment variable to show only historical data from allowed devices.

4. **Device Comparison Page (devices-compare.jsx)**: Sends allowed device EUIs to the Python API endpoint which filters and compares data from only the configured devices.

### Default Behavior

If no environment variables are configured, the application will fall back to displaying these default devices:
- a8404151518379f9
- a8404181e18379fd
- a8404152a1837a0e
- a840417eb1837a01
- a84041c2718379fe
- a84041b931837a0a

### Files Modified

The following files have been updated to support device filtering:

- `/pages/api/lastEntries.js` - Server-side API filtering for dashboard
- `/components/Data/Devices.jsx` - Client-side device list filtering
- `/pages/data.jsx` - Server-side filtering for data history page
- `/pages/devices-compare.jsx` - Dynamic device comparison with configurable EUIs
- `/server_python_scripts/01-temp-hum-chart.py` - Python API endpoint for device comparison
- `/utils/deviceConfig.js` - Centralized device configuration utility
- `/utils/dateUtils.js` - Date utilities to prevent hydration errors
- `.env.example` - Example environment configuration

### Pages Affected

The device EUI filtering is now implemented across all major pages:

1. **Dashboard (`/`)**: Shows live device data and statistics for allowed devices only
2. **Devices Page (`/devices`)**: Lists only the configured devices from ChirpStack
3. **Data History (`/data`)**: Displays historical entries from allowed devices only (last 300 entries)
4. **Device Comparison (`/devices-compare`)**: Compares temperature and humidity trends for allowed devices only

### Troubleshooting

1. **Changes not showing**: Restart your development server after modifying environment variables
2. **No devices showing**: Check that your device EUIs are correct and exist in your system
3. **Client vs Server mismatch**: Ensure both `DEVICE_EUIS` and `NEXT_PUBLIC_DEVICE_EUIS` contain the same values
4. **Data history empty**: Verify that your allowed devices have historical data in the database
5. **Performance issues**: The data history page limits to 300 entries - adjust the limit in `data.jsx` if needed
6. **Device comparison charts empty**: Ensure your Python API server is running and the `NEXT_PUBLIC_Chart_API_Python_Link` environment variable is configured
7. **Python API errors**: Check that the Python script has been updated and restarted after modifying device EUIs
8. **Hydration errors**: The application now uses consistent date formatting utilities to prevent React hydration mismatches

### Additional Features

#### Hydration Error Prevention
The application now includes date utilities (`utils/dateUtils.js`) that ensure consistent date formatting between server and client rendering, preventing React hydration errors.

#### Dynamic Chart Generation
The device comparison page dynamically generates charts based on the configured devices, supporting any number of devices (not limited to the original 6).

#### Centralized Configuration
All device filtering logic is centralized in `utils/deviceConfig.js`, making it easy to maintain and extend.

## Implementation Summary

This device configuration system provides:
- ✅ **Complete Coverage**: All pages now filter by configured device EUIs
- ✅ **Consistent Experience**: Same devices shown across all pages
- ✅ **Easy Configuration**: Simple environment variable setup
- ✅ **Backward Compatible**: Falls back to default devices if not configured
- ✅ **Performance Optimized**: Server-side filtering reduces data transfer
- ✅ **Hydration Safe**: Consistent date formatting prevents React errors
- ✅ **Dynamic Charts**: Comparison charts adapt to any number of devices

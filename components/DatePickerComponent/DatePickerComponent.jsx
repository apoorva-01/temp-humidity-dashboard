import React from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function DatePickerComponent({ startDate, SetStartDate, endDate, SetEndDate }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleStartDateChange = (newValue) => {
    if (newValue) {
      const newStartDate = new Date(newValue);
      const formattedStartDate = format(newStartDate, 'yyyy-MM-dd');
      SetStartDate(formattedStartDate);

      // Ensure end date is not before new start date
      if (new Date(endDate) < newStartDate) {
        SetEndDate(formattedStartDate);
      }
    }
  };

  const handleEndDateChange = (newValue) => {
    if (newValue) {
      const formattedEndDate = format(new Date(newValue), 'yyyy-MM-dd');
      SetEndDate(formattedEndDate);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack 
        direction={isMobile ? 'column' : 'row'} 
        spacing={2} 
        alignItems="center"
      >
        <DatePicker
          label="Start Date"
          value={startDate ? new Date(startDate) : null}
          onChange={handleStartDateChange}
          maxDate={endDate ? new Date(endDate) : undefined}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
        />
        <DatePicker
          label="End Date"
          value={endDate ? new Date(endDate) : null}
          onChange={handleEndDateChange}
          minDate={startDate ? new Date(startDate) : undefined}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
        />
      </Stack>
    </LocalizationProvider>
  );
}

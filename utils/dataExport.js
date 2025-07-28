import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Export data to various formats
export class DataExporter {
  constructor(data, filename = 'export') {
    this.data = data;
    this.filename = filename;
    this.timestamp = new Date().toISOString().split('T')[0];
  }

  // Export to Excel
  exportToExcel(sheetName = 'Data') {
    try {
      const worksheet = XLSX.utils.json_to_sheet(this.data);
      const workbook = XLSX.utils.book_new();
      
      // Auto-size columns
      const cols = [];
      if (this.data.length > 0) {
        Object.keys(this.data[0]).forEach(key => {
          const maxLength = Math.max(
            key.length,
            ...this.data.map(row => String(row[key] || '').length)
          );
          cols.push({ width: Math.min(maxLength + 2, 50) });
        });
        worksheet['!cols'] = cols;
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });
      
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      saveAs(blob, `${this.filename}_${this.timestamp}.xlsx`);
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export to Excel');
    }
  }

  // Export to CSV
  exportToCSV() {
    try {
      if (!this.data || this.data.length === 0) {
        throw new Error('No data to export');
      }

      const headers = Object.keys(this.data[0]);
      const csvContent = [
        headers.join(','),
        ...this.data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle values that contain commas, quotes, or line breaks
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${this.filename}_${this.timestamp}.csv`);
      return true;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Failed to export to CSV');
    }
  }

  // Export to JSON
  exportToJSON(pretty = true) {
    try {
      const jsonContent = pretty 
        ? JSON.stringify(this.data, null, 2) 
        : JSON.stringify(this.data);
      
      const blob = new Blob([jsonContent], { type: 'application/json' });
      saveAs(blob, `${this.filename}_${this.timestamp}.json`);
      return true;
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw new Error('Failed to export to JSON');
    }
  }

  // Export to PDF (basic table format)
  async exportToPDF() {
    try {
      // Dynamic import for client-side only
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(`${this.filename} - ${this.timestamp}`, 20, 20);
      
      // Prepare table data
      const headers = Object.keys(this.data[0] || {});
      const rows = this.data.map(row => headers.map(header => row[header] || ''));
      
      // Add table
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      doc.save(`${this.filename}_${this.timestamp}.pdf`);
      return true;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export to PDF');
    }
  }
}

// Device-specific export functions
export class DeviceDataExporter extends DataExporter {
  constructor(devices, filename = 'device_data') {
    const processedData = devices.map(device => ({
      'Device Name': device.deviceName,
      'Device EUI': device.devEUI,
      'Temperature (°C)': device.temperature,
      'Humidity (%)': device.humidity,
      'Timestamp': new Date(device.timestamp).toLocaleString(),
      'RSSI (dBm)': device.rssi || 'N/A',
      'SNR (dB)': device.snr || 'N/A',
      'Battery Level (%)': device.batteryLevel || 'N/A',
      'Status': device.isWithinNormalRange ? 'Normal' : 'Alert',
      'Location': device.location 
        ? `${device.location.latitude}, ${device.location.longitude}` 
        : 'N/A'
    }));
    
    super(processedData, filename);
  }

  async export(format) {
    switch (format) {
      case 'excel':
        return this.exportToExcel('Device Data');
      case 'csv':
        return this.exportToCSV();
      case 'json':
        return this.exportToJSON();
      case 'pdf':
        return this.exportToPDF();
      case 'summary':
        return this.exportSummary();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Export device summary
  exportSummary() {
    const summary = this.generateSummary();
    const summaryExporter = new DataExporter([summary], `${this.filename}_summary`);
    return summaryExporter.exportToExcel('Summary');
  }

  // Generate summary statistics
  generateSummary() {
    const devices = this.data;
    const totalDevices = devices.length;
    
    if (totalDevices === 0) {
      return {
        'Total Devices': 0,
        'Average Temperature': 'N/A',
        'Average Humidity': 'N/A',
        'Devices in Alert': 0,
        'Online Devices': 0,
        'Export Date': new Date().toLocaleString()
      };
    }

    const temperatures = devices.map(d => parseFloat(d['Temperature (°C)'])).filter(t => !isNaN(t));
    const humidities = devices.map(d => parseFloat(d['Humidity (%)'])).filter(h => !isNaN(h));
    const alertDevices = devices.filter(d => d.Status === 'Alert').length;
    
    // Consider device online if last seen within 10 minutes
    const now = new Date();
    const onlineDevices = devices.filter(d => {
      const lastSeen = new Date(d.Timestamp);
      const diffMinutes = (now - lastSeen) / (1000 * 60);
      return diffMinutes <= 10;
    }).length;

    return {
      'Total Devices': totalDevices,
      'Average Temperature (°C)': temperatures.length ? 
        (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(2) : 'N/A',
      'Average Humidity (%)': humidities.length ?
        (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(2) : 'N/A',
      'Devices in Alert': alertDevices,
      'Alert Percentage': totalDevices ? ((alertDevices / totalDevices) * 100).toFixed(1) + '%' : '0%',
      'Online Devices': onlineDevices,
      'Online Percentage': totalDevices ? ((onlineDevices / totalDevices) * 100).toFixed(1) + '%' : '0%',
      'Export Date': new Date().toLocaleString(),
      'Temperature Range': temperatures.length ? 
        `${Math.min(...temperatures).toFixed(1)}°C - ${Math.max(...temperatures).toFixed(1)}°C` : 'N/A',
      'Humidity Range': humidities.length ?
        `${Math.min(...humidities).toFixed(1)}% - ${Math.max(...humidities).toFixed(1)}%` : 'N/A'
    };
  }
}

// Historical data export
export class HistoricalDataExporter extends DataExporter {
  constructor(historicalData, deviceInfo, filename = 'historical_data') {
    const processedData = historicalData.map(entry => ({
      'Device Name': deviceInfo.deviceName,
      'Device EUI': deviceInfo.devEUI,
      'Timestamp': new Date(entry.timestamp).toLocaleString(),
      'Temperature (°C)': entry.temperature,
      'Humidity (%)': entry.humidity,
      'RSSI (dBm)': entry.rssi || 'N/A',
      'SNR (dB)': entry.snr || 'N/A',
      'Battery Level (%)': entry.batteryLevel || 'N/A'
    }));
    
    super(processedData, filename);
    this.deviceInfo = deviceInfo;
  }

  async export(format) {
    switch (format) {
      case 'excel':
        return this.exportWithCharts();
      case 'csv':
        return this.exportToCSV();
      case 'json':
        return this.exportToJSON();
      case 'pdf':
        return this.exportToPDF();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Export with charts (Excel with embedded charts)
  async exportWithCharts() {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Data sheet
      const dataSheet = XLSX.utils.json_to_sheet(this.data);
      XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data');
      
      // Summary sheet
      const summary = this.generateHistoricalSummary();
      const summarySheet = XLSX.utils.json_to_sheet([summary]);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      // Export
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      saveAs(blob, `${this.filename}_${this.timestamp}.xlsx`);
      return true;
    } catch (error) {
      console.error('Error exporting historical data with charts:', error);
      throw error;
    }
  }

  generateHistoricalSummary() {
    const data = this.data;
    const temperatures = data.map(d => parseFloat(d['Temperature (°C)'])).filter(t => !isNaN(t));
    const humidities = data.map(d => parseFloat(d['Humidity (%)'])).filter(h => !isNaN(h));
    
    return {
      'Device Name': this.deviceInfo.deviceName,
      'Device EUI': this.deviceInfo.devEUI,
      'Total Records': data.length,
      'Date Range': data.length > 0 ? 
        `${data[data.length - 1].Timestamp} to ${data[0].Timestamp}` : 'N/A',
      'Average Temperature (°C)': temperatures.length ? 
        (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(2) : 'N/A',
      'Min Temperature (°C)': temperatures.length ? Math.min(...temperatures).toFixed(2) : 'N/A',
      'Max Temperature (°C)': temperatures.length ? Math.max(...temperatures).toFixed(2) : 'N/A',
      'Average Humidity (%)': humidities.length ?
        (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(2) : 'N/A',
      'Min Humidity (%)': humidities.length ? Math.min(...humidities).toFixed(2) : 'N/A',
      'Max Humidity (%)': humidities.length ? Math.max(...humidities).toFixed(2) : 'N/A',
      'Export Date': new Date().toLocaleString()
    };
  }
}

// Utility functions
export const exportUtils = {
  // Download file from blob
  downloadBlob: (blob, filename) => {
    saveAs(blob, filename);
  },
  
  // Format data for export
  formatDataForExport: (data, formatters = {}) => {
    return data.map(item => {
      const formatted = {};
      Object.keys(item).forEach(key => {
        const formatter = formatters[key];
        formatted[key] = formatter ? formatter(item[key]) : item[key];
      });
      return formatted;
    });
  },
  
  // Common formatters
  formatters: {
    date: (value) => new Date(value).toLocaleString(),
    temperature: (value) => `${parseFloat(value).toFixed(2)}°C`,
    humidity: (value) => `${parseFloat(value).toFixed(2)}%`,
    rssi: (value) => value ? `${value} dBm` : 'N/A',
    snr: (value) => value ? `${value} dB` : 'N/A',
    battery: (value) => value ? `${value}%` : 'N/A'
  }
};

export default DataExporter; 
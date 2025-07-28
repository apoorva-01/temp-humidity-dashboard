import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Grid,
  Typography,
  Paper
} from '@mui/material';

// Device card skeleton
export function DeviceCardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Grid key={index} item xs={12} sm={6} md={4} lg={4}>
          <Card
            style={{
              border: "2px solid #e0e0e0",
              borderRadius: "1rem",
              minHeight: "300px"
            }}
          >
            <Box
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: "1rem 1rem 0 0",
                padding: "1rem",
                textAlign: "center"
              }}
            >
              <Skeleton variant="text" width="60%" height={32} sx={{ margin: '0 auto' }} />
            </Box>
            
            <CardContent sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h6" align="center">
                    <Skeleton variant="text" width="80%" sx={{ margin: '0 auto' }} />
                  </Typography>
                  
                  <Box display="flex" justifyContent="center" my={2}>
                    <Skeleton variant="circular" width={100} height={100} />
                  </Box>
                  
                  <Typography variant="h5" align="center">
                    <Skeleton variant="text" width="70%" sx={{ margin: '0 auto' }} />
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="h6" align="center">
                    <Skeleton variant="text" width="80%" sx={{ margin: '0 auto' }} />
                  </Typography>
                  
                  <Box display="flex" justifyContent="center" my={2}>
                    <Skeleton variant="circular" width={100} height={100} />
                  </Box>
                  
                  <Typography variant="h5" align="center">
                    <Skeleton variant="text" width="70%" sx={{ margin: '0 auto' }} />
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width="30%" height={40} />
      </Box>
      
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f5f5f5' }}>
            <tr>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <th key={colIndex} style={{ padding: '16px', textAlign: 'left' }}>
                  <Skeleton variant="text" width="80%" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} style={{ padding: '16px' }}>
                    <Skeleton variant="text" width="90%" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
}

// Chart skeleton
export function ChartSkeleton({ height = 300 }) {
  return (
    <Card>
      <CardContent>
        <Box mb={2}>
          <Skeleton variant="text" width="40%" height={32} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={height} />
        <Box mt={2} display="flex" justifyContent="space-between">
          <Skeleton variant="text" width="20%" />
          <Skeleton variant="text" width="20%" />
          <Skeleton variant="text" width="20%" />
          <Skeleton variant="text" width="20%" />
        </Box>
      </CardContent>
    </Card>
  );
}

// Stats card skeleton
export function StatsCardSkeleton({ count = 4 }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid key={index} item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Skeleton variant="circular" width={40} height={40} />
                <Box ml={2} flex={1}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" height={32} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// List skeleton
export function ListSkeleton({ items = 5 }) {
  return (
    <Box>
      {Array.from({ length: items }).map((_, index) => (
        <Box key={index} display="flex" alignItems="center" py={2} borderBottom="1px solid #e0e0e0">
          <Skeleton variant="circular" width={40} height={40} />
          <Box ml={2} flex={1}>
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} />
        </Box>
      ))}
    </Box>
  );
}

// Full page skeleton
export function PageSkeleton() {
  return (
    <Box p={3}>
      <Box mb={4}>
        <Skeleton variant="text" width="40%" height={48} />
        <Skeleton variant="text" width="60%" />
      </Box>
      
      <StatsCardSkeleton count={4} />
      
      <Box mt={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <ChartSkeleton />
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <ListSkeleton items={6} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

// Dashboard skeleton specifically for the main dashboard
export function DashboardSkeleton() {
  return (
    <Box p={3}>
      {/* Alert banner skeleton */}
      <Box mb={2}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
      </Box>
      
      {/* Device cards skeleton */}
      <Grid container spacing={3}>
        <DeviceCardSkeleton count={6} />
      </Grid>
    </Box>
  );
}

// Generic loading spinner
export function LoadingSpinner({ size = 40, color = 'primary' }) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={3}>
      <Skeleton variant="circular" width={size} height={size} animation="wave" />
    </Box>
  );
}

// Inline loading for buttons
export function ButtonLoading({ text = 'Loading...', width = '100px' }) {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Skeleton variant="circular" width={16} height={16} />
      <Skeleton variant="text" width={width} />
    </Box>
  );
}

// Error state component
export function ErrorState({ 
  message = 'Something went wrong', 
  onRetry = null,
  showIcon = true 
}) {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      p={4}
      textAlign="center"
    >
      {showIcon && (
        <Box mb={2} color="error.main">
          <Skeleton variant="circular" width={60} height={60} />
        </Box>
      )}
      
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {message}
      </Typography>
      
      {onRetry && (
        <Box mt={2}>
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        </Box>
      )}
    </Box>
  );
}

// Empty state component
export function EmptyState({ 
  message = 'No data available', 
  description = '',
  actionText = '',
  onAction = null
}) {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      p={4}
      textAlign="center"
      minHeight={300}
    >
      <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
      
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {message}
      </Typography>
      
      {description && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      
      {onAction && actionText && (
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
      )}
    </Box>
  );
}

export default {
  DeviceCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  StatsCardSkeleton,
  ListSkeleton,
  PageSkeleton,
  DashboardSkeleton,
  LoadingSpinner,
  ButtonLoading,
  ErrorState,
  EmptyState
}; 
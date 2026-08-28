import React from 'react';
import { Box, Card, CardContent, Typography, Grid2 as Grid, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { ScheduleMetrics } from '../types';

interface MetricsCardsProps {
  metrics: ScheduleMetrics | null;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {/* KPI 1: Scheduled Percentage */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderLeft: '4px solid #10b981', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  SCHEDULED RATE
                </Typography>
                <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: '#0f172a' }}>
                {metrics.scheduledPercentage}%
              </Typography>
              <Typography variant="caption" sx={{ color: metrics.scheduledPercentage >= 95 ? '#10b981' : '#f59e0b' }}>
                {metrics.totalScheduledInterviews} of {metrics.totalShortlistedInterviews} interviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 2: Student Clashes */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderLeft: '4px solid #06b6d4', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  STUDENT CLASHES
                </Typography>
                <WarningAmberIcon sx={{ color: metrics.studentClashCount === 0 ? '#10b981' : '#ef4444', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: '#0f172a' }}>
                {metrics.studentClashCount}
              </Typography>
              <Chip
                label={metrics.studentClashCount === 0 ? '0% (Hard Rule)' : `${metrics.studentClashPercentage}%`}
                size="small"
                color={metrics.studentClashCount === 0 ? 'success' : 'error'}
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 3: Room Utilization */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ROOM UTILIZATION
                </Typography>
                <MeetingRoomIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: '#0f172a' }}>
                {metrics.roomUtilizationPercentage}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Across 20 Rooms (Target ≥80%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 4: Avg Student Wait Time */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderLeft: '4px solid #8b5cf6', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  AVG WAIT TIME
                </Typography>
                <AccessTimeIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: '#0f172a' }}>
                {metrics.averageWaitTimeMinutes}m
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Target ≤ 30 mins
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KPI 5: Replan Churn */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderLeft: '4px solid #ec4899', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  REPLAN CHURN
                </Typography>
                <ShuffleIcon sx={{ color: '#ec4899', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: '#0f172a' }}>
                {metrics.replanChurnPercentage}%
              </Typography>
              <Typography variant="caption" sx={{ color: metrics.replanChurnPercentage <= 10 ? '#10b981' : '#ef4444' }}>
                Bounded Cap ≤ 10%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

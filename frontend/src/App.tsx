import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { ConflictAlerts } from './components/ConflictAlerts';
import { ScheduleMatrix } from './components/ScheduleMatrix';
import { RoleViews } from './components/RoleViews';
import { ReplanModal } from './components/ReplanModal';
import { fetchSchedule, fetchMetadata, fetchMetrics, fetchUnscheduled, triggerReplan, resetSchedule } from './services/api';
import { ScheduleSlot, Company, Student, Room, ScheduleMetrics, UnscheduledInterview, ReplanDiff } from './types';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f172a' },
    secondary: { main: '#38bdf8' },
    background: { default: '#f8fafc' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
  }
});

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<'COORDINATOR' | 'COMPANY_HR' | 'STUDENT'>('COORDINATOR');
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [metrics, setMetrics] = useState<ScheduleMetrics | null>(null);
  const [unscheduled, setUnscheduled] = useState<UnscheduledInterview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [replanModalOpen, setReplanModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [slotData, meta, metricData, unsch] = await Promise.all([
        fetchSchedule(),
        fetchMetadata(),
        fetchMetrics(),
        fetchUnscheduled()
      ]);

      setSlots(slotData);
      setCompanies(meta.companies);
      setStudents(meta.students);
      setRooms(meta.rooms);
      setMetrics(metricData);
      setUnscheduled(unsch);
    } catch (err) {
      console.error('Error fetching backend data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteReplan = async (type: string, targetId: string, params: any): Promise<ReplanDiff> => {
    const res = await triggerReplan(type, targetId, params);
    setMetrics(res.updatedMetrics);
    const updatedSlots = await fetchSchedule();
    setSlots(updatedSlots);
    return res.diff;
  };

  const handleResetData = async () => {
    const newMetrics = await resetSchedule(42);
    setMetrics(newMetrics);
    await loadData();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
        <CircularProgress size={48} />
        <Typography variant="h6" color="text.secondary">
          Initializing Placement Week Scheduler CSP Engine...
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', pb: 6 }}>
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onOpenReplanModal={() => setReplanModalOpen(true)}
          onResetData={handleResetData}
          isFeasible={metrics?.isFeasible ?? true}
        />

        <Container maxWidth="xl" sx={{ mt: 3 }}>
          {/* Key KPI Cards */}
          <MetricsCards metrics={metrics} />

          {/* Diagnostic Conflict Alerts */}
          <ConflictAlerts unscheduled={unscheduled} />

          {/* Role Views or Master Schedule Matrix */}
          {currentRole === 'COORDINATOR' ? (
            <ScheduleMatrix
              slots={slots}
              companies={companies}
              students={students}
              rooms={rooms}
            />
          ) : (
            <RoleViews
              role={currentRole}
              slots={slots}
              companies={companies}
              students={students}
              rooms={rooms}
            />
          )}

          {/* Replan Modal Dialog */}
          <ReplanModal
            open={replanModalOpen}
            onClose={() => setReplanModalOpen(false)}
            companies={companies}
            students={students}
            rooms={rooms}
            onExecuteReplan={handleExecuteReplan}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Grid2 as Grid,
  Alert
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { ReplanDiff, Company, Student, Room } from '../types';

interface ReplanModalProps {
  open: boolean;
  onClose: () => void;
  companies: Company[];
  students: Student[];
  rooms: Room[];
  onExecuteReplan: (type: string, targetId: string, params: any) => Promise<ReplanDiff>;
}

export const ReplanModal: React.FC<ReplanModalProps> = ({
  open,
  onClose,
  companies,
  students,
  rooms,
  onExecuteReplan
}) => {
  const [disruptionType, setDisruptionType] = useState<string>('COMPANY_DELAY');
  const [targetId, setTargetId] = useState<string>(companies[0]?.id || 'COMP-DAY1-1');
  const [delayHours, setDelayHours] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [latestDiff, setLatestDiff] = useState<ReplanDiff | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (disruptionType === 'COMPANY_DELAY') params.delayHours = delayHours;
      if (disruptionType === 'PANEL_DROP') params.panelId = 'Panel 1';

      const diff = await onExecuteReplan(disruptionType, targetId, params);
      setLatestDiff(diff);
    } catch (err) {
      console.error('Replan failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, backgroundColor: '#0f172a', color: '#f8fafc' }}>
        <FlashOnIcon sx={{ color: '#ef4444' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Real-Time Disruption Injector & Replan Engine
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Form Controls */}
        <Paper sx={{ p: 2.5, mb: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#334155' }}>
            1. Select Live Campus Disruption Scenario
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Disruption Type</InputLabel>
                <Select
                  value={disruptionType}
                  label="Disruption Type"
                  onChange={(e) => {
                    const val = e.target.value;
                    setDisruptionType(val);
                    if (val === 'COMPANY_DELAY') setTargetId(companies[0]?.id || '');
                    else if (val === 'STUDENT_WITHDRAWAL') setTargetId(students[0]?.id || '');
                    else if (val === 'ROOM_UNAVAILABLE') setTargetId(rooms[0]?.id || '');
                    else setTargetId(companies[0]?.id || '');
                  }}
                >
                  <MenuItem value="COMPANY_DELAY">Company Arrives Late (e.g. 2h Delay)</MenuItem>
                  <MenuItem value="PANEL_DROP">Panel Drop / Merge</MenuItem>
                  <MenuItem value="STUDENT_WITHDRAWAL">Student Withdrawal (Mid-day Offer)</MenuItem>
                  <MenuItem value="ROOM_UNAVAILABLE">Room Unavailable / Locked</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {disruptionType === 'COMPANY_DELAY' && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Target Company</InputLabel>
                    <Select value={targetId} label="Target Company" onChange={(e) => setTargetId(e.target.value)}>
                      {companies.slice(0, 10).map(c => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label="Delay (Hrs)"
                    type="number"
                    size="small"
                    value={delayHours}
                    onChange={(e) => setDelayHours(parseInt(e.target.value, 10))}
                  />
                </Grid>
              </>
            )}

            {disruptionType === 'STUDENT_WITHDRAWAL' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Target Student</InputLabel>
                  <Select value={targetId} label="Target Student" onChange={(e) => setTargetId(e.target.value)}>
                    {students.slice(0, 15).map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.name} ({s.id})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {disruptionType === 'ROOM_UNAVAILABLE' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Target Room</InputLabel>
                  <Select value={targetId} label="Target Room" onChange={(e) => setTargetId(e.target.value)}>
                    {rooms.map(r => (
                      <MenuItem key={r.id} value={r.id}>{r.building} - {r.roomNumber}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleSimulate}
              disabled={loading}
              startIcon={<FlashOnIcon />}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {loading ? 'Solving Replan...' : 'Execute Minimal Churn Replan'}
            </Button>
          </Box>
        </Paper>

        {/* Replan Diff Output */}
        {latestDiff && (
          <Box>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CompareArrowsIcon sx={{ color: '#0284c7' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Side-by-Side Replan Diff Summary
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`Churn Rate: ${latestDiff.summary.churnPercentage}%`}
                  color={latestDiff.summary.churnPercentage <= 10 ? 'success' : 'error'}
                  sx={{ fontWeight: 700 }}
                />
                <Chip label={`Moved: ${latestDiff.summary.movedAppointmentsCount}`} color="warning" />
                <Chip label={`Canceled: ${latestDiff.summary.canceledCount}`} color="error" />
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              Replan engine preserved {latestDiff.summary.totalAppointmentsBefore - latestDiff.summary.movedAppointmentsCount - latestDiff.summary.canceledCount} existing appointments without disturbance.
            </Alert>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 280, mb: 3 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Before Change</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>After Replan</TableCell>
                    <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestDiff.changes.map((chg, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 600 }}>{chg.studentName}</TableCell>
                      <TableCell>{chg.companyName}</TableCell>
                      <TableCell sx={{ color: '#64748b' }}>
                        {chg.oldRoomId} ({chg.oldTime})
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#0284c7' }}>
                        {chg.newRoomId || 'N/A'} ({chg.newTime || 'Canceled'})
                      </TableCell>
                      <TableCell>
                        {chg.action === 'MOVED' && <Chip label="MOVED" color="warning" size="small" sx={{ height: 20 }} />}
                        {chg.action === 'CANCELED' && <Chip label="CANCELED" color="error" size="small" sx={{ height: 20 }} />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Targeted Notifications Drawer */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsActiveIcon sx={{ fontSize: 18, color: '#eab308' }} />
              Targeted Notifications Dispatched ({latestDiff.notifications.length})
            </Typography>

            <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 140, overflowY: 'auto', backgroundColor: '#fafafa' }}>
              {latestDiff.notifications.map((n, idx) => (
                <Box key={idx} sx={{ py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    [{n.recipientRole}] {n.recipientName} ({n.channel}):
                  </Typography>
                  <Typography variant="caption" sx={{ ml: 1, color: '#475569' }}>
                    {n.message}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ fontWeight: 600 }}>
          Close Diff View
        </Button>
      </DialogActions>
    </Dialog>
  );
};

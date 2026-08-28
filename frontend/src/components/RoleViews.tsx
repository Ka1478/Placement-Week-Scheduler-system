import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Grid2 as Grid,
  Autocomplete,
  TextField
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { ScheduleSlot, Company, Student, Room } from '../types';

interface RoleViewsProps {
  role: 'COMPANY_HR' | 'STUDENT';
  slots: ScheduleSlot[];
  companies: Company[];
  students: Student[];
  rooms: Room[];
}

export const RoleViews: React.FC<RoleViewsProps> = ({
  role,
  slots,
  companies,
  students,
  rooms
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  const companyMap = new Map(companies.map(c => [c.id, c]));
  const studentMap = new Map(students.map(s => [s.id, s]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  if (role === 'COMPANY_HR') {
    const selectedCompany = companyMap.get(selectedCompanyId);
    const companySlots = slots.filter(s => s.companyId === selectedCompanyId && s.status !== 'CANCELED');

    return (
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BusinessIcon sx={{ fontSize: 32, color: '#0284c7' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Company HR Interview Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View your assigned interview rooms, panels, and candidate CGPA profiles.
              </Typography>
            </Box>
          </Box>

          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Select Company</InputLabel>
            <Select value={selectedCompanyId} label="Select Company" onChange={(e) => setSelectedCompanyId(e.target.value)}>
              {companies.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {selectedCompany && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">TIER & CUTOFF</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedCompany.priorityTier}</Typography>
                  <Typography variant="body2">CGPA Cutoff: {selectedCompany.cgpaCutoff}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">PANELS & DURATION</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedCompany.panelsCount} Panels</Typography>
                  <Typography variant="body2">{selectedCompany.interviewDurationMinutes} Mins / Candidate</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">TOTAL SHORTLISTED</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>{companySlots.length} Candidates</Typography>
                  <Typography variant="body2">Across Days 1-4</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 700 }}>Day & Slot</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Candidate Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Branch & CGPA</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Assigned Room & Panel</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companySlots.map(slot => {
                const student = studentMap.get(slot.studentId);
                const room = roomMap.get(slot.roomId);

                return (
                  <TableRow key={slot.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>Day {slot.day}: {slot.startTime} - {slot.endTime}</TableCell>
                    <TableCell>{student ? student.name : slot.studentId}</TableCell>
                    <TableCell>
                      <Chip label={student?.branch} size="small" sx={{ mr: 1, height: 20 }} />
                      CGPA {student?.cgpa}
                    </TableCell>
                    <TableCell>{room ? `${room.building} ${room.roomNumber}` : slot.roomId} ({slot.panelId})</TableCell>
                    <TableCell>
                      <Chip label={slot.status} color={slot.status === 'SCHEDULED' ? 'success' : 'warning'} size="small" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  // Student Portal View
  const selectedStudent = studentMap.get(selectedStudentId);
  const studentSlots = slots.filter(s => s.studentId === selectedStudentId && s.status !== 'CANCELED');

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Student Placement Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your interview timeline, room locations, and waiting times.
            </Typography>
          </Box>
        </Box>

        <Autocomplete
          size="small"
          options={students}
          getOptionLabel={(option) => `${option.name} (${option.id} - ${option.branch})`}
          value={selectedStudent || null}
          onChange={(_, newValue) => {
            if (newValue) setSelectedStudentId(newValue.id);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Search / Select Student (800 Total)" />
          )}
          sx={{ minWidth: 320 }}
        />
      </Box>

      {selectedStudent && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f3ff', borderRadius: 2, border: '1px solid #ddd6fe' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#5b21b6' }}>
            {selectedStudent.name} ({selectedStudent.id})
          </Typography>
          <Typography variant="body2" sx={{ color: '#6d28d9' }}>
            Branch: {selectedStudent.branch} | CGPA: {selectedStudent.cgpa} | Shortlisted by {selectedStudent.shortlistedCompanyIds.length} Companies
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {studentSlots.map(slot => {
          const company = companyMap.get(slot.companyId);
          const room = roomMap.get(slot.roomId);

          return (
            <Grid key={slot.id} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderLeft: '4px solid #8b5cf6' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      {company ? company.name : slot.companyId}
                    </Typography>
                    <Chip label={`Day ${slot.day}`} color="primary" size="small" />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569', mb: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {slot.startTime} - {slot.endTime} ({company?.interviewDurationMinutes || 45} mins)
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#475569' }}>
                    <LocationOnIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                    <Typography variant="body2">
                      {room ? `${room.building} (${room.roomNumber})` : slot.roomId} - {slot.panelId}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

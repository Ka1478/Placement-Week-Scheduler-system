import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Typography,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { ScheduleSlot, Company, Student, Room } from '../types';

interface ScheduleMatrixProps {
  slots: ScheduleSlot[];
  companies: Company[];
  students: Student[];
  rooms: Room[];
}

export const ScheduleMatrix: React.FC<ScheduleMatrixProps> = ({
  slots,
  companies,
  students,
  rooms
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');
  const [roomFilter, setRoomFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);

  const companyMap = useMemo(() => new Map(companies.map(c => [c.id, c])), [companies]);
  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students]);
  const roomMap = useMemo(() => new Map(rooms.map(r => [r.id, r])), [rooms]);

  // Filter logic
  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      if (selectedDay > 0 && slot.day !== selectedDay) return false;
      if (companyFilter !== 'ALL' && slot.companyId !== companyFilter) return false;
      if (roomFilter !== 'ALL' && slot.roomId !== roomFilter) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const student = studentMap.get(slot.studentId);
        const company = companyMap.get(slot.companyId);
        const studentName = student ? student.name.toLowerCase() : '';
        const companyName = company ? company.name.toLowerCase() : '';
        const roomId = slot.roomId.toLowerCase();
        const studentId = slot.studentId.toLowerCase();

        return (
          studentName.includes(query) ||
          companyName.includes(query) ||
          roomId.includes(query) ||
          studentId.includes(query)
        );
      }

      return true;
    });
  }, [slots, selectedDay, companyFilter, roomFilter, searchQuery, studentMap, companyMap]);

  const handleExportCSV = () => {
    const headers = ['Slot ID', 'Day', 'Time', 'Student ID', 'Student Name', 'Branch', 'Company', 'Tier', 'Room', 'Panel', 'Status'];
    const csvRows = [headers.join(',')];

    filteredSlots.forEach(s => {
      const student = studentMap.get(s.studentId);
      const company = companyMap.get(s.companyId);
      const room = roomMap.get(s.roomId);

      csvRows.push([
        s.id,
        `Day ${s.day}`,
        `"${s.startTime} - ${s.endTime}"`,
        s.studentId,
        `"${student ? student.name : ''}"`,
        student ? student.branch : '',
        `"${company ? company.name : ''}"`,
        company ? company.priorityTier : '',
        room ? room.roomNumber : s.roomId,
        s.panelId,
        s.status
      ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement_schedule_day_${selectedDay || 'all'}.csv`;
    a.click();
  };

  return (
    <Paper sx={{ width: '100%', mb: 4, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      {/* Header Controls */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
        <Tabs
          value={selectedDay}
          onChange={(_, val) => { setSelectedDay(val); setPage(0); }}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 40 }
          }}
        >
          <Tab label="All Days" value={0} />
          <Tab label="Day 1 (Mass Recruiters)" value={1} />
          <Tab label="Day 2" value={2} />
          <Tab label="Day 3" value={3} />
          <Tab label="Day 4 (Catch-up)" value={4} />
        </Tabs>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search student, company, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              )
            }}
            sx={{ width: 260 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Company</InputLabel>
            <Select value={companyFilter} label="Company" onChange={(e) => setCompanyFilter(e.target.value)}>
              <MenuItem value="ALL">All Companies (35)</MenuItem>
              {companies.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Table Content */}
      <TableContainer sx={{ maxHeight: 580 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Day & Time</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Branch & CGPA</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Priority Tier</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Room & Panel</TableCell>
              <TableCell sx={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSlots.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((slot) => {
              const student = studentMap.get(slot.studentId);
              const company = companyMap.get(slot.companyId);
              const room = roomMap.get(slot.roomId);

              return (
                <TableRow
                  key={slot.id}
                  hover
                  sx={{
                    backgroundColor: slot.status === 'RESCHEDULED' ? '#fffbeb' : slot.status === 'CANCELED' ? '#fef2f2' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                      Day {slot.day}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {slot.startTime} - {slot.endTime}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {student ? student.name : slot.studentId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {slot.studentId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={student?.branch || 'CSE'} size="small" variant="outlined" sx={{ mr: 1, height: 20, fontSize: '0.7rem' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      CGPA: {student?.cgpa || '8.0'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {company ? company.name : slot.companyId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {company?.priorityTier === 'DAY_1_MASS' && (
                      <Chip label="Day-1 Mass" color="secondary" size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                    )}
                    {company?.priorityTier === 'TIER_1_PRODUCT' && (
                      <Chip label="Tier-1 Product" color="primary" size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                    )}
                    {company?.priorityTier === 'TIER_2_REGULAR' && (
                      <Chip label="Tier-2 Regular" variant="outlined" size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {room ? room.roomNumber : slot.roomId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {slot.panelId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {slot.status === 'SCHEDULED' && (
                      <Chip label="Scheduled" color="success" size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                    )}
                    {slot.status === 'RESCHEDULED' && (
                      <Chip label="Rescheduled" color="warning" size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                    )}
                    {slot.status === 'CANCELED' && (
                      <Chip label="Canceled" color="error" size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[15, 30, 50, 100]}
        component="div"
        count={filteredSlots.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      />
    </Paper>
  );
};

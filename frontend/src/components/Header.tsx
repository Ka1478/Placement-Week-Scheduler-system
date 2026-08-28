import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RefreshIcon from '@mui/icons-material/Refresh';

interface HeaderProps {
  currentRole: 'COORDINATOR' | 'COMPANY_HR' | 'STUDENT';
  onRoleChange: (role: 'COORDINATOR' | 'COMPANY_HR' | 'STUDENT') => void;
  onOpenReplanModal: () => void;
  onResetData: () => void;
  isFeasible: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenReplanModal,
  onResetData,
  isFeasible
}) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#0f172a', elevation: 3 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CalendarMonthIcon sx={{ fontSize: 32, color: '#38bdf8' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
              MIRAI LABS - Placement Week Scheduler
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Real-Time Interview Constraint Solver & Replan Engine
            </Typography>
          </Box>

          <Chip
            label={isFeasible ? 'Schedule Feasible (0 Clashes)' : 'Bottlenecks Detected'}
            color={isFeasible ? 'success' : 'warning'}
            size="small"
            sx={{ ml: 2, fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Role Switcher */}
          <FormControl size="small" sx={{ minWidth: 160, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
            <InputLabel id="role-select-label" sx={{ color: '#cbd5e1' }}>View Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={currentRole}
              label="View Role"
              onChange={(e) => onRoleChange(e.target.value as any)}
              sx={{ color: '#f8fafc', '.MuiSvgIcon-root': { color: '#cbd5e1' } }}
            >
              <MenuItem value="COORDINATOR">Placement Coordinator</MenuItem>
              <MenuItem value="COMPANY_HR">Company HR View</MenuItem>
              <MenuItem value="STUDENT">Student Portal</MenuItem>
            </Select>
          </FormControl>

          {/* One-Click Replan Trigger */}
          {currentRole === 'COORDINATOR' && (
            <Button
              variant="contained"
              color="error"
              startIcon={<FlashOnIcon />}
              onClick={onOpenReplanModal}
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
                px: 2.5
              }}
            >
              Inject Disruption & Replan
            </Button>
          )}

          <Tooltip title="Reset & Reseed Dataset">
            <IconButton onClick={onResetData} sx={{ color: '#cbd5e1' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

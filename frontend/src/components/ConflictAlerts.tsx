import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { UnscheduledInterview } from '../types';

interface ConflictAlertsProps {
  unscheduled: UnscheduledInterview[];
}

export const ConflictAlerts: React.FC<ConflictAlertsProps> = ({ unscheduled }) => {
  return (
    <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, borderLeft: unscheduled.length === 0 ? '6px solid #10b981' : '6px solid #f59e0b', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {unscheduled.length === 0 ? (
            <CheckCircleIcon sx={{ color: '#10b981', fontSize: 28 }} />
          ) : (
            <WarningAmberIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
              {unscheduled.length === 0
                ? 'Feasible Master Schedule: 0 Hard Constraint Violations'
                : `System Diagnostics: ${unscheduled.length} Unscheduled Shortlists Reported`}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {unscheduled.length === 0
                ? 'All shortlisted interviews successfully assigned non-overlapping time slots and rooms.'
                : 'The CSP Solver isolated unassigned interviews due to CGPA cutoffs or time bottleneck constraints. Never failing silently.'}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={unscheduled.length === 0 ? '100% Feasible' : `${unscheduled.length} Unscheduled`}
          color={unscheduled.length === 0 ? 'success' : 'warning'}
          sx={{ fontWeight: 700 }}
        />
      </Box>

      {unscheduled.length > 0 && (
        <Accordion sx={{ mt: 2, boxShadow: 'none', backgroundColor: '#fffbe8', borderRadius: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#b45309' }}>
              View Detailed Diagnostic Reason Breakdown ({unscheduled.length} items)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {unscheduled.slice(0, 10).map((item, idx) => (
                <ListItem key={idx} divider sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <InfoIcon sx={{ color: '#d97706', fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.studentName} ({item.studentId}) &rarr; {item.companyName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#78350f' }}>
                        Reason: [{item.reason}] - {item.details}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
};

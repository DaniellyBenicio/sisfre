import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const ScheduleTable = ({ scheduleMatrix, daysOfWeek, handleDeleteDetail, sx, disableTooltips = false }) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        flex: 1,
        border: '1px solid #C7C7C7',
        borderRadius: 2,
        ...sx,
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Horário</strong>
            </TableCell>
            {daysOfWeek.map((day) => (
              <TableCell key={day}>
                <strong>{day}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {scheduleMatrix.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
              }}
            >
              <TableCell>{row.timeSlot || 'N/A'}</TableCell>
              {daysOfWeek.map((day) => (
                <TableCell key={day}>
                  {row[day] ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start', // Match ClassScheduleDetails alignment
                      }}
                    >
                      {disableTooltips ? (
                        <Typography variant="body2">
                          {row[day].disciplineAcronym || 'N/A'}
                        </Typography>
                      ) : (
                        <Tooltip
                          title={row[day].disciplineName || 'N/A'}
                          arrow
                          placement="top"
                          enterDelay={200}
                          leaveDelay={200}
                          slotProps={{
                            popper: {
                              modifiers: [
                                {
                                  name: 'offset',
                                  options: { offset: [20, -8] },
                                },
                              ],
                            },
                          }}
                        >
                          <Typography variant="body2">
                            {row[day].disciplineAcronym || 'N/A'}
                          </Typography>
                        </Tooltip>
                      )}
                      {row[day].professorName && (
                        disableTooltips ? (
                          <Typography variant="body2" color="text.secondary">
                            {row[day].professorAcronym || 'N/A'}
                          </Typography>
                        ) : (
                          <Tooltip
                            title={row[day].professorName}
                            arrow
                            enterDelay={200}
                            leaveDelay={200}
                            slotProps={{
                              popper: {
                                modifiers: [
                                  {
                                    name: 'offset',
                                    options: { offset: [-5, -15] },
                                  },
                                ],
                              },
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {row[day].professorAcronym || 'N/A'}
                            </Typography>
                          </Tooltip>
                        )
                      )}
                      {handleDeleteDetail && row[day]?.hourId && (
                        <IconButton
                          onClick={() =>
                            handleDeleteDetail(day, row.timeSlot, row[day].hourId)
                          }
                          sx={{
                            color: '#F01424',
                            '&:hover': { color: '#D4000F' },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  ) : (
                    '-'
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScheduleTable;
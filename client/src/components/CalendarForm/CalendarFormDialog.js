import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  FormControl,
  MenuItem,
  IconButton,
  InputLabel,
} from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import api from '../../service/api';
import { StyledTextField, StyledSelect } from '../../components/inputs/Input';

const INSTITUTIONAL_COLOR = '#307c34';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 'bold',
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

// Initialize calendar types
let calendarTypes = ['CONVENCIONAL', 'REGULAR', 'PÓS-GREVE', 'OUTRO'];

// Função auxiliar para formatar a data para YYYY-MM-DD
const formatDateForInput = (date) => {
  if (!date) return '';
  try {
    if (typeof date === 'string') {
      const parts = date.split('/');
      if (parts.length === 3) {
        const parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
      return '';
    }
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return '';
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return '';
  }
};

const CalendarFormDialog = ({ open, onClose, calendarToEdit, onSubmitSuccess, isEditMode }) => {
  const [calendarData, setCalendarData] = useState({
    type: '',
    year: '',
    period: '',
    startDate: '',
    endDate: '',
  });
  const [customType, setCustomType] = useState('');
  const [error, setError] = useState(null);
  const [localCalendarTypes, setLocalCalendarTypes] = useState(calendarTypes);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const isFormFilled =
    calendarData.type &&
    calendarData.year &&
    calendarData.period &&
    calendarData.startDate &&
    calendarData.endDate &&
    (calendarData.type !== 'OUTRO' || (calendarData.type === 'OUTRO' && customType));

  useEffect(() => {
    if (calendarToEdit) {
      const typeToSet = localCalendarTypes.includes(calendarToEdit.type) || calendarToEdit.type === 'OUTRO'
        ? calendarToEdit.type
        : calendarToEdit.type;
      if (!localCalendarTypes.includes(calendarToEdit.type) && calendarToEdit.type !== 'OUTRO') {
        setLocalCalendarTypes([...localCalendarTypes.filter(t => t !== 'OUTRO'), calendarToEdit.type, 'OUTRO']);
      }
      setCalendarData({
        type: typeToSet,
        year: calendarToEdit.year || '',
        period: calendarToEdit.period || '',
        startDate: formatDateForInput(calendarToEdit.startDate),
        endDate: formatDateForInput(calendarToEdit.endDate),
      });
      setCustomType(typeToSet === 'OUTRO' ? '' : typeToSet);
      setError(null);
      setIsFormChanged(false);
    } else {
      setCalendarData({
        type: '',
        year: '',
        period: '',
        startDate: '',
        endDate: '',
      });
      setCustomType('');
      setError(null);
      setIsFormChanged(false);
    }
  }, [calendarToEdit, open]);

  const handleInputChange = (name, value) => {
    setCalendarData({ ...calendarData, [name]: value });
    setIsFormChanged(true);
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setCalendarData({ ...calendarData, type: value });
    setIsFormChanged(true);
    if (value !== 'OUTRO') {
      setCustomType('');
    }
  };

  const handleCustomTypeChange = (e) => {
    setCustomType(e.target.value);
    setIsFormChanged(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let finalType = calendarData.type;
    if (calendarData.type === 'OUTRO') {
      if (!customType || customType.trim().length < 3) {
        setError('O tipo personalizado deve ter pelo menos 3 caracteres.');
        return;
      }
      finalType = customType.trim().toUpperCase();
    } else {
      finalType = calendarData.type.toUpperCase();
    }

    if (!finalType || !calendarData.year || !calendarData.period || !calendarData.startDate || !calendarData.endDate) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (!calendarData.year.match(/^\d{4}$/)) {
      setError('O ano deve estar no formato AAAA (ex.: 2020).');
      return;
    }

    if (!['1', '2'].includes(calendarData.period)) {
      setError('O período deve ser 1 ou 2.');
      return;
    }

    try {
      const payload = {
        type: finalType,
        year: calendarData.year,
        period: calendarData.period,
        startDate: calendarData.startDate,
        endDate: calendarData.endDate,
      };

      console.log('CalendarFormDialog - Payload enviado:', payload);

      let response;
      if (isEditMode) {
        response = await api.put(`/calendar/${calendarToEdit?.id}`, payload);
      } else {
        response = await api.post(`/calendar`, payload);
        if (calendarData.type === 'OUTRO' && !localCalendarTypes.includes(finalType)) {
          const newTypes = [...localCalendarTypes.filter(t => t !== 'OUTRO'), finalType, 'OUTRO'];
          setLocalCalendarTypes(newTypes);
          calendarTypes = newTypes;
          try {
            await api.post('/calendar-types', { type: finalType });
          } catch (typeError) {
            console.error('Erro ao cadastrar novo tipo:', typeError);
            setError('Calendário salvo, mas houve um erro ao cadastrar o novo tipo.');
          }
        }
      }

      console.log('CalendarFormDialog - Resposta da API:', response.data);

      onSubmitSuccess(response.data.calendar, isEditMode);
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} calendário: ${err.message}`;
      setError(errorMessage);
      console.error('CalendarFormDialog - Erro:', err);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear + i).toString());

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '8px',
            width: '520px',
            maxWidth: '90vw',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', marginTop: '15px', color: '#087619', fontWeight: 'bold' }}>
          {isEditMode ? 'Editar Calendário' : 'Cadastrar Calendário'}
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 5 }}>
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Box sx={{ color: 'red', marginBottom: 2, fontSize: '0.875rem' }}>
                {error}
              </Box>
            )}

            <FormControl
              fullWidth
              margin="normal"
              sx={{
                my: 1.5,
                '& .MuiOutlinedInput-root': {
                  height: '56px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '1px',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000000 !important',
                  borderWidth: '2px',
                },
              }}
            >
              <InputLabel
                id="type-label"
                sx={{
                  color: '#757575',
                  '&::after': { content: '" *"', color: '#757575' },
                  top: '50%',
                  transform: 'translate(14px, -50%)',
                  fontSize: '1rem',
                  '&.Mui-focused, &.MuiInputLabel-shrink': {
                    color: '#000000',
                    '&::after': { content: '" *"', color: '#000000' },
                  },
                  '&.MuiInputLabel-shrink': {
                    top: 0,
                    transform: 'translate(14px, -9px) scale(0.75)',
                  },
                }}
              >
                Tipo
              </InputLabel>
              {calendarData.type === 'OUTRO' ? (
                <StyledTextField
                  id="type-input"
                  name="customType"
                  value={customType}
                  onChange={handleCustomTypeChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  placeholder="Digite o novo tipo"
                />
              ) : (
                <StyledSelect
                  id="type-select"
                  name="type"
                  value={calendarData.type}
                  onChange={handleTypeChange}
                  label="Tipo"
                  required
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: '200px',
                        overflowY: 'auto',
                        width: 'auto',
                        '& .MuiMenuItem-root': {
                          '&:hover': {
                            backgroundColor: '#D5FFDB',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#E8F5E9',
                            '&:hover': {
                              backgroundColor: '#D5FFDB',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {localCalendarTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </StyledSelect>
              )}
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, my: 1.5, alignItems: 'center' }}>
              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    height: '56px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '1px',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000 !important',
                    borderWidth: '2px',
                  },
                }}
              >
                <InputLabel
                  id="year-label"
                  sx={{
                    color: '#757575',
                    '&::after': { content: '" *"', color: '#757575' },
                    top: '50%',
                    transform: 'translate(14px, -50%)',
                    fontSize: '1rem',
                    '&.Mui-focused, &.MuiInputLabel-shrink': {
                      color: '#000000',
                      '&::after': { content: '" *"', color: '#000000' },
                    },
                    '&.MuiInputLabel-shrink': {
                      top: 0,
                      transform: 'translate(14px, -9px) scale(0.75)',
                    },
                  }}
                >
                  Ano
                </InputLabel>
                <StyledSelect
                  id="year-select"
                  name="year"
                  value={calendarData.year}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                  label="Ano"
                  required
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: '200px',
                        overflowY: 'auto',
                        width: 'auto',
                        '& .MuiMenuItem-root': {
                          '&:hover': {
                            backgroundColor: '#D5FFDB',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#E8F5E9',
                            '&:hover': {
                              backgroundColor: '#D5FFDB',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    height: '56px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '1px',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000 !important',
                    borderWidth: '2px',
                  },
                }}
              >
                <InputLabel
                  id="period-label"
                  sx={{
                    color: '#757575',
                    '&::after': { content: '" *"', color: '#757575' },
                    top: '50%',
                    transform: 'translate(14px, -50%)',
                    fontSize: '1rem',
                    '&.Mui-focused, &.MuiInputLabel-shrink': {
                      color: '#000000',
                      '&::after': { content: '" *"', color: '#000000' },
                    },
                    '&.MuiInputLabel-shrink': {
                      top: 0,
                      transform: 'translate(14px, -9px) scale(0.75)',
                    },
                  }}
                >
                  Período
                </InputLabel>
                <StyledSelect
                  id="period-select"
                  name="period"
                  value={calendarData.period}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                  label="Período"
                  required
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: '200px',
                        overflowY: 'auto',
                        width: 'auto',
                        '& .MuiMenuItem-root': {
                          '&:hover': {
                            backgroundColor: '#D5FFDB',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#E8F5E9',
                            '&:hover': {
                              backgroundColor: '#D5FFDB',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {['1', '2'].map((period) => (
                    <MenuItem key={period} value={period}>
                      {period}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, my: 1.5, alignItems: 'center' }}>
              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    height: '56px',
                    borderRadius: '4px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '1px',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000 !important',
                    borderWidth: '2px',
                  },
                }}
              >
                <DatePicker
                  label="Data de Início"
                  value={calendarData.startDate ? new Date(calendarData.startDate) : null}
                  onChange={(date) => handleInputChange('startDate', formatDateForInput(date))}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      id: 'startDate-input',
                      required: true,
                      placeholder: 'mm/dd/aaaa',
                      InputLabelProps: {
                        shrink: !!calendarData.startDate,
                        sx: {
                          color: '#757575',
                          top: '50%',
                          transform: 'translate(14px, -50%)',
                          fontSize: '1rem',
                          '&.Mui-focused, &.MuiInputLabel-shrink': {
                            color: '#000000',
                            top: 0,
                            transform: 'translate(14px, -9px) scale(0.75)',
                          },
                        },
                      },
                      sx: {
                        '& .MuiInputBase-input': {
                          padding: '16.5px 14px',
                          fontSize: '1rem',
                          '&::placeholder': {
                            color: '#757575',
                            opacity: 1,
                          },
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#000000',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#000000 !important',
                            borderWidth: '2px',
                          },
                        },
                      },
                    },
                    popper: {
                      sx: {
                        '& .MuiPaper-root': {
                          border: '1px solid #000000',
                          borderRadius: '4px',
                          width: '280px',
                          maxHeight: '320px',
                          overflow: 'hidden',
                        },
                        '& .MuiPickersCalendar-root': {
                          fontSize: '0.875rem',
                          padding: '8px',
                        },
                        '& .MuiDayCalendar-weekContainer': {
                          margin: '2px 0',
                        },
                        '& .MuiPickersDay-root': {
                          width: '32px',
                          height: '32px',
                          fontSize: '0.85rem',
                        },
                        '& .MuiPickersCalendarHeader-root': {
                          padding: '8px',
                        },
                      },
                    },
                  }}
                />
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    height: '56px',
                    borderRadius: '4px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '1px',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000 !important',
                    borderWidth: '2px',
                  },
                }}
              >
                <DatePicker
                  label="Data de Fim"
                  value={calendarData.endDate ? new Date(calendarData.endDate) : null}
                  onChange={(date) => handleInputChange('endDate', formatDateForInput(date))}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      id: 'endDate-input',
                      required: true,
                      placeholder: 'mm/dd/aaaa',
                      InputLabelProps: {
                        shrink: !!calendarData.endDate,
                        sx: {
                          color: '#757575',
                          top: '50%',
                          transform: 'translate(14px, -50%)',
                          fontSize: '1rem',
                          '&.Mui-focused, &.MuiInputLabel-shrink': {
                            color: '#000000',
                            top: 0,
                            transform: 'translate(14px, -9px) scale(0.75)',
                          },
                        },
                      },
                      sx: {
                        '& .MuiInputBase-input': {
                          padding: '16.5px 14px',
                          fontSize: '1rem',
                          '&::placeholder': {
                            color: '#757575',
                            opacity: 1,
                          },
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#000000',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#000000 !important',
                            borderWidth: '2px',
                          },
                        },
                      },
                    },
                    popper: {
                      sx: {
                        '& .MuiPaper-root': {
                          border: '1px solid #000000',
                          borderRadius: '4px',
                          width: '280px',
                          maxHeight: '320px',
                          overflow: 'hidden',
                        },
                        '& .MuiPickersCalendar-root': {
                          fontSize: '0.875rem',
                          padding: '8px',
                        },
                        '& .MuiDayCalendar-weekContainer': {
                          margin: '2px 0',
                        },
                        '& .MuiPickersDay-root': {
                          width: '32px',
                          height: '32px',
                          fontSize: '0.85rem',
                        },
                        '& .MuiPickersCalendarHeader-root': {
                          padding: '8px',
                        },
                      },
                    },
                  }}
                />
              </FormControl>
            </Box>

            <DialogActions
              sx={{
                justifyContent: 'center',
                gap: 2,
                padding: '10px 24px',
                marginTop: '10px',
              }}
            >
              <StyledButton
                onClick={onClose}
                variant="contained"
                sx={{
                  backgroundColor: '#F01424',
                  '&:hover': { backgroundColor: '#D4000F' },
                }}
              >
                <Close sx={{ fontSize: 24 }} />
                Cancelar
              </StyledButton>
              <StyledButton
                type="submit"
                variant="contained"
                disabled={!isFormFilled || (isEditMode && !isFormChanged)}
                sx={{
                  backgroundColor: (!isFormFilled || (isEditMode && !isFormChanged)) ? '#E0E0E0' : INSTITUTIONAL_COLOR,
                  '&:hover': { backgroundColor: (!isFormFilled || (isEditMode && !isFormChanged)) ? '#E0E0E0' : '#26692b' },
                }}
              >
                <Save sx={{ fontSize: 24 }} />
                {isEditMode ? 'Atualizar' : 'Cadastrar'}
              </StyledButton>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CalendarFormDialog;
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
import { LocalizationProvider } from '@mui/x-date-pickers';
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

const calendarTypes = ['CONVENCIONAL', 'REGULAR', 'PÓS-GREVE', 'OUTRO'];

// Função auxiliar para formatar a data para YYYY-MM-DD
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      // Tenta parsing DD/MM/YYYY se for o caso
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
      return ''; // Retorna vazio se a data for inválida
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return '';
  }
};


const CalendarFormDialog = ({ open, onClose, calendarToEdit, onSubmitSuccess, isEditMode }) => {
  const [calendarData, setCalendarData] = useState({
    type: '',
    customType: '',
    year: '',
    period: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState(null);

  const isFormFilled =
    (calendarData.type === 'OUTRO' ? calendarData.customType : calendarData.type) &&
    calendarData.year &&
    calendarData.period &&
    calendarData.startDate &&
    calendarData.endDate;

  useEffect(() => {
    if (calendarToEdit) {
      setCalendarData({
        type: calendarTypes.includes(calendarToEdit.type) ? calendarToEdit.type : 'OUTRO',
        customType: calendarTypes.includes(calendarToEdit.type) ? '' : calendarToEdit.type,
        year: calendarToEdit.year || '',
        period: calendarToEdit.period || '',
        // AQUI ESTÁ A MUDANÇA PRINCIPAL para garantir o formato YYYY-MM-DD
        startDate: formatDateForInput(calendarToEdit.startDate),
        endDate: formatDateForInput(calendarToEdit.endDate),
      });
      setError(null);
    } else {
      setCalendarData({
        type: '',
        customType: '',
        year: '',
        period: '',
        startDate: '',
        endDate: '',
      });
      setError(null);
    }
  }, [calendarToEdit, open]);

  const handleInputChange = (e) => {
    setCalendarData({ ...calendarData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const finalType = calendarData.type === 'OUTRO' ? calendarData.customType : calendarData.type;

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

    if (calendarData.type === 'OUTRO' && calendarData.customType.length < 3) {
      setError('O tipo personalizado deve ter pelo menos 3 caracteres.');
      return;
    }

    try {
      const payload = {
        type: finalType.toUpperCase(),
        year: calendarData.year,
        period: calendarData.period,
        // O VALOR JÁ ESTARÁ NO FORMATO CORRETO AO ENVIAR SE VEIO DO INPUT type="date"
        startDate: calendarData.startDate,
        endDate: calendarData.endDate,
      };

      console.log('CalendarFormDialog - Payload enviado:', payload);

      let response;
      if (isEditMode) {
        response = await api.put(`/calendar/${calendarToEdit?.id}`, payload);
      } else {
        response = await api.post(`/calendar`, payload);
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
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

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
              <StyledSelect
                id="type-select"
                name="type"
                value={calendarData.type}
                onChange={handleInputChange}
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
                {calendarTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>

            {calendarData.type === 'OUTRO' && (
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
                  id="customType-label"
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
                  Tipo Personalizado
                </InputLabel>
                <StyledTextField
                  id="customType-input"
                  name="customType"
                  value={calendarData.customType}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
            )}

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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  id="startDate-label"
                  // Adicionando a propriedade shrink para o label flutuar
                  // de imediato para inputs type="date"
                  shrink={true}
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
                  Data de Início
                </InputLabel>
                <StyledTextField
                  id="startDate-input"
                  name="startDate"
                  value={calendarData.startDate}
                  onChange={handleInputChange}
                  type="date"
                  required
                  // Mantendo InputLabelProps.shrink aqui também para o comportamento consistente
                  InputLabelProps={{ shrink: true }}
                />
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
                  id="endDate-label"
                  // Adicionando a propriedade shrink para o label flutuar
                  // de imediato para inputs type="date"
                  shrink={true}
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
                  Data de Fim
                </InputLabel>
                <StyledTextField
                  id="endDate-input"
                  name="endDate"
                  value={calendarData.endDate}
                  onChange={handleInputChange}
                  type="date"
                  required
                  // Mantendo InputLabelProps.shrink aqui também para o comportamento consistente
                  InputLabelProps={{ shrink: true }}
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
                disabled={!isFormFilled}
                sx={{
                  backgroundColor: !isFormFilled ? '#E0E0E0' : INSTITUTIONAL_COLOR,
                  '&:hover': { backgroundColor: !isFormFilled ? '#E0E0E0' : '#26692b' },
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
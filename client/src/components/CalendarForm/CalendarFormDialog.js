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
  InputAdornment,
} from '@mui/material';
import { Close, Save, CalendarToday } from '@mui/icons-material';
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
        startDate: calendarToEdit.startDate || '',
        endDate: calendarToEdit.endDate || '',
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

  const handleIconClick = (fieldName) => {
    const input = document.getElementById(`${fieldName}-select`);
    if (input) {
      input.focus();
      input.click();
    }
  };

  // Generate last 5 years (2021 to 2025)
  const currentYear = 2025;
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
                shrink={!!calendarData.type}
                sx={{
                  color: '#757575',
                  '&::after': { content: '" *"', color: '#757575' },
                  top: '50%',
                  transform: calendarData.type ? 'translate(14px, -9px) scale(0.75)' : 'translate(14px, -50%)',
                  fontSize: '1rem',
                  '&.Mui-focused': {
                    color: '#000000',
                    '&::after': { content: '" *"', color: '#000000' },
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
                      '& .MuiMenuItem-root:hover': {
                        backgroundColor: '#D5FFDB',
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
                  shrink={!!calendarData.customType}
                  sx={{
                    color: '#757575',
                    '&::after': { content: '" *"', color: '#757575' },
                    top: '50%',
                    transform: calendarData.customType ? 'translate(14px, -9px) scale(0.75)' : 'translate(14px, -50%)',
                    fontSize: '1rem',
                    '&.Mui-focused': {
                      color: '#000000',
                      '&::after': { content: '" *"', color: '#000000' },
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
                  shrink={!!calendarData.year}
                  sx={{
                    color: '#757575',
                    '&::after': { content: '" *"', color: '#757575' },
                    top: '50%',
                    transform: calendarData.year ? 'translate(14px, -9px) scale(0.75)' : 'translate(14px, -50%)',
                    fontSize: '1rem',
                    '&.Mui-focused': {
                      color: '#000000',
                      '&::after': { content: '" *"', color: '#000000' },
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
                        '& .MuiMenuItem-root:hover': {
                          backgroundColor: '#D5FFDB',
                        },
                      },
                    },
                  }}
                  endAdornment={
                    <InputAdornment position="end" sx={{ marginRight: '-10px' }}>
                      <IconButton onClick={() => handleIconClick('year')}>
                        <CalendarToday sx={{ fontSize: '20px', color: '#000000' }} />
                      </IconButton>
                    </InputAdornment>
                  }
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
                  shrink={!!calendarData.period}
                  sx={{
                    color: '#757575',
                    '&::after': { content: '" *"', color: '#757575' },
                    top: '50%',
                    transform: calendarData.period ? 'translate(14px, -9px) scale(0.75)' : 'translate(14px, -50%)',
                    fontSize: '1rem',
                    '&.Mui-focused': {
                      color: '#000000',
                      '&::after': { content: '" *"', color: '#000000' },
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
                        '& .MuiMenuItem-root:hover': {
                          backgroundColor: '#D5FFDB',
                        },
                      },
                    },
                  }}
                  endAdornment={
                    <InputAdornment position="end" sx={{ marginRight: '-10px' }}>
                      <IconButton onClick={() => handleIconClick('period')}>
                        <CalendarToday sx={{ fontSize: '20px', color: '#000000' }} />
                      </IconButton>
                    </InputAdornment>
                  }
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
                  shrink={!!calendarData.startDate}
                  sx={{
                    color: '#757575',
                    '&::after': { content: '" *"', color: '#757575' },
                    top: '50%',
                    transform: calendarData.startDate ? 'translate(14px, -9px) scale(0.75)' : 'translate(14px, -50%)',
                    fontSize: '1rem',
                    '&.Mui-focused': {
                      color: '#000000',
                      '&::after': { content: '" *"', color: '#000000' },
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
                  shrink={!!calendarData.endDate}
                  sx={{
                    color: '#757575',
                    '&::after': { content: '" *"', color: '#757575' },
                    top: '50%',
                    transform: calendarData.endDate ? 'translate(14px, -9px) scale(0.75)' : 'translate(14px, -50%)',
                    fontSize: '1rem',
                    '&.Mui-focused': {
                      color: '#000000',
                      '&::after': { content: '" *"', color: '#000000' },
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
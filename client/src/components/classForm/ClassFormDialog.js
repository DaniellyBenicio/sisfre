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

const ClassFormDialog = ({ open, onClose, classToEdit, onSubmitSuccess, isEditMode }) => {
  const [classData, setClassData] = useState({
    course: '',
    semester: '',
    year: '',
    period: '',
    shift: '',
    type: '',
  });
  const [courses, setCourses] = useState([]); // Initialize as empty array
  const [error, setError] = useState(null);

  const isFormFilled = classData.course && classData.semester && classData.year && classData.period && classData.shift && classData.type;

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        console.log('ClassFormDialog - Cursos retornados:', response.data);
        
        // Ensure courses is an array
        const coursesArray = Array.isArray(response.data) 
          ? response.data 
          : response.data.courses || [];
        
        setCourses(coursesArray); // Set courses to the array
      } catch (err) {
        console.error('ClassFormDialog - Erro ao buscar cursos:', err);
        setError('Erro ao carregar a lista de cursos.');
        setCourses([]); // Ensure courses is an empty array on error
      }
    };

    if (open) {
      fetchCourses();
    }
  }, [open]);

  const handleInputChange = (e) => {
    setClassData({ ...classData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!classData.course || !classData.semester || !classData.year || !classData.period || !classData.shift || !classData.type) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (!classData.year.match(/^\d{4}$/)) {
      setError('O ano deve estar no formato AAAA (ex.: 2020).');
      return;
    }

    if (!['1', '2'].includes(classData.period)) {
      setError('O período deve ser 1 ou 2.');
      return;
    }

    try {
      const payload = {
        course: classData.course,
        semester: classData.semester,
        year: classData.year,
        period: classData.period,
        shift: classData.shift,
        type: classData.type,
      };

      console.log('ClassFormDialog - Payload enviado:', payload);

      let response;
      if (isEditMode) {
        response = await api.put(`/classes/${classToEdit?.id}`, payload);
      } else {
        response = await api.post(`/classes`, payload);
      }

      console.log('ClassFormDialog - Resposta da API:', response.data);

      onSubmitSuccess(response.data.class, isEditMode);
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} turma: ${err.message}`;
      setError(errorMessage);
      console.error('ClassFormDialog - Erro:', err);
    }
  };

  useEffect(() => {
    if (classToEdit) {
      const [year, period] = classToEdit.year ? classToEdit.year.split('.') : ['', ''];
      setClassData({
        course: classToEdit.course || '',
        semester: classToEdit.semester || '',
        year: year || '',
        period: period || '',
        shift: classToEdit.shift || '',
        type: classToEdit.type || '',
      });
      setError(null);
    } else {
      setClassData({
        course: '',
        semester: '',
        year: '',
        period: '',
        shift: '',
        type: '',
      });
      setError(null);
    }
  }, [classToEdit, open]);

  // Generate years from 2020 to 2029
  const years = Array.from({ length: 10 }, (_, i) => (2020 + i).toString());

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
          {isEditMode ? 'Editar Turma' : 'Cadastrar Turma'}
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
                id="course-label"
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
                Curso
              </InputLabel>
              <StyledSelect
                name="course"
                value={classData.course}
                onChange={handleInputChange}
                label="Curso"
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
                {courses.length === 0 ? (
                  <MenuItem disabled value="">
                    Nenhum curso disponível
                  </MenuItem>
                ) : (
                  courses.map((course) => (
                    <MenuItem key={course.id} value={course.name}>
                      {course.name}
                    </MenuItem>
                  ))
                )}
              </StyledSelect>
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
                  id="semester-label"
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
                  Semestre
                </InputLabel>
                <StyledSelect
                  name="semester"
                  value={classData.semester}
                  onChange={handleInputChange}
                  label="Semestre"
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
                  {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'].map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      {sem}
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
                  '& .MuiSelect-icon': {
                    display: 'none',
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
                  name="year"
                  value={classData.year}
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
                      <IconButton
                        onClick={(e) => {
                          const select = e.currentTarget.parentElement?.parentElement?.querySelector('select');
                          if (select) {
                            select.focus();
                            select.click();
                          }
                        }}
                      >
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
                  name="period"
                  value={classData.period}
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
                  id="shift-label"
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
                  Turno
                </InputLabel>
                <StyledSelect
                  name="shift"
                  value={classData.shift}
                  onChange={handleInputChange}
                  label="Turno"
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
                  <MenuItem value="Matutino">Matutino</MenuItem>
                  <MenuItem value="Vespertino">Vespertino</MenuItem>
                  <MenuItem value="Noturno">Noturno</MenuItem>
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
                  name="type"
                  value={classData.type}
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
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Convencional">Convencional</MenuItem>
                  <MenuItem value="Pós Greve">Pós Greve</MenuItem>
                </StyledSelect>
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
                {isEditMode ? 'Atualizar' : 'Salvar'}
              </StyledButton>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ClassFormDialog;
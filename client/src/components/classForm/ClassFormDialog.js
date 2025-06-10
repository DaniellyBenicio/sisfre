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
import { StyledSelect } from '../../components/inputs/Input';

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
  });
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  const isFormFilled = classData.course && classData.semester;

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        console.log('ClassFormDialog - Cursos retornados:', response.data);
        
        const coursesArray = Array.isArray(response.data) 
          ? response.data 
          : response.data.courses || [];
        
        setCourses(coursesArray);
      } catch (err) {
        console.error('ClassFormDialog - Erro ao buscar cursos:', err);
        setError('Erro ao carregar a lista de cursos.');
        setCourses([]);
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

    if (!classData.course || !classData.semester) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      const payload = {
        course: classData.course,
        semester: classData.semester,
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
      setClassData({
        course: classToEdit.course || '',
        semester: classToEdit.semester || '',
      });
      setError(null);
    } else {
      setClassData({
        course: '',
        semester: '',
      });
      setError(null);
    }
  }, [classToEdit, open]);

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
        <DialogTitle sx={{ textAlign: 'center', marginTop: '27px', color: '#087619', fontWeight: 'bold' }}>
          {isEditMode ? 'Editar Turma' : 'Cadastrar Turma'}
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 5, py: 0 }}>
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
                my: 2.5,
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
                '& .MuiInputLabel-root': {
                  top: '50%',
                  transform: 'translate(14px, -50%)',
                  fontSize: '1rem',
                },
                '& .MuiInputLabel-shrink': {
                  top: 0,
                  transform: 'translate(14px, -9px) scale(0.75)',
                },
              }}
            >
              <InputLabel
                id="course-label"
                sx={{
                  color: '#757575',
                  '&::after': { content: '" *"', color: '#757575' },
                  '&.Mui-focused, &.MuiInputLabel-shrink': {
                    color: '#000000',
                    '&::after': { content: '" *"', color: '#000000' },
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
                '& .MuiInputLabel-root': {
                  top: '50%',
                  transform: 'translate(14px, -50%)',
                  fontSize: '1rem',
                },
                '& .MuiInputLabel-shrink': {
                  top: 0,
                  transform: 'translate(14px, -9px) scale(0.75)',
                },
              }}
            >
              <InputLabel
                id="semester-label"
                sx={{
                  color: '#757575',
                  '&::after': { content: '" *"', color: '#757575' },
                  '&.Mui-focused, &.MuiInputLabel-shrink': {
                    color: '#000000',
                    '&::after': { content: '" *"', color: '#000000' },
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

            <DialogActions
              sx={{
                justifyContent: 'center',
                gap: 2,
                padding: '10px 24px',
                marginTop: '35px',
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

export default ClassFormDialog;
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
  Typography,
} from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import api from '../../service/api';
import { StyledSelect } from '../../components/inputs/Input';
import PropTypes from 'prop-types';

const INSTITUTIONAL_COLOR = '#307c34';

const StyledButton = styled(Button)(({ theme }) => ({
  width: "fit-content",
  minWidth: 100,
  padding: "8px 28px",
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  [theme.breakpoints.down("sm")]: {
    gap: "3px",
  }
}));

const ClassFormDialog = ({ open, onClose, classToEdit, onSubmitSuccess, isEditMode, setAlert }) => {
  const [classData, setClassData] = useState({
    courseId: '',
    semester: '',
  });
  const [courses, setCourses] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const isFormFilled = classData.courseId && classData.semester;
  const isInactive = isEditMode && classToEdit?.isActive === false;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses?limit=100');
        console.log('ClassFormDialog - Cursos retornados:', response.data);

        let coursesArray = [];
        if (Array.isArray(response.data)) {
          coursesArray = response.data;
        } else if (response.data && Array.isArray(response.data.courses)) {
          coursesArray = response.data.courses;
        } else if (response.data && typeof response.data === 'object') {
          coursesArray = [response.data];
        }

        coursesArray = coursesArray.filter(
          (course) => course && typeof course === 'object' && course.id && course.name
        );

        setCourses(coursesArray);
        if (coursesArray.length === 0) {
          setErrorMessage('Nenhum curso disponível.');
        }
      } catch (err) {
        console.error('ClassFormDialog - Erro ao buscar cursos:', err);
        setErrorMessage('Erro ao carregar a lista de cursos.');
      }
    };

    if (open) {
      fetchCourses();
    }
  }, [open]);

  useEffect(() => {
    if (classToEdit) {
      setClassData({
        courseId: classToEdit.course?.id || classToEdit.courseId || '',
        semester: classToEdit.semester || '',
      });
      setErrorMessage(null);
    } else {
      setClassData({
        courseId: '',
        semester: '',
      });
      setErrorMessage(null);
    }
  }, [classToEdit, open]);

  const handleInputChange = (e) => {
    setClassData({ ...classData, [e.target.name]: e.target.value });
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!classData.courseId || !classData.semester) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }

    try {
      const payload = {
        courseId: parseInt(classData.courseId),
        semester: classData.semester,
      };

      console.log('ClassFormDialog - Payload enviado:', payload);

      let response;
      if (isEditMode) {
        response = await api.put(`/classes/${classToEdit?.courseClassId}`, payload);
      } else {
        response = await api.post('/classes', payload);
      }

      console.log('ClassFormDialog - Resposta da API:', response.data);

      const course = courses.find((c) => c.id === parseInt(classData.courseId)) || {
        id: classData.courseId,
        name: 'Desconhecido',
      };
      const updatedClass = {
        ...response.data.class,
        course: { id: course.id, name: course.name },
      };

      onSubmitSuccess(updatedClass, isEditMode);
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} turma: ${err.message}`;
      if (setAlert) setAlert({ type: 'error', message: errorMessage });
      else setErrorMessage(errorMessage);
    }
  };

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
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 5, py: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            {isInactive && (
              <Typography sx={{ color: 'error.main', mb: 2, textAlign: 'center' }}>
                Esta turma está inativa e não pode ser editada.
              </Typography>
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
                name="courseId"
                value={classData.courseId}
                onChange={handleInputChange}
                label="Curso"
                required
                disabled={isInactive}
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
                    <MenuItem key={course.id} value={course.id}>
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
                disabled={isInactive}
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

            {errorMessage && (
              <Box sx={{ color: 'error.main', mt: 1, textAlign: 'center' }}>
                {errorMessage}
              </Box>
            )}

            <DialogActions
              sx={{
                justifyContent: 'center',
                gap: 2,
                padding: '10px 24px',
                marginTop: '15px',
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
                disabled={!isFormFilled || isInactive}
                sx={{
                  backgroundColor: !isFormFilled || isInactive ? '#E0E0E0' : INSTITUTIONAL_COLOR,
                  '&:hover': { backgroundColor: !isFormFilled || isInactive ? '#E0E0E0' : '#26692b' },
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

ClassFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classToEdit: PropTypes.shape({
    courseClassId: PropTypes.number,
    course: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
    courseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    semester: PropTypes.string,
    isActive: PropTypes.bool,
  }),
  onSubmitSuccess: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  setAlert: PropTypes.func,
};

export default ClassFormDialog;
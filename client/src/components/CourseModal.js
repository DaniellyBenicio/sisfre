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
import api from '../service/api';
import CustomAlert from './alert/CustomAlert';
import { StyledTextField, StyledSelect } from './inputs/Input';

const VALID_COURSE_TYPES = [
  'CURSO LIVRE',
  'DOUTORADO',
  'EAD',
  'ESPECIALIZAÇÃO',
  'EXTENSÃO',
  'GRADUAÇÃO',
  'INTEGRADO',
  'MESTRADO',
  'PROEJA',
  'PÓS-DOUTORADO',
  'RESIDÊNCIA',
  'SEQUENCIAL',
  'TÉCNICO',
];

const CourseModal = ({ open, onClose, courseToEdit, onUpdate }) => {
  const [alert, setAlert] = useState(null);
  const [course, setCourse] = useState({
    acronym: '',
    name: '',
    type: '',
    coordinatorId: '',
  });
  const [initialCourse, setInitialCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const isFormFilled = course.acronym && course.type && course.name && course.name.trim() !== '';

  const hasChanges = isEditMode && initialCourse && (
    course.acronym !== initialCourse.acronym ||
    course.name !== initialCourse.name ||
    course.type !== initialCourse.type ||
    course.coordinatorId !== initialCourse.coordinatorId
  );

  const handleSubmitSuccess = (newCourse) => {
    setAlert({
      message: courseToEdit ? 'Curso atualizado com sucesso!' : 'Curso cadastrado com sucesso!',
      type: 'success',
    });
    onClose();
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    console.log('courseToEdit:', courseToEdit);
    if (open) {
      setIsEditMode(!!courseToEdit);
      if (courseToEdit) {
        const normalizedType = courseToEdit.type
          ? VALID_COURSE_TYPES.find((type) => type.toUpperCase() === courseToEdit.type.toUpperCase()) || ''
          : '';
        console.log('Type normalizado:', normalizedType);
        const courseData = {
          acronym: courseToEdit.acronym || '',
          name: courseToEdit.name || '',
          type: normalizedType,
          coordinatorId: courseToEdit.coordinatorId ? String(courseToEdit.coordinatorId) : 'none',
        };
        setCourse(courseData);
        setInitialCourse(courseData);
        setError(null);
      } else {
        setCourse({
          acronym: '',
          name: '',
          type: '',
          coordinatorId: 'none',
        });
        setInitialCourse(null);
        setError(null);
      }
    }
  }, [courseToEdit, open]);

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        setLoading(true);

        const usersResponse = await api.get('/users');
        console.log('Resposta da API /users:', usersResponse.data);
        let allUsers = usersResponse.data;

        if (!Array.isArray(allUsers)) {
          console.warn('response.data não é um array:', allUsers);
          allUsers = allUsers.users || [];
        }

        const coordinators = allUsers.filter((user) => user.accessType === 'Coordenador');

        const coursesResponse = await api.get('/courses');
        console.log('Resposta da API /courses:', coursesResponse.data);
        let allCourses = coursesResponse.data;

        if (!Array.isArray(allCourses)) {
          console.warn('coursesResponse.data não é um array:', allCourses);
          allCourses = allCourses.courses || [];
        }

        const assignedCoordinatorIds = allCourses
          .filter((course) => course.coordinatorId)
          .map((course) => course.coordinatorId);

        const availableCoordinators = coordinators.filter(
          (coordinator) => !assignedCoordinatorIds.includes(coordinator.id)
        );

        if (courseToEdit && courseToEdit.coordinatorId) {
          const currentCoordinator = coordinators.find(
            (coordinator) => coordinator.id === courseToEdit.coordinatorId
          );
          if (currentCoordinator && !availableCoordinators.includes(currentCoordinator)) {
            availableCoordinators.push(currentCoordinator);
          }
        }
        console.log('Coordenadores disponíveis:', availableCoordinators);
        setCoordinators(availableCoordinators);
      } catch (err) {
        console.error('Erro ao carregar coordenadores:', err);
        setError('Erro ao carregar coordenadores');
      } finally {
        setLoading(false);
      }
    };
    if (open) {
      fetchCoordinators();
    }
  }, [open, courseToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}: ${value}`);
    if (name === 'type' && !VALID_COURSE_TYPES.includes(value)) {
      console.warn(`Valor inválido para type: ${value}`);
      return;
    }
    setCourse({ ...course, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!course.acronym || !course.name || !course.type) {
      setError('Os campos nome, sigla e tipo são obrigatórios.');
      return;
    }

    try {
      const payload = {
        acronym: course.acronym,
        name: course.name,
        type: course.type,
        coordinatorId: course.coordinatorId === 'none' ? null : Number(course.coordinatorId),
      };

      console.log('Payload enviado:', payload);

      let response;
      if (courseToEdit) {
        console.log(`Enviando PUT para /courses}/${courseToEdit.id}`);
        response = await api.put(`/courses/${courseToEdit.id}`, payload);
        console.log('Resposta da API (PUT):', response.data);
      } else {
        console.log('Enviando POST para /courses');
        response = await api.post('/courses', payload);
        console.log('Resposta da API (POST):', response.data);
      }

      onUpdate(response.data);
      handleSubmitSuccess();
    } catch (err) {
      console.error('Erro ao salvar curso:', err);
      console.log('Erro completo:', err.response?.data);
      setError(err.response?.data?.error || 'Erro ao salvar curso: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
        <DialogTitle sx={{ textAlign: 'center', marginTop: '19px', color: '#087619', fontWeight: 'bold' }}>
          {isEditMode ? 'Editar Curso' : 'Cadastrar Curso'}
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 5, minHeight: '400px' }}>
          {!loading ? (
            <form onSubmit={handleSubmit}>
              {error && <Box sx={{ color: 'red', marginBottom: 2, fontSize: '0.875rem' }}>{error}</Box>}

              <StyledTextField
                sx={{
                  my: 1.5,
                  '& .MuiInputBase-root': {
                    height: '56px',
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
                name="name"
                size="small"
                variant="outlined"
                fullWidth
                label="Nome"
                margin="normal"
                value={course.name}
                onChange={handleInputChange}
                required
              />

              <StyledTextField
                sx={{
                  my: 1.5,
                  '& .MuiInputBase-root': {
                    height: '56px',
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
                name="acronym"
                fullWidth
                variant="outlined"
                size="small"
                label="Sigla"
                margin="normal"
                value={course.acronym}
                onChange={handleInputChange}
                required
              />

              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  my: 1.5,
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000 !important',
                    borderWidth: '2px',
                  },
                }}
              >
                <InputLabel
                  id="accessType-label"
                  sx={{ '&.Mui-focused, &.MuiInputLabel-shrink': { color: '#000000' } }}
                >
                  Tipo de Curso *
                </InputLabel>
                <StyledSelect
                  name="type"
                  value={course.type}
                  onChange={handleInputChange}
                  label="Tipo de Curso *"
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
                  <MenuItem value="CURSO LIVRE">Curso Livre</MenuItem>
                  <MenuItem value="DOUTORADO">Doutorado</MenuItem>
                  <MenuItem value="EAD">EAD</MenuItem>
                  <MenuItem value="ESPECIALIZAÇÃO">Especialização</MenuItem>
                  <MenuItem value="EXTENSÃO">Extensão</MenuItem>
                  <MenuItem value="GRADUAÇÃO">Graduação</MenuItem>
                  <MenuItem value="INTEGRADO">Integrado</MenuItem>
                  <MenuItem value="MESTRADO">Mestrado</MenuItem>
                  <MenuItem value="PROEJA">PROEJA</MenuItem>
                  <MenuItem value="PÓS-DOUTORADO">Pós-Doutorado</MenuItem>
                  <MenuItem value="RESIDÊNCIA">Residência</MenuItem>
                  <MenuItem value="SEQUENCIAL">Sequencial</MenuItem>
                  <MenuItem value="TÉCNICO">Técnico</MenuItem>
                </StyledSelect>
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  my: 1.5,
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000 !important',
                    borderWidth: '2px',
                  },
                }}
              >
                <InputLabel
                  id="coordinator-label"
                  sx={{ "&.Mui-focused, &.MuiInputLabel-shrink": { color: "#000000" } }}
                >
                  Coordenador
                </InputLabel>
                <StyledSelect
                  name="coordinatorId"
                  label="Coordenador"
                  value={course.coordinatorId}
                  onChange={handleInputChange}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: "200px",
                        overflowY: "auto",
                        width: "auto",
                        "& .MuiMenuItem-root:hover": {
                          backgroundColor: "#D5FFDB",
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="none">N/A</MenuItem>
                  {coordinators.map((user) => (
                    <MenuItem key={user.id} value={String(user.id)}>
                      {user.username}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>

              <DialogActions
                sx={{
                  justifyContent: 'center',
                  gap: 2,
                  padding: '10px 24px',
                  marginTop: '10px',
                }}
              >
                <Button
                  onClick={onClose}
                  variant="contained"
                  sx={{
                    width: 'fit-content',
                    minWidth: 100,
                    padding: '8px 28px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#F01424',
                    '&:hover': { backgroundColor: '#D4000F' },
                  }}
                >
                  <Close sx={{ fontSize: 24 }} />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={isEditMode ? !isFormFilled || !hasChanges : !isFormFilled}
                  sx={{
                    width: 'fit-content',
                    minWidth: 100,
                    padding: '8px 28px',
                    backgroundColor: '#087619',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    '&:hover': { backgroundColor: '#066915' },
                  }}
                >
                  <Save sx={{ fontSize: 24 }} />
                  {isEditMode ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </DialogActions>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={handleAlertClose}
        />
      )}
    </>
  );
};

export default CourseModal;
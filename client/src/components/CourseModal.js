import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, CircularProgress, Box,
  FormControl, MenuItem, IconButton, InputLabel
} from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import api from '../service/api';
import CustomAlert from './alert/CustomAlert';
import { StyledTextField, StyledSelect } from './inputs/Input';

const CourseModal = ({ open, onClose, courseToEdit, onUpdate }) => {
  const [alert, setAlert] = useState(null);
  const [course, setCourse] = useState({
    acronym: '',
    name: '',
    type: '',
    coordinatorId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinators, setCoordinators] = useState([]);

  const isFormFilled = course.name && course.name.trim() !== '';

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
    if (courseToEdit) {
      setCourse({
        acronym: courseToEdit.acronym || '',
        name: courseToEdit.name || '',
        type: courseToEdit.type || '',
        coordinatorId: courseToEdit.coordinatorId || ''
      });
      setError(null);

    } else {
      setCourse({
        acronym: '',
        name: '',
        type: '',
        coordinatorId: ''
      });
      setError(null);
    }
  }, [courseToEdit, open]);

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users');
        console.log('Resposta da API /users:', response.data);
        let allUsers = response.data;

        if (!Array.isArray(allUsers)) {
          console.warn('response.data não é um array:', allUsers);
          allUsers = allUsers.users || [];
        }

        const filtered = allUsers.filter(user => user.accessType === 'Coordenador');
        console.log('Coordenadores filtrados:', filtered);
        setCoordinators(filtered);

      } catch (err) {
        console.error('Erro ao buscar capas:', err);
        setError('Erro ao carregar coordenadores');
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinators();
  }, [open]);

  const handleInputChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

		if (!course.acronym || !course.name || !course.type) {
			setError('Os campos nome, sigla e tipo são obrigatórios.');
			setLoading(false);
			return;
		}

    try {
      let response;
      const payload = {
        acronym: course.acronym,
        name: course.name,
        type: course.type,
        coordinatorId: course.coordinatorId ? Number(course.coordinatorId) : null
      };

      console.log('Payload enviado:', payload);

      if (courseToEdit) {
        response = await api.put(`/courses/${courseToEdit.id}`, payload);
      } else {
        response = await api.post(`/courses`, payload);
      }

      onUpdate(response.data);
      handleSubmitSuccess();
    } catch (err) {
      console.log('Erro completo:', err.response);
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
            borderRadius: 4, 
            height: '489px',
            width: '520px',
            maxWidth: '90vw'
          } 
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', marginTop: '19px', color: '#087619', fontWeight: 'bold' }}>
          {courseToEdit ? "Editar Curso" : "Cadastrar Curso"}
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 5 }}>
          {loading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <Box sx={{ color: 'red', marginBottom: 2 }}>{error}</Box>}
              
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
                label='Nome'
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
                margin='normal'
                sx={{
                  my: 1.5,
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000 !important',
                    borderWidth: '2px',
                  },
                }}
              >
                <InputLabel
                  id='accessType-label'
                  sx={{ '&.Mui-focused, &.MuiInputLabel-shrink': { color: '#000000' } }}
                >
                  Tipo de Curso *
                </InputLabel>
                <StyledSelect
                  name='type'
                  value={course.type}
                  onChange={handleInputChange}
                  label='Tipo de Curso *'
                  required
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: '200px',
                        overflowY: 'auto',
                        width: 'auto',
                        '& .MuiMenuItem-root:hover': {
                          backgroundColor: '#D5FFDB'
                        }
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
                  <MenuItem value="PÓS-GRADUAÇÃO">Pós-Graduação</MenuItem>
                  <MenuItem value="RESIDÊNCIA">Residência</MenuItem>
                  <MenuItem value="SEQUENCIAL">Sequencial</MenuItem>
                  <MenuItem value="TÉCNICO">Técnico</MenuItem>
                </StyledSelect>
              </FormControl>

              <FormControl
                fullWidth
                margin='normal'
                sx={{
                  my: 1.5,
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000000 !important',
                    borderWidth: '2px',
                  },
                }}
              >
                <InputLabel
                  id='accessType-label'
                  sx={{ '&.Mui-focused, &.MuiInputLabel-shrink': { color: '#000000' } }}
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
                        maxHeight: '200px',
                        overflowY: 'auto',
                        width: 'auto',
                        '& .MuiMenuItem-root:hover': {
                          backgroundColor: '#D5FFDB'
                        }
                      },
                    },
                  }}
                >
                  {coordinators.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
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
                  marginTop: '10px'
                }}
              >
                <Button 
                  onClick={onClose} 
                  variant="contained"
                  sx={{
                    padding: '8px 28px',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#F01424',
                    "&:hover": { backgroundColor: "#D4000F" }
                  }}
                >
                  <Close sx={{ fontSize: 24 }} />
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  color="primary" 
                  variant="contained" 
                  disabled={!isFormFilled}
                  sx={{
                    padding: '8px 28px',
                    backgroundColor: '#087619',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    "&:hover": { backgroundColor: "#066915" },
                  }}
                >
                  <Save sx={{ fontSize: 24 }} />
                  {courseToEdit ? "Salvar" : "Cadastrar"}
                </Button>
              </DialogActions>
            </form>
          )}
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
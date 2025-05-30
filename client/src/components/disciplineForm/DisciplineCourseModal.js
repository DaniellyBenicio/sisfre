import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, IconButton, TextField, Autocomplete } from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import api from '../../service/api';
import { StyledTextField } from '../inputs/Input';
import CustomAlert from '../alert/CustomAlert';

const DisciplineCourse = ({ open, onClose, courseId, onUpdate }) => {
  const [discipline, setDiscipline] = useState({
    disciplineId: null,
    acronym: '',
    workload: '',
  });
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  const isFormFilled = discipline.disciplineId && discipline.workload && discipline.workload.trim() !== '';

  const handleSubmitSuccess = () => {
    setAlert({
      message: 'Disciplina adicionada ao curso com sucesso!',
      type: 'success',
    });
    onClose();
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    if (open) {
      setDiscipline({
        disciplineId: null,
        acronym: '',
        workload: '',
      });
      setError(null);

      const fetchDisciplines = async () => {
        try {
          setLoading(true);
          const disciplinesResponse = await api.get('/disciplines/all');
          
          const allDisciplines = Array.isArray(disciplinesResponse.data) 
            ? disciplinesResponse.data 
            : disciplinesResponse.data.disciplines || [];
          
          let availableDisciplines = allDisciplines;
          try {
            const courseDisciplinesResponse = await api.get(`/courses/${courseId}/disciplines`);
            const courseDisciplineIds = Array.isArray(courseDisciplinesResponse.data)
              ? courseDisciplinesResponse.data.map(d => d.disciplineId || d.id)
              : [];
            availableDisciplines = allDisciplines.filter(
              d => !courseDisciplineIds.includes(d.id)
            );
          } catch (courseErr) {
            console.warn('Não foi possível carregar disciplinas do curso:', courseErr.message);
          }
          
          setDisciplines(availableDisciplines);
        } catch (err) {
          console.error('Erro ao carregar disciplinas:', err);
          setError(`Erro ao carregar disciplinas: ${err.response?.data?.error || err.message}`);
        } finally {
          setLoading(false);
        }
      };
      fetchDisciplines();
    }
  }, [open, courseId]);

  const handleDisciplineChange = (event, newValue) => {
    setDiscipline({
      ...discipline,
      disciplineId: newValue ? newValue.id : null,
      acronym: newValue ? newValue.acronym : '',
    });
  };

  const handleWorkloadChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      setDiscipline({ ...discipline, workload: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!discipline.disciplineId || !discipline.workload) {
      setError('Os campos disciplina e carga horária são obrigatórios.');
      setLoading(false);
      return;
    }

    if (parseInt(discipline.workload) <= 0) {
      setError('A carga horária deve ser um número maior que zero.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        disciplineId: discipline.disciplineId,
        workload: parseInt(discipline.workload),
      };

      console.log('Payload enviado:', payload);

      const response = await api.post(`/courses/${courseId}/disciplines`, payload);

      console.log('Resposta da API:', response.data);

      onUpdate(response.data);
      handleSubmitSuccess();
    } catch (err) {
      console.error('Erro completo:', err.response);
      setError(err.response?.data?.error || 'Erro ao adicionar disciplina ao curso: ' + err.message);
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
        <DialogTitle sx={{ textAlign: 'center', marginTop: '27px', color: '#087619', fontWeight: 'bold' }}>
          Adicionar Disciplina ao Curso
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 5 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center' }}>Carregando...</Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <Box sx={{ color: 'red', marginBottom: 2, fontSize: '0.875rem' }}>{error}</Box>}
              <Autocomplete
                options={disciplines}
                getOptionLabel={(option) => option.name || ''}
                onChange={handleDisciplineChange}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Disciplina"
                    variant="outlined"
                    fullWidth
                    required
                    sx={{
                      my: 2.5,
                      '& .MuiInputBase-root': { height: '56px' },
                      '& .MuiInputLabel-root': { top: '50%', transform: 'translate(14px, -50%)', fontSize: '1rem' },
                      '& .MuiInputLabel-shrink': { top: 0, transform: 'translate(14px, -9px) scale(0.75)' },
                    }}
                  />
                )}
                noOptionsText="Nenhuma disciplina disponível"
                disabled={loading}
              />
              <Box display="flex" gap={2} my={1.5}>
                <StyledTextField
                  name="acronym"
                  label="Sigla"
                  variant="outlined"
                  size="small"
                  value={discipline.acronym}
                  disabled
                  sx={{
                    flex: 1,
                    '& .MuiInputBase-root': { height: '56px' },
                    '& .MuiInputLabel-root': { top: '50%', transform: 'translate(14px, -50%)', fontSize: '1rem' },
                    '& .MuiInputLabel-shrink': { top: 0, transform: 'translate(14px, -9px) scale(0.75)' },
                  }}
                />
                <StyledTextField
                  name="workload"
                  label="Carga Horária"
                  variant="outlined"
                  size="small"
                  value={discipline.workload}
                  onChange={handleWorkloadChange}
                  required
                  type="number"
                  inputProps={{ min: 1 }}
                  sx={{
                    flex: 1,
                    '& .MuiInputBase-root': { height: '56px' },
                    '& .MuiInputLabel-root': { top: '50%', transform: 'translate(14px, -50%)', fontSize: '1rem' },
                    '& .MuiInputLabel-shrink': { top: 0, transform: 'translate(14px, -9px) scale(0.75)' },
                  }}
                />
              </Box>
              <DialogActions
                sx={{
                  justifyContent: 'center',
                  gap: 2,
                  padding: '10px 24px',
                  marginTop: '35px',
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
                  disabled={!isFormFilled || loading}
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
                  Adicionar
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

export default DisciplineCourse;
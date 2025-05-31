import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, IconButton, Autocomplete } from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import api from '../../service/api';
import { StyledTextField } from '../inputs/Input';
import CustomAlert from '../alert/CustomAlert';

const DisciplineCourse = ({ open, onClose, courseId, disciplineToEdit, onUpdate }) => {
  const [discipline, setDiscipline] = useState({
    disciplineId: null,
    acronym: '',
    workload: '',
    name: '',
  });
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const isFormFilled = discipline.disciplineId && discipline.workload !== null && discipline.workload !== undefined && discipline.workload.trim() !== '';

  const handleSubmitSuccess = () => {
    setAlert({
      message: isEditMode ? 'Disciplina atualizada com sucesso!' : 'Disciplina adicionada ao curso com sucesso!',
      type: 'success',
    });
    onClose();
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    if (open) {
      setIsEditMode(!!disciplineToEdit);
      if (disciplineToEdit) {
        console.log('disciplineToEdit:', disciplineToEdit);
        const disciplineId = disciplineToEdit.disciplineId || null;
        setDiscipline({
          disciplineId,
          acronym: disciplineToEdit.acronym || '',
          workload: disciplineToEdit.workload != null ? String(disciplineToEdit.workload) : '',
          name: disciplineToEdit.name || 'Disciplina Desconhecida',
        });

        if (!disciplineId && disciplineToEdit.acronym) {
          // Fetch disciplineId by acronym
          const fetchDisciplineId = async () => {
            try {
              setLoading(true);
              const response = await api.get('/disciplines', {
                params: { acronym: disciplineToEdit.acronym },
              });
              const fetchedDisciplines = response.data.disciplines || [];
              if (fetchedDisciplines.length === 1) {
                setDiscipline(prev => ({
                  ...prev,
                  disciplineId: fetchedDisciplines[0].id,
                  name: fetchedDisciplines[0].name || disciplineToEdit.name,
                }));
                setError(null);
              } else {
                setError('Disciplina não encontrada pelo sigla. Contate o suporte.');
              }
            } catch (err) {
              console.error('Erro ao buscar disciplineId:', err);
              setError('Não foi possível determinar o ID da disciplina. Contate o suporte.');
            } finally {
              setLoading(false);
            }
          };
          fetchDisciplineId();
        } else if (!disciplineId) {
          setError('ID da disciplina não fornecido e sem sigla para busca.');
        } else {
          setError(null);
        }
      } else {
        setDiscipline({
          disciplineId: null,
          acronym: '',
          workload: '',
          name: '',
        });
        setError(null);
      }
    }
  }, [disciplineToEdit, open]);

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        setLoading(true);
        const disciplinesResponse = await api.get('/disciplines/all');
        let allDisciplines = Array.isArray(disciplinesResponse.data)
          ? disciplinesResponse.data
          : disciplinesResponse.data.disciplines || [];
        console.log('allDisciplines:', allDisciplines);

        let availableDisciplines = allDisciplines;
        if (!isEditMode) {
          try {
            const courseDisciplinesResponse = await api.get('/course/discipline');
            const courseDisciplineIds = Array.isArray(courseDisciplinesResponse.data)
              ? courseDisciplinesResponse.data.map(d => d.disciplineId)
              : [];
            availableDisciplines = allDisciplines.filter(
              d => !courseDisciplineIds.includes(d.id)
            );
          } catch (courseErr) {
            console.warn('Não foi possível carregar disciplinas do curso:', courseErr.message);
            setError('Erro ao carregar disciplinas associadas ao curso.');
            return;
          }
        } else if (discipline.disciplineId || disciplineToEdit?.acronym) {
          const currentDiscipline = {
            id: discipline.disciplineId || `temp-${disciplineToEdit?.acronym || 'unknown'}`,
            name: disciplineToEdit?.name || discipline.name || 'Disciplina Desconhecida',
            acronym: disciplineToEdit?.acronym || discipline.acronym || '',
          };
          availableDisciplines = [
            ...allDisciplines.filter(d => d.id !== discipline.disciplineId),
            currentDiscipline,
          ];
        }

        setDisciplines(availableDisciplines);
        console.log('availableDisciplines:', availableDisciplines);
        console.log('discipline:', discipline);
        console.log('selectedDiscipline:', disciplines.find(d => d.id === discipline.disciplineId));
      } catch (err) {
        console.error('Erro ao carregar disciplinas:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(`Erro ao carregar disciplinas: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    if (open) {
      fetchDisciplines();
    }
  }, [open, isEditMode, disciplineToEdit, discipline.disciplineId, discipline.name, discipline.acronym]);

  const handleDisciplineChange = (event, newValue) => {
    setDiscipline({
      ...discipline,
      disciplineId: newValue ? newValue.id : null,
      acronym: newValue ? newValue.acronym : '',
      name: newValue ? newValue.name : '',
    });
  };

  const handleWorkloadChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value))) {
      setDiscipline({ ...discipline, workload: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!discipline.disciplineId || discipline.disciplineId.startsWith('temp-')) {
      setError('ID da disciplina inválido. Contate o suporte.');
      setLoading(false);
      return;
    }

    const workloadNum = parseInt(discipline.workload);
    if (isNaN(workloadNum) || discipline.workload === '') {
      setError('A carga horária é obrigatória.');
      setLoading(false);
      return;
    }

    if (workloadNum <= 0) {
      setError('A carga horária deve ser um número maior que zero.');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (isEditMode) {
        const payload = {
          workload: workloadNum,
        };
        response = await api.put(`/course/discipline/${discipline.disciplineId}`, payload);
      } else {
        const payload = {
          disciplineId: discipline.disciplineId,
          workload: workloadNum,
        };
        response = await api.post(`/course/discipline`, payload);
      }

      console.log('Resposta da API:', response.data);
      onUpdate(response.data);
      handleSubmitSuccess();
    } catch (err) {
      console.error(`Erro ao ${isEditMode ? 'atualizar' : 'adicionar'} disciplina:`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.message || `Erro ao ${isEditMode ? 'atualizar' : 'adicionar'} disciplina ao curso: ${err.message}`);
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
          {isEditMode ? 'Editar Disciplina do Curso' : 'Adicionar Disciplina ao Curso'}
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
                value={disciplines.find(d => d.id === discipline.disciplineId) || (discipline.name ? { id: discipline.disciplineId, name: discipline.name, acronym: discipline.acronym } : null)}
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
                disabled={loading || isEditMode}
                componentsProps={{
                  paper: { sx: { width: 'auto' } },
                  listbox: {
                    sx: {
                      maxHeight: '200px',
                      overflowY: 'auto',
                      '& .MuiAutocomplete-option:hover': { backgroundColor: '#D5FFDB' },
                    },
                  },
                }}
              />
              <Box display="flex" gap={2} my={1.5}>
                <StyledTextField
                  name="acronym"
                  label="Sigla"
                  variant="outlined"
                  size="small"
                  value={discipline.acronym || ''}
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
                  inputProps={{ min: 0 }}
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
                  {isEditMode ? 'Salvar' : 'Adicionar'}
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
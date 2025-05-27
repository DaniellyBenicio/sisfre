import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, CircularProgress, Box, IconButton } from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import api from '../../service/api';
import { StyledTextField } from '../inputs/Input';
import CustomAlert from '../alert/CustomAlert';

const DisciplineModal = ({ open, onClose, disciplineToEdit, onUpdate }) => {
  const [discipline, setDiscipline] = useState({
    acronym: '',
    name: '',
    workload: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const isFormFilled = discipline.name && discipline.name.trim() !== '' && discipline.acronym && discipline.workload;

  const handleSubmitSuccess = (newDiscipline) => {
    setAlert({
      message: disciplineToEdit ? 'Disciplina atualizada com sucesso!' : 'Disciplina cadastrada com sucesso!',
      type: 'success',
    });
    onClose();
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    if (open) {
      // Atualiza o estado apenas quando o modal é aberto
      setIsEditMode(!!disciplineToEdit);
      if (disciplineToEdit) {
        setDiscipline({
          acronym: disciplineToEdit.acronym || '',
          name: disciplineToEdit.name || '',
          workload: disciplineToEdit.workload || '',
        });
        setError(null);
      } else {
        setDiscipline({
          acronym: '',
          name: '',
          workload: '',
        });
        setError(null);
      }
    }
  }, [open, disciplineToEdit]);

  const handleInputChange = (e) => {
    setDiscipline({ ...discipline, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!discipline.acronym || !discipline.name || !discipline.workload) {
      setError('Os campos nome, sigla e carga horária são obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        acronym: discipline.acronym,
        name: discipline.name,
        workload: Number(discipline.workload),
      };

      console.log('Payload enviado:', payload);

      let response;
      if (disciplineToEdit) {
        response = await api.put(`/discipline/${disciplineToEdit.id}`, payload);
      } else {
        response = await api.post(`/disciplines`, payload);
      }

      console.log('Resposta da API:', response.data);

      onUpdate(response.data);
      handleSubmitSuccess();
      onClose();
    } catch (err) {
      console.error('Erro completo:', err.response);
      setError(err.response?.data?.error || 'Erro ao salvar disciplina: ' + err.message);
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
          {isEditMode ? 'Editar Disciplina' : 'Cadastrar Disciplina'}
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 5 }}>
          {!loading ? (
            <form onSubmit={handleSubmit}>
              {error && <Box sx={{ color: 'red', marginBottom: 2, fontSize: '0.875rem' }}>{error}</Box>}
              <StyledTextField
                sx={{
                  my: 2.5,
                  '& .MuiInputBase-root': { height: '56px' },
                  '& .MuiInputLabel-root': { top: '50%', transform: 'translate(14px, -50%)', fontSize: '1rem' },
                  '& .MuiInputLabel-shrink': { top: 0, transform: 'translate(14px, -9px) scale(0.75)' },
                }}
                name="name"
                size="small"
                variant="outlined"
                fullWidth
                label="Nome"
                margin="normal"
                value={discipline.name}
                onChange={handleInputChange}
                required
              />
              <Box display="flex" gap={2} my={1.5}>
                <StyledTextField
                  name="acronym"
                  label="Sigla"
                  variant="outlined"
                  size="small"
                  value={discipline.acronym}
                  onChange={handleInputChange}
                  required
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
                  onChange={handleInputChange}
                  required
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
                  disabled={!isFormFilled}
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
                  {isEditMode ? 'Salvar' : 'Cadastrar'} {/* Usa isEditMode aqui também */}
                </Button>
              </DialogActions>
            </form>
          ) : null }
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

export default DisciplineModal;
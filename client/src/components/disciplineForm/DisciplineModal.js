import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, IconButton, CircularProgress } from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import api from '../../service/api';
import { StyledTextField } from '../inputs/Input';
import CustomAlert from '../alert/CustomAlert';

const DisciplineModal = ({ open, onClose, disciplineToEdit, onUpdate }) => {
  const [discipline, setDiscipline] = useState({
    acronym: '',
    name: '',
  });
  const [initialDiscipline, setInitialDiscipline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const isFormFilled = discipline.name && discipline.name.trim() !== '' && discipline.acronym;

  const hasChanges = isEditMode && initialDiscipline && (
    discipline.acronym !== initialDiscipline.acronym ||
    discipline.name !== initialDiscipline.name
  );

  const handleAlertClose = () => {
    setAlert(null);
  };

  const handleSubmitSuccess = (newDiscipline) => {
    setAlert({
      message: disciplineToEdit ? 'Disciplina atualizada com sucesso!' : 'Disciplina cadastrada com sucesso!',
      type: 'success',
    });
    onClose();
  };

  useEffect(() => {
    if (open) {
      setIsEditMode(!!disciplineToEdit);
      if (disciplineToEdit) {
        const disciplineData = {
          acronym: disciplineToEdit.acronym || '',
          name: disciplineToEdit.name || '',
        };
        setDiscipline(disciplineData);
        setInitialDiscipline(disciplineData);
        setError(null);
      } else {
        setDiscipline({
          acronym: '',
          name: '',
        });
        setInitialDiscipline(null);
        setError(null);
      }
    }
  }, [disciplineToEdit, open]);

  const handleInputChange = (e) => {
    setDiscipline({ ...discipline, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!discipline.acronym || !discipline.name) {
      setError('Os campos nome e sigla são obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        acronym: discipline.acronym,
        name: discipline.name,
      };

      console.log('Payload enviado:', payload);

      let response;
      if (isEditMode) {
        response = await api.put(`/discipline/${disciplineToEdit.id}`, payload);
      } else {
        response = await api.post(`/disciplines`, payload);
      }

      console.log('Resposta da API:', response.data);

      const updatedDiscipline = response.data.discipline || response.data;
      
      onUpdate({ discipline: updatedDiscipline, isEditMode });
      handleSubmitSuccess();
    } catch (err) {
      console.error('Erro completo:', err);
      console.error('Resposta do erro:', err.response?.data);

      let errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.response?.data?.errors?.[0] || 
                        err.message || 
                        `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} disciplina.`;

      if (Array.isArray(err.response?.data?.errors)) {
        errorMessage = err.response.data.errors.join(', ');
      }

      setError(errorMessage);
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
                  padding: { xs: "8px 20px", sm: "8px 28px" },
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
                disabled={isEditMode ? !isFormFilled || !hasChanges || loading : !isFormFilled || loading}
                sx={{
                  width: 'fit-content',
                  minWidth: 100,
                  padding: { xs: "8px 20px", sm: "8px 28px" },
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
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : (
                  <>
                    <Save sx={{ fontSize: 24 }} />
                    {isEditMode ? 'Atualizar' : 'Cadastrar'}
                  </>
                )}
              </Button>
            </DialogActions>
          </form>
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
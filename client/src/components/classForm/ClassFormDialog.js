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
    type: '',
  });
  const [error, setError] = useState(null);

  const isFormFilled = classData.course && classData.semester && classData.year && classData.type;

  const handleInputChange = (e) => {
    setClassData({ ...classData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!classData.course || !classData.semester || !classData.year || !classData.type) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    // Validação do formato do ano (ex.: 2020.1)
    if (!classData.year.match(/^\d{4}\.[1-2]$/)) {
      setError('O ano deve estar no formato AAAA.S, onde S é 1 ou 2 (ex.: 2020.1).');
      return;
    }

    try {
      const payload = {
        course: classData.course,
        semester: classData.semester,
        year: classData.year,
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
      setClassData({
        course: classToEdit.course || '',
        semester: classToEdit.semester || '',
        year: classToEdit.year || '',
        type: classToEdit.type || '',
      });
      setError(null);
    } else {
      setClassData({
        course: '',
        semester: '',
        year: '',
        type: '',
      });
      setError(null);
    }
  }, [classToEdit, open]);

  return (
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
        <form onSubmit={handleSubmit}>
          {error && (
            <Box sx={{ color: 'red', marginBottom: 2, fontSize: '0.875rem' }}>
              {error}
            </Box>
          )}

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
            name="course"
            size="small"
            variant="outlined"
            fullWidth
            label="Curso"
            margin="normal"
            value={classData.course}
            onChange={handleInputChange}
            required
          />

          <Box sx={{ display: 'flex', gap: 2, my: 1.5 }}>
            <FormControl
              fullWidth
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000000 !important',
                  borderWidth: '2px',
                },
              }}
            >
              <InputLabel
                id="semester-label"
                sx={{ '&.Mui-focused, &.MuiInputLabel-shrink': { color: '#000000' } }}
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
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000000 !important',
                  borderWidth: '2px',
                },
              }}
            >
              <InputLabel
                id="year-label"
                sx={{ '&.Mui-focused, &.MuiInputLabel-shrink': { color: '#000000' } }}
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
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = 2020 + i;
                  return [
                    `${year}.1`,
                    `${year}.2`,
                  ];
                }).flat().map((yr) => (
                  <MenuItem key={yr} value={yr}>
                    {yr}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
          </Box>

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
              id="type-label"
              sx={{ '&.Mui-focused, &.MuiInputLabel-shrink': { color: '#000000' } }}
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassFormDialog;
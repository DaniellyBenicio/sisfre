import React, { useState } from 'react';
import {
  Dialog,
  Typography,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
  Box,
  FormControl,
  MenuItem,
  Select,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import api from '../../../service/api';

const validationSchema = yup.object({
  username: yup.string().required('Nome é obrigatório'),
  email: yup
    .string()
    .email('E-mail inválido')
    .matches(/@ifce\.edu\.br$/, 'Use um e-mail institucional (@ifce.edu.br)')
    .required('E-mail é obrigatório'),
  accessType: yup.string().required('Tipo de usuário é obrigatório'),
});

const UserUpdatePopup = ({ open, onClose, user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      accessType: user?.accessType || '',
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.put(`/users/${user.id}`, {
          username: values.username,
          email: values.email,
          accessType: values.accessType,
        });
        onUpdate(response.data.user);
        setSuccessOpen(true);
        onClose();
      } catch (error) {
        const errorMessage =
          error.response?.data?.error || 'Erro ao atualizar usuário';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        sx={{ '& .MuiDialog-paper': { width: 500 } }}
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, height: '480px' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', marginTop: '19px' }}>
          Editar Usuário
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            aria-label="Fechar modal"
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
            <form onSubmit={formik.handleSubmit}>
              {error && <Box sx={{ color: 'red', marginBottom: 2 }}>{error}</Box>}
              <Typography variant="subtitle1" mt="15px" sx={{ color: '#2B2B2B' }}>
                Nome
              </Typography>
              <TextField
                name="username"
                size="small"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                required
                sx={{ mb: 1.5, marginTop: '-1px' }}
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    border: '1px solid #999999',
                    '& input': {
                      color: '#2B2B2B',
                    },
                  },
                }}
              />
              <Typography variant="subtitle1" sx={{ color: '#2B2B2B' }}>
                E-mail
              </Typography>
              <TextField
                name="email"
                size="small"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                required
                sx={{ mb: 1.5, marginTop: '-1px' }}
                InputProps={{
                  sx: {
                    borderRadius: 2,
                    border: '1px solid #999999',
                    '& input': {
                      color: '#2B2B2B',
                    },
                  },
                }}
              />
              <Typography variant="subtitle1" sx={{ color: '#2B2B2B' }}>
                Tipo
              </Typography>
              <FormControl fullWidth margin="normal" size="small" sx={{ mb: 1.5, marginTop: '-1px' }}>
                <Select
                  name="accessType"
                  value={formik.values.accessType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.accessType && Boolean(formik.errors.accessType)}
                  displayEmpty
                  required
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    color: '#2B2B2B',
                    border: '1px solid #999999',
                    '& .MuiSelect-select': {
                      padding: '8px 14px',
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Selecione o tipo</em>
                  </MenuItem>
                  <MenuItem value="professor">Professor</MenuItem>
                  <MenuItem value="coordenador">Coordenador</MenuItem>
                </Select>
                {formik.touched.accessType && formik.errors.accessType && (
                  <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: '4px' }}>
                    {formik.errors.accessType}
                  </Typography>
                )}
              </FormControl>
              <DialogActions
                sx={{
                  justifyContent: 'center',
                  gap: 2,
                  padding: '10px 24px',
                  marginTop: '50px',
                }}
              >
                <Button
                  onClick={onClose}
                  variant="contained"
                  sx={{
                    backgroundColor: '#FF1C1C',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#FF2018',
                    },
                    padding: '6px 30px',
                    borderRadius: 2,
                    textTransform: 'capitalize',
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    padding: '6px 35px',
                    borderRadius: 2,
                    backgroundColor: '#087619',
                    textTransform: 'capitalize',
                  }}
                >
                  Atualizar
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={successOpen}
        onClose={handleSuccessClose}
        maxWidth={false}
        sx={{ '& .MuiDialog-paper': { width: 500 } }}
        fullWidth
      >
        <DialogTitle>Sucesso</DialogTitle>
        <DialogContent>
          <Typography>Usuário atualizado com sucesso!</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSuccessClose}
            variant="contained"
            sx={{
              backgroundColor: '#087619',
              color: '#fff',
              padding: '6px 30px',
              borderRadius: 2,
              textTransform: 'capitalize',
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserUpdatePopup;
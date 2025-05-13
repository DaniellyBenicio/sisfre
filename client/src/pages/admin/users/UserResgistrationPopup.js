import React, { useState, useEffect } from 'react';
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
import api from '../../../service/api';

const UserRegistrationPopup = ({ open, onClose, userToEdit, onRegister }) => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    accessType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setUser({
        username: userToEdit.username || '',
        email: userToEdit.email || '',
        accessType: userToEdit.accessType || '',
      });
    } else {
      setUser({
        username: '',
        email: '',
        accessType: '',
      });
    }
  }, [userToEdit, open]);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user.username || !user.email || !user.accessType) {
      setError('Os campos nome, e-mail e tipo são obrigatórios.');
      setLoading(false);
      return;
    }

    if (!user.email.endsWith('@ifce.edu.br')) {
      setError('Use um e-mail institucional (@ifce.edu.br).');
      setLoading(false);
      return;
    }

    if (!['professor', 'coordenador'].includes(user.accessType)) {
      setError("O tipo de usuário deve ser 'Professor' ou 'Coordenador'.");
      setLoading(false);
      return;
    }

    try {
      let response;
      const payload = {
        username: user.username,
        email: user.email,
        accessType: user.accessType,
      };

      if (userToEdit) {
        response = await api.put(`/users/${userToEdit.id}`, payload);
      } else {
        response = await api.post(`/users`, payload);
      }

      const newUser = {
        id: response.data.id || response.data.user?.id || Date.now().toString(),
        username: user.username,
        email: user.email,
        accessType: user.accessType,
      };
      onRegister(newUser);
      setSuccessOpen(true);
      onClose();
    } catch (err) {
      console.error('Erro completo:', err.response);
      const errorMessage = err.response?.data?.error || 'Erro ao salvar usuário: ' + err.message;
      if (errorMessage.includes('E-mail já cadastrado')) {
        setError('Este e-mail já está cadastrado. Use um e-mail diferente.');
      } else if (errorMessage.includes('Apenas e-mails institucionais')) {
        setError('Use um e-mail institucional (@ifce.edu.br).');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    onClose();
    setSuccessOpen(false);
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
          {userToEdit ? 'Edição de Usuário' : 'Cadastro de Usuário'}
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
              <Typography variant="subtitle1" mt="15px" sx={{ color: '#2B2B2B' }}>
                Nome
              </Typography>
              <TextField
                name="username"
                size="small"
                variant="outlined"
                fullWidth
                margin="normal"
                value={user.username}
                onChange={handleInputChange}
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
                value={user.email}
                onChange={handleInputChange}
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
                  value={user.accessType}
                  onChange={handleInputChange}
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
              </FormControl>
              <DialogActions
                sx={{
                  justifyContent: 'center',
                  gap: 2,
                  padding: '10px 24px',
                  marginTop: '50px', // Aumentado para descer os botões
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
                  {userToEdit ? 'Salvar' : 'Cadastrar'}
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={successOpen} onClose={handleSuccessClose}>
        <DialogTitle>Sucesso</DialogTitle>
        <DialogContent>
          <Typography>
            Usuário {userToEdit ? 'atualizado' : 'cadastrado'} com sucesso!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessClose} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserRegistrationPopup;
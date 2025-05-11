import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../../service/api';

const UserUpdatePopup = ({ open, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    accessType: '',
  });

  // Preencher o formulário com os dados do usuário
  useEffect(() => {
    if (user) {
      // Criar placeholder com asteriscos baseado no passwordLength
      const passwordPlaceholder = user.passwordLength
        ? '*'.repeat(user.passwordLength)
        : '********';
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: passwordPlaceholder,
        accessType: user.accessType || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Criar objeto apenas com os campos editáveis preenchidos
    const updatedData = {};
    if (formData.username) updatedData.username = formData.username;
    if (formData.email) updatedData.email = formData.email;
    if (formData.accessType) updatedData.accessType = formData.accessType;
    // Senha não é incluída, pois não é editável

    try {
      const response = await api.put(`/users/${user.id}`, updatedData);
      toast.success('Usuário atualizado com sucesso!');
      onUpdate(response.data.user);
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar usuário';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar Usuário</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nome de Usuário"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="E-mail"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Senha"
            name="password"
            type="password"
            value={formData.password}
            disabled
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Acesso</InputLabel>
            <Select
              name="accessType"
              value={formData.accessType}
              onChange={handleChange}
              required
            >
              <MenuItem value="professor">Professor</MenuItem>
              <MenuItem value="diretor">Diretor</MenuItem>
              <MenuItem value="coordenador">Coordenador</MenuItem>
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          variant="contained"
          sx={{ backgroundColor: '#087619', '&:hover': { backgroundColor: '#056012' } }}
        >
          Atualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserUpdatePopup;
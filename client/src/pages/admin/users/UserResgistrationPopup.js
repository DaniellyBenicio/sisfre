import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  DialogActions,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as yup from 'yup';
import api from "../../../service/api";

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#ced4da', // Cor da borda padrão
    },
    '&:hover fieldset': {
      borderColor: '#087619', // Cor da borda no hover
    },
    '&.Mui-focused fieldset': {
      borderColor: '#087619', // Cor da borda quando focado
      boxShadow: '0 0 0 0.2rem rgba(8, 118, 25, 0.25)', // Sombra de foco verde
    },
  },
});

// Estilizando o Select
const StyledSelect = styled(Select)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#ced4da',
    },
    '&:hover fieldset': {
      borderColor: '#087619',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#087619',
      boxShadow: '0 0 0 0.2rem rgba(8, 118, 25, 0.25)',
    },
  },
});

// Esquema de validação usando Yup
const validationSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  email: yup
    .string()
    .email('E-mail inválido')
    .required('E-mail é obrigatório'),
  senha: yup
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .required('Senha é obrigatória'),
  confirmarSenha: yup
    .string()
    .oneOf([yup.ref('senha'), null], 'Senhas devem corresponder')
    .required('Confirmação de senha é obrigatória'),
  tipo: yup.string().required('Tipo de usuário é obrigatório'),
});

const UserRegistrationPopup = ({ open, onClose, onRegister }) => {
  // Configurando o Formik para lidar com o formulário
  const formik = useFormik({
    initialValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      tipo: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => { 
      try {
        
        const response = await api.post('/users', { 
          username: values.nome, 
          email: values.email,
          password: values.senha, 
          accessType: values.tipo,
          
        });
        console.log(response);

       
        if (response.status === 201) {
          onRegister(response.data.user);
          onClose();
          formik.resetForm();
        } else {
         
          console.error('Erro ao cadastrar usuário:', response.data);
          alert('Erro ao cadastrar usuário. Por favor, tente novamente.'); // Alerta simples para feedback
        }
      } catch (error) {
        // Captura erros de rede ou erros específicos do backend
        console.error('Erro ao cadastrar usuário:', error);
        alert('Erro ao cadastrar usuário. Verifique sua conexão e tente novamente.'); // Alerta para erros de conexão
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          backgroundColor: '#087619', 
          color: 'white',
          padding: '16px',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          textAlign: 'center',
        }}
      >
        Cadastro de Usuário
      </DialogTitle>
      <DialogContent sx={{ padding: '20px' }}>
        <form onSubmit={formik.handleSubmit}>
          <StyledTextField
            fullWidth
            id="nome"
            name="nome"
            label="Nome"
            value={formik.values.nome}
            onChange={formik.handleChange}
            error={formik.touched.nome && Boolean(formik.errors.nome)}
            helperText={formik.touched.nome && formik.errors.nome}
            margin="normal"
            variant="outlined"
            size="small"
          />
          <StyledTextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            margin="normal"
            variant="outlined"
            size="small"
          />
          <StyledTextField
            fullWidth
            id="senha"
            name="senha"
            label="Senha"
            type="password"
            value={formik.values.senha}
            onChange={formik.handleChange}
            error={formik.touched.senha && Boolean(formik.errors.senha)}
            helperText={formik.touched.senha && formik.errors.senha}
            margin="normal"
            variant="outlined"
            size="small"
          />
          <StyledTextField
            fullWidth
            id="confirmarSenha"
            name="confirmarSenha"
            label="Confirmar Senha"
            type="password"
            value={formik.values.confirmarSenha}
            onChange={formik.handleChange}
            error={
              formik.touched.confirmarSenha &&
              Boolean(formik.errors.confirmarSenha)
            }
            helperText={
              formik.touched.confirmarSenha && formik.errors.confirmarSenha
            }
            margin="normal"
            variant="outlined"
            size="small"
          />
          <StyledSelect
            fullWidth
            id="tipo"
            name="tipo"
            label="Tipo"
            value={formik.values.tipo}
            onChange={formik.handleChange}
            error={formik.touched.tipo && Boolean(formik.errors.tipo)}
            helperText={formik.touched.tipo && formik.errors.tipo}
            margin="normal"
            variant="outlined"
            size="small"
          >
            <MenuItem value="professor">Professor</MenuItem>
            <MenuItem value="coordenador">Coordenador</MenuItem>
            <MenuItem value="diretor">Diretor</MenuItem>
          </StyledSelect>
        </form>
      </DialogContent>
      <DialogActions sx={{ padding: '20px' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: '#FF1C1C', // Cor vermelha para Cancelar
            borderColor: '#FF1C1C',
            '&:hover': {
              backgroundColor: 'rgba(255, 28, 28, 0.1)', // Efeito hover vermelho
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={formik.handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: '#087619', // Cor verde para Salvar
            color: 'white',
            '&:hover': {
              backgroundColor: '#056012', // Tom mais escuro de verde no hover
            },
          }}
          type="submit"
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserRegistrationPopup;

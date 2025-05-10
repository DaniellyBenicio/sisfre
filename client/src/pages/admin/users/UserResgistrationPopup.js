import React from 'react';
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
        console.log('Enviando requisição para /users com dados:', values);
        console.log('Configuração da API:', api.defaults); // Loga a configuração do axios
        const response = await api.post('/users', { 
          username: values.nome, 
          email: values.email,
          password: values.senha, 
          accessType: values.tipo,
        });
        console.log('Resposta da API:', response);

        if (response.status === 201) {
          const newUser = {
            id: response.data.user.id || Date.now().toString(),
            username: values.nome,
            email: values.email,
            accessType: values.tipo,
          };
          onRegister(newUser);
          onClose();
          formik.resetForm();
        } else {
          console.error('Resposta inesperada da API:', response.data);
          alert('Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
        }
      } catch (error) {
        console.error('Erro ao cadastrar usuário:', error.message);
        if (error.response) {
          console.error('Status do erro:', error.response.status);
          console.error('Detalhes do erro da API:', error.response.data);
          alert(`Erro ao cadastrar usuário: ${error.response.data.message || 'Verifique sua conexão e tente novamente.'}`);
        } else if (error.request) {
          console.error('Sem resposta do servidor:', error.request);
          alert('Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.');
        } else {
          console.error('Erro na configuração da requisição:', error.message);
          alert('Erro inesperado. Tente novamente.');
        }
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
            color: '#FF1C1C',
            borderColor: '#FF1C1C',
            '&:hover': {
              backgroundColor: 'rgba(255, 28, 28, 0.1)',
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={formik.handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: '#087619',
            color: 'white',
            '&:hover': {
              backgroundColor: '#056012',
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
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
  InputLabel,
  FormHelperText,
  Fade,
} from '@mui/material';
import { Close, Save as SaveIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { styled } from '@mui/material/styles';
import api from '../../service/api';

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

const StyledSelect = styled(Select)(({ theme }) => ({
  height: '50px',
  fontSize: '0.875rem',
  '& .MuiSelect-select': {
    padding: '8px 14px',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#000000',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#000000 !important',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    transform: 'translate(14px, 10px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -6px) scale(0.75)',
      fontWeight: 'bold',
      color: '#000000',
    },
    '&.Mui-focused': {
      color: '#000000',
    },
  },
}));

const StyledTextField = styled(TextField)({
  '& .MuiInputLabel-root': {
    color: 'text.secondary',
    fontSize: { xs: '0.9rem', md: '1rem' },
    transition: 'color 0.3s ease, transform 0.3s ease',
  },
  '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.MuiInputLabel-shrink': {
    color: '#000000',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: 'transparent',
    '& input': {
      backgroundColor: 'transparent !important',
      WebkitBoxShadow: '0 0 0 1000px transparent inset',
      WebkitTextFillColor: '#000',
      transition: 'background-color 5000s ease-in-out 0s',
    },
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#000000',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#000000',
      borderWidth: '2px',
    },
  },
});

const validationSchema = yup.object({
  username: yup.string().required('Nome é obrigatório'),
  email: yup
    .string()
    .email('E-mail inválido')
    .matches(/@ifce\.edu\.br$/, 'Use um e-mail institucional (@ifce.edu.br)')
    .required('E-mail é obrigatório'),
  accessType: yup
    .string()
    .oneOf(['professor', 'coordenador'], "O tipo de usuário deve ser 'Professor' ou 'Coordenador'")
    .required('Tipo de usuário é obrigatório'),
});

const formatName = (name) => {
  if (!name) return '';
  return name
    .trim()
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

const generateCode = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  let code = '';
  
  if (parts.length > 1) {
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    code = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  } else {
    const firstName = parts[0];
    code = firstName.length >= 2 ? firstName.substring(0, 2).toUpperCase() : firstName.toUpperCase();
  }
  
  return code;
};

const UserFormDialog = ({ open, onClose, userToEdit, onSubmitSuccess, isEditMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const normalizedUser = {
    username: userToEdit?.username || '',
    email: userToEdit?.email || '',
    accessType: userToEdit?.accessType ? userToEdit.accessType.toLowerCase() : '',
  };

  const formik = useFormik({
    initialValues: normalizedUser,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);

      try {
        const formattedUsername = formatName(values.username);
        const generatedCode = generateCode(formattedUsername);
        const payload = {
          username: formattedUsername,
          email: values.email,
          accessType: values.accessType.toLowerCase(),
        };

        console.log('UserFormDialog - Payload enviado:', payload);

        let response;
        if (isEditMode) {
          response = await api.put(`/users/${userToEdit?.id}`, payload);
        } else {
          response = await api.post(`/users`, payload);
        }

        console.log('UserFormDialog - Resposta da API:', response.data);

        const newUser = response.data.user;

        console.log('UserFormDialog - newUser:', newUser);

        onSubmitSuccess(newUser);
        onClose();
      } catch (err) {
        const errorMessage =
          err.response?.data?.error || `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} usuário: ${err.message}`;
        setError(
          errorMessage.includes('E-mail já cadastrado')
            ? 'Este e-mail já está cadastrado. Use um e-mail diferente.'
            : errorMessage.includes('Apenas e-mails institucionais')
            ? 'Use um e-mail institucional (@ifce.edu.br).'
            : errorMessage
        );
        console.error('UserFormDialog - Erro:', err);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    console.log('UserFormDialog - Estado open:', open);
    if (!open) {
      setLoading(false);
      setError(null);
      setFocusedField(null);
    }
  }, [open]);

  const handleDialogClose = () => {
    console.log('UserFormDialog - Fechando diálogo');
    formik.resetForm();
    onClose();
  };

  const isAnyFieldFilled = formik.values.username || formik.values.email || formik.values.accessType;

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      disablePortal
      autoFocus={false}
      fullWidth={false}
      TransitionComponent={Fade}
      TransitionProps={{
        onExited: () => {
          console.log('UserFormDialog - Transição de saída concluída');
          setLoading(false);
          setError(null);
          formik.resetForm();
          setFocusedField(null);
        },
      }}
      PaperProps={{ sx: { width: 480, borderRadius: '8px' } }}
    >
      <DialogTitle sx={{ padding: '15px 24px' }}>
        <Typography
          variant='h6'
          sx={{ textAlign: 'center', color: '#087619' }}
        >
          {isEditMode ? 'Editar Usuário' : 'Cadastrar Usuário'}
        </Typography>
        <IconButton
          onClick={handleDialogClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          aria-label='Fechar modal'
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ padding: '15px' }}>
        {loading ? (
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            {error && (
              <Typography color='error' sx={{ mb: 1, fontSize: '0.875rem' }}>
                {error}
              </Typography>
            )}
            <StyledTextField
              fullWidth
              margin='normal'
              sx={{ my: 1.5 }}
              label='Nome'
              name='username'
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onFocus={() => setFocusedField('username')}
              error={formik.submitCount > 0 && formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.submitCount > 0 && formik.touched.username && formik.errors.username}
              InputLabelProps={{ required: false }}
              variant='outlined'
            />
            <StyledTextField
              fullWidth
              margin='normal'
              sx={{ my: 1.5 }}
              label='E-mail'
              name='email'
              type='email'
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onFocus={() => setFocusedField('email')}
              error={formik.submitCount > 0 && formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.submitCount > 0 && formik.touched.email && formik.errors.email}
              InputLabelProps={{ required: false }}
              variant='outlined'
            />
            <FormControl
              fullWidth
              margin='normal'
              sx={{
                my: 1.5,
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000000 !important',
                  borderWidth: '2px',
                },
              }}
              error={formik.submitCount > 0 && formik.touched.accessType && Boolean(formik.errors.accessType)}
              variant='outlined'
            >
              <InputLabel
                id='accessType-label'
                sx={{ '&.Mui-focused, &.MuiInputLabel-shrink': { color: '#000000' } }}
              >
                Tipo de Usuário
              </InputLabel>
              <StyledSelect
                labelId='accessType-label'
                name='accessType'
                value={formik.values.accessType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={() => {
                  console.log('Select focado: Tipo de Usuário');
                  setFocusedField('accessType');
                }}
                label='Tipo de Usuário'
                required
              >
                <MenuItem value=''>
                  <em>Selecione o tipo</em>
                </MenuItem>
                <MenuItem value='professor'>Professor</MenuItem>
                <MenuItem value='coordenador'>Coordenador</MenuItem>
              </StyledSelect>
              {formik.submitCount > 0 && formik.touched.accessType && formik.errors.accessType && (
                <FormHelperText>{formik.errors.accessType}</FormHelperText>
              )}
            </FormControl>
          </form>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: 'center',
          padding: '15px 24px',
          gap: 3,
        }}
      >
        <StyledButton
          onClick={handleDialogClose}
          color='error'
          variant='contained'
          disabled={loading}
        >
          <Close sx={{ fontSize: 20 }} />
          Cancelar
        </StyledButton>
        <StyledButton
          onClick={formik.handleSubmit}
          variant='contained'
          disabled={loading || !isAnyFieldFilled}
          sx={{
            bgcolor: loading || !isAnyFieldFilled ? '#E0E0E0' : INSTITUTIONAL_COLOR,
          }}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <SaveIcon sx={{ fontSize: 20 }} />
              {isEditMode ? 'Atualizar' : 'Cadastrar'}
            </>
          )}
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;
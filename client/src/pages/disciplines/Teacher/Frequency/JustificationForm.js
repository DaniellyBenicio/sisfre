import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  CssBaseline,
} from '@mui/material';
import { ArrowBack, Close, Save } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import SideBar from '../../../../components/SideBar';
import { CustomAlert } from '../../../../components/alert/CustomAlert';
import api from '../../../../service/api';

const INSTITUTIONAL_COLOR = '#307c34';

const StyledButton = styled(Button)(() => ({
  borderRadius: '8px',
  padding: '8px 28px',
  textTransform: 'none',
  fontWeight: 'bold',
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: 'fit-content',
  minWidth: 100,
  '@media (max-width: 600px)': {
    fontSize: '0.7rem',
    padding: '4px 8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px',
  },
}));

// Estilos reutilizáveis para o campo TextField
const inputStyles = {
  "& .MuiInputBase-root": {
    height: { xs: 40, sm: 56 }, // Altura ajustada para responsividade
    minHeight: '150px', // Garantir altura mínima para 6 linhas
    "& .MuiOutlinedInput-input": {
      padding: '12px', // Ajuste de padding interno para melhor visualização
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0, 0, 0, 0.23)", // Borda padrão
    borderWidth: "1px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000", // Borda preta ao passar o mouse
    borderWidth: "1px",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000", // Borda preta quando focado
    borderWidth: "1px",
  },
  "& .MuiInputLabel-root": {
    transform: "translate(14px, 7px) scale(1)", // Posição inicial do label
    color: "rgba(0, 0, 0, 0.6)", // Cor padrão do label
    "@media (max-width: 600px)": {
      fontSize: "0.875rem", // Tamanho da fonte em telas menores
    },
  },
  "& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-shrink": {
    transform: "translate(14px, -9px) scale(0.75)", // Label "flutuando" quando focado ou preenchido
    color: "#000000", // Label preto quando focado ou preenchido
  },
};

const JustificationForm = ({ setAuthenticated }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const frequencyItem = state?.frequencyItem || {};
  const [justification, setJustification] = useState(''); // Estado inicial vazio
  const [alert, setAlert] = useState(null);

  console.log('JustificationForm state:', state);
  console.log('FrequencyItem:', frequencyItem);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/frequency/${frequencyItem.id}`, {
        justification,
        isAbsence: true,
      });
      setAlert({ message: response.data.message || "Justificativa enviada com sucesso!", type: "success" });
      setTimeout(() => navigate('/frequency'), 2000);
    } catch (error) {
      console.error("Erro ao enviar justificativa:", error);
      setAlert({
        message: error.response?.data?.error || "Erro ao enviar justificativa.",
        type: "error",
      });
    }
  };

  const handleGoBack = () => {
    navigate('/frequency');
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated || (() => {})} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
          backgroundColor: '#f5f5f5',
          py: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '1000px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            mb: 3,
            mt: 2,
          }}
        >
          <IconButton
            onClick={handleGoBack}
            sx={{
              position: 'absolute',
              left: 0,
              color: INSTITUTIONAL_COLOR,
              top: '50%',
              transform: 'translateY(-50%)',
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            <ArrowBack sx={{ fontSize: 35 }} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
            Justificar Falta
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, mt: 2, width: '100%', maxWidth: '1000px' }}>
          <Stack spacing={3}>
            <Typography>
              <strong>Data:</strong> {frequencyItem.displayDate || 'N/A'}
            </Typography>
            <Typography>
              <strong>Turma:</strong> {frequencyItem.class || 'N/A'}
            </Typography>
            <Typography>
              <strong>Disciplina:</strong> {frequencyItem.discipline || 'N/A'}
            </Typography>
            <Typography>
              <strong>Horário:</strong> {frequencyItem.time || 'N/A'}
            </Typography>
            <TextField
              label="Justificativa"
              multiline
              rows={6} // Mantido com 6 linhas
              defaultValue="Justificativa para a falta" // Texto inicial dentro do campo
              value={justification} // Estado controlado para capturar edições
              onChange={(e) => setJustification(e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={inputStyles} // Aplicar estilos para label flutuante e borda preta
            />
          </Stack>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Stack direction="row" spacing={2}>
            <StyledButton
              onClick={handleGoBack}
              variant="contained"
              sx={{
                backgroundColor: '#F01424',
                '&:hover': { backgroundColor: '#D4000F' },
              }}
            >
              <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Cancelar
            </StyledButton>
            <StyledButton
              onClick={handleSubmit}
              variant="contained"
              disabled={!justification.trim()} // Desabilitar apenas se estiver vazio
              sx={{
                backgroundColor: INSTITUTIONAL_COLOR,
                '&:hover': { backgroundColor: '#26692b' },
              }}
            >
              <Save sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Enviar Justificativa
            </StyledButton>
          </Stack>
        </Box>

        {alert && (
          <CustomAlert
            message={alert.message}
            type={alert.type}
            onClose={handleAlertClose}
          />
        )}
      </Box>
    </Box>
  );
};

export default JustificationForm;
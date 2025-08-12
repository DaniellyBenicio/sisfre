import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  IconButton,
  CssBaseline,
} from '@mui/material';
import { ArrowBack, Close, Save } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import SideBar from '../../../../components/SideBar';
import { CustomAlert } from '../../../../components/alert/CustomAlert';
import api from '../../../../service/api';

const INSTITUTIONAL_COLOR = '#307c34';

// Botão estilizado com tamanhos mais responsivos
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: theme.spacing(0.8, 1.5), // Ainda mais compacto em mobile
  textTransform: 'none',
  fontWeight: 'bold',
  fontSize: theme.typography.pxToRem(12), // Fonte reduzida
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  width: 'fit-content',
  minWidth: '80px', // Tamanho mínimo reduzido
  [theme.breakpoints.down('xs')]: {
    fontSize: theme.typography.pxToRem(10),
    padding: theme.spacing(0.5, 1),
    minWidth: '70px',
  },
}));

// Estilos reutilizáveis para o TextField
const inputStyles = {
  width: '100%', // Garante que o TextField não transborde
  "& .MuiInputBase-root": {
    height: { xs: 'auto', sm: 48 }, // Auto para multilinha
    minHeight: { xs: '100px', sm: '120px' }, // Altura reduzida
    "& .MuiOutlinedInput-input": {
      padding: { xs: '6px', sm: '8px' }, // Padding menor
      fontSize: { xs: '0.75rem', sm: '0.85rem' }, // Fonte ajustada
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0, 0, 0, 0.23)",
    borderWidth: "1px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000",
    borderWidth: "1px",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000",
    borderWidth: "1px",
  },
  "& .MuiInputLabel-root": {
    transform: "translate(10px, 6px) scale(1)", // Ajuste de posição
    fontSize: { xs: '0.75rem', sm: '0.85rem' }, // Fonte menor
    color: "rgba(0, 0, 0, 0.6)",
  },
  "& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-shrink": {
    transform: "translate(10px, -8px) scale(0.7)",
    color: "#000000",
  },
};

const JustificationForm = ({ setAuthenticated }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const frequencyItem = state?.frequencyItem || {};
  const [justification, setJustification] = useState('');
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
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        overflowX: 'hidden', // Evita rolagem horizontal
        width: '100%',
      }}
    >
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated || (() => {})} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 }, // Padding reduzido
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
          overflowX: 'hidden', // Evita rolagem horizontal
          backgroundColor: '#f5f5f5',
          width: '100%', // Garante que ocupe a largura disponível
          boxSizing: 'border-box', // Inclui padding na largura
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: '700px', md: '900px' }, // Reduzido para evitar transbordo
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            mb: { xs: 1.5, sm: 2 },
            mt: { xs: 1, sm: 1.5 },
            px: { xs: 1, sm: 0 }, // Margem lateral em mobile
          }}
        >
          <IconButton
            onClick={handleGoBack}
            sx={{
              position: 'absolute',
              left: { xs: 4, sm: 0 }, // Ajustado para mobile
              color: INSTITUTIONAL_COLOR,
              top: '50%',
              transform: 'translateY(-50%)',
              '&:hover': { backgroundColor: 'transparent' },
              p: { xs: 0.5, sm: 1 },
            }}
          >
            <ArrowBack sx={{ fontSize: { xs: 20, sm: 24, md: 30 } }} />
          </IconButton>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              flexGrow: 1,
              fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.3rem' }, // Tamanho ainda menor
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              width: '100%',
              maxWidth: { xs: 'calc(100% - 60px)', sm: 'calc(100% - 80px)' }, // Espaço para o ícone
              px: { xs: 4, sm: 5 }, // Espaço para o ícone de voltar
              lineHeight: 1.2,
            }}
          >
            Justificar Falta
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 }, // Padding reduzido
            mt: 1.5,
            width: '100%',
            maxWidth: { xs: '100%', sm: '700px', md: '900px' },
            boxShadow: { xs: '0 1px 3px rgba(0, 0, 0, 0.1)', sm: '0 2px 4px rgba(0, 0, 0, 0.1)' },
            boxSizing: 'border-box',
          }}
        >
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' } }}>
              <strong>Data:</strong> {frequencyItem.displayDate || 'N/A'}
            </Typography>
            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' } }}>
              <strong>Turma:</strong> {frequencyItem.class || 'N/A'}
            </Typography>
            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' } }}>
              <strong>Disciplina:</strong> {frequencyItem.discipline || 'N/A'}
            </Typography>
            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' } }}>
              <strong>Horário:</strong> {frequencyItem.time || 'N/A'}
            </Typography>
            <TextField
              label="Justificativa"
              multiline
              rows={5} // Reduzido para economizar espaço
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={inputStyles}
              placeholder="Digite a justificativa para a falta"
            />
          </Stack>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: { xs: 1.5, sm: 2 },
            width: '100%',
            maxWidth: { xs: '100%', sm: '700px', md: '900px' },
          }}
        >
          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }}>
            <StyledButton
              onClick={handleGoBack}
              variant="contained"
              sx={{
                backgroundColor: '#F01424',
                '&:hover': { backgroundColor: '#D4000F' },
              }}
            >
              <Close sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
              Cancelar
            </StyledButton>
            <StyledButton
              onClick={handleSubmit}
              variant="contained"
              disabled={!justification.trim()}
              sx={{
                backgroundColor: INSTITUTIONAL_COLOR,
                '&:hover': { backgroundColor: '#26692b' },
              }}
            >
              <Save sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
              Enviar Justificativa
            </StyledButton>
          </Stack>
        </Box>

        {alert && (
          <CustomAlert
            message={alert.message}
            type={alert.type}
            onClose={handleAlertClose}
            sx={{
              width: { xs: '90%', sm: '80%', md: '700px' }, // Ajuste para alertas
              mx: 'auto',
              mt: 1,
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default JustificationForm;
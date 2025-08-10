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
  FormControlLabel,
  Checkbox,
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

const JustificationForm = ({ setAuthenticated }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const frequencyItem = state?.frequencyItem || {};
  const [justification, setJustification] = useState('');
  const [useCredit, setUseCredit] = useState(false);
  const [alert, setAlert] = useState(null);

  console.log('JustificationForm state:', state);
  console.log('FrequencyItem:', frequencyItem);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (useCredit) {
        const now = new Date();
        const response = await api.post("/frequency/absence-credit", {
          userId: "1", // Substituir por userId real do contexto de autenticação
          courseId: frequencyItem.courseId,
          disciplineId: frequencyItem.disciplineId,
          date: now.toISOString().split("T")[0],
          time: now.toTimeString().split(" ")[0],
          useCredit: true,
        });
        setAlert({ message: response.data.message, type: "success" });
      } else {
        const response = await api.put(`/frequency/${frequencyItem.id}`, {
          justification,
          isAbsence: true,
        });
        setAlert({ message: response.data.message, type: "success" });
      }
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={useCredit}
                  onChange={(e) => setUseCredit(e.target.checked)}
                  color="primary"
                />
              }
              label="Usar crédito para justificar falta"
            />
            {!useCredit && (
              <TextField
                label="Justificativa"
                multiline
                rows={4}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                fullWidth
                required
                variant="outlined"
                placeholder="Digite a justificativa para a falta"
              />
            )}
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
              disabled={!useCredit && !justification.trim()}
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
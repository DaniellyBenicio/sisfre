import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CssBaseline,
  CircularProgress, // Added for a better loading state UI
} from '@mui/material';
import { ArrowBack, CloudUpload, Close, Save } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { CustomAlert } from '../../../../components/alert/CustomAlert';
import SideBar from '../../../../components/SideBar';
import api from '../../../../service/api';

const INSTITUTIONAL_COLOR = '#307c34';

const StyledButton = styled(Button)(() => ({
  textTransform: 'none',
  fontWeight: 'bold',
}));

const ClassReplacementRegister = ({ setAlert }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestType = 'reposicao', setAuthenticated } = location.state || {};

  const [professor, setProfessor] = useState(localStorage.getItem('username') || '');
  const [course, setCourse] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [hour, setHour] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [observation, setObservation] = useState('');
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setLocalAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state to prevent multiple submissions

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await api.get('/professor/request');
        setScheduleDetails(response.data.scheduleDetails || []);
      } catch (error) {
        console.error('Erro ao carregar grade do professor:', error);
        (setAlert || setLocalAlert)({
          message: 'Erro ao carregar grade do professor.',
          type: 'error',
        });
        setScheduleDetails([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [setAlert]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleScheduleChange = (event) => {
    const selected = scheduleDetails.find((sd) => sd.id === event.target.value);
    if (selected) {
      setCourse(selected.schedule.course.name);
      setDiscipline(selected.discipline.name);
      setHour(`${selected.hour.hourStart} - ${selected.hour.hourEnd}`);
    } else {
      setCourse('');
      setDiscipline('');
      setHour('');
    }
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    if (!course || !discipline || !hour || !quantity || !date || !file) {
      (setAlert || setLocalAlert)({
        message: 'Preencha todos os campos obrigatórios e anexe um arquivo.',
        type: 'error',
      });
      return;
    }
    if (parseInt(quantity) > 4 || parseInt(quantity) < 1) {
      (setAlert || setLocalAlert)({
        message: 'Quantidade deve ser entre 1 e 4.',
        type: 'error',
      });
      return;
    }
    const selectedDate = new Date(date).setHours(0, 0, 0, 0);
    if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
      (setAlert || setLocalAlert)({
        message: 'Data não pode ser anterior à atual.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true); // Set submitting state to true

    const formData = new FormData();
    formData.append('userId', localStorage.getItem('userId'));
    formData.append('course', course);
    formData.append('discipline', discipline);
    formData.append('hour', hour);
    formData.append('type', 'reposicao');
    formData.append('quantity', parseInt(quantity));
    formData.append('date', date);
    formData.append('annex', file);
    formData.append('observation', observation);

    try {
      await api.post('/request', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      (setAlert || setLocalAlert)({
        message: 'Reposição cadastrada com sucesso!',
        type: 'success',
      });
      navigate('/class-reposition', { state: { requestType } });
    } catch (error) {
      (setAlert || setLocalAlert)({
        message: error.response?.data?.error || 'Erro ao cadastrar.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  const handleGoBack = () => {
    navigate('/class-reposition', { state: { requestType } });
  };

  const handleAlertClose = () => {
    setLocalAlert(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      <SideBar setAuthenticated={setAuthenticated || (() => {})} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto', // Changed to 'auto' to allow scrolling
          backgroundColor: '#f5f5f5',
        }}
      >
        {/* Alert component, if any */}
        {alert && (
          <CustomAlert
            message={alert.message}
            type={alert.type}
            onClose={handleAlertClose}
          />
        )}
        
        {/* Header section with back button */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          mb: 2,
          width: '100%',
          maxWidth: '1200px'
        }}>
          {/* Back button */}
          <IconButton
            onClick={handleGoBack}
            sx={{ position: 'absolute', left: 0, color: INSTITUTIONAL_COLOR }}
          >
            <ArrowBack sx={{ fontSize: 30 }} />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
            Cadastrar Reposição
          </Typography>
        </Box>

        <Paper elevation={2} sx={{ p: 2, mt: 1, width: '100%', maxWidth: '1200px' }}>
          <Box component="form">
            <Box sx={{ display: 'flex', gap: 2, my: 1.5, alignItems: 'center' }}>
              <TextField
                label="Professor"
                value={professor}
                fullWidth
                disabled
                variant="outlined"
              />
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Selecionar da Grade</InputLabel>
                <Select
                  value={scheduleDetails.find((sd) => sd.schedule.course.name === course && sd.discipline.name === discipline)?.id || ''}
                  onChange={handleScheduleChange}
                  label="Selecionar da Grade"
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {scheduleDetails.map((sd) => (
                    <MenuItem key={sd.id} value={sd.id}>
                      {sd.schedule.course.name} - {sd.discipline.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, my: 1.5, alignItems: 'center' }}>
              <TextField
                label="Turma"
                value={course}
                fullWidth
                disabled
                variant="outlined"
              />
              <TextField
                label="Disciplina"
                value={discipline}
                fullWidth
                disabled
                variant="outlined"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, my: 1.5, alignItems: 'center' }}>
              <TextField
                label="Horário"
                value={hour}
                fullWidth
                disabled
                variant="outlined"
              />
              <TextField
                label="Quantidade"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
                required
                variant="outlined"
                inputProps={{ min: 1, max: 4 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, my: 1.5, alignItems: 'center' }}>
              <TextField
                label="Data"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <Box sx={{ width: '100%' }}>
                <TextField
                  label="Anexar Ficha"
                  value={file ? file.name : ''}
                  fullWidth
                  readOnly
                  onClick={() => document.querySelector('input[type="file"]').click()}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CloudUpload sx={{ color: '#087619' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <input type="file" hidden onChange={handleFileChange} />
              </Box>
            </Box>
            <Box sx={{ my: 1.5 }}>
              <TextField
                label="Observação"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
              />
            </Box>
          </Box>
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, mt: 2 }}>
          <Stack direction="row" spacing={2}>
            <StyledButton
              onClick={handleGoBack}
              variant="contained"
              sx={{ backgroundColor: '#F01424', '&:hover': { backgroundColor: '#D4000F' } }}
            >
              <Close sx={{ fontSize: 20 }} />
              Cancelar
            </StyledButton>
            <StyledButton
              onClick={handleSubmit}
              variant="contained"
              sx={{ backgroundColor: INSTITUTIONAL_COLOR, '&:hover': { backgroundColor: '#26692b' } }}
              disabled={isSubmitting} // Disable button while submitting
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <>
                  <Save sx={{ fontSize: 20 }} />
                  Cadastrar
                </>
              )}
            </StyledButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default ClassReplacementRegister;
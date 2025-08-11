
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Stack, InputAdornment, IconButton, CssBaseline, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Close, Save, CloudUpload, ArrowBack } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import SideBar from '../../../../components/SideBar';
import api from '../../../../service/api';
import { jwtDecode } from 'jwt-decode';
import { CustomAlert } from '../../../../components/alert/CustomAlert';

const INSTITUTIONAL_COLOR = "#307c34";

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

const ClassReplacementRegister = ({ setAlert }) => {
  const professor = localStorage.getItem('username') || '';
  const [course, setCourse] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [turn, setTurn] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [observation, setObservation] = useState('');
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [selectedClassLabel, setSelectedClassLabel] = useState('');
  const [localAlert, setLocalAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get('/professor/request');
        const details = response.data.scheduleDetails || [];
        const validatedDetails = details.filter(
          (sd) => sd.course && sd.discipline && sd.turn && sd.acronym && sd.semester
        );
        setScheduleDetails(validatedDetails);
        if (validatedDetails.length === 0) {
          (setAlert || setLocalAlert)({ message: 'Nenhuma grade válida encontrada.', type: 'error' });
        }
      } catch (error) {
        (setAlert || setLocalAlert)({ message: 'Erro ao carregar grade do professor.', type: 'error' });
        setScheduleDetails([]);
      }
    };
    fetchSchedule();
  }, [setAlert]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleScheduleChange = (event) => {
    const selectedValue = event.target.value;
    const selected = scheduleDetails.find(
      (sd) => `${sd.course}|${sd.discipline}|${sd.turn}` === selectedValue
    );
    if (selected) {
      setCourse(selected.course);
      setDiscipline(selected.discipline);
      setTurn(selected.turn);
      setSelectedClassLabel(`${selected.acronym} - ${selected.semester}`);
    } else {
      setCourse('');
      setDiscipline('');
      setTurn('');
      setSelectedClassLabel('');
    }
  };

  const handleSubmit = async () => {
    if (!course || !discipline || !turn || !quantity || !date) {
      (setAlert || setLocalAlert)({ message: "Preencha todos os campos obrigatórios.", type: "error" });
      return;
    }
    if (isNaN(quantity) || parseInt(quantity) > 4 || parseInt(quantity) < 1) {
      (setAlert || setLocalAlert)({ message: "Quantidade deve ser entre 1 e 4.", type: "error" });
      return;
    }
    const selectedDate = new Date(date).setHours(0, 0, 0, 0);
    if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
      (setAlert || setLocalAlert)({ message: "Data não pode ser anterior à atual.", type: "error" });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      (setAlert || setLocalAlert)({ message: "Token não encontrado. Faça login novamente.", type: "error" });
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      if (!userId || isNaN(userId)) {
        (setAlert || setLocalAlert)({ message: "ID do usuário inválido no token. Faça login novamente.", type: "error" });
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('course', course);
      formData.append('discipline', discipline);
      formData.append('turn', turn);
      formData.append('type', 'reposicao');
      formData.append('quantity', parseInt(quantity));
      formData.append('date', date);
      if (file) formData.append('annex', file);
      formData.append('observation', observation);

      await api.post('/request', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      (setAlert || setLocalAlert)({ message: "Reposição cadastrada com sucesso!", type: "success" });
      navigate('/class-reposition');
    } catch (error) {
      console.error('Erro ao enviar requisição:', error);
      (setAlert || setLocalAlert)({ message: error.response?.data?.error || "Erro ao cadastrar. Verifique os dados ou tente novamente.", type: "error" });
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleGoBack = () => {
    navigate('/class-reposition');
  };

  const handleAlertClose = () => {
    (setAlert || setLocalAlert)(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      <SideBar setAuthenticated={() => {}} />
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
            Cadastrar Reposição
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, mt: 2, width: '100%', maxWidth: '1000px' }}>
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
                  value={course && discipline && turn ? `${course}|${discipline}|${turn}` : ''}
                  onChange={handleScheduleChange}
                  label="Selecionar da Grade"
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {scheduleDetails.map((sd) => (
                    <MenuItem
                      key={`${sd.course}|${sd.discipline}|${sd.turn}`}
                      value={`${sd.course}|${sd.discipline}|${sd.turn}`}
                    >
                      {`${sd.acronym} - ${sd.semester} - ${sd.discipline}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, my: 1.5, alignItems: 'center' }}>
              <TextField
                label="Turma"
                value={selectedClassLabel}
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
                label="Turno"
                value={turn}
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
              <TextField
                label="Anexar Ficha"
                value={file ? file.name : ''}
                fullWidth
                readOnly
                onClick={() => document.querySelector('input[type="file"]').click()}
                variant="outlined"
                InputProps={{ endAdornment: <InputAdornment position="end"><CloudUpload sx={{ color: '#087619' }} /></InputAdornment> }}
              />
              <input type="file" hidden onChange={handleFileChange} />
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
              sx={{
                backgroundColor: INSTITUTIONAL_COLOR,
                '&:hover': { backgroundColor: '#26692b' },
              }}
            >
              <Save sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Solicitar
            </StyledButton>
          </Stack>
        </Box>

        {localAlert && (
          <CustomAlert
            message={localAlert.message}
            type={localAlert.type}
            onClose={handleAlertClose}
          />
        )}
      </Box>
    </Box>
  );
};

export default ClassReplacementRegister;

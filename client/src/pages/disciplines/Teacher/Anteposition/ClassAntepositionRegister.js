import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Stack, InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Close, Save, CloudUpload, ArrowBack } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../../../../service/api';
import { jwtDecode } from 'jwt-decode';

const INSTITUTIONAL_COLOR = "#307c34";

const StyledButton = styled(Button)(() => ({
  textTransform: 'none',
  fontWeight: 'bold',
}));

const ClassAntepositionRegister = ({ setAlert }) => {
  const professor = localStorage.getItem('username') || '';
  const [course, setCourse] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [turn, setTurn] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [observation, setObservation] = useState('');
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get('/professor/request');
        const details = response.data.scheduleDetails || [];
        // Validação para garantir que os campos estão corretos
        const validatedDetails = details.filter(
          (sd) => sd.course && sd.discipline && sd.turn
        );
        setScheduleDetails(validatedDetails);
        if (validatedDetails.length === 0) {
          setAlert({ message: 'Nenhuma grade válida encontrada.', type: 'error' });
        }
      } catch (error) {
        setAlert({ message: 'Erro ao carregar grade do professor.', type: 'error' });
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
    } else {
      setCourse('');
      setDiscipline('');
      setTurn('');
    }
  };

  const handleSubmit = async () => {
    if (!course || !discipline || !turn || !quantity || !date) {
      setAlert({ message: "Preencha todos os campos obrigatórios.", type: "error" });
      return;
    }
    if (isNaN(quantity) || parseInt(quantity) > 4 || parseInt(quantity) < 1) {
      setAlert({ message: "Quantidade deve ser entre 1 e 4.", type: "error" });
      return;
    }
    const selectedDate = new Date(date).setHours(0, 0, 0, 0);
    if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
      setAlert({ message: "Data não pode ser anterior à atual.", type: "error" });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ message: "Token não encontrado. Faça login novamente.", type: "error" });
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      if (!userId || isNaN(userId)) {
        setAlert({ message: "ID do usuário inválido no token. Faça login novamente.", type: "error" });
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('course', course);
      formData.append('discipline', discipline);
      formData.append('turn', turn);
      formData.append('type', 'anteposicao');
      formData.append('quantity', parseInt(quantity));
      formData.append('date', date);
      if (file) formData.append('annex', file);
      formData.append('observation', observation);

      await api.post('/request', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAlert({ message: "Anteposição cadastrada com sucesso!", type: "success" });
      navigate('/class-anteposition');
    } catch (error) {
      console.error('Erro ao enviar requisição:', error);
      setAlert({ message: error.response?.data?.error || "Erro ao cadastrar. Verifique os dados ou tente novamente.", type: "error" });
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleGoBack = () => {
    navigate('/class-anteposition');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 2 }}>
        <IconButton
          onClick={handleGoBack}
          sx={{ position: 'absolute', left: 0, color: INSTITUTIONAL_COLOR, '&:hover': { backgroundColor: 'transparent' } }}
        >
          <ArrowBack sx={{ fontSize: 30 }} />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: 'center', flexGrow: 1 }}>
          Cadastrar Anteposição
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 2, mt: 1 }}>
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
                value={scheduleDetails.find((sd) => sd.course === course && sd.discipline === discipline && sd.turn === turn) ? `${course}|${discipline}|${turn}` : ''}
                onChange={handleScheduleChange}
                label="Selecionar da Grade"
              >
                <MenuItem value="">Selecione</MenuItem>
                {scheduleDetails.map((sd) => (
                  <MenuItem key={`${sd.course}|${sd.discipline}|${sd.turn}`} value={`${sd.course}|${sd.discipline}|${sd.turn}`}>
                    {`${sd.course} - ${sd.discipline} - ${sd.turn}`}
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, mt: 2 }}>
        <Stack direction="row" spacing={2}>
          <StyledButton
            onClick={handleGoBack}
            variant="contained"
            sx={{ backgroundColor: "#F01424", "&:hover": { backgroundColor: "#D4000F" } }}
          >
            <Close sx={{ fontSize: 20 }} />
            Cancelar
          </StyledButton>
          <StyledButton
            onClick={handleSubmit}
            variant="contained"
            sx={{ backgroundColor: INSTITUTIONAL_COLOR, "&:hover": { backgroundColor: "#26692b" } }}
          >
            <Save sx={{ fontSize: 20 }} />
            Cadastrar
          </StyledButton>
        </Stack>
      </Box>
    </Box>
  );
};

export default ClassAntepositionRegister;
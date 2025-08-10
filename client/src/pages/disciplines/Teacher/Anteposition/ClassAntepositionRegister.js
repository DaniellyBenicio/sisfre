import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Stack, InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Close, Save, CloudUpload, ArrowBack } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../../../../service/api';

const INSTITUTIONAL_COLOR = "#307c34";

const StyledButton = styled(Button)(() => ({
  textTransform: 'none',
  fontWeight: 'bold',
}));

const ClassAntepositionRegister = ({ setAlert }) => {
  const [professor, setProfessor] = useState(localStorage.getItem('username') || '');
  const [course, setCourse] = useState(''); // Turma (code)
  const [discipline, setDiscipline] = useState('');
  const [hour, setHour] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [observation, setObservation] = useState('');
  const [scheduleDetails, setScheduleDetails] = useState([]); // Inicialize como array vazio

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get('/professor/request'); // getProfessorScheduleDetails
        // Extraia o array de scheduleDetails da resposta, ou [] se não existir
        setScheduleDetails(response.data.scheduleDetails || []);
      } catch (error) {
        setAlert({ message: 'Erro ao carregar grade do professor.', type: 'error' });
        setScheduleDetails([]); // Defina como array vazio em caso de erro
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
      setCourse(selected.schedule.course.name); // Ajuste conforme seu modelo (course.name como turma?)
      setDiscipline(selected.discipline.name);
      setHour(`${selected.hour.hourStart} - ${selected.hour.hourEnd}`);
    }
  };

  const handleSubmit = async () => {
    if (!course || !discipline || !hour || !quantity || !date || !file) {
      setAlert({ message: "Preencha todos os campos obrigatórios e anexe um arquivo.", type: "error" });
      return;
    }
    if (parseInt(quantity) > 4 || parseInt(quantity) < 1) {
      setAlert({ message: "Quantidade deve ser entre 1 e 4.", type: "error" });
      return;
    }
    const selectedDate = new Date(date).setHours(0, 0, 0, 0);
    if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
      setAlert({ message: "Data não pode ser anterior à atual.", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append('userId', localStorage.getItem('userId'));
    formData.append('course', course);
    formData.append('discipline', discipline);
    formData.append('hour', hour);
    formData.append('type', 'anteposicao');
    formData.append('quantity', parseInt(quantity));
    formData.append('date', date);
    formData.append('annex', file);
    formData.append('observation', observation);

    try {
      await api.post('/request', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); // Ajuste rota se necessário
      setAlert({ message: "Anteposição cadastrada com sucesso!", type: "success" });
      navigate('/class-anteposition');
    } catch (error) {
      setAlert({ message: error.response?.data?.error || "Erro ao cadastrar.", type: "error" });
    }
  };

  const handleGoBack = () => {
    navigate('/class-anteposition');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 3 }}>
        <IconButton
          onClick={handleGoBack}
          sx={{ position: 'absolute', left: 0, color: INSTITUTIONAL_COLOR, '&:hover': { backgroundColor: 'transparent' } }}
        >
          <ArrowBack sx={{ fontSize: 35 }} />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: "bold", textAlign: 'center', flexGrow: 1 }}>
          Cadastrar Anteposição
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
        <Stack spacing={3}>
          <TextField label="Professor" value={professor} fullWidth disabled />
          <FormControl fullWidth required>
            <InputLabel>Selecionar da Grade</InputLabel>
            <Select onChange={handleScheduleChange}>
              <MenuItem value="">Selecione</MenuItem>
              {scheduleDetails.map((sd) => (
                <MenuItem key={sd.id} value={sd.id}>
                  {sd.schedule.course.name} - {sd.discipline.name} - {sd.hour.hourStart}-{sd.hour.hourEnd}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Turma" value={course} fullWidth disabled />
          <TextField label="Disciplina" value={discipline} fullWidth disabled />
          <TextField label="Horário" value={hour} fullWidth disabled />
          <TextField label="Quantidade" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} fullWidth required />
          <TextField label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} fullWidth required InputLabelProps={{ shrink: true }} />
          <TextField label="Anexar Ficha" value={file ? file.name : ''} fullWidth readOnly onClick={() => document.querySelector('input[type="file"]').click()} 
            InputProps={{ endAdornment: <CloudUpload sx={{ color: '#087619' }} /> }} />
          <input type="file" hidden onChange={handleFileChange} />
          <TextField label="Observação" value={observation} onChange={(e) => setObservation(e.target.value)} fullWidth multiline rows={2} />
        </Stack>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Stack direction="row" spacing={2}>
          <StyledButton
            onClick={handleGoBack}
            variant="contained"
            sx={{ backgroundColor: "#F01424", "&:hover": { backgroundColor: "#D4000F" } }}
          >
            <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
            Cancelar
          </StyledButton>
          <StyledButton
            onClick={handleSubmit}
            variant="contained"
            sx={{ backgroundColor: INSTITUTIONAL_COLOR, "&:hover": { backgroundColor: "#26692b" } }}
          >
            <Save sx={{ fontSize: { xs: 20, sm: 24 } }} />
            Cadastrar
          </StyledButton>
        </Stack>
      </Box>
    </Box>
  );
};

export default ClassAntepositionRegister;
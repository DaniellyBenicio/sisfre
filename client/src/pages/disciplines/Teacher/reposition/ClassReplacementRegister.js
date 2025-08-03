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
  MenuItem,
  CssBaseline,
  Select,
} from '@mui/material';
import { ArrowBack, CloudUpload, Close, Save } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { CustomAlert } from '../../../../components/alert/CustomAlert';
import SideBar from '../../../../components/SideBar';
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

const ClassReplacementRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { frequencyItem, requestType = 'reposicao', setAuthenticated } = location.state || {};

  const [professorId, setProfessorId] = useState('');
  const [courseClassId, setCourseClassId] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [data, setData] = useState('');
  const [file, setFile] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [professors, setProfessors] = useState([]);
  const [courseClasses, setCourseClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersResponse, classesResponse] = await Promise.all([
          api.get('/users'),
          api.get('/course_classes'),
        ]);
        setProfessors(usersResponse.data);
        setCourseClasses(classesResponse.data.filter((c) => c.isActive));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setAlert({
          message: 'Erro ao carregar professores ou turmas.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    if (frequencyItem) {
      setProfessorId(frequencyItem.professorId || '');
      setCourseClassId(frequencyItem.courseClassId || '');
      setDisciplina(frequencyItem.discipline || '');
      setQuantidade(frequencyItem.quantity || '');
      setData(frequencyItem.date || '');
      setObservacao(frequencyItem.observation || '');
    }
  }, [frequencyItem]);

  const handleCourseClassChange = (event) => {
    const selectedId = event.target.value;
    setCourseClassId(selectedId);
    const selectedCourseClass = courseClasses.find((cc) => cc.id === selectedId);
    if (selectedCourseClass) {
      setDisciplina(selectedCourseClass.discipline || '');
    } else {
      setDisciplina('');
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmitReplacement = async () => {
    if (!professorId || !courseClassId || !quantidade || !data) {
      setAlert({
        message: 'Por favor, preencha todos os campos obrigatórios.',
        type: 'error',
      });
      return;
    }

    if (isNaN(quantidade) || Number(quantidade) < 1) {
      setAlert({
        message: 'A quantidade deve ser um número válido maior que 0.',
        type: 'error',
      });
      return;
    }

    if (Number(quantidade) > 4) {
      setAlert({
        message: 'O limite máximo de aulas por dia é 4.',
        type: 'error',
      });
      return;
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const selectedDate = new Date(data).setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setAlert({
        message: 'A data não pode ser anterior à data atual.',
        type: 'error',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('userId', professorId);
      formData.append('courseClassId', courseClassId);
      formData.append('type', requestType);
      formData.append('quantity', quantidade);
      formData.append('date', data);
      formData.append('observation', observacao);
      if (file) {
        formData.append('annex', file);
      }

      await api.post('/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAlert({
        message: 'Reposição de aula registrada com sucesso!',
        type: 'success',
      });
      setTimeout(() => navigate('/class-reposition', { state: { requestType } }), 2000);
    } catch (error) {
      console.error('Erro ao registrar reposição:', error);
      setAlert({
        message: error.response?.data?.error || 'Erro ao registrar reposição de aula.',
        type: 'error',
      });
    }
  };

  const handleGoBack = () => {
    navigate('/class-reposition', { state: { requestType } });
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Carregando...</Typography>
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
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'hidden',
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
          <Stack spacing={3}>
            <Stack direction="row" spacing={3}>
              <FormControl fullWidth required>
                <InputLabel id="professor-label">Professor</InputLabel>
                <Select
                  labelId="professor-label"
                  value={professorId}
                  label="Professor"
                  onChange={(e) => setProfessorId(e.target.value)}
                >
                  {professors.map((prof) => (
                    <MenuItem key={prof.id} value={prof.id}>
                      {prof.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel id="turma-label">Turma</InputLabel>
                <Select
                  labelId="turma-label"
                  value={courseClassId}
                  label="Turma"
                  onChange={handleCourseClassChange}
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {courseClasses.map((cc) => (
                    <MenuItem key={cc.id} value={cc.id}>
                      {`${cc.name} (${cc.discipline})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={3}>
              <TextField
                label="Disciplina"
                value={disciplina}
                fullWidth
                required
                disabled
              />
              <TextField
                label="Quantidade"
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                fullWidth
                required
              />
            </Stack>
            <Stack direction="row" spacing={3}>
              <TextField
                label="Data"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={data}
                onChange={(e) => setData(e.target.value)}
                sx={{ width: '100%', maxWidth: 'calc(50% - 12px)' }}
                required
              />
              <TextField
                label="Anexar Ficha"
                value={file ? file.name : ''}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <CloudUpload sx={{ color: '#087619' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: '100%', maxWidth: 'calc(50% - 12px)' }}
                onClick={() => document.querySelector('input[type="file"]').click()}
              />
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".pdf"
              />
            </Stack>
            <TextField
              label="Observação"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              fullWidth
              multiline
              rows={2}
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
              onClick={handleSubmitReplacement}
              variant="contained"
              sx={{
                backgroundColor: INSTITUTIONAL_COLOR,
                '&:hover': { backgroundColor: '#26692b' },
              }}
            >
              <Save sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Cadastrar
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

export default ClassReplacementRegister;
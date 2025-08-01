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
  const [turma, setTurma] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [data, setData] = useState('');
  const [file, setFile] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [courseClasses, setCourseClasses] = useState([]);
  const [courseClassId, setCourseClassId] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseClasses = async () => {
      try {
        const response = await api.get('/courseClasses');
        setCourseClasses(response.data);
      } catch (error) {
        setAlert({ message: 'Erro ao carregar turmas.', type: 'error' });
      }
    };
    fetchCourseClasses();
  }, [setAlert]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleCourseClassChange = (event) => {
    const selectedId = event.target.value;
    setCourseClassId(selectedId);
    const selectedCourseClass = courseClasses.find((cc) => cc.id === selectedId);
    if (selectedCourseClass) {
      setTurma(selectedCourseClass.code || '');
      setDisciplina(selectedCourseClass.name || '');
    }
  };

  const handleSubmit = async () => {
    if (!professor || !courseClassId || !quantidade || !data || !file || !observacao) {
      setAlert({ message: "Por favor, preencha todos os campos e anexe um arquivo.", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append('userId', localStorage.getItem('userId'));
    formData.append('courseClassId', courseClassId);
    formData.append('type', 'anteposicao');
    formData.append('quantity', parseInt(quantidade));
    formData.append('date', data);
    formData.append('annex', file);
    formData.append('observation', observacao);

    try {
      await api.post('/createRequest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAlert({ message: "Anteposição cadastrada com sucesso!", type: "success" });
      setTimeout(() => navigate('/class-anteposition'), 2000);
    } catch (error) {
      console.error("Erro ao registrar anteposição:", error);
      setAlert({
        message: error.response?.data?.error || "Erro ao registrar anteposição.",
        type: "error",
      });
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
          <Stack direction="row" spacing={3}>
            <TextField
              label="Professor"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              fullWidth
              required
              disabled
            />
            <FormControl fullWidth required>
              <InputLabel id="course-class-label">Turma/Disciplina</InputLabel>
              <Select
                labelId="course-class-label"
                value={courseClassId}
                label="Turma/Disciplina"
                onChange={handleCourseClassChange}
              >
                <MenuItem value="">Selecione</MenuItem>
                {courseClasses.map((cc) => (
                  <MenuItem key={cc.id} value={cc.id}>{`${cc.code} - ${cc.name}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={3}>
            <TextField
              label="Disciplina"
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
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
              required
              sx={{ width: '100%', maxWidth: 'calc(50% - 12px)' }}
              onClick={() => document.querySelector('input[type="file"]').click()}
            />
            <Button
              variant="contained"
              component="label"
              sx={{ backgroundColor: "#087619", "&:hover": { backgroundColor: "#065412" }, textTransform: "none", height: '56px', minWidth: '56px', display: 'none' }}
            >
              <input type="file" hidden onChange={handleFileChange} />
              <CloudUpload sx={{ color: '#fff' }} />
            </Button>
          </Stack>
          <TextField
            label="Observação"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            fullWidth
            multiline
            rows={2}
            required
          />
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
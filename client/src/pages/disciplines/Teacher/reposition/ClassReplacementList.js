import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, TextField, Stack, InputAdornment } from '@mui/material';
import { ArrowBack, CloudUpload, Close, Save } from '@mui/icons-material'; // Import additional icons
import { styled } from '@mui/material/styles';

const INSTITUTIONAL_COLOR = "#307c34";

const StyledButton = styled(Button)(() => ({
  borderRadius: "8px",
  padding: "8px 28px",
  textTransform: "none",
  fontWeight: "bold",
  fontSize: "0.875rem",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "fit-content",
  minWidth: 100,
  "@media (max-width: 600px)": {
    fontSize: "0.7rem",
    padding: "4px 8px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "120px",
  },
}));

const ClassReplacement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { frequencyItem } = location.state || {};

  const [alert, setAlert] = useState(null);
  const [professor, setProfessor] = useState('');
  const [turma, setTurma] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [data, setData] = useState('');
  const [file, setFile] = useState(null);
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    if (!frequencyItem) {
      setAlert({
        message: "Nenhuma frequência selecionada para reposição. Redirecionando...",
        type: "warning",
      });
      const timer = setTimeout(() => navigate('/frequency'), 3000);
      return () => clearTimeout(timer);
    }
    // Pre-populate fields if frequencyItem contains relevant data
    setProfessor(frequencyItem.professor || '');
    setTurma(frequencyItem.class || '');
    setDisciplina(frequencyItem.discipline || '');
    setQuantidade(frequencyItem.quantidade || '');
    setData(frequencyItem.date || '');
    setObservacao(frequencyItem.observacao || '');
  }, [frequencyItem, navigate]);

  const handleAlertClose = () => {
    setAlert(null);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmitReplacement = async () => {
    if (!professor || !turma || !disciplina || !quantidade || !data || !file) {
      setAlert({ message: "Por favor, preencha todos os campos e anexe um arquivo.", type: "error" });
      return;
    }

    const replacementData = {
      originalFrequencyId: frequencyItem.id,
      professor,
      turma,
      disciplina,
      quantidade,
      data,
      fileName: file.name,
      observacao,
      // Add file upload logic here if needed
    };

    try {
      console.log("Enviando dados de reposição:", replacementData);
      setAlert({
        message: "Reposição de aula registrada com sucesso!",
        type: "success",
      });
      setTimeout(() => navigate('/frequency'), 2000);
    } catch (error) {
      console.error("Erro ao registrar reposição:", error);
      setAlert({
        message: "Erro ao registrar reposição de aula. Tente novamente.",
        type: "error",
      });
    }
  };

  if (!frequencyItem) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Carregando ou nenhum item selecionado...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ArrowBack
          sx={{
            color: '#087619',
            fontSize: '40px',
            cursor: 'pointer',
            marginRight: '16px',
          }}
          onClick={() => navigate('/frequency')}
        />
        <Typography variant="h5" sx={{ fontWeight: "bold", flexGrow: 1, textAlign: 'center' }}>
          Cadastrar Reposição
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, minHeight: '400px' }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={3}>
            <TextField
              label="Professor"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Turma"
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              fullWidth
              required
            />
          </Stack>
          <Stack direction="row" spacing={3}>
            <TextField
              label="Disciplina"
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              fullWidth
              required
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
              sx={{
                backgroundColor: "#087619",
                "&:hover": { backgroundColor: "#065412" },
                textTransform: "none",
                height: '56px',
                minWidth: '56px',
                display: 'none',
              }}
            >
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
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

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ padding: "10px 24px", marginTop: "10px", "@media (max-width: 600px)": { padding: "8px 12px", gap: "8px" } }}>
        <StyledButton
          onClick={() => navigate('/frequency')}
          variant="contained"
          sx={{
            backgroundColor: "#F01424",
            "&:hover": { backgroundColor: "#D4000F" },
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
            "&:hover": { backgroundColor: "#26692b" },
          }}
        >
          <Save sx={{ fontSize: { xs: 20, sm: 24 } }} />
          Cadastrar
        </StyledButton>
      </Stack>

      {alert && (
        <Box sx={{ p: 2, color: 'red', textAlign: 'center' }}>
          {alert.message}
        </Box>
      )}
    </Box>
  );
};

export default ClassReplacement;
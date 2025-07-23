import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Stack, InputAdornment, IconButton } from '@mui/material';
import { Close, Save, CloudUpload, ArrowBack } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const INSTITUTIONAL_COLOR = "#307c34"; // Definido o verde institucional

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

const ClassAntepositionRegister = ({ setAlert }) => {
  const [professor, setProfessor] = useState('');
  const [turma, setTurma] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [data, setData] = useState('');
  const [file, setFile] = useState(null);
  const [observacao, setObservacao] = useState('');

  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = () => {
    if (!professor || !turma || !disciplina || !quantidade || !data || !file) {
      setAlert({ message: "Por favor, preencha todos os campos e anexe um arquivo.", type: "error" });
      return;
    }

    const newAntepositionData = {
      professor,
      turma,
      disciplina,
      quantidade,
      data,
      fileName: file.name,
      observacao,
      isActive: true,
    };

    try {
      console.log("Registrando nova anteposição:", newAntepositionData);
      // Simulação de sucesso. Em um cenário real, você faria uma chamada à API aqui.
      // await api.post('/antepositions', newAntepositionData);

      setAlert({ message: "Anteposição cadastrada com sucesso!", type: "success" });
      navigate('/class-anteposition'); // Volta para a lista após o sucesso
    } catch (error) {
      console.error("Erro ao registrar anteposição:", error);
      setAlert({
        message: "Erro ao registrar anteposição. Tente novamente.",
        type: "error",
      });
    }
  };

  const handleGoBack = () => {
    navigate('/class-anteposition'); // Alterado para voltar à página de listagem
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Container para o título e o botão de voltar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 3 }}>
        {/* Botão de voltar posicionado à esquerda */}
        <IconButton
          onClick={handleGoBack}
          sx={{
            position: 'absolute',
            left: 0,
            color: INSTITUTIONAL_COLOR,
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          <ArrowBack sx={{ fontSize: 35 }} />
        </IconButton>

        {/* Título centralizado */}
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Stack direction="row" spacing={2}>
          <StyledButton
            onClick={handleGoBack}
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
            onClick={handleSubmit}
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
      </Box>
    </Box>
  );
};

export default ClassAntepositionRegister;
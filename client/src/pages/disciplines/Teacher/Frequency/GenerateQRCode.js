import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Select,
  MenuItem,
} from "@mui/material";
import api from "../../../../service/api";
import { CustomAlert } from "../../../../components/alert/CustomAlert";
import { StyledSelect } from "../../../../components/inputs/Input";

const GenerateQRCode = ({ setAlert }) => {
  const [courseClassId, setCourseClassId] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [token, setToken] = useState(null);
  const [courseClasses, setCourseClasses] = useState([]); // Lista de turmas (simulada ou obtida do back-end)

  // Simulando lista de turmas (substituir por chamada ao back-end, se disponível)
  const fetchCourseClasses = async () => {
    try {
      // Exemplo: chamar uma rota GET /course-classes para obter turmas
      // const response = await api.get("/course-classes");
      // setCourseClasses(response.data);
      // Simulação de turmas para exemplo
      setCourseClasses([
        { id: 1, name: "SI - S2" },
        { id: 2, name: "ENG - S4" },
      ]);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
      setAlert({
        message: "Erro ao carregar turmas.",
        type: "error",
      });
    }
  };

  const handleGenerateQRCode = async () => {
    if (!courseClassId) {
      setAlert({
        message: "Selecione uma turma antes de gerar o QR Code.",
        type: "error",
      });
      return;
    }

    try {
      const response = await api.post("/frequency/qrcode", { courseClassId });
      setQrImage(response.data.qrImage);
      setToken(response.data.token);
      setAlert({
        message: "QR Code gerado com sucesso!",
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      setAlert({
        message: error.response?.data?.error || "Erro ao gerar QR Code.",
        type: "error",
      });
    }
  };

  // Carregar turmas na inicialização
  React.useEffect(() => {
    fetchCourseClasses();
  }, []);

  const commonFormControlSx = {
    width: { xs: "100%", sm: "200px" },
    "& .MuiInputBase-root": {
      height: { xs: 40, sm: 36 },
      display: "flex",
      alignItems: "center",
    },
    "& .MuiInputLabel-root": {
      transform: "translate(14px, 7px) scale(1)",
      "&.Mui-focused, &.MuiInputLabel-shrink": {
        transform: "translate(14px, -6px) scale(0.75)",
        color: "#000000",
      },
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      height: "100% !important",
    },
  };

  const commonSelectSx = {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.23)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
  };

  const commonMenuProps = {
    PaperProps: {
      sx: {
        maxHeight: "200px",
        overflowY: "auto",
        width: "auto",
        "& .MuiMenuItem-root": {
          "&:hover": {
            backgroundColor: "#D5FFDB",
          },
          "&.Mui-selected": {
            backgroundColor: "#E8F5E9",
            "&:hover": {
              backgroundColor: "#D5FFDB",
            },
          },
        },
      },
    },
  };

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid rgba(0, 0, 0, 0.12)",
        borderRadius: "4px",
        backgroundColor: "#fff",
        mb: 2,
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 2 }}
      >
        Gerar QR Code
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <FormControl sx={commonFormControlSx}>
          <InputLabel id="course-class-label">Turma</InputLabel>
          <StyledSelect
            labelId="course-class-label"
            id="course-class"
            value={courseClassId}
            label="Turma"
            onChange={(e) => setCourseClassId(e.target.value)}
            sx={commonSelectSx}
            MenuProps={commonMenuProps}
          >
            <MenuItem value="">Selecione uma turma</MenuItem>
            {courseClasses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </StyledSelect>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleGenerateQRCode}
          sx={{
            backgroundColor: "#087619",
            "&:hover": { backgroundColor: "#065412" },
            textTransform: "none",
            width: { xs: "100%", sm: "200px" },
            height: { xs: 40, sm: 36 },
            fontWeight: "bold",
            fontSize: { xs: "0.9rem", sm: "1rem" },
          }}
        >
          Gerar QR Code
        </Button>
      </Stack>
      {qrImage && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="subtitle1" gutterBottom>
            QR Code Gerado:
          </Typography>
          <img
            src={qrImage}
            alt="QR Code"
            style={{ maxWidth: "200px", marginBottom: "10px" }}
          />
          <Typography variant="body2">
            <strong>Token:</strong> {token}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default GenerateQRCode;
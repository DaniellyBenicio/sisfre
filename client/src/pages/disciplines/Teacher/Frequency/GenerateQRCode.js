import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Button,
  Stack,
  IconButton,
  MenuItem,
} from "@mui/material";
import { ContentCopy, Close } from "@mui/icons-material";
import api from "../../../../service/api";
import { CustomAlert } from "../../../../components/alert/CustomAlert";
import { StyledSelect } from "../../../../components/inputs/Input";

const GenerateQRCode = ({ setAlert }) => {
  const [courseClassId, setCourseClassId] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [token, setToken] = useState(null);
  const [courseClasses, setCourseClasses] = useState([
    { id: 1, name: "Turma Fictícia 2025 - Matemática" },
  ]);
  const [loading, setLoading] = useState(false);

  /*
  const fetchCourseClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/course-classes");
      console.log("Resposta do endpoint /course-classes:", response.data);
      if (Array.isArray(response.data)) {
        setCourseClasses(response.data);
        if (response.data.length === 0) {
          setAlert({
            message: "Nenhuma turma disponível. Verifique o backend.",
            type: "warning",
          });
        }
      } else {
        throw new Error("Formato de resposta inválido para turmas.");
      }
    } catch (error) {
      console.error("Erro ao buscar turmas:", error.response?.data || error.message);
      setAlert({
        message: error.response?.data?.error || "Erro ao carregar turmas. Verifique o console para mais detalhes.",
        type: "error",
      });
      setCourseClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseClasses();
  }, []);
  */

  const handleGenerateQRCode = async () => {
    if (!courseClassId) {
      setAlert({
        message: "Selecione uma turma antes de gerar o QR Code.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/frequency/qrcode", { courseClassId });
      console.log("Resposta do endpoint /frequency/qrcode:", response.data);
      setQrImage(response.data.qrImage);
      setToken(response.data.token);
      setAlert({
        message: "QR Code gerado com sucesso!",
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error.response?.data || error.message);
      setAlert({
        message: error.response?.data?.error || "Erro ao gerar QR Code.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token).then(() => {
        setAlert({
          message: "Token copiado com sucesso!",
          type: "success",
        });
      }).catch((err) => {
        console.error("Erro ao copiar token:", err);
        setAlert({
          message: "Erro ao copiar o token. Verifique as permissões.",
          type: "error",
        });
      });
    }
  };

  const handleCancel = () => {
    setCourseClassId("");
    setQrImage(null);
    setToken(null);
  };

  const commonFormControlSx = {
    width: { xs: "100%", sm: "250px" },
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
        p: 3,
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "4px",
        textAlign: "center",
        width: "100%",
        mx: 0,
        px: { xs: 2, sm: 4 },
        minHeight: qrImage ? "300px" : "200px",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", mb: 4 }}
      >
        Gerar Código de Presença
      </Typography>
      {loading && (
        <Typography align="center" sx={{ mb: 2 }}>
          Carregando turmas...
        </Typography>
      )}
      {!loading && courseClasses.length === 0 && (
        <Typography align="center" sx={{ mb: 2, color: "error.main" }}>
          Nenhuma turma encontrada.
        </Typography>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        alignItems="center"
        justifyContent="center"
        sx={{ mb: 4 }}
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
            disabled={loading || courseClasses.length === 0}
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
          disabled={loading || courseClasses.length === 0}
          sx={{
            bgcolor: "#087619",
            "&:hover": { bgcolor: "#065412" },
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
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            QR Code Gerado:
          </Typography>
          <img
            src={qrImage}
            alt="QR Code"
            style={{ maxWidth: "250px", marginBottom: "20px", display: "block", marginLeft: "auto", marginRight: "auto" }}
          />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <Typography variant="body2">
              <strong>Token:</strong> {token}
            </Typography>
            <IconButton onClick={handleCopyToken} title="Copiar Token">
              <ContentCopy />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <IconButton
              onClick={handleCancel}
              sx={{
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
                backgroundColor: "#F01424",
                color: "#fff",
                "&:hover": { backgroundColor: "#D4000F" },
                "@media (max-width: 600px)": {
                  fontSize: "0.7rem",
                  padding: "4px 8px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "120px",
                },
              }}
            >
              <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Cancelar
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GenerateQRCode;
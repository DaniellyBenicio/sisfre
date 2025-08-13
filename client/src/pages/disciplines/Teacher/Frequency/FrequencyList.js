import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Button,
  Stack,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import { QrCodeScanner, Close, Save } from "@mui/icons-material";
import jsQR from "jsqr";
import { jwtDecode } from "jwt-decode"; 
import api from "../../../../service/api";
import { CustomAlert } from "../../../../components/alert/CustomAlert";
import FrequenciesTable from "./FrequenciesTable";
import GenerateQRCode from "./GenerateQRCode";
import { StyledSelect } from "../../../../components/inputs/Input";
import { styled } from "@mui/material/styles";

const INSTITUTIONAL_COLOR = "#307c34";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1, 3.5),
  textTransform: "none",
  fontWeight: "bold",
  fontSize: theme.typography.pxToRem(14),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  width: "auto",
  minWidth: "100px",
  [theme.breakpoints.down("sm")]: {
    fontSize: theme.typography.pxToRem(12),
    padding: theme.spacing(0.5, 1),
    minWidth: "80px",
  },
}));

const FrequencyList = () => {
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Obter o userId do token JWT armazenado
  const getUserId = () => {
    try {
      const token = localStorage.getItem("token"); 
      if (token) {
        const decoded = jwtDecode(token);
        return decoded.id; 
      }
      return null;
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      return null;
    }
  };

  const userId = getUserId();

  const commonStyles = {
    formControl: {
      width: { xs: "100%", sm: "200px" },
      "& .MuiInputBase-root": { height: { xs: 40, sm: 36 } },
      "& .MuiInputLabel-root": {
        transform: "translate(14px, 7px) scale(1)",
        fontSize: { xs: "0.875rem", sm: "1rem" },
        "&.Mui-focused, &.MuiInputLabel-shrink": {
          transform: "translate(14px, -6px) scale(0.75)",
          color: "#000000",
        },
      },
    },
    select: {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#000000",
      },
    },
    menuProps: {
      PaperProps: {
        sx: {
          maxHeight: "200px",
          "& .MuiMenuItem-root": {
            "&:hover": { backgroundColor: "#D5FFDB" },
            "&.Mui-selected": {
              backgroundColor: "#E8F5E9",
              "&:hover": { backgroundColor: "#D5FFDB" },
            },
          },
        },
      },
    },
    dateInput: {
      width: { xs: "100%", sm: "150px" },
      "& .MuiInputBase-root": { height: { xs: 40, sm: 36 } },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#000000",
      },
    },
    tokenInput: {
      width: { xs: "100%", sm: "300px" },
      "& .MuiInputBase-root": {
        height: { xs: 48, sm: 56 },
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
        borderWidth: "1px",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#000000",
        borderWidth: "1px",
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#000000",
        borderWidth: "1px",
      },
      "& .MuiInputLabel-root": {
        top: "50%",
        transform: "translate(14px, -50%)",
        fontSize: { xs: "0.875rem", sm: "1rem" },
        color: "rgba(0, 0, 0, 0.6)",
      },
      "& .MuiInputLabel-shrink": {
        top: 0,
        transform: "translate(14px, -9px) scale(0.75)",
        color: "#000000",
      },
      "& .MuiInputLabel-root.Mui-focused": {
        color: "#000000",
      },
    },
  };

  const fetchFrequencies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/frequency/professor");
      console.log("Raw API response:", response.data);
      const formattedData = response.data.map((freq) => {
        const mapped = {
          id: freq.id,
          date: freq.date,
          displayDate: freq.date
            ? new Date(freq.date + "T00:00:00").toLocaleDateString("pt-BR")
            : "N/A",
          class: freq.className || "N/A",
          discipline: freq.disciplineName || "N/A",
          time: freq.time || "N/A",
          status: freq.isAbsence ? "Falta" : "Presença",
          courseId: freq.courseId,
          disciplineId: freq.disciplineId,
        };
        console.log("Mapped frequency:", mapped);
        return mapped;
      });
      console.log("Formatted frequencies:", formattedData);
      setFrequencies(formattedData);
    } catch (error) {
      console.error("Erro ao buscar frequências:", error);
      console.log("Error details:", error.response?.data);
      setAlert({ message: "Erro ao carregar as frequências.", type: "error" });
      setFrequencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFrequencies();
    } else {
      setAlert({ message: "Usuário não autenticado.", type: "error" });
      setLoading(false);
    }
  }, [userId]);

  const applyFilters = (data) => {
    let filtered = Array.isArray(data) ? [...data] : [];
    if (filterStatus === "absences")
      filtered = filtered.filter((freq) => freq.status === "Falta");
    else if (filterStatus === "presences")
      filtered = filtered.filter((freq) => freq.status === "Presença");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filtered = filtered.filter((freq) => {
      if (!freq.date) return false;
      const freqDate = new Date(freq.date + "T00:00:00");
      switch (filterPeriod) {
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return freqDate.toDateString() === yesterday.toDateString();
        case "lastWeek":
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          return freqDate >= lastWeek && freqDate <= today;
        case "lastMonth":
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          return freqDate >= lastMonth && freqDate <= today;
        case "custom":
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate + "T00:00:00");
            const end = new Date(customEndDate + "T23:59:59");
            return freqDate >= start && freqDate <= end;
          }
          return true;
        default:
          return true;
      }
    });
    console.log("Filtered frequencies:", filtered);
    return filtered;
  };

  const handleUploadFrequency = async (frequencyItem) => {
    try {
      const response = await api.put(`/frequency/${frequencyItem.id}`, {
        isAbsence: frequencyItem.status === "Falta",
      });
      setAlert({ message: response.data.message, type: "success" });
      fetchFrequencies();
    } catch (error) {
      console.error("Erro ao atualizar frequência:", error);
      setAlert({ message: "Erro ao atualizar a frequência.", type: "error" });
    }
  };

  const handleRegisterAbsenceWithCredit = async (frequencyItem) => {
    if (!userId) {
      setAlert({ message: "Usuário não autenticado.", type: "error" });
      return;
    }
    try {
      const now = new Date();
      const response = await api.post("/frequency/absence-credit", {
        userId,
        courseId: frequencyItem.courseId,
        disciplineId: frequencyItem.disciplineId,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0],
        useCredit: true,
      });
      setAlert({ message: response.data.message, type: "success" });
      fetchFrequencies();
    } catch (error) {
      console.error("Erro ao registrar falta com crédito:", error);
      setAlert({
        message: error.response?.data?.error || "Erro ao registrar falta.",
        type: "error",
      });
    }
  };

  const handleScanQRCode = async (data) => {
    if (!data) return;
    if (!userId) {
      setAlert({ message: "Usuário não autenticado.", type: "error" });
      setShowQrScanner(false);
      setTokenInput("");
      return;
    }
    try {
      const parsedData = JSON.parse(data);
      const token = parsedData.token;
      if (!token) throw new Error("Token inválido no QR Code.");
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = position.coords;
      const response = await api.post("/frequency/scan", {
        token,
        userId,
        latitude,
        longitude,
      });
      setAlert({ message: response.data.message, type: "success" });
      setShowQrScanner(false);
      setTokenInput("");
      fetchFrequencies();
    } catch (error) {
      console.error("Erro ao escanear QR Code:", error);
      setAlert({
        message:
          error.response?.data?.error ||
          "Erro ao registrar frequência via QR Code.",
        type: "error",
      });
      setShowQrScanner(false);
      setTokenInput("");
    }
  };

  const handleTokenSubmit = () => {
    if (!tokenInput) {
      setAlert({ message: "Por favor, insira um token.", type: "error" });
      return;
    }
    handleScanQRCode(JSON.stringify({ token: tokenInput }));
  };

  const handleScanError = (error) => {
    console.error("Erro ao escanear QR Code:", error);
    setAlert({
      message:
        "Erro ao escanear o QR Code. Verifique a permissão da câmera ou tente novamente.",
      type: "error",
    });
    setShowQrScanner(false);
  };

  const startQrScanner = async () => {
    setShowQrScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanQrCode();
      }
    } catch (error) {
      handleScanError(error);
    }
  };

  const stopQrScanner = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowQrScanner(false);
  };

  const scanQrCode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const video = videoRef.current;

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code) {
          handleScanQRCode(code.data);
          stopQrScanner();
          return;
        }
      }
      requestAnimationFrame(scan);
    };
    requestAnimationFrame(scan);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (showQrScanner && newValue !== 1) stopQrScanner();
    setTokenInput("");
  };

  const handleCancelToken = () => {
    setTokenInput("");
    setAlert(null);
  };

  const filteredFrequencies = applyFilters(frequencies);
  console.log("Data passed to FrequenciesTable:", filteredFrequencies);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: "100%",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1.5, sm: 2 },
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          fontWeight: "bold",
          my: { xs: 1, sm: 2 },
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        Frequências
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{
          mb: 1,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "bold",
            fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
            color: "rgba(0, 0, 0, 0.6)",
            padding: { xs: "6px 12px", sm: "12px 16px" },
          },
          "& .Mui-selected": { color: "#087619 !important" },
          "& .MuiTabs-indicator": { backgroundColor: "#087619" },
          "& .MuiTabs-flexContainer": {
            flexWrap: "wrap",
            justifyContent: { xs: "flex-start", sm: "center" },
          },
        }}
      >
        <Tab label="Gerar QR Code" />
        <Tab label="Escanear QR Code" />
        <Tab label="Frequências" />
      </Tabs>
      <Box
        sx={{
          height: "2px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
          width: "100%",
          mb: 2,
        }}
      />

      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {tabValue === 0 && <GenerateQRCode setAlert={setAlert} />}

      {tabValue === 1 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 2 },
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "4px",
              textAlign: "center",
              flex: { xs: "1 1 100%", sm: "1 1 45%" },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 2,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Escanear QR Code
            </Typography>
            {showQrScanner ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <video
                  ref={videoRef}
                  style={{
                    width: "100%",
                    maxWidth: { xs: "250px", sm: "300px" },
                    aspectRatio: "4/3",
                    borderRadius: "8px",
                  }}
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <StyledButton
                  onClick={stopQrScanner}
                  variant="contained"
                  sx={{
                    backgroundColor: "#F01424",
                    "&:hover": { backgroundColor: "#D4000F" },
                  }}
                >
                  <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  Cancelar
                </StyledButton>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<QrCodeScanner />}
                onClick={startQrScanner}
                sx={{
                  bgcolor: "#087619",
                  "&:hover": { bgcolor: "#065412" },
                  textTransform: "none",
                  width: { xs: "100%", sm: "200px" },
                  height: { xs: 40, sm: 36 },
                  fontWeight: "bold",
                  fontSize: { xs: "0.8rem", sm: "1rem" },
                  mx: "auto",
                  display: "block",
                }}
              >
                Iniciar Scanner
              </Button>
            )}
          </Box>

          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "4px",
              textAlign: "center",
              flex: { xs: "1 1 100%", sm: "1 1 45%" },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 2,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Inserir Token
            </Typography>
            <Stack direction="column" spacing={1} alignItems="center">
              <TextField
                label="Token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                sx={commonStyles.tokenInput}
                placeholder="Cole o token aqui"
              />
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1, justifyContent: "center" }}
              >
                <StyledButton
                  onClick={handleCancelToken}
                  variant="contained"
                  disabled={!tokenInput}
                  sx={{
                    backgroundColor: !tokenInput ? "#E0E0E0" : "#F01424",
                    "&:hover": {
                      backgroundColor: !tokenInput ? "#E0E0E0" : "#D4000F",
                    },
                  }}
                >
                  <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  Cancelar
                </StyledButton>
                <StyledButton
                  onClick={handleTokenSubmit}
                  variant="contained"
                  disabled={!tokenInput}
                  sx={{
                    backgroundColor: !tokenInput
                      ? "#E0E0E0"
                      : INSTITUTIONAL_COLOR,
                    "&:hover": {
                      backgroundColor: !tokenInput ? "#E0E0E0" : "#26692b",
                    },
                  }}
                >
                  <Save sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  Enviar
                </StyledButton>
              </Stack>
            </Stack>
          </Box>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 2 }}
            sx={{ mb: 2, flexWrap: "wrap" }}
          >
            <FormControl sx={commonStyles.formControl}>
              <InputLabel id="filter-status-label">Status</InputLabel>
              <StyledSelect
                labelId="filter-status-label"
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={commonStyles.select}
                MenuProps={commonStyles.menuProps}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="presences">Presenças</MenuItem>
                <MenuItem value="absences">Faltas</MenuItem>
              </StyledSelect>
            </FormControl>
            <FormControl sx={commonStyles.formControl}>
              <InputLabel id="filter-period-label">Período</InputLabel>
              <StyledSelect
                labelId="filter-period-label"
                value={filterPeriod}
                label="Período"
                onChange={(e) => setFilterPeriod(e.target.value)}
                sx={commonStyles.select}
                MenuProps={commonStyles.menuProps}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="yesterday">Dia Anterior</MenuItem>
                <MenuItem value="lastWeek">Última Semana</MenuItem>
                <MenuItem value="lastMonth">Último Mês</MenuItem>
                <MenuItem value="custom">Intervalo Personalizado</MenuItem>
              </StyledSelect>
            </FormControl>
            {filterPeriod === "custom" && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  label="Data Inicial"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  sx={commonStyles.dateInput}
                />
                <TextField
                  label="Data Final"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  sx={commonStyles.dateInput}
                />
              </Stack>
            )}
          </Stack>
          <Box sx={{ overflowX: "auto" }}>
            <FrequenciesTable
              frequencies={filteredFrequencies}
              search=""
              isFiltered={
                filterStatus !== "all" ||
                filterPeriod !== "all" ||
                (filterPeriod === "custom" &&
                  (customStartDate || customEndDate))
              }
              setAlert={setAlert}
              onRegisterAbsenceWithCredit={handleRegisterAbsenceWithCredit}
            />
          </Box>
          {loading && (
            <Typography align="center">Carregando frequências...</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FrequencyList;
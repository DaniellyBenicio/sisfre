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
  CircularProgress, // Import CircularProgress for loading indicator
} from "@mui/material";
import { QrCodeScanner, ContentPaste } from "@mui/icons-material"; // Import ContentPaste icon
import jsQR from "jsqr";
// Assuming api, CustomAlert, FrequenciesTable, GenerateQRCode, and StyledSelect are available in the context
// For this standalone example, we'll mock 'api' and other components.
// In a real application, ensure these imports point to their correct paths.

// Mocking external components/modules for standalone execution
const CustomAlert = ({ message, type, onClose }) => (
  <Box sx={{ p: 2, mt: 2, backgroundColor: type === 'error' ? '#ffebee' : '#e8f5e9', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography color={type === 'error' ? 'error.main' : 'success.main'}>{message}</Typography>
    <Button onClick={onClose} size="small">X</Button>
  </Box>
);

const FrequenciesTable = ({ frequencies, onUpload, search, isFiltered, setAlert }) => {
  if (!Array.isArray(frequencies) || frequencies.length === 0) {
    return <Typography align="center" sx={{ mt: 2 }}>Nenhuma frequência encontrada com os filtros aplicados.</Typography>;
  }
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Data</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Disciplina</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Hora</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {frequencies.map((freq) => (
            <tr key={freq.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{freq.id}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{freq.displayDate}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{freq.class}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{freq.time}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{freq.status}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <Button onClick={() => onUpload(freq)} size="small">Atualizar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

const GenerateQRCode = ({ setAlert }) => {
  const [qrData, setQrData] = useState("");
  const [generatedQR, setGeneratedQR] = useState("");
  const [loadingQR, setLoadingQR] = useState(false);

  const handleGenerate = async () => {
    setLoadingQR(true);
    try {
      // Simulate API call to generate QR code data
      // In a real app, this would be an actual API call
      const response = { data: { token: `mock_token_${Date.now()}` } };
      const token = response.data.token;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ token }))}`;
      setGeneratedQR(qrCodeUrl);
      setQrData(JSON.stringify({ token }));
      setAlert({ message: "QR Code gerado com sucesso!", type: "success" });
    } catch (error) {
      console.error("Error generating QR code:", error);
      setAlert({ message: "Erro ao gerar QR Code.", type: "error" });
    } finally {
      setLoadingQR(false);
    }
  };

  return (
    <Box sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.12)", borderRadius: "4px", backgroundColor: "#fff", mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
        Gerar QR Code de Frequência
      </Typography>
      <Stack spacing={2} direction={{ xs: "column", sm: "row" }} alignItems="center">
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loadingQR}
          sx={{
            backgroundColor: "#087619",
            "&:hover": { backgroundColor: "#065412" },
            textTransform: "none",
            width: { xs: "100%", sm: "auto" },
            fontWeight: "bold",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            height: { xs: 40, sm: 36 },
          }}
        >
          {loadingQR ? <CircularProgress size={24} color="inherit" /> : "Gerar QR Code"}
        </Button>
      </Stack>
      {generatedQR && (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <img src={generatedQR} alt="QR Code" style={{ maxWidth: "150px", height: "auto", borderRadius: "8px" }} />
          <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-all' }}>
            Token: {qrData}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const StyledSelect = (props) => (
  <FormControl fullWidth>
    <InputLabel>{props.label}</InputLabel>
    <select
      style={{
        width: '100%',
        padding: '8px 12px',
        border: '1px solid rgba(0, 0, 0, 0.23)',
        borderRadius: '4px',
        backgroundColor: 'white',
        minHeight: '36px',
        boxSizing: 'border-box',
        appearance: 'none', // Remove default arrow
        WebkitAppearance: 'none', // For Safari
        MozAppearance: 'none', // For Firefox
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black' width='18px' height='18px'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        backgroundSize: '18px',
      }}
      {...props}
    >
      {props.children}
    </select>
  </FormControl>
);

// Mocking the 'api' object for demonstration purposes
const api = {
  get: async (url) => {
    console.log(`Mock API GET: ${url}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            { id: "1", date: "2025-08-01", disciplinaclasse: { name: "Matemática" }, time: "08:00", status: "Presença" },
            { id: "2", date: "2025-08-02", disciplinaclasse: { name: "Física" }, time: "09:30", status: "Falta" },
            { id: "3", date: "2025-08-03", disciplinaclasse: { name: "Química" }, time: "11:00", status: "Presença" },
            { id: "4", date: "2025-08-04", disciplinaclasse: { name: "História" }, time: "10:00", status: "Falta" },
            { id: "5", date: "2025-08-05", disciplinaclasse: { name: "Português" }, time: "14:00", status: "Presença" },
          ],
        });
      }, 500);
    });
  },
  post: async (url, data) => {
    console.log(`Mock API POST: ${url}`, data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.token === 'mock_token_success' || data.token.startsWith('mock_token_')) {
          resolve({ data: { message: "Frequência registrada com sucesso!" } });
        } else {
          reject({ response: { data: { error: "Token inválido ou expirado." } } });
        }
      }, 500);
    });
  },
  put: async (url, data) => {
    console.log(`Mock API PUT: ${url}`, data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { message: "Frequência atualizada com sucesso!" } });
      }, 500);
    });
  },
};


const FrequencyList = () => {
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [tabValue, setTabValue] = useState(0);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [tokenInput, setTokenInput] = useState(""); // New state for token input

  const handleAlertClose = () => {
    setAlert(null);
  };

  const fetchFrequencies = async () => {
    try {
      setLoading(true);
      // Simulação da chamada da API
      const response = await api.get("/frequency");
      const data = response.data;

      const formattedDataForDisplay = data.map((freq) => ({
        id: freq.id,
        date: freq.date,
        displayDate: freq.date
          ? new Date(freq.date + "T00:00:00").toLocaleDateString("pt-BR")
          : "N/A",
        class: freq.disciplinaclasse ? freq.disciplinaclasse.name : "N/A",
        time: freq.time || "N/A",
        status: freq.status || "Presença",
      }));

      setFrequencies(formattedDataForDisplay);
    } catch (error) {
      console.error("Erro ao buscar frequências:", error);
      setAlert({
        message: "Erro ao carregar as frequências.",
        type: "error",
      });
      setFrequencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrequencies();
  }, []);

  const applyFilters = (data) => {
    let filtered = Array.isArray(data) ? [...data] : [];

    if (filterStatus === "absences") {
      filtered = filtered.filter((freq) => freq.status === "Falta");
    } else if (filterStatus === "presences") {
      filtered = filtered.filter((freq) => freq.status === "Presença");
    }

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

    return filtered;
  };

  const filteredFrequencies = applyFilters(frequencies);

  const handleUploadFrequency = async (frequencyItem) => {
    try {
      const response = await api.put(`/frequency/${frequencyItem.id}`, {
        status: frequencyItem.status,
      });
      setAlert({
        message: response.data.message,
        type: "success",
      });
      fetchFrequencies();
    } catch (error) {
      console.error("Erro ao atualizar frequência:", error);
      setAlert({
        message: "Erro ao atualizar a frequência.",
        type: "error",
      });
    }
  };

  const handleScanQRCode = async (data) => {
    if (data) {
      try {
        const token = JSON.parse(data).token;
        await registerFrequency(token);
      } catch (error) {
        console.error("Erro ao processar QR Code:", error);
        setAlert({
          message: "Formato de QR Code inválido.",
          type: "error",
        });
        setShowQrScanner(false);
      }
    }
  };

  const handleTokenSubmit = async () => {
    if (!tokenInput) {
      setAlert({
        message: "Por favor, insira um token.",
        type: "warning",
      });
      return;
    }
    try {
      const parsedToken = JSON.parse(tokenInput).token;
      await registerFrequency(parsedToken);
    } catch (error) {
      console.error("Erro ao processar token:", error);
      setAlert({
        message: "Formato de token inválido. Certifique-se de que é um JSON válido com a chave 'token'.",
        type: "error",
      });
    }
  };

  const registerFrequency = async (token) => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const userId = "1"; // Substituir por ID do usuário autenticado

      const response = await api.post("/frequency/scan", {
        token,
        userId,
        latitude,
        longitude,
      });

      setAlert({
        message: response.data.message,
        type: "success",
      });
      setShowQrScanner(false); // Close scanner after successful registration
      setTokenInput(""); // Clear token input
      fetchFrequencies();
    } catch (error) {
      console.error("Erro ao registrar frequência:", error);
      setAlert({
        message: error.response?.data?.error || "Erro ao registrar frequência.",
        type: "error",
      });
      setShowQrScanner(false); // Close scanner on error too
    }
  };

  const handleScanError = (error) => {
    console.error("Erro ao escanear QR Code:", error);
    setAlert({
      message: "Erro ao escanear o QR Code. Verifique a permissão da câmera ou tente novamente.",
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
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
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
      if (!showQrScanner) return; // Stop scanning if scanner is closed
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        try {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                handleScanQRCode(code.data);
                stopQrScanner();
                return;
            }
        } catch (e) {
            console.warn("Error decoding QR code:", e);
            // Continue scanning even if one frame fails
        }
      }
      requestAnimationFrame(scan);
    };

    requestAnimationFrame(scan);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (showQrScanner && newValue !== 1) {
      stopQrScanner();
    }
  };

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
        p: 3,
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", mt: 2, mb: 2 }}
      >
        Frequências
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{
          mb: 2,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "bold",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            color: 'rgba(0, 0, 0, 0.6)',
          },
          "& .Mui-selected": {
            color: "#087619",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#087619",
          },
        }}
      >
        <Tab label="Gerar QR Code" />
        <Tab label="Escanear QR Code" />
        <Tab label="Frequências" />
      </Tabs>

      {tabValue === 0 && <GenerateQRCode setAlert={setAlert} />}

      {tabValue === 1 && (
        <>
          {/* Bloco para Escanear QR Code - Mantido como o original */}
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
              Escanear QR Code
            </Typography>
            {showQrScanner ? (
              <Box sx={{ textAlign: "center" }}>
                <video
                  ref={videoRef}
                  style={{ width: "100%", maxWidth: "300px", margin: "0 auto", borderRadius: "8px" }}
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <Button
                  variant="outlined"
                  onClick={stopQrScanner}
                  sx={{ mt: 1, textTransform: "none", fontWeight: "bold" }}
                >
                  Cancelar Scanner
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<QrCodeScanner />}
                onClick={startQrScanner}
                sx={{
                  backgroundColor: "#087619",
                  "&:hover": { backgroundColor: "#065412" },
                  textTransform: "none",
                  width: { xs: "100%", sm: "200px" },
                  height: { xs: 40, sm: 36 },
                  fontWeight: "bold",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  margin: "0 auto", // Centraliza o botão
                  display: "block", // Garante que o margin auto funcione
                }}
              >
                Iniciar Scanner
              </Button>
            )}
          </Box>

          {/* Novo Bloco para Colar Token */}
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
              Colar Token Manualmente
            </Typography>
            <Stack spacing={2} direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="center">
              <TextField
                label="Token do QR Code"
                variant="outlined"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: "300px" },
                  "& .MuiInputBase-root": { height: { xs: 40, sm: 36 } },
                  "& .MuiInputLabel-root": {
                    transform: "translate(14px, 7px) scale(1)",
                    "&.Mui-focused, &.MuiInputLabel-shrink": {
                      transform: "translate(14px, -6px) scale(0.75)",
                      color: "#000000",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#000000",
                  },
                }}
              />
            </Stack>
          </Box>
          {/* Botão Registrar movido para fora dos blocos, mas ainda dentro da aba 1 */}
          <Button
            variant="contained"
            startIcon={<ContentPaste />}
            onClick={handleTokenSubmit}
            sx={{
              backgroundColor: "#087619",
              "&:hover": { backgroundColor: "#065412" },
              textTransform: "none",
              width: { xs: "100%", sm: "200px" },
              height: { xs: 40, sm: 36 },
              fontWeight: "bold",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              margin: "20px auto", // Adiciona margem superior e centraliza
              display: "block", // Garante que o margin auto funcione
            }}
          >
            Registrar
          </Button>
        </>
      )}

      {tabValue === 2 && (
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ mb: 2 }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <FormControl sx={commonFormControlSx}>
                <InputLabel id="filter-status-label">Status</InputLabel>
                <StyledSelect
                  labelId="filter-status-label"
                  id="filter-status"
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={commonSelectSx}
                  MenuProps={commonMenuProps}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="presences">Presenças</MenuItem>
                  <MenuItem value="absences">Faltas</MenuItem>
                </StyledSelect>
              </FormControl>

              <FormControl sx={commonFormControlSx}>
                <InputLabel id="filter-period-label">Período</InputLabel>
                <StyledSelect
                  labelId="filter-period-label"
                  id="filter-period"
                  value={filterPeriod}
                  label="Período"
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  sx={commonSelectSx}
                  MenuProps={commonMenuProps}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="yesterday">Dia Anterior</MenuItem>
                  <MenuItem value="lastWeek">Última Semana</MenuItem>
                  <MenuItem value="lastMonth">Último Mês</MenuItem>
                  <MenuItem value="custom">Intervalo Personalizado</MenuItem>
                </StyledSelect>
              </FormControl>

              {filterPeriod === "custom" && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ flexShrink: 0 }}
                >
                  <TextField
                    label="Data Inicial"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    sx={{
                      minWidth: 150,
                      "& .MuiInputBase-root": { height: { xs: 40, sm: 36 } },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000000",
                      },
                    }}
                  />
                  <TextField
                    label="Data Final"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    sx={{
                      minWidth: 150,
                      "& .MuiInputBase-root": { height: { xs: 40, sm: 36 } },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.23)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#000000",
                      },
                    }}
                  />
                </Stack>
              )}
            </Stack>
          </Stack>

          <FrequenciesTable
            frequencies={filteredFrequencies}
            onUpload={handleUploadFrequency}
            search=""
            isFiltered={
              filterStatus !== "all" ||
              filterPeriod !== "all" ||
              (filterPeriod === "custom" && (customStartDate || customEndDate))
            }
            setAlert={setAlert}
          />

          {loading && <Typography align="center">Carregando frequências...</Typography>}
          
        </Box>
      )}

      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={handleAlertClose}
        />
      )}
    </Box>
  );
};

export default FrequencyList;

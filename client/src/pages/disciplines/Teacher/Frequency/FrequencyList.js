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
} from "@mui/material";
import { QrCodeScanner } from "@mui/icons-material";
import jsQR from "jsqr";
import api from "../../../../service/api";
import { CustomAlert } from "../../../../components/alert/CustomAlert";
import FrequenciesTable from "./FrequenciesTable";
import GenerateQRCode from "./GenerateQRCode";
import { StyledSelect } from "../../../../components/inputs/Input";

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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const commonStyles = {
    formControl: {
      width: { xs: "100%", sm: "200px" },
      "& .MuiInputBase-root": { height: { xs: 40, sm: 36 } },
      "& .MuiInputLabel-root": {
        transform: "translate(14px, 7px) scale(1)",
        "&.Mui-focused, &.MuiInputLabel-shrink": {
          transform: "translate(14px, -6px) scale(0.75)",
          color: "#000000",
        },
      },
    },
    select: {
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.23)" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#000000" },
    },
    menuProps: {
      PaperProps: {
        sx: {
          maxHeight: "200px",
          "& .MuiMenuItem-root": {
            "&:hover": { backgroundColor: "#D5FFDB" },
            "&.Mui-selected": { backgroundColor: "#E8F5E9", "&:hover": { backgroundColor: "#D5FFDB" } },
          },
        },
      },
    },
    dateInput: {
      minWidth: 150,
      "& .MuiInputBase-root": { height: { xs: 40, sm: 36 } },
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.23)" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#000000" },
    },
  };

  const fetchFrequencies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/frequency");
      const formattedData = response.data.map((freq) => ({
        id: freq.id,
        date: freq.date,
        displayDate: freq.date ? new Date(freq.date + "T00:00:00").toLocaleDateString("pt-BR") : "N/A",
        class: freq.disciplinaclasse?.name || "N/A",
        time: freq.time || "N/A",
        status: freq.status || "Presença",
      }));
      setFrequencies(formattedData);
    } catch (error) {
      console.error("Erro ao buscar frequências:", error);
      setAlert({ message: "Erro ao carregar as frequências.", type: "error" });
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
    if (filterStatus === "absences") filtered = filtered.filter((freq) => freq.status === "Falta");
    else if (filterStatus === "presences") filtered = filtered.filter((freq) => freq.status === "Presença");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filtered.filter((freq) => {
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
  };

  const handleUploadFrequency = async (frequencyItem) => {
    try {
      const response = await api.put(`/frequency/${frequencyItem.id}`, { status: frequencyItem.status });
      setAlert({ message: response.data.message, type: "success" });
      fetchFrequencies();
    } catch (error) {
      console.error("Erro ao atualizar frequência:", error);
      setAlert({ message: "Erro ao atualizar a frequência.", type: "error" });
    }
  };

  const handleScanQRCode = async (data) => {
    if (!data) return;
    try {
      const token = JSON.parse(data).token;
      const position = await navigator.geolocation.getCurrentPositionAsync();
      const { latitude, longitude } = position.coords;
      const userId = "1"; // Replace with authenticated user ID
      const response = await api.post("/frequency/scan", { token, userId, latitude, longitude });
      setAlert({ message: response.data.message, type: "success" });
      setShowQrScanner(false);
      fetchFrequencies();
    } catch (error) {
      console.error("Erro ao escanear QR Code:", error);
      setAlert({
        message: error.response?.data?.error || "Erro ao registrar frequência via QR Code.",
        type: "error",
      });
      setShowQrScanner(false);
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
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
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
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
  };

  const filteredFrequencies = applyFilters(frequencies);

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: "bold", my: 2 }}>
        Frequências
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{
          mb: 2,
          "& .MuiTab-root": { textTransform: "none", fontWeight: "bold", fontSize: { xs: "0.9rem", sm: "1rem" }, color: "rgba(0, 0, 0, 0.6)" },
          "& .Mui-selected": { color: "#087619" },
          "& .MuiTabs-indicator": { backgroundColor: "#087619" },
        }}
      >
        <Tab label="Gerar QR Code" />
        <Tab label="Escanear QR Code" />
        <Tab label="Frequências" />
      </Tabs>

      {tabValue === 0 && <GenerateQRCode setAlert={setAlert} />}

      {tabValue === 1 && (
        <Box sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.12)", borderRadius: "4px", bgcolor: "#fff", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Escanear QR Code
          </Typography>
          {showQrScanner ? (
            <Box sx={{ textAlign: "center" }}>
              <video ref={videoRef} style={{ width: "100%", maxWidth: "300px", mx: "auto" }} />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <Button variant="outlined" onClick={stopQrScanner} sx={{ mt: 1 }}>
                Cancelar
              </Button>
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
                fontSize: { xs: "0.9rem", sm: "1rem" },
                mx: "auto",
                display: "block",
              }}
            >
              Iniciar Scanner
            </Button>
          )}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
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
          <FrequenciesTable
            frequencies={filteredFrequencies}
            onUpload={handleUploadFrequency}
            search=""
            isFiltered={filterStatus !== "all" || filterPeriod !== "all" || (filterPeriod === "custom" && (customStartDate || customEndDate))}
            setAlert={setAlert}
          />
          {loading && <Typography align="center">Carregando frequências...</Typography>}
        </Box>
      )}

      {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
    </Box>
  );
};

export default FrequencyList;
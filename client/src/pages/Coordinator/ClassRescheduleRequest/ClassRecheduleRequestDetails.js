import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CssBaseline,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import { ArrowBack, School, Check, Close, Description, History, ErrorOutline } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import CustomAlert from "../../../components/alert/CustomAlert";

const ClassRescheduleRequestDetails = ({ setAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const accessType = localStorage.getItem("accessType") || "";
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const handleButtonClick = (action) => {
    setAlertMessage(`Funcionalidade de ${action} em desenvolvimento. VAMOS QUERER?`);
    setAlertType("info");
    setAlertOpen(true);
  };

  const cardData = state || {
    title: "Anteposição",
    teacher: "N/A",
    date: "N/A",
    discipline: "N/A",
    class: "N/A",
    shift: "N/A",
    time: "N/A",
    weekday: "N/A",
    observations: "",
  };

  return (
    <Box display="flex">
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />

      <Box sx={{ flexGrow: 1, p: 4, mt: 4 }}>
        <Box
          sx={{
            position: "relative",
            alignItems: "center",
            gap: 1,
            mb: 3,
          }}
        >
          <IconButton
            onClick={() => navigate("/class-reschedule-request")}
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <ArrowBack sx={{ color: "green", fontSize: "2.2rem" }} />
          </IconButton>
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: "bold", mt: 2 }}
          >
            Detalhes de Solicitação de {cardData.title}
          </Typography>
        </Box>

        {/* Reposição / Anteposição */}
        <Box
          component={Paper}
          elevation={3}
          sx={{ p: 5, m: 4, borderRadius: 3 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Description sx={{ fontSize: "33px", color: "green" }} />
            <Typography variant="h5" color="green">
              {cardData.title}
            </Typography>
          </Box>

          <Divider sx={{ backgroundColor: "#C7C7C7", my: 2 }} />

          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Professor(a):</strong> {cardData.teacher || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Disciplina:</strong> {cardData.discipline || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Turma:</strong> {cardData.class || "N/A"}
            </Typography>
          </Box>
        </Box>

        {/* Horário */}
        <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }} >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Box
              sx={{
                backgroundColor: "green",
                borderRadius: "50%",
                width: 35,
                height: 35,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <History sx={{ color: "white", fontSize: 27 }} />
            </Box>
            <Typography variant="h5" color="green">
              Horário
            </Typography>
          </Box>

          <Divider sx={{ backgroundColor: "#C7C7C7", my: 2 }} />

          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Data:</strong> {cardData.date || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Turno:</strong> {cardData.shift || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Horário:</strong> {cardData.time || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Dia da semana:</strong> {cardData.weekday || "N/A"}
            </Typography>
          </Box>
        </Box>

        {/* Observações */}
        <Box
          component={Paper}
          elevation={3}
          sx={{ p: 5, m: 4, borderRadius: 3 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: "green",
                  borderRadius: "50%",
                  width: 35,
                  height: 35,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography 
                  component="span" 
                  sx={{ 
                    color: "#fff", 
                    fontSize: "24px", 
                    fontWeight: "bold",
                    lineHeight: 0.7
                  }}
                >
                  !
                </Typography>
              </Box>
            <Typography variant="h5" color="green">
              Observações
            </Typography>
          </Box>

          <Divider sx={{ backgroundColor: "#C7C7C7", my: 2 }} />

          <Typography variant="body1" color={cardData.observations ? "#000" : "text.secondary"}>
            {cardData.observations || "Nenhuma observação adicionada"}
          </Typography>
        </Box>

        {accessType === "Coordenador" && (
          <Box
            sx={{ display: "flex", justifyContent: "center", mt: 2, mr: 4, gap: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<Close />}
              onClick={() => handleButtonClick("Rejeitar")}
              sx={{
                width: "fit-content",
                minWidth: 100,
                padding: { xs: "8px 20px", sm: "8px 28px" },
                backgroundColor: "#d32f2f",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#fff",
                "&:hover": { backgroundColor: "#b71c1c" },
              }}
            >
              Rejeitar
            </Button>
            <Button
              variant="contained"
              startIcon={<Check />}
              onClick={() => handleButtonClick("Validar")}
              sx={{
                width: "fit-content",
                minWidth: 100,
                padding: { xs: "8px 20px", sm: "8px 28px" },
                backgroundColor: "#087619",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#fff",
                "&:hover": { backgroundColor: "#066915" },
              }}
            >
              Validar
            </Button>
          </Box>
        )}
        {alertOpen && (
          <CustomAlert
            message={alertMessage}
            type={alertType}
            onClose={handleAlertClose}
          />
        )}
      </Box>
    </Box>
  );
};

export default ClassRescheduleRequestDetails;
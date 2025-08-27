import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CssBaseline,
  IconButton,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, Close, Check } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../../components/SideBar";
import api from "../../../../service/api";
import { CustomAlert } from "../../../../components/alert/CustomAlert";

const JustificationList = ({ setAuthenticated }) => {
  const navigate = useNavigate();
  const [justifications, setJustifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
	const [alert, setAlert] = useState(null);
  const accessType = localStorage.getItem("accessType") || "";

  const greenPrimary = "#087619";
  const greenLight = "#E8F5E9";
  const greyBorder = "#C7C7C7";
  const darkGreen = "#066915";

  const fetchJustifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Usuário não autenticado.");
      }

      const response = await api.get("/justifications-by-turn", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API Response:", response.data);

      setJustifications(response.data.justifications || []);
      setError(null);
    } catch (error) {
      console.error("Erro ao buscar justificativas:", error);
      setError(
        error.response?.data?.error || "Erro ao carregar justificativas."
      );
      setJustifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (attendanceId) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/attendance/update-status/${attendanceId}`,
        { status: "Abonada" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJustifications((prev) =>
        prev.filter((j) => j.attendance.id !== attendanceId)
      );
      setAlert({
        message: "Justificativa aceita com sucesso.",
        type: "success",
      });
      setTimeout(() => setAlert(null), 3000); // Auto-dismiss after 3 seconds
    } catch (error) {
      console.error("Erro ao aceitar justificativa:", error);
      setAlert({
        message: error.response?.data?.error || "Erro ao aceitar justificativa.",
        type: "error",
      });
    }
  };

  const handleReject = async (attendanceId) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/attendance/update-status/${attendanceId}`,
        { status: "Rejeitada" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJustifications((prev) =>
        prev.filter((j) => j.attendance.id !== attendanceId)
      );
      setAlert({
        message: "Justificativa rejeitada com sucesso.",
        type: "success",
      });
      setTimeout(() => setAlert(null), 3000); // Auto-dismiss after 3 seconds
    } catch (error) {
      console.error("Erro ao rejeitar justificativa:", error);
      setAlert({
        message: error.response?.data?.error || "Erro ao rejeitar justificativa.",
        type: "error",
      });
    }
  };

	const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    fetchJustifications();
  }, []);

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
            onClick={() => navigate("/teacher-absences/options")}
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <ArrowBack sx={{ color: greenPrimary, fontSize: "2.2rem" }} />
          </IconButton>
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: "bold", mt: 2 }}
          >
            Justificativas de Faltas
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress sx={{ color: greenPrimary }} />
          </Box>
        ) : error ? (
          <Typography variant="body1" color="error" align="center">
            {error}
          </Typography>
        ) : justifications.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center">
            Nenhuma justificativa encontrada.
          </Typography>
        ) : (
          justifications.map((justification) => (
            <Box
              key={justification.attendance.id}
              component={Paper}
              elevation={3}
              sx={{ p: 5, m: 4, borderRadius: 3 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    backgroundColor: greenPrimary,
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
                    sx={{ color: "#fff", fontSize: "24px", fontWeight: "bold", lineHeight: 0.7 }}
                  >
                    !
                  </Typography>
                </Box>
                <Typography variant="h5" color={greenPrimary}>
                  Justificativa
                </Typography>
              </Box>

              <Divider sx={{ backgroundColor: greyBorder, my: 2 }} />

              <Typography variant="body1" sx={{ mb: 1, color: "#333" }}>
                <strong>Professor(a):</strong> {justification.professor_name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, color: "#333" }}>
                <strong>Data:</strong>{" "}
                {justification.attendance.date
                  ? new Date(justification.attendance.date + "T00:00:00").toLocaleDateString("pt-BR")
                  : "N/A"}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, color: "#333" }}>
                <strong>Turno:</strong> {justification.turn || "N/A"}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: "#333" }}>
                <strong>Motivo:</strong> {justification.attendance.justification || "N/A"}
              </Typography>

              {accessType !== "Professor" && (
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={() => handleReject(justification.attendance.id)}
										startIcon={<Close />}
                    sx={{
                      width: "fit-content",
                      minWidth: 100,
                      padding: { xs: "8px 20px", sm: "8px 28px" },
                      backgroundColor: "#FF0000",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: "bold",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#CC0000" },
                    }}
                  >
                    Rejeitar
                  </Button>
									<Button
                    variant="contained"
                    onClick={() => handleAccept(justification.attendance.id)}
										startIcon={<Check />}
                    sx={{
                      width: "fit-content",
                      minWidth: 100,
                      padding: { xs: "8px 20px", sm: "8px 28px" },
                      backgroundColor: greenPrimary,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: "bold",
                      color: "#fff",
                      "&:hover": { backgroundColor: darkGreen },
                    }}
                  >
                    Validar
                  </Button>
                </Box>
              )}
            </Box>
          ))
        )}
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

export default JustificationList;
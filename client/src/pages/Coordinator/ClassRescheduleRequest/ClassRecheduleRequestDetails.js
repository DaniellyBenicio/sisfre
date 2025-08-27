import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CssBaseline,
  IconButton,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ArrowBack, Description, Check, Close, AttachFile } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import CustomAlert from "../../../components/alert/CustomAlert";
import JustificationModal from "./JustificationModal";
import api from "../../../service/api";

const ClassRescheduleRequestDetails = ({ setAuthenticated }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const accessType = localStorage.getItem("accessType") || "";
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [openDialog, setOpenDialog] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchRequestDetails = async () => {
    try {
      const response = await api.get(`/request/${id}`);
      setRequestData(response.data.request);
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error.response?.data || error.message);
      setAlertMessage("Erro ao buscar detalhes da solicitação.");
      setAlertType("error");
      setAlertOpen(true);
    }
  };

  useEffect(() => {
    if (!id) {
      setAlertMessage("ID da solicitação não fornecido.");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }
    fetchRequestDetails();
  }, [id]);

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const handleValidateClick = async () => {
    try {
      const route = requestData.type === "anteposicao" ? `/request/anteposition/${id}` : `/request/reposition/${id}`;
      await api.put(route, { requestId: id });
      setAlertMessage("Solicitação aprovada com sucesso!");
      setAlertType("success");
      setAlertOpen(true);
      fetchRequestDetails();
      setTimeout(() => navigate("/class-reschedule-request"), 1000);
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error.response?.data || error.message);
      setAlertMessage("Erro ao aprovar a solicitação.");
      setAlertType("error");
      setAlertOpen(true);
    }
  };

  const handleRejectClick = () => {
    setOpenDialog(true);
  };

  const handleSubmitJustification = async (justification) => {
    try {
      const route = requestData.type === "anteposicao" ? `/request/negate/anteposition/${id}` : `/request/negate/reposition/${id}`;
      await api.put(route, { requestId: id, observationCoordinator: justification });
      console.log("Rejeição enviada com justificativa:", justification);
      setAlertMessage("Solicitação rejeitada com sucesso!");
      setAlertType("success");
      setAlertOpen(true);
      setOpenDialog(false);
      fetchRequestDetails();
      setTimeout(() => navigate("/class-reschedule-request"), 1000);
    } catch (error) {
      console.error("Erro ao rejeitar solicitação:", error.response?.data || error.message);
      setAlertMessage("Erro ao rejeitar a solicitação: " + (error.response?.data?.error || error.message));
      setAlertType("error");
      setAlertOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const cardData = requestData
    ? {
      title: requestData.type === "anteposicao" ? "Anteposição" : "Reposição",
      teacher: requestData.professor?.username || "N/A",
      date: requestData.date
        ? new Date(`${requestData.date}T00:00:00`).toLocaleDateString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        })
        : "N/A",
      discipline: requestData.discipline || "N/A",
      class: requestData.acronym && requestData.semester ? `${requestData.acronym} - ${requestData.semester}` : "N/A",
      quantity: requestData.quantity || "N/A",
      time: requestData.hour || "N/A",
      observations: requestData.observation || "",
      observationCoordinator: requestData.observationCoordinator || "",
      validated: requestData.validated,
      annex: requestData.annex ? requestData.annex.split("/").pop() : "N/A",
    }
    : {
      title: "N/A",
      teacher: "N/A",
      date: "N/A",
      discipline: "N/A",
      class: "N/A",
      quantity: "N/A",
      time: "N/A",
      observations: "",
      observationCoordinator: "",
      validated: null,
      annex: "N/A",
    };

  return (
    <Box display="flex">
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
      <Box sx={{ flexGrow: 1, p: 4, mt: 4 }}>
        <Box sx={{ position: "relative", alignItems: "center", gap: 1, mb: 3 }}>
          {!isMobile && (
            <IconButton
              onClick={() => navigate("/class-reschedule-request")}
              sx={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }}
            >
              <ArrowBack sx={{ color: "green", fontSize: "2.2rem" }} />
            </IconButton>
          )}
          <Typography variant="h5" align="center" sx={{ fontWeight: "bold", mt: 2 }}>
            Detalhes de Solicitação de {cardData.title}
          </Typography>
        </Box>

        <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Description sx={{ fontSize: "33px", color: "green" }} />
            <Typography variant="h5" color="green">{cardData.title}</Typography>
          </Box>
          <Divider sx={{ backgroundColor: "#C7C7C7", my: 2 }} />
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Professor(a):</strong> {cardData.teacher}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Disciplina:</strong> {cardData.discipline}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Turma:</strong> {cardData.class}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Quantidade de Aulas:</strong> {cardData.quantity}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Data:</strong> {cardData.date}
            </Typography>
          </Box>
        </Box>

        <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
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
              <AttachFile sx={{ color: "white", fontSize: 25 }} />
            </Box>
            <Typography variant="h5" color="green">
              Anexo
            </Typography>
          </Box>
          <Divider sx={{ backgroundColor: "#C7C7C7", my: 2 }} />
          <Typography variant="body1">
            {cardData.annex && cardData.annex !== "N/A" ? (
              <>
                {(() => {
                  let annexArray = [];
                  try {
                    annexArray = JSON.parse(cardData.annex);
                  } catch {
                    annexArray = [cardData.annex];
                  }
                  return annexArray.map((filePath, idx) => {
                    const fileName = filePath.split(/[\\/]/).pop();
                    return (
                      <div key={idx}>
                        <a
                          href={`http://localhost:3000/${filePath.replace(/\\/g, "/")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#2653e7ff",
                            textDecoration: "underline",
                            fontWeight: "bold",
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          Abrir Anexo
                        </a>
                      </div>
                    );
                  });
                })()}
              </>
            ) : (
              "Nenhum anexo adicionado"
            )}
          </Typography>
        </Box>

        <Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
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
                sx={{ color: "#fff", fontSize: "24px", fontWeight: "bold", lineHeight: 0.7 }}
              >
                !
              </Typography>
            </Box>
            <Typography variant="h5" color="green">
              Observações
            </Typography>
          </Box>
          <Divider sx={{ backgroundColor: "#C7C7C7", my: 2 }} />
          <Typography
            variant="body1"
            color={cardData.observations ? "#000" : "text.secondary"}
          >
            {cardData.observations || "Nenhuma observação adicionada"}
          </Typography>
          {cardData.observationCoordinator && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Justificativa do Coordenador:</strong>{" "}
              {cardData.observationCoordinator}
            </Typography>
          )}
        </Box>

        {accessType === "Coordenador" && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mr: 4, gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Close />}
              onClick={handleRejectClick}
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
              onClick={handleValidateClick}
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

        <JustificationModal
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmitJustification}
        />
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
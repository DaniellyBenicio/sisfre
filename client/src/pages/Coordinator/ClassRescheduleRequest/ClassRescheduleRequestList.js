import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MailOutline, ArrowForward, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Paginate from "../../../components/paginate/Paginate";
import api from "../../../service/api";

const ClassRecheduleRequestList = ({ setAuthenticated }) => {
  const navigate = useNavigate();
  const accessType = localStorage.getItem("accessType") || "";
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const itemsPerPage = 6;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get("/request", {
          params: {
            validated: false,
            observationCoordinator: "null",
          },
        });
        setRequests(response.data.requests);
      } catch (error) {
        console.error("Erro ao buscar solicitações:", error);
      }
    };
    fetchRequests();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formattedRequests = requests
    .filter(
      (request) =>
        !request.validated &&
        (!request.observationCoordinator || request.observationCoordinator.trim() === "")
    )
    .map((request) => ({
      id: request.id,
      title: request.type === "reposicao" ? "Reposição" : "Anteposição",
      teacher: request.professor?.username || "Desconhecido",
      date: formatDate(request.createdAt),
      discipline: request.discipline || "N/A",
      class: request.disciplinaclasse?.classCode || "N/A",
      shift: request.disciplinaclasse?.shift || "N/A",
      time: request.disciplinaclasse?.time || "N/A",
      weekday: new Date(request.date).toLocaleDateString("pt-BR", { weekday: "long" }) || "N/A",
      observations: request.observation || "",
    }));

  const handleCardClick = (option) => {
    const targetPath = accessType === "Admin" && option.adminPath ? option.adminPath : option.path;
    navigate(targetPath);
  };

  const totalItems = formattedRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedList = formattedRequests.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleBackClick = () => {
    navigate("/teachers-management/options");
  };

  const handleDetailsClick = (e, option) => {
    e.stopPropagation();
    navigate(`/class-reschedule-request/details/${option.id}`);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      <Box
        padding={3}
        sx={{
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {!isMobile && (
          <Box
            sx={{
              position: "absolute",
              left: 40,
              top: 68,
              zIndex: 10,
              cursor: "pointer",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "scale(1.2)",
              },
            }}
            onClick={handleBackClick}
          >
            <ArrowBack sx={{ fontSize: "2.2rem", color: "#087619" }} />
          </Box>
        )}
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            mt: "40px",
          }}
        >
          Solicitações de Anteposição e Reposição
        </Typography>

        {formattedRequests.length === 0 ? (
          <Typography
            variant="h6"
            sx={{
              color: "#555",
              textAlign: "center",
              mt: 4,
            }}
          >
            Não Há Solicitações.
          </Typography>
        ) : (
          <>
            <Grid
              container
              spacing={5}
              justifyContent="center"
              sx={{
                width: "100%",
                overflow: "visible",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {paginatedList.map((option) => (
                <Grid item xs={12} sm={6} md={4} key={option.id}>
                  <Card
                    sx={{
                      width: { xs: 300, sm: 300 },
                      height: { xs: 250, sm: 300 },
                      backgroundColor: "#FFFFFF",
                      boxShadow:
                        "0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textAlign: "center",
                      borderRadius: 3,
                      border: "2px solid #087619",
                      position: "relative",
                      overflow: "visible",
                      transition: "all 0.4s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-10px)",
                        boxShadow:
                          "0 10px 20px rgba(8, 118, 25, 0.3), 0 0 10px rgba(8, 118, 25, 0.5)",
                        border: "3px solid #0A8C1F",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: -2,
                        left: 0,
                        right: 0,
                        height: "10px",
                        backgroundColor: "#087619",
                        borderTopLeftRadius: "12px",
                        borderTopRightRadius: "12px",
                        zIndex: 1,
                        transition: "background-color 0.4s ease-in-out",
                        "&:hover": {
                          backgroundColor: "#0A8C1F",
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 35,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "center",
                        zIndex: 2,
                        transition: "transform 0.4s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.2)",
                        },
                      }}
                    >
                      <MailOutline sx={{ fontSize: 40, color: "#087619" }} />
                    </Box>
                    <CardActionArea
                      onClick={() => handleCardClick(option)}
                      sx={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        zIndex: 2,
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <CardContent
                        sx={{ padding: 0, transition: "transform 0.4s ease-in-out", flexGrow: 1 }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            wordWrap: "break-word",
                            color: "#087619",
                            mt: 11,
                            transition: "transform 0.4s ease-in-out, color 0.4s ease-in-out",
                            "&:hover": {
                              transform: "scale(1.05)",
                              color: "#0A8C1F",
                              fontSize: "1.3rem",
                            },
                          }}
                        >
                          {option.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            mt: 2,
                            color: "#333",
                          }}
                        >
                          Professor(a): {option.teacher}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 1,
                            color: "#555",
                          }}
                        >
                          Data: {option.date}
                        </Typography>
                      </CardContent>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 23,
                          display: "flex",
                          alignItems: "center",
                          transition: "transform 0.4s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                        onClick={(e) => handleDetailsClick(e, option)}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#087619",
                            fontWeight: "bold",
                            mr: 1,
                          }}
                        >
                          Detalhes
                        </Typography>
                        <ArrowForward sx={{ fontSize: 20, color: "#087619" }} />
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Paginate count={totalPages} page={page} onChange={handlePageChange} />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ClassRecheduleRequestList;
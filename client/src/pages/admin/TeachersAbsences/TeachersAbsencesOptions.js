import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CssBaseline,
  Badge,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SideBar";
import { EventBusy } from "@mui/icons-material";
import { ClipboardList } from "lucide-react";
import api from "../../../service/api";

const TeachersAbsencesOptions = ({ setAuthenticated }) => {
  const navigate = useNavigate();
  const [pendingJustificationsCount, setPendingJustificationsCount] = useState(0);

  const calendarOptions = [
    {
      title: "Faltas de Docentes",
      icon: <EventBusy sx={{ fontSize: 60, color: "#087619" }} />,
      path: "/teacher-absences",
    },
    {
      title: "Justificativas de Faltas",
      icon: <ClipboardList size={60} color="#087619" />,
      path: "/absences-justifications",
    },
  ];

  const fetchPendingJustifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não autenticado.");
        return;
      }

      const response = await api.get("/justifications-by-turn", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const justifications = response.data.justifications || [];
      console.log("Justificativas retornadas:", justifications);
      setPendingJustificationsCount(justifications.length);
    } catch (error) {
      console.error("Erro ao buscar justificativas pendentes:", error.response?.data || error.message);
      setPendingJustificationsCount(0);
    }
  };

  useEffect(() => {
    const accessType = localStorage.getItem("accessType");
    if (accessType === "Admin") {
      fetchPendingJustifications();
    }
  }, []);

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
      <Box
        sx={{
          width: "100%",
          padding: 3,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            mt: "40px",
          }}
        >
          Opções de Gestão de Faltas
        </Typography>

        <Grid
          container
          spacing={5}
          justifyContent="center"
          sx={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {calendarOptions.map((option, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  width: { xs: 300, sm: 300 },
                  height: { xs: 250, sm: 300 },
                  backgroundColor: "#FFFFFF",
                  boxShadow:
                    "0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
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
                    transition: "background-color 0.4s ease-in-out",
                    ".Card:hover &": {
                      backgroundColor: "#0A8C1F",
                    },
                  }}
                />
                {option.title === "Justificativas de Faltas" && pendingJustificationsCount > 0 && (
                  <Badge
                    badgeContent={pendingJustificationsCount}
                    color="error"
                    sx={{
                      position: "absolute",
                      top: -1,
                      right: 3,
                      zIndex: 1000,
                      "& .MuiBadge-badge": {
                        minWidth: 30,
                        height: 30,
                        borderRadius: "50%",
                        fontSize: "0.75rem",
                        padding: "0 4px",
                        border: "2px solid #FFFFFF",
                      },
                    }}
                  />
                )}
                <CardActionArea
                  onClick={() => handleCardClick(option.path)}
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 2,
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <CardContent sx={{ padding: 0 }}>
                    <Box
                      sx={{
                        mb: 2,
                        transition: "transform 0.4s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {option.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        wordWrap: "break-word",
                        color: "#087619",
                        transition: "color 0.4s ease-in-out",
                        "&:hover": {
                          color: "#0A8C1F",
                        },
                      }}
                    >
                      {option.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default TeachersAbsencesOptions;
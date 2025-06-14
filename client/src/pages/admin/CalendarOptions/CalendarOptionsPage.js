import React from "react";
import {
  Box,
  CssBaseline,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { CalendarToday, Event, PublicOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SideBar";

const CalendarOptionsPage = ({ setAuthenticated }) => {
  const navigate = useNavigate();

  const calendarOptions = [
    {
      title: "Gerenciar Calendário",
      icon: <CalendarToday sx={{ fontSize: 50, color: "#087619" }} />,
      path: "/calendar",
    },
    {
      title: "Sábado Letivo",
      icon: <Event sx={{ fontSize: 50, color: "#087619" }} />,
      path: "/saturday",
    },
    {
      title: "Feriado",
      icon: <PublicOff sx={{ fontSize: 50, color: "#087619" }} />,
      path: "/holiday",
    },
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { xs: 0, sm: "240px" },
          mt: { xs: "64px", sm: 0 },
          width: "100%", // Garante 100% da largura
        }}
      >
        <Box
          padding={3}
          sx={{
            width: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Opções de Calendário
          </Typography>

          <Grid
            container
            spacing={4}
            justifyContent="center"
            sx={{
              width: "100%",
              overflow: "hidden", // Remove barra de rolagem
              display: "flex",
              flexWrap: "nowrap", // Impede que os cards quebrem para outra linha
            }}
          >
            {calendarOptions.map((option, index) => (
              <Grid item xs={4} key={index}>
                <Card
                  sx={{
                    width: 250, // Largura fixa de 250px
                    height: 250, // Altura fixa de 250px
                    backgroundColor: "#E8E8E8",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    borderRadius: 2,
                    boxShadow: 3,
                    transition: "0.3s",
                    "&:hover": {
                      backgroundColor: "#d4ecff",
                    },
                    flexShrink: 0, // Impede que os cards encolham
                  }}
                >
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
                    }}
                  >
                    <CardContent sx={{ padding: 0 }}>
                      <Box sx={{ mb: 2 }}>{option.icon}</Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          wordWrap: "break-word",
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
    </Box>
  );
};

export default CalendarOptionsPage;
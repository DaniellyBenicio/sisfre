import React from "react";
import { Box, Typography, Grid, Card } from "@mui/material";
import {
  SupervisedUserCircle,
  School,
  MenuBook,
  ReportProblem,
  Assignment,
  DonutLarge,
} from "@mui/icons-material";
import { createTheme } from "@mui/material/styles";
import { green, blue, orange, purple, red, grey } from "@mui/material/colors";

const customTheme = createTheme({
  palette: {
    primary: {
      main: green[700],
      light: green[100],
    },
    secondary: {
      main: blue[200],
      light: blue[50],
    },
    info: {
      main: orange[500],
      light: orange[100],
    },
    special: {
      main: purple[500],
      light: purple[100],
    },
    background: {
      default: grey[50],
      paper: "#FFFFFF",
    },
    text: {
      primary: grey[900],
      secondary: grey[600],
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
          },
        },
      },
    },
  },
});

const MetricCards = ({
  dashboardData,
  repositionAntepositionData,
  resolutionRate,
}) => {
  const cardMinHeight = 150;

  return (
    <Grid item xs={12} sx={{ mb: 4 }}>
      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        {/* Linha 1 de Cards */}
        <Grid item xs={12}>
          <Grid container spacing={4} justifyContent="center">
            {/* Card de Usuários */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  minHeight: cardMinHeight,
                  backgroundColor: customTheme.palette.background.paper,
                }}
              >
                <Box mr={3}>
                  <SupervisedUserCircle
                    sx={{
                      fontSize: 60,
                      color: customTheme.palette.primary.main,
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.secondary"
                    noWrap
                  >
                    Total de Usuários
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {dashboardData?.totalUsers || 0}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Card de Cursos */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  minHeight: cardMinHeight,
                  backgroundColor: customTheme.palette.background.paper,
                }}
              >
                <Box mr={3}>
                  <School
                    sx={{ fontSize: 60, color: customTheme.palette.info.main }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.secondary"
                    noWrap
                  >
                    Total de Cursos
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {dashboardData?.totalCourses || 0}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Card de Disciplinas */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  minHeight: cardMinHeight,
                  backgroundColor: customTheme.palette.background.paper,
                }}
              >
                <Box mr={3}>
                  <MenuBook
                    sx={{
                      fontSize: 60,
                      color: customTheme.palette.secondary.main,
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.secondary"
                    noWrap
                  >
                    Total de Disciplinas
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {dashboardData?.totalDisciplines || 0}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Linha 2 de Cards */}
        <Grid item xs={12}>
          <Grid container spacing={4} justifyContent="center" mt={0}>
            {/* Card de Faltas */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  minHeight: cardMinHeight,
                  backgroundColor: customTheme.palette.background.paper,
                }}
              >
                <Box mr={3}>
                  <ReportProblem sx={{ fontSize: 60, color: red[500] }} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.secondary"
                    noWrap
                  >
                    Total de Faltas
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {dashboardData?.totalAbsences || 0}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Card de Requisições */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  minHeight: cardMinHeight,
                  backgroundColor: customTheme.palette.background.paper,
                }}
              >
                <Box mr={3}>
                  <Assignment
                    sx={{
                      fontSize: 60,
                      color: customTheme.palette.special.main,
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.secondary"
                    noWrap
                  >
                    Total de Requisições
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {repositionAntepositionData
                      ? repositionAntepositionData.repositions +
                        repositionAntepositionData.antepositions
                      : 0}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Card de Taxa de Resolução */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  minHeight: cardMinHeight,
                  backgroundColor: customTheme.palette.background.paper,
                }}
              >
                <Box mr={3}>
                  <DonutLarge
                    sx={{
                      fontSize: 60,
                      color: customTheme.palette.primary.main,
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.secondary"
                    noWrap
                  >
                    Taxa de Resolução
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {resolutionRate}%
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MetricCards;

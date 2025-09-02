import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CssBaseline,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import { createTheme, ThemeProvider } from "@mui/material/styles";

import { green, blue, orange, purple, grey, red } from "@mui/material/colors";
import React, { useState, useEffect } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import MetricCards from "./MetricCards.js";
import Sidebar from "../../../components/SideBar.js";
import api from "../../../service/api";
import PieCharts from "./PieCharts.js";
import BarCharts from "./BarCharts.js";
import AbsenceReports from "./AbsenceReports.js";

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
    typography: {
      h4: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 600,
      },
    },
  },
});

const Reports = ({ setAuthenticated }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [coursesList, setCoursesList] = useState([]);
  const [disciplinesByCourse, setDisciplinesByCourse] = useState([]);
  const [teacherAbsences, setTeacherAbsences] = useState([]);
  const [absencesByCourse, setAbsencesByCourse] = useState([]);
  const [repositionAntepositionData, setRepositionAntepositionData] =
    useState(null);
  const [resolutionRate, setResolutionRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyAbsences, setMonthlyAbsences] = useState([]);
  const [absencesByShift, setAbsencesByShift] = useState([]);
  const [requestsStatus, setRequestsStatus] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const accessType = localStorage.getItem("accessType");
        if (accessType !== "Admin") {
          throw new Error(
            "Você não tem permissão para visualizar esta página."
          );
        }

        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        const [
          usersResponse,
          coursesResponse,
          disciplinesResponse,
          disciplinesByCourseResponse,
          absencesResponse,
          absencesByCourseResponse,
          repositionAntepositionResponse,
          resolutionRateResponse,
          monthlyAbsencesResponse,
          absencesByShiftResponse,
          requestsStatusResponse,
        ] = await Promise.all([
          api.get("/users/all", { headers }),
          api.get("/courses", { headers, params: { limit: 1000 } }),
          api.get("/disciplines", { headers }),
          api.get("/reports/courses/disciplines-count", { headers }),
          api.get("/reports/absences/teacher-count", { headers }),
          api.get("/reports/absences/course-count", { headers }),
          api.get("/reports/reposition-anteposition-counts", { headers }),
          api.get("/reports/resolution-rate", { headers }),
          api.get("/reports/monthly-absences", { headers }),
          api.get("/reports/absences-by-shift", { headers }),
          api.get("/reports/requests/status", { headers }),
        ]);

        const users = usersResponse.data.users;
        const totalUsers = users.length;
        const activeUsers = users.filter((user) => user.isActive).length;
        const inactiveUsers = users.filter((user) => !user.isActive).length;
        const usersData = [
          { name: "Ativos", value: activeUsers },
          { name: "Inativos", value: inactiveUsers },
        ];

        const courses = coursesResponse.data.courses;
        const totalCourses = courses.length;
        setCoursesList(courses);
        const courseTypes = courses.reduce((acc, course) => {
          const type = course.type || "Desconhecido";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        const coursesData = Object.entries(courseTypes).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        const totalDisciplines = disciplinesResponse.data.total;

        const sortedDisciplinesByCourse = disciplinesByCourseResponse.data.sort(
          (a, b) => b.acronym.length - a.acronym.length
        );
        setDisciplinesByCourse(sortedDisciplinesByCourse);

        const totalAbsences = absencesResponse.data.reduce(
          (sum, item) => sum + item.count,
          0
        );
        setTeacherAbsences(absencesResponse.data);

        const absencesData = absencesByCourseResponse.data;
        setAbsencesByCourse(absencesData);

        const repAntData = repositionAntepositionResponse.data;
        setRepositionAntepositionData(repAntData);

        const resolvedRate = parseFloat(
          resolutionRateResponse.data.resolutionRate
        ).toFixed(2);
        setResolutionRate(resolvedRate);

        setMonthlyAbsences(monthlyAbsencesResponse.data.data);
        setAbsencesByShift(absencesByShiftResponse.data);
        setRequestsStatus(requestsStatusResponse.data.requestsStatus);

        setDashboardData({
          usersData,
          coursesData,
          totalCourses,
          totalUsers,
          totalDisciplines,
          totalAbsences,
        });
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar dados do painel:", err);
        setError(
          err.response?.data?.error ||
            "Falha ao carregar dados do painel. Por favor, tente novamente."
        );
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <CircularProgress color="primary" />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <Alert severity="error">{error}</Alert>
        </Box>
      );
    }

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;

        const label =
          data.course || data.status || data.acronym || data.name || "N/A";

        const getValueOrDefault = (val) =>
          val !== null && val !== undefined ? val : 0;

        const value =
          getValueOrDefault(data.totalDisciplines) ||
          getValueOrDefault(data.count) ||
          getValueOrDefault(data.value);

        return (
          <Box
            sx={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {label}
            </Typography>
            <Typography variant="body2">{`Quantidade: ${value}`}</Typography>
            {data.percent && (
              <Typography variant="body2">{`Porcentagem: ${(
                data.percent * 100
              ).toFixed(2)}%`}</Typography>
            )}
          </Box>
        );
      }
      return null;
    };

    return (
      <Grid container spacing={4} mt={4} justifyContent="center">
        {/* === CONTAINER PARA TODOS OS CARDS DE MÉTRICAS === */}
        <MetricCards
          dashboardData={dashboardData}
          repositionAntepositionData={repositionAntepositionData}
          resolutionRate={resolutionRate}
        />
        {/* --- CONTAINER PARA TODOS OS GRÁFICOS DE PIZZA --- */}
        <PieCharts
          dashboardData={dashboardData}
          repositionAntepositionData={repositionAntepositionData}
        />
        {/* Componente externo para os gráficos de barra */}
        <BarCharts
          requestsStatus={requestsStatus}
          disciplinesByCourse={disciplinesByCourse}
          customTheme={customTheme}
          CustomTooltip={CustomTooltip}
        />
        {/* Novo componente para todos os relatórios de faltas */}
        <AbsenceReports
          monthlyAbsences={monthlyAbsences}
          absencesByShift={absencesByShift}
          absencesByCourse={absencesByCourse}
          teacherAbsences={teacherAbsences}
          customTheme={customTheme}
        />
      </Grid>
    );
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Sidebar setAuthenticated={setAuthenticated} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "background.default",
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            mt={4}
            mb={2}
            align="center"
            color="primary"
          >
            Painel Administrativo
          </Typography>
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Reports;

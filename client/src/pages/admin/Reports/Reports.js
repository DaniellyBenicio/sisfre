import React, { useState, useEffect } from "react";
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
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Sidebar from "../../../components/SideBar";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { green, grey, blue, orange, purple } from "@mui/material/colors";
import api from "../../../service/api";

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

const COLORS = [
  green[500],
  blue[300],
  grey[400],
  grey[600],
  green[300],
  blue[500],
];

const Reports = ({ setAuthenticated }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [coursesList, setCoursesList] = useState([]);
  const [disciplinesByCourse, setDisciplinesByCourse] = useState([]);
  const [teacherAbsences, setTeacherAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const usersResponse = await api.get("/users/all", { headers });
        const users = usersResponse.data.users;
        const totalUsers = users.length;
        const activeUsers = users.filter((user) => user.isActive).length;
        const inactiveUsers = users.filter((user) => !user.isActive).length;
        const usersData = [
          { name: "Ativos", value: activeUsers },
          { name: "Inativos", value: inactiveUsers },
        ];

        const coursesResponse = await api.get("/courses", {
          headers,
          params: { limit: 1000 },
        });
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

        const disciplinesResponse = await api.get("/disciplines", { headers });
        const totalDisciplines = disciplinesResponse.data.total;

        const disciplinesByCourseResponse = await api.get(
          "/reports/courses/disciplines-count",
          { headers }
        );
        const sortedDisciplinesByCourse = disciplinesByCourseResponse.data.sort(
          (a, b) => b.acronym.length - a.acronym.length
        );
        setDisciplinesByCourse(sortedDisciplinesByCourse);

        const absencesResponse = await api.get(
          "/reports/absences/teacher-count",
          { headers }
        );
        const totalAbsences = absencesResponse.data.reduce(
          (sum, item) => sum + item.count,
          0
        );
        setTeacherAbsences(absencesResponse.data);

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

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const fullCourseName = payload[0].payload.name;
        const disciplineCount = payload[0].value;
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
              {fullCourseName}
            </Typography>
            <Typography variant="body2">
              Total de Disciplinas: {disciplineCount}
            </Typography>
          </Box>
        );
      }
      return null;
    };

    return (
      <Grid container spacing={4} mt={4} justifyContent="center">
        {/* Agrupamento dos Cards de Métricas */}
        <Grid item xs={12}>
          <Grid container spacing={4} justifyContent="center">
            {/* Métrica de Total de Usuários */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  p: 2,
                  backgroundColor: customTheme.palette.secondary.light,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    align="center"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Total de Usuários
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    fontWeight="bold"
                    align="center"
                    color="primary"
                  >
                    {dashboardData?.totalUsers || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Métrica de Total de Cursos */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  p: 2,
                  backgroundColor: customTheme.palette.primary.light,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    align="center"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Total de Cursos
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    fontWeight="bold"
                    align="center"
                    color="primary"
                  >
                    {dashboardData?.totalCourses || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Métrica de Total de Disciplinas */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  p: 2,
                  backgroundColor: customTheme.palette.info.light,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    align="center"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Total de Disciplinas
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    fontWeight="bold"
                    align="center"
                    color="primary"
                  >
                    {dashboardData?.totalDisciplines || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Métrica de Total de Faltas */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  p: 2,
                  backgroundColor: customTheme.palette.special.light,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    align="center"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Total de Faltas
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    fontWeight="bold"
                    align="center"
                    color="primary"
                  >
                    {dashboardData?.totalAbsences || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Gráficos de Usuários e Cursos */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", p: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                align="center"
                fontWeight="bold"
                color="primary"
              >
                Usuários Ativos vs. Inativos
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={dashboardData?.usersData || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {dashboardData?.usersData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", p: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                align="center"
                fontWeight="bold"
                color="primary"
              >
                Distribuição de Cursos por Tipo
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={dashboardData?.coursesData || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {dashboardData?.coursesData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Barras Vertical para Disciplinas por Curso */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                align="center"
                fontWeight="bold"
                color="primary"
              >
                Total de Disciplinas por Curso
              </Typography>
              <ResponsiveContainer
                width="100%"
                height={Math.max(400, disciplinesByCourse.length * 40)}
              >
                <BarChart
                  data={disciplinesByCourse}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="acronym" />
                  <YAxis dataKey="totalDisciplines" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="totalDisciplines"
                    name="Total de Disciplinas"
                    fill={customTheme.palette.special.main}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela de Cursos Existentes */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                align="center"
                fontWeight="bold"
                color="primary"
              >
                Lista de Cursos
              </Typography>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="tabela de cursos">
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: customTheme.palette.primary.light,
                      }}
                    >
                      <TableCell>Nome do Curso</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {coursesList.map((course) => (
                      <TableRow key={course._id || course.id}>
                        <TableCell component="th" scope="row">
                          {course.name || "Sem nome"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* --- NOVA SEÇÃO ADICIONADA: Tabela de Faltas por Professor --- */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                align="center"
                fontWeight="bold"
                color="primary"
              >
                Faltas por Professor
              </Typography>
              <TableContainer component={Paper}>
                <Table aria-label="tabela de faltas por professor">
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: customTheme.palette.secondary.light,
                      }}
                    >
                      <TableCell>Professor</TableCell>
                      <TableCell align="right">Total de Faltas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teacherAbsences.length > 0 ? (
                      teacherAbsences.map((teacher, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            {teacher.name}
                          </TableCell>
                          <TableCell align="right">{teacher.count}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          Nenhuma falta de professor encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        {/* --- FIM DA NOVA SEÇÃO --- */}
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

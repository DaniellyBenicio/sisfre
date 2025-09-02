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
  LineChart,
  Line,
} from "recharts";
import Sidebar from "../../../components/SideBar";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { green, grey, blue, orange, purple, red } from "@mui/material/colors";
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


    const repositionAntepositionPieData = repositionAntepositionData
      ? [
          {
            name: "Reposições",
            value: repositionAntepositionData.repositions,
            color: blue[500],
          },
          {
            name: "Anteposições",
            value: repositionAntepositionData.antepositions,
            color: green[500],
          },
        ]
      : [];

    return (
      <Grid container spacing={4} mt={4} justifyContent="center">
        {/* === CONTAINER PARA TODOS OS CARDS DE MÉTRICAS === */}
        <Grid item xs={12}>
          <Grid container spacing={4} justifyContent="center">
            {/* Métrica de Total de Usuários */}
            <Grid item xs={12} sm={6} md={2}>
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
            <Grid item xs={12} sm={6} md={2}>
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
            <Grid item xs={12} sm={6} md={2}>
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

            {/* Métrica de Total de Faltas (Geral) */}
            <Grid item xs={12} sm={6} md={2}>
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

            {/* NOVO CARD: Total de Requisições (com a chamada correta) */}
            <Grid item xs={12} sm={6} md={2}>
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
                    Total de Requisições
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    fontWeight="bold"
                    align="center"
                    color="primary"
                  >
                    {repositionAntepositionData
                      ? repositionAntepositionData.repositions +
                        repositionAntepositionData.antepositions
                      : 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* NOVO CARD: Taxa de Resolução */}
            <Grid item xs={12} sm={6} md={2}>
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
                    Taxa de Resolução
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    fontWeight="bold"
                    align="center"
                    color="primary"
                  >
                    {resolutionRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* --- CONTAINER PARA TODOS OS GRÁFICOS DE PIZZA --- */}
        <Grid item xs={12}>
          <Grid container spacing={4} justifyContent="center">
            {/* Gráfico de Usuários */}
            <Grid item xs={12} md={4}>
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

            {/* Gráfico de Distribuição de Cursos */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", p: 2 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    align="center"
                    fontWeight="bold"
                    color="primary"
                  >
                    Distribuição de Cursos
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

            {/* Gráfico de Proporção de Requisições */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%", p: 2 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    align="center"
                    fontWeight="bold"
                    color="primary"
                  >
                    Proporção de Requisições
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={repositionAntepositionPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {repositionAntepositionPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* NOVO GRÁFICO: Gráfico de Barras para Status de Requisições */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: "100%" }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                align="center"
                fontWeight="bold"
                color="primary"
              >
                Status das Requisições
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={requestsStatus}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    name="Total de Requisições"
                    fill="#4caf50"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* NOVO GRÁFICO: Histórico de Faltas Mensais */}
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
                Histórico Mensal de Faltas
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={monthlyAbsences}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalAbsences"
                    name="Total de Faltas"
                    stroke={red[500]}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Barras para Faltas por Turno */}
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
                Faltas por Turno
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={absencesByShift}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="turno" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="total_faltas"
                    name="Total de Faltas"
                    fill={blue[500]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Barras para Disciplinas por Curso */}
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
                  layout="vertical"
                  data={disciplinesByCourse}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="totalDisciplines" />
                  <YAxis type="category" dataKey="acronym" />
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

        {/* Tabela de Faltas por Curso */}
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
                Total de Faltas por Curso
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={absencesByCourse}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="acronym" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="totalAbsences"
                    name="Total de Faltas"
                    fill={customTheme.palette.special.main}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela de Faltas por Professor */}
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

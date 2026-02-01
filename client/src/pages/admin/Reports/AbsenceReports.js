import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

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

import React from "react";
import { red, blue } from "@mui/material/colors";

const AbsenceReports = ({
  monthlyAbsences,
  absencesByShift,
  absencesByCourse,
  teacherAbsences,
  customTheme,
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
            {data.course || data.acronym || data.name || data.turno || "N/A"}
          </Typography>
          <Typography variant="body2">{`Quantidade: ${payload[0].value}`}</Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <>
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
                  name="Total"
                  stroke={red[500]}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, height: "100%" }}>
          <CardContent sx={{ overflow: "visible" }}>
            <Typography
              variant="h6"
              gutterBottom
              align="center"
              fontWeight="bold"
              color="primary"
            >
              Faltas por Turno
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={absencesByShift}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="turno" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="total_faltas"
                  name="Total"
                  fill={blue[500]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2, height: "100%" }}>
          <CardContent sx={{ overflow: "visible" }}>
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
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="totalAbsences"
                  name="Total "
                  fill={customTheme.palette.special.main}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

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
    </>
  );
};

export default AbsenceReports;

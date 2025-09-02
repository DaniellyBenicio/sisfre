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
  return (
    <>
      {/* GRÁFICO: Histórico de Faltas Mensais */}
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
                <Bar dataKey="total_faltas" name="Total" fill={blue[500]} />
              </BarChart>
            </ResponsiveContainer>
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
                  name="Total "
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
    </>
  );
};

export default AbsenceReports;

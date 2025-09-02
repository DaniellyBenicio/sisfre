import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import React from "react";
import { green, purple } from "@mui/material/colors";

const BarCharts = ({ requestsStatus, disciplinesByCourse, customTheme, CustomTooltip }) => {
  return (
    <>
      {/* GRÁFICO: Gráfico de Barras para Status de Requisições */}
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
                  fill={green[500]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* GRÁFICO: Gráfico de Barras para Disciplinas por Curso */}
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
                  fill={purple[500]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default BarCharts;
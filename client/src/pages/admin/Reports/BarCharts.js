import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
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

const BarCharts = ({
  requestsStatus,
  disciplinesByCourse,
  customTheme,
  CustomTooltip,
}) => {
  return (
    <>
      {/* GRÁFICO: Gráfico de Barras para Status de Requisições */}
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
              Status das Requisições
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={requestsStatus}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis type="number" dataKey="count" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Total"
                  fill={customTheme.palette.primary.main}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* GRÁFICO: Gráfico de Barras para Disciplinas por Curso - OTIMIZADO */}
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
              Total de Disciplinas por Curso
            </Typography>
            <ResponsiveContainer
              width="100%"
              height={Math.max(350, disciplinesByCourse.length * 40)}
            >
              <BarChart
                layout="vertical"
                data={disciplinesByCourse}
                margin={{ top: 20, right: 30, left: 30, bottom: 20 }} // Margem esquerda reduzida para 30
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="totalDisciplines" />
                <YAxis
                  type="category"
                  dataKey="acronym"
                  tick={{ fontSize: 12 }}
                  width={80} // Largura do eixo ajustada para 80
                  interval={0}
                  // padding={{ left: 10 }} REMOVIDO para evitar espaço extra
                />
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
    </>
  );
};

export default BarCharts;

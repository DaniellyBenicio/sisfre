import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { green, blue } from "@mui/material/colors";

const COLORS = [
  green[500],
  blue[300],
];

const PieCharts = ({ dashboardData, repositionAntepositionData }) => {
  const CustomTooltip = ({ active, payload }) => {
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
            {data.name}
          </Typography>
          <Typography variant="body2">{`Valor: ${data.value}`}</Typography>
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

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const percentageValue = (percent * 100).toFixed(0);

    if (percentageValue > 8) {
      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          fontWeight="bold"
          fontSize="14px"
        >
          {`${percentageValue}%`}
        </text>
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
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData?.usersData || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    isAnimationActive={true}
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {dashboardData?.usersData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "black" }}>{value}</span>
                    )}
                  />
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
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData?.coursesData || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    isAnimationActive={true}
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {dashboardData?.coursesData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "black" }}>{value}</span>
                    )}
                  />
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
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={repositionAntepositionPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    isAnimationActive={true}
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {repositionAntepositionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "black" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PieCharts;
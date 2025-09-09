import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { green, blue } from '@mui/material/colors';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const COLORS = [
  '#4CAF50', '#2196F3', '#F44336', '#FF9800', '#9C27B0',
  '#00BCD4', '#FFC107', '#E91E63', '#8BC34A', '#673AB7',
  '#FF5722', '#607D8B', '#CDDC39', '#03A9F4', '#795548',
];

const PieCharts = ({ dashboardData, repositionAntepositionData }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {data.name}
          </Typography>
          <Typography variant="body2">{`Quantidade: ${data.value}`}</Typography>
          {data.percent && (
            <Typography variant="body2">{`Porcentagem: ${(data.percent * 100).toFixed(2)}%`}</Typography>
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
          name: 'Reposições',
          value: repositionAntepositionData.repositions,
          color: blue[500],
        },
        {
          name: 'Anteposições',
          value: repositionAntepositionData.antepositions,
          color: green[500],
        },
      ]
    : [];

  const coursesChartData = {
    labels: dashboardData?.coursesData?.map((entry) => entry.name) || [],
    datasets: [
      {
        data: dashboardData?.coursesData?.map((entry) => entry.value) || [],
        backgroundColor: COLORS.slice(0, dashboardData?.coursesData?.length || 0),
        borderColor: COLORS.slice(0, dashboardData?.coursesData?.length || 0),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  return (
    <Grid item xs={12}>
      <Grid container spacing={4} justifyContent="center">
        {/* Gráfico de Usuários */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 2 }}>
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
                        fill={[green[500], blue[300]][index % 2]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: 'black' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Distribuição de Cursos */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 2 }}>
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
              <Box sx={{ height: 350 }}>
                <Doughnut data={coursesChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Proporção de Requisições */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', p: 2 }}>
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
                      <span style={{ color: 'black' }}>{value}</span>
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
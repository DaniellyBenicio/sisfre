import React from "react";
import { Box, Typography } from "@mui/material";
import ClassesCardTeacher from "./ClassesCardTeacher";

// Sample data for demonstration (replace with actual data source)
const sampleClasses = [
  {
    id: 1,
    name: "S1 - SI",
    course: "Sistemas de Informação",
    calendar: "Convencional - 2025.1",
    discipline: "Programação Orientada a Objetos",
    shift: "Tarde",
    schedule: [
      { day: "Segunda - Feira", startTime: "15:20", endTime: "17:00" },
      { day: "Quarta - Feira", startTime: "13:00", endTime: "15:00" },
    ],
  },
  {
    id: 2,
    name: "S7 - SI",
    course: "Sistemas de Informação",
    calendar: "Convencional - 2025.1",
    discipline: "Banco de Dados",
    shift: "Noite",
    schedule: [
      { day: "Terça - Feira", startTime: "19:00", endTime: "20:40" },
      { day: "Quinta - Feira", startTime: "20:40", endTime: "22:20" },
    ],
  },
  {
    id: 3,
    name: "S1 - ADS",
    course: "Análise e Desenv. de Sistemas",
    calendar: "Convencional - 2025.1",
    discipline: "Estruturas de Dados",
    shift: "Manhã",
    schedule: [
      { day: "Segunda - Feira", startTime: "08:00", endTime: "09:40" },
      { day: "Quarta - Feira", startTime: "09:40", endTime: "11:20" },
    ],
  },
  {
    id: 4,
    name: "S7 - ADS",
    course: "Análise e Desenv. de Sistemas",
    calendar: "Convencional - 2025.1",
    discipline: "Engenharia de Software",
    shift: "Noite",
    schedule: [
      { day: "Terça - Feira", startTime: "19:00", endTime: "20:40" },
      { day: "Sexta - Feira", startTime: "20:40", endTime: "22:20" },
    ],
  },
  {
    id: 5,
    name: "S1 - REDES",
    course: "Redes de Computadores",
    calendar: "Convencional - 2025.1",
    discipline: "Fundamentos de Redes",
    shift: "Tarde",
    schedule: [
      { day: "Terça - Feira", startTime: "15:20", endTime: "17:00" },
      { day: "Quinta - Feera", startTime: "13:00", endTime: "15:00" },
    ],
  },
  {
    id: 6,
    name: "S7 - REDES",
    course: "Redes de Computadores",
    calendar: "Convencional - 2025.1",
    discipline: "Segurança de Redes",
    shift: "Manhã",
    schedule: [
      { day: "Segunda - Feira", startTime: "08:00", endTime: "09:40" },
      { day: "Quarta - Feira", startTime: "09:40", endTime: "11:20" },
    ],
  },
];

const ClassesTeacher = () => {
  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        maxWidth: "820px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        // Reduzimos mt e mb para diminuir o espaço vertical do título
        sx={{ fontWeight: "bold", mt: 0.5, mb: 0.5 }}
      >
        Minhas Turmas
      </Typography>

      {/* Reduzimos o mt aqui para subir os cards */}
      <ClassesCardTeacher classes={sampleClasses} loading={false} sx={{ mt: 0.5 }} />
    </Box>
  );
};

export default ClassesTeacher;
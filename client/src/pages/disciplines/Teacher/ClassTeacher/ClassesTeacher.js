import React from "react";
import { Box, Typography } from "@mui/material";
import ClassesCardTeacher from "./ClassesCardTeacher";

// Sample data for demonstration (replace with actual data source)
const sampleClasses = [
  {
    id: 1,
    name: "Turma A",
    course: "Engenharia",
    period: "2025.1",
    discipline: "Matemática",
  },
  {
    id: 2,
    name: "Turma B",
    course: "Ciência da Computação",
    period: "2025.1",
    discipline: "Programação",
  },
];

const ClassesTeacher = () => {
  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", mt: 2, mb: 2 }}
      >
        Minhas Turmas
      </Typography>

      <ClassesCardTeacher classes={sampleClasses} loading={false} />
    </Box>
  );
};

export default ClassesTeacher;
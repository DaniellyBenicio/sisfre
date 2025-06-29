import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import api from "../../../../service/api";
import ClassesCardTeacher from "./ClassesCardTeacher";

const ClassesTeacher = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get("/teacher-classes");

        const transformedClasses = response.data.classes.reduce((acc, item) => {
          const existingClass = acc.find((cls) => cls.id === item.classId);

          if (existingClass) {
            existingClass.schedule.push({
              day: item.dayOfWeek,
              startTime: item.hour?.start || "N/A",
              endTime: item.hour?.end || "N/A",
            });
          } else {
            // Aqui é onde a mudança acontece: usa 'acronym' em vez de 'split'
            acc.push({
              id: item.classId, // Usa a propriedade 'acronym' para o nome da turma
              name: `${item.semester} - ${item.course?.acronym || "N/A"}`, // Ex: "S2 - BSI"
              course: item.course?.name || "N/A", // Mantém o nome completo do curso
              calendar: item.calendar || "N/A",
              discipline: item.discipline?.name || "N/A",
              shift: item.turn || "N/A",
              schedule: [
                {
                  day: item.dayOfWeek,
                  startTime: item.hour?.start || "N/A",
                  endTime: item.hour?.end || "N/A",
                },
              ],
            });
          }
          return acc;
        }, []);

        setClasses(transformedClasses);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao carregar turmas");
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

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
           {" "}
      <Typography
        variant="h5"
        align="center"
        sx={{ fontWeight: "bold", mt: 0.5, mb: 0.5 }}
      >
                Minhas Turmas      {" "}
      </Typography>
           {" "}
      {error ? (
        <Typography color="error" align="center">
                    {error}       {" "}
        </Typography>
      ) : (
        <ClassesCardTeacher
          classes={classes}
          loading={loading}
          sx={{ mt: 0.5 }}
        />
      )}
         {" "}
    </Box>
  );
};

export default ClassesTeacher;

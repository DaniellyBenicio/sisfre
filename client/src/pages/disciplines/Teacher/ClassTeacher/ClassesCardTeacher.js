import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
} from "@mui/material";
import { Class } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ClassesCardTeacher = ({ classes, loading }) => {
  const navigate = useNavigate();

  const handleCardClick = (classId) => {
    navigate(`/class-details/${classId}`);
  };

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={5} justifyContent="center">
          {classes.length > 0 ? (
            classes.map((classItem) => (
              <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                <Card
                  sx={{
                    width: { xs: 300, sm: 300 },
                    height: { xs: 250, sm: 300 },
                    backgroundColor: "#FFFFFF",
                    boxShadow:
                      "0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    borderRadius: 3,
                    border: "2px solid #087619",
                    position: "relative",
                    overflow: "visible",
                    transition: "all 0.4s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow:
                        "0 10px 20px rgba(8, 118, 25, 0.3), 0 0 10px rgba(8, 118, 25, 0.5)",
                      border: "3px solid #0A8C1F",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -2,
                      left: 0,
                      right: 0,
                      height: "10px",
                      backgroundColor: "#087619",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      zIndex: 1,
                      transition: "background-color 0.4s ease-in-out",
                      "&:hover": {
                        backgroundColor: "#0A8C1F",
                      },
                    }}
                  />
                  <CardActionArea
                    onClick={() => handleCardClick(classItem.id)}
                    sx={{
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      p: 2,
                      zIndex: 2,
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <CardContent sx={{ padding: 0 }}>
                      <Box
                        sx={{
                          mb: 2,
                          transition: "transform 0.4s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <Class sx={{ fontSize: 60, color: "#087619" }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: "#087619",
                          mb: 1,
                        }}
                      >
                        {classItem.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Curso: {classItem.course}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Período: {classItem.period}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Disciplina: {classItem.discipline}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1" sx={{ mt: 2, textAlign: "center", width: "100%" }}>
              Nenhuma turma encontrada.
            </Typography>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default ClassesCardTeacher;
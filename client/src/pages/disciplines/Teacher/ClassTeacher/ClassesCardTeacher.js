import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";
import { School } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ClassesCardTeacher = ({ classes, loading }) => {
  const navigate = useNavigate();

  const handleDetailsClick = (classId, classItem) => {
    navigate(`/class-details-page/${classId}`, { state: { classItem } });
  };

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {classes.length > 0 ? (
            classes.map((classItem) => (
              <Grid
                item
                xs={12} // 1 card por linha em telas extra pequenas
                sm={6} // 2 cards por linha em telas pequenas
                md={4} // 3 cards por linha em telas médias e maiores
                key={classItem.id}
                sx={{
                  display: "flex", // Garante que o Card dentro do Grid item se alinhe
                  justifyContent: "center", // Centraliza o Card dentro do Grid item
                }}
              >
                <Card
                  sx={{
                    width: { xs: 200, sm: 220, md: 240 }, // Reduzida a largura do card
                    height: { xs: 180, sm: 200, md: 220 }, // Reduzida a altura do card
                    backgroundColor: "#FFFFFF",
                    boxShadow:
                      "0 6px 12px rgba(8, 118, 25, 0.1), 0 3px 6px rgba(8, 118, 25, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
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
                    p: 1.5, // Ajustado padding
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -2,
                      left: 0,
                      right: 0,
                      height: "8px",
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
                  <CardContent
                    sx={{
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      flexGrow: 1,
                      width: "100%",
                      mt: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        mb: 1.5,
                        transition: "transform 0.4s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <School sx={{ fontSize: 40, color: "#087619" }} />
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        color: "#087619",
                        mb: 1.5,
                      }}
                    >
                      {classItem.name}
                    </Typography>
                  </CardContent>
                  <Button
                    variant="outlined" // Volta para "outlined" para a borda
                    sx={{
                      mt: "auto",
                      backgroundColor: "#FFFFFF", // Fundo branco
                      borderColor: "#087619", // Borda verde
                      color: "#087619", // Texto verde
                      borderWidth: "1px", // Borda fininha (padrão 1px para outlined)
                      boxShadow: "0 2px 4px rgba(8, 118, 25, 0.2)", // Sombra para o relevo
                      "&:hover": {
                        backgroundColor: "rgba(8, 118, 25, 0.04)", // Leve fundo verde no hover
                        borderColor: "#0A8C1F",
                        color: "#0A8C1F",
                        boxShadow: "0 4px 8px rgba(8, 118, 25, 0.3)", // Sombra mais proeminente no hover
                      },
                      width: "80%",
                      maxWidth: "150px",
                      borderRadius: 2,
                      fontSize: "0.8rem",
                    }}
                    onClick={() => handleDetailsClick(classItem.id, classItem)}
                  >
                    Detalhes
                  </Button>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography
              variant="body1"
              sx={{ mt: 2, textAlign: "center", width: "100%" }}
            >
              Nenhuma turma encontrada.
            </Typography>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default ClassesCardTeacher;
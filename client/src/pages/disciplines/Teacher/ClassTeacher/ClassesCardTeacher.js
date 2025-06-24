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
import { School } from "@mui/icons-material"; // Changed to School icon
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
              <Grid item xs={12} sm={4} md={2} key={classItem.id}> {/* Changed md to 2 for 6 cards per row */}
                <Card
                  sx={{
                    width: { xs: 200, sm: 220 }, // Reduced width
                    height: { xs: 180, sm: 200 }, // Reduced height
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
                    p: 1.5, // Slightly reduced padding
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -2,
                      left: 0,
                      right: 0,
                      height: "8px", // Slightly thinner top bar
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
                      mt: 1.5, // Adjusted for smaller card
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
                      <School sx={{ fontSize: 40, color: "#087619" }} /> {/* Changed to School icon, smaller size */}
                    </Box>
                    <Typography
                      variant="body1" // Smaller typography variant
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
                    variant="outlined"
                    sx={{
                      mt: "auto",
                      borderColor: "#087619",
                      color: "#087619",
                      "&:hover": {
                        borderColor: "#0A8C1F",
                        color: "#0A8C1F",
                        backgroundColor: "rgba(8, 118, 25, 0.04)",
                      },
                      width: "80%",
                      maxWidth: "150px", // Smaller button
                      borderRadius: 2,
                      fontSize: "0.8rem", // Smaller button text
                    }}
                    onClick={() => handleDetailsClick(classItem.id)}
                  >
                    Detalhes
                  </Button>
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
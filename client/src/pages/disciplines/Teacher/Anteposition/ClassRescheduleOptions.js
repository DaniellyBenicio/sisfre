import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CssBaseline
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../../components/SideBar";
import { EventNote, EventAvailable } from "@mui/icons-material";

const ClassRescheduleOptions = ({ setAuthenticated }) => {
  const navigate = useNavigate();
  const accessType = localStorage.getItem("accessType") || "";

  const rescheduleOptions = [
    {
      title: "Anteposição de Aula",
      icon: <EventNote sx={{ fontSize: 60, color: "#087619" }} />,
      path: "/class-anteposition",
      type: "anteposicao", // Added type for backend
    },
    {
      title: "Reposição de Aula",
      icon: <EventAvailable sx={{ fontSize: 60, color: "#087619" }} />,
      path: "/class-reposition",
      type: "reposicao", // Added type for backend
    },
  ];

  const handleCardClick = (option) => {
    const targetPath = accessType === "Admin" && option.adminPath ? option.adminPath : option.path;
    // Pass the type in the state to use in ClassReplacementList
    navigate(targetPath, { state: { requestType: option.type } });
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar setAuthenticated={setAuthenticated} />
      <Box
        padding={3}
        sx={{
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            mt: "40px"
          }}
        >
          Opções de Reorganização de Aulas
        </Typography>

        <Grid
          container
          spacing={5}
          justifyContent="center"
          sx={{
            width: "100%",
            overflow: "visible",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {rescheduleOptions.map((option, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
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
                  onClick={() => handleCardClick(option)}
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
                  <CardContent
                    sx={{ padding: 0, transition: "transform 0.4s ease-in-out" }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        transition: "transform 0.4s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {option.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        wordWrap: "break-word",
                        color: "#087619",
                        transition:
                          "transform 0.4s ease-in-out, color 0.4s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.05)",
                          color: "#0A8C1F",
                          fontSize: "1.3rem",
                        },
                      }}
                    >
                      {option.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ClassRescheduleOptions;
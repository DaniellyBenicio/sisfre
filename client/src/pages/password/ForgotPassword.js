import React, { useState } from "react";
import {
  TextField,
  Container,
  Button,
  Typography,
  Box,
  CircularProgress,
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../../service/api";
import CustomAlert from "../../components/alert/CustomAlert";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/forgot-password", { email });
      setMessage(
        "Email de recuperação enviado com sucesso! Verifique sua caixa de entrada."
      );
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erro ao enviar a solicitação de redefinição de senha. Por favor, verifique o email inserido."
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleCloseAlert = () => {
    setMessage("");
    setError("");
  };

  return (
    <Fade in={true} timeout={500}>
      <Container
        component="main"
        maxWidth={false}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#FFFFFF",
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            width: "100%",
            maxWidth: 750,
            minHeight: { xs: "auto", md: 420 },
            borderRadius: 4,
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flex: 1,
              background: "#087619",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              px: 4,
              py: 4,
              color: "#FFFFFF",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: { xs: "1.15rem", md: "1.3rem" },
                lineHeight: 1.5,
              }}
            >
              Esqueceu sua senha? <br /> Digite seu email para recuperá-la.
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1.4,
              backgroundColor: "#FFFFFF",
              p: { xs: 4, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: "bold",
                textAlign: "center",
                fontSize: { xs: "1.4rem", md: "1.6rem" },
              }}
            >
              Recuperar Senha
            </Typography>

            {(message || error) && (
              <CustomAlert
                message={message || error}
                type={message ? "success" : "error"}
                onClose={handleCloseAlert}
                sx={{ mb: 2 }}
              />
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                error={!!email && !isEmailValid()}
                helperText={!!email && !isEmailValid() ? "Email inválido" : ""}
                variant="outlined"
                InputLabelProps={{
                  shrink: focusedField === "email" || email !== "",
                  sx: {
                    color:
                      focusedField === "email" || email !== ""
                        ? "#4CAF50"
                        : "text.secondary",
                    fontSize: "1rem",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "& fieldset": {
                      borderColor: "#E0E0E0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#388E3C",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4CAF50",
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !isEmailValid()}
                sx={{
                  mt: 3,
                  py: 1.5,
                  bgcolor: loading || !isEmailValid() ? "#E0E0E0" : "#087619",
                  color: loading || !isEmailValid() ? "#333333" : "#FFFFFF",
                  "&:hover": {
                    bgcolor: loading || !isEmailValid() ? "#D0D0D0" : "#066915",
                  },
                  borderRadius: "10px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  textTransform: "uppercase",
                }}
              >
                {loading ? (
                  <CircularProgress size={25} />
                ) : (
                  "Enviar Email de Recuperação"
                )}
              </Button>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/login")}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.95rem",
                    color: "#087619",
                    "&:hover": {
                      textDecoration: "underline",
                      color: "#388E3C",
                    },
                    fontWeight: 500,
                  }}
                >
                  Voltar ao Login
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Fade>
  );
};

export default ForgotPassword;

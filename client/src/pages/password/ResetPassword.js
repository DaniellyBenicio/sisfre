import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  Fade,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../../service/api";
import CustomAlert from "../../components/alert/CustomAlert";

const ResetPassword = () => {
  const { token } = useParams();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const expires = queryParams.get("expires");
  const email = queryParams.get("email");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !expires || !email) {
      setError("Link de redefinição inválido ou incompleto.");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [token, expires, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.post(
        `/resetPassword/${token}`,
        { newPassword: novaSenha, confirmPassword: confirmarSenha },
        { params: { expires, email } }
      );
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao redefinir senha.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Insira sua nova senha e confirme-a para concluir a redefinição.
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
              Redefinir Senha
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
                label="Nova Senha"
                type={showNovaSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                onFocus={() => setFocusedField("novaSenha")}
                onBlur={() => setFocusedField(null)}
                variant="outlined"
                InputLabelProps={{
                  shrink: focusedField === "novaSenha" || novaSenha !== "",
                  sx: {
                    color:
                      focusedField === "novaSenha" || novaSenha !== ""
                        ? "#4CAF50"
                        : "text.secondary",
                    fontSize: "1rem",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNovaSenha(!showNovaSenha)}
                        edge="end"
                      >
                        {showNovaSenha ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "& fieldset": { borderColor: "#E0E0E0" },
                    "&:hover fieldset": { borderColor: "#388E3C" },
                    "&.Mui-focused fieldset": { borderColor: "#4CAF50" },
                  },
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Confirmar Senha"
                type={showConfirmarSenha ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                onFocus={() => setFocusedField("confirmarSenha")}
                onBlur={() => setFocusedField(null)}
                variant="outlined"
                InputLabelProps={{
                  shrink:
                    focusedField === "confirmarSenha" || confirmarSenha !== "",
                  sx: {
                    color:
                      focusedField === "confirmarSenha" || confirmarSenha !== ""
                        ? "#4CAF50"
                        : "text.secondary",
                    fontSize: "1rem",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmarSenha(!showConfirmarSenha)
                        }
                        edge="end"
                      >
                        {showConfirmarSenha ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "& fieldset": { borderColor: "#E0E0E0" },
                    "&:hover fieldset": { borderColor: "#388E3C" },
                    "&.Mui-focused fieldset": { borderColor: "#4CAF50" },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting || !novaSenha || !confirmarSenha}
                sx={{
                  mt: 3,
                  py: 1.5,
                  bgcolor:
                    isSubmitting || !novaSenha || !confirmarSenha
                      ? "#E0E0E0"
                      : "#087619",
                  color:
                    isSubmitting || !novaSenha || !confirmarSenha
                      ? "#333333"
                      : "#FFFFFF",
                  "&:hover": {
                    bgcolor:
                      isSubmitting || !novaSenha || !confirmarSenha
                        ? "#D0D0D0"
                        : "#066915",
                  },
                  borderRadius: "10px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  textTransform: "uppercase",
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={25} />
                ) : (
                  "Redefinir Senha"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Fade>
  );
};

export default ResetPassword;

import React, { useState } from "react";
import {
  TextField,
  Container,
  Button,
  Typography,
  Paper,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Person, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { login } from "../../service/Auth";
import logo from "../../assets/Logo.svg";

const Login = ({ onLogin = () => {} }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ type: "error", message: "" });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(email, password);
      if (response.token) {
        localStorage.setItem("token", response.token);
        onLogin();
        navigate("/MainScreen");

      } else {
        setError(response.error || "Erro ao fazer login");
      }

    } catch (err) {
      setErrorInfo({ type: "error", message: "Falha no login" });
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const passwordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Container
      component="main"
      maxWidth="false"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#F5FDFF",
      }}
    >
      <Paper
        elevation={5}
        sx={{
          p: 6,
          borderRadius: 4,
          width: "100%",
          maxWidth: 450,
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 2, textAlign: 'center', marginTop: '-15px' }}>
          <img src={logo} alt="logo" style={{ width: 175, height: "auto" }} />
        </Box>
        <Typography
          component="h1"
          variant="h5"
          sx={{
            mb: 4,
            fontWeight: "bold",
            textAlign: "center",
            color: "#666666",
          }}
        >
          LOGIN
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <Typography
            variant="subtitle1"
            position="start"
            sx={{ color: "#666666", textAlign: "left" }}
          >
            E-mail
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!email && !isEmailValid()}
            helperText={!!email && !isEmailValid() ? "Email inválido" : ""}
            sx={{
              mb: 1.5,
              marginTop: "-1px",
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "#087619",
                },
                "&.Mui-error fieldset": {
                  borderColor: "#d32f2f",
                },
                "&.Mui-focused.Mui-error fieldset": {
                  borderColor: "#d32f2f",
                },
              },
            }}
            InputProps={{
              startAdornment: <Person sx={{ color: "#666666", mr: 1 }} />,
            }}
            InputLabelProps={{
              sx: { color: "#666666" },
            }}
          />
          <Typography
            variant="subtitle1"
            position="start"
            sx={{ color: "#666666", textAlign: "left" }}
          >
            Senha
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            sx={{
              mb: 1.5,
              marginTop: "-1px",
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "#087619",
                },
                "&.Mui-error fieldset": {
                  borderColor: "#d32f2f",
                },
                "&.Mui-focused.Mui-error fieldset": {
                  borderColor: "#d32f2f",
                },
              },
            }}
            InputProps={{
              startAdornment: <Lock sx={{ color: "#666666", mr: 1 }} />,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={passwordVisibility}
                    edge="end"
                    sx={{ color: "#666666" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              sx: { color: "#666666" },
            }}
          />
          {error && (
            <Typography
              color="error"
              variant="body2"
              sx={{ mt: 1, textAlign: "center", fontWeight: "bold" }}
            >
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !isEmailValid() || !password}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              bgcolor: "#087619",
              "&:hover": { bgcolor: "#066915" },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Entrar"}
          </Button>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 0.5,
            }}
          >
            <Button
              sx={{
                textTransform: "none",
                fontSize: "0.875rem",
                color: "#087619",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => navigate("/forgot-password")}
            >
              Recuperar Senha?
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;

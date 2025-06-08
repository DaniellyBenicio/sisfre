import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  FormControl,
  MenuItem,
  IconButton,
  InputLabel,
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import api from "../../service/api";
import { StyledTextField, StyledSelect } from "../../components/inputs/Input";

const INSTITUTIONAL_COLOR = "#307c34";

const StyledButton = styled(Button)(() => ({
  borderRadius: "8px",
  padding: "8px 28px",
  textTransform: "none",
  fontWeight: "bold",
  fontSize: "0.875rem",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "fit-content",
  minWidth: 100,
  "@media (max-width: 600px)": {
    fontSize: "0.7rem",
    padding: "4px 8px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "120px",
  },
}));

const UserFormDialog = ({
  open,
  onClose,
  userToEdit,
  onSubmitSuccess,
  isEditMode,
}) => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    accessType: "",
  });
  const [error, setError] = useState(null);

  const isFormFilled = user.username || user.email || user.accessType;

  const formatName = (name) => {
    if (!name) return "";
    return name
      .trim()
      .split(" ")
      .map((word) => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  const generateCode = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    let code = "";

    if (parts.length > 1) {
      const firstName = parts[0];
      const lastName = parts[parts.length - 1];
      code = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else {
      const firstName = parts[0];
      code =
        firstName.length >= 2
          ? firstName.substring(0, 2).toUpperCase()
          : firstName.toUpperCase();
    }

    return code;
  };

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user.username || !user.email || !user.accessType) {
      setError("Os campos nome, e-mail e tipo de usuário são obrigatórios.");
      return;
    }

    //    if (!user.email.match(/@ifce\.edu\.br$/)) {
    //    setError('Use um e-mail institucional (@ifce.edu.br).');
    //  return;
    //}

    if (!["professor", "coordenador"].includes(user.accessType.toLowerCase())) {
      setError("O tipo de usuário deve ser 'Professor' ou 'Coordenador'.");
      return;
    }

    try {
      const formattedUsername = formatName(user.username);
      const generatedCode = generateCode(formattedUsername);
      const payload = {
        username: formattedUsername,
        email: user.email,
        accessType: user.accessType.toLowerCase(),
      };

      console.log("UserFormDialog - Payload enviado:", payload);

      let response;
      if (isEditMode) {
        response = await api.put(`/users/${userToEdit?.id}`, payload);
      } else {
        response = await api.post(`/users`, payload);
      }

      console.log("UserFormDialog - Resposta da API:", response.data);

      onSubmitSuccess(response.data.user, isEditMode);
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        `Erro ao ${isEditMode ? "atualizar" : "cadastrar"} usuário: ${
          err.message
        }`;
      setError(
        errorMessage.includes("E-mail já cadastrado")
          ? "Este e-mail já está cadastrado. Use um e-mail diferente."
          : errorMessage.includes("Apenas e-mails institucionais")
          ? "Use um e-mail institucional (@ifce.edu.br)."
          : errorMessage
      );
      console.error("UserFormDialog - Erro:", err);
    }
  };

  useEffect(() => {
    if (userToEdit) {
      setUser({
        username: userToEdit.username || "",
        email: userToEdit.email || "",
        accessType: userToEdit.accessType
          ? userToEdit.accessType.toLowerCase()
          : "",
      });
      setError(null);
    } else {
      setUser({
        username: "",
        email: "",
        accessType: "",
      });
      setError(null);
    }
  }, [userToEdit, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          width: "520px",
          maxWidth: "90vw",
          "@media (max-width: 600px)": {
            width: "100%",
            margin: "8px",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          marginTop: "15px",
          color: "#087619",
          fontWeight: "bold",
          "@media (max-width: 600px)": {
            fontSize: "1.25rem",
          },
        }}
      >
        {isEditMode ? "Editar Usuário" : "Cadastrar Usuário"}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 3, sm: 5 } }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Box
              sx={{
                color: "red",
                marginBottom: 2,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {error}
            </Box>
          )}

          <StyledTextField
            sx={{
              my: 1.5,
              "& .MuiInputBase-root": {
                height: "56px",
                "@media (max-width: 600px)": {
                  height: "48px",
                  fontSize: "0.875rem",
                },
              },
              "& .MuiInputLabel-root": {
                top: "50%",
                transform: "translate(14px, -50%)",
                fontSize: "1rem",
                "@media (max-width: 600px)": {
                  fontSize: "0.875rem",
                },
              },
              "& .MuiInputLabel-shrink": {
                top: 0,
                transform: "translate(14px, -9px) scale(0.75)",
              },
            }}
            name="username"
            size="small"
            variant="outlined"
            fullWidth
            label="Nome"
            margin="normal"
            value={user.username}
            onChange={handleInputChange}
            required
          />

          <StyledTextField
            sx={{
              my: 1.5,
              "& .MuiInputBase-root": {
                height: "56px",
                "@media (max-width: 600px)": {
                  height: "48px",
                  fontSize: "0.875rem",
                },
              },
              "& .MuiInputLabel-root": {
                top: "50%",
                transform: "translate(14px, -50%)",
                fontSize: "1rem",
                "@media (max-width: 600px)": {
                  fontSize: "0.875rem",
                },
              },
              "& .MuiInputLabel-shrink": {
                top: 0,
                transform: "translate(14px, -9px) scale(0.75)",
              },
            }}
            name="email"
            type="email"
            size="small"
            variant="outlined"
            fullWidth
            label="E-mail"
            margin="normal"
            value={user.email}
            onChange={handleInputChange}
            required
          />

          <FormControl
            fullWidth
            margin="normal"
            sx={{
              my: 1.5,
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "#000000 !important",
                  borderWidth: "2px",
                },
              "@media (max-width: 600px)": {
                my: 1,
              },
            }}
          >
            <InputLabel
              id="accessType-label"
              sx={{
                "&.Mui-focused, &.MuiInputLabel-shrink": { color: "#000000" },
                "@media (max-width: 600px)": {
                  fontSize: "0.875rem",
                },
              }}
            >
              Tipo de Usuário
            </InputLabel>
            <StyledSelect
              name="accessType"
              value={user.accessType}
              onChange={handleInputChange}
              label="Tipo de Usuário"
              required
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: "200px",
                    overflowY: "auto",
                    width: "auto",
                    "& .MuiMenuItem-root:hover": {
                      backgroundColor: "#D5FFDB",
                    },
                  },
                },
              }}
              sx={{
                "@media (max-width: 600px)": {
                  fontSize: "0.875rem",
                  height: "48px",
                },
              }}
            >
              <MenuItem value="professor">Professor</MenuItem>
              <MenuItem value="coordenador">Coordenador</MenuItem>
            </StyledSelect>
          </FormControl>

          <DialogActions
            sx={{
              justifyContent: "center",
              gap: 2,
              padding: "10px 24px",
              marginTop: "10px",
              "@media (max-width: 600px)": {
                padding: "8px 12px",
                gap: "8px",
              },
            }}
          >
            <StyledButton
              onClick={onClose}
              variant="contained"
              sx={{
                backgroundColor: "#F01424",
                "&:hover": { backgroundColor: "#D4000F" },
              }}
            >
              <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Cancelar
            </StyledButton>
            <StyledButton
              type="submit"
              variant="contained"
              disabled={!isFormFilled}
              sx={{
                backgroundColor: !isFormFilled
                  ? "#E0E0E0"
                  : INSTITUTIONAL_COLOR,
                "&:hover": {
                  backgroundColor: !isFormFilled ? "#E0E0E0" : "#26692b",
                },
              }}
            >
              <Save sx={{ fontSize: { xs: 20, sm: 24 } }} />
              {isEditMode ? "Atualizar" : "Cadastrar"}
            </StyledButton>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;

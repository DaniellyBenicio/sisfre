import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  DialogActions,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useFormik } from "formik";
import * as yup from "yup";
import api from "../../../service/api";

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#ced4da",
    },
    "&:hover fieldset": {
      borderColor: "#087619",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#087619",
      boxShadow: "0 0 0 0.2rem rgba(8, 118, 25, 0.25)",
    },
  },
});

const StyledSelect = styled(Select)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#ced4da",
    },
    "&:hover fieldset": {
      borderColor: "#087619",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#087619",
      boxShadow: "0 0 0 0.2rem rgba(8, 118, 25, 0.25)",
    },
  },
});

const validationSchema = yup.object({
  nome: yup.string().required("Nome é obrigatório"),
  email: yup
    .string()
    .email("E-mail inválido")
    .matches(/@ifce\.edu\.br$/, "Use um e-mail institucional (@ifce.edu.br)")
    .required("E-mail é obrigatório"),
  tipo: yup.string().required("Tipo de usuário é obrigatório"),
});

const UserRegistrationPopup = ({ open, onClose, onRegister }) => {
  const formik = useFormik({
    initialValues: {
      nome: "",
      email: "",
      tipo: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await api.post("/users", {
          username: values.nome,
          email: values.email,
          accessType: values.tipo,
        });

        if (response.status === 201) {
          const newUser = {
            id: response.data.user.id || Date.now().toString(),
            username: values.nome,
            email: values.email,
            accessType: values.tipo,
          };
          onRegister(newUser);
          onClose();
          formik.resetForm();
          alert(
            'Usuário cadastrado com sucesso! Use a senha padrão "123456" para o primeiro login.'
          );
        } else {
          alert(
            "Erro ao cadastrar usuário. Verifique os dados e tente novamente."
          );
        }
      } catch (error) {
        if (error.response) {
          const errorMessage =
            error.response.data.error || "Erro desconhecido.";
          if (
            error.response.status === 400 &&
            errorMessage.includes("E-mail já cadastrado")
          ) {
            alert(
              "Erro: Este e-mail já está cadastrado. Use um e-mail diferente."
            );
          } else if (
            error.response.status === 400 &&
            errorMessage.includes("Apenas e-mails institucionais")
          ) {
            alert("Erro: Use um e-mail institucional (@ifce.edu.br).");
          } else {
            alert(`Erro ao cadastrar usuário: ${errorMessage}`);
          }
        } else if (error.request) {
          alert(
            "Erro ao conectar com o servidor. Verifique sua conexão e tente novamente."
          );
        } else {
          alert("Erro inesperado. Tente novamente.");
        }
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          backgroundColor: "#087619",
          color: "white",
          padding: "16px",
          fontWeight: "bold",
          fontSize: "1.2rem",
          textAlign: "center",
        }}
      >
        Cadastro de Usuário
      </DialogTitle>
      <DialogContent sx={{ padding: "20px" }}>
        <form onSubmit={formik.handleSubmit}>
          <StyledTextField
            fullWidth
            id="nome"
            name="nome"
            label="Nome"
            value={formik.values.nome}
            onChange={formik.handleChange}
            error={formik.touched.nome && Boolean(formik.errors.nome)}
            helperText={formik.touched.nome && formik.errors.nome}
            margin="normal"
            variant="outlined"
            size="small"
          />
          <StyledTextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            margin="normal"
            variant="outlined"
            size="small"
          />
          <StyledSelect
            fullWidth
            id="tipo"
            name="tipo"
            label="Tipo de Usuário"
            value={formik.values.tipo}
            onChange={formik.handleChange}
            error={formik.touched.tipo && Boolean(formik.errors.tipo)}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return <em>Selecione o tipo</em>;
              }
              return selected.charAt(0).toUpperCase() + selected.slice(1);
            }}
            margin="normal"
            variant="outlined"
            size="small"
          >
            <MenuItem disabled value="">
              <em>Selecione o tipo</em>
            </MenuItem>
            <MenuItem value="professor">Professor</MenuItem>
            <MenuItem value="coordenador">Coordenador</MenuItem>
          </StyledSelect>
        </form>
      </DialogContent>
      <DialogActions sx={{ padding: "20px" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#FF1C1C",
            borderColor: "#FF1C1C",
            "&:hover": {
              backgroundColor: "rgba(255, 28, 28, 0.1)",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={formik.handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: "#087619",
            color: "white",
            "&:hover": {
              backgroundColor: "#056012",
            },
          }}
          type="submit"
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserRegistrationPopup;

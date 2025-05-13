import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
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
    "&.Mui-error fieldset": {
      borderColor: "#d32f2f",
    },
  },
  "& .MuiFormHelperText-root": {
    color: "#d32f2f",
    fontSize: "0.75rem",
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
    "&.Mui-error fieldset": {
      borderColor: "#d32f2f",
    },
  },
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    width: "90%",
    maxWidth: "450px",
    [theme.breakpoints.down("sm")]: {
      margin: "16px",
      width: "100%",
    },
  },
}));

const StyledDialogTitle = styled(DialogTitle)({
  padding: "16px",
  fontWeight: "bold",
  fontSize: "1.2rem",
  textAlign: "center",
});

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: "20px",
  [theme.breakpoints.down("sm")]: {
    padding: "16px",
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: "20px",
  justifyContent: "center",
  gap: "16px",
  [theme.breakpoints.down("sm")]: {
    padding: "16px",
    flexDirection: "row",
  },
}));

const validationSchema = yup.object({
  username: yup.string().required("Nome é obrigatório"),
  email: yup
    .string()
    .email("E-mail inválido")
    .matches(/@ifce\.edu\.br$/, "Use um e-mail institucional (@ifce.edu.br)")
    .required("E-mail é obrigatório"),
  accessType: yup.string().required("Tipo de usuário é obrigatório"),
});

const UserUpdatePopup = ({ open, onClose, user, onUpdate }) => {
  const formik = useFormik({
    initialValues: {
      username: user?.username || "",
      email: user?.email || "",
      accessType: user?.accessType || "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const response = await api.put(`/users/${user.id}`, {
          username: values.username,
          email: values.email,
          accessType: values.accessType,
        });
        toast.success("Usuário atualizado com sucesso!");
        onUpdate(response.data.user);
        onClose();
      } catch (error) {
        const errorMessage =
          error.response?.data?.error || "Erro ao atualizar usuário";
        toast.error(errorMessage);
      }
    },
  });

  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle>Editar Usuário</StyledDialogTitle>
      <StyledDialogContent>
        <form onSubmit={formik.handleSubmit}>
          <StyledTextField
            label="Nome de Usuário"
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />
          <StyledTextField
            label="E-mail"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            fullWidth
            margin="normal"
            variant="outlined"
            size="small"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Acesso</InputLabel>
            <StyledSelect
              name="accessType"
              value={formik.values.accessType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.accessType && Boolean(formik.errors.accessType)
              }
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <em>Selecione o tipo</em>;
                }
                return selected.charAt(0).toUpperCase() + selected.slice(1);
              }}
              variant="outlined"
              size="small"
            >
              <MenuItem disabled value="">
                <em>Selecione o tipo</em>
              </MenuItem>
              <MenuItem value="Professor">Professor</MenuItem>
              <MenuItem value="Coordenador">Coordenador</MenuItem>
            </StyledSelect>
            {formik.touched.accessType && formik.errors.accessType && (
              <span
                style={{
                  color: "#d32f2f",
                  fontSize: "0.75rem",
                  marginTop: "4px",
                }}
              >
                {formik.errors.accessType}
              </span>
            )}
          </FormControl>
        </form>
      </StyledDialogContent>
      <StyledDialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#FF1C1C",
            borderColor: "#FF1C1C",
            width: { xs: "100%", sm: "auto" },
            "&:hover": {
              backgroundColor: "rgba(255, 28, 28, 0.1)",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          onClick={formik.handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: "#087619",
            width: { xs: "100%", sm: "auto" },
            "&:hover": { backgroundColor: "#056012" },
          }}
        >
          Atualizar
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default UserUpdatePopup;

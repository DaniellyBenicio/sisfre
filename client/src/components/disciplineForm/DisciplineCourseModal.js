import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  IconButton,
  Autocomplete,
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import api from "../../service/api";
import { StyledTextField } from "../inputs/Input";
import CustomAlert from "../alert/CustomAlert";

const DisciplineCourse = ({ open, onClose, editingData = null, onUpdate }) => {
  const [discipline, setDiscipline] = useState({
    disciplineId: null,
    acronym: "",
    workload: "",
  });
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isEditMode, setIsEditMode] = useState(Boolean(editingData));

  const isFormFilled = discipline.disciplineId && discipline.workload && discipline.workload.trim() !== "";

  const handleSubmitSuccess = () => {
    setAlert({
      message: isEditMode
        ? "Disciplina atualizada com sucesso!"
        : "Disciplina adicionada ao curso com sucesso!",
      type: "success",
    });
    onClose();
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  useEffect(() => {
    if (open) {
      setError(null);
      setAlert(null);
      setIsEditMode(Boolean(editingData));

      const initialize = async () => {
        setLoading(true);
        try {
          const disciplinesResponse = await api.get("/disciplines/all");
          const allDisciplines = Array.isArray(disciplinesResponse.data)
            ? disciplinesResponse.data
            : disciplinesResponse.data.disciplines || [];

          let availableDisciplines = allDisciplines;
          if (!editingData) {
            const courseDisciplinesResponse = await api.get("/course/discipline");
            const courseDisciplineIds = Array.isArray(courseDisciplinesResponse.data)
              ? courseDisciplinesResponse.data.map((d) => d.disciplineId || d.id)
              : [];
            availableDisciplines = allDisciplines.filter(
              (d) => !courseDisciplineIds.includes(d.id)
            );
          }

          setDisciplines(availableDisciplines);

          if (editingData) {
            console.log("Editing data:", editingData);
            const selected = allDisciplines.find((d) => d.id === editingData.disciplineId);
            setDiscipline({
              disciplineId: editingData.disciplineId || null,
              acronym: selected?.acronym || editingData.acronym || "",
              workload: editingData.workload?.toString() || "",
            });
          } else {
            setDiscipline({ disciplineId: null, acronym: "", workload: "" });
          }
        } catch (err) {
          console.error("Error loading disciplines:", err);
          setError("Erro ao carregar disciplinas: " + (err.response?.data?.message || err.message));
        } finally {
          setLoading(false);
        }
      };

      initialize();
    }
  }, [open, editingData, isEditMode]);

  const handleDisciplineChange = (event, newValue) => {
    setDiscipline({
      ...discipline,
      disciplineId: newValue ? newValue.id : null,
      acronym: newValue ? newValue.acronym : "",
    });
  };

  const handleWorkloadChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      setDiscipline({ ...discipline, workload: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!discipline.disciplineId || !discipline.workload) {
      setError("Os campos disciplina e carga horária são obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        workload: parseInt(discipline.workload),
      };

      console.log("Submitting:", { isEditMode, editingData, payload });
      let response;
      if (isEditMode) {
        if (!editingData.disciplineId) {
          throw new Error("disciplineId missing in editingData");
        }
        response = await api.put(
          `/course/discipline/${editingData.disciplineId}`,
          payload
        );
      } else {
        response = await api.post("/course/discipline", {
          ...payload,
          disciplineId: discipline.disciplineId,
        });
      }

      onUpdate(response.data);
      onClose();
      handleSubmitSuccess();
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.response?.data?.message || "Erro ao salvar disciplina no curso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            width: "520px",
            maxWidth: "90vw",
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", marginTop: "27px", color: "#087619", fontWeight: "bold" }} >
          {isEditMode ? "Editar Disciplina" : "Adicionar Disciplina ao Curso"}
          <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 5 }}>
          {!loading ? (
            <form onSubmit={handleSubmit}>
              {error && (
                <Box sx={{ color: "red", marginBottom: 2, fontSize: "0.875rem" }}>{error}</Box>
              )}
              <Autocomplete
                options={disciplines}
                getOptionLabel={(option) => option.name || ""}
                value={
                  disciplines.find((d) => d.id === discipline.disciplineId) || null
                }
                onChange={handleDisciplineChange}
                renderInput={(params) => (
                  <StyledTextField
                    {...params}
                    label="Disciplina"
                    variant="outlined"
                    fullWidth
                    required
                    sx={{
                      my: 2.5,
                      "& .MuiInputBase-root": { 
                        height: "56px",
                      },
                      "& .MuiInputLabel-root": {
                        top: "50%",
                        transform: "translate(14px, -50%)",
                        fontSize: "1rem",
                      },
                      "& .MuiInputLabel-shrink": {
                        top: 0,
                        transform: "translate(14px, -9px) scale(0.75)",
                      },
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "#3C3C3C",
                      },
                    }}
                  />
                )}
                noOptionsText="Nenhuma disciplina encontrada"
                disabled={loading || isEditMode}
                componentsProps={{
                  paper: { sx: { width: 'auto' } },
                  listbox: {
                    sx: {
                      maxHeight: '200px',
                      overflowY: 'auto',
                      '& .MuiAutocomplete-option:hover': { backgroundColor: '#D5FFDB' },
                    },
                  },
                }}
              />
              <Box display="flex" gap={2} my={1.5}>
                <StyledTextField
                  name="acronym"
                  label="Sigla"
                  variant="outlined"
                  size="small"
                  value={discipline.acronym}
                  disabled={loading || isEditMode}
                  sx={{
                    flex: 1,
                    "& .MuiInputBase-root": { 
                      height: "56px",
                    },
                    "& .MuiInputLabel-root": {
                      top: "50%",
                      transform: "translate(14px, -50%)",
                      fontSize: "1rem",
                    },
                    "& .MuiInputLabel-shrink": {
                      top: 0,
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#3C3C3C",
                    },
                  }}
                />
                <StyledTextField
                  name="workload"
                  label="Carga Horária"
                  variant="outlined"
                  size="small"
                  value={discipline.workload}
                  onChange={handleWorkloadChange}
                  required
                  type="number"
                  inputProps={{ min: 1 }}
                  sx={{
                    flex: 1,
                    "& .MuiInputBase-root": { height: "56px" },
                    "& .MuiInputLabel-root": {
                      top: "50%",
                      transform: "translate(14px, -50%)",
                      fontSize: "1rem",
                    },
                    "& .MuiInputLabel-shrink": {
                      top: 0,
                      transform: "translate(14px, -9px) scale(0.75)",
                    },
                  }}
                />
              </Box>
              <DialogActions
                sx={{
                  justifyContent: "center",
                  gap: 2,
                  padding: "10px 24px",
                  marginTop: "35px",
                }}
              >
                <Button
                  onClick={onClose}
                  variant="contained"
                  sx={{
                    width: "fit-content",
                    minWidth: 100,
                    padding: "8px 28px",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#F01424",
                    "&:hover": { backgroundColor: "#D4000F" },
                  }}
                >
                  <Close sx={{ fontSize: 24 }} />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={!isFormFilled || loading}
                  sx={{
                    width: "fit-content",
                    minWidth: 100,
                    padding: "8px 28px",
                    backgroundColor: "#087619",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    "&:hover": { backgroundColor: "#066915" },
                  }}
                >
                  <Save sx={{ fontSize: 24 }} />
                  {isEditMode ? "Salvar" : "Adicionar"}
                </Button>
              </DialogActions>
            </form>
          ) : null }
        </DialogContent>
      </Dialog>

      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={handleAlertClose}
        />
      )}
    </>
  );
};

export default DisciplineCourse;
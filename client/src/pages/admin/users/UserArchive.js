import React, { useState } from "react";
import DeleteConfirmationDialog from "../../../components/DeleteConfirmationDialog";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import api from "../../../service/api";

const UserArchive = ({
  open,
  onClose,
  userId,
  userName,
  isActive,
  onArchiveSuccess,
}) => {
  const [alert, setAlert] = useState(null);

  const handleArchive = async () => {
    if (!userId) {
      console.error("Erro: userId não fornecido");
      setAlert({
        message: "Erro: ID do usuário não fornecido. Tente novamente.",
        type: "error",
      });
      onClose();
      return;
    }

    try {
      console.log(`Enviando requisição DELETE para /users/${userId}`);
      const response = await api.delete(`/users/${userId}`);
      console.log("Resposta da API:", response);

      if (response.status === 200) {
        setAlert({
          message:
            response.data.message ||
            `Usuário ${isActive ? "inativado" : "ativado"} com sucesso!`,
          type: "success",
        });
        if (onArchiveSuccess) {
          onArchiveSuccess(userId);
        }
        onClose();
      } else {
        console.error("Resposta inesperada da API:", response.data);
        setAlert({
          message:
            "Erro ao alterar o status do usuário. Verifique os dados e tente novamente.",
          type: "error",
        });
        onClose();
      }
    } catch (error) {
      console.error("Erro ao alterar o status do usuário:", error.message);
      if (error.response) {
        console.error("Status do erro:", error.response.status);
        console.error("Detalhes do erro da API:", error.response.data);
        const errorMessage = error.response.data.error || "Erro desconhecido.";
        if (error.response.status === 403) {
          setAlert({
            message:
              "Erro: Você não tem permissão para alterar o status deste usuário.",
            type: "error",
          });
        } else if (error.response.status === 404) {
          setAlert({
            message: "Erro: Usuário não encontrado.",
            type: "error",
          });
        } else {
          setAlert({
            message: errorMessage,
            type: "error",
          });
        }
      } else if (error.request) {
        console.error("Sem resposta do servidor:", error.request);
        setAlert({
          message:
            "Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.",
          type: "error",
        });
      } else {
        console.error("Erro na configuração da requisição:", error.message);
        setAlert({
          message: "Erro inesperado. Tente novamente.",
          type: "error",
        });
      }
      onClose();
    }
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  return (
    <>
      <DeleteConfirmationDialog
        open={open}
        onClose={onClose}
        message={`Deseja realmente ${
          isActive ? "inativar" : "ativar"
        } o usuário '${userName}'?`}
        onConfirm={handleArchive}
        userName=""
      />
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

export default UserArchive;

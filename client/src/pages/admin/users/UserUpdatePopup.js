import React, { useState, useMemo } from 'react';
import UserFormDialog from "../../../components/userForm/UserFormDialog";
import { CustomAlert } from '../../../components/alert/CustomAlert';

const UserUpdatePopup = ({ open, onClose, user, onUpdate }) => {
  const [alert, setAlert] = useState(null);

  // Memoize normalizedUser para evitar novas referências
  const normalizedUser = useMemo(
    () => {
      const userData = {
        id: user?.id || '',
        username: user?.username || '',
        email: user?.email || '',
        accessType: user?.accessType || '',
      };
      console.log('UserUpdatePopup - normalizedUser:', userData); // Log para depuração
      return userData;
    },
    [user]
  );

  // Log para depuração
  console.log('UserUpdatePopup - user:', user);

  const handleSubmitSuccess = (updatedUser) => {
    // Formatar o id conforme as regras
    let formattedId = updatedUser.id;
    const idParts = updatedUser.id.trim().split(/[-_ ]/); // Divide por hífen, underline ou espaço

    if (idParts.length >= 2) {
      // Duas ou mais partes: primeira letra de cada uma das duas primeiras
      formattedId = `${idParts[0][0] || ''}${idParts[1][0] || ''}`.toUpperCase();
    } else if (idParts.length === 1 && idParts[0].length >= 2) {
      // Uma parte: duas primeiras letras
      formattedId = idParts[0].slice(0, 2).toUpperCase();
    } else {
      // Caso especial: parte com menos de 2 caracteres
      formattedId = idParts[0].toUpperCase();
    }

    const completeUser = {
      id: formattedId,
      username: updatedUser.username,
      email: updatedUser.email,
      accessType: updatedUser.accessType,
    };
    console.log('UserUpdatePopup - completeUser:', completeUser); // Log para depuração
    onUpdate(completeUser);
    setAlert({
      message: 'Usuário atualizado com sucesso!',
      type: 'success',
    });
    onClose();
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  return (
    <>
      <UserFormDialog
        open={open}
        onClose={onClose}
        userToEdit={normalizedUser}
        onSubmitSuccess={handleSubmitSuccess}
        isEditMode={true}
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

export default UserUpdatePopup;
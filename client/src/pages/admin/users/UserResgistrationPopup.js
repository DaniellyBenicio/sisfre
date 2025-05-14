import React, { useState } from 'react';
import UserFormDialog from "../../../components/userForm/UserFormDialog";
import { CustomAlert } from "../../../components/alert/CustomAlert";

const UserRegistrationPopup = ({ open, onClose, userToEdit, onRegister }) => {
  const [alert, setAlert] = useState(null);

  const handleSubmitSuccess = (newUser) => {
    onRegister(newUser);
    setAlert({
      message: userToEdit ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!',
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
        userToEdit={userToEdit}
        onSubmitSuccess={handleSubmitSuccess}
        isEditMode={!!userToEdit}
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

export default UserRegistrationPopup;
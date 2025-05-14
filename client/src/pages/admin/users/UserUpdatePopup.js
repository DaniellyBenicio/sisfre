import React, { useState } from 'react';
import UserFormDialog from "../../../components/userForm/UserFormDialog";
import { CustomAlert } from "../../../components/alert/CustomAlert";

const UserUpdatePopup = ({ open, onClose, user, onUpdate }) => {
  const [alert, setAlert] = useState(null);

  const handleSubmitSuccess = (updatedUser) => {
    onUpdate(updatedUser);
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
        userToEdit={user}
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
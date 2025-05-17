import React, { useState } from 'react';
import UserFormDialog from "../../../components/userForm/UserFormDialog";
import { CustomAlert } from '../../../components/alert/CustomAlert';

const UserRegistrationPopup = ({ open, onClose, onRegister }) => {
  const [alert, setAlert] = useState(null);

  const handleSubmitSuccess = (newUser) => {
    onRegister(newUser);
    setAlert({
      message: 'Usuário cadastrado com sucesso!',
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
        onSubmitSuccess={handleSubmitSuccess}
        isEditMode={false}
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
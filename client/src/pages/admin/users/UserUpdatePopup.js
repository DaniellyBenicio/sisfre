import React, { useState } from 'react';
import UserFormDialog from '../../../components/userForm/UserFormDialog';
import { CustomAlert } from '../../../components/alert/CustomAlert';

const UserUpdatePopup = ({ open, onClose, user, onUpdate }) => {
  const [alert, setAlert] = useState(null);

  // Normalizar user para garantir que todos os campos estejam presentes
  const normalizedUser = {
    id: user?.id || '',
    username: user?.username || '',
    email: user?.email || '',
    accessType: user?.accessType || '',
  };

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
        userToEdit={normalizedUser}
        onSubmitSuccess={handleSubmitSuccess}
        isEditMode={true} // Forçar modo de edição
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
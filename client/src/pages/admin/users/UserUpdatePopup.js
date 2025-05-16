import React, { useState, useMemo } from 'react';
import UserEditDialog from "../../../components/userForm/UserEditDialog";
import { CustomAlert } from '../../../components/alert/CustomAlert';

const UserUpdatePopup = ({ open, onClose, user, onUpdate }) => {
  const [alert, setAlert] = useState(null);

  // Memoize normalizedUser para evitar novas referências
  const normalizedUser = useMemo(
    () => ({
      id: user?.id || '',
      username: user?.username || '',
      email: user?.email || '',
      accessType: user?.accessType || '',
    }),
    [user]
  );

  // Log para depuração
  console.log('UserUpdatePopup user:', user);

  const handleSubmitSuccess = (updatedUser) => {
    const completeUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      accessType: updatedUser.accessType,
    };
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
      <UserEditDialog
        open={open}
        onClose={onClose}
        userToEdit={normalizedUser}
        onSubmitSuccess={handleSubmitSuccess}
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
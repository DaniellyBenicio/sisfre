import React, { useState, useMemo } from 'react';
import UserFormDialog from '../../../components/userForm/UserFormDialog';
import { CustomAlert } from '../../../components/alert/CustomAlert';

const UserUpdatePopup = ({ open, onClose, user, onUpdate }) => {
  const [alert, setAlert] = useState(null);

  // Memoize normalizedUser para evitar novas referências
  const normalizedUser = useMemo(() => {
    const userData = {
      id: String(user?.id || ''), // Converte para string
      username: user?.username || '',
      email: user?.email || '',
      accessType: user?.accessType || '',
    };
    console.log('UserUpdatePopup - normalizedUser:', userData); // Log para depuração
    return userData;
  }, [user]);

  // Log para depuração
  console.log('UserUpdatePopup - user:', user);

  const handleSubmitSuccess = (updatedUser) => {
    const completeUser = {
      id: String(updatedUser.id || ''), // Mantém o ID original como string
      username: updatedUser.username,
      email: updatedUser.email,
      accessType: updatedUser.accessType,
    };
    console.log('UserUpdatePopup - completeUser:', completeUser); // Log para depuração
    onUpdate(completeUser); // Chama onUpdate com o usuário atualizado
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
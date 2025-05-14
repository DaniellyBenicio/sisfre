import React from 'react';
import UserFormDialog from "../../../components/userForm/UserFormDialog";

const UserRegistrationPopup = ({ open, onClose, userToEdit, onRegister }) => {
  return (
    <UserFormDialog
      open={open}
      onClose={onClose}
      userToEdit={userToEdit}
      onSubmitSuccess={onRegister}
      isEditMode={false}
    />
  );
};

export default UserRegistrationPopup;
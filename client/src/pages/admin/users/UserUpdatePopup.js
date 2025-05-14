import React from 'react';
import UserFormDialog from "../../../components/userForm/UserFormDialog";

const UserUpdatePopup = ({ open, onClose, user, onUpdate }) => {
  return (
    <UserFormDialog
      open={open}
      onClose={onClose}
      userToEdit={user}
      onSubmitSuccess={onUpdate}
      isEditMode={true}
    />
  );
};

export default UserUpdatePopup;
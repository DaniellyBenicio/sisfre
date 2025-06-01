import React, { useState } from 'react';
import CalendarFormDialog from "../../../components/CalendarForm/CalendarFormDialog";
import { CustomAlert } from '../../../components/alert/CustomAlert';

const CalendarRegistrationPopup = ({ open, onClose, onRegister }) => {
  const [alert, setAlert] = useState(null);

  const handleSubmitSuccess = (newCalendar) => {
    onRegister(newCalendar);
    setAlert({
      message: 'Calendário cadastrado com sucesso!',
      type: 'success',
    });
    onClose();
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  return (
    <>
      <CalendarFormDialog
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

export default CalendarRegistrationPopup;
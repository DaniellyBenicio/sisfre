
     import React, { useState, useMemo } from 'react';
     import CalendarFormDialog from "../../../components/CalendarForm/CalendarFormDialog";
     import { CustomAlert } from "../../../components/alert/CustomAlert";

     const CalendarUpdatePopup = ({ open, onClose, calendar, onUpdate }) => {
       const [alert, setAlert] = useState(null);

       console.log('CalendarUpdatePopup - onUpdate:', typeof onUpdate); // Debug

       const normalizedCalendar = useMemo(() => {
         const calendarData = {
           id: String(calendar?.id || ''),
           type: calendar?.type || '',
           year: String(calendar?.year || ''),
           period: String(calendar?.period || ''),
           startDate: calendar?.startDate || '',
           endDate: calendar?.endDate || '',
         };
         console.log('CalendarUpdatePopup - normalizedCalendar:', calendarData);
         return calendarData;
       }, [calendar]);

       const handleSubmitSuccess = (updatedCalendar, isEditMode) => {
         const completeCalendar = {
           id: String(updatedCalendar.id || ''),
           type: updatedCalendar.type,
           year: String(updatedCalendar.year),
           period: String(updatedCalendar.period),
           startDate: updatedCalendar.startDate,
           endDate: updatedCalendar.endDate,
         };
         console.log('CalendarUpdatePopup - completeCalendar:', completeCalendar);
         if (typeof onUpdate !== 'function') {
           console.error('CalendarUpdatePopup - onUpdate não é uma função:', onUpdate);
           setAlert({
             message: 'Erro: Não foi possível atualizar o calendário. Contate o suporte.',
             type: 'error',
           });
           return;
         }
         onUpdate(completeCalendar);
         setAlert({
           message: 'Calendário atualizado com sucesso!',
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
             calendarToEdit={normalizedCalendar}
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

     export default CalendarUpdatePopup;
     
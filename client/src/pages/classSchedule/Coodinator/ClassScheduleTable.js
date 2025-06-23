import { Stack, Typography } from "@mui/material";
import Tables from "../../../components/homeScreen/Tables";

const ClassScheduleTable = ({ classesSchedule, onDelete, onUpdate, search, renderActions, showActions }) => {
	const headers = [
		{ key: "calendar", label: "Calendário" },
		{ key: "class", label: "Turma" },
		{ key: "turn", label: "Turno" },
	];

	const renderMobileRow = (classSchedule) => (
		<Stack spacing={0.5}>
			<Typography>
				<strong>Calendário:</strong> {classSchedule.calendar}
			</Typography>
			<Typography>
				<strong>Turma:</strong> {classSchedule.class}
			</Typography>
			<Typography>
				<strong>Turno:</strong> {classSchedule.turn}
			</Typography>
		</Stack>
	);

	return (
		<Tables
			data={classesSchedule}
			headers={headers}
			onDelete={onDelete} 
			onUpdate={onUpdate}
			search={search}
			renderMobileRow={renderMobileRow}
			renderActions={renderActions}
      showActions={showActions} 
		/>
	);
};

export default ClassScheduleTable;
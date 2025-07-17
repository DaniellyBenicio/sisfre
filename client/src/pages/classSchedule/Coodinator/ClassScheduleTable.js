import { Stack, Typography } from "@mui/material";
import Tables from "../../../components/homeScreen/Tables";

const ClassScheduleTable = ({ classesSchedule, onDelete, onUpdate, search, renderActions, showActions }) => {
	const accessType = localStorage.getItem("accessType") || "";

	const headers = [
		{ key: "calendar", label: "Calendário" },
		{ key: "class", label: "Turma" },
		...(accessType === "Admin" ? [{ key: "course", label: "Curso" }] : []),
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
			{accessType === "Admin" && (
				<Typography>
					<strong>Curso:</strong> {classSchedule.course || "N/A"}
				</Typography>
			)}
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
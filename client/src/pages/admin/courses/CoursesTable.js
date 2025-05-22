import { Stack, Typography } from "@mui/material";
import DataTable from "../../../components/homeScreen/DataTable"; 

const coursesTable = ({ courses, onDelete, onUpdate, search }) => {
	const headers = [
		{ key: "acronym", label: "Sigla" },
		{ key: "name", label: "Nome" },
		{ key: "type", label: "Tipo" },
		{ key: "coordinatorName", label: "Coordenador" },
	];

	const mappedCourses = courses.map((course) => ({
		...course,
		coordinatorName: course.coordinator?.name || "N/A",
	}));

	const renderMobileRow = (course) => (
		<Stack spacing={0.5}>
			<Typography>
				<strong>Sigla:</strong> {course.acronym}
			</Typography>
			<Typography>
				<strong>Nome:</strong> {course.name}
			</Typography>
			<Typography>
				<strong>Tipo:</strong> {course.type}
			</Typography>
			<Typography>
				<strong>Coordenador:</strong> {course.coordinatorName}
			</Typography>
		</Stack>
	);

	return (
		<DataTable
			data={courses}
			headers={headers}
			onDelete={onDelete}
			onUpdate={onUpdate}
			search={search}
			renderMobileRow={renderMobileRow}
		/>
	);
};

export default coursesTable;
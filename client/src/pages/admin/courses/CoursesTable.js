import React, { useState, useMemo } from "react";
import {
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Stack,
	Typography,
	useMediaQuery,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import Paginate from "../../../components/paginate/Paginate";

const CoursesTable = ({ courses, onDelete, onUpdate, search, setAlert  }) => {
	const isMobile = useMediaQuery("(max-width:600px)");
	const [page, setPage] = useState(1);
	const [rowsPerPage] = useState(7);

	const handleChangePage = (newPage) => {
    setPage(newPage);
  };

	const visibleCourses = useMemo(() => {
		if (!Array.isArray(courses)) return [];
		const startIndex = (page - 1) * rowsPerPage;
		const endIndex = startIndex + rowsPerPage;
		return courses.slice(startIndex, endIndex);
	}, [courses, page, rowsPerPage]);

	const tableHeadStyle = {
		fontWeight: "bold",
		backgroundColor: "#087619",
		color: "#fff",
		borderRight: "1px solid #fff",
		padding: { xs: "4px", sm: "6px" },
		height: "30px",
		lineHeight: "30px",
	};

	const tableBodyCellStyle = {
		borderRight: "1px solid #e0e0e0",
		padding: { xs: "4px", sm: "6px" },
		height: "30px",
		lineHeight: "30px",
	};


	if (isMobile) {
		return (
			<Stack spacing={1} sx={{ width: "100%" }}>
				{visibleCourses.length === 0 && search ? (
					<Paper sx={{ p: 1 }}>
						<Typography align="center">Curso não encontrado!</Typography>
					</Paper>
				) : (
					visibleCourses.map((course) => (
						<Paper key={course.id} sx={{ p: 1 }}>
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
								<Stack direction="row" spacing={1} justifyContent="center">
									<IconButton
										onClick={() => onUpdate(course)}
										sx={{
											color: "#087619",
											"&:hover": { color: "#065412" },
										}}
									>
										<Edit />
									</IconButton>
									<IconButton color="error" onClick={() => onDelete(course)}>
										<Delete />
									</IconButton>
								</Stack>
							</Stack>
						</Paper>
					))
				)}
				<Paginate
					count={Math.ceil(
						(Array.isArray(courses) ? courses.length : 0) / rowsPerPage
					)}
					page={page}
					onChange={(event, newPage) => {
						handleChangePage(newPage);
					}}
				/>
			</Stack>
		);
	}

	return (
		<>
			<TableContainer
				component={Paper}
				sx={{
					width: "100%",
					maxWidth: "1200px",
					margin: "0 auto"
				}}
			>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell align="center" sx={tableHeadStyle}>
								Sigla
							</TableCell>
							<TableCell align="center" sx={tableHeadStyle}>
								Nome
							</TableCell>
							<TableCell align="center" sx={tableHeadStyle}>
								Tipo
							</TableCell>
							<TableCell align="center" sx={tableHeadStyle}>
								Coordenador
							</TableCell>
							<TableCell align="center" sx={tableHeadStyle}>
								Ações
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{visibleCourses.length === 0 && search ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={tableBodyCellStyle}>
									Curso não encontrado.
								</TableCell>
							</TableRow>
						) : (
							visibleCourses.map((course) => (
								<TableRow key={course.id}>
									<TableCell align="center" sx={tableBodyCellStyle}>
										{course.acronym}
									</TableCell>
									<TableCell align="center" sx={tableBodyCellStyle}>
										{course.name}
									</TableCell>
									<TableCell align="center" sx={tableBodyCellStyle}>
										{course.type}
									</TableCell>
									<TableCell align="center" sx={tableBodyCellStyle}>
										{course.coordinatorName}
									</TableCell>
									<TableCell align="center" sx={tableBodyCellStyle}>
										<IconButton
											sx={{
												color: "#087619",
												"&:hover": { color: "#065412" },
											}}
										>
											<Edit />
										</IconButton>
										<IconButton color="error" onClick={() => onDelete(course)}>
											<Delete />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>
			<Paginate
				count={Math.ceil(
					(Array.isArray(courses) ? courses.length : 0) / rowsPerPage
				)}
				page={page}
				onChange={(event, newPage) => {
					handleChangePage(newPage);
				}}
			/>
		</>
	);
};

export default CoursesTable;

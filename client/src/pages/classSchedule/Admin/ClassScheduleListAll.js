import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	IconButton,
	FormControl,
	InputLabel,
	MenuItem,
} from "@mui/material";
import { FilterListAlt, ArrowBack, Visibility } from "@mui/icons-material";
import { CustomAlert } from "../../../components/alert/CustomAlert";
import ClassScheduleTable from "../Coodinator/ClassScheduleTable";
import { StyledSelect } from "../../../components/inputs/Input";
import { useNavigate } from "react-router-dom";
import api from "../../../service/api";

const ClassScheduleListAll = ({ setAuthenticated }) => {
	const [schedules, setSchedules] = useState([]);
	const [search, setSearch] = useState("");
	const [alert, setAlert] = useState(null);
	const [loading, setLoading] = useState(false);
	const [selectedCalendar, setSelectedCalendar] = useState("");
	const [selectedClass, setSelectedClass] = useState("");
	const [selectedCourse, setSelectedCourse] = useState("");
	const [calendars, setCalendars] = useState([]);
	const [classes, setClasses] = useState([]);
	const [courses, setCourses] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const response = await api.get("/class-schedules");
				console.log("API Response:", response.data);

				const determineTurn = (turnCounts) => {
					const { MATUTINO, VESPERTINO, NOTURNO } = turnCounts || {};
					const totalLessons = (MATUTINO || 0) + (VESPERTINO || 0) + (NOTURNO || 0);

					if (totalLessons === 0) {
						return "N/A";
					}
					const shifts = [
						{ shift: "Manhã", count: MATUTINO || 0 },
						{ shift: "Tarde", count: VESPERTINO || 0 },
						{ shift: "Noite", count: NOTURNO || 0 },
					];

					const sortedShifts = shifts.sort((a, b) => b.count - a.count);
					const maxLessons = sortedShifts[0].count;
					const secondMaxLessons = sortedShifts[1].count;

					if (totalLessons <= 4) {
						const maxShifts = shifts.filter((s) => s.count === maxLessons);
						if (maxShifts.length > 1) {
							return "Integral";
						}
						return maxShifts[0].shift;
					}

					const threshold = 5;
					if (maxLessons > 0 && secondMaxLessons > 0 && maxLessons - secondMaxLessons <= threshold) {
						return "Integral";
					}
					return sortedShifts[0].shift;
				};

				const schedules = Array.isArray(response.data.schedules)
					? response.data.schedules
						.filter((schedule) => schedule.isActive !== false)
						.map((schedule) => ({
							id: schedule.id,
							calendar: schedule.calendar || "N/A",
							class: schedule.turma || "N/A",
							nome_curso: schedule.nome_curso || "N/A",
        			course: schedule.sigla_curso || "N/A",
							turn: determineTurn(schedule.turnCounts),
							details: schedule.details || {},
						}))
					: [];

				setSchedules(schedules);

				const uniqueCalendars = [
					...new Set(schedules.map((item) => item.calendar)),
				].filter((cal) => cal && cal !== "N/A");
				const uniqueClasses = [
					...new Set(schedules.map((item) => item.class)),
				].filter((cls) => cls && cls !== "N/A");
				const uniqueCourses = [
					...new Set(schedules.map((item) => item.course)),
				].filter((course) => course && course !== "N/A");

				setCalendars(uniqueCalendars);
				setClasses(uniqueClasses);
				setCourses(uniqueCourses);
			} catch (error) {
				console.error("API Error:", error.response || error);
				if (error.response?.status !== 404 && error.response?.data?.message) {
					setAlert({
						message: error.response.data.message || "Erro ao carregar as grades arquivadas.",
						type: "error",
					});
				}
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleViewClick = (item) => {
		navigate(`/class-schedule/details/${item.id}`);
	};

	const handleAlertClose = () => {
		setAlert(null);
	};

	const filteredSchedules = schedules.filter((item) => {
		const matchesSearch = Object.values(item).some((val) =>
			val?.toString().toLowerCase().includes(search.toLowerCase())
		);
		const matchesCalendar = selectedCalendar ? item.calendar === selectedCalendar : true;
		const matchesClass = selectedClass ? item.class === selectedClass : true;
		const matchesCourse = selectedCourse ? item.course === selectedCourse : true;
		return matchesSearch && matchesCalendar && matchesClass && matchesCourse;
	});

	return (
		<Box
			sx={{
				p: 2,
				width: "100%",
				maxWidth: "1200px",
				margin: "0 auto",
				display: "flex",
				flexDirection: "column",
				gap: 1,
			}}
		>
			<Box
				sx={{
					position: "relative",
					alignItems: "center",
					gap: 1,
					mb: 3,
				}}
			>
				<IconButton onClick={() => navigate("/class-schedule/options")}
					sx={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", mt: 2, ml: -1 }}
				>
					<ArrowBack sx={{ color: "green", fontSize: "2.2rem" }} />
				</IconButton>
				<Typography variant="h5" align="center" sx={{ fontWeight: "bold", mt: 2 }}>
					Grade de Turmas
				</Typography>
			</Box>

			{alert && (
				<CustomAlert
					message={alert.message}
					type={alert.type}
					onClose={handleAlertClose}
				/>
			)}

			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: { xs: "stretch", sm: "center" },
					flexDirection: { xs: "column", sm: "row" },
					gap: 1,
					mb: 1,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Box
						sx={{
							borderRadius: "8px",
							p: 1,
							display: "flex",
							flexDirection: { xs: "column", sm: "row" },
							gap: 2,
							ml: -1,
							width: { xs: "100%", sm: "auto" },
						}}
					>
						<FormControl
							sx={{
								minWidth: { xs: "100%", sm: 200 },
								"& .MuiInputBase-root": {
									height: 36,
									display: "flex",
									alignItems: "center",
								},
								"& .MuiInputLabel-root": {
									transform: "translate(14px, 7px) scale(1)",
									"&.Mui-focused, &.MuiInputLabel-shrink": {
										transform: "translate(14px, -6px) scale(0.75)",
										color: "#000000",
									},
								},
								"& .MuiSelect-select": {
									display: "flex",
									alignItems: "center",
									height: "100% !important",
								},
							}}
						>
							<InputLabel id="calendar-filter-label">Calendário</InputLabel>
							<StyledSelect
								labelId="calendar-filter-label"
								value={selectedCalendar}
								label="Calendário"
								onChange={(e) => setSelectedCalendar(e.target.value)}
								sx={{
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "rgba(0, 0, 0, 0.23)",
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: "#000000",
									},
								}}
								MenuProps={{
									PaperProps: {
										sx: {
											maxHeight: "200px",
											overflowY: "auto",
											width: "auto",
											"& .MuiMenuItem-root": {
												minHeight: "36px",
												display: "flex",
												alignItems: "center",
											},
											"& .MuiMenuItem-root.Mui-selected": {
												backgroundColor: "#D5FFDB",
												"&:hover": {
													backgroundColor: "#C5F5CB",
												},
											},
											"& .MuiMenuItem-root:hover": {
												backgroundColor: "#D5FFDB",
											},
										},
									},
								}}
							>
								<MenuItem value="">Todos</MenuItem>
								{calendars.map((calendar) => (
									<MenuItem key={calendar} value={calendar}>
										{calendar}
									</MenuItem>
								))}
							</StyledSelect>
						</FormControl>
						<FormControl
							sx={{
								minWidth: { xs: "100%", sm: 200 },
								"& .MuiInputBase-root": {
									height: 36,
									display: "flex",
									alignItems: "center",
								},
								"& .MuiInputLabel-root": {
									transform: "translate(14px, 7px) scale(1)",
									"&.Mui-focused, &.MuiInputLabel-shrink": {
										transform: "translate(14px, -6px) scale(0.75)",
										color: "#000000",
									},
								},
								"& .MuiSelect-select": {
									display: "flex",
									alignItems: "center",
									height: "100% !important",
								},
							}}
						>
							<InputLabel id="class-filter-label">Turma</InputLabel>
							<StyledSelect
								labelId="class-filter-label"
								value={selectedClass}
								label="Turma"
								onChange={(e) => setSelectedClass(e.target.value)}
								sx={{
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "rgba(0, 0, 0, 0.23)",
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: "#000000",
									},
								}}
								MenuProps={{
									PaperProps: {
										sx: {
											maxHeight: "200px",
											overflowY: "auto",
											width: "auto",
											"& .MuiMenuItem-root": {
												minHeight: "36px",
												display: "flex",
												alignItems: "center",
											},
											"& .MuiMenuItem-root.Mui-selected": {
												backgroundColor: "#D5FFDB",
												"&:hover": {
													backgroundColor: "#C5F5CB",
												},
											},
											"& .MuiMenuItem-root:hover": {
												backgroundColor: "#D5FFDB",
											},
										},
									},
								}}
							>
								<MenuItem value="">Todas</MenuItem>
								{classes.map((cls) => (
									<MenuItem key={cls} value={cls}>
										{cls}
									</MenuItem>
								))}
							</StyledSelect>
						</FormControl>
						<FormControl
							sx={{
								minWidth: { xs: "100%", sm: 200 },
								"& .MuiInputBase-root": {
									height: 36,
									display: "flex",
									alignItems: "center",
								},
								"& .MuiInputLabel-root": {
									transform: "translate(14px, 7px) scale(1)",
									"&.Mui-focused, &.MuiInputLabel-shrink": {
										transform: "translate(14px, -6px) scale(0.75)",
										color: "#000000",
									},
								},
								"& .MuiSelect-select": {
									display: "flex",
									alignItems: "center",
									height: "100% !important",
								},
							}}
						>
							<InputLabel id="course-filter-label">Curso</InputLabel>
							<StyledSelect
								labelId="course-filter-label"
								value={selectedCourse}
								label="Curso"
								onChange={(e) => setSelectedCourse(e.target.value)}
								sx={{
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "rgba(0, 0, 0, 0.23)",
									},
									"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
										borderColor: "#000000",
									},
								}}
								MenuProps={{
									PaperProps: {
										sx: {
											maxHeight: "200px",
											overflowY: "auto",
											width: "auto",
											"& .MuiMenuItem-root": {
												minHeight: "36px",
												display: "flex",
												alignItems: "center",
											},
											"& .MuiMenuItem-root.Mui-selected": {
												backgroundColor: "#D5FFDB",
												"&:hover": {
													backgroundColor: "#C5F5CB",
												},
											},
											"& .MuiMenuItem-root:hover": {
												backgroundColor: "#D5FFDB",
											},
										},
									},
								}}
							>
								<MenuItem value="">Todos</MenuItem>
								{courses.map((course) => (
									<MenuItem key={course} value={course}>
										{course}
									</MenuItem>
								))}
							</StyledSelect>
						</FormControl>
					</Box>
				</Box>
			</Box>

			<ClassScheduleTable
				classesSchedule={filteredSchedules}
				search={search}
				showActions={true}
				loading={loading}
				renderActions={(item) => (
					<IconButton
						onClick={() => handleViewClick(item)}
						sx={{ color: "#666666", "&:hover": { color: "#535252" } }}
					>
						<Visibility />
					</IconButton>
				)}
			/>
		</Box>
	);
};

export default ClassScheduleListAll;
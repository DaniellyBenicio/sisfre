import React, { useState } from "react";
import {
	Box,
	Typography,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Grid,
	Paper,
	CssBaseline,
	IconButton
} from "@mui/material";
import { ArrowBack, Close, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../../components/SideBar";
import { StyledSelect } from "../../../components/inputs/Input";

const ClassScheduleCreate = ({ setAuthenticated }) => {
	const [formData, setFormData] = useState({
		class: "",
		turn: "",
		calendar: "",
		discipline: "",
		professor: "",
		dayOfWeek: "",
		startTime: "",
		endTime: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleSubmit = () => {
		console.log("Formulário enviado:", formData);
		// Aqui você pode fazer o POST para sua API
	};

	const navigate = useNavigate();

	return (
		<>
			<Box display="flex">
				<CssBaseline />
				<Sidebar setAuthenticated={setAuthenticated} />

				<Box sx={{ flexGrow: 1, p: 4, mt: 4 }}>
					<IconButton onClick={() => navigate('/class-schedule')} sx={{ position: 'absolute', left: 24, top: 24 }}>
						<ArrowBack sx={{ color: 'green' }} />
					</IconButton>
					<Typography variant="h5" gutterBottom textAlign="center">
						Cadastrar Grade de Turma
					</Typography>

					{/* Seção Aula */}
					<Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
						<Typography variant="h6" color="green" gutterBottom marginLeft="5px">
							Aula
						</Typography>
						<Grid container spacing={2} mt="2px">
							<Grid item xs={12} md={6}>
								<FormControl fullWidth required sx={{ minWidth: 190, maxWidth: 400, marginLeft: "5px" }}>
									<InputLabel>Turma</InputLabel>
									<Select name="class" value={formData.class} onChange={handleChange}>
										<MenuItem value="Turma A">Turma A</MenuItem>
										<MenuItem value="Turma B">Turma B</MenuItem>
										<MenuItem value="Turma C">Turma C</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth required sx={{ minWidth: 190, maxWidth: 400 }}>
									<InputLabel>Turno</InputLabel>
									<Select name="turn" value={formData.turn} onChange={handleChange}>
										<MenuItem value="Manhã">Manhã</MenuItem>
										<MenuItem value="Tarde">Tarde</MenuItem>
										<MenuItem value="Noite">Noite</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth required sx={{ minWidth: 320, maxWidth: 500 }}>
									<InputLabel>Calendário</InputLabel>
									<Select name="calendar" value={formData.calendar} onChange={handleChange}>
										<MenuItem value="2025/1">2025/1</MenuItem>
										<MenuItem value="2025/2">2025/2</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth required sx={{ minWidth: 320, maxWidth: 500 }}>
									<InputLabel>Disciplina</InputLabel>
									<Select name="discipline" value={formData.discipline} onChange={handleChange}>
										<MenuItem value="Matemática">Matemática</MenuItem>
										<MenuItem value="Física">Física</MenuItem>
										<MenuItem value="Química">Química</MenuItem>
										<MenuItem value="Biologia">Biologia</MenuItem>
									</Select>
								</FormControl>
							</Grid>
						</Grid>
					</Box>

					{/* Seção Horários */}
					<Box component={Paper} elevation={3} sx={{ p: 5, m: 4, borderRadius: 3 }}>
						<Typography variant="h6" color="green" gutterBottom >
							Horários
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth required sx={{ minWidth: 200, maxWidth: 400 }}>
									<InputLabel>Professor</InputLabel>
									<Select name="professor" value={formData.professor} onChange={handleChange}>
										<MenuItem value="João Silva">João Silva</MenuItem>
										<MenuItem value="Maria Oliveira">Maria Oliveira</MenuItem>
										<MenuItem value="Carlos Souza">Carlos Souza</MenuItem>
										<MenuItem value="Ana Pereira">Ana Pereira</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={6}>
								<FormControl fullWidth required sx={{ minWidth: 200, maxWidth: 400 }}>
									<InputLabel>Dia da Semana</InputLabel>
									<Select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
										<MenuItem value="Segunda">Segunda</MenuItem>
										<MenuItem value="Terça">Terça</MenuItem>
										<MenuItem value="Quarta">Quarta</MenuItem>
										<MenuItem value="Quinta">Quinta</MenuItem>
										<MenuItem value="Sexta">Sexta</MenuItem>
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									fullWidth
									label="Horário de Início"
									type="time"
									name="startTime"
									value={formData.startTime}
									onChange={handleChange}
									sx={{ minWidth: 200, maxWidth: 400 }}
									InputLabelProps={{
										shrink: true,
									}}
									required
								/>
							</Grid>
							<Grid item xs={12} md={6}>
								<TextField
									fullWidth
									label="Horário de Fim"
									type="time"
									name="endTime"
									value={formData.endTime}
									onChange={handleChange}
									sx={{ minWidth: 200, maxWidth: 400 }}
									InputLabelProps={{
										shrink: true,
									}}
									required
								/>
							</Grid>
						</Grid>
					</Box>

					{/* Botões */}
					<Box display="flex" mt={4}
						sx={{
							justifyContent: "center",
							gap: 2,
							padding: "10px 24px",
							marginTop: "35px",
						}}
					>
						<Button variant="contained" color="error" 
							sx={{
								width: "fit-content",
								minWidth: 100,
								padding: { xs: "8px 20px", sm: "8px 28px" },
								borderRadius: "8px",
								textTransform: "none",
								fontWeight: "bold",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								backgroundColor: "#F01424",
								"&:hover": { backgroundColor: "#D4000F" },
							}}
						>
							<Close sx={{ fontSize: 24 }} />
							Cancelar
						</Button>
						<Button variant="contained" color="success" onClick={handleSubmit}
							sx={{
								width: "fit-content",
								minWidth: 100,
								padding: { xs: "8px 20px", sm: "8px 28px" },
								backgroundColor: "#087619",
								borderRadius: "8px",
								textTransform: "none",
								fontWeight: "bold",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								"&:hover": { backgroundColor: "#066915" },
							}}
						>
							<Save sx={{ fontSize: 24 }} />
							Cadastrar
						</Button>
					</Box>
				</Box>
			</Box>
		</>
	);
};

export default ClassScheduleCreate;
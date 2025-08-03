import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Box,
	Typography,
	FormControl,
	InputLabel,
	Button,
	Stack,
	MenuItem,
	Pagination,
	IconButton,
	CssBaseline,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ClassAntepositionTable from '../../disciplines/Teacher/Anteposition/ClassAntepositionTable';
import { CustomAlert } from '../../../components/alert/CustomAlert';
import { StyledSelect } from '../../../components/inputs/Input';
import api from '../../../service/api';
import Sidebar from '../../../components/SideBar';

const INSTITUTIONAL_COLOR = "#307c34";

const ClassAntepositionList = ({ setAuthenticated }) => {
	const [antepositions, setAntepositions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [alert, setAlert] = useState(null);
	const [filterTurma, setFilterTurma] = useState('all');
	const [filterDisciplina, setFilterDisciplina] = useState('all');
	const [filterPeriod, setFilterPeriod] = useState('all');
	const [filterStatus, setFilterStatus] = useState('all');
	const [openToggleActiveDialog, setOpenToggleActiveDialog] = useState(false);
	const [antepositionToToggleActive, setAntepositionToToggleActive] = useState(null);
	const [page, setPage] = useState(1);
	const rowsPerPage = 7;
	const navigate = useNavigate();
	const accessType = localStorage.getItem('accessType') || 'Professor';

	const handleAlertClose = () => {
		setAlert(null);
	};

	useEffect(() => {
		const fetchAntepositions = async () => {
			try {
				setLoading(true);
				const response = await api.get('/getRequest', {
					params: { type: 'anteposicao' },
				});
				const antepositionsArray = response.data.map((item) => ({
					id: item.id,
					professor: item.professor?.username || 'Desconhecido',
					professorId: item.userId,
					coordinatorId: item.coordinatorId || 'coord1',
					turma: item.disciplinaclasse?.code || 'Desconhecido',
					disciplina: item.disciplinaclasse?.name || 'Desconhecido',
					quantidade: item.quantity.toString(),
					data: item.date,
					fileName: item.annex ? item.annex.split('/').pop() : 'N/A',
					observacao: item.observation || 'N/A',
					isActive: true,
					status: item.validated === true ? 'Aprovado' : item.validated === false && item.observationCoordinator ? 'Rejeitado' : 'Pendente',
				})).sort((a, b) => a.turma.toLowerCase().localeCompare(b.turma.toLowerCase()));
				setAntepositions(antepositionsArray);
			} catch (error) {
				console.error('Erro ao carregar anteposições:', error);
				setAlert({
					message: 'Erro ao carregar anteposições.',
					type: 'error',
				});
				setAntepositions([]);
			} finally {
				setLoading(false);
			}
		};
		fetchAntepositions();
	}, []);

	useEffect(() => {
		setPage(1);
	}, [filterTurma, filterDisciplina, filterPeriod, filterStatus]);

	const handleRegisterOrUpdate = async (updatedAnteposition, isEditMode) => {
		try {
			if (isEditMode) {
				await api.put(`/updateRequest/${updatedAnteposition.id}`, {
					quantity: parseInt(updatedAnteposition.quantidade),
					date: updatedAnteposition.data,
					observation: updatedAnteposition.observacao,
				});
				setAlert({
					message: `Anteposição para ${updatedAnteposition.turma} atualizada com sucesso!`,
					type: 'success',
				});
			} else {
				const formData = new FormData();
				formData.append('userId', localStorage.getItem('userId'));
				formData.append('courseClassId', updatedAnteposition.courseClassId);
				formData.append('type', 'anteposicao');
				formData.append('quantity', parseInt(updatedAnteposition.quantidade));
				formData.append('date', updatedAnteposition.data);
				formData.append('annex', updatedAnteposition.file);
				formData.append('observation', updatedAnteposition.observacao);
				await api.post('/createRequest', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
				setAlert({
					message: `Anteposição para ${updatedAnteposition.turma} cadastrada com sucesso!`,
					type: 'success',
				});
			}
			setPage(1);
			navigate('/class-anteposition');
			const response = await api.get('/getRequest', { params: { type: 'anteposicao' } });
			setAntepositions(response.data.map((item) => ({
				id: item.id,
				professor: item.professor?.username || 'Desconhecido',
				professorId: item.userId,
				coordinatorId: item.coordinatorId || 'coord1',
				turma: item.disciplinaclasse?.code || 'Desconhecido',
				disciplina: item.disciplinaclasse?.name || 'Desconhecido',
				quantidade: item.quantity.toString(),
				data: item.date,
				fileName: item.annex ? item.annex.split('/').pop() : 'N/A',
				observacao: item.observation || 'N/A',
				isActive: true,
				status: item.validated === true ? 'Aprovado' : item.validated === false && item.observationCoordinator ? 'Rejeitado' : 'Pendente',
			})).sort((a, b) => a.turma.toLowerCase().localeCompare(b.turma.toLowerCase())));
		} catch (error) {
			console.error('Erro ao atualizar lista de anteposições:', error);
			setAlert({
				message: 'Erro ao atualizar a lista de anteposições.',
				type: 'error',
			});
		}
	};

	const handleEditAnteposition = (anteposition) => {
		navigate(`/class-anteposition/edit/${anteposition.id}`, { state: { anteposition } });
	};

	const handleApprove = async (antepositionId) => {
		try {
			await api.put(`/updateRequest/${antepositionId}`, { validated: true });
			setAlert({
				message: 'Anteposição aprovada com sucesso!',
				type: 'success',
			});
			const response = await api.get('/getRequest', { params: { type: 'anteposicao' } });
			setAntepositions(response.data.map((item) => ({
				id: item.id,
				professor: item.professor?.username || 'Desconhecido',
				professorId: item.userId,
				coordinatorId: item.coordinatorId || 'coord1',
				turma: item.disciplinaclasse?.code || 'Desconhecido',
				disciplina: item.disciplinaclasse?.name || 'Desconhecido',
				quantidade: item.quantity.toString(),
				data: item.date,
				fileName: item.annex ? item.annex.split('/').pop() : 'N/A',
				observacao: item.observation || 'N/A',
				isActive: true,
				status: item.validated === true ? 'Aprovado' : item.validated === false && item.observationCoordinator ? 'Rejeitado' : 'Pendente',
			})));
		} catch (error) {
			console.error('Erro ao aprovar anteposição:', error);
			setAlert({
				message: 'Erro ao aprovar anteposição.',
				type: 'error',
			});
		}
	};

	const handleReject = async (antepositionId) => {
		try {
			await api.put(`/updateRequest/${antepositionId}`, {
				validated: false,
				observationCoordinator: 'Rejeitado pelo coordenador',
			});
			setAlert({
				message: 'Anteposição rejeitada com sucesso!',
				type: 'success',
			});
			const response = await api.get('/getRequest', { params: { type: 'anteposicao' } });
			setAntepositions(response.data.map((item) => ({
				id: item.id,
				professor: item.professor?.username || 'Desconhecido',
				professorId: item.userId,
				coordinatorId: item.coordinatorId || 'coord1',
				turma: item.disciplinaclasse?.code || 'Desconhecido',
				disciplina: item.disciplinaclasse?.name || 'Desconhecido',
				quantidade: item.quantity.toString(),
				data: item.date,
				fileName: item.annex ? item.annex.split('/').pop() : 'N/A',
				observacao: item.observation || 'N/A',
				isActive: true,
				status: item.validated === true ? 'Aprovado' : item.validated === false && item.observationCoordinator ? 'Rejeitado' : 'Pendente',
			})));
		} catch (error) {
			console.error('Erro ao rejeitar anteposição:', error);
			setAlert({
				message: 'Erro ao rejeitar anteposição.',
				type: 'error',
			});
		}
	};

	const handleToggleActiveClick = (antepositionId) => {
		const anteposition = antepositions.find((a) => a.id === antepositionId);
		setAntepositionToToggleActive(anteposition);
		setOpenToggleActiveDialog(true);
	};

	const handleConfirmToggleActive = async () => {
		try {
			await api.delete(`/deleteRequest/${antepositionToToggleActive.id}`);
			setAlert({
				message: `Anteposição para ${antepositionToToggleActive.turma} inativada com sucesso!`,
				type: 'success',
			});
			const response = await api.get('/getRequest', { params: { type: 'anteposicao' } });
			setAntepositions(response.data.map((item) => ({
				id: item.id,
				professor: item.professor?.username || 'Desconhecido',
				professorId: item.userId,
				coordinatorId: item.coordinatorId || 'coord1',
				turma: item.disciplinaclasse?.code || 'Desconhecido',
				disciplina: item.disciplinaclasse?.name || 'Desconhecido',
				quantidade: item.quantity.toString(),
				data: item.date,
				fileName: item.annex ? item.annex.split('/').pop() : 'N/A',
				observacao: item.observation || 'N/A',
				isActive: true,
				status: item.validated === true ? 'Aprovado' : item.validated === false && item.observationCoordinator ? 'Rejeitado' : 'Pendente',
			})));
			setPage(1);
		} catch (error) {
			console.error('Erro ao inativar anteposição:', error);
			setAlert({
				message: 'Erro ao inativar anteposição.',
				type: 'error',
			});
		} finally {
			setOpenToggleActiveDialog(false);
			setAntepositionToToggleActive(null);
		}
	};

	const handleGoBack = () => {
		navigate('/teachers-management');
	};

	const turmas = [...new Set(antepositions.map(a => a.turma))].sort();
	const disciplinas = [...new Set(antepositions.map(a => a.disciplina))].sort();

	const applyFilters = (data) => {
		let filtered = Array.isArray(data) ? [...data] : [];

		if (filterTurma !== 'all') {
			filtered = filtered.filter((rep) => rep.turma === filterTurma);
		}

		if (filterDisciplina !== 'all') {
			filtered = filtered.filter((rep) => rep.disciplina === filterDisciplina);
		}

		if (filterStatus !== 'all') {
			filtered = filtered.filter((rep) => rep.status === filterStatus);
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		filtered = filtered.filter(rep => {
			if (!rep.data) return false;
			const repDate = new Date(rep.data + 'T00:00:00');

			switch (filterPeriod) {
				case "yesterday":
					const yesterday = new Date(today);
					yesterday.setDate(today.getDate() - 1);
					return repDate.toDateString() === yesterday.toDateString();
				case "lastWeek":
					const lastWeek = new Date(today);
					lastWeek.setDate(today.getDate() - 7);
					return repDate >= lastWeek && repDate <= today;
				case "lastMonth":
					const lastMonth = new Date(today);
					lastMonth.setMonth(today.getMonth() - 1);
					return repDate >= lastMonth && repDate <= today;
				default:
					return true;
			}
		});

		return filtered;
	};

	const filteredAntepositions = applyFilters(antepositions);
	const totalPages = Math.ceil(filteredAntepositions.length / rowsPerPage);
	const paginatedAntepositions = filteredAntepositions.slice(
		(page - 1) * rowsPerPage,
		page * rowsPerPage
	);

	const commonFormControlSx = {
		width: { xs: "100%", sm: "150px" },
		"& .MuiInputBase-root": {
			height: { xs: 40, sm: 36 },
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
	};

	const commonSelectSx = {
		"& .MuiOutlinedInput-notchedOutline": {
			borderColor: "rgba(0, 0, 0, 0.23)",
		},
		"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
			borderColor: "#000000",
		},
	};

	const commonMenuProps = {
		PaperProps: {
			sx: {
				maxHeight: "200px",
				overflowY: "auto",
				width: "auto",
				"& .MuiMenuItem-root": {
					"&:hover": {
						backgroundColor: "#D5FFDB",
					},
					"&.Mui-selected": {
						backgroundColor: "#E8F5E9",
						"&:hover": {
							backgroundColor: "#D5FFDB",
						},
					},
				},
			},
		},
	};

	return (
		<Box display="fles">
			<CssBaseline />
			<Sidebar setAuthenticated={setAuthenticated} />
			<Box
				sx={{
					p: 3,
					width: '100%',
					maxWidth: '1200px',
					margin: '0 auto',
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 3 }}>
					<IconButton
						onClick={handleGoBack}
						sx={{
							position: 'absolute',
							left: 0,
							color: INSTITUTIONAL_COLOR,
							'&:hover': {
								backgroundColor: 'transparent',
							},
						}}
					>
						<ArrowBack sx={{ fontSize: 35, mt: 8 }} />
					</IconButton>
					<Typography
						variant='h5'
						align='center'
						gutterBottom
						sx={{ fontWeight: 'bold', flexGrow: 1, mt: 8 }}
					>
						Anteposições de Aula
					</Typography>
				</Box>

				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={2}
					justifyContent="space-between"
					alignItems={{ xs: "stretch", sm: "center" }}
					sx={{ mb: 2 }}
				>
					<Stack
						direction={{ xs: "column", md: "row" }}
						spacing={2}
						alignItems={{ xs: "stretch", md: "center" }}
					>
						<FormControl sx={commonFormControlSx}>
							<InputLabel id="filter-turma-label">Turma</InputLabel>
							<StyledSelect
								labelId="filter-turma-label"
								id="filter-turma"
								value={filterTurma}
								label="Turma"
								onChange={(e) => setFilterTurma(e.target.value)}
								sx={commonSelectSx}
								MenuProps={commonMenuProps}
							>
								<MenuItem value="all">Todas</MenuItem>
								{turmas.map((turma) => (
									<MenuItem key={turma} value={turma}>{turma}</MenuItem>
								))}
							</StyledSelect>
						</FormControl>

						<FormControl sx={commonFormControlSx}>
							<InputLabel id="filter-disciplina-label">Disciplina</InputLabel>
							<StyledSelect
								labelId="filter-disciplina-label"
								id="filter-disciplina"
								value={filterDisciplina}
								label="Disciplina"
								onChange={(e) => setFilterDisciplina(e.target.value)}
								sx={commonSelectSx}
								MenuProps={commonMenuProps}
							>
								<MenuItem value="all">Todas</MenuItem>
								{disciplinas.map((disciplina) => (
									<MenuItem key={disciplina} value={disciplina}>{disciplina}</MenuItem>
								))}
							</StyledSelect>
						</FormControl>

						<FormControl sx={commonFormControlSx}>
							<InputLabel id="filter-status-label">Status</InputLabel>
							<StyledSelect
								labelId="filter-status-label"
								id="filter-status"
								value={filterStatus}
								label="Status"
								onChange={(e) => setFilterStatus(e.target.value)}
								sx={commonSelectSx}
								MenuProps={commonMenuProps}
							>
								<MenuItem value="all">Todos</MenuItem>
								<MenuItem value="Pendente">Pendente</MenuItem>
								<MenuItem value="Aprovado">Aprovado</MenuItem>
								<MenuItem value="Rejeitado">Rejeitado</MenuItem>
							</StyledSelect>
						</FormControl>

						<FormControl sx={commonFormControlSx}>
							<InputLabel id="filter-period-label">Período</InputLabel>
							<StyledSelect
								labelId="filter-period-label"
								id="filter-period"
								value={filterPeriod}
								label="Período"
								onChange={(e) => setFilterPeriod(e.target.value)}
								sx={commonSelectSx}
								MenuProps={commonMenuProps}
							>
								<MenuItem value="all">Todas</MenuItem>
								<MenuItem value="yesterday">Dia Anterior</MenuItem>
								<MenuItem value="lastWeek">Última Semana</MenuItem>
								<MenuItem value="lastMonth">Último Mês</MenuItem>
							</StyledSelect>
						</FormControl>
					</Stack>
				</Stack>

				<ClassAntepositionTable
					antepositions={paginatedAntepositions}
					onArchive={handleToggleActiveClick}
					onUpdate={handleEditAnteposition}
					onApprove={accessType === 'Coordenador' ? handleApprove : undefined}
					onReject={accessType === 'Coordenador' ? handleReject : undefined}
					setAlert={setAlert}
					accessType={accessType}
				/>

				{totalPages > 1 && (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
						<Pagination
							count={totalPages}
							page={page}
							onChange={(_, newPage) => setPage(newPage)}
							color="primary"
						/>
					</Box>
				)}

				{alert && (
					<CustomAlert
						message={alert.message}
						type={alert.type}
						onClose={handleAlertClose}
					/>
				)}
			</Box>
		</Box>
	);
};

export default ClassAntepositionList;
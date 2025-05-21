import React, { useState, useEffect } from 'react';
import { Dialog, Typography, DialogActions, DialogContent, DialogTitle, TextField, Button, CircularProgress, Box,
  FormControl, MenuItem, Select, IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';
import api from '../service/api';
import CustomAlert from './alert/CustomAlert';


const CourseModal = ({ open, onClose, courseToEdit, onUpdate }) => {
	const [alert, setAlert] = useState(null);

	const handleSubmitSuccess = (newCourse) => {
		setAlert({
		  message: courseToEdit ? 'Curso atualizado com sucesso!' : 'Curso cadastrado com sucesso!',
		  type: 'success',
		});
		onClose();
	};

	const handleAlertClose = () => {
    	setAlert(null);
  	};
	
	const [course, setCourse] = useState({
		acronym: '',
		name: '',
		type: '',
		coordinatorId: ''
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [coordinators, setCoordinators] = useState([]);
	const [successOpen, setSuccessOpen] = useState(false);

	useEffect(() => {
		if (courseToEdit) {
			setCourse({
				acronym: courseToEdit.acronym || '',
				name: courseToEdit.name || '',
				type: courseToEdit.type || '', // Backend usa "G", "T", "I"
				coordinatorId: courseToEdit.coordinatorId || ''
			});
		} else {
			setCourse({
				acronym: '',
				name: '',
				type: '',
				coordinatorId: ''
			});
		}
	}, [courseToEdit, open]);

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users');
        console.log('Resposta da API /users:', response.data);
        let allUsers = response.data;

        if (!Array.isArray(allUsers)) {
          console.warn('response.data não é um array:', allUsers);
          allUsers = allUsers.users || [];
        }

        const filtered = allUsers.filter(user => user.accessType === 'Coordenador');
        console.log('Coordenadores filtrados:', filtered);
        setCoordinators(filtered);
      } catch (err) {
        console.error('Erro ao buscar coordenadores:', err);
        setError('Erro ao carregar coordenadores');
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinators();
  }, [open]);

	const handleInputChange = (e) => {
		setCourse({ ...course, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		if (!course.acronym || !course.name || !course.type) {
			setError('Os campos nome, sigla e tipo são obrigatórios.');
			setLoading(false);
			return;
		}

		try {
			let response;
			const payload = {
				acronym: course.acronym,
				name: course.name,
				type: course.type,
				coordinatorId: course.coordinatorId ? Number(course.coordinatorId) : null
			};

			console.log('Payload enviado:', payload);

			if (courseToEdit) {
				response = await api.put(`/courses/${courseToEdit.id}`, payload);
			} else {
				response = await api.post(`/courses`, payload);
			}

			onUpdate(response.data);
			handleSubmitSuccess();
      
		} catch (err) {
			console.log('Erro completo:', err.response);
			setError(err.response?.data?.error || 'Erro ao salvar curso: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSuccessClose = () => {
		onClose();
		setSuccessOpen(false);
	};

	return (
		<>
			<Dialog 
				open={open} 
				onClose={onClose} 
				maxWidth="sm" 
				fullWidth 
				onSubmitSuccess={handleSubmitSuccess}
				PaperProps={{ sx: { borderRadius: 4, height: '520px' } }}>
				<DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', marginTop: '19px' }}>
					{courseToEdit ? "Edição de Curso" : "Cadastro de Curso"}

					<IconButton
						onClick={onClose}
						sx={{ position: 'absolute', right: 8, top: 8 }}
					>
						<Close />
					</IconButton>
				</DialogTitle>

				<DialogContent sx={{ px: 5 }}>
					{loading ? (
						<Box display="flex" justifyContent="center">
							<CircularProgress />
						</Box>
					) : (
						<form onSubmit={handleSubmit}>
							{error && <Box sx={{ color: 'red', marginBottom: 2 }}>{error}</Box>}
							<Typography variant="subtitle1"  mt='15px' sx={{ color: '#2B2B2B' }}>
								Nome
							</Typography>
							<TextField 
								name="name"
								size="small"
								variant="outlined"
								fullWidth
								margin="normal"
								value={course.name}
								onChange={handleInputChange}
								required
								sx={{ mb: 1.5, marginTop: '-1px' }}
								InputProps={{
									sx: {
										borderRadius: 2,
										border: '1px solid #999999',
										'& input': {
											color: '#2B2B2B',
										},
									},
								}}
							/>

							<Typography variant="subtitle1" sx={{ color: '#2B2B2B' }}>
								Sigla
							</Typography>
							<TextField 
								name="acronym"
								fullWidth
								variant="outlined"
								size="small"
								margin="normal"
								value={course.acronym}
								onChange={handleInputChange}
								required
								sx={{ mb: 1.5, marginTop: '-1px' }}
								InputProps={{
									sx: {
										borderRadius: 2,
										border: '1px solid #999999',
										'& input': {
											color: '#2B2B2B',
										},
									},
								}}
							/>

							<Typography variant="subtitle1" sx={{ color: '#2B2B2B' }}>
								Tipo
							</Typography>
							<FormControl fullWidth margin="normal" size="small" sx={{ mb: 1.5, marginTop: '-1px' }}>
								<Select
									name="type"
									value={course.type}
									onChange={handleInputChange}
									displayEmpty
									required
									sx={{
										borderRadius: 2,
										backgroundColor: '#fff',
										color: '#2B2B2B',
										border: '1px solid #999999',
										'& .MuiSelect-select': {
											padding: '8px 14px',
										},
									}}
								>
									<MenuItem value="">
										<em>Selecione o tipo</em>
									</MenuItem>
									<MenuItem value="G">Graduação</MenuItem>
									<MenuItem value="T">Técnico</MenuItem>
									<MenuItem value="I">Integrado</MenuItem>
								</Select>
							</FormControl>

							<Typography variant="subtitle1" sx={{ color: '#2B2B2B' }}>
								Coordenador
							</Typography>
							<FormControl fullWidth margin="normal" size="small" sx={{ mb: 1.5, marginTop: '-1px' }}>
								<Select
									name="coordinatorId"
									value={course.coordinatorId}
									onChange={handleInputChange}
									displayEmpty
									sx={{
										borderRadius: 2,
										backgroundColor: '#fff',
										color: '#2B2B2B',
										border: '1px solid #999999',
										'& .MuiSelect-select': {
											padding: '8px 14px',
										},
									}}
								>
									<MenuItem value="">
										<em>{coordinators.length === 0 ? 'Carregando coordenadores...' : 'Selecione um coordenador'}</em>
									</MenuItem>
									{coordinators.map((user) => (
										<MenuItem key={user.id} value={user.id}>
											{user.username}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<DialogActions
								sx={{
									justifyContent: 'center',
									gap: 2, 
									padding: '10px 24px',
									marginTop: '15px'
								}}
							>
								<Button onClick={onClose} variant="contained"
									sx={{
										backgroundColor: '#FF1C1C',
										color: '#fff',
										'&:hover': {
											backgroundColor: '#FF2018',
										},
										padding: '6px 30px',
										borderRadius: 2,
										textTransform: 'capitalize'
									}}
								>
									Cancelar
								</Button>
								<Button type="submit" color="primary" variant="contained" 
									sx={{
										padding: '6px 35px',
										borderRadius: 2,
										backgroundColor: '#087619',
										textTransform: 'capitalize'
									}}
								>
									{courseToEdit ? "Salvar" : "Cadastrar"}
								</Button>
							</DialogActions>
						</form>
					)}
				</DialogContent>
			</Dialog>
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

export default CourseModal;
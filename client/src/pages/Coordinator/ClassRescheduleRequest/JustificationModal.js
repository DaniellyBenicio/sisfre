import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button,
	IconButton,
} from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import { StyledTextField } from '../../../components/inputs/Input';

const JustificationModal = ({ open, onClose }) => {
	const [justification, setJustification] = useState('');

	useEffect(() => {
		if (open) {
			setJustification(''); 
		}
	}, [open]);

	const handleSubmit = (e) => {
		e.preventDefault();
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '8px',
					width: '520px',
					maxWidth: '90vw',
				},
			}}
		>
			<DialogTitle sx={{ textAlign: 'center', marginTop: '19px', color: '#087619', fontWeight: 'bold' }}>
				Justificativa
				<IconButton
					onClick={onClose}
					sx={{ position: 'absolute', right: 8, top: 8 }}
				>
					<Close />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ px: 5, minHeight: '200px' }}>
				<form onSubmit={handleSubmit}>
					<StyledTextField
						sx={{
							my: 1.5,
							'& .MuiInputBase-root': {
								height: 'auto',
								minHeight: '100px',
							},
							'& .MuiInputLabel-root': {
								top: '10px',
								transform: 'translate(14px, 0)',
								fontSize: '1rem',
							},
							'& .MuiInputLabel-shrink': {
								top: 0,
								transform: 'translate(14px, -9px) scale(0.75)',
							},
						}}
						name="justification"
						size="small"
						variant="outlined"
						fullWidth
						label="Justificativa"
						margin="normal"
						value={justification}
						onChange={(e) => setJustification(e.target.value)}
						multiline
						rows={4}
						required
					/>
					<DialogActions
						sx={{
							justifyContent: 'center',
							gap: 2,
							padding: '10px 24px',
							marginTop: '10px',
						}}
					>
						<Button
							onClick={onClose}
							variant="contained"
							sx={{
								width: 'fit-content',
								minWidth: 100,
								padding: '8px 28px',
								borderRadius: '8px',
								textTransform: 'none',
								fontWeight: 'bold',
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								backgroundColor: '#F01424',
								'&:hover': { backgroundColor: '#D4000F' },
							}}
						>
							<Close sx={{ fontSize: 24 }} />
							Cancelar
						</Button>
						<Button
							type="submit"
							color="primary"
							variant="contained"
							disabled={!justification}
							sx={{
								width: 'fit-content',
								minWidth: 100,
								padding: '8px 28px',
								backgroundColor: '#087619',
								borderRadius: '8px',
								textTransform: 'none',
								fontWeight: 'bold',
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								'&:hover': { backgroundColor: '#066915' },
							}}
						>
							<Save sx={{ fontSize: 24 }} />
							Enviar
						</Button>
					</DialogActions>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default JustificationModal;
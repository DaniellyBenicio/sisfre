import { Stack, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';
import { useMediaQuery, useTheme } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf'; // Adicionado
import { useState } from 'react';

const ClassReplacementTable = ({ replacements, setAlert, onView, onDelete, onApprove, onReject, accessType }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const normalizeString = (str) => {
    if (!str) return 'N/A';
    return str;
  };

  const formattedReplacements = Array.isArray(replacements) ? replacements.map((replacement) => ({
    ...replacement,
    turma: normalizeString(replacement.turma),
    disciplina: normalizeString(replacement.disciplina),
    turn: normalizeString(replacement.turn),
    quantidade: normalizeString(replacement.quantidade),
    data: normalizeString(replacement.data),
    fileName: normalizeString(replacement.fileName),
    observacao: normalizeString(replacement.observacao),
    observationCoordinator: normalizeString(replacement.observationCoordinator),
    status: replacement.status || 'Pendente',
  })) : [];

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState(''); // Alterado para selectedContent
  const [dialogTitle, setDialogTitle] = useState('');
  const [isFileDialog, setIsFileDialog] = useState(false); // Adicionado

  const handleOpenDialog = (content, title, isFile = false) => { // Adicionado isFile
    setSelectedContent(content);
    setDialogTitle(title);
    setIsFileDialog(isFile);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedContent('');
    setDialogTitle('');
    setIsFileDialog(false);
  };

  const headers = accessType === 'Professor' ? [
    { key: 'turma', label: 'Turma' },
    { key: 'disciplina', label: 'Disciplina' },
    { key: 'turn', label: 'Turno' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'data', label: 'Data' },
    { 
      key: 'fileName', 
      label: 'Arquivo',
      render: (replacement) => (
        replacement.fileName !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(replacement.fileName, 'Arquivo', true)}>
            <PictureAsPdf />
          </IconButton>
        ) : 'N/A'
      ),
    },
    { 
      key: 'observacao', 
      label: 'Observação',
      render: (replacement) => (
        replacement.observacao !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(replacement.observacao, 'Observação')}>
            <Visibility />
          </IconButton>
        ) : 'N/A'
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (replacement) => (
        <Typography
          component="span"
          sx={{
            color:
              replacement.status === 'Aprovado' ? 'green' :
              replacement.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: replacement.status === 'Pendente' ? 'semi bold' : 'normal',
          }}
        >
          {replacement.status}
        </Typography>
      ),
    },
  ] : [
    { key: 'turma', label: 'Turma' },
    { key: 'disciplina', label: 'Disciplina' },
    { key: 'turn', label: 'Turno' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'data', label: 'Data' },
    { 
      key: 'fileName', 
      label: 'Arquivo',
      render: (replacement) => (
        replacement.fileName !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(replacement.fileName, 'Arquivo', true)}>
            <PictureAsPdf />
          </IconButton>
        ) : 'N/A'
      ),
    },
    { 
      key: 'observacao', 
      label: 'Observação',
      render: (replacement) => (
        replacement.observacao !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(replacement.observacao, 'Observação')}>
            <Visibility />
          </IconButton>
        ) : 'N/A'
      ),
    },
    { 
      key: 'observationCoordinator', 
      label: 'Observação do Coordenador',
      render: (replacement) => (
        replacement.observationCoordinator !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(replacement.observationCoordinator, 'Observação do Coordenador')}>
            <Visibility />
          </IconButton>
        ) : 'N/A'
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (replacement) => (
        <Typography
          component="span"
          sx={{
            color:
              replacement.status === 'Aprovado' ? 'green' :
              replacement.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: replacement.status === 'Pendente' ? 'semi bold' : 'normal',
          }}
        >
          {replacement.status}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: 'Ação',
      render: (replacement) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <IconButton
            onClick={() => onView(replacement.id)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            <Visibility />
          </IconButton>
          <IconButton
            onClick={() => onDelete(replacement)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            <DeleteIcon />
          </IconButton>
          <Button
            onClick={() => onApprove(replacement.id)}
            disabled={replacement.status === 'Aprovado'}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Aprovar
          </Button>
          <Button
            onClick={() => onReject(replacement.id)}
            disabled={replacement.status === 'Rejeitado'}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Rejeitar
          </Button>
        </Stack>
      ),
    },
  ];

  const tableHeadStyle = {
    fontWeight: 'bold',
    backgroundColor: '#087619',
    color: '#fff',
    borderRight: '1px solid #fff',
    padding: { xs: '4px', sm: '6px' },
    height: '30px',
    lineHeight: '30px',
  };

  const tableBodyCellStyle = {
    borderRight: '1px solid #e0e0e0',
    padding: { xs: '4px', sm: '6px' },
    height: '30px',
    lineHeight: '30px',
  };

  const renderMobileRow = (replacement) => (
    <Stack spacing={0.5}>
      <Typography><strong>Turma:</strong> {normalizeString(replacement.turma)}</Typography>
      <Typography><strong>Disciplina:</strong> {normalizeString(replacement.disciplina)}</Typography>
      <Typography><strong>Turno:</strong> {normalizeString(replacement.turn)}</Typography>
      <Typography><strong>Quantidade:</strong> {normalizeString(replacement.quantidade)}</Typography>
      <Typography><strong>Data:</strong> {normalizeString(replacement.data)}</Typography>
      <Typography>
        <strong>Arquivo:</strong>{" "}
        {replacement.fileName !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(replacement.fileName, 'Arquivo', true)}>
            <PictureAsPdf />
          </IconButton>
        ) : 'N/A'}
      </Typography>
      <Typography>
        <strong>Observação:</strong>{" "}
        {replacement.observacao !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(replacement.observacao, 'Observação')}>
            <Visibility />
          </IconButton>
        ) : 'N/A'}
      </Typography>
      <Typography>
        <strong>Observação do Coordenador:</strong>{" "}
        {replacement.observationCoordinator !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(replacement.observationCoordinator, 'Observação do Coordenador')}>
            <Visibility />
          </IconButton>
        ) : 'N/A'}
      </Typography>
      <Typography>
        <strong>Status:</strong>{" "}
        <Box
          component="span"
          sx={{
            color:
              replacement.status === 'Aprovado' ? 'green' :
              replacement.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: replacement.status === 'Pendente' ? 'semi bold' : 'normal',
          }}
        >
          {replacement.status}
        </Box>
      </Typography>
      {accessType === 'Coordenador' && (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            onClick={() => onView(replacement.id)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Visualizar
          </Button>
          <Button
            onClick={() => onDelete(replacement)}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Deletar
          </Button>
          <Button
            onClick={() => onApprove(replacement.id)}
            disabled={replacement.status === 'Aprovado'}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Aprovar
          </Button>
          <Button
            onClick={() => onReject(replacement.id)}
            disabled={replacement.status === 'Rejeitado'}
            sx={{ color: '#087619', '&:hover': { color: '#065412' } }}
          >
            Rejeitar
          </Button>
        </Stack>
      )}
    </Stack>
  );

  if (isMobile) {
    return (
      <>
        <Stack spacing={1} sx={{ width: '100%' }}>
          {formattedReplacements.length === 0 ? (
            <Paper sx={{ p: 1 }}>
              <Typography align="center">Nenhum item encontrado!</Typography>
            </Paper>
          ) : (
            formattedReplacements.map((item) => (
              <Paper key={item?.id} sx={{ p: 1 }}>
                {renderMobileRow(item)}
              </Paper>
            ))
          )}
        </Stack>
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              width: '600px',
              maxWidth: '90vw',
              minHeight: '200px',
              borderRadius: '8px',
            },
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem', py: 2 }}>
            {dialogTitle}
          </DialogTitle>
          <DialogContent sx={{ p: 3, overflowY: 'visible' }}>
            {isFileDialog ? (
              <Typography sx={{ fontSize: '1rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                <a
                  href={`/path/to/files/${selectedContent}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#087619', textDecoration: 'underline' }}
                >
                  {selectedContent || 'Nenhum arquivo fornecido'}
                </a>
              </Typography>
            ) : (
              <Typography sx={{ fontSize: '1rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                {selectedContent || 'Nenhuma observação fornecida'}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              sx={{
                backgroundColor: '#F01424',
                '&:hover': { backgroundColor: '#D4000F' },
                textTransform: 'none',
                fontWeight: 'bold',
                px: 4,
              }}
            >
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header.key} align="center" sx={tableHeadStyle}>
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {formattedReplacements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  align="center"
                  sx={tableBodyCellStyle}
                >
                  Nenhum item encontrado
                </TableCell>
              </TableRow>
            ) : (
              formattedReplacements.map((item) => (
                <TableRow key={item?.id}>
                  {headers.map((header) => (
                    <TableCell
                      key={header.key}
                      align="center"
                      sx={tableBodyCellStyle}
                    >
                      {header.render ? header.render(item) : item[header.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: '600px',
            maxWidth: '90vw',
            minHeight: '200px',
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem', py: 2 }}>
          {dialogTitle}
        </DialogTitle>
        <DialogContent sx={{ p: 3, overflowY: 'visible' }}>
          {isFileDialog ? (
            <Typography sx={{ fontSize: '1rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
              <a
                href={`http://localhost:3000/uploads/class_change_requests/${selectedContent}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#087619', textDecoration: 'underline' }}
              >
                {selectedContent || 'Nenhum arquivo fornecido'}
              </a>
            </Typography>
          ) : (
            <Typography sx={{ fontSize: '1rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
              {selectedContent || 'Nenhuma observação fornecida'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              backgroundColor: '#F01424',
              '&:hover': { backgroundColor: '#D4000F' },
              textTransform: 'none',
              fontWeight: 'bold',
              px: 4,
            }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ClassReplacementTable.propTypes = {
  replacements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      turma: PropTypes.string.isRequired,
      disciplina: PropTypes.string.isRequired,
      turn: PropTypes.string.isRequired,
      quantidade: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
      fileName: PropTypes.string.isRequired,
      observacao: PropTypes.string.isRequired,
      observationCoordinator: PropTypes.string,
      status: PropTypes.oneOf(['Pendente', 'Aprovado', 'Rejeitado']),
    })
  ).isRequired,
  setAlert: PropTypes.func,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  accessType: PropTypes.string,
};

export default ClassReplacementTable;
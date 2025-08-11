import { Stack, Typography, Box, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';
import { useMediaQuery, useTheme } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import { useState } from 'react';

const ClassAntepositionTable = ({ antepositions, setAlert, onView, onDelete, onApprove, onReject, accessType }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const normalizeString = (str) => {
    if (!str) return 'N/A';
    return str;
  };

  const formattedAntepositions = Array.isArray(antepositions) ? antepositions.map((anteposition) => ({
    ...anteposition,
    turma: normalizeString(anteposition.turma),
    disciplina: normalizeString(anteposition.disciplina),
    turn: normalizeString(anteposition.turn),
    quantidade: normalizeString(anteposition.quantidade),
    data: normalizeString(anteposition.data),
    fileName: normalizeString(anteposition.fileName),
    observacao: normalizeString(anteposition.observacao),
    observationCoordinator: normalizeString(anteposition.observationCoordinator),
    tipo: normalizeString(anteposition.tipo),
    status: anteposition.status || 'Pendente',
  })) : [];

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  const [isFileDialog, setIsFileDialog] = useState(false);

  const handleOpenDialog = (content, title, isFile = false) => {
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
      render: (anteposition) => (
        anteposition.fileName !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(anteposition.fileName, 'Arquivo', true)}>
            <PictureAsPdf />
          </IconButton>
        ) : 'N/A'
      ),
    },
    { 
      key: 'observacao', 
      label: 'Observação',
      render: (anteposition) => (
        anteposition.observacao !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(anteposition.observacao, 'Observação')}>
            <Visibility />
          </IconButton>
        ) : 'N/A'
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (anteposition) => (
        <Typography
          component="span"
          sx={{
            color:
              anteposition.status === 'Aprovado' ? 'green' :
              anteposition.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: anteposition.status === 'Pendente' ? 'semi bold' : 'normal',
          }}
        >
          {anteposition.status}
        </Typography>
      ),
    },
  ] : [
    { key: 'turma', label: 'Turma' },
    { key: 'disciplina', label: 'Disciplina' },
    { key: 'turn', label: 'Turno' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'data', label: 'Data' },
    { key: 'tipo', label: 'Tipo' },
    { 
      key: 'fileName', 
      label: 'Arquivo',
      render: (anteposition) => (
        anteposition.fileName !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(anteposition.fileName, 'Arquivo', true)}>
            <PictureAsPdf />
          </IconButton>
        ) : 'N/A'
      ),
    },
    { 
      key: 'observacao', 
      label: 'Observação',
      render: (anteposition) => (
        anteposition.observacao !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(anteposition.observacao, 'Observação')}>
            <Visibility />
          </IconButton>
        ) : 'N/A'
      ),
    },
    { 
      key: 'observationCoordinator', 
      label: 'Justificativa',
      render: (anteposition) => (
        anteposition.observationCoordinator !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(anteposition.observationCoordinator, 'Justificativa')}>
            <Visibility />
          </IconButton>
        ) : 'N/A'
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (anteposition) => (
        <Typography
          component="span"
          sx={{
            color:
              anteposition.status === 'Aprovado' ? 'green' :
              anteposition.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: anteposition.status === 'Pendente' ? 'semi bold' : 'normal',
          }}
        >
          {anteposition.status}
        </Typography>
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

  const renderMobileRow = (anteposition) => (
    <Stack spacing={0.5}>
      <Typography><strong>Turma:</strong> {normalizeString(anteposition.turma)}</Typography>
      <Typography><strong>Disciplina:</strong> {normalizeString(anteposition.disciplina)}</Typography>
      <Typography><strong>Turno:</strong> {normalizeString(anteposition.turn)}</Typography>
      <Typography><strong>Quantidade:</strong> {normalizeString(anteposition.quantidade)}</Typography>
      <Typography><strong>Data:</strong> {normalizeString(anteposition.data)}</Typography>
      {accessType === 'Coordenador' && (
        <Typography><strong>Tipo:</strong> {normalizeString(anteposition.tipo)}</Typography>
      )}
      <Typography>
        <strong>Arquivo:</strong>{" "}
        {anteposition.fileName !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(anteposition.fileName, 'Arquivo', true)}>
            <PictureAsPdf />
          </IconButton>
        ) : 'N/A'}
      </Typography>
      <Typography>
        <strong>Observação:</strong>{" "}
        {anteposition.observacao !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(anteposition.observacao, 'Observação')}>
            <Visibility />
          </IconButton>
        ) : 'N/A'}
      </Typography>
      <Typography>
        <strong>{accessType === 'Coordenador' ? 'Justificativa' : 'Observação do Coordenador'}:</strong>{" "}
        {anteposition.observationCoordinator !== 'N/A' ? (
          <IconButton onClick={() => handleOpenDialog(anteposition.observationCoordinator, accessType === 'Coordenador' ? 'Justificativa' : 'Observação do Coordenador')}>
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
              anteposition.status === 'Aprovado' ? 'green' :
              anteposition.status === 'Rejeitado' ? 'red' : 'orange',
            fontWeight: anteposition.status === 'Pendente' ? 'semi bold' : 'normal',
          }}
        >
          {anteposition.status}
        </Box>
      </Typography>
    </Stack>
  );

  if (isMobile) {
    return (
      <>
        <Stack spacing={1} sx={{ width: '100%' }}>
          {formattedAntepositions.length === 0 ? (
            <Paper sx={{ p: 1 }}>
              <Typography align="center">Nenhum item encontrado!</Typography>
            </Paper>
          ) : (
            formattedAntepositions.map((item) => (
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
            {formattedAntepositions.length === 0 ? (
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
              formattedAntepositions.map((item) => (
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
};

ClassAntepositionTable.propTypes = {
  antepositions: PropTypes.arrayOf(
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
      tipo: PropTypes.string,
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

export default ClassAntepositionTable;
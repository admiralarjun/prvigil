import React from 'react';
import { Modal, Box, Typography, Button, CircularProgress } from '@mui/material';

const AnalyzeModal = ({ modalOpen, closeModal, handleAnalyze, loading }) => (
  <Modal
    open={modalOpen}
    onClose={closeModal}
    aria-labelledby="modal-title"
    aria-describedby="modal-description"
  >
    <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, maxWidth: 'sm', mx: 'auto', mt: '10%' }}>
      <Typography id="modal-title" variant="h6" component="h2">
        Analyze Selected PRs
      </Typography>
      <Typography id="modal-description" sx={{ mt: 2 }}>
        Click "Analyze" to process the selected pull requests.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAnalyze}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Analyze'}
      </Button>
    </Box>
  </Modal>
);

export default AnalyzeModal;

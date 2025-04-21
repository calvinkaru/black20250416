import * as React from 'react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Grid from '@mui/material/Grid2';
import { Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

import FormDialog from './Partial/FormDialog';

const columns = (handleEdit) => [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'collection_type', headerName: 'Collection Type', width: 150 },
  { field: 'description', headerName: 'Description', width: 250 },
  { field: 'display_limit', headerName: 'Display Limit', width: 120 },
  { field: 'created_at', headerName: 'Created At', width: 150 },
  {
    field: 'action',
    headerName: 'Actions',
    width:150,
    renderCell: (params) => (
      <Button onClick={() => handleEdit(params.row)} startIcon={<EditIcon />} variant="outlined">
        Edit
      </Button>
    ),
  },
];

export default function Collection({ collections }) {
  const auth = usePage().props.auth.user;
  const [open, setOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const handleClickOpen = () => {
    setSelectedCollection(null);
    setOpen(true);
  };

  const handleEdit = (collection) => {
    setSelectedCollection(collection); // Set selected collection for editing
    setOpen(true); // Open the dialog
  };

  const handleClose = () => {
    setSelectedCollection(null);
    setOpen(false);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Collection" />

      <Grid container spacing={2} alignItems="center" sx={{ width: '100%' }}>
        <Grid size={12} container justifyContent="end">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleClickOpen}>
            Add Collection
          </Button>
        </Grid>

        <Box className="py-6 w-full" sx={{ display: 'grid', gridTemplateColumns: '1fr' }}>
          <DataGrid
            rows={collections}
            columns={columns(handleEdit)}
            pageSize={5}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
          />
        </Box>
      </Grid>

      <FormDialog open={open} handleClose={handleClose} collection={selectedCollection} />
    </AuthenticatedLayout>
  );
}

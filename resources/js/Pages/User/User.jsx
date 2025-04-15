import * as React from 'react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Grid from '@mui/material/Grid2';
import { Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';

import { DataGrid, GridToolbar} from '@mui/x-data-grid';

import FormDialog from './UserFormDialog';


  const columns = (handleEdit) => [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Profile Name', width: 200,
      renderCell: (params) => (
        <Button
          onClick={() => handleEdit(params.row)}
          variant="text"
          sx={{fontWeight:'bold'}}
        >
          {params.value}
        </Button>
      ),
    },
    { field: 'user_name', headerName: 'User Name', width: 150 },
    { field: 'user_role', headerName: 'User Role', width: 150 },
    { field: 'email', headerName: 'Email', width: 150 },
    { field: 'store_name', headerName: 'Store', width: 150 },
    { field: 'created_at', headerName: 'Created At', width: 200 },
  ];

 export default function User({users, stores, roles}) {
    const auth = usePage().props.auth.user
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleClickOpen = () => {
        setSelectedUser(null);
        setOpen(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user); // Set selected user for editing
        setOpen(true); // Open the dialog
      };

    const handleClose = () => {
        setSelectedUser(null);
        setOpen(false);
    };

   
    return (
        <AuthenticatedLayout>
          
            <Head title="User" />
                <Grid container spacing={2} alignItems='center' sx={{ width: "100%" }}>
                    <Grid size={12} container justifyContent='end'>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleClickOpen}>Add User</Button>
                    </Grid>

                    <Box className='py-6 w-full' sx={{display: 'grid', gridTemplateColumns: '1fr'}}>
                      <DataGrid 
                      rows={users} 
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

                <FormDialog open={open} handleClose={handleClose} stores={stores} user={selectedUser} roles={roles}/>
            
        </AuthenticatedLayout>
    );
}
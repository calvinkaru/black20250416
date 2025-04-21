import React, { useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Taxes({ taxes, pageLabel }) {
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentTax, setCurrentTax] = useState(null);
    const [taxesList, setTaxesList] = useState(taxes || []);
    const [formData, setFormData] = useState({
        name: '',
        type: 'percentage',
        rate: '',
        description: '',
        is_active: true,
    });

    const handleClickOpen = () => {
        setOpen(true);
        setEditMode(false);
        setFormData({
            name: '',
            type: 'percentage',
            rate: '',
            description: '',
            is_active: true,
        });
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleEditClick = (tax) => {
        setCurrentTax(tax);
        setFormData({
            name: tax.name,
            type: tax.type,
            rate: tax.rate,
            description: tax.description || '',
            is_active: tax.is_active,
        });
        setEditMode(true);
        setOpen(true);
    };

    const handleDeleteClick = (tax) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/settings/taxes/${tax.id}`)
                    .then(response => {
                        Swal.fire(
                            'Deleted!',
                            response.data.message,
                            'success'
                        );
                        setTaxesList(taxesList.filter(item => item.id !== tax.id));
                    })
                    .catch(error => {
                        Swal.fire(
                            'Error!',
                            error.response?.data?.message || 'Failed to delete tax.',
                            'error'
                        );
                    });
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = () => {
        if (editMode) {
            axios.put(`/settings/taxes/${currentTax.id}`, formData)
                .then(response => {
                    Swal.fire({
                        title: 'Success!',
                        text: response.data.message,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                    
                    // Update the taxes list
                    const updatedTax = response.data.tax;
                    const updatedList = taxesList.map(item => 
                        item.id === updatedTax.id ? updatedTax : item
                    );
                    
                    setTaxesList(updatedList);
                    handleClose();
                })
                .catch(error => {
                    Swal.fire(
                        'Error!',
                        error.response?.data?.message || 'Failed to update tax.',
                        'error'
                    );
                });
        } else {
            axios.post('/settings/taxes', formData)
                .then(response => {
                    Swal.fire({
                        title: 'Success!',
                        text: response.data.message,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                    
                    // Add the new tax to the list
                    const newTax = response.data.tax;
                    setTaxesList([...taxesList, newTax]);
                    
                    handleClose();
                })
                .catch(error => {
                    Swal.fire(
                        'Error!',
                        error.response?.data?.message || 'Failed to create tax.',
                        'error'
                    );
                });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={pageLabel} />
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {pageLabel}
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        onClick={handleClickOpen}
                    >
                        Add Tax
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Rate</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {taxesList.map((tax) => (
                                <TableRow key={tax.id}>
                                    <TableCell>{tax.name}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={tax.type === 'percentage' ? 'Percentage' : 'Fixed'} 
                                            color={tax.type === 'percentage' ? 'primary' : 'secondary'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {tax.type === 'percentage' ? `${tax.rate}%` : `Rs.${tax.rate}`}
                                    </TableCell>
                                    <TableCell>{tax.description}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={tax.is_active ? 'Active' : 'Inactive'} 
                                            color={tax.is_active ? 'success' : 'error'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton 
                                            color="primary" 
                                            onClick={() => handleEditClick(tax)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            color="error" 
                                            onClick={() => handleDeleteClick(tax)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                    <DialogTitle>{editMode ? 'Edit Tax' : 'Add Tax'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formData.name}
                            onChange={handleInputChange}
                            sx={{ mb: 2, mt: 1 }}
                        />
                        <TextField
                            select
                            margin="dense"
                            name="type"
                            label="Type"
                            fullWidth
                            variant="outlined"
                            value={formData.type}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="percentage">Percentage</MenuItem>
                            <MenuItem value="fixed">Fixed</MenuItem>
                        </TextField>
                        <TextField
                            margin="dense"
                            name="rate"
                            label={formData.type === 'percentage' ? 'Rate (%)' : 'Rate (Rs.)'}
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={formData.rate}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                            InputProps={{
                                inputProps: { 
                                    min: 0,
                                    step: formData.type === 'percentage' ? 0.01 : 1
                                }
                            }}
                        />
                        <TextField
                            margin="dense"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            value={formData.description}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    name="is_active"
                                />
                            }
                            label="Active"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} color="primary" variant="contained">
                            {editMode ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </AuthenticatedLayout>
    );
}

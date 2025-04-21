import React, { useState, useEffect } from 'react';
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
    Grid,
    FormGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function OrderTypes({ orderTypes, taxes, pageLabel }) {
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentOrderType, setCurrentOrderType] = useState(null);
    const [orderTypesList, setOrderTypesList] = useState(orderTypes || []);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
        is_default: false,
        taxes: []
    });

    const handleClickOpen = () => {
        setOpen(true);
        setEditMode(false);
        setFormData({
            name: '',
            description: '',
            is_active: true,
            is_default: false,
            taxes: []
        });
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleEditClick = (orderType) => {
        setCurrentOrderType(orderType);
        setFormData({
            name: orderType.name,
            description: orderType.description || '',
            is_active: orderType.is_active,
            is_default: orderType.is_default || false,
            taxes: orderType.taxes.map(tax => tax.id)
        });
        setEditMode(true);
        setOpen(true);
    };

    const handleDeleteClick = (orderType) => {
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
                axios.delete(`/settings/order-types/${orderType.id}`)
                    .then(response => {
                        Swal.fire(
                            'Deleted!',
                            response.data.message,
                            'success'
                        );
                        setOrderTypesList(orderTypesList.filter(item => item.id !== orderType.id));
                    })
                    .catch(error => {
                        Swal.fire(
                            'Error!',
                            error.response?.data?.message || 'Failed to delete order type.',
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

    const handleTaxChange = (taxId) => {
        const currentTaxes = [...formData.taxes];
        const taxIndex = currentTaxes.indexOf(taxId);
        
        if (taxIndex === -1) {
            // Tax not selected, add it
            currentTaxes.push(taxId);
        } else {
            // Tax already selected, remove it
            currentTaxes.splice(taxIndex, 1);
        }
        
        setFormData({
            ...formData,
            taxes: currentTaxes
        });
    };

    const handleSubmit = () => {
        if (editMode) {
            axios.put(`/settings/order-types/${currentOrderType.id}`, formData)
                .then(response => {
                    Swal.fire({
                        title: 'Success!',
                        text: response.data.message,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                    
                    // Update the order types list
                    const updatedOrderType = response.data.orderType;
                    const updatedList = orderTypesList.map(item => 
                        item.id === updatedOrderType.id ? { ...updatedOrderType, taxes: item.taxes } : item
                    );
                    
                    // Refresh the page to get updated data with taxes
                    window.location.reload();
                    
                    setOrderTypesList(updatedList);
                    handleClose();
                })
                .catch(error => {
                    Swal.fire(
                        'Error!',
                        error.response?.data?.message || 'Failed to update order type.',
                        'error'
                    );
                });
        } else {
            axios.post('/settings/order-types', formData)
                .then(response => {
                    Swal.fire({
                        title: 'Success!',
                        text: response.data.message,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                    });
                    
                    // Refresh the page to get updated data with taxes
                    window.location.reload();
                    
                    handleClose();
                })
                .catch(error => {
                    Swal.fire(
                        'Error!',
                        error.response?.data?.message || 'Failed to create order type.',
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
                        Add Order Type
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Default</TableCell>
                                <TableCell>Taxes</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orderTypesList.map((orderType) => (
                                <TableRow key={orderType.id}>
                                    <TableCell>{orderType.name}</TableCell>
                                    <TableCell>{orderType.description}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={orderType.is_active ? 'Active' : 'Inactive'} 
                                            color={orderType.is_active ? 'success' : 'error'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {orderType.is_default ? (
                                            <Chip 
                                                label="Default" 
                                                color="info" 
                                                size="small" 
                                            />
                                        ) : (
                                            <Chip 
                                                label="Not Default" 
                                                color="default" 
                                                size="small" 
                                                variant="outlined"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {orderType.taxes.map(tax => (
                                            <Chip 
                                                key={tax.id}
                                                label={`${tax.name} (${tax.type === 'percentage' ? tax.rate + '%' : 'Rs.' + tax.rate})`}
                                                color="primary" 
                                                size="small" 
                                                sx={{ mr: 0.5, mb: 0.5 }}
                                            />
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton 
                                            color="primary" 
                                            onClick={() => handleEditClick(orderType)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            color="error" 
                                            onClick={() => handleDeleteClick(orderType)}
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
                    <DialogTitle>{editMode ? 'Edit Order Type' : 'Add Order Type'}</DialogTitle>
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
                        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 2 }}>
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
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.is_default}
                                        onChange={handleInputChange}
                                        name="is_default"
                                    />
                                }
                                label="Default"
                            />
                        </Box>

                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Applicable Taxes
                        </Typography>
                        <FormGroup>
                            <Grid container spacing={2}>
                                {taxes.map((tax) => (
                                    <Grid item xs={6} key={tax.id}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.taxes.includes(tax.id)}
                                                    onChange={() => handleTaxChange(tax.id)}
                                                    name={`tax-${tax.id}`}
                                                />
                                            }
                                            label={`${tax.name} (${tax.type === 'percentage' ? tax.rate + '%' : 'Rs.' + tax.rate})`}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </FormGroup>
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

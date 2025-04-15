import React, { useState, useContext, useEffect } from "react";
import {
    IconButton, MenuItem,
    TextField, FormControl, InputLabel, Select,
    Grid2 as Grid, DialogTitle, DialogContent, DialogActions, Dialog, Button
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Swal from "sweetalert2";
import CreatableSelect from 'react-select/creatable';
import { usePage } from "@inertiajs/react";

const reasonOptions = [
    { value: 'Stock Entry', label: 'Stock Entry' },
    { value: 'Purchase', label: 'Purchase' },
    { value: 'Damaged', label: 'Damaged' },
    { value: 'Theft', label: 'Theft' },
    { value: 'Expense', label: 'Expense' },
    { value: 'Return', label: 'Return' },
    { value: 'Donation', label: 'Donation' },
    { value: 'Sample', label: 'Sample' },
    { value: 'Promotion', label: 'Promotion' },
    { value: 'Write-Off', label: 'Write-Off' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Lost', label: 'Lost' },
    { value: 'Transfer Out', label: 'Transfer Out' },
    { value: 'Transfer In', label: 'Transfer In' },
    { value: 'Production', label: 'Production' },
    { value: 'Consumption', label: 'Consumption' },
    { value: 'Adjustment', label: 'Adjustment' },
    { value: 'Vendor Return', label: 'Vendor Return' },
    { value: 'Customer Return', label: 'Customer Return' },
    { value: 'Internal Use', label: 'Internal Use' },
    { value: 'Audit Correction', label: 'Audit Correction' },
    { value: 'Seasonal Adjustment', label: 'Seasonal Adjustment' },
    { value: 'Overstock Reduction', label: 'Overstock Reduction' },
    { value: 'Understock Adjustment', label: 'Understock Adjustment' },
    { value: 'Quality Control Reject', label: 'Quality Control Reject' },
    { value: 'Repair', label: 'Repair' },
    { value: 'Replacement', label: 'Replacement' },
    { value: 'Disposal', label: 'Disposal' },
    { value: 'Reconciliation', label: 'Reconciliation' },
    { value: 'Miscellaneous', label: 'Miscellaneous' },
];

export default function QuantityModal({
    modalOpen,
    setModalOpen,
    selectedStock,
    refreshProducts,
    stores,
}) {
    const auth = usePage().props.auth.user;
    const initialFormState = {
        batch_id: "",
        stock_id: '',
        quantity: 0,
        reason: '',
        store_id: auth.store_id ?? 1,
    }

    const [formState, setFormState] = useState(initialFormState);
    const [loading, setLoading] = useState(false)
    const handleClose = () => {
        setFormState(initialFormState)
        setModalOpen(false)
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        formJson.stock_id = formState.stock_id;
        formJson.batch_id = formState.batch_id;
        formJson.store_id = formState.store_id;
        // console.log("Form Data", event.nativeEvent.submitter.name);
        const submitter = event.nativeEvent.submitter.name;
        if (submitter == 'remove') formJson.quantity = -Math.abs(formState.quantity)

        axios
            .post('/quantity/store', formJson)
            .then((response) => {
                refreshProducts();
                Swal.fire({
                    title: "Success!",
                    text: response.data.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
                setFormState(initialFormState);
                handleClose();
            })
            .catch((error) => {
                let errorMessage = "An unknown error occurred."; // Default error message

                if (error.response && error.response.data) {
                    // Check for multiple errors in `error.response.data.errors`
                    if (error.response.data.errors) {
                        errorMessage = Object.values(error.response.data.errors)
                            .flat() // Flatten nested arrays
                            .join(' | '); // Join messages with a separator
                    } else {
                        // Fallback to a single error message or a default message
                        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
                    }
                }

                Swal.fire({
                    title: "Failed!",
                    text: errorMessage,
                    icon: "error",
                    showConfirmButton: true,
                });
                console.error('Error:', error);
            })
            .finally(() => {
                setLoading(false); // Reset loading state
            });
    };

    // Function to update form state based on a batch object
    const updateFormStateFromProduct = (stock) => {
        setFormState((prevState) => ({
            ...prevState,
            batch_id: stock.batch_id,
            stock_id: stock.stock_id,
            store_id: stock.store_id ?? auth.store_id,
        }));
    };

    // Update selectedBatch when products change
    useEffect(() => {
        if (selectedStock) {
            updateFormStateFromProduct(selectedStock); // Reuse the function to update state
        }

    }, [selectedStock]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Update other fields (e.g., quantity, cost, price)
        setFormState((prevState) => {
            return {
                ...prevState,
                [name]: value, // For other inputs, update based on their name
            };
        });
    };

    const isValidQuantity = (quantity) => {
        // Check if quantity is a valid positive number
        return Number(quantity) != 0 && !isNaN(Number(quantity));
    };

    return (
        <React.Fragment>
            <Dialog
                fullWidth={true}
                maxWidth={"sm"}
                open={modalOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                component="form"
                onSubmit={handleSubmit}
                slotProps={{
                    paper: {
                        style: {
                            overflow: 'visible', // Apply overflow: visible to the Paper component
                        },
                    },
                }}
            >
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{ alignItems: "center", display: "flex" }}
                >
                    {"QUANTITY ADJUSTMENT"}
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{overflow:'visible'}}>
                    <Grid
                        container
                        spacing={2}
                        sx={{ justifyContent: "center" }}
                        direction="row"
                    >
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                type="number"
                                name="quantity"
                                label="Quantity"
                                variant="outlined"
                                required
                                autoFocus
                                value={formState.quantity}
                                onChange={handleInputChange}
                                sx={{
                                    mt: "0.3rem",
                                    input: {
                                        fontSize: "1.3rem",
                                        textAlign: "center",
                                    },
                                }}
                                onFocus={(event) => {
                                    event.target.select();
                                }}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={12} sx={{ mt: "0.6rem" }}>
                            <div style={{position:'relative', zIndex:999}}>
                            <CreatableSelect
                                isClearable
                                options={reasonOptions}
                                
                                placeholder="Select or create a reason"
                                name="reason"
                                required
                                menuContainerStyle={{'zIndex': 999}}
                                styles={{
                                    control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        height: "55px",
                                        zIndex: 999,
                                    }),
                                    
                                    menuPortal: base => ({ ...base, zIndex: 999 })
                                }}
                            />
                            </div>
                            
                            {/* <TextField
                                fullWidth
                                name="reason"
                                label="Reason"
                                variant="outlined"
                                required
                                value={formState.reason}
                                onChange={handleInputChange}
                                sx={{
                                    mt: "0.5rem",
                                    input: { fontSize: "1rem" },
                                }}
                                onFocus={(event) => {
                                    event.target.select();
                                }}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                            /> */}
                        </Grid>
                        <Grid size={12} sx={{ mt: "0.6rem" }}>
                            <FormControl
                                sx={{ minWidth: "200px", width: "100%" }}
                            >
                                <InputLabel>Store</InputLabel>
                                <Select
                                    value={formState.store_id}
                                    label="Store"
                                    onChange={handleInputChange}
                                    required
                                    name="store_id"
                                >
                                    {stores.map((store) => (
                                        <MenuItem
                                            key={store.id}
                                            value={store.id}
                                        >
                                            {store.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ paddingY: "10px", fontSize: "1.2rem" }}
                        type="submit"
                        color={formState.quantity < 0 ? "error" : "primary"}
                        disabled={loading || !isValidQuantity(formState.quantity)}
                    >
                        {formState.quantity < 0 ? "REMOVE QUANTITY" : "ADD QUANTITY"}
                    </Button>
                    {formState.quantity > 0 && (
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ paddingY: "10px", fontSize: "1.2rem" }}
                            type="submit"
                            color={'error'}
                            name="remove"
                            value={'remove'}
                            disabled={loading || !isValidQuantity(formState.quantity)}
                        >
                            {'REMOVE QUANTITY'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

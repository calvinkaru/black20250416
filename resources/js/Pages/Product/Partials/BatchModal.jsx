import React, { useState, useContext, useEffect } from "react";
import {
    IconButton,
    TextField, Switch, FormControlLabel,
    Grid2 as Grid, DialogTitle, DialogContent, DialogActions, Dialog, Button
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Select2 from "react-select";

import Swal from "sweetalert2";

export default function BatchModal({
    batchModalOpen,
    setBatchModalOpen,
    selectedBatch,
    refreshProducts,
    selectedProduct,
    contacts
}) {

    const initialFormState = {
        batch_id: "",
        quantity: "",
        cost: "",
        price: "",
        batch_number:"",
        expiry_date:'',
        is_active:true,
        contact_id:'',
    }

    const [isNew, setIsNew] = useState(false)
    const [formState, setFormState] = useState(initialFormState);
    const [loading, setLoading] = useState(false)

    const handleClose = () => {
        setIsNew(false)
        updateFormStateFromBatch(selectedBatch)
        setBatchModalOpen(false)
    };

    const handleAddToCartSubmit = async (event) => {
        event.preventDefault();
        if (loading) return;
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        formJson.new_batch = formState.batch_number;
        formJson.id = selectedProduct.id

        let url='/storebatch';
        if(!isNew) url='/productbatch/'+formState.batch_id

        // let response;
        // if(isNew) {response = await axios.post('/storebatch/', formJson);}
        // else {response = await axios.post('/productbatch/'+formState.batch_id, formJson);}

        axios
        .post(url, formJson)
        .then((resp) => {
            Swal.fire({
                title: "Success!",
                text: resp.data.message,
                icon: "success",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            refreshProducts()
            handleClose()
        })
        .catch((error) => {
            const errorMessages = Object.values(error.response.data.errors).flat().join(' | ');
            Swal.fire({
                title: "Failed!",
                text: errorMessages,
                icon: "error",
                showConfirmButton: true,
            });
            console.log(error);
        }).finally(() => {
            setLoading(false); // Reset submitting state
        });
    };

    // Function to update form state based on a batch object
    const updateFormStateFromBatch = (batch) => {
        setFormState((prevState) => ({
            ...prevState,
            batch_id: batch.batch_id,
            cost: batch.cost,
            price: batch.price,
            batch_number: batch.batch_number,
            // Handle 'N/A' value for expiry_date by setting it to empty string
            expiry_date: batch.expiry_date === 'N/A' ? '' : batch.expiry_date,
            is_active: batch.is_active === 1 ? true : false,
            is_featured: batch.is_featured === 1 ? true : false,
            contact_id: batch.contact_id,
        }));
    };

    // Update selectedBatch when products change
    useEffect(() => {

        if (selectedBatch) {
            console.log(selectedBatch);
            updateFormStateFromBatch(selectedBatch); // Reuse the function to update state
            setIsNew(false);
        }

    }, [selectedBatch]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Update other fields (e.g., quantity, cost, price)
        setFormState((prevState) => {
            if (name === 'is_active') {
                return {
                    ...prevState,
                    is_active: e.target.checked, // Update is_active based on the checkbox state
                };
            }else if (name === 'is_featured') {
                return {
                    ...prevState,
                    is_featured: e.target.checked, // Update is_active based on the checkbox state
                };
            }else {
                return {
                    ...prevState,
                    [name]: value, // For other inputs, update based on their name
                };
            }
        });
    };

    const handleSelectChange = (selectedOption) => {
        // `selectedOption` will contain the selected option object (e.g., { id: 1, name: 'Supplier 1' })
        setFormState({
          ...formState,
          contact_id: selectedOption ? selectedOption.id : null, // Set contact_id to the selected option's id, or null if cleared
        });
      };

    return (
        <React.Fragment>
            <Dialog
                fullWidth={true}
                maxWidth={"sm"}
                open={batchModalOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                PaperProps={{
                    component: "form",
                    onSubmit: handleAddToCartSubmit,
                }}
            >
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{ alignItems: "center", display: "flex" }}
                >
                    {isNew ? "NEW BATCH" : "EDIT BATCH"}

                    {!isNew && (
                        <Button
                            sx={{ ml: "1rem" }}
                            variant="contained"
                            color="success"
                            onClick={() => {
                                setIsNew(true);
                                setFormState(initialFormState);
                            }}
                        >
                            CREATE NEW BATCH
                        </Button>
                    )}
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
                <DialogContent>
                    <Grid
                        container
                        spacing={2}
                        sx={{ justifyContent: "center" }}
                        direction="row"
                    >
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                // type="number"
                                name="batch_number"
                                label="Batch Number"
                                variant="outlined"
                                autoFocus
                                value={formState.batch_number}
                                onChange={handleInputChange}
                                sx={{
                                    mt: "0.3rem",
                                    input: { fontSize: "1rem" },
                                }}
                                required
                                onFocus={(event) => {
                                    event.target.select();
                                }}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                    input: {
                                        // startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={6}>
                            <TextField
                                fullWidth
                                type="number"
                                name="price"
                                label="Price"
                                variant="outlined"
                                required
                                value={formState.price}
                                onChange={handleInputChange}
                                sx={{
                                    mt: "0.3rem",
                                    input: { fontSize: "1rem" },
                                }}
                                onFocus={(event) => {
                                    event.target.select();
                                }}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                    input: {
                                        // startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                                        step: 0.5,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                type={"number"}
                                name="cost"
                                label="Cost"
                                variant="outlined"
                                required
                                value={formState.cost}
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
                                    input: {
                                        // startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                                        step: 0.5,
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                type={"date"}
                                name="expiry_date"
                                label="Expiry Date"
                                variant="outlined"
                                value={formState.expiry_date}
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
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12 }} sx={{zIndex:100,}}>
                        <Select2
                                    className="w-full"
                                    placeholder="Select a supplier..."
                                    name="contact_id"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            height: "55px",
                                            zIndex:100,
                                        }),
                                        menuPortal: (baseStyles) => ({
                                            ...baseStyles,
                                            zIndex: 9999, // Set z-index for the dropdown menu to ensure it appears on top of other elements
                                          }),
                                    }}
                                    value={contacts.find((contact) => contact.id === formState.contact_id) || null}
                                    onChange={(selectedOption) => handleSelectChange(selectedOption)}
                                    options={contacts} // Options to display in the dropdown
                                    // onChange={(selectedOption) => handleChange(selectedOption)}
                                    isClearable // Allow the user to clear the selected option
                                    getOptionLabel={(option) => option.name}
                                    getOptionValue={(option) => option.id}
                                ></Select2>
                        </Grid>
                        <Grid
                            size={6}
                            sx={{ justifyContent: "center", mt: "1rem" }}
                            container
                            direction="row"
                        >
                            <FormControlLabel
                                value="1"
                                control={
                                    <Switch
                                        color="primary"
                                        name="is_active"
                                        onChange={handleInputChange}
                                        checked={formState.is_active}
                                    />
                                }
                                label="Is batch active? "
                                labelPlacement="top"
                            />
                        </Grid>
                        <Grid
                            size={6}
                            sx={{ justifyContent: "center", mt: "1rem" }}
                            container
                            direction="row"
                        >
                            <FormControlLabel
                                value="1"
                                control={
                                    <Switch
                                        color="primary"
                                        name="is_featured"
                                        onChange={handleInputChange}
                                        checked={formState.is_featured}
                                    />
                                }
                                label="Is featured? "
                                labelPlacement="top"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ paddingY: "10px", fontSize: "1.2rem" }}
                        type="submit"
                        disabled={loading}
                    >
                        {isNew ? "SAVE BATCH" : "UPDATE BATCH"}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

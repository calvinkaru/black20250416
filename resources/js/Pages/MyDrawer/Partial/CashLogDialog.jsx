import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
    IconButton,
    TextField,
    Grid2 as Grid,
    Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InputAdornment from "@mui/material/InputAdornment";
import axios from "axios";
import Swal from "sweetalert2";
import dayjs from "dayjs";

export default function CashLogDialog({
    open,
    setOpen,
    transactionType,
    refreshLogs
}) {
    const initialFormState = {
        amount: 0,
        description: "",
        transaction_type: transactionType || "deposit",
    };

    const [formState, setFormState] = useState(initialFormState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Update form state when transaction type changes
        if (transactionType) {
            const currentTime = dayjs().format('h:mm A');
            let defaultDescription = "";
            
            if (transactionType === "open_cashier") {
                defaultDescription = "Opening Cashier Balance - " + currentTime;
            } else if (transactionType === "deposit") {
                defaultDescription = "Deposit - " + currentTime;
            } else if (transactionType === "withdrawal") {
                defaultDescription = "Withdrawal - " + currentTime;
            } else if (transactionType === "temp_close_cashier") {
                defaultDescription = "Temporary Closing - " + currentTime;
            }
            
            setFormState({
                ...formState,
                transaction_type: transactionType,
                description: defaultDescription,
            });
        }
    }, [transactionType]);

    // Handle closing of the dialog
    const handleClose = () => {
        setOpen(false);
        setFormState(initialFormState);
    };

    // Handle changes in the form fields
    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setFormState({
            ...formState,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        if (loading) return;
        setLoading(true);
        
        const submittedFormData = new FormData(event.currentTarget);
        let formJson = Object.fromEntries(submittedFormData.entries());

        // Send the POST request to save the transaction
        axios
            .post(route('my-drawer.store-cash-log'), formJson)
            .then((resp) => {
                Swal.fire({
                    title: "Success!",
                    text: resp.data.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
                refreshLogs();
                setFormState(initialFormState);
                setOpen(false);
            })
            .catch((error) => {
                console.error("Submission failed with errors:", error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "An error occurred",
                    icon: "error",
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Get dialog title based on transaction type
    const getDialogTitle = () => {
        switch (formState.transaction_type) {
            case "open_cashier":
                return "OPEN CASHIER";
            case "deposit":
                return "DEPOSIT";
            case "withdrawal":
                return "WITHDRAWAL";
            case "temp_close_cashier":
                return "TEMPORARILY CLOSE CASHIER";
            default:
                return "CASH LOG";
        }
    };

    return (
        <React.Fragment>
            <Dialog
                fullWidth={true}
                maxWidth={"sm"}
                open={open}
                onClose={handleClose}
                aria-labelledby="cash-log-dialog-title"
                PaperProps={{
                    component: "form",
                    onSubmit: handleSubmit,
                }}
            >
                <DialogTitle id="cash-log-dialog-title">
                    {getDialogTitle()}
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
                    <Grid container spacing={2}>
                        <Grid item size={12}>
                            <TextField
                                fullWidth
                                type="number"
                                name="amount"
                                label="Amount"
                                variant="outlined"
                                autoFocus
                                required
                                sx={{ input: { fontWeight: "bold" } }}
                                value={formState.amount}
                                onChange={handleFieldChange}
                                onFocus={(event) => {
                                    event.target.select();
                                }}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                Rs.
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>

                        <Grid container size={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label={"Description"}
                                name="description"
                                value={formState.description}
                                onChange={handleFieldChange}
                                required
                            />
                        </Grid>

                        <input
                            type="hidden"
                            name="transaction_type"
                            value={formState.transaction_type}
                        />
                    </Grid>

                    <Divider sx={{ py: "0.5rem" }}></Divider>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ paddingY: "15px", fontSize: "1.5rem" }}
                        type="submit"
                        disabled={
                            formState.amount <= 0 ||
                            !formState.description ||
                            loading
                        }
                    >
                        {loading ? 'Processing...' : 'SAVE'}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

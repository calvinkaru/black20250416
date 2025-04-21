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
    Typography,
    Box,
    Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InputAdornment from "@mui/material/InputAdornment";
import axios from "axios";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import numeral from "numeral";

export default function DenominationsDialog({
    open,
    setOpen,
    refreshLogs,
    currentBalance
}) {
    // State for denominations
    const [coinDenominations, setCoinDenominations] = useState([
        { value: 0.5, label: "50 cents" },
        { value: 1, label: "1 Rs" },
        { value: 2, label: "2 Rs" },
        { value: 5, label: "5 Rs" },
        { value: 10, label: "10 Rs" },
    ]);

    const [noteDenominations, setNoteDenominations] = useState([
        { value: 10, label: "10 Rs" },
        { value: 20, label: "20 Rs" },
        { value: 50, label: "50 Rs" },
        { value: 100, label: "100 Rs" },
        { value: 500, label: "500 Rs" },
        { value: 1000, label: "1000 Rs" },
        { value: 5000, label: "5000 Rs" },
    ]);

    // Load custom denominations from settings
    useEffect(() => {
        axios.get('/api/settings/my-drawer')
            .then(response => {
                if (response.data && response.data.settings) {
                    // Parse coin denominations if they exist
                    if (response.data.settings.drawer_coin_denominations) {
                        try {
                            const customCoins = JSON.parse(response.data.settings.drawer_coin_denominations);
                            if (Array.isArray(customCoins) && customCoins.length > 0) {
                                setCoinDenominations(customCoins);
                            }
                        } catch (e) {
                            console.error("Error parsing coin denominations:", e);
                        }
                    }
                    
                    // Parse note denominations if they exist
                    if (response.data.settings.drawer_note_denominations) {
                        try {
                            const customNotes = JSON.parse(response.data.settings.drawer_note_denominations);
                            if (Array.isArray(customNotes) && customNotes.length > 0) {
                                setNoteDenominations(customNotes);
                            }
                        } catch (e) {
                            console.error("Error parsing note denominations:", e);
                        }
                    }
                }
            })
            .catch(error => {
                console.error("Error fetching denominations:", error);
            });
    }, []);

    const initialDenominationsState = {};
    
    // Initialize denominations state with 0 counts
    useEffect(() => {
        const newState = {};
        [...coinDenominations, ...noteDenominations].forEach(denom => {
            newState[denom.value] = denominationsState[denom.value] || 0;
        });
        setDenominationsState(newState);
    }, [coinDenominations, noteDenominations]);

    const [denominationsState, setDenominationsState] = useState(initialDenominationsState);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [difference, setDifference] = useState(0);

    // Calculate total amount and difference whenever denominations change
    useEffect(() => {
        let total = 0;
        Object.entries(denominationsState).forEach(([value, count]) => {
            total += parseFloat(value) * parseInt(count || 0);
        });
        setTotalAmount(total);
        setDifference(total - currentBalance);
    }, [denominationsState, currentBalance]);

    // Handle closing of the dialog
    const handleClose = () => {
        setOpen(false);
        setDenominationsState(initialDenominationsState);
    };

    // Handle changes in denomination counts
    const handleDenominationChange = (value, count) => {
        setDenominationsState({
            ...denominationsState,
            [value]: count,
        });
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        if (loading) return;
        setLoading(true);
        
        const currentTime = dayjs().format('h:mm A');
        const description = "Closing Cashier Balance - " + currentTime;
        
        // Prepare data for submission
        const formData = {
            amount: totalAmount,
            description: description,
            transaction_type: "close_cashier",
            denominations: denominationsState,
        };

        // Send the POST request to save the transaction
        axios
            .post(route('my-drawer.store-cash-log'), formData)
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
                setDenominationsState(initialDenominationsState);
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

    return (
        <React.Fragment>
            <Dialog
                fullWidth={true}
                maxWidth={"md"}
                open={open}
                onClose={handleClose}
                aria-labelledby="denominations-dialog-title"
                PaperProps={{
                    component: "form",
                    onSubmit: handleSubmit,
                }}
            >
                <DialogTitle id="denominations-dialog-title">
                    CLOSE CASHIER - COUNT DENOMINATIONS
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
                    <Typography variant="subtitle1" gutterBottom>
                        Please count and enter the number of coins and notes in your drawer:
                    </Typography>
                    
                    <Grid container spacing={3}>
                        {/* Coins Section */}
                        <Grid xs={12} md={6}>
                            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Coins
                                </Typography>
                                <Grid container spacing={2}>
                                    {coinDenominations.map((denom) => (
                                        <Grid xs={12} key={denom.value}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label={denom.label}
                                                variant="outlined"
                                                value={denominationsState[denom.value]}
                                                onChange={(e) => handleDenominationChange(denom.value, e.target.value)}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            = Rs. {numeral(denom.value * (denominationsState[denom.value] || 0)).format('0,0.00')}
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                inputProps={{ min: 0 }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                        
                        {/* Notes Section */}
                        <Grid xs={12} md={6}>
                            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Notes
                                </Typography>
                                <Grid container spacing={2}>
                                    {noteDenominations.map((denom) => (
                                        <Grid xs={12} key={denom.value}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label={denom.label}
                                                variant="outlined"
                                                value={denominationsState[denom.value]}
                                                onChange={(e) => handleDenominationChange(denom.value, e.target.value)}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            = Rs. {numeral(denom.value * (denominationsState[denom.value] || 0)).format('0,0.00')}
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                inputProps={{ min: 0 }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Grid container spacing={2}>
                            <Grid xs={12}>
                                <Typography variant="subtitle1">
                                    Counted Amount:
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    Rs. {numeral(totalAmount).format('0,0.00')}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ paddingY: "15px", fontSize: "1.5rem" }}
                        type="submit"
                        disabled={totalAmount <= 0 || loading}
                    >
                        {loading ? 'Processing...' : 'CLOSE CASHIER'}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

import React, { useState, useContext } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import PaymentsIcon from "@mui/icons-material/Payments";
import { Box, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PercentIcon from '@mui/icons-material/Percent';
import InputAdornment from '@mui/material/InputAdornment';
import { router } from '@inertiajs/react';
import axios from "axios";
import Swal from "sweetalert2";
import { usePage } from "@inertiajs/react";

import { useSales as useCart } from '@/Context/SalesContext';
import { SharedContext } from "@/Context/SharedContext";

export default function CashCheckoutDialog({ disabled }) {
    const return_sale = usePage().props.return_sale;
    const return_sale_id = usePage().props.sale_id;
    const { cartState, cartTotal, totalProfit, emptyCart, taxes, totalWithTaxes, orderType } = useCart();
    const { selectedCustomer, saleDate } = useContext(SharedContext);
    const [loading, setLoading] = useState(false);

    const [discount, setDiscount] = useState(0);
    const [amountReceived, setAmountReceived] = useState(0);

    const handleDiscountChange = (event) => {
        const inputDiscount = event.target.value;
        const newDiscount = inputDiscount !== "" ? parseFloat(inputDiscount) : 0;
        setDiscount(newDiscount);
    };

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setAmountReceived(0)
        setDiscount(0)
        setOpen(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (loading) return;
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        formJson.cartItems = cartState;
        formJson.profit_amount = totalProfit - discount; //total profit is from the sale items, but we apply discount for the bill also
        formJson.sale_date = saleDate;
        formJson.payment_method = 'Cash'
        formJson.contact_id = selectedCustomer.id
        formJson.return_sale = return_sale;
        formJson.return_sale_id = return_sale_id;
        formJson.order_type_id = orderType;
        formJson.taxes = taxes; // Include taxes in the form data

        axios.post('/pos/checkout', formJson)
            .then((resp) => {
                Swal.fire({
                    title: "Success!",
                    text: resp.data.message,
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
                emptyCart() //Clear the cart from the Context API
                setAmountReceived(0)
                setDiscount(0)
                router.visit('/receipt/' + resp.data.sale_id)
                axios.get('/sale-notification/' + resp.data.sale_id)
                    .then((resp) => {
                        console.log("Notification sent successfully:", resp.data.success);
                    })
                    .catch((error) => {
                        console.error("Failed to send notification:", error.response.data.error);
                    });
                setOpen(false)
            })
            .catch((error) => {
                // console.error("Submission failed with errors:", error);
                Swal.fire({
                    title: "Failed!",
                    text: error.response.data.error,
                    icon: "error",
                    showConfirmButton: true,
                    // timer: 2000,
                    // timerProgressBar: true,
                });
                console.log(error);
            }).finally(() => {
                setLoading(false); // Reset submitting state
            });
    };

    const discountPercentage = () => {
        if (discount < 0 || discount > 100) {
            alert("Discount must be between 0 and 100");
            return;
        }
        const discountAmount = (cartTotal * discount) / 100;
        setDiscount(discountAmount);
    }

    return (
        <>
            <Button
                variant="contained"
                color="success"
                sx={{ paddingY: "15px", flexGrow: "1" }}
                size="large"
                endIcon={<PaymentsIcon />}
                onClick={handleClickOpen}
                disabled={disabled}
            >
                {cartTotal < 0 ? `REFUND Rs.${Math.abs(totalWithTaxes)}` : `CASH Rs.${totalWithTaxes.toFixed(2)}`}
            </Button>
            <Dialog
                fullWidth={true}
                maxWidth={"sm"}
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                PaperProps={{
                    component: 'form',
                    onSubmit: handleSubmit,
                }}
            >
                <DialogTitle id="alert-dialog-title">
                    {"Cash Checkout"}
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
                    <TextField
                        id="txtAmount"
                        fullWidth
                        autoFocus
                        variant="outlined"
                        label={cartTotal < 0 ? 'Refund' : 'Amount Received'}
                        type="number"
                        name="amount_received"
                        onFocus={event => {
                            event.target.select();
                        }}
                    
                        onChange={(event) => {
                            const value = event.target.value;

                            const numericValue = parseFloat(value); // Convert to number
                            setAmountReceived(
                                return_sale && numericValue > 0 ? -numericValue : numericValue
                            );
                        }}

                        sx={{ input: { textAlign: "center", fontSize: '2rem' }, }}
                        value={amountReceived}
                        slotProps={{
                            input: {
                                style: { textAlign: 'center' },
                                placeholder: cartTotal < 0 ? 'Refund Amount' : 'Amount Received',
                                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                            },
                        }}
                    />

                    <TextField
                        fullWidth
                        id="txtDiscount"
                        // label="Discount"
                        type="number"
                        name="discount"
                        label="Discount"
                        variant="outlined"
                        value={discount}
                        sx={{ mt: "2rem", input: { textAlign: "center", fontSize: '2rem' }, }}
                        onChange={handleDiscountChange}
                        onFocus={event => {
                            event.target.select();
                        }}
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                            input: {
                                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                                endAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton color="primary" onClick={discountPercentage}>
                                            <PercentIcon fontSize="large"></PercentIcon>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />

                    <Box className="flex items-center">

                        {/* Net total (after discount) */}
                        <TextField
                            fullWidth
                            label="Payable Amount"
                            variant="outlined"
                            name="net_total"
                            value={(totalWithTaxes - discount).toFixed(2)}
                            sx={{ mt: "2rem", input: { textAlign: "center", fontSize: '2rem' }, }}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    style: { textAlign: 'center' },
                                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                                },
                            }}
                        />

                        <TextField
                            id="txtChange"
                            fullWidth
                            label="Change"
                            variant="outlined"
                            name="change_amount"
                            sx={{ mt: "2rem", ml: '1rem', input: { textAlign: "center", fontSize: '2rem' } }}
                            value={(amountReceived - (totalWithTaxes - discount)).toFixed(2)}//Change calculation
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                                },
                            }}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        variant="outlined"
                        label={'Note'}
                        name="note"
                        multiline
                        sx={{ mt: '2rem', }}
                    />

                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ paddingY: "15px", fontSize: "1.5rem" }}
                        type="submit"
                        // onClick={handleClose}
                        disabled={
                            !amountReceived ||
                            (cartTotal < 0 && amountReceived === 0) || // Disable if refund and amount received is 0
                            (cartTotal < 0 && amountReceived != (totalWithTaxes - discount)) || // Disable if refund and amount received doesn't match cart total minus discount
                            (cartTotal >= 0 && (amountReceived - (totalWithTaxes - discount)) < 0) || // Disable if cartTotal is positive and amount is insufficient
                            loading // Disable during loading

                        } //amountReceived-(totalWithTaxes-discount) 
                    >
                        {loading ? 'Loading...' : cartTotal < 0 ? 'REFUND' : 'PAY'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

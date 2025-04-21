import React, { useState, useEffect, useContext } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { useSales as useCart } from "@/Context/SalesContext";
import { SharedContext } from "@/Context/SharedContext";
import dayjs from "dayjs";

import {
    IconButton,
    Grid2 as Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function HeldItemsModal({
    modalOpen,
    setModalOpen,
}) {
    const { setHeldCartToCart, removeHeldItem } = useCart();
    const { setSelectedCustomer } = useContext(SharedContext);
    const [heldCartKeys, setHeldCartKeys] = useState([]);

    const [heldCarts, setHeldCarts] = useState({});
    
    const retrieveHeldCartKeys = () => {
        const carts = JSON.parse(localStorage.getItem('heldCarts')) || {};
        setHeldCarts(carts);
        setHeldCartKeys(Object.keys(carts)); // Update state with keys
    };

    const handleClose = () => {
        setHeldCartKeys([])
        setModalOpen(false);
    };

    const handleLoadHeldCart = (key) => {
        // Get the customer info before removing the held cart
        const customerInfo = heldCarts[key]?.customerInfo;
        
        // Restore the cart
        setHeldCartToCart(key);
        
        // Set the customer if available
        if (customerInfo) {
            setSelectedCustomer(customerInfo);
        }
        
        // Refresh the held cart keys and close the modal
        retrieveHeldCartKeys();
        handleClose();
    };

    useEffect(() => {
        if (modalOpen) {
            retrieveHeldCartKeys(); // Only fetch keys when modal is open
        }
    }, [modalOpen]);

    return (
        <>
            <Dialog
                fullWidth={true}
                maxWidth={"xs"}
                open={modalOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
            >
                <DialogTitle id="alert-dialog-title">
                    {"HOLD ITEMS"}
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
                    <Grid container spacing={2} display={'flex'} flexDirection={'column'}>
                    {heldCartKeys.map((key) => (
                        <ListItemButton
                        key={key}
                            onClick={() => handleLoadHeldCart(key)} // Set the cart when clicked
                        >
                        <ListItemText 
                            primary={dayjs(key).format('MMMM D, YYYY h:mm A')} 
                            secondary={
                                heldCarts[key]?.customerInfo?.name 
                                    ? `Customer: ${heldCarts[key].customerInfo.name}` 
                                    : 'No customer info'
                            }
                        />
                        </ListItemButton>
                    ))}
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
}

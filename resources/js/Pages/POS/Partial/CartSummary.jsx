import React, { useEffect, useState } from "react";
import List from "@mui/material/List";
import { ListItem, TextField, Divider, Typography } from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import numeral from "numeral";
import { useSales as useCart } from '@/Context/SalesContext';

export default function CartSummary() {
    const { cartState, cartTotal, totalQuantity, taxes, totalWithTaxes, selectedOrderTypeObj } = useCart();

    return (
        <List sx={{ width: "100%", bgcolor: "background.paper",}}>
            <Divider
                sx={{
                    borderBottom: "2px dashed",
                    borderColor: "grey.500",
                    my: "1.5rem",
                }}
            />
            <ListItem
                secondaryAction={
                    <Typography variant="h5" color="initial" sx={{fontSize:{sm:'1rem', xs:'1.2rem'}}}>
                        <strong>{cartState.length} | Qty. {totalQuantity}</strong>
                    </Typography>
                }
            >
                <ListItemText primary="Total Items" />
            </ListItem>

            {/* Subtotal */}
            <ListItem
                secondaryAction={
                    <Typography variant="h5" color="initial" sx={{ fontSize: { sm: '1rem', xs: '1.2rem' } }}>
                        <strong>Rs.{numeral(cartTotal).format('0,00.00')}</strong>
                    </Typography>
                }
            >
                <ListItemText primary="Subtotal" />
            </ListItem>

            {/* Taxes */}
            {taxes && taxes.map((tax) => (
                <ListItem
                    key={tax.id}
                    secondaryAction={
                        <Typography variant="h5" color="initial" sx={{ fontSize: { sm: '1rem', xs: '1.2rem' } }}>
                            <strong>Rs.{numeral(tax.amount).format('0,00.00')}</strong>
                        </Typography>
                    }
                >
                    <ListItemText primary={tax.name} />
                </ListItem>
            ))}

            <ListItem
                secondaryAction={
                    <Typography variant="h5" color="initial" sx={{fontSize:{sm:'1rem', xs:'1.2rem'}}}>
                        <strong>Rs.{numeral(totalWithTaxes).format('0,00.00')}</strong> 
                    </Typography>
                }
            >
                <ListItemText primary="Total" />
            </ListItem>
        </List>
    );
}

import React, { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import BackHandIcon from "@mui/icons-material/BackHand";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddCardIcon from "@mui/icons-material/AddCard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from '@mui/icons-material/Receipt';
import Grid from "@mui/material/Grid2";

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PrintIcon from '@mui/icons-material/Print';
import { styled, alpha } from '@mui/material/styles';

import { useSales as useCart } from "@/Context/SalesContext";
import { SharedContext } from "@/Context/SharedContext";
import { usePage, Link } from "@inertiajs/react";

import HeldItemsModal from "./HeldItemsModal";
import PaymentsCheckoutDialog from "@/Components/PaymentsCheckoutDialog";
import QuotationDialog from "./QuotationDialog";
import CashCheckoutDialog from "./CashCheckoutDialog";

import Swal from "sweetalert2";

const StyledMenu = styled((props) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color: 'rgb(55, 65, 81)',
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity,
                ),
            },
        },
        ...theme.applyStyles('dark', {
            color: theme.palette.grey[300],
        }),
    },
}));

export default function CartFooter() {
    const return_sale = usePage().props.return_sale;
    const { cartState, holdCart, emptyCart } = useCart();
    const { selectedCustomer, saleDate } = useContext(SharedContext);
    const [heldModalOpen, setHeldModalOpen] = useState(false);
    const [paymentsModalOpen, setPaymentsModalOpen] = useState(false);
    const [quotationModalOpen, setQuotationModalOpen] = useState(false);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const onCartHold = () => {
        handleClose();
        Swal.fire({
            title: "Do you want to hold this cart?",
            showDenyButton: true,
            confirmButtonText: "YES",
            denyButtonText: `NO`,
        }).then((result) => {
            if (result.isConfirmed) {
                holdCart();
            }
        });
    };

    const onCartEmpty = () => {
        Swal.fire({
            title: "Do you want to clear this cart?",
            showDenyButton: true,
            confirmButtonText: "YES",
            denyButtonText: `NO`,
        }).then((result) => {
            if (result.isConfirmed) {
                emptyCart();
            }
        });
    };

    return (
        <Grid container sx={{ pt: "1.75rem" }} spacing={1}>
            <Grid
                container
                spacing={1}
                width={"100%"}
            >
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Button
                        variant="contained"
                        color="error"
                        endIcon={<DeleteForeverIcon />}
                        disabled={
                            cartState.length === 0 || selectedCustomer === null
                        }
                        onClick={onCartEmpty}
                        size="large"
                        fullWidth
                    >
                        EMPTY
                    </Button>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                    <Button
                        id="demo-customized-button"
                        aria-controls={open ? 'demo-customized-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        variant="contained"
                        size="large"
                        fullWidth
                        disableElevation
                        onClick={handleClick}
                        endIcon={<MoreVertIcon />}
                        sx={{
                            bgcolor: "#1A2027",
                            '&:hover': {
                                bgcolor: "#2A3346",
                            },
                        }}
                    >
                        More
                    </Button>
                    <StyledMenu
                        id="demo-customized-menu"
                        MenuListProps={{
                            'aria-labelledby': 'demo-customized-button',
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                    >
                        <MenuItem disableRipple disabled={
                            cartState.length === 0 || selectedCustomer === null || return_sale
                        } onClick={onCartHold}>
                            <BackHandIcon />
                            HOLD
                        </MenuItem>
                        <MenuItem disableRipple onClick={() => { setHeldModalOpen(true); handleClose(); }} disabled={return_sale}>
                            <ShoppingCartIcon />
                            HOLD ITEMS
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />
                        {/* <Link href={`/receipt/1`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <MenuItem>
                                <PrintIcon />
                                PRINT
                            </MenuItem>
                        </Link> */}
                        <MenuItem onClick={() => setQuotationModalOpen(true)} disableRipple disabled={selectedCustomer?.id === 1 || cartState.length === 0 || selectedCustomer === null}
                        >
                            <ReceiptIcon />
                            QUOTATION
                        </MenuItem>
                    </StyledMenu>
                </Grid>
                <Grid size={{ xs: 6, sm: 6 }}>
                    <Button
                        variant="contained"
                        endIcon={<AddCardIcon />}
                        disabled={
                            cartState.length === 0 || selectedCustomer === null || !saleDate
                        }
                        onClick={() => setPaymentsModalOpen(true)}
                        size="large"
                        fullWidth
                    >
                        PAYMENTS
                    </Button>
                </Grid>
            </Grid>

            <Grid container sx={{ width: "100%" }}>
                <CashCheckoutDialog
                    disabled={
                        cartState.length === 0 || selectedCustomer === null || !saleDate
                    }
                />
            </Grid>

            <HeldItemsModal
                modalOpen={heldModalOpen}
                setModalOpen={setHeldModalOpen}
            />
            <PaymentsCheckoutDialog
                useCart={useCart}
                open={paymentsModalOpen}
                setOpen={setPaymentsModalOpen}
                selectedContact={selectedCustomer}
                is_sale={true}
                formData={{ sale_date: saleDate }}
            />
            <QuotationDialog
                useCart={useCart}
                open={quotationModalOpen}
                setOpen={setQuotationModalOpen}
                selectedContact={selectedCustomer}
            />
        </Grid>
    );
}

import * as React from "react";
import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link } from "@inertiajs/react";
import {
    Card,
    CardContent,
    Typography,
    Grid2 as Grid,
    TextField,
    ListItem,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Alert,
    Box,
    IconButton
} from "@mui/material";
import dayjs from "dayjs";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import PaymentsIcon from "@mui/icons-material/Payments";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import numeral from "numeral";

import Summaries from "./Partials/Summaries";
import OrderTypeSummary from "./Partials/OrderTypeSummary";

export default function Dashboard({ data, logo, version, store_name }) {
    const auth = usePage().props.auth.user;
    const permissions = usePage().props.userPermissions;
    const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const currentDate = dayjs().format("MMMM D, YYYY");

    const [cash_in, setCashIn] = useState(0);
    const [total_sales, setTotalSales] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [cash, setCash] = useState(0);
    const [cheque, setCheque] = useState(0);
    const [credit, setCredit] = useState(0);
    const [card, setCard] = useState(0);

    const refreshSummary = async () => {
        try {
            const response = await axios.post("/dashboard/summary", {
                start_date: startDate,
                end_date: endDate,
            });
            const { cash_in, total_sales, expenses, cash, cheque, credit, card } = response.data.summary;
            setCashIn(cash_in);
            setTotalSales(total_sales);
            setExpenses(expenses);
            setCash(cash);
            setCheque(cheque);
            setCredit(credit);
            setCard(card);
        } catch (error) {
            console.error("Error fetching summary:", error);
        }
    };

    useEffect(() => {
        refreshSummary(); // Call on component mount
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        refreshSummary(); // Call whenever startDate or endDate changes
    }, [startDate, endDate]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            {(auth.user_role == "super-admin" || permissions.includes("products") || permissions.includes("cheques")) && (

                <Grid container spacing={{ xs: 0.5, sm: 1 }} flexDirection={'row'} sx={{ mb: 2 }}>
                    {parseFloat(data.lowStock) != 0 && (
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Link href={"/products?status=alert&per_page=" + data.lowStock}>
                                <Alert severity="warning"><strong>{data.lowStock}</strong> Alert Products</Alert>
                            </Link>
                        </Grid>
                    )}
                    {parseFloat(data.outOfStock) != 0 && (
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Link href={"/products?status=out_of_stock&per_page=" + data.outOfStock}>
                                <Alert severity="error"><strong>{data.outOfStock}</strong> Out of Stocks</Alert>
                            </Link>
                        </Grid>
                    )}
                    {parseFloat(data.pending_cheque_count) != 0 && (
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Link href={"/cheques?status=pending&per_page=" + data.pending_cheque_count}>
                                <Alert severity="primary"><strong>{data.pending_cheque_count}</strong> Pending Cheque/s</Alert>
                            </Link>
                        </Grid>
                    )}
                    {parseFloat(data.cheque_alert_count) != 0 && (
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <Link href={`/cheques?status=alert&per_page=${data.cheque_alert_count}`}>
                                <Alert severity="error"><strong>{data.cheque_alert_count}</strong> Alert Cheque/s</Alert>
                            </Link>
                        </Grid>
                    )}
                </Grid>
            )}


            {(auth.user_role == "super-admin" || permissions.includes("products") || permissions.includes("sales")) && (
                <Grid
                    container
                    spacing={2}
                    sx={{ display: "flex", flexDirection: "row" }}
                    width={"100%"}
                >
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Card sx={{ height: "100%", backgroundColor: "#77E4C8" }}>
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    sx={{
                                        color: "text.secondary",
                                        fontSize: 14,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Total items
                                </Typography>
                                <Typography variant="h5" component="div">
                                    {data.totalItems}
                                </Typography>
                                <span>{data.totalQuantities} QTY</span>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Card sx={{ height: "100%", backgroundColor: "#FDFFE2" }}>
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    sx={{
                                        color: "text.secondary",
                                        fontSize: 14,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Total valuation
                                </Typography>
                                <Typography variant="h5" component="div">
                                    Rs. {data.totalValuation}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Card sx={{ height: "100%", backgroundColor: "#FFEBD4" }}>
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    sx={{
                                        color: "text.secondary",
                                        fontSize: 14,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Sold Items
                                </Typography>
                                <Typography variant="h5" component="div">
                                    {data.soldItems}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Card sx={{ height: "100%", backgroundColor: "#D1E9F6" }}>
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    sx={{
                                        color: "text.secondary",
                                        fontSize: 14,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Customer balance
                                </Typography>
                                <Typography variant="h5" component="div">
                                    Rs. {data.customerBalance}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}


            <Grid container spacing={2} sx={{ mt: "3rem", pb: 4 }}>
    {/* Sales, Order Type, and Hello Admin Widgets */}
    {(auth.user_role === "super-admin" || permissions.includes("sales") || permissions.includes("expenses")) && (
        <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ width: "100%", height: "100%" }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Start Date"
                                name="start_date"
                                type="date"
                                fullWidth
                                sx={{ '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)' } }}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="End Date"
                                name="end_date"
                                type="date"
                                fullWidth
                                sx={{ '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)' } }}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </Grid>
                    </Grid>

                    <List>
                        <Link href="/reports/dailycash" passHref>
                            <ListItem secondaryAction={numeral(cash).format("0,0.00")}>
                                <ListItemButton>
                                    <ListItemIcon><AttachMoneyIcon /></ListItemIcon>
                                    <ListItemText primary="Cash" />
                                </ListItemButton>
                            </ListItem>
                        </Link>
                        <Divider />
                        <ListItem secondaryAction={numeral(card).format("0,0.00")}>
                            <ListItemButton>
                                <ListItemIcon><CreditCardIcon /></ListItemIcon>
                                <ListItemText primary="Card" />
                            </ListItemButton>
                        </ListItem>
                        <Divider />
                        <ListItem secondaryAction={numeral(cheque).format("0,0.00")}>
                            <ListItemButton>
                                <ListItemIcon><ReceiptIcon /></ListItemIcon>
                                <ListItemText primary="Cheque" />
                            </ListItemButton>
                        </ListItem>
                        <Divider />
                        <ListItem secondaryAction={numeral(credit).format("0,0.00")}>
                            <ListItemButton>
                                <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
                                <ListItemText primary="Credit" />
                            </ListItemButton>
                        </ListItem>
                        <Divider />
                        <Link href="/sales" passHref>
                            <ListItem
                                secondaryAction={
                                    <Typography fontWeight="bold">
                                        {numeral(total_sales).format("0,0.00")}
                                    </Typography>
                                }
                            >
                                <ListItemButton>
                                    <ListItemIcon><PaidIcon /></ListItemIcon>
                                    <ListItemText
                                        primary={<Typography fontWeight="bold">Total Sales</Typography>}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </Link>
                        <Divider />
                        <Link href="/expenses" passHref>
                            <ListItem secondaryAction={numeral(expenses).format("0,0.00")}>
                                <ListItemButton>
                                    <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
                                    <ListItemText primary="Expenses" />
                                </ListItemButton>
                            </ListItem>
                        </Link>
                        <Divider />
                        <Link href="/reports/summary-report" passHref>
                            <ListItem>
                                <ListItemText
                                    sx={{ textAlign: 'center', color: '#1976d2', textDecoration: 'underline' }}
                                    primary="VIEW SUMMARY"
                                />
                            </ListItem>
                        </Link>
                    </List>
                </CardContent>
            </Card>
        </Grid>
    )}

    {(auth.user_role === "super-admin" || permissions.includes("sales")) && (
        <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ width: "100%", height: "100%" }}>
                <CardContent>
                    <OrderTypeSummary />
                </CardContent>
            </Card>
        </Grid>
    )}

    <Grid size={{ xs: 12, md: 4 }}>
        <Card
            sx={{
                width: "100%",
                height: "100%",
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Grid
                container
                direction="column"
                spacing={2}
                alignItems="center"
                textAlign="center"
            >
                <Grid>
                    <img src={logo} alt="" style={{ maxHeight: '250px', maxWidth: '350px', objectFit: 'contain' }} />
                </Grid>
                <Grid>
                    <Typography variant="h4">Hello, {auth.name}!</Typography>
                </Grid>
                <Grid sx={{ width: '100%' }}>
                    <Divider />
                </Grid>
                <Grid>
                    <Typography variant="h4">📅 Today is {currentDate}</Typography>
                </Grid>
            </Grid>
        </Card>
    </Grid>

    {/* Summary Section */}
    {(auth.user_role === "super-admin" || permissions.includes("sales")) && (
        <Grid size={{ xs: 12 }}>
            <Summaries />
        </Grid>
    )}
</Grid>


            <Box sx={{ justifyContent: 'center', alignItems: 'center', position: 'fixed', backgroundColor: '#c9c9c9', bottom: '2px', right: '6px', padding: '10px', paddingRight:2 }}>
                <Grid container spacing={1} alignItems={'center'}>

                    <Grid>
                        <Link href="/clear-cache" title="Refresh cache">
                            <IconButton>
                                <RefreshIcon />
                            </IconButton>
                        </Link>
                    </Grid>
                    <Grid>
                        VERSION {version}
                    </Grid>
                </Grid>
            </Box>
        </AuthenticatedLayout>
    );
}

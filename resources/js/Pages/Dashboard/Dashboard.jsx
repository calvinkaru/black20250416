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
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import numeral from "numeral";

import Summaries from "./Partials/Summaries";

export default function Dashboard({ data, logo, version, store_name }) {
    const auth = usePage().props.auth.user;
    const permissions = usePage().props.userPermissions;
    const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));

    const [cash_in, setCashIn] = useState(0);
    const [total_sales, setTotalSales] = useState(0);
    const [expenses, setExpenses] = useState(0);

    const refreshSummary = async () => {
        try {
            const response = await axios.post("/dashboard/summary", {
                start_date: startDate,
                end_date: endDate,
            });
            const { cash_in, total_sales, expenses } = response.data.summary;
            setCashIn(cash_in);
            setTotalSales(total_sales);
            setExpenses(expenses);
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

                <Grid size={12} spacing={{ xs: 0.5, sm: 1 }} flexDirection={'row'} container sx={{ mb: 2 }}>
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


            <Grid
                container
                size={{ xs: 12, sm: 8, md: 4 }}
                sx={{ mt: "3rem", paddingBottom: 4 }}
                spacing={2}
            >
                {(auth.user_role == "super-admin" || permissions.includes("sales") || permissions.includes("expenses")) && (
                    <Grid size={{ xs: 12, sm: 8, md: 4 }}>
                        <Card sx={{ width: "100%" }}>
                            <CardContent>
                                <Grid
                                    container
                                    display="flex"
                                    spacing={2}
                                    width={"100%"}
                                >
                                    <Grid size={6}>
                                        <TextField
                                            label="Start Date"
                                            name="start_date"
                                            placeholder="Start Date"
                                            type="date"
                                            fullWidth
                                            slotProps={{
                                                inputLabel: {
                                                    shrink: true,
                                                },
                                            }}
                                            value={startDate}
                                            onChange={(e) =>
                                                setStartDate(e.target.value)
                                            }
                                            required
                                        />
                                    </Grid>
                                    <Grid size={6}>
                                        <TextField
                                            label="End Date"
                                            name="end_date"
                                            placeholder="End Date"
                                            type="date"
                                            fullWidth
                                            slotProps={{
                                                inputLabel: {
                                                    shrink: true,
                                                },
                                            }}
                                            value={endDate}
                                            onChange={(e) =>
                                                setEndDate(e.target.value)
                                            }
                                            required
                                        />
                                    </Grid>
                                </Grid>

                                <List>
                                    <Link href="/reports/sales">
                                        <ListItem
                                            secondaryAction={numeral(
                                                total_sales
                                            ).format("0,0.00")}
                                        >
                                            <ListItemButton>
                                                <ListItemIcon>
                                                    <PaidIcon />
                                                </ListItemIcon>
                                                <ListItemText primary="Sales" />
                                            </ListItemButton>
                                        </ListItem>
                                    </Link>
                                    <Divider />
                                    <Link href="/reports/dailycash">
                                        <ListItem
                                            secondaryAction={numeral(
                                                cash_in
                                            ).format("0,0.00")}
                                        >
                                            <ListItemButton>
                                                <ListItemIcon>
                                                    <PaymentsIcon />
                                                </ListItemIcon>
                                                <ListItemText primary="Cash" />
                                            </ListItemButton>
                                        </ListItem>
                                    </Link>
                                    <Divider />
                                    <Link href="/expenses">
                                        <ListItem
                                            secondaryAction={numeral(
                                                expenses
                                            ).format("0,0.00")}
                                        >
                                            <ListItemButton>
                                                <ListItemIcon>
                                                    <AccountBalanceWalletIcon />
                                                </ListItemIcon>
                                                <ListItemText primary="Expenses" />
                                            </ListItemButton>
                                        </ListItem>
                                    </Link>
                                    <Divider />
                                    <Link href="/reports/summary-report">
                                        <ListItem>
                                            <ListItemText sx={{ textAlign: 'center', color: '#1976d2', textDecoration: 'underline' }} primary="VIEW SUMMARY" />
                                        </ListItem>
                                    </Link>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                    <Card sx={{ width: "100%", height: "100%" }}>
                        <CardContent>
                            <Grid
                                container
                                display="flex"
                                flexDirection={"column"}
                                spacing={2}
                                width={"100%"}
                            >
                                <Typography variant="h4" color="initial">
                                    Hello,
                                </Typography>
                                <Typography variant="h2" color="initial">
                                    {auth.name}
                                </Typography>
                                <Typography variant="h4" color="initial">
                                    {store_name}
                                </Typography>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                    <Card sx={{ width: "100%", height: "100%", padding: 2, display: 'flex', justifyContent: 'center' }}>
                        <img src={logo} style={{ maxHeight: '250px', objectFit: 'contain' }} alt="" />
                    </Card>
                </Grid>

                {(auth.user_role == "super-admin" || permissions.includes("sales")) && (
                    <Summaries></Summaries>
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
                        <IconButton onClick={() => {
                            const password = prompt("Enter password:");
                            if (password === "infomax2025") {
                                window.location.href = "/update";
                            } else {
                                alert("Wrong password!");
                            }
                        }}>
                            <CloudUploadIcon />
                        </IconButton>
                    </Grid>
                    <Grid>
                        VERSION {version}
                    </Grid>
                </Grid>
            </Box>
        </AuthenticatedLayout>
    );
}

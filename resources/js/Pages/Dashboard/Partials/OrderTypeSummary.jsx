import * as React from "react";
import { useState, useEffect } from "react";
import {
    Card,
    Grid2 as Grid,
    TextField,
    Typography,
} from "@mui/material";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import axios from "axios";
import numeral from "numeral";

export default function OrderTypeSummary() {
    const [orderTypeTotals, setOrderTypeTotals] = useState([]);
    const [loading, setLoading] = useState(true);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const refreshSummary = async () => {
        try {
            const response = await axios.post("/dashboard/order-type-summary", {
                start_date: startDate,
                end_date: endDate,
            });
            setOrderTypeTotals(response.data.order_type_totals);
        } catch (error) {
            console.error("Error fetching order type summary:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSummary(); // Call on component mount
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        refreshSummary(); // Call whenever startDate or endDate changes
    }, [startDate, endDate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Typography variant="h6" gutterBottom>
                Order Type Summary
            </Typography>
            
            <Grid container display="flex" spacing={2} width={"100%"}>
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
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={12}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Order Type</strong></TableCell>
                                    <TableCell align="right"><strong>Total Sales</strong></TableCell>
                                    <TableCell align="right"><strong>Total Amount</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orderTypeTotals.map((item) => (
                                    <TableRow key={item.order_type_id}>
                                        <TableCell component="th" scope="row">{item.order_type_name}</TableCell>
                                        <TableCell align="right">{numeral(item.total_sales).format('0,0')}</TableCell>
                                        <TableCell align="right">{numeral(item.total_amount).format('0,0.00')}</TableCell>
                                    </TableRow>
                                ))}
                                {orderTypeTotals.length > 0 && (
                                    <TableRow>
                                        <TableCell component="th" scope="row"><strong>Total</strong></TableCell>
                                        <TableCell align="right"><strong>{numeral(orderTypeTotals.reduce((sum, item) => sum + parseFloat(item.total_sales), 0)).format('0,0')}</strong></TableCell>
                                        <TableCell align="right"><strong>{numeral(orderTypeTotals.reduce((sum, item) => sum + parseFloat(item.total_amount), 0)).format('0,0.00')}</strong></TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </>
    );
}

import * as React from "react";
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import Grid from "@mui/material/Grid2";
import { Button, TextField, MenuItem, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import dayjs from "dayjs";
import numeral from "numeral";

export default function TaxSummaryReport({ stores, report }) {
    const [dataReport, setDataReport] = useState(report);

    const [searchTerms, setSearchTerms] = useState({
        start_date: dayjs().format("YYYY-MM-DD"),
        end_date: dayjs().format("YYYY-MM-DD"),
        store: 'All',
    });

    const handleFieldChange = ({ target: { name, value } }) => {
        setSearchTerms({
            ...searchTerms,
            [name]: value,
        });
    };

    const refreshReport = (url) => {
        const options = {
            preserveState: true, // Preserves the current component's state
            preserveScroll: true, // Preserves the current scroll position
            only: ["report"], // Only reload specified properties
            onSuccess: (response) => {
                setDataReport(response.props.report);
            },
        };
        router.get(
            url,
            searchTerms,
            options
        );
    };

    // Calculate total tax amount
    const totalTaxAmount = dataReport.reduce((total, tax) => total + parseFloat(tax.total_amount || 0), 0);

    return (
        <AuthenticatedLayout>
            <Head title="Tax Summary" />
            <Grid
                container
                spacing={2}
                alignItems="center"
                sx={{ width: "100%", mt: "1rem" }}
                justifyContent={"center"}
                size={12}
            >
                <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                        label="Store"
                        name="store"
                        fullWidth
                        select
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        value={searchTerms.store}
                        onChange={handleFieldChange}
                        required
                    >
                        <MenuItem value={'All'}>All</MenuItem>
                        {stores.map((store) => (
                            <MenuItem key={store.id} value={store.id}>
                                {store.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                    <TextField
                        label="Start Date"
                        name="start_date"
                        placeholder="Start Date"
                        fullWidth
                        type="date"
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        value={searchTerms.start_date}
                        onChange={handleFieldChange}
                        required
                    />
                </Grid>

                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                    <TextField
                        label="End Date"
                        name="end_date"
                        placeholder="End Date"
                        fullWidth
                        type="date"
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        value={searchTerms.end_date}
                        onChange={handleFieldChange}
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 2, md: 1 }}>
                    <Button
                        variant="contained"
                        onClick={() => refreshReport(window.location.pathname)}
                        sx={{ height: "100%" }}
                        size="large"
                        fullWidth
                    >
                        <FindReplaceIcon />
                    </Button>
                </Grid>
            </Grid>

            <Grid container width={'100%'} justifyContent={'center'} sx={{ mt: 2 }} spacing={2} alignItems={'stretch'}>
                <Grid size={{ xs: 12, sm: 8, md: 6 }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ border: 'none', padding: '0.4rem', paddingLeft: '1rem' }}>
                                        <Typography variant="h5" color="initial"><strong>Tax Summary</strong></Typography>
                                    </TableCell>
                                    <TableCell colSpan={3} align="right" sx={{ border: 'none', padding: '0.4rem' }}>
                                        <Typography variant="h6" color="initial">
                                            {searchTerms.start_date} to {searchTerms.end_date}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><strong>Tax Name</strong></TableCell>
                                    <TableCell align="right"><strong>Amount</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataReport.map((tax) => (
                                    <TableRow key={tax.id}>
                                        <TableCell>{tax.name}</TableCell>
                                        <TableCell align="right">{numeral(tax.total_amount).format('0,0.00')}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell><strong>Total</strong></TableCell>
                                    <TableCell align="right"><strong>{numeral(totalTaxAmount).format('0,0.00')}</strong></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </AuthenticatedLayout>
    );
}

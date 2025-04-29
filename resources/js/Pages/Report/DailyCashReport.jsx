import * as React from "react";
import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import Grid from "@mui/material/Grid2";
import { Button, TextField, Typography, MenuItem, Box } from "@mui/material";
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PrintIcon from "@mui/icons-material/Print";
import dayjs from "dayjs";
import axios from "axios";
import numeral from "numeral";

import DailyCashDialog from "./Partial/DailyCashDialog";
import ViewDetailsDialog from "@/Components/ViewDetailsDialog";

import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
    padding: 10,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
        border: 0,
    },

}));

export default function DailyReport({ logs, stores, users }) {
    const auth = usePage().props.auth.user
    const [dataLogs, setDataLogs] = useState(logs);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [formState, setFormState] = useState({
        user_id: auth.user_role === "admin" ? "All" : auth.id,
        transaction_date: dayjs().format("YYYY-MM-DD"),
        store_id: auth.user_role === "admin" ? "All" : auth.store_id,
    });

    const refreshLogs = (url = window.location.pathname, transaction_date = formState.transaction_date, user = formState.user_id, store_id = formState.store_id) => {
        const options = {
            preserveState: true, // Preserves the current component's state
            preserveScroll: true, // Preserves the current scroll position
            only: ["logs"], // Only reload specified properties
            onSuccess: (response) => {
                setDataLogs(response.props.logs);
            },
        };
        router.get(
            url,
            {
                transaction_date: transaction_date,
                user: user,
                store_id: store_id
            },
            options
        );
    };

    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => {
            const updatedFormState = {
                ...prevState,
                [name]: value,
            };
            refreshLogs(window.location.pathname, updatedFormState.transaction_date, updatedFormState.user_id, updatedFormState.store_id);
            return updatedFormState;
        });
    }

    const totalCashIn = dataLogs.reduce((sum, row) => sum + parseFloat(row.cash_in), 0);
    const totalCashOut = dataLogs.reduce((sum, row) => sum + parseFloat(row.cash_out), 0);
    
    const handleBillPrint = () => {
        // Create a styled print version for bill printer (receipt style)
        const printStyles = `
            <style>
                @page { 
                    size: 80mm auto; /* Standard thermal receipt width */
                    margin: 0mm;
                }
                body { 
                    font-family: 'Courier New', monospace; /* Use monospace font for receipt */
                    font-size: 12px;
                    width: 80mm;
                    margin: 0;
                    padding: 5mm;
                }
                .receipt-container {
                    width: 100%;
                    text-align: center;
                }
                .shop-name {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .receipt-header {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .receipt-details {
                    text-align: left;
                    margin-bottom: 10px;
                    font-size: 12px;
                }
                .divider {
                    border-top: 1px dashed #000;
                    margin: 5px 0;
                }
                table { 
                    width: 100%;
                    border-collapse: collapse;
                    margin: 10px 0;
                }
                th, td { 
                    padding: 3px 2px;
                    text-align: left;
                    font-size: 12px;
                    border: none;
                }
                th { 
                    font-weight: bold;
                }
                .text-right { 
                    text-align: right; 
                }
                .text-center { 
                    text-align: center; 
                }
                .receipt-footer {
                    text-align: center;
                    margin-top: 10px;
                    font-size: 12px;
                }
                .total-row {
                    font-weight: bold;
                }
                .summary-section {
                    margin-top: 5px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 3px 0;
                }
                .bold {
                    font-weight: bold;
                }
            </style>
        `;
        
        // Create receipt content
        let receiptContent = `
            <div class="receipt-container">
                <div class="receipt-header">
                    <div class="shop-name">DAILY CASH REPORT</div>
                    <div>Date: ${formState.transaction_date}</div>
                    <div>Time: ${new Date().toLocaleTimeString()}</div>
                </div>
                <div class="divider"></div>
                
                <table>
                    <thead>
                        <tr>
                            <th>DESCRIPTION</th>
                            <th class="text-right">IN</th>
                            <th class="text-right">OUT</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Add rows for each transaction
        dataLogs.forEach((row, index) => {
            const description = row.source.charAt(0).toUpperCase() + row.source.slice(1) +
                (row.description ? " | " + row.description : "");
                
            receiptContent += `
                <tr>
                    <td colspan="3">${index + 1}. ${description.substring(0, 30)}${description.length > 30 ? '...' : ''}</td>
                </tr>
                <tr>
                    <td>${row.transaction_date}</td>
                    <td class="text-right">${row.cash_in > 0 ? numeral(row.cash_in).format('0,0.00') : '-'}</td>
                    <td class="text-right">${row.cash_out > 0 ? numeral(row.cash_out).format('0,0.00') : '-'}</td>
                </tr>
            `;
        });
        
        // Add subtotal row
        receiptContent += `
                    </tbody>
                </table>
                
                <div class="divider"></div>
                
                <div class="summary-section">
                    <div class="summary-row">
                        <span class="bold">Total Cash In:</span>
                        <span>${numeral(totalCashIn).format('0,0.00')}</span>
                    </div>
                    <div class="summary-row">
                        <span class="bold">Total Cash Out:</span>
                        <span>${numeral(totalCashOut).format('0,0.00')}</span>
                    </div>
                </div>
        `;
        
        // Add balance
        const balance = dataLogs.reduce((total, row) => total + parseFloat(row.amount), 0);
        const isShortage = balance > 0;
        
        receiptContent += `
            <div class="divider"></div>
            <div class="summary-section">
                <div class="summary-row">
                    <span class="bold">Balance:</span>
                    <span>${numeral(Math.abs(balance)).format('0,0.00')} ${isShortage ? '(Shortage)' : '(Excess)'}</span>
                </div>
            </div>
        `;
        
        // Add footer
        receiptContent += `
                <div class="divider"></div>
                <div class="receipt-footer">
                    *** End of Report ***
                </div>
            </div>
        `;
        
        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Daily Cash Report - Receipt Format</title>
                    ${printStyles}
                </head>
                <body>
                    ${receiptContent}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
    
    const handlePrint = () => {
        const printContent = document.querySelector('table');
        const originalContents = document.body.innerHTML;
        
        // Create a styled print version
        const printStyles = `
            <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .text-right { text-align: right; }
                .header { text-align: center; margin-bottom: 20px; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; }
                .total-row { font-weight: bold; }
            </style>
        `;
        
        // Create header with date and time
        const header = `
            <div class="header">
                <h2>Daily Cash Report</h2>
                <p>Date: ${formState.transaction_date}</p>
                <p>Time: ${new Date().toLocaleTimeString()}</p>
            </div>
        `;
        
        // Create footer
        const footer = `
            <div class="footer">
                <p>*** End of Report ***</p>
            </div>
        `;
        
        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Daily Cash Report</title>
                    ${printStyles}
                </head>
                <body>
                    ${header}
                    ${printContent.outerHTML}
                    ${footer}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Daily Report" />
            <Grid
                container
                spacing={2}
                alignItems="center"
                // sx={{ width: "100%" }}
                justifyContent={"center"}
                size={12}
                sx={{ mb: 1 }}
            >
                <Grid size={{ xs: 8, sm: 4, md: 2 }}>
                    <TextField
                        label="Date"
                        name="transaction_date"
                        placeholder="Transaction Date"
                        fullWidth
                        type="date"
                        sx={{ height: "100%" }}
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        value={formState.transaction_date}
                        onChange={handleFieldChange}
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 2, sm: 3 }}>
                    <TextField
                        fullWidth
                        select
                        value={formState.store_id}
                        label="Store"
                        onChange={handleFieldChange}
                        required
                        name="store_id"
                    >
                        {auth.user_role === 'admin' || auth.user_role === 'super-admin' ? (
                            <MenuItem value="All">All</MenuItem>
                        ) : null}
                        {stores?.map((store) => (
                            <MenuItem
                                key={store.id}
                                value={store.id}
                            >
                                {store.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid size={{ xs: 8, sm: 3, md: 2 }}>
                    <TextField
                        value={formState.user_id}
                        fullWidth
                        name="user_id"
                        label="User/Cashier"
                        onChange={handleFieldChange}
                        select
                    >
                        {/* {auth.user_role === 'admin' || auth.user_role === 'super-admin' ? (
                            <MenuItem value="All">All</MenuItem>
                        ) : null} */}
                        <MenuItem value="All">All</MenuItem>
                        {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid size={{ xs: 4, sm: 2, md: 1 }}>
                    <Button
                        variant="contained"
                        onClick={() => refreshLogs(window.location.pathname)}
                        sx={{ height: "100%", }}
                        fullWidth
                        size="large"
                    >
                        <FindReplaceIcon />
                    </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 3, md: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => setModalOpen(true)}
                        sx={{ height: "100%", }}
                        startIcon={<AddCircleIcon />}
                        size="large"
                        fullWidth
                        color="success"
                    >
                        MANUAL
                    </Button>
                </Grid>

            </Grid>

            <Grid container justifyContent={'center'}>
                <Paper sx={{ width: { xs: '94vw', sm: '100%' }, overflow: 'hidden', maxWidth: '900px' }} >
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handlePrint}
                            startIcon={<PrintIcon />}
                        >
                            Print Transactions
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleBillPrint}
                            startIcon={<PrintIcon />}
                        >
                            Bill Printer
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>#</StyledTableCell>
                                    <StyledTableCell align="left" sx={{ width: "120px" }}>
                                        DATE
                                    </StyledTableCell>
                                    <StyledTableCell align="left">
                                        DESCRIPTION
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        CASH IN
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        CASH OUT
                                    </StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataLogs.map((row, index) => (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell component="th" scope="row">
                                            {index + 1}
                                        </StyledTableCell>
                                        <StyledTableCell align="left" sx={{ whiteSpace: 'nowrap' }}>
                                            {row.transaction_date}
                                        </StyledTableCell>
                                        <StyledTableCell align="left" sx={{ whiteSpace: 'nowrap' }}
                                            onClick={() => {
                                                if (row.sales_id !== null) {
                                                    setSelectedTransaction(row.sales_id);
                                                    setViewDetailsModalOpen(true);
                                                }
                                            }}
                                        >
                                            {
                                                row.source.charAt(0).toUpperCase() + row.source.slice(1) +
                                                (row.sales_id ? ' (#' + row.sales_id + ')' : "") +
                                                (row.name ? " - " + row.name : "") +
                                                (row.description ? " | " + row.description : "") +

                                                (row.transaction_type == 'account' ? " (Balance update)" : "")
                                            }
                                        </StyledTableCell>
                                        <StyledTableCell align="right">
                                            {row.cash_in == 0 ? '-' : numeral(row.cash_in).format('0,0.00')}
                                        </StyledTableCell>
                                        <StyledTableCell align="right">
                                            {row.cash_out == 0 ? '-' : numeral(row.cash_out).format('0,0.00')}
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}

                                {/* Add Total Row */}
                                <StyledTableRow>
                                    <StyledTableCell colSpan={3} align="right">
                                        <strong>Total:</strong>
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        <strong>{numeral(totalCashIn).format('0,0.00')}</strong>
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        <strong>{numeral(totalCashOut).format('0,0.00')}</strong>
                                    </StyledTableCell>
                                </StyledTableRow>

                                <StyledTableRow>
                                    <StyledTableCell colSpan={5} align="right">

                                    </StyledTableCell>
                                </StyledTableRow>

                                {/* Row for displaying the total sum */}
                                <StyledTableRow>
                                    <StyledTableCell colSpan={4} align="right">
                                        <Typography variant="h5" color="initial">
                                            <strong>Balance:</strong>
                                        </Typography>
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        {(() => {
                                            const balance = dataLogs.reduce((total, row) => total + parseFloat(row.amount), 0);
                                            const isShortage = balance > 0;
                                            return (
                                                <Typography 
                                                    variant="h5" 
                                                    color={isShortage ? 'error.main' : 'success.main'}
                                                >
                                                    <strong>
                                                        {numeral(Math.abs(balance)).format('0,0.00')}
                                                        {' '}
                                                        {isShortage ? '(Shortage)' : '(Excess)'}
                                                    </strong>
                                                </Typography>
                                            );
                                        })()}
                                    </StyledTableCell>
                                </StyledTableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>

            <DailyCashDialog
                open={modalOpen}
                setOpen={setModalOpen}
                stores={stores}
                auth={auth}
                refreshTransactions={refreshLogs}
            />

            {selectedTransaction && (
                <ViewDetailsDialog
                    open={viewDetailsModalOpen}
                    setOpen={setViewDetailsModalOpen}
                    type={"sale"}
                    selectedTransaction={selectedTransaction}
                />
            )}

        </AuthenticatedLayout>
    );
}

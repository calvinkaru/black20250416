import * as React from "react";
import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import Grid from "@mui/material/Grid2";
import { Button, Typography, Paper, Box } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import numeral from "numeral";
import axios from "axios";
import Swal from "sweetalert2";

import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import CashLogDialog from "./Partial/CashLogDialog";
import DenominationsDialog from "./Partial/DenominationsDialog";

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

export default function MyDrawerIndex({ logs, hasOpeningBalance, hasClosingBalance, hasTempClosing, isCurrentlyOpen, totalCashIn, totalCashOut, currentBalance, showTableBeforeClosing = false }) {
    const [showTable, setShowTable] = useState(showTableBeforeClosing);
    const auth = usePage().props.auth.user;
    const [dataLogs, setDataLogs] = useState(logs);
    const [cashLogModalOpen, setCashLogModalOpen] = useState(false);
    const [denominationsModalOpen, setDenominationsModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState('');
    const [showPrintButton, setShowPrintButton] = useState(hasClosingBalance);
    
    const refreshLogs = () => {
        const options = {
            preserveState: true,
            preserveScroll: true,
            only: ["logs", "hasOpeningBalance", "hasClosingBalance", "hasTempClosing", "isCurrentlyOpen", "totalCashIn", "totalCashOut", "currentBalance", "showTableBeforeClosing"],
            onSuccess: (response) => {
                setDataLogs(response.props.logs);
                setShowPrintButton(response.props.hasClosingBalance);
                setShowTable(response.props.showTableBeforeClosing);
            },
        };
        router.get(route('my-drawer.index'), {}, options);
    };

    const handleOpenCashLogModal = (type) => {
        setTransactionType(type);
        if (type === 'close_cashier') {
            setDenominationsModalOpen(true);
        } else {
            setCashLogModalOpen(true);
        }
    };
    
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
                    <div class="shop-name">MY DRAWER</div>
                    <div>Transaction Report</div>
                    <div>Date: ${new Date().toLocaleDateString()}</div>
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
        dataLogs.filter(log => !log.description || !log.description.includes('Closing Cashier Balance')).forEach((row, index) => {
            const description = row.description 
                ? (row.description.includes(' - ') 
                    ? row.description.split(' - ')[0] 
                    : row.description)
                : '';
            
            const time = row.description && row.description.includes(' - ') 
                ? row.description.split(' - ')[1] 
                : '';
                
            receiptContent += `
                <tr>
                    <td colspan="3">${index + 1}. ${description.substring(0, 30)}</td>
                </tr>
                <tr>
                    <td>${time}</td>
                    <td class="text-right">${row.amount > 0 ? numeral(row.amount).format('0,0.00') : '-'}</td>
                    <td class="text-right">${row.amount < 0 ? numeral(Math.abs(row.amount)).format('0,0.00') : '-'}</td>
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
        
        // Add closing balance if available
        if (hasClosingBalance && dataLogs.some(log => log.description && log.description.includes('Closing Cashier Balance'))) {
            const closingLog = dataLogs.find(log => 
                log.description && log.description.includes('Closing Cashier Balance')
            );
            
            // Calculate difference
            const countedAmount = closingLog ? Math.abs(closingLog.amount) : 0;
            const diff = currentBalance - countedAmount;
            
            receiptContent += `
                <div class="divider"></div>
                <div class="summary-section">
                    <div class="summary-row">
                        <span class="bold">Closing Balance:</span>
                        <span>${numeral(Math.abs(closingLog.amount)).format('0,0.00')}</span>
                    </div>
                    <div class="summary-row">
                        <span class="bold">Expected Balance:</span>
                        <span>${numeral(currentBalance).format('0,0.00')}</span>
                    </div>
                    <div class="summary-row">
                        <span class="bold">Difference:</span>
                        <span>${numeral(Math.abs(diff)).format('0,0.00')} ${diff > 0 ? '(Shortage)' : '(Excess)'}</span>
                    </div>
                </div>
            `;
        }
        
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
                    <title>My Drawer - Receipt Format</title>
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
        const printContent = document.getElementById('drawer-transactions-table');
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
                <h2>My Drawer - Transaction Report</h2>
                <p>Date: ${new Date().toLocaleDateString()}</p>
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
                    <title>My Drawer - Transaction Report</title>
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
            <Head title="My Drawer" />
            
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                <Grid xs={12} md={8}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h4" gutterBottom>
                            My Drawer - Today
                        </Typography>
                        
                        <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                            {!hasOpeningBalance && (
                                <Grid xs={12}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        fullWidth
                                        onClick={() => handleOpenCashLogModal('open_cashier')}
                                        sx={{ py: 2, fontSize: '1.2rem' }}
                                    >
                                        Open Cashier
                                    </Button>
                                </Grid>
                            )}
                            
                            {hasOpeningBalance && !hasClosingBalance && isCurrentlyOpen && (
                                <>
                                    <Grid xs={12} sm={4}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="large"
                                            fullWidth
                                            onClick={() => handleOpenCashLogModal('deposit')}
                                            sx={{ py: 2 }}
                                        >
                                            Deposit
                                        </Button>
                                    </Grid>
                                    <Grid xs={12} sm={4}>
                                        <Button
                                            variant="contained"
                                            color="warning"
                                            size="large"
                                            fullWidth
                                            onClick={() => handleOpenCashLogModal('withdrawal')}
                                            sx={{ py: 2 }}
                                        >
                                            Withdrawal
                                        </Button>
                                    </Grid>
                                    <Grid xs={12} sm={3}>
                                        <Button
                                            variant="contained"
                                            color="info"
                                            size="large"
                                            fullWidth
                                            onClick={() => handleOpenCashLogModal('temp_close_cashier')}
                                            sx={{ py: 2 }}
                                        >
                                            Temp Close
                                        </Button>
                                    </Grid>
                                    <Grid xs={12} sm={3}>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="large"
                                            fullWidth
                                            onClick={() => handleOpenCashLogModal('close_cashier')}
                                            sx={{ py: 2 }}
                                        >
                                            Close Cashier
                                        </Button>
                                    </Grid>
                                </>
                            )}
                            
                            {hasOpeningBalance && !hasClosingBalance && !isCurrentlyOpen && (
                                <Grid xs={12}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        fullWidth
                                        onClick={() => handleOpenCashLogModal('open_cashier')}
                                        sx={{ py: 2, fontSize: '1.2rem' }}
                                    >
                                        Reopen Cashier
                                    </Button>
                                </Grid>
                            )}
                            
                            {hasClosingBalance && (
                                <Grid xs={12}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        fullWidth
                                        onClick={() => handleOpenCashLogModal('open_cashier')}
                                        sx={{ py: 2, fontSize: '1.2rem' }}
                                        disabled
                                    >
                                        Cashier Closed for Today
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
            
            {(showTable || hasClosingBalance) && (
                <Grid container justifyContent={'center'}>
                    <Paper sx={{ width: { xs: '94vw', sm: '100%' }, overflow: 'hidden', maxWidth: '900px' }} >
                        {showPrintButton && (
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
                        )}
                        <TableContainer>
                        <Table id="drawer-transactions-table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>#</StyledTableCell>
                                    <StyledTableCell align="left">
                                        TIME
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
                                {dataLogs.filter(log => !log.description || !log.description.includes('Closing Cashier Balance')).map((row, index) => (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell component="th" scope="row">
                                            {index + 1}
                                        </StyledTableCell>
                                        <StyledTableCell align="left" sx={{ whiteSpace: 'nowrap' }}>
                                            {row.description && row.description.includes(' - ') 
                                                ? row.description.split(' - ')[1] 
                                                : ''}
                                        </StyledTableCell>
                                        <StyledTableCell align="left">
                                            {row.description 
                                                ? (row.description.includes(' - ') 
                                                    ? row.description.split(' - ')[0] 
                                                    : row.description)
                                                : ''}
                                        </StyledTableCell>
                                        <StyledTableCell align="right">
                                            {row.amount > 0 && !row.description.includes('Closing Cashier Balance') ? numeral(row.amount).format('0,0.00') : '-'}
                                        </StyledTableCell>
                                        <StyledTableCell align="right">
                                            {row.amount < 0 ? numeral(Math.abs(row.amount)).format('0,0.00') : '-'}
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

                                {/* Row for displaying the expected balance */}
                                {hasClosingBalance && (
                                    <>
                                        {/* Closing Cashier Balance Row */}
                                        {dataLogs.some(log => log.description && log.description.includes('Closing Cashier Balance')) && (
                                            (() => {
                                                // Find the closing log
                                                const closingLog = dataLogs.find(log => 
                                                    log.description && log.description.includes('Closing Cashier Balance')
                                                );
                                                
                                                // Get time and description
                                                const time = closingLog && closingLog.description && closingLog.description.includes(' - ') 
                                                    ? closingLog.description.split(' - ')[1] 
                                                    : '';
                                                const description = closingLog && closingLog.description 
                                                    ? (closingLog.description.includes(' - ') 
                                                        ? closingLog.description.split(' - ')[0] 
                                                        : closingLog.description)
                                                    : '';
                                                
                                                return (
                                                    <StyledTableRow>
                                                        <StyledTableCell component="th" scope="row">
                                                            <strong>*</strong>
                                                        </StyledTableCell>
                                                        <StyledTableCell align="left" sx={{ whiteSpace: 'nowrap' }}>
                                                            <strong>{time}</strong>
                                                        </StyledTableCell>
                                                        <StyledTableCell align="left">
                                                            <strong>{description}</strong>
                                                        </StyledTableCell>
                                                        <StyledTableCell align="right">
                                                            <strong>-</strong>
                                                        </StyledTableCell>
                                                        <StyledTableCell align="right">
                                                            <strong>{numeral(Math.abs(closingLog.amount)).format('0,0.00')}</strong>
                                                        </StyledTableCell>
                                                    </StyledTableRow>
                                                );
                                            })()
                                        )}
                                        
                                        {/* Expected Balance Row */}
                                        <StyledTableRow>
                                            <StyledTableCell colSpan={4} align="right">
                                                <Typography variant="h6" color="initial">
                                                    <strong>Expected Balance:</strong>
                                                </Typography>
                                            </StyledTableCell>
                                            <StyledTableCell align="right">
                                                <Typography variant="h6" color="initial">
                                                    <strong>
                                                        {numeral(currentBalance).format('0,0.00')}
                                                    </strong>
                                                </Typography>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                        
                                        {/* Difference Row - only shown if there's a difference */}
                                        {dataLogs.some(log => log.description && log.description.includes('Closing Cashier Balance')) && (
                                            (() => {
                                                // Find the closing log
                                                const closingLog = dataLogs.find(log => 
                                                    log.description && log.description.includes('Closing Cashier Balance')
                                                );
                                                
                                                // Extract the counted amount - now stored as a negative value
                                                const countedAmount = closingLog ? Math.abs(closingLog.amount) : 0;
                                                
                                                // Calculate difference
                                                console.log("Calculating difference:");
                                                console.log("Current Balance:", currentBalance);
                                                console.log("Counted Amount:", countedAmount);
                                                console.log("Difference:", currentBalance - countedAmount);
                                                
                                                // Calculate the difference
                                                const diff = currentBalance - countedAmount;
                                                
                                                // Always show the difference row
                                                return (
                                                    <StyledTableRow>
                                                        <StyledTableCell colSpan={4} align="right">
                                                            <Typography variant="h6" color="initial">
                                                                <strong>Difference:</strong>
                                                            </Typography>
                                                        </StyledTableCell>
                                                        <StyledTableCell align="right">
                                                            <Typography 
                                                                variant="h6" 
                                                                color={diff > 0 ? 'error.main' : 'success.main'}
                                                            >
                                                                <strong>
                                                                    {numeral(diff).format('0,0.00')}
                                                                    {' '}
                                                                    {diff > 0 ? '(Shortage)' : '(Excess)'}
                                                                </strong>
                                                            </Typography>
                                                        </StyledTableCell>
                                                    </StyledTableRow>
                                                );
                                            })()
                                        )}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>
            )}

            <CashLogDialog
                open={cashLogModalOpen}
                setOpen={setCashLogModalOpen}
                transactionType={transactionType}
                refreshLogs={refreshLogs}
            />

            <DenominationsDialog
                open={denominationsModalOpen}
                setOpen={setDenominationsModalOpen}
                refreshLogs={refreshLogs}
                currentBalance={currentBalance}
            />
        </AuthenticatedLayout>
    );
}

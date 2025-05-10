import * as React from "react";
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Button, Box, IconButton, TextField, MenuItem, Tooltip, Chip, Grid2 as Grid } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Select2 from "react-select";
import numeral from "numeral";
import dayjs from "dayjs";
import Swal from "sweetalert2";

import PrintIcon from "@mui/icons-material/Print";
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import AddPaymentDialog from "@/Components/AddPaymentDialog";
import ViewDetailsDialog from "@/Components/ViewDetailsDialog";
import CustomPagination from "@/Components/CustomPagination";

const columns = (handleRowClick) => [
    {
        field: "id",
        headerName: "ID",
        width: 80,
        renderCell: (params) => {
            return "#" + params.value.toString().padStart(4, "0");
        },
    },
    {
        field: "invoice_number",
        headerName: "No",
        width: 160,
        renderCell: (params) => (
            <Button
                variant="text"
                onClick={() => handleRowClick(params.row, "view_details")}
            >
                {"#" + params.value.toString().padStart(4, "0")}
            </Button>
        ),
    },
    {
        field: "name", headerName: "Customer Name", width: 200,
        renderCell: (params) => (
            <Tooltip title={'' + params.row.balance} arrow>
                <Button>{params.value}</Button>
            </Tooltip>
        ),
    },
    {
        field: "discount", headerName: "Discount", width: 80, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            return numeral(params.value).format('0,0.00');
        },
    },
    {
        field: "total_amount", headerName: "Bill Amount", width: 120, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            return numeral(params.value).format('0,0.00');
        },
    },
    {
        field: "amount_received",
        headerName: "Received",
        width: 130, align: 'right', headerAlign: 'right',
        renderCell: (params) => (
            <Button
                onClick={() => handleRowClick(params.row, "add_payment")}
                variant="text"
                fullWidth
                sx={{
                    textAlign: "right",
                    fontWeight: "bold",
                    justifyContent: "flex-end",
                }}
            >
                {numeral(params.value).format('0,0.00')}
            </Button>
        ),
    },
    {
        field: "cash_amount",
        headerName: "Cash",
        width: 100, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            return numeral(params.value || 0).format('0,0.00');
        },
    },
    {
        field: "cheque_amount",
        headerName: "Cheque",
        width: 100, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            return numeral(params.value || 0).format('0,0.00');
        },
    },
    {
        field: "credit_amount",
        headerName: "Credit",
        width: 100, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            return numeral(params.value || 0).format('0,0.00');
        },
    },
    {
        field: "card_amount",
        headerName: "Card",
        width: 100, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            return numeral(params.value || 0).format('0,0.00');
        },
    },
    {
        field: "change",
        headerName: "Change",
        width: 100, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            const change = params.row.amount_received - params.row.total_amount;
            return numeral(change).format('0,0.00');
        },
    },
    // { field: 'profit_amount', headerName: 'Profit Amount', width: 120 },
    { field: "status", headerName: "Status", width: 100 },
    {
        field: "sale_date",
        headerName: "Date",
        width: 100,
    },
    {
        field: "action",
        headerName: "Actions",
        width: 150,
        renderCell: (params) => (
            <>
                <Link href={"/receipt/" + params.row.id}>
                    <IconButton color="primary">
                        <PrintIcon />
                    </IconButton>
                </Link>
                {params.row.sale_type !== "return" ? (
                    <Link href={`/pos/${params.row.id}/return`}>
                        <IconButton color="primary">
                            <KeyboardReturnIcon />
                        </IconButton>
                    </Link>
                ) : (
                    <IconButton disabled color="primary">
                        <KeyboardReturnIcon />
                    </IconButton>
                )}
                {dayjs(params.row.created_at).isSame(dayjs(), 'day') && (
                    <IconButton color="error" onClick={() => handleRowClick(params.row, "delete")}>
                        <HighlightOffIcon />
                    </IconButton>
                )}
            </>
        ),
    },
];

export default function Sale({ sales, contacts }) {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [amountLimit, setAmountLimit] = useState(0);
    const [dataSales, setDataSales] = useState(sales);

    const [searchTerms, setSearchTerms] = useState({
        start_date: '',
        end_date: '',
        store: 0,
        contact_id: '',
        status: 'all',
        query: '',
        per_page: 100,
    });

    const handleRowClick = (sale, action) => {
        setSelectedTransaction(sale);
        switch (action) {
            case "add_payment":
                const amountLimit = Math.max(
                    0,
                    parseFloat(sale.total_amount) - parseFloat(sale.amount_received)
                );
                setSelectedContact(sale.contact_id);
                setAmountLimit(amountLimit);
                setPaymentModalOpen(true);
                break;
            case "view_details":
                setViewDetailsModalOpen(true);
                break;
            case "delete":
                deleteSale(sale.id);
                break;
            default:
        }
    };

    const deleteSale = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`/sales/${id}`)
                    .then(response => {
                        Swal.fire('Deleted!', 'The sale has been deleted.', 'success');
                        refreshSales(window.location.pathname)
                        // Optionally refresh the sales data or update the UI here
                    })
                    .catch(error => {
                        Swal.fire('Error!', error.response.data.error, 'error');
                    });
    
            }
        });
    };

    const refreshSales = (url) => {
        const options = {
            preserveState: true, // Preserves the current component's state
            preserveScroll: true, // Preserves the current scroll position
            only: ["sales"], // Only reload specified properties
            onSuccess: (response) => {
                setDataSales(response.props.sales);
            },
        };
        router.get(
            url, { ...searchTerms },
            options
        );
    };

    const handleSearchChange = (input) => {

        if (input?.target) {
            // Handle regular inputs (e.g., TextField)
            const { name, value } = input.target;
            setSearchTerms((prev) => ({ ...prev, [name]: value }));
        } else {
            // Handle Select2 inputs (e.g., contact selection)
            setSearchTerms((prev) => ({
                ...prev,
                contact_id: input?.id, // Store selected contact or null
            }));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Sales" />

            <Grid
                container
                spacing={2}
                alignItems="center"
                justifyContent={"end"}
                sx={{ width: "100%" }}
                size={12}
            >
                <Grid size={{ xs: 12, sm: 3 }}>
                    <Select2
                        className="w-full"
                        placeholder="Select a contact..."
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                height: "55px",
                            }),
                        }}
                        options={contacts} // Options to display in the dropdown
                        onChange={(selectedOption) => handleSearchChange(selectedOption)}
                        isClearable // Allow the user to clear the selected option
                        getOptionLabel={(option) => option.name + ' | ' + option.balance}
                        getOptionValue={(option) => option.id}
                    ></Select2>
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                    <TextField
                        value={searchTerms.status}
                        label="Status"
                        onChange={handleSearchChange}
                        name="status"
                        select
                        fullWidth
                    >
                        <MenuItem value={"all"}>All</MenuItem>
                        <MenuItem value={"completed"}>Completed</MenuItem>
                        <MenuItem value={"pending"}>Pending</MenuItem>
                    </TextField>
                </Grid>

                <Grid size={{ xs: 6, sm: 2 }}>
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
                        onChange={handleSearchChange}
                    />
                </Grid>

                <Grid size={{ xs: 6, sm: 2 }}>
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
                        onChange={handleSearchChange}
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                    <TextField
                        value={searchTerms.query}
                        label="Search"
                        onChange={handleSearchChange}
                        name="query"
                        fullWidth
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // Prevents form submission if inside a form
                                refreshSales(window.location.pathname); // Trigger search on Enter
                            }
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 1 }}>
                    <Button variant="contained" fullWidth onClick={() => refreshSales(window.location.pathname)} size="large">
                        <FindReplaceIcon />
                    </Button>
                </Grid>

            </Grid>

            <Box
                className="py-6 w-full"
                sx={{ display: "grid", gridTemplateColumns: "1fr", height: "calc(100vh - 195px)", }}
            >
                <DataGrid
                    rows={dataSales.data}
                    columns={columns(handleRowClick)}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                    hideFooter
                />
            </Box>
            <Grid size={12} spacing={2} container justifyContent={"end"}>
                <Chip size="large" label={'Total results : ' + dataSales.total} color="primary" />
                <TextField
                    label="Per page"
                    value={searchTerms.per_page}
                    onChange={handleSearchChange}
                    name="per_page"
                    select
                    size="small"
                    sx={{ minWidth: '100px' }}
                >
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={200}>200</MenuItem>
                    <MenuItem value={300}>300</MenuItem>
                    <MenuItem value={400}>400</MenuItem>
                    <MenuItem value={500}>500</MenuItem>
                    <MenuItem value={1000}>1000</MenuItem>
                </TextField>
                <CustomPagination
                    dataLinks={dataSales?.links}
                    next_page={dataSales.next_page_url}
                    prev_page={dataSales?.prev_page_url}
                    current_page={dataSales?.current_page}
                    refreshTable={refreshSales}
                    dataLastPage={dataSales?.last_page}
                ></CustomPagination>
            </Grid>

            <AddPaymentDialog
                open={paymentModalOpen}
                setOpen={setPaymentModalOpen}
                selectedTransaction={selectedTransaction}
                selectedContact={selectedContact}
                amountLimit={amountLimit}
                is_customer={true}
                refreshTable={refreshSales}
            />
            <ViewDetailsDialog
                open={viewDetailsModalOpen}
                setOpen={setViewDetailsModalOpen}
                type={"sale"}
                selectedTransaction={selectedTransaction?.id}
            />
        </AuthenticatedLayout>
    );
}

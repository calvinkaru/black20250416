import * as React from "react";
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import Grid from "@mui/material/Grid2";
import { Button, Box, TextField, Tooltip, MenuItem, Chip, IconButton } from "@mui/material";
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import Select2 from "react-select";
import numeral from "numeral";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import CustomPagination from "@/Components/CustomPagination";

const columns = (handleRowClick) => [
    {
        field: "id",
        headerName: "ID",
        width: 80,
        renderCell: (params) => {
            // Format the date to 'YYYY-MM-DD'
            return "#" + params.value.toString().padStart(4, "0");
        },
    },
    {
        field: "contact_name", headerName: "Customer Name", width: 200,
        renderCell: (params) => (
            <Tooltip title={'' + params.row.balance} arrow>
                <Button>{params.value}</Button>
            </Tooltip>
        ),
    },
    {field: 'barcode', headerName: 'Barcode', width: 200, selector: row => row.barcode, sortable: true,hideable: true},
    { field: "product_name", headerName: "Product Name", width: 200, },
    {
        field: "quantity", headerName: "Quantity", width: 100, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            return numeral(params.value).format('0,0.00');
        },
    },
    {
        field: "discount", headerName: "Unit Disc.", width: 100, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            return numeral(params.value).format('0,0.00');
        },
    },
    {
        field: "unit_cost", headerName: "Unit Cost", width: 100, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            return numeral(params.value).format('0,0.00');
        },
    },
    {
        field: "unit_price", headerName: "Unit Price", width: 100, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            return numeral(params.value).format('0,0.00');
        },
    },
    {
        field: "profit", headerName: "Profit", width: 100, align: 'right', headerAlign: 'right',
        renderCell: (params) => {
            return numeral(params.value).format('0,0.00');
        },
    },
    {
        field: 'total',
        headerName: "Total",
        width: 100,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
            const change = (params.row.unit_price - params.row.discount) * params.row.quantity;
            return numeral(change).format('0,0.00');
        },
    },
    // { field: 'profit_amount', headerName: 'Profit Amount', width: 120 },
    {
        field: "sale_date",
        headerName: "Date",
        width: 100,
    },
    {
        field: "action",
        headerName: "Action",
        width: 150,
        renderCell: (params) => {
            if (params.row.quantity < 0) return null;
            return (
                <Link href={`/pos/${params.row.sale_id}/return`}>
                    <IconButton color="primary">
                        <KeyboardReturnIcon />
                    </IconButton>
                </Link>
            );
        },
    },

];

export default function SoldItem({ sold_items, contacts }) {
    const [dataSoldItems, setDataSoldItems] = useState(sold_items);

    const [searchTerms, setSearchTerms] = useState({
        start_date: '',
        end_date: '',
        store: 0,
        contact_id: '',
        status: 'all',
        query: '',
        order_by:'default',
        per_page: 100,
    });

    const handleRowClick = (sold_item, action) => {

    };

    const refreshSoldItems = (url) => {
        const options = {
            preserveState: true, // Preserves the current component's state
            preserveScroll: true, // Preserves the current scroll position
            only: ["sold_items"], // Only reload specified properties
            onSuccess: (response) => {
                setDataSoldItems(response.props.sold_items);
            },
        };
        router.get(
            url, { ...searchTerms }, options
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
            <Head title="Sold Items" />
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
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.id}
                    ></Select2>
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
                        required
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                    <TextField
                        label="End Date"
                        name="end_date"
                        placeholder="End Date"
                        fullWidth
                        type="date"
                        slots={{ toolbar: GridToolbar }}
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

                <Grid size={{ xs: 6, sm: 2 }}>
                    <TextField
                        label="Search"
                        name="query"
                        placeholder="Search"
                        fullWidth
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        value={searchTerms.query}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                refreshSoldItems(window.location.pathname);
                            }
                        }}
                    />
                </Grid>
                {/* <Grid size={{ xs: 6, sm: 2 }}>
                    <TextField
                        label="Order By"
                        name="order_by"
                        fullWidth
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        value={searchTerms.order_by}
                        onChange={handleSearchChange}
                        required
                        select
                    >
                        <MenuItem value={'default'}>Default</MenuItem>
                        <MenuItem value={'top_sold'}>Top Sold</MenuItem>
                        <MenuItem value={'top_profit'}>Top Profit</MenuItem>
                        </TextField>
                </Grid> */}
                <Grid size={{ xs: 12, sm: 1 }}>
                    <Button fullWidth variant="contained" onClick={() => refreshSoldItems(window.location.pathname)} size="large">
                        <FindReplaceIcon />
                    </Button>
                </Grid>
            </Grid>

            <Box
                className="py-6 w-full"
                sx={{ display: "grid", gridTemplateColumns: "1fr", height: "calc(100vh - 200px)", }}
            >
                <DataGrid
                    rows={dataSoldItems.data}
                    columns={columns(handleRowClick)}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                    initialState={{
                        columns: {
                            columnVisibilityModel: {
                                barcode: false,
                                profit: false,
                            },
                        },
                    }}
                    hideFooter
                />
            </Box>
            <Grid size={12} spacing={2} container justifyContent={"end"}>
                <Chip size="large" label={'Total results : ' + dataSoldItems.total} color="primary" />
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
                    dataLinks={dataSoldItems?.links}
                    refreshTable={refreshSoldItems}
                    dataLastPage={dataSoldItems?.last_page}
                ></CustomPagination>
            </Grid>
        </AuthenticatedLayout>
    );
}

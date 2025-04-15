import * as React from "react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
    Button,
    Box,
    Grid2 as Grid,
    MenuItem,
    TextField,
    Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import { Link, router } from "@inertiajs/react";
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import BatchModal from "./Partials/BatchModal";
import QuantityModal from "./Partials/QuantityModal";
import CustomPagination from "@/Components/CustomPagination";
import { useState } from "react";
import numeral from "numeral";
import { useEffect } from "react";
import Select2 from "react-select";

import DataTable from 'react-data-table-component';

const columns = [
    {
        name: 'Image',
        selector: row => row.image_url,
        cell: row =>
            row.image_url ? (
                <img
                    src={row.image_url}
                    style={{
                        width: "75px",
                        height: "51px",
                        objectFit: "cover",
                        padding: "5px",
                        paddingBottom: "5px",
                        paddingLeft: "0",
                    }}
                    alt="Product Image"
                    loading="lazy"
                />
            ) : (
                <span
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        padding: "5px",
                        paddingBottom: "5px",
                        paddingLeft: "0",
                    }}
                    className="text-center"
                >
                    No Image
                </span>
            ),
    },
    {
        name: 'Product Name',
        selector: row => row.name,
        sortable: true,
        width: '200px',
        cell: row => (
            <a
                href={`/products/${row.id}/edit`}
                style={{ textDecoration: "underline", fontWeight: "bold" }}
            >
                {row.name}
            </a>
        ),
    },
    {
        name: 'Supplier',
        selector: row => row.contact_name,
        sortable: true,
    },
    {
        name: 'Barcode',
        selector: row => row.barcode,
        sortable: true,
    },
    {
        name: 'Batch',
        selector: row => row.batch_number,
        cell: row => (
            <button
                onClick={() => handleProductEdit(row, "batch")}
                style={{
                    textAlign: "left",
                    fontWeight: "bold",
                    width: "100%",
                    background: "none",
                    border: "none",
                }}
            >
                {row.batch_number}
            </button>
        ),
    },
    {
        name: 'Cost',
        selector: row => row.cost,
        sortable: true,
    },
    {
        name: 'Price',
        selector: row => row.price,
        sortable: true,
        cell: row => numeral(row.price).format("0,0.00"),
    },
    {
        name: 'Valuation',
        selector: row => row.valuation,
        sortable: true,
        cell: row => {
            const price = row.cost;
            const quantity = row.quantity;
            return numeral(price * quantity).format("0,0.00");
        },
    },
    {
        name: 'Qty',
        selector: row => row.quantity,
        sortable: true,
        cell: row => (
            <button
                onClick={() => handleProductEdit(row, "qty")}
                style={{
                    textAlign: "right",
                    fontWeight: "bold",
                    width: "100%",
                    background: "none",
                    border: "none",
                }}
            >
                {numeral(row.quantity).format("0,0.00")}
            </button>
        ),
    },
    {
        name: 'Action',
        selector: row => row.action,
        cell: row => (
            <a href={`/product/${row.batch_id}/barcode`}>
                <QrCode2Icon color="primary" />
            </a>
        ),
    },
    {
        name: 'Featured',
        selector: row => row.is_featured,
        cell: row =>
            row.is_featured === 1 ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <StarIcon color="primary" />
                </div>
            ) : (
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <StarBorderIcon color="primary" />
                </div>
            ),
    },
];


const productColumns = (handleProductEdit) => [
    {
        field: "image_url",
        headerName: "Image",
        width: 100,
        renderCell: (params) =>
            params.value ? ( // Check if params.value is not null
                <img
                    src={params.value} // Use the value from the image_url field
                    style={{
                        width: "75px",
                        height: "51px",
                        objectFit: "cover",
                        padding: "5px",
                        paddingBottom: "5px",
                        paddingLeft: "0",
                    }} // Adjust the size as needed
                    alt="Product Image" // Alt text for accessibility
                    loading="lazy" // Lazy load the image
                />
            ) : (
                <span
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        padding: "5px",
                        paddingBottom: "5px",
                        paddingLeft: "0",
                    }}
                    className="text-center"
                >
                    No Image
                </span> // Render fallback if no image URL
            ),
    },
    {
        field: "name",
        headerName: "Product Name",
        width: 200,
        renderCell: (params) => (
            <Link
                underline="hover"
                className="hover:underline"
                href={"/products/" + params.row.id + "/edit"}
            >
                <p className="font-bold">{params.value}</p>
            </Link>
        ),
    },
    {
        field: "contact_name",
        headerName: "Supplier",
        width: 100,
    },
    { field: "barcode", headerName: "Barcode", width: 170 },
    {
        field: "batch_number",
        headerName: "Batch",
        width: 120,
        renderCell: (params) => (
            <Button
                onClick={() => handleProductEdit(params.row, "batch")}
                variant="text"
                fullWidth
                sx={{
                    textAlign: "left",
                    fontWeight: "bold",
                    justifyContent: "flex-start",
                }}
            >
                {params.value}
            </Button>
        ),
    },
    {
        field: "cost",
        headerName: "Cost",
        width: 100,
        align: "right",
        headerAlign: "right",
    },
    {
        field: "price",
        headerName: "Price",
        width: 100,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
            return numeral(params.value).format("0,0.00");
        },
    },
    {
        field: "valuation",
        headerName: "Valuation",
        width: 100,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
            const price = params.row.cost;
            const quantity = params.row.quantity;
            return numeral(price * quantity).format("0,0.00");
        },
    },
    {
        field: "quantity",
        headerName: "Qty",
        width: 80,
        align: "right",
        headerAlign: "right",
        valueGetter: (value) => parseFloat(value),
        renderCell: (params) => (
            <Button
                variant="text"
                color="default"
                fullWidth
                sx={{
                    textAlign: "right",
                    fontWeight: "bold",
                    justifyContent: "flex-end",
                }}
                underline="hover"
                onClick={() => handleProductEdit(params.row, "qty")}
            >
                {numeral(params.value).format("0,0.00")}
            </Button>
        ),
    },

    {
        field: "action",
        headerName: "Action",
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
            return (
                <Link href={`/product/${params.row.batch_id}/barcode`}>
                    <QrCode2Icon color="primary" />
                </Link>
            );
        },
    },
    {
        field: "is_featured",
        headerName: "Featured",
        headerAlign: "center",
        renderCell: (params) => {
            if (params.value === 1) {
                return (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        style={{ height: "100%" }}
                    >
                        <StarIcon color="primary" />
                    </Box>
                );
            } else {
                return (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        style={{ height: "100%" }}
                    >
                        <StarBorderIcon color="primary" />
                    </Box>
                );
            }
        },
    },
];

export default function Product({ products, stores, contacts }) {
    const auth = usePage().props.auth.user;
    const [batchModalOpen, setBatchModalOpen] = useState(false);
    const [quantityModalOpen, setQuantityModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(false);
    const [dataProducts, setDataProducts] = useState(products);
    const [dataContacts, setContacts] = useState(contacts);
    const [totalValuation, setTotalValuation] = useState(0);

    const [filters, setFilters] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            store: 0,
            status: urlParams.get("status") || 1,
            search_query: "",
            alert_quantity: "",
            per_page: 100,
            contact_id: "",
        };
    });

    const handleProductEdit = (product, type) => {
        setSelectedProduct(product);
        type === "batch" && setBatchModalOpen(true);
        type === "qty" && setQuantityModalOpen(true);
    };

    const refreshProducts = (url = window.location.pathname) => {
        const options = {
            preserveState: true, // Preserves the current component's state
            preserveScroll: true, // Preserves the current scroll position
            only: ["products"], // Only reload specified properties
            onSuccess: (response) => {
                setDataProducts(response.props.products);
            },
        };
        router.get(url, { ...filters }, options);
    };

    // const handleFilterChange = (e) => {
    //     const { name, value } = e.target;
    //     setFilters((prev) => ({ ...prev, [name]: value }));
    // };

    const handleFilterChange = (input) => {
        if (input?.target) {
            // Handle regular inputs (e.g., TextField)
            const { name, value } = input.target;
            setFilters((prev) => ({ ...prev, [name]: value }));
        } else {
            // Handle Select2 inputs (e.g., contact selection)
            setFilters((prev) => ({
                ...prev,
                contact_id: input?.id, // Store selected contact or null
            }));
        }
    };

    useEffect(() => {
        const total = Object.values(dataProducts.data).reduce(
            (total, product) => {
                return total + product.cost * product.quantity;
            },
            0
        );
        setTotalValuation(total);
    }, [dataProducts]);

    return (
        <AuthenticatedLayout>
            <Head title="Products" />
            <Grid
                container
                spacing={2}
                alignItems="center"
            >
                <Grid
                    size={12}
                    spacing={2}
                    container
                    alignItems={"center"}
                    justifyContent={{ xs: "center", sm: "end" }}
                >
                    <Grid size={{ xs: 12, sm: 3, md:2 }}>
                        <TextField
                            value={filters.store}
                            label="Store"
                            onChange={handleFilterChange}
                            required
                            name="store"
                            select
                            fullWidth
                            margin="dense"
                        >
                            <MenuItem value={0}>All</MenuItem>
                            {stores.map((store) => (
                                <MenuItem key={store.id} value={store.id}>
                                    {store.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                        <Select2
                            fullWidth
                            placeholder="Select a supplier..."
                            styles={{
                                control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    height: "55px",
                                }),
                                menuPortal: base => ({ ...base, zIndex: 9999 })
                            }}
                            options={contacts} // Options to display in the dropdown
                            onChange={(selectedOption) =>
                                handleFilterChange(selectedOption)
                            }
                            isClearable // Allow the user to clear the selected option
                            getOptionLabel={(option) =>
                                option.name + " | " + option.balance
                            }
                            getOptionValue={(option) => option.id}
                            menuPortalTarget={document.body}
                        ></Select2>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 2 }}>
                        <TextField
                            value={filters.status}
                            label="Status"
                            onChange={handleFilterChange}
                            required
                            name="status"
                            fullWidth
                            select
                            margin="dense"
                        >
                            <MenuItem value={1}>Active</MenuItem>
                            <MenuItem value={0}>Inactive</MenuItem>
                            <MenuItem value={"alert"}>Alert</MenuItem>
                            <MenuItem value={"out_of_stock"}>
                                Out of Stock
                            </MenuItem>
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 2, md:1 }}>
                        <TextField
                            value={filters.alert_quantity}
                            label="Alert Qty"
                            onChange={handleFilterChange}
                            placeholder="Alert Qty"
                            name="alert_quantity"
                            type="number"
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3, md:3 }}>
                        <TextField
                            fullWidth
                            name="search_query"
                            label="Search"
                            variant="outlined"
                            value={filters.search_query}
                            onChange={handleFilterChange}
                            placeholder="Barcode or Name"
                            onFocus={(event) => {
                                event.target.select();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault(); // Prevents form submission if inside a form
                                    refreshProducts(window.location.pathname); // Trigger search on Enter
                                }
                            }}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 6, sm: 2, md: 1 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() =>
                                refreshProducts(window.location.pathname)
                            }
                        >
                            <FindReplaceIcon />
                        </Button>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                        <Link href="/products/create">
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<AddIcon />}
                                fullWidth
                                sx={{ minWidth: { xs: '100px', sm: '100px' } }}
                            >
                                Add Product
                            </Button>
                        </Link>
                    </Grid>
                </Grid>

                <Box
                    className="py-2 w-full"
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        height: "calc(100vh - 290px)",
                    }}
                >
                    <DataGrid
                        rows={dataProducts.data}
                        columns={productColumns(handleProductEdit)}
                        slots={{ toolbar: GridToolbar }}
                        getRowId={(row) =>
                            row.id + row.batch_number + row.store_id
                        }
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                            },
                        }}
                        initialState={{
                            columns: {
                                columnVisibilityModel: {
                                    cost: false,
                                    created_at: false,
                                },
                            },
                        }}
                        hideFooter={true}
                    />
                    {/* <DataTable
                        columns={columns}
                        data={dataProducts.data}
                        pagination
                        highlightOnHover
                        paginationPerPage={100} 
                        paginationRowsPerPageOptions={[100, 200, 300, 400, 500, 1000]}
                        keyField="stock_id"
                        fixedHeaderScrollHeight='300px'
                        responsive={true}
                    /> */}

                </Box>
                <Grid
                    size={12}
                    spacing={2}
                    container
                    justifyContent={"end"}
                    alignItems={"center"}
                >
                    <Chip
                        size="large"
                        label={"Total results : " + dataProducts.total}
                        color="primary"
                    />
                    <Chip
                        size="large"
                        label={
                            "Total valuation : " +
                            numeral(totalValuation).format("0,00.00")
                        }
                        color="primary"
                    />
                    <TextField
                        label="Per page"
                        value={filters.per_page}
                        onChange={handleFilterChange}
                        name="per_page"
                        select
                        size="small"
                        sx={{ minWidth: "100px" }}
                    >
                        <MenuItem value={100}>100</MenuItem>
                        <MenuItem value={200}>200</MenuItem>
                        <MenuItem value={300}>300</MenuItem>
                        <MenuItem value={400}>400</MenuItem>
                        <MenuItem value={500}>500</MenuItem>
                        <MenuItem value={1000}>1000</MenuItem>
                    </TextField>
                    <CustomPagination
                        dataLinks={dataProducts?.links}
                        refreshTable={refreshProducts}
                        dataLastPage={dataProducts?.last_page}
                    ></CustomPagination>
                </Grid>
            </Grid>
            <BatchModal
                batchModalOpen={batchModalOpen}
                setBatchModalOpen={setBatchModalOpen}
                selectedBatch={selectedProduct}
                products={dataProducts.data}
                setProducts={setDataProducts}
                refreshProducts={refreshProducts}
                selectedProduct={selectedProduct}
                contacts={dataContacts}
            />
            <QuantityModal
                modalOpen={quantityModalOpen}
                setModalOpen={setQuantityModalOpen}
                selectedStock={selectedProduct}
                products={dataProducts.data}
                setProducts={setDataProducts}
                refreshProducts={refreshProducts}
                stores={stores}
            />
        </AuthenticatedLayout>
    );
}

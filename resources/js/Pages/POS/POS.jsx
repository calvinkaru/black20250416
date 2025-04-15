import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    Toolbar,
    Typography,
    Grid2 as Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";

import ProductItem from "./Partial/ProductItem";
import CartItems from "./Partial/CartItem";
import CustomerSelect from "./Partial/CartItemsTop";
import CartSummary from "./Partial/CartSummary";
import CartFooter from "./Partial/CartFooter";
import SearchBox from "./Partial/SearchBox";
import CartIcon from "./Partial/CartIcon";

import { SalesProvider } from "@/Context/SalesContext";
import CartItemsTop from "./Partial/CartItemsTop";
import POSBottomBar from "./Partial/POSBottomBar";

const drawerWidth = 530;

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
}));

const DrawerFooter = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    zIndex: "999",
}));


function POS({ products, customers, return_sale, categories }) {
    const cartType = return_sale ? 'sales_return_cart' : 'sales_cart';
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [dataProducts, setProducts] = useState(products);

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    useEffect(() => {
        if(cartType === "sales_return_cart") {
            localStorage.setItem('sales_return_cart', []);
        }
    },[cartType])


    // useEffect(() => {
    //     document.addEventListener("keydown", detectKyDown, true);
    // },[])

    // const detectKyDown = (e) => {
    //     console.log(e.key);
    // }

    const drawer = (
        <>
            <form action="/pos" method="post">
                <Toolbar sx={{ display: { xs: "none", sm: "flex" } }}>
                    <CustomerSelect customers={customers} />
                </Toolbar>
                <Divider />
                <Box
                    className="flex flex-col overflow-auto"
                    sx={{ height: { sm: "calc(100vh - 275px);", xs: "calc(100vh - 350px);" } }}
                >
                    {/* Cart Items - List of all items */}
                    <CartItems />
                    {/* Cart Summary - Total and discount area */}
                    <CartSummary />
                </Box>
                <DrawerFooter>
                    {/* Cart footer - Buttons */}
                    <CartFooter />
                </DrawerFooter>
            </form>
        </>
    );

    return (
        <SalesProvider cartType={cartType}>
            
            <Head title="Point of Sale" />
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    sx={{
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                        mr: { sm: `${drawerWidth}px` },
                    }}
                >
                    <Toolbar sx={{ paddingY: "10px" }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 0, display: { sm: "none" } }}
                        >
                            <CartIcon></CartIcon>
                        </IconButton>
                        <Box sx={{ display: { xs: "none", sm: "flex" } }}>
                            <Typography variant="h4" noWrap component="div">
                                POS
                            </Typography>
                        </Box>
                        {/* Product Search Box  */}

                        <SearchBox></SearchBox>

                        <Link href="/dashboard">
                            <IconButton
                                color="inherit"
                                sx={{
                                    ml: 0,
                                    p: "10px",
                                    color: "default", // Unchecked color
                                    "& .MuiSvgIcon-root": {
                                        fontSize: 30, // Customize icon size
                                    },
                                }}
                                type="button"
                            >
                                <HomeIcon />
                            </IconButton>
                        </Link>

                    </Toolbar>
                </AppBar>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                    }}
                >
                    <Toolbar />

                    {/* Product items area  */}
                    <Grid container spacing={2} sx={{ mb: 8 }}>
                        {dataProducts.map((product) => (
                            <Grid
                                key={product.id + product.batch_number}
                                size={{ xs: 6, sm: 6, md: 2 }}
                                sx={{ cursor: "pointer", }}
                            >
                                <ProductItem product={product}></ProductItem>
                            </Grid>
                        ))}

                        {/* Featured and categories */}
                        {!return_sale && (
                            <POSBottomBar drawerWidth={drawerWidth} categories={categories} setProducts={setProducts} />
                        )}
                    </Grid>
                </Box>
                <Box
                    component="nav"
                    sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                >
                    {/* Mobile Drawer */}
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onTransitionEnd={handleDrawerTransitionEnd}
                        onClose={handleDrawerClose}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                        sx={{
                            display: { xs: "block", sm: "none" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: "100%",
                            },
                        }}
                        anchor="right"
                    >
                        <DrawerHeader>
                            <CartItemsTop customers={customers} />
                            <IconButton onClick={handleDrawerClose}>
                                <ChevronLeftIcon />
                            </IconButton>
                        </DrawerHeader>
                        {drawer}
                    </Drawer>

                    {/* Desktop drawer */}
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: "none", sm: "block" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: drawerWidth,
                            },
                        }}
                        open
                        anchor="right"
                    >
                        {drawer}
                    </Drawer>
                </Box>
            </Box>
            
        </SalesProvider>
    );
}

export default POS;

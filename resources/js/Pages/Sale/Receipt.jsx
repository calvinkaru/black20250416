import React, { useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import {
    Button,
    Box,
    Typography,
    Paper,
    Card,
    CardMedia,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { styled } from "@mui/material/styles";
import numeral from "numeral";
import dayjs from "dayjs";
import { useReactToPrint } from "react-to-print";

export default function Receipt({ sale, salesItems, settings, user_name, credit_sale = false }) {
    const user = usePage().props.auth.user;
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

    const handleWhatsAppShare = () => {
        const currentUrl = window.location.href; // Get the current URL
        const message = `Your purchase at ${settings.shop_name} receipt: \n${currentUrl}`; // Customize your message
        const encodedMessage = encodeURIComponent(message); // URL encode the message
        let whatsappNumber = sale.whatsapp; // Get the contact number from sale

        // Check if the WhatsApp number is empty
        if (!whatsappNumber) {
            // Prompt the user for their WhatsApp number
            whatsappNumber = prompt("Please enter the WhatsApp number (including country code):",'94');

            // If the user cancels the prompt, exit the function
            if (!whatsappNumber) {
                alert("WhatsApp number is required to share the message.");
                return;
            }
        }

        // Construct the WhatsApp URL
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank'); // Open in a new tab
    };

    const ReceiptContainer = styled(Paper)(({ theme }) => ({
        width: "500px",
        padding: theme.spacing(3),
        textAlign: "center",
        "@media print": {
            boxShadow: "none", // Remove shadow for print
            // padding:0
        },
    }));

    const ReceiptPrintContainer = styled(Paper)(({ theme }) => ({
        width: "100%",
        fontFamily: settings.sale_print_font,
        textAlign: "center",
        boxShadow: "none",
        "@media print": {
            boxShadow: "none", // Remove shadow for print
        },
    }));

    const styles = {
        receiptTopText: {
            fontSize: settings.receipt_header_font_size || "12px",
            fontWeight: "bold",
            fontFamily: settings.sale_print_font,
        },
        receiptSummaryText: {
            fontSize: settings.summary_font_size || "11px",
            padding: settings.td_padding ? parseFloat(settings.td_padding) : 0,
            fontWeight: settings.summary_font_weight || "bold",
            borderBottom: "none",
            fontFamily: settings.sale_print_font,
        },
        receiptSummaryTyp: {
            fontSize: settings.summary_font_size || "12px",
            fontWeight: settings.summary_font_weight || "bold",
            fontFamily: settings.sale_print_font,
        },
        itemsHeader: {
            fontSize: settings.item_name_font_size || "12px",
            padding: settings.td_padding ? parseFloat(settings.td_padding) : 0,
            fontWeight: settings.header_font_weight || "bold",
            fontFamily: settings.sale_print_font,
            py: settings.item_spacing ? parseFloat(settings.item_spacing) : 1,
            pt: 0,
        },
        itemsHeaderTyp: {
            fontSize: settings.item_name_font_size || "13px",
            fontWeight: settings.header_font_weight || "bold",
            fontFamily: settings.sale_print_font,
        },

        itemsCells: {
            fontSize: settings.item_details_font_size || "12px",
            padding: settings.td_padding ? parseFloat(settings.td_padding) : 0,
            fontWeight: settings.item_font_weight || "500",
            py: settings.item_spacing ? parseFloat(settings.item_spacing) : 1,
            verticalAlign: "middle",
            fontFamily: settings.sale_print_font,
        },
        itemsCellsTyp: {
            fontSize: settings.item_details_font_size || "12px",
            fontWeight: settings.item_font_weight || "500",
            fontFamily: settings.sale_print_font,
        },

        printArea: {
            paddingRight: parseFloat(settings.sale_print_padding_right),
            paddingLeft: parseFloat(settings.sale_print_padding_left),
            paddingTop: settings.sale_print_padding_top ? parseFloat(settings.sale_print_padding_top) : 0,
            paddingBottom: settings.sale_print_padding_bottom ? parseFloat(settings.sale_print_padding_bottom) : 0,
        },
        
        shopName: {
            fontSize: settings.shop_name_font_size || "20px",
            fontFamily: settings.sale_print_font,
            fontWeight: "bold",
        },
        
        footerText: {
            fontSize: settings.footer_font_size || "11px",
            fontFamily: settings.sale_print_font,
        },
        
        sectionDivider: {
            borderBottom: "1px dashed",
            borderColor: "grey.700",
            my: settings.section_spacing ? parseFloat(settings.section_spacing) : "0.2rem",
        },
        
        summaryRowSpacing: {
            paddingBottom: settings.summary_row_spacing ? parseFloat(settings.summary_row_spacing) : 2,
        },
        
        spacerRow: {
            padding: settings.spacer_row_padding || "7px 0",
            borderBottom: "none",
            paddingBottom: settings.spacer_row_padding ? settings.spacer_row_padding.split(' ')[0] : "7px",
        },
        
        balanceDuePadding: {
            paddingBottom: settings.balance_due_padding ? parseFloat(settings.balance_due_padding) + "px" : "2px",
        }
    };

    if (!sale || Object.keys(sale).length === 0) {
        return (
            <Box className="flex justify-center mt-10 p-0">
                <Typography variant="h6" color="error">
                    No pending sales available.
                </Typography>
            </Box>
        );
    }

    const itemDiscount = salesItems.reduce((acc, item) => acc + item.discount * item.quantity, 0);

    return (
        <>
            <Head title="Sale Receipt" />
            <Box className="flex justify-center mt-10 p-0">
                <ReceiptContainer square={false} className="receipt-container">
                    <Box className="flex justify-between mb-3 print:hidden">

                        {user && (
                            <Button
                                onClick={() => window.history.back()}
                                variant="outlined"
                                startIcon={<ArrowBackIosIcon />}
                            >
                                Back
                            </Button>
                        )}
                        {user && (
                            <Button
                                onClick={handleWhatsAppShare}
                                variant="contained"
                                color="success"
                                endIcon={<WhatsAppIcon />}
                            >
                                Whatsapp
                            </Button>
                        )}

                        {user && (
                            <Button
                                onClick={reactToPrintFn}
                                variant="contained"
                                endIcon={<PrintIcon />}
                            >
                                Print
                            </Button>
                        )}
                    </Box>
                    <div
                        id="print-area"
                        ref={contentRef}
                        className="p-0"
                        style={styles.printArea}
                    >
                        <ReceiptPrintContainer square={false}>
                            <Box className="flex justify-center items-center mt-0 flex-col">
                                <Card sx={{ width: 160, boxShadow: 0 }}>
                                    <CardMedia
                                        component="img"
                                        image={
                                            window.location.origin +
                                            "/" +
                                            settings.shop_logo
                                        }
                                    />
                                </Card>
                                {settings.show_receipt_shop_name == 1 && (
                                    <Typography
                                        variant="h5"
                                        sx={styles.shopName}
                                        color="initial"
                                        className="receipt-shop-name"
                                    >
                                        {settings.shop_name}
                                    </Typography>
                                )}

                                <Typography
                                    variant="h6"
                                    sx={styles.receiptTopText}
                                    color="initial"
                                    className="receipt-address"
                                >
                                    {sale.address}
                                    <br />
                                    {sale.contact_number}
                                </Typography>
                            </Box>
                            <Divider
                                sx={styles.sectionDivider}
                                className="receipt-divider-after-address"
                            />
                            <Box className="flex items-start flex-col justify-start receipt-meta">


                                {!credit_sale && (
                                    <>
                                        <Typography
                                            sx={styles.receiptTopText}
                                            color="initial"
                                        >
                                            Order:
                                            {sale.sale_prefix +
                                                "/" +
                                                sale.invoice_number}
                                        </Typography>
                                        <Typography
                                            sx={styles.receiptTopText}
                                            color="initial"
                                            textAlign={"start"}
                                        >
                                            Date:
                                            {dayjs(sale.created_at).format(
                                                "DD-MMM-YYYY, h:mm A"
                                            ) + " "}
                                            By: {user_name}
                                        </Typography>
                                    </>
                                )}
                                {credit_sale && (
                                    <>
                                        <Typography
                                            sx={styles.receiptTopText}
                                            color="initial"
                                            textAlign={"start"}
                                        >
                                            Print date:
                                            {dayjs(sale.created_at).format(
                                                "DD-MMM-YYYY, h:mm A"
                                            ) + " "}
                                        </Typography>
                                    </>
                                )}



                                <Typography
                                    sx={styles.receiptTopText}
                                    color="initial"
                                >
                                    Customer: {sale.name}
                                </Typography>
                            </Box>
                            <Divider
                                sx={styles.sectionDivider}
                                className="receipt-divider-after-details"
                            />

                            <TableContainer>
                                <Table
                                    sx={{ width: "100%", padding: "0" }}
                                >
                                    <TableHead>
                                        <TableRow className="receipt-items-header">
                                            <TableCell sx={styles.itemsHeader}>
                                                <Typography
                                                    sx={styles.itemsHeaderTyp}
                                                    color="initial"
                                                >
                                                    Item
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={styles.itemsHeader}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={styles.itemsHeaderTyp}
                                                    color="initial"
                                                >
                                                    Qty.
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={styles.itemsHeader}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={styles.itemsHeaderTyp}
                                                    color="initial"
                                                >
                                                    Price
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={styles.itemsHeader}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={styles.itemsHeaderTyp}
                                                    color="initial"
                                                >
                                                    Disc.
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={styles.itemsHeader}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={styles.itemsHeaderTyp}
                                                    color="initial"
                                                >
                                                    Total
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {salesItems.map((item, index) => (
                                            <React.Fragment key={`item-${index}`}>
                                                {/* First Row: Product Name */}
                                                <TableRow
                                                    key={`name-row-${index}`}
                                                    className="receipt-product-row"
                                                >
                                                    <TableCell
                                                        colSpan={5}
                                                        sx={{
                                                            ...styles.itemsCells,
                                                            borderBottom:
                                                                "none",
                                                            paddingBottom: 0,
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={
                                                                styles.itemsCellsTyp
                                                            }
                                                            color="initial"
                                                        >
                                                            <strong>
                                                                {" "}
                                                                {index + 1}.
                                                                {item.name}{" "}
                                                                {item.account_number
                                                                    ? "| " +
                                                                    item.account_number
                                                                    : ""}
                                                            </strong>
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>

                                                <TableRow
                                                    key={`details-row-${index}`}
                                                    className="receipt-details-row"
                                                >
                                                    <TableCell
                                                        sx={styles.itemsCells}
                                                        align="right"
                                                        colSpan={2}
                                                    >
                                                        <Typography
                                                            sx={
                                                                styles.itemsCellsTyp
                                                            }
                                                            color="initial"
                                                        >
                                                            <strong>{item.quantity}x</strong>
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={styles.itemsCells}
                                                        align="right"
                                                    >
                                                        <Typography
                                                            sx={
                                                                styles.itemsCellsTyp
                                                            }
                                                            color="initial"
                                                        >
                                                            {numeral(
                                                                item.unit_price
                                                            ).format("0,0.00")}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={styles.itemsCells}
                                                        align="right"
                                                    >
                                                        <Typography
                                                            sx={
                                                                styles.itemsCellsTyp
                                                            }
                                                            color="initial"
                                                        >
                                                            {numeral(
                                                                item.discount
                                                            ).format("0,0.00")}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={styles.itemsCells}
                                                        align="right"
                                                    >
                                                        <Typography
                                                            sx={
                                                                styles.itemsCellsTyp
                                                            }
                                                            color="initial"
                                                        >
                                                            <strong>
                                                                {numeral(
                                                                    parseFloat(
                                                                        item.quantity
                                                                    ) *
                                                                    (item.unit_price -
                                                                        item.discount)
                                                                ).format(
                                                                    "0,0.00"
                                                                )}
                                                            </strong>
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        ))}

                                        {/* Spacer Row */}
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                sx={styles.spacerRow}
                                            />
                                        </TableRow>

                                        {itemDiscount !== 0 && (
                                            <TableRow
                                                sx={{ border: "none",}}
                                                className="receipt-summary-row"
                                            >
                                                <TableCell
                                                    sx={{...styles.receiptSummaryText, paddingBottom:1}}
                                                    colSpan={5}
                                                    align="center"
                                                >
                                                    <Typography
                                                        sx={{...styles.receiptSummaryText, border:'solid 2px', width:'100%', padding:1}}
                                                        color="initial"
                                                    >
                                                        Item Discount: {numeral(itemDiscount).format("0,0.00")}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {/* Simplified receipt format */}
                                        <TableRow
                                            sx={{ border: "none" }}
                                            className="receipt-summary-row"
                                        >
                                            <TableCell
                                                sx={styles.receiptSummaryText}
                                                colSpan={4}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={
                                                        styles.receiptSummaryTyp
                                                    }
                                                    color="initial"
                                                >
                                                    Subtotal:
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={styles.receiptSummaryText}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={
                                                        styles.receiptSummaryTyp
                                                    }
                                                    color="initial"
                                                >
                                                    Rs.
                                                    {numeral(
                                                        sale.total_amount - (sale.dine_in_charge || 0)
                                                    ).format("0,0.00")}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        
                                        {sale.dine_in_charge > 0 && (
                                            <TableRow
                                                sx={{ border: "none" }}
                                                className="receipt-summary-row"
                                            >
                                                <TableCell
                                                    sx={styles.receiptSummaryText}
                                                    colSpan={4}
                                                    align="right"
                                                >
                                                    <Typography
                                                        sx={
                                                            styles.receiptSummaryTyp
                                                        }
                                                        color="initial"
                                                    >
                                                        Service Charge:
                                                    </Typography>
                                                </TableCell>
                                                <TableCell
                                                    sx={styles.receiptSummaryText}
                                                    align="right"
                                                >
                                                    <Typography
                                                        sx={
                                                            styles.receiptSummaryTyp
                                                        }
                                                        color="initial"
                                                    >
                                                        Rs.
                                                        {numeral(
                                                            sale.dine_in_charge
                                                        ).format("0,0.00")}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        
                                        {/* Divider line */}
                                        <TableRow
                                            sx={{ border: "none" }}
                                            className="receipt-summary-row"
                                        >
                                            <TableCell
                                                colSpan={5}
                                                sx={{
                                                    padding: "0",
                                                    borderBottom: "none",
                                                }}
                                            >
                                                <Divider
                                                    sx={styles.sectionDivider}
                                                />
                                            </TableCell>
                                        </TableRow>
                                        
                                        {/* Total Amount (Bold) */}
                                        <TableRow
                                            sx={{ border: "none" }}
                                            className="receipt-summary-row"
                                        >
                                            <TableCell
                                                sx={styles.receiptSummaryText}
                                                colSpan={4}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={{
                                                        ...styles.receiptSummaryTyp,
                                                        fontWeight: "bold",
                                                    }}
                                                    color="initial"
                                                >
                                                    <strong>Total Amount:</strong>
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={styles.receiptSummaryText}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={{
                                                        ...styles.receiptSummaryTyp,
                                                        fontWeight: "bold",
                                                    }}
                                                    color="initial"
                                                >
                                                    <strong>Rs.
                                                    {numeral(
                                                        sale.total_amount
                                                    ).format("0,0.00")}</strong>
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        
                                        <TableRow
                                            sx={{ border: "none" }}
                                            className="receipt-summary-row"
                                        >
                                            <TableCell
                                                sx={styles.receiptSummaryText}
                                                colSpan={4}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={
                                                        styles.receiptSummaryTyp
                                                    }
                                                    color="initial"
                                                >
                                                    Amount Paid:
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={styles.receiptSummaryText}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={
                                                        styles.receiptSummaryTyp
                                                    }
                                                    color="initial"
                                                >
                                                    Rs.
                                                    {numeral(
                                                        sale.amount_received
                                                    ).format("0,0.00")}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        
                                        <TableRow
                                            sx={{ border: "none" }}
                                            className="receipt-summary-row"
                                        >
                                            <TableCell
                                                sx={{...styles.receiptSummaryText, ...styles.balanceDuePadding}}
                                                colSpan={4}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={
                                                        styles.receiptSummaryTyp
                                                    }
                                                    color="initial"
                                                >
                                                    Balance Due:
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                sx={{...styles.receiptSummaryText, ...styles.balanceDuePadding}}
                                                align="right"
                                            >
                                                <Typography
                                                    sx={
                                                        styles.receiptSummaryTyp
                                                    }
                                                    color="initial"
                                                >
                                                    Rs.
                                                    {numeral(
                                                        parseFloat(
                                                            sale.amount_received
                                                        ) -
                                                        parseFloat(
                                                            sale.total_amount
                                                        )
                                                    ).format("0,0.00")}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>

                                        {/* Conditional row for Old Balance */}
                                        {credit_sale && parseFloat(sale.amount_received) - parseFloat(sale.total_amount) !== parseFloat(sale.balance) && (
                                            <>
                                                <TableRow
                                                    sx={{ border: "none" }}
                                                    className="receipt-summary-row"
                                                >
                                                    <TableCell
                                                        sx={styles.receiptSummaryText}
                                                        colSpan={4}
                                                        align="right"
                                                    >
                                                        <Typography
                                                            sx={styles.receiptSummaryTyp}
                                                            color="initial"
                                                        >
                                                            Old Balance:
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={styles.receiptSummaryText}
                                                        align="right"
                                                    >
                                                        <Typography
                                                            sx={styles.receiptSummaryTyp}
                                                            color="initial"
                                                        >
                                                            Rs.{numeral(
                                                                parseFloat(sale.balance) -
                                                                (parseFloat(sale.amount_received) -
                                                                    parseFloat(sale.total_amount))
                                                            ).format("0,0.00")}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow
                                                    sx={{ border: "none" }}
                                                    className="receipt-summary-row"
                                                >
                                                    <TableCell
                                                        sx={styles.receiptSummaryText}
                                                        colSpan={4}
                                                        align="right"
                                                    >
                                                        <Typography
                                                            sx={styles.receiptSummaryTyp}
                                                            color="initial"
                                                        >
                                                            Total Balance:
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell
                                                        sx={styles.receiptSummaryText}
                                                        align="right"
                                                    >
                                                        <Typography
                                                            sx={styles.receiptSummaryTyp}
                                                            color="initial"
                                                        >
                                                            Rs.{numeral(sale.balance).format("0,0.00")}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Divider
                                sx={styles.sectionDivider}
                                className="receipt-divider-before-footer"
                            />

                            <div
                                className="receipt-footer"
                                style={styles.footerText}
                                dangerouslySetInnerHTML={{
                                    __html: settings.sale_receipt_note,
                                }}
                            />
                            <div
                                className="receipt-second-note"
                                style={styles.footerText}
                                dangerouslySetInnerHTML={{
                                    __html: settings.sale_receipt_second_note,
                                }}
                            />
                        </ReceiptPrintContainer>
                    </div>
                </ReceiptContainer>
            </Box>
        </>
    );
}

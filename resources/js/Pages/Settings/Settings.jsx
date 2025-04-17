import * as React from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import {
    MenuItem,
    Typography,
    Tab,
    Tabs,
    Switch,
    TextField,
    CardMedia,
    CardActions,
    Box,
    FormControlLabel,
    Card,
    Paper,
} from "@mui/material";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import MiscSetting from "./Partials/MiscSetting";
import ModuleSetting from "./Partials/ModuleSetting";
import Template from "./Partials/Template";
import MailSetting from "./Partials/MailSetting";
import TelegramSetting from "./Partials/TelegramSetting";
import LoyaltyPointsSetting from "./Partials/LoyaltyPointsSetting";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const fontOptions = [
    { label: "Arial", fontFamily: "Arial, sans-serif" },
    { label: "Helvetica", fontFamily: "Helvetica, sans-serif" },
    { label: "Times New Roman", fontFamily: "'Times New Roman', serif" },
    { label: "Georgia", fontFamily: "Georgia, serif" },
    { label: "Courier New", fontFamily: "'Courier New', monospace" },
    { label: "Verdana", fontFamily: "Verdana, sans-serif" },
    { label: "Tahoma", fontFamily: "Tahoma, sans-serif" },
    { label: "Trebuchet MS", fontFamily: "'Trebuchet MS', sans-serif" },
    { label: "Comic Sans MS", fontFamily: "'Comic Sans MS', cursive" },
    { label: "OCR A Extended", fontFamily: "'OCR A Extended', monospace" },
    { label: "Monaco", fontFamily: "Monaco, monospace" },
    { label: "Lucida Console", fontFamily: "'Lucida Console', monospace" },
    { label: "Consolas", fontFamily: "Consolas, monospace" },
    {
        label: "Bitstream Vera Sans Mono",
        fontFamily: "'Bitstream Vera Sans Mono', monospace",
    },
    { label: "DejaVu Sans Mono", fontFamily: "'DejaVu Sans Mono', monospace" },
    { label: "Inconsolata", fontFamily: "'Inconsolata', monospace" },
    { label: "Source Code Pro", fontFamily: "'Source Code Pro', monospace" },
    { label: "Fira Code", fontFamily: "'Fira Code', monospace" },
    { label: "Droid Sans Mono", fontFamily: "'Droid Sans Mono', monospace" },
    { label: "Ubuntu Mono", fontFamily: "'Ubuntu Mono', monospace" },
    { label: "PT Mono", fontFamily: "'PT Mono', monospace" },
    { label: "Noto Mono", fontFamily: "'Noto Mono', monospace" },
    { label: "Hack", fontFamily: "'Hack', monospace" },
    { label: "Tisa Mono", fontFamily: "'Tisa Mono', monospace" },
    { label: "Space Mono", fontFamily: "'Space Mono', monospace" },
];

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Setting({ settings }) {
    const [settingFormData, setSettingFormData] = useState({
        shop_logo: settings.shop_logo,
        app_icon: settings.app_icon,
        sale_receipt_note: settings.sale_receipt_note,
        shop_name: settings.shop_name,
        sale_print_padding_right: settings.sale_print_padding_right,
        sale_print_padding_left: settings.sale_print_padding_left,
        sale_print_padding_top: settings.sale_print_padding_top || "0",
        sale_print_padding_bottom: settings.sale_print_padding_bottom || "0",
        sale_print_font: settings.sale_print_font,
        show_receipt_shop_name: settings.show_receipt_shop_name ?? 1,
        show_barcode_store: settings.show_barcode_store,
        show_barcode_product_price: settings.show_barcode_product_price,
        show_barcode_product_name: settings.show_barcode_product_name,
        sale_receipt_second_note: settings.sale_receipt_second_note,
        shop_name_font_size: settings.shop_name_font_size || "20px",
        receipt_header_font_size: settings.receipt_header_font_size || "12px",
        item_name_font_size: settings.item_name_font_size || "13px",
        item_details_font_size: settings.item_details_font_size || "12px",
        summary_font_size: settings.summary_font_size || "12px",
        footer_font_size: settings.footer_font_size || "11px",
        item_spacing: settings.item_spacing || "1",
        section_spacing: settings.section_spacing || "0.2rem",
        summary_row_spacing: settings.summary_row_spacing || "2",
        td_padding: settings.td_padding || "0",
        header_font_weight: settings.header_font_weight || "bold",
        item_font_weight: settings.item_font_weight || "500",
        summary_font_weight: settings.summary_font_weight || "bold",
        spacer_row_padding: settings.spacer_row_padding || "7px 0",
        balance_due_padding: settings.balance_due_padding || "2",
    });

    const [barcodeSettings, setBarcodeSettings] = useState(() => {
        const initialBarcodeSettings = new Map([
            ["container_height", "28mm"],
            ["store_font_size", "0.8em"],
            ["price_font_size", "0.8em"],
            ["price_margin_top", "-3px"],
            ["price_margin_bottom", "-5px"],
            ["barcode_margin_top", "-10px"],
            ["barcode_height", 35],
            ["barcode_font_size", 14],
            ["barcode_width", 1.5],
            ["barcode_format", "CODE128"],
            ["product_name_margin_top", "-4px"],
            ["product_name_font_size", "0.7em"],
        ]);

        // Parse JSON if barcode_settings exists in settings
        if (settings.barcode_settings) {
            try {
                const parsedSettings = JSON.parse(settings.barcode_settings);
                Object.entries(parsedSettings).forEach(([key, value]) => {
                    initialBarcodeSettings.set(key, value);
                });
            } catch (error) {
                console.error("Failed to parse barcode settings:", error);
            }
        }

        return initialBarcodeSettings;
    });

    const handleBarcodeFieldChange = (e) => {
        const { name, value } = e.target;
        setBarcodeSettings((prevSettings) => new Map(prevSettings).set(name, value));
    };

    const handleFontChange = (event) => {
        const selectedFontFamily = event.target.value;
        setSettingFormData({
            ...settingFormData,
            sale_print_font: selectedFontFamily,
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettingFormData({
            ...settingFormData,
            [name]: type === "checkbox" ? (checked ? "on" : "off") : value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const { name } = e.target;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettingFormData({
                    ...settingFormData,
                    [name]: reader.result,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const submittedFormData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(submittedFormData.entries());

        if(formJson.setting_type === 'barcode') {
            const barcodeSettingsObject = Object.fromEntries(barcodeSettings);
            formJson.barcodeSettings = JSON.stringify(barcodeSettingsObject);
        }

        axios.post('/settings-update', formJson, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then((response) => {
                Swal.fire({
                    title: "Success!",
                    text: "Successfully saved",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            })
            .catch((error) => {
                console.error("Submission failed with errors:", error);
                console.log(formJson);
            });
    };

    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />
            <Box component="div">
                <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                        <Tab label="SHOP" />
                        <Tab label="RECEIPT" />
                        <Tab label="BARCODE" />
                        <Tab label="MISC" />
                        <Tab label="MODULES" />
                        <Tab label="TEMPLATES" />
                        <Tab label="MAIL" />
                        <Tab label="TELEGRAM"/>
                        <Tab label="LOYALTY" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <form
                        encType="multipart/form-data"
                        onSubmit={handleSubmit}
                        method="post"
                    >
                        <input type="hidden" name="setting_type" value={'shop_information'} />
                        <Box
                            sx={{
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Grid
                                container
                                spacing={2}
                                width={{ xs: "100%", sm: "60%" }}
                            >
                                <Grid container size={12} spacing={2}>
                                    <Paper sx={{ padding: {xs:'0.5rem', sm:"1rem"}, marginBottom: "1rem", width:'100%' }}>
                                        <Grid size={12} container spacing={2}>
                                            <Grid size={{xs: 12, sm: 6}}>
                                            <Card>
                                                <CardMedia
                                                    sx={{
                                                        width: "100%",
                                                        height: 200,
                                                        contain: "content",
                                                        padding: "8px",
                                                        backgroundSize: "contain",
                                                        backgroundOrigin: "content-box",
                                                    }}
                                                    image={settingFormData.shop_logo}
                                                    title="shop logo"
                                                />
                                                <CardActions className="mt-0">
                                                    <Button
                                                        component="label"
                                                        role={undefined}
                                                        variant="contained"
                                                        tabIndex={-1}
                                                        startIcon={<CloudUploadIcon />}
                                                        fullWidth
                                                    >
                                                        Upload shop logo
                                                        <VisuallyHiddenInput
                                                            type="file"
                                                            onChange={handleFileChange}
                                                            name="shop_logo"
                                                        />
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                            </Grid>

                                            <Grid size={{xs: 12, sm: 6}}>
                                            <Card>
                                                <CardMedia
                                                    sx={{
                                                        width: "100%",
                                                        height: 200,
                                                        contain: "content",
                                                        padding: "8px",
                                                        backgroundSize: "contain",
                                                        backgroundOrigin: "content-box",
                                                    }}
                                                    image={settingFormData.app_icon}
                                                    title="app icon"
                                                />
                                                <CardActions className="mt-0">
                                                    <Button
                                                        component="label"
                                                        role={undefined}
                                                        variant="contained"
                                                        tabIndex={-1}
                                                        startIcon={<CloudUploadIcon />}
                                                        fullWidth
                                                    >
                                                        Upload app icon
                                                        <VisuallyHiddenInput
                                                            type="file"
                                                            onChange={handleFileChange}
                                                            name="app_icon"
                                                        />
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>

                                        <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label={"Shop name"}
                                            name="shop_name"
                                            multiline
                                            required
                                            sx={{ mt: "2rem" }}
                                            value={settingFormData.shop_name}
                                            onChange={handleChange}
                                        />
                                        </Grid>
                                        </Grid>
                                        
                                        
                                    </Paper>
                                </Grid>
                                <Grid
                                    size={12}
                                    justifyContent={"end"}
                                    sx={{ display: "flex" }}
                                >
                                    <Button
                                        type="submit"
                                        variant="outlined"
                                        size="large"
                                        color="success"
                                    >
                                        UPDATE
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </form>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <form
                        encType="multipart/form-data"
                        onSubmit={handleSubmit}
                        method="post"
                    >
                        <input type="hidden" name="setting_type" value={'receipt'} />
                        <Box
                            sx={{
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Grid
                                container
                                spacing={2}
                                width={{ xs: "100%", sm: "60%" }}
                            >
                                <Grid size={12}>
                                    <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                                        <Grid
                                            container
                                            sx={{
                                                display: "flex",
                                                width: "100%",
                                            }}
                                            spacing={3}
                                        >
                                            <Grid size={12}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Receipt note"}
                                                    name="sale_receipt_note"
                                                    multiline
                                                    required
                                                    value={settingFormData.sale_receipt_note}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={12}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Second note"}
                                                    name="sale_receipt_second_note"
                                                    multiline
                                                    value={settingFormData.sale_receipt_second_note}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={12}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Show shopname"}
                                                    name="show_receipt_shop_name"
                                                    multiline
                                                    required
                                                    value={settingFormData.show_receipt_shop_name}
                                                    onChange={handleChange}
                                                    select
                                                >
                                                    <MenuItem value={1}>Show</MenuItem>
                                                    <MenuItem value={0}>Hide</MenuItem>
                                                </TextField>
                                            </Grid>
                                            <Typography variant="h6" sx={{ width: '100%', mt: 2, mb: 1 }}>
                                                Padding Settings
                                            </Typography>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Padding Right"}
                                                    name="sale_print_padding_right"
                                                    multiline
                                                    required
                                                    value={settingFormData.sale_print_padding_right}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Padding Left"}
                                                    name="sale_print_padding_left"
                                                    multiline
                                                    required
                                                    value={settingFormData.sale_print_padding_left}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Padding Top"}
                                                    name="sale_print_padding_top"
                                                    multiline
                                                    value={settingFormData.sale_print_padding_top}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Padding Bottom"}
                                                    name="sale_print_padding_bottom"
                                                    multiline
                                                    value={settingFormData.sale_print_padding_bottom}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Table Cell Padding"}
                                                    name="td_padding"
                                                    value={settingFormData.td_padding}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            
                                            <Typography variant="h6" sx={{ width: '100%', mt: 3, mb: 1 }}>
                                                Font Settings
                                            </Typography>
                                            <Grid size={6}>
                                                <TextField
                                                    fullWidth
                                                    name="sale_print_font"
                                                    label="Choose Font for Receipt"
                                                    value={settingFormData.sale_print_font}
                                                    onChange={handleFontChange}
                                                    select
                                                >
                                                    {fontOptions.map((option) => (
                                                        <MenuItem
                                                            key={option.fontFamily}
                                                            value={option.fontFamily}
                                                        >
                                                            <Typography style={{ fontFamily: option.fontFamily }}>
                                                                {option.label}
                                                            </Typography>
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            
                                            <Typography variant="h6" sx={{ width: '100%', mt: 3, mb: 1 }}>
                                                Font Size Settings
                                            </Typography>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Shop Name Font Size"}
                                                    name="shop_name_font_size"
                                                    value={settingFormData.shop_name_font_size}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Header Font Size"}
                                                    name="receipt_header_font_size"
                                                    value={settingFormData.receipt_header_font_size}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Item Name Font Size"}
                                                    name="item_name_font_size"
                                                    value={settingFormData.item_name_font_size}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Item Details Font Size"}
                                                    name="item_details_font_size"
                                                    value={settingFormData.item_details_font_size}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Summary Font Size"}
                                                    name="summary_font_size"
                                                    value={settingFormData.summary_font_size}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Footer Font Size"}
                                                    name="footer_font_size"
                                                    value={settingFormData.footer_font_size}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            
                                            <Typography variant="h6" sx={{ width: '100%', mt: 3, mb: 1 }}>
                                                Font Weight Settings
                                            </Typography>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Header Font Weight"}
                                                    name="header_font_weight"
                                                    value={settingFormData.header_font_weight}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Item Font Weight"}
                                                    name="item_font_weight"
                                                    value={settingFormData.item_font_weight}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Summary Font Weight"}
                                                    name="summary_font_weight"
                                                    value={settingFormData.summary_font_weight}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            
                                            <Typography variant="h6" sx={{ width: '100%', mt: 3, mb: 1 }}>
                                                Spacing Settings
                                            </Typography>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Item Spacing"}
                                                    name="item_spacing"
                                                    value={settingFormData.item_spacing}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Section Spacing"}
                                                    name="section_spacing"
                                                    value={settingFormData.section_spacing}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Summary Row Spacing"}
                                                    name="summary_row_spacing"
                                                    value={settingFormData.summary_row_spacing}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Spacer Row Padding"}
                                                    name="spacer_row_padding"
                                                    value={settingFormData.spacer_row_padding}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                            <Grid size={3}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    label={"Balance Due Padding"}
                                                    name="balance_due_padding"
                                                    value={settingFormData.balance_due_padding}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                                <Grid
                                    size={12}
                                    justifyContent={"end"}
                                    sx={{ display: "flex" }}
                                >
                                    <Button
                                        type="submit"
                                        variant="outlined"
                                        size="large"
                                        color="success"
                                    >
                                        UPDATE
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </form>
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    <form
                        encType="multipart/form-data"
                        onSubmit={handleSubmit}
                        method="post"
                    >
                        <input type="hidden" name="setting_type" value={'barcode'} />
                        <Box
                            sx={{
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Grid
                                container
                                spacing={2}
                                width={{ xs: "100%", sm: "60%" }}
                            >
                                <Grid size={12}>
                                    <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                                        <Grid
                                            container
                                            sx={{
                                                display: "flex",
                                                width: "100%",
                                            }}
                                        >
                                            <Grid size={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            name="show_barcode_store"
                                                            value={settingFormData.show_barcode_store}
                                                            onChange={handleChange}
                                                            checked={settingFormData.show_barcode_store === "on"}
                                                        />
                                                    }
                                                    label="STORE NAME"
                                                />
                                            </Grid>
                                            <Grid size={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            name="show_barcode_product_price"
                                                            value={settingFormData.show_barcode_product_price}
                                                            onChange={handleChange}
                                                            checked={settingFormData.show_barcode_product_price === "on"}
                                                        />
                                                    }
                                                    label="PRODUCT PRICE"
                                                />
                                            </Grid>
                                            <Grid size={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            name="show_barcode_product_name"
                                                            value={settingFormData.show_barcode_product_name}
                                                            onChange={handleChange}
                                                            checked={settingFormData.show_barcode_product_name === "on"}
                                                        />
                                                    }
                                                    label="PRODUCT NAME"
                                                />
                                            </Grid>
                                        </Grid>
                                        <Grid spacing={2} container sx={{ mt: 2 }}>
                                            {[...barcodeSettings.keys()].map((key) => (
                                                <Grid size={3} key={key}>
                                                    <TextField
                                                        fullWidth
                                                        variant="outlined"
                                                        label={key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                                                        name={key}
                                                        value={barcodeSettings.get(key)}
                                                        onChange={handleBarcodeFieldChange}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Paper>
                                </Grid>
                                <Grid
                                    size={12}
                                    justifyContent={"end"}
                                    sx={{ display: "flex" }}
                                >
                                    <Button
                                        type="submit"
                                        variant="outlined"
                                        size="large"
                                        color="success"
                                    >
                                        UPDATE
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </form>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <MiscSetting handleSubmit={handleSubmit} settingFormData={settingFormData} handleChange={handleChange} setSettingFormData={setSettingFormData} settings={settings}/>
                </TabPanel>
                <TabPanel value={tabValue} index={4}>
                  <ModuleSetting handleSubmit={handleSubmit} settingFormData={settingFormData} handleChange={handleChange} setSettingFormData={setSettingFormData} settings={settings}/>
                </TabPanel>
                <TabPanel value={tabValue} index={5}>
                  <Template/>
                </TabPanel>
                <TabPanel value={tabValue} index={6}>
                  <MailSetting handleSubmit={handleSubmit} settingFormData={settingFormData} handleChange={handleChange} setSettingFormData={setSettingFormData} settings={settings}/>
                </TabPanel>
                <TabPanel value={tabValue} index={7}>
                  <TelegramSetting handleSubmit={handleSubmit} settingFormData={settingFormData} handleChange={handleChange} setSettingFormData={setSettingFormData} settings={settings}/>
                </TabPanel>
                <TabPanel value={tabValue} index={8}>
                  <LoyaltyPointsSetting handleSubmit={handleSubmit} settingFormData={settingFormData} handleChange={handleChange} setSettingFormData={setSettingFormData} settings={settings}/>
                </TabPanel>
            </Box>
        </AuthenticatedLayout>
    );
}

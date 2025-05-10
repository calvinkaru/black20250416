import React from 'react';
import { Box, Button, Grid2 as Grid, Paper, TextField, MenuItem } from '@mui/material';
import { useEffect } from 'react';

const MiscSetting = ({ handleSubmit, settingFormData, handleChange, setSettingFormData, settings }) => {

    // List of common timezones
    const timezones = [
        { value: 'UTC', label: 'UTC' },
        { value: 'Asia/Colombo', label: 'Asia/Colombo (UTC+5:30)' },
        { value: 'Asia/Kolkata', label: 'Asia/Kolkata (UTC+5:30)' },
        { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC+4)' },
        { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
        { value: 'Europe/London', label: 'Europe/London (UTC+0/+1)' },
        { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1/+2)' },
        { value: 'America/New_York', label: 'America/New_York (UTC-5/-4)' },
        { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8/-7)' },
        { value: 'Australia/Sydney', label: 'Australia/Sydney (UTC+10/+11)' },
    ];

    useEffect(() => {
        try {
            const parsedSettings = JSON.parse(settings.misc_settings);
            setSettingFormData({
                ...settingFormData,
                optimize_image_width: parsedSettings.optimize_image_width,
                optimize_image_size: parsedSettings.optimize_image_size,
                cheque_alert: parsedSettings.cheque_alert,
                product_alert: parsedSettings.product_alert,
                cart_first_focus: parsedSettings.cart_first_focus ? parsedSettings.cart_first_focus : 'quantity',
                timezone: parsedSettings.timezone ? parsedSettings.timezone : 'UTC',
            });
        } catch (error) {
            console.error("Failed to parse misc settings:", error);
        }
    }, []);

    return (
        <form
            onSubmit={handleSubmit}
            method="post"
        >
            <input type="hidden" name="setting_type" value={'misc_settings'} />
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
                    flexDirection={'column'}
                >
                    <Grid container size={12} spacing={2}>
                        <Paper sx={{ padding: { xs: '0.5rem', sm: "1rem" }, marginBottom: "1rem", width: '100%' }}>
                            <Grid size={12} container spacing={2}>
                                <Grid size={3}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label={"Cheque Alert"}
                                        name="cheque_alert"
                                        multiline
                                        required
                                        sx={{ mt: "2rem" }}
                                        value={settingFormData.cheque_alert}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={3}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label={"Product Alert"}
                                        name="product_alert"
                                        multiline
                                        required
                                        sx={{ mt: "2rem" }}
                                        value={settingFormData.product_alert}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label={"Cart First Focus"}
                                        name="cart_first_focus"
                                        required
                                        sx={{ mt: "2rem" }}
                                        value={settingFormData.cart_first_focus}
                                        onChange={handleChange}
                                        select
                                    >
                                        <MenuItem value="quantity">Quantity</MenuItem>
                                        <MenuItem value="discount">Discount</MenuItem>
                                        <MenuItem value="price">Price</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid size={6}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label={"Timezone"}
                                        name="timezone"
                                        required
                                        sx={{ mt: "2rem" }}
                                        value={settingFormData.timezone || 'UTC'}
                                        onChange={handleChange}
                                        select
                                    >
                                        {timezones.map((timezone) => (
                                            <MenuItem key={timezone.value} value={timezone.value}>
                                                {timezone.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                            <Grid size={12} container spacing={2}>
                                <Grid size={6}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label={"Optimize Image Width"}
                                        name="optimize_image_width"
                                        multiline
                                        required
                                        sx={{ mt: "2rem" }}
                                        value={settingFormData.optimize_image_width}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label={"Optimize Image Size"}
                                        name="optimize_image_size"
                                        multiline
                                        required
                                        sx={{ mt: "2rem" }}
                                        value={settingFormData.optimize_image_size}
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
    );
};

export default MiscSetting;

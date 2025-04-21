import React, { useState, useEffect } from "react";
import {
    Button,
    Grid,
    Paper,
    Typography,
    FormControlLabel,
    Switch,
    Box,
    TextField,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Swal from "sweetalert2";

export default function MyDrawerSetting() {
    const [settings, setSettings] = useState({
        showTableBeforeClosing: false,
        coinDenominations: [
            { value: 0.5, label: "50 cents" },
            { value: 1, label: "1 Rs" },
            { value: 2, label: "2 Rs" },
            { value: 5, label: "5 Rs" },
            { value: 10, label: "10 Rs" },
        ],
        noteDenominations: [
            { value: 10, label: "10 Rs" },
            { value: 20, label: "20 Rs" },
            { value: 50, label: "50 Rs" },
            { value: 100, label: "100 Rs" },
            { value: 500, label: "500 Rs" },
            { value: 1000, label: "1000 Rs" },
            { value: 5000, label: "5000 Rs" },
        ],
    });
    
    const [newCoin, setNewCoin] = useState({ value: "", label: "" });
    const [newNote, setNewNote] = useState({ value: "", label: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch the current setting values
        axios.get('/api/settings/my-drawer')
            .then(response => {
                if (response.data && response.data.settings) {
                    const updatedSettings = {
                        showTableBeforeClosing: response.data.settings.my_drawer_show_table_before_closing === 'true',
                        coinDenominations: settings.coinDenominations,
                        noteDenominations: settings.noteDenominations
                    };
                    
                    // Parse denominations if they exist
                    if (response.data.settings.drawer_coin_denominations) {
                        try {
                            updatedSettings.coinDenominations = JSON.parse(response.data.settings.drawer_coin_denominations);
                        } catch (e) {
                            console.error("Error parsing coin denominations:", e);
                        }
                    }
                    
                    if (response.data.settings.drawer_note_denominations) {
                        try {
                            updatedSettings.noteDenominations = JSON.parse(response.data.settings.drawer_note_denominations);
                        } catch (e) {
                            console.error("Error parsing note denominations:", e);
                        }
                    }
                    
                    setSettings(updatedSettings);
                }
            })
            .catch(error => {
                console.error("Error fetching Drawer settings:", error);
            });
    }, []);

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setSettings({
            ...settings,
            [name]: checked
        });
    };
    
    const handleNewCoinChange = (e) => {
        const { name, value } = e.target;
        setNewCoin({
            ...newCoin,
            [name]: name === 'value' ? parseFloat(value) || '' : value
        });
    };
    
    const handleNewNoteChange = (e) => {
        const { name, value } = e.target;
        setNewNote({
            ...newNote,
            [name]: name === 'value' ? parseFloat(value) || '' : value
        });
    };
    
    const addCoin = () => {
        if (newCoin.value && newCoin.label) {
            const updatedCoins = [...settings.coinDenominations, newCoin];
            // Sort by value
            updatedCoins.sort((a, b) => a.value - b.value);
            setSettings({
                ...settings,
                coinDenominations: updatedCoins
            });
            setNewCoin({ value: "", label: "" });
        }
    };
    
    const addNote = () => {
        if (newNote.value && newNote.label) {
            const updatedNotes = [...settings.noteDenominations, newNote];
            // Sort by value
            updatedNotes.sort((a, b) => a.value - b.value);
            setSettings({
                ...settings,
                noteDenominations: updatedNotes
            });
            setNewNote({ value: "", label: "" });
        }
    };
    
    const removeCoin = (index) => {
        const updatedCoins = [...settings.coinDenominations];
        updatedCoins.splice(index, 1);
        setSettings({
            ...settings,
            coinDenominations: updatedCoins
        });
    };
    
    const removeNote = (index) => {
        const updatedNotes = [...settings.noteDenominations];
        updatedNotes.splice(index, 1);
        setSettings({
            ...settings,
            noteDenominations: updatedNotes
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Create promises for all settings updates
        const promises = [
            // Update table visibility setting
            axios.post('/api/settings/update', {
                meta_key: 'my_drawer_show_table_before_closing',
                meta_value: settings.showTableBeforeClosing ? 'true' : 'false'
            }),
            
            // Update coin denominations
            axios.post('/api/settings/update', {
                meta_key: 'drawer_coin_denominations',
                meta_value: JSON.stringify(settings.coinDenominations)
            }),
            
            // Update note denominations
            axios.post('/api/settings/update', {
                meta_key: 'drawer_note_denominations',
                meta_value: JSON.stringify(settings.noteDenominations)
            })
        ];

        // Execute all promises
        Promise.all(promises)
            .then(() => {
                Swal.fire({
                    title: "Success!",
                    text: "Drawer settings updated successfully",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            })
            .catch(error => {
                console.error("Error updating Drawer settings:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to update Drawer settings",
                    icon: "error",
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
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
                    width={{ xs: "100%", sm: "80%" }}
                >
                    {/* General Settings */}
                    <Grid size={12}>
                        <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                General Drawer Settings
                            </Typography>
                            <Grid
                                container
                                sx={{
                                    display: "flex",
                                    width: "100%",
                                }}
                                spacing={2}
                            >
                                <Grid size={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name="showTableBeforeClosing"
                                                checked={settings.showTableBeforeClosing}
                                                onChange={handleChange}
                                            />
                                        }
                                        label="Show transactions table before closing the drawer"
                                    />
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                        If enabled, cashiers will see their transaction history in My Drawer before closing the drawer for the day.
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    
                    {/* Coin Denominations */}
                    <Grid size={12} md={6}>
                        <Paper elevation={3} sx={{ padding: 2, marginBottom: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Coin Denominations
                            </Typography>
                            <List dense>
                                {settings.coinDenominations.map((coin, index) => (
                                    <ListItem key={index}>
                                        <ListItemText 
                                            primary={coin.label} 
                                            secondary={`Value: ${coin.value}`} 
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" onClick={() => removeCoin(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                                Add New Coin
                            </Typography>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={4}>
                                    <TextField
                                        fullWidth
                                        label="Value"
                                        name="value"
                                        type="number"
                                        value={newCoin.value}
                                        onChange={handleNewCoinChange}
                                        inputProps={{ step: "0.1" }}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <TextField
                                        fullWidth
                                        label="Label"
                                        name="label"
                                        value={newCoin.label}
                                        onChange={handleNewCoinChange}
                                        placeholder="e.g., 50 cents"
                                    />
                                </Grid>
                                <Grid size={2}>
                                    <IconButton 
                                        color="primary" 
                                        onClick={addCoin}
                                        disabled={!newCoin.value || !newCoin.label}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    
                    {/* Note Denominations */}
                    <Grid size={12} md={6}>
                        <Paper elevation={3} sx={{ padding: 2, marginBottom: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Note Denominations
                            </Typography>
                            <List dense>
                                {settings.noteDenominations.map((note, index) => (
                                    <ListItem key={index}>
                                        <ListItemText 
                                            primary={note.label} 
                                            secondary={`Value: ${note.value}`} 
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" onClick={() => removeNote(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                                Add New Note
                            </Typography>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={4}>
                                    <TextField
                                        fullWidth
                                        label="Value"
                                        name="value"
                                        type="number"
                                        value={newNote.value}
                                        onChange={handleNewNoteChange}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <TextField
                                        fullWidth
                                        label="Label"
                                        name="label"
                                        value={newNote.label}
                                        onChange={handleNewNoteChange}
                                        placeholder="e.g., 100 Rs"
                                    />
                                </Grid>
                                <Grid size={2}>
                                    <IconButton 
                                        color="primary" 
                                        onClick={addNote}
                                        disabled={!newNote.value || !newNote.label}
                                    >
                                        <AddIcon />
                                    </IconButton>
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
                            disabled={loading}
                        >
                            {loading ? "UPDATING..." : "UPDATE"}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </form>
    );
}

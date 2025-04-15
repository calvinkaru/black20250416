import React from 'react';
import { useEffect, useState } from 'react';
import { Button, Grid2 as Grid, CardContent, Typography, CardActions } from '@mui/material';
import Card from '@mui/material/Card';
import { SnackbarProvider, useSnackbar } from 'notistack';

const App = ({ handleSubmit, settingFormData, setSettingFormData, settings }) => {
    const modules_list = ['Cheques', 'Reloads',];
    const [activatedModules, setActivatedModules] = useState(settings.modules ? settings.modules.split(',') : []);
    const { enqueueSnackbar } = useSnackbar();

    const handleActivate = async (module) => {
        try {
            const response = await axios.post('/settings/module/activate', { module });
            setActivatedModules([...activatedModules, module]);
            enqueueSnackbar('Module activated successfully!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to activate module.', { variant: 'error' });
        }
    };

    const handleDeactivate = async (module) => {
        try {
            const response = await axios.post('/settings/module/deactivate', { module });
            setActivatedModules(activatedModules.filter(m => m !== module));
            enqueueSnackbar('Module deactivated successfully!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to deactivate module.', { variant: 'error' });
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            method="post"
        >
            {console.log(settingFormData.modules)}
            <Grid container spacing={2} size={12} width={'100%'} justifyContent={'center'}>
                {modules_list.map((module) => (
                    <Grid size={{ xs: 12, sm: 3 }} key={module} justifyContent={'center'}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {module}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                {activatedModules.includes(module) ? (
                                    <Button size="small" color="error" onClick={() => handleDeactivate(module)}>
                                        Deactivate
                                    </Button>
                                ) : (
                                    <Button size="small" color="primary" onClick={()=>handleActivate(module)}>
                                        Activate
                                    </Button>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </form>
    );
};

export default function ModuleSetting(props) {
    return (
      <SnackbarProvider maxSnack={3}>
        {console.log(props)}
        <App {...props}/>
      </SnackbarProvider>
    );
  }
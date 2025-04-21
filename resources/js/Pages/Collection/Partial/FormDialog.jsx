import * as React from 'react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Grid2 as Grid } from '@mui/material';

import Swal from 'sweetalert2';


export default function FormDialog({ open, handleClose, collection }) {
  const [name, setName] = useState('');
  const [collectionType, setCollectionType] = useState('category');
  const [description, setDescription] = useState('');
  const [displayLimit, setDisplayLimit] = useState(20);

  useEffect(() => {
    if (collection) {
      setName(collection.name || '');
      setCollectionType(collection.collection_type || 'category');
      setDescription(collection.description || '');
      setDisplayLimit(collection.display_limit || 20);
    } else {
      setName('');
      setCollectionType('category');
      setDescription('');
      setDisplayLimit(20);
    }
  }, [collection]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());

    // Determine the endpoint based on whether we are editing or adding
    const endpoint = collection ? `/collection/${collection.id}` : '/collection';
    const method = 'post';

    // Send form data via Inertia
    router[method](endpoint, formJson, {
      onSuccess: (resp) => {
        Swal.fire({
          title: 'Success!',
          text: 'Successfully saved',
          icon: 'success',
          position: 'bottom-start',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          toast: true,
        });
        handleClose(); // Close dialog on success
      },
      onError: (errors) => {
        const errorMessages = Object.values(errors).flat().join(' | ');
        Swal.fire({
          title: 'Error!',
          text: errorMessages || 'An unexpected error occurred.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  };

  // Collection type select box
  const handleChange = (event) => {
    setCollectionType(event.target.value);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit,
        }}
      >
        <DialogTitle>Collection Information</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              {/* Collection Name */}
              <TextField
                autoFocus
                required
                margin="dense"
                name="name"
                label="Collection Name"
                type="text"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>

            <Grid size={12}>
              {/* Collection Type */}
              <TextField
                value={collectionType}
                label="Type"
                onChange={handleChange}
                name="collection_type"
                required
                select
                fullWidth
                margin="dense"
                variant="outlined"
                style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}
              >
                <MenuItem value={'category'}>Category</MenuItem>
                <MenuItem value={'brand'}>Brand</MenuItem>
                <MenuItem value={'tag'}>Tag</MenuItem>
              </TextField>
            </Grid>

            <Grid size={12}>
              {/* Collection Description */}
              <TextField
                margin="dense"
                name="description"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            
            <Grid size={12}>
              {/* Display Limit */}
              <TextField
                margin="dense"
                name="display_limit"
                label="Display Limit (number of items to show in POS)"
                type="number"
                fullWidth
                variant="outlined"
                value={displayLimit}
                onChange={(e) => setDisplayLimit(e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
                helperText="Number of items to display when this category is selected in POS view"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">SAVE</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

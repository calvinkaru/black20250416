import React, { useState, useEffect, useContext } from 'react';
import { IconButton, Autocomplete, TextField, Grid2 as Grid, Tooltip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FormDialog from '@/Pages/Contact/Partial/FormDialog';
import { usePage } from "@inertiajs/react";

import { SharedContext } from '@/Context/SharedContext';
import { useSales } from '@/Context/SalesContext';

export default function CartItemsTop({ customers }) {
  const { return_sale, orderTypes } = usePage().props;
  const [open, setOpen] = useState(false);
  const [customerList, setCustomerList] = useState(customers)
  const { selectedCustomer, setSelectedCustomer, saleDate, setSaleDate } = useContext(SharedContext);

  const { orderType, setOrderType, selectedOrderTypeObj } = useSales();

  const handleClose = () => {
    setOpen(false);
  };

  // Handle Dropdown Change
  const handleOrderTypeChange = (event) => {
    console.log("Order type changed to:", event.target.value);
    setOrderType(event.target.value); // Update orderType in context
  };

  //   Reload the table after form success
  const handleFormSuccess = (contact) => {

    setCustomerList((prevCustomers) => {
      // Create the new customer object
      const newCustomer = { id: contact.id, name: contact.name, balance: contact.balance };

      // Update the customer list
      const updatedCustomerList = [...prevCustomers, newCustomer];

      // Select the newly added customer directly
      setSelectedCustomer(newCustomer); // Set selected customer to the new customer

      return updatedCustomerList; // Return the updated list
    });
  };

  useEffect(() => {
    if (customerList) {
      const initialCustomer = customerList.find(customer => customer.id === 1) || customerList[0];
      setSelectedCustomer(initialCustomer || null);
    }
  }, [customers]);

  return (
    <Grid sx={{ width: '100%', marginY: { xs: '1rem', sm: '1.2rem' }, alignItems: 'center', justifyContent:'space-between' }} container spacing={2} flexDirection={{ xs: 'column-reverse', sm: 'row' }} alignItems={'center'}>
      <Tooltip
          title={!saleDate ? "Sale date is required" : ""} // Tooltip message if saleDate is empty
          arrow
          placement="top" // Adjust placement as needed
          open={!saleDate} // Show tooltip only when saleDate is empty
          disableHoverListener
          PopperProps={{
            disablePortal: true, // Ensures tooltip is attached to the right place
        }}
        >
      <Grid size={{ xs: 12, sm: 4 }} width={'100%'}>
        
          <TextField
            label="Date"
            name="sale_date"
            placeholder="Date"
            fullWidth
            type="date"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            error={!saleDate}
            required
            size='small'
          />
        
      </Grid>
      </Tooltip>

      <Grid size={{ xs: 12, sm: 4 }} width={'100%'}>
        <FormControl fullWidth size="small">
          <InputLabel shrink={true} notched={true}>Order Type</InputLabel>
          <Select value={orderType} onChange={handleOrderTypeChange} label="Order Type">
            {orderTypes && orderTypes.map((type) => (
              <MenuItem key={type.id} value={type.id.toString()}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 8 }} container alignItems={'center'} width={'100%'} display={'flex'}>
        <Grid size={10}>
          {Array.isArray(customerList) && (
            <Autocomplete
              disablePortal
              options={customerList}
              fullWidth
              value={selectedCustomer || null}
              getOptionKey={(option) => option.id}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.name + ' | ' + parseFloat(option.balance).toFixed(2)}
              onChange={(event, newValue) => {
                setSelectedCustomer(newValue)
              }}
              size='small'
              renderInput={(params) => <TextField {...params} label="Customer" />}
            />
          )}
        </Grid>

        <Grid size={2}>
          <IconButton disabled={return_sale} onClick={() => setOpen(true)} sx={{
            bgcolor: 'success.main', width: '35px', height: '35px', color: 'white', '&:hover': {
              bgcolor: 'success.dark', // Change the background color on hover
            }
          }}>
            <PersonAddIcon fontSize="inherit" />
          </IconButton>
        </Grid>
      </Grid>

      <FormDialog open={open} handleClose={handleClose} onSuccess={handleFormSuccess} contactType={'customer'} />
    </Grid>
  );
}

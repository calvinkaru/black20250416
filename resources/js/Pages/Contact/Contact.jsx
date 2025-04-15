import * as React from 'react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Grid from '@mui/material/Grid2';
import { Button, Box, TextField, IconButton, Alert, AlertTitle, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import PrintIcon from "@mui/icons-material/Print";
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import numeral from 'numeral';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import FormDialog from './Partial/FormDialog';
import CustomPagination from '@/Components/CustomPagination';
import AddPaymentDialog from '@/Components/AddPaymentDialog';
import PaymentsIcon from "@mui/icons-material/Payments";
import PendingActionsIcon from '@mui/icons-material/PendingActions';

const columns = (handleRowClick) => [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', width: 200,
      renderCell: (params) => (
          <Link underline="hover" href='#' className='hover:underline' onClick={(event) => {event.preventDefault(); handleRowClick(params.row, 'contact_edit');}}>
            <p className='font-bold'>{params.value}</p>
          </Link>
      ),
    },
    { field: 'balance', headerName: 'Balance', width: 160,
        valueGetter: (value) => parseFloat(value),
      renderCell: (params) => (
        <Button
            onClick={() => handleRowClick(params.row, "add_payment")}
            variant="text"
            fullWidth
            sx={{
                textAlign: "left",
                fontWeight: "bold",
                justifyContent: "flex-end",
            }}
        >
            {numeral(params.value).format('0,00.00')}
        </Button>
      ),
    }, // Added balance
    { field: 'phone', headerName: 'Phone', width: 120 },
    { field: 'whatsapp', headerName: 'Whatsapp', width: 120 },
    { field: 'email', headerName: 'Email', width: 100 },
    { field: 'address', headerName: 'Address', width: 200 }, // Changed from collection_type to address
    { field: 'created_at', headerName: 'Created At', width: 100 },
    {
        field: "action",
        headerName: "Actions",
        width: 180,
        renderCell: (params) => {
        const basePath = params.row.type === 'vendor' ? '/purchases' : '/sales';
        const paymentsPath = params.row.type === 'vendor' ? '/purchases' : '/sales';
        return(
            <>
                <Link href={"/reports/" + params.row.id+'/'+params.row.type}>
                <Tooltip title="REPORT">
                <IconButton color="primary">
                        <PrintIcon />
                    </IconButton>
                </Tooltip>
                </Link>

                {params.row.type === "customer" && (
                <Link href={"/pending-sales-receipt/" + params.row.id}>
                    <Tooltip title="PENDING RECEIPT">
                    <IconButton color="primary">
                        <PendingActionsIcon />
                    </IconButton>
                    </Tooltip>
                    
                </Link>
                )}

                {/* Sales or Purchase Link */}
                <Link href={`${basePath}?contact_id=${params.row.id}&end_date=&query=&start_date=&status=pending&store=0`}>
                <Tooltip title="CREDIT SALE">
                <IconButton color="alert">
                        <HourglassTopIcon />
                    </IconButton>
                </Tooltip>
                </Link>

                {/* Sales or Purchase Link */}
                <Link href={`/payments${basePath}?contact_id=${params.row.id}&store=0`}>
                <Tooltip title="PAYMENTS">
                <IconButton color="success">
                        <PaymentsIcon />
                    </IconButton>
                </Tooltip>
                </Link>
            </>
        )},
    },
];

export default function Contact({contacts, type, stores}) {
  const [open, setOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  const [dataContacts, setDataContacts] = useState(contacts);
  const [totalBalance, setTotalBalance] = useState(0);
  const [searchQuery, setSearchQuery] = useState('')

  const handleClickOpen = () => {
    setSelectedContact(null);
    setOpen(true);
  };

  const handleRowClick = (contact, funcmethod) => {
    setSelectedContact(contact);
    if(funcmethod=='contact_edit') setOpen(true);
    else if (funcmethod=='add_payment'){
      setPaymentModalOpen(true)
    }
  };

  const handleClose = () => {
    setSelectedContact(null);
    setOpen(false);
  };

  const refreshContacts = (url) => {
    const options = {
        preserveState: true, // Preserves the current component's state
        preserveScroll: true, // Preserves the current scroll position
        only: ["contacts"], // Only reload specified properties
        onSuccess: (response) => {
            setDataContacts(response.props.contacts);
        },
    };
    router.get(
        url,
        {
            search_query:searchQuery
        },
        options
    );
  };

  //   Reload the table after form success
  const handleFormSuccess = (contact) => {
    refreshContacts(window.location.pathname)
  };

  useEffect(() => {
    if(dataContacts){
        // Calculate the total balance from dataContacts
    const sum = Object.values(dataContacts.data).reduce(
        (acc, contact) => acc + parseFloat(contact.balance),
        0
      );
      setTotalBalance(sum);
    }
  }, [dataContacts]);

  return (
      <AuthenticatedLayout>
          {/* Capitalize first letter of type and add s at the end */}
          <Head title={type[0].toUpperCase() + type.slice(1) + "s"} />

          <Grid
              container
              spacing={2}
              alignItems="center"
              sx={{ width: "100%" }}
          >
            <Grid size={{xs:12, sm:2, md:3}}>
            <Alert severity="error" icon={false}>
                <AlertTitle>Balance</AlertTitle>
                {numeral(totalBalance).format('0,00.00')}
            </Alert>
            </Grid>
            
              <Grid size={{xs:12, sm:10, md:9}} spacing={2} container justifyContent="end" alignItems={'center'} flexDirection={{xs:'column',sm:'row'}}>
                <Grid size={{xs:12, sm:8}}>
                <TextField
                      name="search_query"
                      label="Search"
                      variant="outlined"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      required
                      fullWidth
                      onFocus={(event) => {
                          event.target.select();
                      }}
                      slotProps={{
                          inputLabel: {
                              shrink: true,
                          },
                      }}
                  />
                </Grid>
                  
                  <Grid size={{xs:12, sm:1}}>
                  <Button
                      variant="contained"
                      onClick={() => refreshContacts(window.location.pathname)}
                      size="large"
                      fullWidth
                  >
                      <FindReplaceIcon />
                  </Button>
                  </Grid>
                  <Grid size={{xs:12, sm:3}}>
                  <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleClickOpen}
                      fullWidth
                      color="success"
                  >
                      Add {type[0].toUpperCase() + type.slice(1)}
                  </Button>
                  </Grid>
                  
              </Grid>

              <Box
                  className="py-6 w-full"
                  sx={{ display: "grid", gridTemplateColumns: "1fr", height: "calc(100vh - 240px)",}}
              >
                  <DataGrid
                      rows={dataContacts.data}
                      columns={columns(handleRowClick)}
                      slots={{ toolbar: GridToolbar }}
                      getRowId={(row) => row.id}
                      slotProps={{
                          toolbar: {
                              showQuickFilter: true,
                          },
                      }}
                      initialState={{
                        columns: {
                            columnVisibilityModel: {
                                // Hide columns status and traderName, the other columns will remain visible
                                address: false,
                                email:false,
                                created_at: false,
                            },
                        },
                    }}
                      hideFooter
                  />
              </Box>
              <Grid size={12} container justifyContent={"end"}>
                  <CustomPagination
                      dataLinks={dataContacts?.links}
                      refreshTable={refreshContacts}
                      dataLastPage={dataContacts?.last_page}
                  ></CustomPagination>
              </Grid>
          </Grid>

          <FormDialog
              open={open}
              handleClose={handleClose}
              contact={selectedContact}
              contactType={type}
              onSuccess={handleFormSuccess}
          />
          <AddPaymentDialog
              open={paymentModalOpen}
              setOpen={setPaymentModalOpen}
              selectedContact={selectedContact?.id}
              is_customer={type === "customer" ? true : false}
              stores={stores}
              refreshTable={refreshContacts}
          />
      </AuthenticatedLayout>
  );
}

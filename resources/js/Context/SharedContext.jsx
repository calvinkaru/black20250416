import React, { createContext, useState } from 'react';
import dayjs from 'dayjs';
// Create SharedContext
export const SharedContext = createContext();

// SharedProvider component
export const SharedProvider = ({ children }) => {
    const [selectedCustomer, setSelectedCustomer] = useState(null);  // Shared customer state
    const [selectedVendor, setSelectedVendor] = useState(null);  // Shared Vendor state

    const [cartItemModalOpen, setCartItemModalOpen] = useState(false)
    const [selectedCartItem, setSelectedCartItem] = useState(null)
    const [selectedLabel, setSelectedLabel] = useState('');
    const [saleDate, setSaleDate] = useState(dayjs().format('YYYY-MM-DD'));

    const [orderType, setOrderType] = useState("dine_in"); // Add orderType state

    return (
        <SharedContext.Provider
            value={{
                selectedCustomer,
                setSelectedCustomer,
                selectedVendor,
                setSelectedVendor,
                cartItemModalOpen,
                setCartItemModalOpen,
                selectedCartItem,
                setSelectedCartItem,
                selectedLabel,
                setSelectedLabel,
                saleDate,
                setSaleDate,
                orderType, // Add orderType to context
                setOrderType // Add setOrderType to context
            }}
        >
            {children}
        </SharedContext.Provider>
    );
  };
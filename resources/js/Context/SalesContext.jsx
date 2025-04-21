import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import useCartBase from './useCartBase';
import { usePage } from "@inertiajs/react";

const SalesContext = createContext();

const SalesProvider = ({ children, cartType = 'sales_cart'}) => {
  const { orderTypes } = usePage().props;
  const { cartState, addToCart, removeFromCart, updateProductQuantity, emptyCart, updateCartItem, holdCart, setHeldCartToCart, removeHeldItem } = useCartBase(cartType);
  const [orderType, setOrderType] = useState(null);
  const [selectedOrderTypeObj, setSelectedOrderTypeObj] = useState(null);

  // Initialize orderType with the first available order type
  useEffect(() => {
    if (orderTypes && orderTypes.length > 0 && !orderType) {
      setOrderType(orderTypes[0].id.toString());
      setSelectedOrderTypeObj(orderTypes[0]);
    }
  }, [orderTypes]);

  // Update selectedOrderTypeObj when orderType changes
  useEffect(() => {
    if (orderTypes && orderType) {
      const selected = orderTypes.find(ot => ot.id.toString() === orderType.toString());
      if (selected) {
        setSelectedOrderTypeObj(selected);
      }
    }
  }, [orderType, orderTypes]);

  const { cartTotal, totalQuantity, totalProfit, taxes } = useMemo(() => {
    // First calculate the cart total
    const result = cartState.reduce(
      (acc, item) => {
        const quantity = parseFloat(item.quantity)
        const cost = parseFloat(item.cost)
        const discountedPrice = parseFloat(item.price) - parseFloat(item.discount);
        const itemTotal = discountedPrice * quantity;
        const itemProfit = (discountedPrice - cost) * quantity;

        acc.cartTotal += itemTotal;
        acc.totalQuantity += quantity;
        acc.totalProfit += itemProfit;

        return acc;
      },
      { cartTotal: 0, totalQuantity: 0, totalProfit: 0, taxes: [] }
    );
    
    // Calculate taxes based on the selected order type
    result.taxes = [];
    
    if (selectedOrderTypeObj && selectedOrderTypeObj.taxes) {
      result.taxes = selectedOrderTypeObj.taxes.map(tax => {
        const taxAmount = tax.type === 'percentage' 
          ? (result.cartTotal * (tax.rate / 100)) 
          : parseFloat(tax.rate);
          
        return {
          id: tax.id,
          name: tax.name,
          type: tax.type,
          rate: tax.rate,
          amount: taxAmount
        };
      });
    }
    
    return result;
  }, [cartState, selectedOrderTypeObj]);
  
  // Calculate total with taxes
  const totalWithTaxes = useMemo(() => {
    const taxTotal = taxes.reduce((sum, tax) => sum + tax.amount, 0);
    return cartTotal + taxTotal;
  }, [cartTotal, taxes]);

  return (
      <SalesContext.Provider
          value={{
              cartState,
              cartTotal,
              totalQuantity,
              totalProfit,
              taxes,
              totalWithTaxes,
              orderType,
              setOrderType,
              selectedOrderTypeObj,
              addToCart,
              removeFromCart,
              updateProductQuantity,
              emptyCart,
              updateCartItem,
              holdCart,
              setHeldCartToCart,
              removeHeldItem,
          }}
      >
          {children}
      </SalesContext.Provider>
  );
};

const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

export { SalesProvider, useSales };

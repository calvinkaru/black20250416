import React, { createContext, useContext, useMemo, useState } from 'react';
import useCartBase from './useCartBase';

const SalesContext = createContext();

const SalesProvider = ({ children, cartType = 'sales_cart'}) => {

  const { cartState, addToCart, removeFromCart, updateProductQuantity, emptyCart, updateCartItem, holdCart, setHeldCartToCart, removeHeldItem } = useCartBase(cartType);
  const [orderType, setOrderType] = useState("take_away");

  const { cartTotal, totalQuantity, totalProfit, dineInCharge } = useMemo(() => {
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
      { cartTotal: 0, totalQuantity: 0, totalProfit: 0 }
    );
    
    // Then calculate the dineInCharge based on the calculated cartTotal
    result.dineInCharge = orderType === "dine_in" ? result.cartTotal * 0.10 : 0;
    
    return result;
  }, [cartState, orderType]);

  return (
      <SalesContext.Provider
          value={{
              cartState,
              cartTotal,
              totalQuantity,
              totalProfit,
              dineInCharge,
              orderType,
              setOrderType,
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

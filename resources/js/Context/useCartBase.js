import { useReducer, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';

// Define a generic cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const cart = [...state];
      const existingProductIndex = cart.findIndex(
        (item) =>
          item.id === action.payload.id &&
          item.batch_number === action.payload.batch_number &&
          (item.product_type !== 'custom' && item.product_type !== 'reload')
      );
      if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity =
          parseFloat(cart[existingProductIndex].quantity) + 1;
      } else {
        const productToAdd = { ...action.payload, quantity: action.payload.quantity };
        cart.push(productToAdd);
      }
      return cart;
    }

    case 'REMOVE_FROM_CART': {
      const cart = [...state];
      cart.splice(action.payload.index, 1);
      return cart;
    }

    case 'UPDATE_PRODUCT_QUANTITY': {
      const cart = [...state];
      let existingProductIndex = action.payload.cart_index;

      if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity = action.payload.newQuantity;
        if (action.payload.newQuantity <= 0) {
          cart.splice(existingProductIndex, 1);
        }
      }

      return cart;
    }

    case 'UPDATE_CART_ITEM': {
      const cart = [...state];
      let existingProductIndex = action.payload.cart_index;
      if (action.payload.product_type != 'reload' && action.payload.product_type != "custom") {
        existingProductIndex = cart.findIndex(
          (item) =>
            item.id === action.payload.id &&
            item.batch_number === action.payload.batch_number
        );
      }
      
      if (existingProductIndex !== -1) {
        const updatedItem = {
          ...cart[existingProductIndex],
          ...action.payload,
        };

        cart[existingProductIndex] = updatedItem;

        // Remove item if quantity becomes 0 or negative
        if (updatedItem.quantity == 0) {
          cart.splice(existingProductIndex, 1);
        }
      }

      return cart;
    }

    case 'EMPTY_CART': {
      return [];
    }

    case 'HOLD_CART': {
      const heldCarts = JSON.parse(localStorage.getItem('heldCarts')) || {};
      const currentDateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const newKey = currentDateTime; // Unique key for the held cart
      
      // Store cart items along with customer info if provided
      heldCarts[newKey] = {
        items: [...state],
        customerInfo: action.payload?.customerInfo || null
      };
      
      localStorage.setItem('heldCarts', JSON.stringify(heldCarts));
      return []; // Clear the current cart state
    }

    case 'SET_HELD_CART_TO_CART': {
      return [...action.payload.cart];
    }

    default:
      return state;
  }
};

// Custom hook for cart logic, common for both sales and purchase contexts
// State key can be both purchase_cart or sales_cart
const useCartBase = (initialStateKey) => {
  const persistedState = localStorage.getItem(initialStateKey);
  const [cartState, dispatch] = useReducer(cartReducer, persistedState ? JSON.parse(persistedState) : []);

  const addToCart = (item, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...item, quantity } });
  };

  const removeFromCart = (index) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { index }, // product should contain at least id and batch_number
    });
  };

  const updateProductQuantity = (itemId, batchNumber, newQuantity, cart_index) => {
    dispatch({
      type: 'UPDATE_PRODUCT_QUANTITY',
      payload: { id: itemId, batch_number: batchNumber, newQuantity, cart_index },
    });
  };

  const updateCartItem = (item) => {
    dispatch({
      type: 'UPDATE_CART_ITEM',
      payload: item,
    });
  };

  const holdCart = (customerInfo = null) => {
    dispatch({ type: 'HOLD_CART', payload: { customerInfo } });
  };

  const emptyCart = () => {
    dispatch({ type: 'EMPTY_CART' });
  };


  // Set a held cart as the current cart by retrieving the cart items using a key
  const setHeldCartToCart = (key) => {
    const heldCarts = JSON.parse(localStorage.getItem('heldCarts')) || {};
    const heldCart = heldCarts[key];
    
    // Check if the held cart exists and has the new structure
    if (heldCart && heldCart.items) {
      // Set the current cart to the retrieved cart items
      dispatch({ type: 'SET_HELD_CART_TO_CART', payload: { cart: heldCart.items } });
      
      // Return customer info if available
      const customerInfo = heldCart.customerInfo;
      
      // Remove the held cart from localStorage
      delete heldCarts[key];
      localStorage.setItem('heldCarts', JSON.stringify(heldCarts));
      
      return customerInfo;
    } 
    // Handle legacy format (before we added customer info)
    else if (Array.isArray(heldCart) && heldCart.length > 0) {
      // Set the current cart to the retrieved cart
      dispatch({ type: 'SET_HELD_CART_TO_CART', payload: { cart: heldCart } });
      
      // Remove the held cart from localStorage
      delete heldCarts[key];
      localStorage.setItem('heldCarts', JSON.stringify(heldCarts));
      
      return null;
    }
    
    return null;
  };

  const removeHeldItem = (key) => {
    const heldCarts = JSON.parse(localStorage.getItem('heldCarts')) || {};
    delete heldCarts[key];
    localStorage.setItem('heldCarts', JSON.stringify(heldCarts));
  };

  useEffect(() => {
    localStorage.setItem(initialStateKey, JSON.stringify(cartState));
  }, [cartState, initialStateKey]);

  return { cartState, addToCart, removeFromCart, updateProductQuantity, emptyCart, updateCartItem, holdCart, setHeldCartToCart, removeHeldItem };
};

export default useCartBase;

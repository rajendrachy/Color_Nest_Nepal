import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(
    localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : []
  );

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Sync to backend if user is logged in
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
    if (userInfo && userInfo.token) {
      api.put('/auth/profile', { cart: cartItems }).catch(err => console.error('Failed to sync cart:', err));
    }
  }, [cartItems]);

  const addToCart = (product, quantity) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    if (existItem) {
      setCartItems(
        cartItems.map((x) =>
          x._id === existItem._id ? { ...existItem, quantity: existItem.quantity + quantity } : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity }]);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCartItems(
      cartItems.map((x) => (x._id === id ? { ...x, quantity: Number(quantity) } : x))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.pricePerLiter * item.quantity, 0);
  const vat = subtotal * 0.13;
  const total = subtotal + vat;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        vat,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { CartItem, Cart } from "./types"

interface CartContextType {
  cart: Cart
  addToCart: (item: Omit<CartItem, "quantity">, quantity: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  getCartItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalAmount: 0,
    totalItems: 0,
  })

  // 计算购物车总计
  const calculateTotals = (items: CartItem[]): { totalAmount: number; totalItems: number } => {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    return { totalAmount, totalItems }
  }

  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex((cartItem) => cartItem.productId === item.productId)

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        // 更新现有商品数量
        newItems = prevCart.items.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: Math.min(cartItem.quantity + quantity, cartItem.maxStock) }
            : cartItem,
        )
      } else {
        // 添加新商品
        newItems = [...prevCart.items, { ...item, quantity: Math.min(quantity, item.maxStock) }]
      }

      const { totalAmount, totalItems } = calculateTotals(newItems)
      return { items: newItems, totalAmount, totalItems }
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) => {
      const newItems = prevCart.items
        .map((item) =>
          item.productId === productId ? { ...item, quantity: Math.min(Math.max(0, quantity), item.maxStock) } : item,
        )
        .filter((item) => item.quantity > 0)

      const { totalAmount, totalItems } = calculateTotals(newItems)
      return { items: newItems, totalAmount, totalItems }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.productId !== productId)
      const { totalAmount, totalItems } = calculateTotals(newItems)
      return { items: newItems, totalAmount, totalItems }
    })
  }

  const clearCart = () => {
    setCart({ items: [], totalAmount: 0, totalItems: 0 })
  }

  const getCartItemCount = () => cart.totalItems

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

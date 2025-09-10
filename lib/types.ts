// 用户角色类型
export type UserRole = "admin" | "delivery" | "customer"

// 用户类型
export interface User {
  id: string
  username: string
  password: string
  role: UserRole
  name: string
  phone?: string
  address?: string
  communityId?: string // 配送员负责的社区ID，或用户所在社区ID
}

// 商品类型
export interface Product {
  id: string
  name: string
  category: string
  price: number
  unit: string
  stock: number
  description?: string
  image?: string
}

// 订单状态
export type OrderStatus = "pending" | "accepted" | "delivering" | "completed" | "cancelled"

// 订单项
export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

// 订单类型
export interface Order {
  id: string
  customerId: string
  customerName: string
  customerAddress: string
  customerPhone: string
  communityId: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  deliveryTime: string
  createdAt: string
  deliveryPersonId?: string
  deliveryPersonName?: string
}

// 社区类型
export interface Community {
  id: string
  name: string
  address: string
}

// 购物车项类型
export interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
  unit: string
  maxStock: number
}

// 购物车类型
export interface Cart {
  items: CartItem[]
  totalAmount: number
  totalItems: number
}

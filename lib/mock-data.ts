import type { User, Product, Order, Community } from "./types"

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "系统管理员",
    phone: "13800138000",
  },
  {
    id: "2",
    username: "delivery1",
    password: "delivery123",
    role: "delivery",
    name: "张配送",
    phone: "13800138001",
    communityId: "1",
  },
  {
    id: "3",
    username: "customer1",
    password: "customer123",
    role: "customer",
    name: "李用户",
    phone: "13800138002",
    address: "阳光社区1号楼101",
    communityId: "1",
  },
]

// 模拟社区数据
export const mockCommunities: Community[] = [
  {
    id: "1",
    name: "阳光社区",
    address: "北京市朝阳区阳光街道",
  },
  {
    id: "2",
    name: "绿园社区",
    address: "北京市海淀区绿园路",
  },
]

// 模拟商品数据
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "新鲜苹果",
    category: "水果",
    price: 8.5,
    unit: "斤",
    stock: 100,
    description: "红富士苹果，香甜可口",
  },
  {
    id: "2",
    name: "有机白菜",
    category: "蔬菜",
    price: 3.2,
    unit: "斤",
    stock: 50,
    description: "有机种植，绿色健康",
  },
  {
    id: "3",
    name: "草鸡蛋",
    category: "蛋类",
    price: 12.0,
    unit: "斤",
    stock: 30,
    description: "农家散养草鸡蛋",
  },
]

// 模拟订单数据
export const mockOrders: Order[] = [
  {
    id: "1",
    customerId: "3",
    customerName: "李用户",
    customerAddress: "阳光社区1号楼101",
    customerPhone: "13800138002",
    communityId: "1",
    items: [
      { productId: "1", productName: "新鲜苹果", quantity: 2, price: 8.5 },
      { productId: "2", productName: "有机白菜", quantity: 1, price: 3.2 },
    ],
    totalAmount: 20.2,
    status: "pending",
    deliveryTime: "2024-01-15 10:00",
    createdAt: "2024-01-14 15:30",
  },
]

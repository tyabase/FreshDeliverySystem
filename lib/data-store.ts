"use client"

import type { Product, Order, User, Community } from "./types"
import { mockProducts, mockOrders, mockUsers, mockCommunities } from "./mock-data"

// 库存变动记录类型
interface StockMovement {
  id: string
  productId: string
  productName: string
  type: "in" | "out" | "adjustment"
  quantity: number
  reason: string
  timestamp: string
  orderId?: string
  userId?: string
}

// 模拟数据存储类
class DataStore {
  private products: Product[] = [...mockProducts]
  private orders: Order[] = [...mockOrders]
  private users: User[] = [...mockUsers]
  private communities: Community[] = [...mockCommunities]
  private stockMovements: StockMovement[] = []

  // 商品相关方法
  getProducts(): Product[] {
    return this.products
  }

  getProduct(id: string): Product | undefined {
    return this.products.find((p) => p.id === id)
  }

  updateProduct(product: Product): void {
    const index = this.products.findIndex((p) => p.id === product.id)
    if (index !== -1) {
      const oldStock = this.products[index].stock
      this.products[index] = product

      // 记录库存调整
      if (oldStock !== product.stock) {
        this.recordStockMovement({
          productId: product.id,
          productName: product.name,
          type: "adjustment",
          quantity: product.stock - oldStock,
          reason: "管理员手动调整库存",
        })
      }
    }
  }

  addProduct(product: Product): void {
    this.products.push(product)

    // 记录初始库存
    if (product.stock > 0) {
      this.recordStockMovement({
        productId: product.id,
        productName: product.name,
        type: "in",
        quantity: product.stock,
        reason: "新商品入库",
      })
    }
  }

  deleteProduct(id: string): void {
    this.products = this.products.filter((p) => p.id !== id)
  }

  batchUpdateStock(updates: { productId: string; newStock: number; reason?: string }[]): {
    success: string[]
    failed: string[]
  } {
    const success: string[] = []
    const failed: string[] = []

    updates.forEach(({ productId, newStock, reason = "批量库存调整" }) => {
      const product = this.getProduct(productId)
      if (product && newStock >= 0) {
        const oldStock = product.stock
        product.stock = newStock
        success.push(productId)

        // 记录库存变动
        this.recordStockMovement({
          productId: product.id,
          productName: product.name,
          type: newStock > oldStock ? "in" : "out",
          quantity: Math.abs(newStock - oldStock),
          reason,
        })

        console.log(`[批量库存] 商品 ${product.name} 库存从 ${oldStock} 调整为 ${newStock}`)
      } else {
        failed.push(productId)
        console.warn(`[批量库存] 商品 ${productId} 调整失败`)
      }
    })

    return { success, failed }
  }

  getLowStockProducts(threshold = 10): Product[] {
    return this.products.filter((product) => product.stock > 0 && product.stock <= threshold)
  }

  getOutOfStockProducts(): Product[] {
    return this.products.filter((product) => product.stock === 0)
  }

  private recordStockMovement(movement: Omit<StockMovement, "id" | "timestamp">) {
    const stockMovement: StockMovement = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...movement,
    }
    this.stockMovements.push(stockMovement)
  }

  getStockMovements(productId?: string): StockMovement[] {
    if (productId) {
      return this.stockMovements.filter((movement) => movement.productId === productId)
    }
    return this.stockMovements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  // 订单相关方法
  getOrders(): Order[] {
    return this.orders
  }

  getOrder(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id)
  }

  getOrdersByCustomer(customerId: string): Order[] {
    return this.orders.filter((o) => o.customerId === customerId)
  }

  getOrdersByCommunity(communityId: string): Order[] {
    return this.orders.filter((o) => o.communityId === communityId)
  }

  getPendingOrdersByCommunity(communityId: string): Order[] {
    return this.orders.filter((o) => o.communityId === communityId && o.status === "pending")
  }

  getOrdersByDeliveryPerson(deliveryPersonId: string): Order[] {
    return this.orders.filter((o) => o.deliveryPersonId === deliveryPersonId)
  }

  acceptOrder(orderId: string, deliveryPersonId: string, deliveryPersonName: string): boolean {
    const order = this.getOrder(orderId)
    if (order && order.status === "pending") {
      order.status = "accepted"
      order.deliveryPersonId = deliveryPersonId
      order.deliveryPersonName = deliveryPersonName
      console.log(`[订单状态] 订单 ${orderId} 已被配送员 ${deliveryPersonName} 接单`)
      return true
    }
    console.warn(`[订单状态] 无法接单：订单 ${orderId} 状态为 ${order?.status || "不存在"}`)
    return false
  }

  startDelivery(orderId: string): boolean {
    const order = this.getOrder(orderId)
    if (order && order.status === "accepted") {
      order.status = "delivering"
      console.log(`[订单状态] 订单 ${orderId} 开始配送`)
      return true
    }
    console.warn(`[订单状态] 无法开始配送：订单 ${orderId} 状态为 ${order?.status || "不存在"}`)
    return false
  }

  completeDelivery(orderId: string): boolean {
    const order = this.getOrder(orderId)
    if (order && order.status === "delivering") {
      order.status = "completed"
      console.log(`[订单状态] 订单 ${orderId} 配送完成`)
      return true
    }
    console.warn(`[订单状态] 无法完成配送：订单 ${orderId} 状态为 ${order?.status || "不存在"}`)
    return false
  }

  confirmCancelOrder(orderId: string): boolean {
    const order = this.getOrder(orderId)
    if (order && order.status === "cancelled") {
      // 恢复库存
      order.items.forEach((item) => {
        const product = this.getProduct(item.productId)
        if (product) {
          product.stock += item.quantity

          // 记录库存恢复
          this.recordStockMovement({
            productId: product.id,
            productName: product.name,
            type: "in",
            quantity: item.quantity,
            reason: "订单取消库存恢复",
            orderId: order.id,
          })

          console.log(`[库存管理] 商品 ${product.name} 库存恢复 ${item.quantity}，当前库存：${product.stock}`)
        }
      })
      console.log(`[订单状态] 订单 ${orderId} 取消确认完成，库存已恢复`)
      return true
    }
    console.warn(`[订单状态] 无法确认取消：订单 ${orderId} 状态为 ${order?.status || "不存在"}`)
    return false
  }

  addOrder(order: Order): boolean {
    // 检查库存是否充足
    for (const item of order.items) {
      const product = this.getProduct(item.productId)
      if (!product) {
        console.error(`[订单创建] 商品 ${item.productId} 不存在`)
        return false
      }
      if (product.stock < item.quantity) {
        console.error(`[订单创建] 商品 ${product.name} 库存不足，需要 ${item.quantity}，当前库存 ${product.stock}`)
        return false
      }
    }

    // 减少库存
    order.items.forEach((item) => {
      const product = this.getProduct(item.productId)
      if (product) {
        product.stock -= item.quantity

        // 记录库存扣减
        this.recordStockMovement({
          productId: product.id,
          productName: product.name,
          type: "out",
          quantity: item.quantity,
          reason: "订单扣减库存",
          orderId: order.id,
          userId: order.customerId,
        })

        console.log(`[库存管理] 商品 ${product.name} 库存减少 ${item.quantity}，当前库存：${product.stock}`)
      }
    })

    // 设置初始状态
    order.status = "pending"
    this.orders.push(order)
    console.log(`[订单状态] 订单 ${order.id} 创建成功，状态：pending`)
    return true
  }

  updateOrder(order: Order): void {
    const index = this.orders.findIndex((o) => o.id === order.id)
    if (index !== -1) {
      this.orders[index] = order
      console.log(`[订单状态] 订单 ${order.id} 已更新`)
    }
  }

  cancelOrder(orderId: string): boolean {
    const order = this.getOrder(orderId)
    if (!order) {
      console.warn(`[订单状态] 订单 ${orderId} 不存在`)
      return false
    }

    // 只有待接单状态的订单可以被取消
    if (order.status !== "pending") {
      console.warn(`[订单状态] 订单 ${orderId} 状态为 ${order.status}，无法取消`)
      return false
    }

    order.status = "cancelled"

    // 恢复库存
    order.items.forEach((item) => {
      const product = this.getProduct(item.productId)
      if (product) {
        product.stock += item.quantity

        // 记录库存恢复
        this.recordStockMovement({
          productId: product.id,
          productName: product.name,
          type: "in",
          quantity: item.quantity,
          reason: "用户取消订单库存恢复",
          orderId: order.id,
          userId: order.customerId,
        })

        console.log(`[库存管理] 商品 ${product.name} 库存恢复 ${item.quantity}，当前库存：${product.stock}`)
      }
    })

    console.log(`[订单状态] 订单 ${orderId} 已取消，库存已恢复`)
    return true
  }

  getOrdersByStatus(status: string): Order[] {
    return this.orders.filter((o) => o.status === status)
  }

  getOrderStatusHistory(orderId: string): { status: string; timestamp: string }[] {
    // 模拟状态历史记录（实际应用中应该存储在数据库中）
    const order = this.getOrder(orderId)
    if (!order) return []

    const history = [{ status: "pending", timestamp: order.createdAt }]

    if (order.status !== "pending") {
      history.push({ status: order.status, timestamp: new Date().toISOString() })
    }

    return history
  }

  batchUpdateOrderStatus(orderIds: string[], newStatus: string): { success: string[]; failed: string[] } {
    const success: string[] = []
    const failed: string[] = []

    orderIds.forEach((orderId) => {
      const order = this.getOrder(orderId)
      if (order) {
        const oldStatus = order.status
        order.status = newStatus as any
        success.push(orderId)
        console.log(`[批量操作] 订单 ${orderId} 状态从 ${oldStatus} 更新为 ${newStatus}`)
      } else {
        failed.push(orderId)
        console.warn(`[批量操作] 订单 ${orderId} 不存在`)
      }
    })

    return { success, failed }
  }

  // 用户相关方法
  getUsers(): User[] {
    return this.users
  }

  getUser(id: string): User | undefined {
    return this.users.find((u) => u.id === id)
  }

  getUsersByRole(role: string): User[] {
    return this.users.filter((u) => u.role === role)
  }

  addUser(user: User): void {
    this.users.push(user)
  }

  updateUser(user: User): void {
    const index = this.users.findIndex((u) => u.id === user.id)
    if (index !== -1) {
      this.users[index] = user
    }
  }

  deleteUser(id: string): void {
    this.users = this.users.filter((u) => u.id !== id)
  }

  // 社区相关方法
  getCommunities(): Community[] {
    return this.communities
  }

  getCommunity(id: string): Community | undefined {
    return this.communities.find((c) => c.id === id)
  }

  addCommunity(community: Community): void {
    this.communities.push(community)
    console.log(`[社区管理] 社区 ${community.name} 已添加`)
  }

  updateCommunity(community: Community): void {
    const index = this.communities.findIndex((c) => c.id === community.id)
    if (index !== -1) {
      this.communities[index] = community
      console.log(`[社区管理] 社区 ${community.name} 已更新`)
    }
  }

  deleteCommunity(id: string): void {
    this.communities = this.communities.filter((c) => c.id !== id)
    console.log(`[社区管理] 社区 ${id} 已删除`)
  }

  getOrderStatistics() {
    const total = this.orders.length
    const pending = this.orders.filter((o) => o.status === "pending").length
    const accepted = this.orders.filter((o) => o.status === "accepted").length
    const delivering = this.orders.filter((o) => o.status === "delivering").length
    const completed = this.orders.filter((o) => o.status === "completed").length
    const cancelled = this.orders.filter((o) => o.status === "cancelled").length
    const totalAmount = this.orders.reduce((sum, order) => sum + order.totalAmount, 0)

    return {
      total,
      pending,
      accepted,
      delivering,
      completed,
      cancelled,
      totalAmount,
    }
  }

  getProductStatistics() {
    const total = this.products.length
    const inStock = this.products.filter((p) => p.stock > 0).length
    const outOfStock = this.products.filter((p) => p.stock === 0).length
    const lowStock = this.products.filter((p) => p.stock > 0 && p.stock < 10).length

    return {
      total,
      inStock,
      outOfStock,
      lowStock,
    }
  }
}

// 创建全局数据存储实例
export const dataStore = new DataStore()

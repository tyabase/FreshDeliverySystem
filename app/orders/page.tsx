"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { OrderStatusTracker } from "@/components/order-status-tracker"
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataStore } from "@/lib/data-store"
import type { Order, OrderStatus } from "@/lib/types"

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "customer")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      const userOrders = dataStore.getOrdersByCustomer(user.id)
      setOrders(userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
  }, [user])

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true
    return order.status === statusFilter
  })

  const handleCancelOrder = (orderId: string) => {
    if (confirm("确定要取消这个订单吗？")) {
      if (dataStore.cancelOrder(orderId)) {
        const userOrders = dataStore.getOrdersByCustomer(user!.id)
        setOrders(userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      }
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">待接单</Badge>
      case "accepted":
        return <Badge variant="default">已接单</Badge>
      case "delivering":
        return <Badge className="bg-blue-600">配送中</Badge>
      case "completed":
        return <Badge className="bg-green-600">已完成</Badge>
      case "cancelled":
        return <Badge variant="destructive">已取消</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "accepted":
        return <Package className="h-4 w-4" />
      case "delivering":
        return <Truck className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const canCancelOrder = (order: Order) => {
    return order.status === "pending"
  }

  // 统计数据
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const deliveringOrders = orders.filter((o) => o.status === "delivering").length

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  if (!user || user.role !== "customer") {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">我的订单</h2>
          <p className="text-muted-foreground">查看您的订单历史和配送状态</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总订单数</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">历史订单总数</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待处理</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">等待接单</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">配送中</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveringOrders}</div>
              <p className="text-xs text-muted-foreground">正在配送</p>
            </CardContent>
          </Card>
        </div>

        {/* 订单列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>订单列表</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有订单</SelectItem>
                  <SelectItem value="pending">待接单</SelectItem>
                  <SelectItem value="accepted">已接单</SelectItem>
                  <SelectItem value="delivering">配送中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无订单</h3>
                <p className="text-muted-foreground mb-4">您还没有任何订单记录</p>
                <Button onClick={() => router.push("/shop")} className="bg-green-600 hover:bg-green-700">
                  去购物
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>商品数量</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>配送时间</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>配送员</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.items.length} 种商品</TableCell>
                      <TableCell>¥{order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{order.deliveryTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </TableCell>
                      <TableCell>{order.deliveryPersonName || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                详情
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>订单详情 #{selectedOrder?.id}</DialogTitle>
                                <DialogDescription>查看订单的详细信息和配送状态</DialogDescription>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-6">
                                  <OrderStatusTracker
                                    currentStatus={selectedOrder.status}
                                    createdAt={selectedOrder.createdAt}
                                    deliveryTime={selectedOrder.deliveryTime}
                                    deliveryPersonName={selectedOrder.deliveryPersonName}
                                  />

                                  <div>
                                    <h4 className="font-medium mb-2">商品清单</h4>
                                    <div className="space-y-2">
                                      {selectedOrder.items.map((item, index) => (
                                        <div
                                          key={index}
                                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                        >
                                          <span className="text-sm">{item.productName}</span>
                                          <span className="text-sm">
                                            {item.quantity} × ¥{item.price.toFixed(2)} = ¥
                                            {(item.quantity * item.price).toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                                      <span className="font-medium">总计</span>
                                      <span className="font-bold text-green-600">
                                        ¥{selectedOrder.totalAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          {canCancelOrder(order) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              取消订单
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

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
import { Package, Clock, Truck, CheckCircle, XCircle, MapPin, Phone } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataStore } from "@/lib/data-store"
import type { Order, OrderStatus } from "@/lib/types"

export default function DeliveryOrdersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "delivery")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && user.communityId) {
      // 获取配送员负责社区的所有订单
      const communityOrders = dataStore.getOrdersByCommunity(user.communityId)
      const myOrders = dataStore.getOrdersByDeliveryPerson(user.id)

      // 合并待配送订单和配送员已接单的订单
      const allRelevantOrders = [...communityOrders.filter((order) => order.status === "pending"), ...myOrders]

      // 去重
      const uniqueOrders = allRelevantOrders.filter(
        (order, index, self) => index === self.findIndex((o) => o.id === order.id),
      )

      setOrders(uniqueOrders)
    }
  }, [user])

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true
    if (statusFilter === "available") return order.status === "pending"
    if (statusFilter === "my") return order.deliveryPersonId === user?.id
    return order.status === statusFilter
  })

  const handleAcceptOrder = (orderId: string) => {
    if (user && dataStore.acceptOrder(orderId, user.id, user.name)) {
      // 刷新订单列表
      const communityOrders = dataStore.getOrdersByCommunity(user.communityId!)
      const myOrders = dataStore.getOrdersByDeliveryPerson(user.id)
      const allRelevantOrders = [...communityOrders.filter((order) => order.status === "pending"), ...myOrders]
      const uniqueOrders = allRelevantOrders.filter(
        (order, index, self) => index === self.findIndex((o) => o.id === order.id),
      )
      setOrders(uniqueOrders)
    }
  }

  const handleStartDelivery = (orderId: string) => {
    if (dataStore.startDelivery(orderId)) {
      const myOrders = dataStore.getOrdersByDeliveryPerson(user!.id)
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: "delivering" as OrderStatus } : order)),
      )
    }
  }

  const handleCompleteDelivery = (orderId: string) => {
    if (dataStore.completeDelivery(orderId)) {
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: "completed" as OrderStatus } : order)),
      )
    }
  }

  const handleConfirmCancel = (orderId: string) => {
    if (dataStore.confirmCancelOrder(orderId)) {
      // 刷新订单列表
      const communityOrders = dataStore.getOrdersByCommunity(user!.communityId!)
      const myOrders = dataStore.getOrdersByDeliveryPerson(user!.id)
      const allRelevantOrders = [...communityOrders.filter((order) => order.status === "pending"), ...myOrders]
      const uniqueOrders = allRelevantOrders.filter(
        (order, index, self) => index === self.findIndex((o) => o.id === order.id),
      )
      setOrders(uniqueOrders)
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

  const getActionButton = (order: Order) => {
    if (order.status === "pending" && !order.deliveryPersonId) {
      return (
        <Button size="sm" onClick={() => handleAcceptOrder(order.id)} className="bg-green-600 hover:bg-green-700">
          <Package className="h-4 w-4 mr-1" />
          接单
        </Button>
      )
    }

    if (order.status === "accepted" && order.deliveryPersonId === user?.id) {
      return (
        <Button size="sm" onClick={() => handleStartDelivery(order.id)} className="bg-blue-600 hover:bg-blue-700">
          <Truck className="h-4 w-4 mr-1" />
          开始配送
        </Button>
      )
    }

    if (order.status === "delivering" && order.deliveryPersonId === user?.id) {
      return (
        <Button size="sm" onClick={() => handleCompleteDelivery(order.id)} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-1" />
          确认签收
        </Button>
      )
    }

    if (order.status === "cancelled" && order.deliveryPersonId === user?.id) {
      return (
        <Button
          size="sm"
          onClick={() => handleConfirmCancel(order.id)}
          variant="outline"
          className="text-red-600 hover:text-red-700"
        >
          <XCircle className="h-4 w-4 mr-1" />
          确认取消
        </Button>
      )
    }

    return null
  }

  // 统计数据
  const pendingCount = orders.filter((o) => o.status === "pending").length
  const myOrdersCount = orders.filter((o) => o.deliveryPersonId === user?.id).length
  const deliveringCount = orders.filter((o) => o.status === "delivering" && o.deliveryPersonId === user?.id).length

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  if (!user || user.role !== "delivery") {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">配送订单</h2>
          <p className="text-muted-foreground">管理您负责社区的配送订单</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待接单</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">可接单数量</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">我的订单</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myOrdersCount}</div>
              <p className="text-xs text-muted-foreground">已接订单数</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">配送中</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveringCount}</div>
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
                  <SelectItem value="available">可接订单</SelectItem>
                  <SelectItem value="my">我的订单</SelectItem>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单号</TableHead>
                  <TableHead>客户信息</TableHead>
                  <TableHead>配送地址</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>配送时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {order.customerPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{order.customerAddress}</span>
                      </div>
                    </TableCell>
                    <TableCell>¥{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{order.deliveryTime}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              详情
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>订单详情 #{selectedOrder?.id}</DialogTitle>
                              <DialogDescription>查看订单的详细信息和商品清单</DialogDescription>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium">客户信息</h4>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.customerName}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">配送信息</h4>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.customerAddress}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.deliveryTime}</p>
                                  </div>
                                </div>
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
                                    <span className="font-bold">¥{selectedOrder.totalAmount.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {getActionButton(order)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

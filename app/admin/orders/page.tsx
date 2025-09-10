"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Calendar, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataStore } from "@/lib/data-store"
import type { Order, OrderStatus } from "@/lib/types"

export default function AdminOrdersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [communityFilter, setCommunityFilter] = useState<string>("all")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    setOrders(dataStore.getOrders())
  }, [])

  const communities = dataStore.getCommunities()

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesCommunity = communityFilter === "all" || order.communityId === communityFilter
    return matchesSearch && matchesStatus && matchesCommunity
  })

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

  // 统计数据
  const totalOrders = orders.length
  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const todayOrders = orders.filter((order) => {
    const today = new Date().toISOString().split("T")[0]
    return order.createdAt.startsWith(today)
  }).length

  // 按社区统计
  const communityStats = communities.map((community) => {
    const communityOrders = orders.filter((order) => order.communityId === community.id)
    return {
      name: community.name,
      orderCount: communityOrders.length,
      totalAmount: communityOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    }
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">订单管理</h2>
          <p className="text-muted-foreground">查看和管理所有配送订单</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总订单数</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">累计订单总数</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总交易额</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">累计交易金额</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日订单</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayOrders}</div>
              <p className="text-xs text-muted-foreground">今天新增订单</p>
            </CardContent>
          </Card>
        </div>

        {/* 社区统计 */}
        <Card>
          <CardHeader>
            <CardTitle>社区订单统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communityStats.map((stat) => (
                <div key={stat.name} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{stat.name}</h4>
                    <p className="text-sm text-muted-foreground">订单数: {stat.orderCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">¥{stat.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">交易额</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 订单列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>订单列表</CardTitle>
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="pending">待接单</SelectItem>
                    <SelectItem value="accepted">已接单</SelectItem>
                    <SelectItem value="delivering">配送中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={communityFilter} onValueChange={setCommunityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有社区</SelectItem>
                    {communities.map((community) => (
                      <SelectItem key={community.id} value={community.id}>
                        {community.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索订单..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>社区</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>配送时间</TableHead>
                  <TableHead>配送员</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{communities.find((c) => c.id === order.communityId)?.name || "-"}</TableCell>
                    <TableCell>¥{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{order.deliveryTime}</TableCell>
                    <TableCell>{order.deliveryPersonName || "-"}</TableCell>
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

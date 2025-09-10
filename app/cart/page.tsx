"use client"

import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Plus, Minus, Trash2, Calendar, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataStore } from "@/lib/data-store"
import type { Order, OrderItem } from "@/lib/types"

export default function CartPage() {
  const { user, isLoading } = useAuth()
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const router = useRouter()
  const [deliveryTime, setDeliveryTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stockErrors, setStockErrors] = useState<string[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "customer")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const errors: string[] = []
    cart.items.forEach((item) => {
      const product = dataStore.getProduct(item.productId)
      if (!product) {
        errors.push(`商品 ${item.productName} 已下架`)
      } else if (product.stock < item.quantity) {
        errors.push(`商品 ${item.productName} 库存不足，当前库存：${product.stock}，购物车数量：${item.quantity}`)
      }
    })
    setStockErrors(errors)
  }, [cart.items])

  // 生成配送时间选项（明天到后天，每2小时一个时段）
  const generateDeliveryTimeOptions = () => {
    const options = []
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    for (let day = 0; day < 2; day++) {
      const date = new Date(tomorrow)
      date.setDate(date.getDate() + day)
      const dateStr = date.toISOString().split("T")[0]

      for (let hour = 8; hour < 20; hour += 2) {
        const timeStr = `${hour.toString().padStart(2, "0")}:00`
        const label = `${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`
        options.push({ value: `${dateStr} ${timeStr}`, label })
      }
    }
    return options
  }

  const deliveryTimeOptions = generateDeliveryTimeOptions()

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = dataStore.getProduct(productId)
    if (product && newQuantity <= product.stock) {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleSubmitOrder = async () => {
    if (!user || !deliveryTime || cart.items.length === 0 || stockErrors.length > 0) return

    setIsSubmitting(true)

    try {
      const orderItems: OrderItem[] = cart.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      }))

      const order: Order = {
        id: Date.now().toString(),
        customerId: user.id,
        customerName: user.name,
        customerAddress: user.address || "未设置地址",
        customerPhone: user.phone || "未设置电话",
        communityId: user.communityId || "1",
        items: orderItems,
        totalAmount: cart.totalAmount,
        status: "pending",
        deliveryTime,
        createdAt: new Date().toISOString(),
      }

      const success = dataStore.addOrder(order)
      if (success) {
        clearCart()
        router.push("/orders")
      } else {
        alert("订单提交失败，请检查商品库存")
      }
    } catch (error) {
      console.error("提交订单失败:", error)
      alert("订单提交失败，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  if (!user || user.role !== "customer") {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">购物车</h2>
            <p className="text-muted-foreground">确认您的订单信息</p>
          </div>
        </div>

        {stockErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">以下商品存在库存问题：</p>
                {stockErrors.map((error, index) => (
                  <p key={index} className="text-sm">
                    • {error}
                  </p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {cart.items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">购物车为空</h3>
              <p className="text-muted-foreground mb-4">去选购一些新鲜的商品吧！</p>
              <Button onClick={() => router.push("/shop")} className="bg-green-600 hover:bg-green-700">
                去购物
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 购物车商品列表 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>商品清单</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品</TableHead>
                        <TableHead>单价</TableHead>
                        <TableHead>数量</TableHead>
                        <TableHead>库存</TableHead>
                        <TableHead>小计</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.items.map((item) => {
                        const product = dataStore.getProduct(item.productId)
                        const currentStock = product?.stock || 0
                        const hasStockIssue = !product || currentStock < item.quantity

                        return (
                          <TableRow key={item.productId} className={hasStockIssue ? "bg-red-50" : ""}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">单位: {item.unit}</p>
                                {hasStockIssue && (
                                  <p className="text-sm text-red-600">{!product ? "商品已下架" : "库存不足"}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>¥{item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  disabled={!product || item.quantity >= currentStock}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={currentStock < item.quantity ? "text-red-600" : ""}>{currentStock}</span>
                            </TableCell>
                            <TableCell>¥{(item.price * item.quantity).toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCart(item.productId)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* 订单摘要和提交 */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>订单摘要</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>商品总数</span>
                      <span>{cart.totalItems} 件</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>总计</span>
                      <span className="text-green-600">¥{cart.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      配送时间
                    </Label>
                    <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择配送时间" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryTimeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>配送信息</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>收货人: {user.name}</p>
                      <p>电话: {user.phone || "未设置"}</p>
                      <p>地址: {user.address || "未设置"}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitOrder}
                    disabled={!deliveryTime || isSubmitting || stockErrors.length > 0}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? "提交中..." : stockErrors.length > 0 ? "存在库存问题" : "提交订单"}
                  </Button>

                  <Button variant="outline" onClick={() => router.push("/shop")} className="w-full">
                    继续购物
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

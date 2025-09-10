"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Package, TrendingDown, TrendingUp, History, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataStore } from "@/lib/data-store"
import type { Product } from "@/lib/types"

export default function AdminInventoryPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [stockMovements, setStockMovements] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState({
    newStock: "",
    reason: "",
  })
  const [viewMode, setViewMode] = useState<"overview" | "movements">("overview")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    setProducts(dataStore.getProducts())
    setStockMovements(dataStore.getStockMovements())
  }, [])

  const lowStockProducts = dataStore.getLowStockProducts(10)
  const outOfStockProducts = dataStore.getOutOfStockProducts()

  const handleStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    const newStock = Number.parseInt(adjustmentData.newStock)
    if (isNaN(newStock) || newStock < 0) return

    const updates = [
      {
        productId: selectedProduct.id,
        newStock,
        reason: adjustmentData.reason || "管理员库存调整",
      },
    ]

    dataStore.batchUpdateStock(updates)
    setProducts(dataStore.getProducts())
    setStockMovements(dataStore.getStockMovements())
    setIsAdjustDialogOpen(false)
    setAdjustmentData({ newStock: "", reason: "" })
    setSelectedProduct(null)
  }

  const openAdjustDialog = (product: Product) => {
    setSelectedProduct(product)
    setAdjustmentData({
      newStock: product.stock.toString(),
      reason: "",
    })
    setIsAdjustDialogOpen(true)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">缺货</Badge>
    } else if (stock <= 10) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          库存不足
        </Badge>
      )
    } else {
      return <Badge variant="default">正常</Badge>
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "out":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "adjustment":
        return <Edit className="h-4 w-4 text-blue-600" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "in":
        return <Badge className="bg-green-600">入库</Badge>
      case "out":
        return <Badge className="bg-red-600">出库</Badge>
      case "adjustment":
        return <Badge className="bg-blue-600">调整</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

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
          <h2 className="text-3xl font-bold tracking-tight">库存管理</h2>
          <p className="text-muted-foreground">监控和管理商品库存状态</p>
        </div>

        {/* 库存统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总商品数</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">系统中的商品总数</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">库存不足</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
              <p className="text-xs text-muted-foreground">库存 ≤ 10 的商品</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">缺货商品</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
              <p className="text-xs text-muted-foreground">库存为 0 的商品</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">库存变动</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockMovements.length}</div>
              <p className="text-xs text-muted-foreground">今日库存变动记录</p>
            </CardContent>
          </Card>
        </div>

        {/* 视图切换 */}
        <div className="flex items-center gap-4">
          <Button variant={viewMode === "overview" ? "default" : "outline"} onClick={() => setViewMode("overview")}>
            库存概览
          </Button>
          <Button variant={viewMode === "movements" ? "default" : "outline"} onClick={() => setViewMode("movements")}>
            库存变动记录
          </Button>
        </div>

        {viewMode === "overview" ? (
          <>
            {/* 库存预警 */}
            {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    库存预警
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {outOfStockProducts.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">缺货商品 ({outOfStockProducts.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {outOfStockProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200"
                            >
                              <span className="text-sm font-medium">{product.name}</span>
                              <Button size="sm" onClick={() => openAdjustDialog(product)}>
                                补货
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {lowStockProducts.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-600 mb-2">库存不足 ({lowStockProducts.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {lowStockProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200"
                            >
                              <span className="text-sm">
                                {product.name} (剩余: {product.stock})
                              </span>
                              <Button size="sm" variant="outline" onClick={() => openAdjustDialog(product)}>
                                调整
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 库存列表 */}
            <Card>
              <CardHeader>
                <CardTitle>商品库存</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品名称</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>当前库存</TableHead>
                      <TableHead>单位</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="font-bold">{product.stock}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell>{getStockStatus(product.stock)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => openAdjustDialog(product)}>
                            <Edit className="h-4 w-4 mr-1" />
                            调整库存
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          /* 库存变动记录 */
          <Card>
            <CardHeader>
              <CardTitle>库存变动记录</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>商品</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>原因</TableHead>
                    <TableHead>订单号</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{new Date(movement.timestamp).toLocaleString("zh-CN")}</TableCell>
                      <TableCell className="font-medium">{movement.productName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          {getMovementBadge(movement.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={movement.type === "out" ? "text-red-600" : "text-green-600"}>
                          {movement.type === "out" ? "-" : "+"}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{movement.reason}</TableCell>
                      <TableCell>{movement.orderId ? `#${movement.orderId}` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* 库存调整对话框 */}
        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>调整库存</DialogTitle>
              <DialogDescription>调整 {selectedProduct?.name} 的库存数量</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleStockAdjustment}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currentStock" className="text-right">
                    当前库存
                  </Label>
                  <Input id="currentStock" value={selectedProduct?.stock || 0} disabled className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newStock" className="text-right">
                    新库存
                  </Label>
                  <Input
                    id="newStock"
                    type="number"
                    min="0"
                    value={adjustmentData.newStock}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, newStock: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">
                    调整原因
                  </Label>
                  <Input
                    id="reason"
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                    className="col-span-3"
                    placeholder="请输入调整原因"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  确认调整
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

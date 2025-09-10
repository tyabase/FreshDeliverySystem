"use client"

import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Plus, Minus } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataStore } from "@/lib/data-store"
import type { Product } from "@/lib/types"

export default function ShopPage() {
  const { user, isLoading } = useAuth()
  const { addToCart, cart } = useCart()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "customer")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    setProducts(dataStore.getProducts())
  }, [])

  const categories = Array.from(new Set(products.map((p) => p.category)))

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleQuantityChange = (productId: string, change: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const currentQuantity = quantities[productId] || 1
    const newQuantity = Math.max(1, Math.min(currentQuantity + change, product.stock))
    setQuantities({ ...quantities, [productId]: newQuantity })
  }

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1
    addToCart(
      {
        productId: product.id,
        productName: product.name,
        price: product.price,
        unit: product.unit,
        maxStock: product.stock,
      },
      quantity,
    )
    // 重置数量选择器
    setQuantities({ ...quantities, [product.id]: 1 })
  }

  const getCartItemQuantity = (productId: string) => {
    const cartItem = cart.items.find((item) => item.productId === productId)
    return cartItem ? cartItem.quantity : 0
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">商品购买</h2>
            <p className="text-muted-foreground">选择新鲜优质的生鲜商品</p>
          </div>
          <Button onClick={() => router.push("/cart")} className="bg-green-600 hover:bg-green-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            购物车 ({cart.totalItems})
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索商品..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分类</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 商品网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const quantity = quantities[product.id] || 1
            const cartQuantity = getCartItemQuantity(product.id)
            const isOutOfStock = product.stock === 0
            const remainingStock = product.stock - cartQuantity

            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                  <div className="text-4xl">
                    {product.category === "水果" && "🍎"}
                    {product.category === "蔬菜" && "🥬"}
                    {product.category === "蛋类" && "🥚"}
                    {!["水果", "蔬菜", "蛋类"].includes(product.category) && "📦"}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge variant={isOutOfStock ? "destructive" : "default"}>
                      {isOutOfStock ? "缺货" : `库存 ${remainingStock}`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">¥{product.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">/{product.unit}</span>
                  </div>

                  {cartQuantity > 0 && (
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      购物车中已有 {cartQuantity} {product.unit}
                    </div>
                  )}

                  {!isOutOfStock && remainingStock > 0 && (
                    <>
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(product.id, -1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(product.id, 1)}
                          disabled={quantity >= remainingStock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={quantity > remainingStock}
                      >
                        加入购物车
                      </Button>
                    </>
                  )}

                  {(isOutOfStock || remainingStock <= 0) && (
                    <Button disabled className="w-full">
                      {isOutOfStock ? "商品缺货" : "库存不足"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">没有找到匹配的商品</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

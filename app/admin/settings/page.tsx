"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataStore } from "@/lib/data-store"
import type { Community } from "@/lib/types"

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [communities, setCommunities] = useState<Community[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    setCommunities(dataStore.getCommunities())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const communityData: Community = {
      id: editingCommunity?.id || Date.now().toString(),
      name: formData.name,
      address: formData.address,
    }

    if (editingCommunity) {
      // 更新社区（这里需要在dataStore中添加updateCommunity方法）
      console.log("更新社区", communityData)
    } else {
      // 添加社区（这里需要在dataStore中添加addCommunity方法）
      console.log("添加社区", communityData)
    }

    setCommunities(dataStore.getCommunities())
    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (community: Community) => {
    setEditingCommunity(community)
    setFormData({
      name: community.name,
      address: community.address,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个社区吗？")) {
      // 删除社区（这里需要在dataStore中添加deleteCommunity方法）
      console.log("删除社区", id)
      setCommunities(dataStore.getCommunities())
    }
  }

  const resetForm = () => {
    setEditingCommunity(null)
    setFormData({
      name: "",
      address: "",
    })
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
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">系统设置</h2>
            <p className="text-muted-foreground">管理系统配置和基础数据</p>
          </div>
        </div>

        {/* 社区管理 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>社区管理</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    添加社区
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingCommunity ? "编辑社区" : "添加社区"}</DialogTitle>
                    <DialogDescription>{editingCommunity ? "修改社区信息" : "添加新的配送社区"}</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          社区名称
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">
                          社区地址
                        </Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="col-span-3"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        {editingCommunity ? "更新" : "添加"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>社区名称</TableHead>
                  <TableHead>地址</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communities.map((community) => (
                  <TableRow key={community.id}>
                    <TableCell className="font-medium">{community.name}</TableCell>
                    <TableCell>{community.address}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(community)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(community.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <CardTitle>系统信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">系统版本</h4>
                <p className="text-sm text-muted-foreground">v1.0.0</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">最后更新</h4>
                <p className="text-sm text-muted-foreground">2024-01-15</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">数据统计</h4>
                <p className="text-sm text-muted-foreground">
                  用户: {dataStore.getUsers().length} | 商品: {dataStore.getProducts().length} | 订单:{" "}
                  {dataStore.getOrders().length}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">系统状态</h4>
                <p className="text-sm text-green-600">运行正常</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

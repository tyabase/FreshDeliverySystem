"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataStore } from "@/lib/data-store"
import type { User, UserRole } from "@/lib/types"

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "customer" as UserRole,
    name: "",
    phone: "",
    address: "",
    communityId: "",
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    setUsers(dataStore.getUsers())
  }, [])

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const communities = dataStore.getCommunities()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const userData: User = {
      id: editingUser?.id || Date.now().toString(),
      username: formData.username,
      password: formData.password,
      role: formData.role,
      name: formData.name,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      communityId: formData.communityId || undefined,
    }

    if (editingUser) {
      dataStore.updateUser(userData)
    } else {
      dataStore.addUser(userData)
    }

    setUsers(dataStore.getUsers())
    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (editUser: User) => {
    setEditingUser(editUser)
    setFormData({
      username: editUser.username,
      password: editUser.password,
      role: editUser.role,
      name: editUser.name,
      phone: editUser.phone || "",
      address: editUser.address || "",
      communityId: editUser.communityId || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个用户吗？")) {
      dataStore.deleteUser(id)
      setUsers(dataStore.getUsers())
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setFormData({
      username: "",
      password: "",
      role: "customer",
      name: "",
      phone: "",
      address: "",
      communityId: "",
    })
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">管理员</Badge>
      case "delivery":
        return <Badge variant="secondary">配送员</Badge>
      case "customer":
        return <Badge variant="default">用户</Badge>
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">用户管理</h2>
            <p className="text-muted-foreground">管理系统中的所有用户账户</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                添加用户
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingUser ? "编辑用户" : "添加用户"}</DialogTitle>
                <DialogDescription>{editingUser ? "修改用户信息" : "创建新的用户账户"}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      用户名
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      密码
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      角色
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">用户</SelectItem>
                        <SelectItem value="delivery">配送员</SelectItem>
                        <SelectItem value="admin">管理员</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      姓名
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
                    <Label htmlFor="phone" className="text-right">
                      电话
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  {(formData.role === "customer" || formData.role === "delivery") && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">
                          地址
                        </Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="communityId" className="text-right">
                          社区
                        </Label>
                        <Select
                          value={formData.communityId}
                          onValueChange={(value) => setFormData({ ...formData, communityId: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="选择社区" />
                          </SelectTrigger>
                          <SelectContent>
                            {communities.map((community) => (
                              <SelectItem key={community.id} value={community.id}>
                                {community.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {editingUser ? "更新" : "添加"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>用户列表</CardTitle>
              <div className="flex items-center gap-4">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有角色</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="delivery">配送员</SelectItem>
                    <SelectItem value="customer">用户</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户..."
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
                  <TableHead>用户名</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>社区</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                    <TableCell>{u.phone || "-"}</TableCell>
                    <TableCell>
                      {u.communityId ? communities.find((c) => c.id === u.communityId)?.name || "-" : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(u)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(u.id)}
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
      </div>
    </DashboardLayout>
  )
}

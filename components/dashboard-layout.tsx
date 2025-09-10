"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Package, Truck, Users, ShoppingCart, BarChart3, Settings, Warehouse } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) {
    return null
  }

  const getRoleTitle = () => {
    switch (user.role) {
      case "admin":
        return "管理员控制台"
      case "delivery":
        return "配送员工作台"
      case "customer":
        return "用户购物中心"
      default:
        return "系统"
    }
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case "admin":
        return <Users className="h-5 w-5" />
      case "delivery":
        return <Truck className="h-5 w-5" />
      case "customer":
        return <ShoppingCart className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getNavigationItems = () => {
    switch (user.role) {
      case "admin":
        return [
          { href: "/dashboard", label: "概览", icon: BarChart3 },
          { href: "/admin/products", label: "商品管理", icon: Package },
          { href: "/admin/inventory", label: "库存管理", icon: Warehouse },
          { href: "/admin/users", label: "用户管理", icon: Users },
          { href: "/admin/orders", label: "订单管理", icon: ShoppingCart },
          { href: "/admin/settings", label: "系统设置", icon: Settings },
        ]
      case "delivery":
        return [
          { href: "/dashboard", label: "工作台", icon: BarChart3 },
          { href: "/delivery/orders", label: "配送订单", icon: Package },
        ]
      case "customer":
        return [
          { href: "/dashboard", label: "首页", icon: BarChart3 },
          { href: "/shop", label: "商品购买", icon: ShoppingCart },
          { href: "/orders", label: "我的订单", icon: Package },
        ]
      default:
        return []
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {getRoleIcon()}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{getRoleTitle()}</h1>
                <p className="text-sm text-gray-500">欢迎，{user.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="flex items-center gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {navigationItems.length > 0 && (
          <nav className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
            <div className="p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-green-100 text-green-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  )
}

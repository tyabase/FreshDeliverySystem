"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react"
import type { OrderStatus } from "@/lib/types"

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus
  createdAt: string
  deliveryTime?: string
  deliveryPersonName?: string
}

export function OrderStatusTracker({
  currentStatus,
  createdAt,
  deliveryTime,
  deliveryPersonName,
}: OrderStatusTrackerProps) {
  const statusSteps = [
    { key: "pending", label: "待接单", icon: Clock, description: "等待配送员接单" },
    { key: "accepted", label: "已接单", icon: Package, description: "配送员已接单" },
    { key: "delivering", label: "配送中", icon: Truck, description: "正在配送途中" },
    { key: "completed", label: "已完成", icon: CheckCircle, description: "配送完成" },
  ]

  const getStatusIndex = (status: OrderStatus) => {
    const index = statusSteps.findIndex((step) => step.key === status)
    return index === -1 ? 0 : index
  }

  const currentIndex = getStatusIndex(currentStatus)
  const isCancelled = currentStatus === "cancelled"

  if (isCancelled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            订单状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">已取消</Badge>
            <span className="text-sm text-muted-foreground">订单已被取消</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>订单状态</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusSteps.map((step, index) => {
            const Icon = step.icon
            const isActive = index <= currentIndex
            const isCurrent = index === currentIndex

            return (
              <div key={step.key} className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isActive
                      ? "bg-green-100 border-green-500 text-green-700"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isActive ? "text-green-700" : "text-gray-400"}`}>{step.label}</span>
                    {isCurrent && (
                      <Badge variant="default" className="bg-green-600">
                        当前状态
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${isActive ? "text-gray-600" : "text-gray-400"}`}>{step.description}</p>
                  {step.key === "accepted" && deliveryPersonName && isActive && (
                    <p className="text-sm text-blue-600">配送员：{deliveryPersonName}</p>
                  )}
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`w-px h-8 ${isActive ? "bg-green-500" : "bg-gray-300"}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">下单时间</span>
            <span>{new Date(createdAt).toLocaleString("zh-CN")}</span>
          </div>
          {deliveryTime && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">预约配送时间</span>
              <span>{deliveryTime}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

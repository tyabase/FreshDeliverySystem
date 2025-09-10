# 📦 生鲜配送系统 (AcademicPerformanceManagementSystem)
## 🌟 项目简介

本项目是一个基于 Next.js + React + TailwindCSS 构建的现代化生鲜配送系统，旨在为用户提供便捷、高效的生鲜商品下单与配送服务。
系统支持商品浏览、购物车、下单、订单管理等功能，并结合数据可视化模块实现销售与配送情况的分析。

## 🚀 技术栈
前端框架：Next.js 14 + React 18
样式工具：TailwindCSS 4 + tailwind-animate
UI 组件：Radix UI、lucide-react、geist、cmdk
表单验证：react-hook-form + zod
数据可视化：Recharts
辅助工具：date-fns、react-day-picker、embla-carousel-react

## 📂 项目结构
.
├── package.json        # 项目配置文件
├── public/             # 静态资源
├── src/                # 源码目录
│   ├── app/            # Next.js 页面与路由
│   ├── components/     # 公共组件
│   ├── hooks/          # 自定义 Hook
│   ├── styles/         # 全局样式
│   └── utils/          # 工具函数
└── README.md           # 项目说明文件

## ⚙️ 本地运行
1. 克隆仓库
git clone https://github.com/tyabase/AcademicPerformanceManagementSystem.git
cd AcademicPerformanceManagementSystem
2. 安装依赖
npm install
 或者
yarn install
 或者
pnpm install
3. 启动开发环境
npm run dev
默认运行在： http://localhost:3000
4. 打包与部署
npm run build
npm start

## 🛠️ 可用脚本
npm run dev —— 启动开发环境
npm run build —— 构建生产环境
npm run start —— 启动生产环境服务
npm run lint —— 代码检查

## 📊 功能模块
✅ 用户注册与登录
✅ 商品展示与搜索
✅ 购物车与下单流程
✅ 配送信息管理
✅ 订单管理与状态跟踪
✅ 数据可视化（销售额、配送效率、用户活跃度等）

## 📜 License
本项目基于仓库中自带的 LICENSE 协议开源。

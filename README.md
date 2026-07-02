# Daily Meal Tracker 🍽️

基于 AI 识别的每日饮食记录与营养分析系统。用照片记录饮食，AI 精准识别食物并计算 13 项营养指标，提供搭配建议和健康预警。

## ✨ 核心功能

- **多图识别** — 每餐支持上传多张食物照片，AI 综合分析
- **13 项营养指标** — 能量、蛋白质、脂肪、碳水、膳食纤维、饱和脂肪、钠、钙、铁、维生素A/C、糖、胆固醇
- **AI 精准识别** — 基于《中国食物成分表》，识别菜名、食材、份量，计算营养成分
- **多人食识别** — AI 自动判断用餐人数，支持手动设置
- **搭配建议** — 每餐提供营养搭配建议和饮食结构调整建议
- **月日历记录** — 月历视图，按早/午/晚/加餐顺序展示，点击任意一天查看饮食详情
- **营养监控** — 本周/上周/本月/上月摄入监控，进度条对比中国膳食指南推荐量
- **健康预警** — 自动检测钠超标、蛋白质不足、膳食纤维偏低等问题
- **营养趋势** — 按月展示能量/蛋白质/脂肪/碳水/膳食纤维/钠趋势
- **膳食报告与导出** — 生成月度膳食报告，支持导出 CSV
- **AI 识别可编辑** — 识别结果可在线编辑后再保存，保证记录准确
- **离线能力** — 基础 PWA + 离线缓存，弱网仍可访问
- **自定义 AI** — 支持配置不同的 AI 服务和模型（GPT-4o、Claude 等）
- **亮暗主题** — 支持亮色/暗色主题切换，跟随系统偏好
- **用户管理** — 修改密码、查看账户信息
- **UI 优化** — 饮食展示面板减少嵌套，卡片更扁平、信息更紧凑

## 🛠️ 技术栈

| 组件 | 技术 |
|------|------|
| 前端框架 | Next.js 16 (App Router) |
| 样式 | Tailwind CSS v4 |
| 认证 + 数据库 | Supabase (Auth + PostgreSQL) |
| 文件存储 | Cloudflare R2 |
| AI 识别 | OpenAI 兼容视觉模型 |
| 部署平台 | Cloudflare Workers (OpenNext) |

## 🚀 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入真实的 Supabase、R2、AI 配置

# 3. 初始化数据库
# 在 Supabase SQL Editor 中依次执行 supabase/migrations/ 下的 SQL 文件

# 4. 启动开发服务器
npm run dev
```

## 📦 部署到 Cloudflare Workers

```bash
# 1. 配置 wrangler
cp wrangler.jsonc.example wrangler.jsonc
# 编辑 wrangler.jsonc 填入真实配置

# 2. 构建并部署
npm run build
npx @opennextjs/cloudflare build
npx wrangler deploy
```

## 📁 项目结构

```
src/
├── app/
│   ├── (auth)/          # 登录、注册页面
│   ├── (main)/          # 主应用（需认证）
│   │   ├── meals/       # 饮食记录上传
│   │   ├── settings/    # 设置页面
│   │   └── profile/     # 用户管理
│   ├── api/             # API 路由
│   │   ├── ai/          # AI 识别
│   │   ├── auth/        # 认证
│   │   ├── meals/       # 饮食记录 CRUD
│   │   ├── summary/     # 营养统计
│   │   ├── settings/    # 用户设置
│   │   └── upload/      # R2 文件上传
│   ├── page.tsx         # 首页（仪表盘 / 落地页）
│   └── layout.tsx       # 根布局
├── components/          # 共享组件
│   ├── layout/          # 导航栏、认证守卫
│   ├── meals/           # 饮食卡片
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
└── lib/                 # 工具库
    ├── ai.ts            # AI 识别逻辑
    ├── supabase*.ts     # Supabase 客户端
    ├── r2.ts            # R2 存储
    └── env.ts           # 环境变量验证

supabase/
├── migrations/          # 数据库迁移文件
├── schema.sql           # 完整数据库架构
└── seed-test-user.sql   # 测试用户种子数据
```

## 📋 营养指标参考

基于《中国居民膳食营养素参考摄入量》（成人每日）：

| 指标 | 推荐量 |
|------|--------|
| 能量 | 2000 kcal |
| 蛋白质 | 65 g |
| 脂肪 | 60 g |
| 碳水化合物 | 300 g |
| 膳食纤维 | 25 g |
| 饱和脂肪 | ≤20 g |
| 钠 | ≤2000 mg |
| 钙 | 800 mg |
| 铁 | 15 mg |
| 维生素C | 100 mg |
| 维生素A | 800 μg |
| 糖 | ≤50 g |
| 胆固醇 | ≤300 mg |

## 📄 License

MIT

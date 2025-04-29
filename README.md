# 旅行行程规划网站

## 项目简介
这是一个基于 Cloudflare Pages + D1 数据库的旅行行程规划网站。用户可以查看详细的旅行行程，包括每日景点安排、交通方式、天气信息等。管理员可以通过后台动态更新行程信息。

## 技术栈
- 前端：HTML5 + CSS3 + JavaScript
- 后端：Cloudflare Workers + D1 数据库
- 部署：Cloudflare Pages
- 版本控制：Git + GitHub
- API：高德地图 API、Visual Crossing 天气 API

## 功能特性
- [x] 行程展示
  - 日程标签页切换
  - 景点列表显示
  - 地图标记和路线
  - 实时天气信息
- [x] 地图功能
  - 景点标记
  - 路线规划
  - 信息窗口
- [x] 天气功能
  - 多源天气数据
  - 天气图标显示
- [ ] 数据管理（开发中）
  - D1 数据库集成
  - 后台管理界面
  - 实时数据更新

## 项目改造计划

### 第一阶段：代码版本控制
1. 初始化 Git 仓库
2. 创建 GitHub 仓库
3. 配置 .gitignore
4. 提交初始代码

### 第二阶段：数据库迁移
1. 创建 D1 数据库
2. 设计数据表结构
   - trips（行程表）
   - daily_schedule（日程表）
   - spots（景点表）
   - spot_links（景点链接表）
3. 编写数据迁移工具
4. 测试数据迁移

### 第三阶段：API 开发
1. 创建 Cloudflare Workers 项目
2. 实现 API 端点
   - 行程管理 API
   - 日程管理 API
   - 景点管理 API
3. 添加错误处理
4. 实现数据验证

### 第四阶段：前端适配
1. 修改数据获取方式
2. 更新管理界面
3. 添加错误提示
4. 优化用户体验

### 第五阶段：自动化部署
1. 配置 Cloudflare Pages
2. 设置环境变量
3. 配置数据库绑定
4. 测试自动部署

### 第六阶段：优化和安全
1. 添加访问控制
2. 实现数据备份
3. 优化性能
4. 完善错误处理

## 开发环境设置
1. 安装必要工具：
```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录到 Cloudflare
wrangler login
```

2. 克隆代码库：
```bash
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名
```

3. 安装依赖：
```bash
npm install
```

## 部署流程
1. 提交代码到 GitHub
2. 自动触发 Cloudflare Pages 构建
3. 自动部署到生产环境

## 开发规范
1. 代码提交
   - 使用清晰的 commit 信息
   - 遵循分支管理策略
   - 提交前进行代码审查

2. 分支管理
   - main：主分支，用于生产环境
   - feature/*：功能分支
   - hotfix/*：紧急修复分支

3. 代码风格
   - 使用 JSDoc 注释
   - 保持代码整洁
   - 遵循 DRY 原则

## 注意事项
1. 不要将敏感信息提交到代码库
2. 定期备份数据库
3. 测试环境和生产环境使用不同的配置
4. 保持依赖包的更新

## 贡献指南
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证
MIT License

## 高德地图API

高德地图API密钥: e4ecf5c4ecbd7f9fc9a971affe1bf54e

## 功能特点

- 行程展示（按天查看）
- 地图交互（点击地点在地图上显示）
- 多媒体内容（视频链接）
- 响应式设计

### 高德地图API
- **web服务 Key**: `e4ecf5c4ecbd7f9fc9a971affe1bf54e`
- **Web端(JS API) Key**: `09bcdeabf70a1f466cbf766750c244bf`
- **Web端(JS API) 安全密钥**: `da122353acc05b7515f2c34dcdd5a753`

### 高德开发者文档参考：
- **Web JS API**: https://lbs.amap.com/api/javascript-api/summary/
- **Web服务API**: https://lbs.amap.com/api/webservice/summary/ 

## 项目配置信息

### 代码仓库
- GitHub 仓库地址: https://github.com/icescat/travel
- 主分支: main

### Cloudflare 配置
- 账号: Icescat@gmail.com
- Pages 项目名称: travel
- D1 数据库名称: travel

> ⚠️ **安全提示**：以下信息应该保存在环境变量中，这里仅作记录用途：
> - Cloudflare 账户 ID
> - Cloudflare API 令牌
> - D1 数据库 ID
> - 各类 API 密钥

### 环境变量设置说明
在项目根目录创建 `.env` 文件（不要提交到 Git），包含以下配置：
```env
# Cloudflare 配置
CF_ACCOUNT_ID=637eb70009bb4aebc9532dc6da1236b3
CF_API_TOKEN=Tw1LHSeljG3qDKd78YIyXkUcm__dPSzsNE-NaKj0
CF_DB_ID=fb82de14-c431-4374-83c1-f4e1dded87bf

# 高德地图 API（需要设置IP白名单和域名白名单）
AMAP_WEB_KEY=09bcdeabf70a1f466cbf766750c244bf
AMAP_WEB_SECRET=da122353acc05b7515f2c34dcdd5a753
AMAP_SERVICE_KEY=e4ecf5c4ecbd7f9fc9a971affe1bf54e

# Visual Crossing Weather API（待添加）
WEATHER_API_KEY=XLH73AM2QFGG57GMSMJGXGXEW
```

### 开发环境检查清单
- [x] GitHub 账号配置完成
- [x] Cloudflare 账号配置完成
- [x] D1 数据库创建完成
- [x] 高德地图 API 配置完成
- [x] Visual Crossing Weather API 配置完成
- [x] 自定义域名配置完成 (https://map.159731.xyz)
- [ ] 本地开发环境搭建待完成

## 安全性说明

为了保护项目的安全性，我们采取以下措施：

1. 环境变量
   - 所有敏感信息都存储在环境变量中
   - 开发环境使用 `.env` 文件
   - 生产环境使用 Cloudflare Pages 的环境变量设置

2. API 访问控制
   - 高德地图 API 设置了域名白名单
   - Cloudflare API 令牌设置了最小权限原则
   - D1 数据库只允许通过 Workers 访问

3. 代码安全
   - `.gitignore` 文件排除敏感配置
   - 定期更新依赖包
   - 代码提交前进行安全检查




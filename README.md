# 你画我猜游戏 (Draw & Guess Game)

一个实时多人在线的"你画我猜"游戏，支持创建房间、多人互动、实时绘画和聊天功能。

## 项目结构

```
draw/
├── client/        # React前端应用
├── server/        # Node.js后端服务器
├── docker-compose.yml  # Docker部署配置
└── package.json   # 项目依赖管理
```

## 技术栈

### 前端
- **React 18** - 用户界面库
- **Vite** - 现代前端构建工具
- **Socket.io-client** - 实时通信
- **React Router** - 路由管理

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web框架
- **Socket.io** - 实时通信服务器
- **Cors** - 跨域资源共享

### 部署
- **Docker** - 容器化部署
- **Docker Compose** - 服务编排

## 功能特性

- 🏠 创建和加入游戏房间
- 🎨 实时绘画功能
- 💬 聊天和猜词功能
- 🏆 积分系统和排行榜
- 🔄 多轮游戏自动轮换
- 📝 自定义词库支持
- 🐳 Docker一键部署

## 快速开始

### 开发环境

1. 克隆项目
```bash
git clone https://github.com/songzhearen/draw.git
cd draw
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
# 同时启动前端和后端
npm run dev

# 仅启动后端
npm run dev:server

# 仅启动前端
npm run dev:client
```

4. 访问应用
- 前端: http://localhost:5173
- 后端API: http://localhost:3001

### Docker部署

1. 确保已安装Docker和Docker Compose

2. 启动服务
```bash
docker-compose up -d
```

3. 访问应用
- 游戏: http://localhost
- 后端API: http://localhost:3001

## API文档

### 上传自定义词库
```
POST /api/words
Content-Type: application/json

{
  "roomId": "ABC123",
  "words": ["苹果", "香蕉", "大象", "飞机"]
}
```

## 游戏规则

1. 玩家创建或加入房间
2. 房间内至少需要2名玩家才能开始游戏
3. 每轮随机选择一名玩家作为画画者
4. 画画者从三个选项中选择一个词进行绘画
5. 其他玩家尝试猜出正确的词
6. 猜对的玩家和画画者都获得积分
7. 游戏默认进行3轮，每轮结束后轮换画画者
8. 游戏结束后显示最终排行榜

## 开发说明

- 前端使用Vite构建，支持热重载
- 后端使用nodemon实现自动重启
- 使用Socket.io实现实时通信
- 所有绘图数据通过WebSocket实时同步

## 项目配置

### 环境变量

后端支持以下环境变量：
- `PORT` - 服务器端口（默认：3001）

### Docker配置

- 服务器容器: 3001端口
- 前端容器: 80端口
- 使用自定义网络进行服务间通信

## 许可证

MIT License

# 你画我猜游戏 - Docker镜像构建指南

## 前提条件

1. 确保你的机器已经安装了Docker和Docker Compose
2. 确保你已经完成了项目的依赖安装和构建
3. 确保你有足够的磁盘空间来构建镜像

## 构建镜像的方法

### 方法一：分别构建前端和后端镜像

#### 1. 构建后端镜像

```bash
# 进入后端目录
cd server

# 构建后端镜像
docker build -t draw-guess-server:latest .

# 查看构建的镜像
docker images | grep draw-guess-server
```

#### 2. 构建前端镜像

```bash
# 进入前端目录
cd ../client

# 构建前端镜像
docker build -t draw-guess-client:latest .

# 查看构建的镜像
docker images | grep draw-guess-client
```

### 方法二：使用Docker Compose一次性构建所有镜像

```bash
# 回到项目根目录
cd ..

# 使用Docker Compose构建所有镜像
docker-compose build

# 查看构建的镜像
docker images | grep draw-guess
```

## 镜像标签管理

### 为镜像添加版本标签

```bash
# 为后端镜像添加版本标签
docker tag draw-guess-server:latest draw-guess-server:v1.0.0

# 为前端镜像添加版本标签
docker tag draw-guess-client:latest draw-guess-client:v1.0.0
```

### 推送镜像到Docker Hub

1. **登录Docker Hub**
   ```bash
   docker login
   ```

2. **为镜像添加仓库前缀**
   ```bash
   # 替换 your-dockerhub-username 为你的Docker Hub用户名
   docker tag draw-guess-server:latest your-dockerhub-username/draw-guess-server:latest
   docker tag draw-guess-client:latest your-dockerhub-username/draw-guess-client:latest
   ```

3. **推送镜像到Docker Hub**
   ```bash
   docker push your-dockerhub-username/draw-guess-server:latest
   docker push your-dockerhub-username/draw-guess-client:latest
   ```

## 运行构建好的镜像

### 运行单个镜像

#### 1. 运行后端镜像

```bash
docker run -d --name draw-guess-server -p 3001:3001 draw-guess-server:latest
```

#### 2. 运行前端镜像

```bash
docker run -d --name draw-guess-client -p 80:80 --link draw-guess-server:server draw-guess-client:latest
```

### 使用Docker Compose运行所有镜像

```bash
# 启动所有服务
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 清理镜像

### 删除单个镜像

```bash
# 删除后端镜像
docker rmi draw-guess-server:latest

# 删除前端镜像
docker rmi draw-guess-client:latest
```

### 删除所有相关镜像

```bash
docker images | grep draw-guess | awk '{print $3}' | xargs docker rmi
```

## 常见问题

### 1. 构建镜像时出现依赖安装失败

- 检查网络连接是否正常
- 尝试使用国内镜像源：
  ```bash
  # 构建后端时使用国内镜像
docker build --build-arg NPM_REGISTRY=https://registry.npmmirror.com -t draw-guess-server:latest .
  
  # 构建前端时使用国内镜像
docker build --build-arg NPM_REGISTRY=https://registry.npmmirror.com -t draw-guess-client:latest .
  ```

### 2. 镜像构建成功但运行失败

- 查看容器日志：`docker logs <container-name>`
- 检查端口是否被占用：`netstat -tuln | grep <port>`
- 检查环境变量是否正确设置

### 3. 推送镜像到Docker Hub失败

- 检查Docker Hub用户名和密码是否正确
- 检查网络连接是否正常
- 确保镜像标签格式正确

## 最佳实践

1. **使用多阶段构建**：已经在Dockerfile中实现，减小最终镜像大小
2. **使用固定版本的基础镜像**：避免因基础镜像更新导致构建失败
3. **合理使用.dockerignore文件**：排除不必要的文件，加速构建过程
4. **使用语义化版本控制**：便于管理和回滚
5. **定期清理旧镜像**：释放磁盘空间

---

**构建成功后，你就可以使用这些镜像在任何支持Docker的环境中部署你画我猜游戏了！**

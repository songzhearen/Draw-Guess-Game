# 使用官方 Node.js 20 Alpine 作为基础镜像
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 使用国内镜像源安装依赖
RUN npm config set registry https://registry.npmmirror.com && npm install

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 使用官方 Nginx 作为生产服务器
FROM nginx:alpine

# 复制构建好的文件到Nginx的html目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]

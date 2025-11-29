# 使用Node.js基础镜像
# 使用多阶段构建，先构建前端
FROM node:24.10.0 AS builder

# 设置工作目录
WORKDIR /app

# 复制所有package.json文件
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# 安装所有依赖
RUN npm install

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# 最终镜像，只包含必要的文件
FROM node:24.10.0

# 设置工作目录
WORKDIR /app

# 复制必要的文件
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "run", "start"]

# 使用官方 Node.js 20 Alpine 作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 使用国内镜像源安装依赖
RUN npm config set registry https://registry.npmmirror.com && npm install

# 复制源代码
COPY . .

# 暴露3001端口
EXPOSE 3001

# 启动服务器
CMD ["node", "index.js"]

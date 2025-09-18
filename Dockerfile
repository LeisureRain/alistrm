# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 运行阶段
FROM node:18-alpine

WORKDIR /app

# 声明环境变量（设置默认值）
ENV ALIST_SERVER_URL=""
ENV ALIST_USER_NAME="admin"
ENV ALIST_PASSWORD="your_password_here"
ENV PORT=5255
ENV SCAN_BASE_PATH="/"
ENV STRM_BASE_PATH=""

# 复制依赖文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 暴露端口（与PORT环境变量保持一致）
EXPOSE ${PORT}

# 启动命令
CMD ["node", "dist/main"]

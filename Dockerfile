# 使用Node.js官方的Docker镜像作为基础
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 将项目依赖文件复制到工作目录
COPY package.json yarn.lock ./

# 安装项目依赖
RUN yarn install --frozen-lockfile

# 全局安装 pm2
RUN yarn global add pm2

# 将整个项目复制到工作目录
COPY . .

# RUN npx prisma generate

# 编译
RUN yarn build

# 使用 pm2 运行应用程序
CMD ["pm2-runtime", "start", "yarn", "--", "start"]
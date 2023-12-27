FROM node:18.17.0-alpine AS base

WORKDIR /app

COPY package.json .
COPY yarn.lock .

# 安装项目依赖
RUN yarn --only=prod

# 将本地代码复制到容器内
COPY . .

# 编译TypeScript
RUN yarn build

# 运行应用
CMD ["yarn", "start"]
# 使用Node.js官方的Docker镜像作为基础
FROM node:20

# 设置工作目录
WORKDIR /app

# 将项目依赖文件复制到工作目录
COPY package.json yarn.lock ./

# 安装项目依赖
RUN yarn install --frozen-lockfile --ignore-scripts

# 将整个项目复制到工作目录
COPY . .

# 编译
RUN yarn build

# 运行应用程序
CMD [ "yarn", "start" ]
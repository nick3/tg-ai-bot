# 使用 devcontainer 进行开发
该项目配备了一个 devcontainer 配置，让您能够在一个已完全配置好的开发环境容器中启动项目。
## VS Code Dev Containers
[![Open in Dev Containers](https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/nick3/tg-ai-bot)

如果您已安装了 VS Code，只需点击上方按钮即可在 VS Code Dev Containers 中打开此项目。

欢迎查阅[Dev Containers 文档](https://code.visualstudio.com/docs/devcontainers/containers)，获取更多详细信息。


## Devcontainer 的优势
统一开发环境：通过使用开发容器，确保所有开发者在相同的环境中进行开发，从而降低“在我的机器上可以运行”类型的问题发生的可能性。

快速入门：新的开发者可以通过几个简单的步骤设置他们的开发环境，无需花费大量时间进行环境配置。

隔离：开发容器将项目与主机操作系统隔离，降低操作系统更新或其他应用程序安装对开发环境的影响可能性。

## Devcontainer 的不足之处
学习曲线：对于不熟悉 Docker 和 VS Code 的开发者来说，使用 devcontainers 可能会有一些挑战。

性能影响：虽然通常很小，但在 devcontainer 内运行的程序可能比直接在主机上运行的程序稍慢一些。
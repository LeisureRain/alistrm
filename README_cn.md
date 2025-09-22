# 工具说明文档
此工具可扫描 AList 文件，将其转换为 STRM 格式文件，同时提供这些文件的服务。

> **请注意**：该工具目前处于早期开发阶段。

- 中文 | [英文](./README.md)


## 待办事项（TODO）
- [x] 需支持配置 alistrm 服务端 URL（该 URL 供 Jellyfin 等媒体服务器使用）
- [x] 减小 Docker 镜像体积，采用 Alpine 版本的 Node 环境
- [ ] 开发 Web 界面（Web UI）
- [ ] 增加登录验证功能
- [ ] 支持扫描指定文件夹
- [ ] 实现定时扫描（Cron 扫描）
- [ ] 开发增量扫描功能


## 接口（API）
```javascript
// 重新扫描所有 AList 文件
/scanner/rescan
```
## 功能特性
1. 需要与 AList 配合使用
2. 扫描 AList 的文件夹结构，将所有文件转换为 .strm 文件，并保留原文件夹结构（便于 nas-tool 等工具进行元数据刮削）
3. 代理 .strm 文件：向 AList 发送请求获取直链，并将请求重定向至该直链

## 配置说明
请参考 .env.demo 文件创建 .env 文件
```
VERSION=0.0.1

ALIST_SERVER_URL=http://192.168.1.200:5244
ALIST_USER_NAME=admin
ALIST_PASSWORD=your_password_here

PORT=5255

SCAN_BASE_PATH=/
STRM_BASE_PATH=D:\strm
```

## 运行方式
1. npm install
2. start:dev

## Docker 构建
1. docker pull node:20
2. docker build -t alistrm:0.0.1 .
3. docker save -o alistrm-0.0.1.tar alistrm:0.0.1
4. upload to your docker server

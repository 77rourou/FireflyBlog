---
title: "WebSocket 实时通信入门"
published: 2026-07-21
tags: ["网络", "WebSocket", "实时通信", "教程"]
category: "开发"
description: "用轮询对比讲清 WebSocket 的优势与握手过程，附浏览器 JS、Python(FastAPI) 与 Node(ws) 三个可直接运行的示例，并总结聊天、通知等应用场景与心跳、鉴权、Nginx 配置等注意事项。"
---

聊天、消息通知、股票行情这类"服务器主动推送"的场景，传统 HTTP 轮询又慢又费资源，而 WebSocket 用一个连接就能实现双向实时通信。本文从原理到手写代码，带你快速入门。

## 一、WebSocket 是什么

WebSocket 是 HTML5 提出的**全双工**通信协议（[RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455)）：在单个 TCP 连接上，客户端和服务器可以随时互相发送消息，连接建立后开销极小。

## 二、与 HTTP 轮询对比

| 特性 | HTTP 轮询 | WebSocket |
| --- | --- | --- |
| 通信方向 | 只能客户端主动请求 | 双向，服务端可主动推送 |
| 实时性 | 取决于轮询间隔（秒级） | 毫秒级 |
| 开销 | 每次请求都带完整 HTTP 头部 | 一次握手后，帧头仅 2~14 字节 |
| 连接数量 | 高频轮询占用大量连接与带宽 | 单连接复用 |

> 长轮询（Long Polling）能减少空响应，但仍是单向的，且需要服务器挂起请求，处理复杂度并不低。

## 三、握手过程

WebSocket 通过 HTTP 的 **Upgrade 机制**升级连接。客户端先发一个普通 HTTP 请求：

```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

服务器校验后返回 `101 Switching Protocols`（带 `Sec-WebSocket-Accept`），连接随即升级为 WebSocket，之后双方直接用帧通信。帧类型主要有：

- **文本帧**：`ws.send("字符串")`，日常最常用
- **二进制帧**：`ws.send(arrayBuffer)`，适合图片、音视频等二进制数据
- **Ping/Pong 帧**：协议层心跳，检测连接是否存活
- **Close 帧**：正常关闭连接

> [!TIP]
> 提示：`Sec-WebSocket-Key` 是客户端生成的随机 Base64 字符串，仅用于证明握手是"新鲜"的，不具备鉴权作用。

## 四、浏览器 JS 使用示例

```js
const ws = new WebSocket("wss://example.com/chat")

ws.onopen = () => {
  console.log("已连接")
  ws.send("大家好")
}
ws.onmessage = (e) => console.log("收到：", e.data)
ws.onclose = () => console.log("连接关闭")
ws.onerror = (e) => console.error("出错：", e)

// 心跳保活：30 秒发一次 ping
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) ws.send("ping")
}, 30000)
```

## 五、服务端示例

### Python（FastAPI + Uvicorn）

```python
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/chat")
async def chat(ws: WebSocket):
    await ws.accept()
    while True:
        msg = await ws.receive_text()
        await ws.send_text(f"echo: {msg}")
```

### Node.js（ws 库）

```js
import { WebSocketServer } from "ws"

const wss = new WebSocketServer({ port: 8080 })
wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    // 广播给所有客户端
    wss.clients.forEach((c) => c.send(String(data)))
  })
})
```

## 六、常见应用场景

- **聊天 / IM**：一对一、群聊消息实时收发
- **实时通知**：订单状态、告警推送、在线客服
- **协同编辑**：多人同时编辑文档、白板
- **行情推送**：股票/加密货币价格、体育比分
- **游戏对战**：房间匹配、回合同步
- **进度推送**：文件上传、任务执行进度条

## 七、注意事项

1. **生产环境必须用 `wss://`**：页面是 HTTPS 时，浏览器会直接拒绝 `ws://` 连接
2. **心跳与重连**：网络抖动会悄悄断开连接，客户端要定时 ping/pong 保活并实现指数退避重连
3. **鉴权方式**：浏览器无法自定义握手头，常用方案是握手时携带 Cookie，或在 URL 后带 `?token=xxx`，也可以利用子协议（`Sec-WebSocket-Protocol`）
4. **Nginx 反向代理需透传 Upgrade 头**：

```nginx
location /chat {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;  # 默认 60s，会掐断长连接
}
```

5. **横向扩展**：多实例部署时需引入 Redis 等消息总线做广播，不能让消息只落在单机内存
6. **连接上限**：每连接占用内存与文件描述符，高并发下注意集群容量规划

## 参考链接

- [RFC 6455：The WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [MDN：WebSocket API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)
- [MDN：编写 WebSocket 客户端应用](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications)
- [FastAPI：WebSockets 文档](https://fastapi.tiangolo.com/zh/advanced/websockets/)
- [ws：Node.js WebSocket 库](https://github.com/websockets/ws)

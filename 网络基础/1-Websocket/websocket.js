// ! WebSocket是HTML5新增的协议，它的目的是在浏览器和服务器之间建立一个不受限的双向通信的通道，比如说，服务器可以在任意时刻发送消息给浏览器。
// ? 传统的http协议怎么实现websocket的功能？
// 轮询：
// 轮询是指浏览器通过JavaScript启动一个定时器，然后以固定的间隔给服务器发请求，询问服务器有没有新消息。
// ~ 这个机制的缺点一是实时性不够，二是频繁的请求会给服务器带来极大的压力。

// websocket 缺点：1 兼容性（部分浏览器支持） 2 维持TCP连接需要耗费资源（尤其对于消息少的场景）
// 为了充分利用TCP连接的资源，在使用了Websocket的页面，可以放弃ajax，都用Websocket进行通信。当然这会带来程序设计上的一些问题，需求权衡
// 可以借助第三方库 Socket等

// ~ Websocket 并不是全新的协议，而是利用了HTTP协议来建立连接。
// ! 分为两个阶段： 1 握手 2 通信

/*
    1 建立websocket请求时，客户端首先会使用http协议完成一次特殊的请求响应，这次请求-响应就是Websocket握手
        WebSocket连接必须由浏览器发起，因为请求协议是一个标准的HTTP请求，格式如下：

            GET ws://localhost:3000/ws/chat HTTP/1.1   (如果 使用HTTPS: wss://localhost:3000/ws/chat HTTP/2)
            Host: localhost
            Upgrade: websocket  (以后别用HTTP了，升级吧)
            Connection: Upgrade (我们把后续的协议升级为Websocket)
            Origin: http://localhost:3000
            Sec-WebSocket-Key: YWJzZmFKzMrMW====  (暗号：天王盖地虎。 用于标识这个连接，并非用于加密数据)
            Sec-WebSocket-Version: 13 (协议版本号)
    ~ 即： 握手由HTTP协议完成，通信由Websocket完成
    2 服务器如果同意，响应下面的消息
            HTTP/1.1 101 Switching Protocols (该响应代码101表示本次连接的HTTP协议即将被更改)
            Upgrade: websocket  (更改后的协议就是Upgrade: websocket指定的WebSocket协议。)
            Connection: Upgrade
            Sec-WebSocket-Accept: server-random-string

    3 现在，一个WebSocket连接就建立成功，浏览器和服务器就可以随时主动发送消息给对方。消息有两种，一种是文本，一种是二进制数据。通常，我们可以发送JSON格式的文本，这样，在浏览器处理起来就十分容易。
*/

/*
为什么WebSocket连接可以实现全双工通信而HTTP连接不行呢？
~ 实际上HTTP协议是建立在TCP协议之上的，TCP协议本身就实现了全双工通信，但是HTTP协议的请求－应答机制限制了全双工通信。
~ WebSocket连接建立以后，其实只是简单规定了一下：接下来，咱们通信就不使用HTTP协议了，直接互相发数据吧。

 安全的WebSocket连接机制和HTTPS类似。首先，浏览器用wss://xxx创建WebSocket连接时，会先通过HTTPS创建安全的连接，
 ~ 然后，该HTTPS连接升级为WebSocket连接，底层通信走的仍然是安全的SSL/TLS协议。



 ! 同源策略

    WebSocket协议本身不要求同源策略（Same-origin Policy），也就是某个地址为http://a.com的网页可以通过WebSocket连接到ws://b.com。
    ~ 但是，浏览器会发送Origin的HTTP头给服务器，服务器可以根据Origin拒绝这个WebSocket请求。所以，是否要求同源要看服务器端如何检查。
*/

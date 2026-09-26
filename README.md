# Hourglass / Genesis Canary Pass

固定发行的 Hourglass 访问凭证与自托管 BTC 收款系统。

| 参数 | 数值 |
| --- | ---: |
| 总量 | 2,100 |
| 单价 | 47,619 sats |
| 理论总收 | 99,999,900 sats |
| 硬上限 | `< 1 BTC` |

每枚凭证包含序列号、持有人公开标识、权益、签发时间和 Ed25519 签名。凭证可下载并通过发行方公钥验证。

## 权益

- 12 个月 Hourglass Pro
- 10 份 Q-SEAL 签名审计凭证
- Q-DAY 预警流
- Exposure API
- Dark Exit 加密撤离试验优先访问

凭证不包含收益、分红、回购或价格承诺。

## 系统

- React/Vite 铸造界面
- SQLite 原子库存与序列号
- BTCPay Server Greenfield API
- BTCPay Webhook HMAC 验证
- Invoice 金额、币种和结算状态复核
- Ed25519 凭证签发与验证
- 订单限流、15 分钟库存保留、幂等结算
- Docker 生产镜像

## 本地运行

```bash
cp .env.example .env
npm install
npm run dev
```

本地默认使用模拟结算。界面会明确显示 `DEV / SIMULATE SETTLEMENT`，不会产生真实付款。

```bash
npm test
npm run build
```

## BTCPay 生产配置

1. 创建 BTCPay Store，并连接 BTC 钱包。
2. 创建仅限该 Store 的 Greenfield API Key。
3. 新建 Webhook：
   - URL：`https://<domain>/api/webhooks/btcpay`
   - Event：`InvoiceSettled`
   - 复制 Webhook Secret。
4. 设置环境：

```dotenv
NODE_ENV=production
PORT=8787
SITE_URL=https://canary.example.com
PAYMENT_MODE=btcpay
DATABASE_PATH=/app/data/hourglass.db
SIGNING_KEY_PATH=/app/data/hourglass-ed25519.pem
BTCPAY_URL=https://btcpay.example.com
BTCPAY_STORE_ID=...
BTCPAY_API_KEY=...
BTCPAY_WEBHOOK_SECRET=...
```

生产模式拒绝 `PAYMENT_MODE=mock`。首次启动会生成 Ed25519 私钥；必须同时备份数据库和
`SIGNING_KEY_PATH`。私钥丢失后无法继续签发与旧凭证一致的证明。

## Docker

```bash
docker build -t hourglass-canary .
docker run --rm -p 8787:8787 \
  --env-file .env.production \
  -v hourglass-data:/app/data \
  hourglass-canary
```

TLS 应由反向代理终止。BTCPay API Key、Webhook Secret 和签名私钥不得进入镜像或源码。

## 凭证格式

```text
hourglass.canary-pass.v1
├── claims
│   ├── serial / supply / priceSats / maxProceedsSats
│   ├── holder / orderId / issuedAt
│   └── entitlements
└── proof
    ├── algorithm: Ed25519
    ├── publicKey
    ├── fingerprint
    └── signature
```

## License

MIT

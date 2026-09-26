# Hourglass

Bitcoin 量子暴露审计器。输入公开地址，Hourglass 会读取链上历史并判断：

- 地址脚本类型（P2PKH、P2SH、P2WPKH、P2WSH、P2TR）
- 公钥是否已经直接公开或因历史花费而公开
- 当前余额、UTXO 数量与地址复用情况
- 抗量子迁移优先级与操作建议

Hourglass 是只读工具，不请求私钥、助记词或签名。默认直接查询
[mempool.space API](https://mempool.space/docs/api/rest)，地址会发送给该公共索引器。

## 风险模型

具有密码学相关量子计算能力（CRQC）的攻击者理论上可使用 Shor 算法从
secp256k1 公钥恢复私钥。不同 Bitcoin 输出的公钥暴露方式不同：

| 输出类型 | 首次花费前 | 花费后 |
| --- | --- | --- |
| P2PKH / P2WPKH | 公钥受 HASH160 保护 | 公钥公开；地址复用使剩余 UTXO 暴露 |
| P2SH / P2WSH | 脚本受哈希保护 | 赎回脚本及其中的公钥通常公开 |
| P2TR | x-only 输出公钥始终公开 | 公开 |

风险分数是迁移优先级，不代表现有量子计算机能够立即盗取 BTC。BIP-360 和
BIP-361 仍处于提案阶段；本项目不会推荐未经共识或审计的“抗量子地址”。

## 本地运行

```bash
npm install
npm run dev
```

质量检查：

```bash
npm test
npm run build
```

## 审计凭证

每次扫描均可下载 `hourglass.audit.v1` JSON，记录策略版本、数据源、发现、
UTXO 和扫描时间，便于迁移清点或后续复核。

## 限制

- 当前扫描地址，不扫描钱包 xpub 或描述符。
- P2SH/P2WSH 仅根据地址历史做保守判断；精确判断需要解析被花费输出的脚本。
- 公共索引器可能限流、延迟或返回不完整数据。
- 本项目不是钱包，也不构成财务或密钥迁移建议。

## License

MIT

# JobChoiceRanker

一个独立的本地优先 Web 工具，回答：**按我的规则，2—6 个岗位先投哪个？**

它不读取岗位跟踪库、不读取简历、不保存投递状态，也不提供账号或数据库。用户手动粘贴 JD 和一份自己确认的“专属择业 SKILL”；模型只按该 SKILL 做可复核的多岗比较。

## 最小闭环

1. 用访谈协议在外部 Agent 中形成专属 SKILL；
2. 粘贴该 SKILL 与 2—6 份完整 JD；
3. 得到每岗的 `gate`、`gateReason`、`score`、`recommendation`、贡献、短板、说明和维度贡献；
4. 硬性淘汰的岗位始终置底。

## Contract

请求：`{ preferenceSkill, jobs: [{ id, company?, title, rawJd }] }`。SKILL 应明确硬否决、维度权重、0/5/10 锚点、软性扣分、公式、tie-break 和信息不足的处理。输出为：

```text
{ summary, ranked: [{ jobId, gate, gateReason, score, recommendation,
  topContributions, topGaps, note }], dimensions: [{ jobId, code,
  supply0to10, weight, contribution }] }
```

`gate=淘汰` 时 `score=null` 且 `recommendation=放弃`。通过门控的岗位按分数降序；淘汰岗置底，分数相近时遵循用户 SKILL 的 tie-break。

## 运行

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
pnpm test
pnpm build
```

`OPENAI_API_KEY` 只在 `app/api/rank/route.ts` 的服务器端读取，绝不能放进 `NEXT_PUBLIC_*`。请求使用 `store: false`；本仓不写数据库、不记录 JD 或 SKILL 日志。生产部署前仍应按组织的密钥、访问控制与数据保留规则补足保护。

## 非目标

- 不提供默认“正确择业观”，也不内置任何个人权力动力学框架；
- 不做简历匹配、经历改写、岗位跟踪、投递管理、登录、云数据库或导出；
- 不创建 shared package：当前仅通过 JSON contract 预留未来集成。

## 当前边界

输出取决于用户提供的规则和 JD 信息，不能替代事实核实或职业、法律、财务建议。信息不足必须显示为不确定性，而不是伪精确分数。

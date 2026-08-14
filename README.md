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

默认使用 DeepSeek V4 Flash 的 thinking mode（`deepseek-v4-flash` + `DEEPSEEK_REASONING_EFFORT=max`）；也可通过 `AI_PROVIDER=openai` 切换到 OpenAI。环境变量 key 只在 `app/api/rank/route.ts` 的服务器端读取，绝不能放进 `NEXT_PUBLIC_*`。请求不写数据库、不记录 JD 或 SKILL 日志。生产部署前仍应按组织的密钥、访问控制与数据保留规则补足保护。

### 在网页中填写 key

首次打开页面会看到“AI 连接设置”。在这里选择 DeepSeek 或 OpenAI，填写模型与 API key 后即可使用；浏览器会话中的连接优先于 `.env.local`。该 key 仅保存在当前浏览器会话的 `sessionStorage`，每次请求时临时传给本项目服务端，服务端不会将其写入文件、数据库或日志。若未填写，应用才使用部署者配置的环境变量。

提供商 API 地址固定为官方 DeepSeek / OpenAI 端点，因此界面没有可填写的 Base URI。

## 非目标

- 不预设任何择业价值标准；排序只遵循用户明确提供的专属择业 SKILL；
- 不做简历匹配、经历改写、岗位跟踪、投递管理、登录、云数据库或导出；
- 不创建 shared package：当前仅通过 JSON contract 预留未来集成。

## 当前边界

输出取决于用户提供的规则和 JD 信息，不能替代事实核实或职业、法律、财务建议。信息不足必须显示为不确定性，而不是伪精确分数。

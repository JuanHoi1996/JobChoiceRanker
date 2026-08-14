import { validateRankAnalysis, validateRankInput } from "../../../lib/rank-contract.js";
import { completeJson } from "../../../lib/ai-provider.js";

const schema = { type: "object", additionalProperties: false, required: ["summary", "ranked", "dimensions"], properties: { summary: { type: "string" }, ranked: { type: "array", items: { type: "object", additionalProperties: false, required: ["jobId", "gate", "gateReason", "score", "recommendation", "topContributions", "topGaps", "note"], properties: { jobId: { type: "string" }, gate: { type: "string" }, gateReason: { type: "string" }, score: { type: ["number", "null"] }, recommendation: { type: "string" }, topContributions: { type: "array", items: { type: "string" } }, topGaps: { type: "array", items: { type: "string" } }, note: { type: "string" } } } }, dimensions: { type: "array", items: { type: "object", additionalProperties: false, required: ["jobId", "code", "supply0to10", "weight", "contribution"], properties: { jobId: { type: "string" }, code: { type: "string" }, supply0to10: { type: "number" }, weight: { type: "number" }, contribution: { type: "number" } } } } } } as const;

const system = `你是择业决策助手。严格执行用户提供的专属择业 SKILL，不得用自己的价值观替换其中的门控、权重、0/5/10 锚点、扣分或 tie-break。对每个岗位：触碰硬否决则 gate=淘汰、score=null、recommendation=放弃；否则按规则打分。信息不足取保守值并在 note 说明。ranked 必须覆盖所有 jobId。只输出 JSON，不输出思维链或复述 SKILL。`;

export async function POST(request: Request) {
  try {
    const input = validateRankInput(await request.json());
    const jobs = (input.jobs as { id: string; company: string; title: string; rawJd: string }[])
      .map((job, i) => `### 岗位 ${i + 1}\njobId: ${job.id}\n公司: ${job.company}\n标题: ${job.title}\nJD：\n${job.rawJd}`).join("\n\n---\n\n");
    const completion = await completeJson({
      systemPrompt: system,
      userPrompt: `【专属择业 SKILL】\n${input.preferenceSkill}\n\n【岗位】\n${jobs}`,
      schema,
      schemaName: "job_rank",
      maxOutputTokens: 16000,
    });
    const analysis = validateRankAnalysis((input.jobs as { id: string }[]).map((job) => job.id), JSON.parse(completion.text));
    if (analysis.ranked.length !== (input.jobs as unknown[]).length) return Response.json({ error: "模型未覆盖全部岗位，请重试。" }, { status: 502 });
    return Response.json({ analysis }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "请求格式无效。" }, { status: 400 });
  }
}

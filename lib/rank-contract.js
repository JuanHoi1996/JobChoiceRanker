const clean = (value) => String(value ?? "").trim();
export const MAX_JOBS = 6;
export const RECOMMENDATIONS = ["冲", "可接", "保底", "放弃"];

export function validateRankInput(raw) {
  const preferenceSkill = clean(raw?.preferenceSkill);
  const seen = new Set();
  const jobs = (Array.isArray(raw?.jobs) ? raw.jobs : []).flatMap((job) => {
    const id = clean(job?.id);
    const title = clean(job?.title);
    const rawJd = clean(job?.rawJd).replace(/\u00a0/gu, " ");
    if (!id || !title || rawJd.length < 40 || seen.has(id)) return [];
    seen.add(id);
    return [{ id, company: clean(job?.company) || "未命名公司", title, rawJd: rawJd.slice(0, 8000) }];
  }).slice(0, MAX_JOBS);
  if (preferenceSkill.length < 200 || preferenceSkill.length > 80000) throw new Error("择业 SKILL 长度需在 200—80,000 字之间。");
  if (jobs.length < 2) throw new Error("请粘贴 2—6 个含完整 JD 的岗位。");
  return { preferenceSkill, jobs };
}

export function validateRankAnalysis(allowedJobIds, raw) {
  const allowed = new Set(allowedJobIds.map(String));
  const unique = new Set();
  const ranked = (Array.isArray(raw?.ranked) ? raw.ranked : []).flatMap((item) => {
    const jobId = clean(item?.jobId);
    if (!allowed.has(jobId) || unique.has(jobId)) return [];
    unique.add(jobId);
    const gate = clean(item?.gate) === "淘汰" ? "淘汰" : "pass";
    const candidateScore = Number(item?.score);
    const score = gate === "淘汰" || !Number.isFinite(candidateScore) ? null : Math.max(0, Math.min(100, Math.round(candidateScore * 10) / 10));
    const list = (value) => Array.isArray(value) ? value.map(clean).filter(Boolean).slice(0, 4) : [];
    return [{ jobId, gate, gateReason: clean(item?.gateReason), score, recommendation: gate === "淘汰" ? "放弃" : (RECOMMENDATIONS.includes(clean(item?.recommendation)) ? clean(item.recommendation) : "可接"), topContributions: list(item?.topContributions), topGaps: list(item?.topGaps), note: clean(item?.note) }];
  });
  ranked.sort((a, b) => (a.gate === "淘汰") - (b.gate === "淘汰") || (b.score ?? -1) - (a.score ?? -1));
  const dimensions = (Array.isArray(raw?.dimensions) ? raw.dimensions : []).flatMap((item) => {
    const jobId = clean(item?.jobId); const code = clean(item?.code);
    if (!allowed.has(jobId) || !code) return [];
    const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
    return [{ jobId, code, supply0to10: Math.max(0, Math.min(10, number(item?.supply0to10))), weight: number(item?.weight), contribution: number(item?.contribution) }];
  }).slice(0, 80);
  return { summary: clean(raw?.summary) || "已完成本次多岗择业排序。", ranked, dimensions };
}

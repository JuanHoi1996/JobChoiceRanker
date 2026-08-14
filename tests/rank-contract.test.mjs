import assert from "node:assert/strict";
import test from "node:test";
import { validateRankAnalysis, validateRankInput } from "../lib/rank-contract.js";
test("rejected jobs sink and cannot retain a score or a positive recommendation", () => { const result = validateRankAnalysis(["a", "b"], { ranked: [{ jobId: "b", gate: "淘汰", score: 99, recommendation: "冲" }, { jobId: "a", gate: "pass", score: 61, recommendation: "可接" }] }); assert.deepEqual(result.ranked.map((row) => row.jobId), ["a", "b"]); assert.equal(result.ranked[1].score, null); assert.equal(result.ranked[1].recommendation, "放弃"); });
test("input rejects fewer than two usable JDs", () => { assert.throws(() => validateRankInput({ preferenceSkill: "x".repeat(200), jobs: [{ id: "a", title: "A", rawJd: "too short" }] })); });

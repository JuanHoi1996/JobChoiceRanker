---
title: JobChoiceRanker standalone MVP V0.1
date: 2026-08-14
status: implemented
tags:
  - local-first
  - job-ranking
  - preference-contract
---

# JobChoiceRanker standalone MVP V0.1

## Solved problem

Compare 2–6 manually supplied job descriptions according to the current user's own decision rules, without conflating job desirability with resume fit.

## Confirmed product boundaries

- Input is a pasted user-owned preference SKILL plus pasted JD text; no job tracker, resume, application status, account or database is required.
- The SKILL supplies hard gates, weighted dimensions, 0/5/10 anchors, soft penalties, formula and tie-break. The application has no default career philosophy.
- Output is gate, gate reason, score, recommendation, contributions, gaps, note and optional dimension contributions. Rejected roles get `score: null`, recommendation `放弃`, and always sort last.
- The model key is server-only, calls use `store: false`, and the MVP writes no JD/SKILL logs or database records.

## Implemented flow

```text
Paste or obtain a personal SKILL
→ paste 2–6 JDs
→ server validates input and calls model
→ validate response contract
→ show explainable ranking
```

## Verification

- `node --test tests/*.test.mjs`: 2 passing tests.
- `node node_modules/next/dist/bin/next build`: passing production build.

## Deliberate non-goals

No resume tailoring, JD intake/tracking, login, cloud storage, shared package, default values or export system. A future integration should use the JSON contract rather than direct module sharing.

## Next step

Manually test several anonymized JD sets with distinct user-owned SKILLs. Create a remote GitHub repository only after the local feedback loop establishes that the rule format is usable.

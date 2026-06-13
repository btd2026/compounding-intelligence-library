---
title: Synthesis Response Prompt
shelf: Reflection
session: 2
lesson: 2
summary: Compress your About You file into a 100-word standing instruction you paste at the top of every future Claude chat.
date_filed: 2026-06-13
---

The condensation step. After your About You file exists, you don't want to paste a six-paragraph essay into every Claude conversation — you want the **shortest possible standing instruction** that still teaches the model how to talk to you. This meta-prompt interviews you briefly and produces that paragraph. Save the output as a separate file on your `Reflection` shelf — that's the file you copy-paste at the start of every real conversation going forward.

**Sits in the curriculum at:** Session 2 · Lesson 2 (Compression) · Standing Instructions

## The prompt

```
You are helping me compress my full About You file into a 100-word
standing-instructions paragraph that I will paste at the top of
every future Claude or ChatGPT chat.

Operating rules:
1. Don't fabricate. If I don't tell you something, leave it out.
2. The output must be ONE paragraph, no bullets, no headers, no
   section breaks. It has to read like a single instruction a model
   can absorb in one breath.
3. Default to picture-smart phrasing unless I tell you otherwise.
4. Be ruthless about cuts. Anything that isn't load-bearing for
   "how should AI talk to me" gets cut.

Run this in three passes.

PASS 1 — Intake

Ask me to paste my full About You file. Wait for it. Once I paste
it, confirm what you see and ask me ONE question:
"Which two of the six fields are most load-bearing for HOW AI
should talk to you?" (Usually field 4 — intelligence — and field 6 —
how I want AI to operate — but not always.)

PASS 2 — Triage

Based on my answer, draft a first version. Constraints:
- Open with my name and one identity line (sport, school, or
  niche — pick the most distinctive).
- Name my intelligence profile in one phrase.
- State my standing instruction for how AI should operate (style,
  challenge, honesty).
- Name 1–2 things I'm currently working on that AI should know
  about.
- Cap at 100 words.

Show me the draft. Ask me what to cut and what's missing.

PASS 3 — Tighten

Take my edits. Produce a final version. Then output a single
markdown file I can save in my repo, using this EXACT schema:

=== FILE: prompts/My_Standing_Instructions.md ===
---
title: My Standing Instructions
shelf: Reflection
session: 2
lesson: 2
summary: The 100-word context I paste at the top of every Claude chat.
date_filed: [today, YYYY-MM-DD]
intelligence: [my primary intelligence]
---

The compressed version of my About You file. Paste this at the top
of every new conversation with Claude, ChatGPT, or any other model.
Refresh it whenever my life changes meaningfully.

**Sits in the curriculum at:** Session 2 · Lesson 2 (Compression)

## The prompt

[the final 100-word paragraph, in a code fence so I can copy it
cleanly]


## How to use

- Paste the contents of the code fence at the top of every real
  Claude conversation, before I ask my first question.
- Update this file when my life changes — new project, new
  intelligence sub-skill, new stake.
- Compare versions over time. The diff between today's and the
  one I write in six months is a portrait of how I grew.

After the file block, give me one line: "Save this file at the
path shown, commit it, and your standing instructions card
appears on your Reflection shelf within a minute."

Start now by asking me to paste my About You file.
```

## Notes for use

- Run this only after `Personal_Context_Bootstrap.md` has produced your full `About_You.md`. The compression doesn't work without the source material.
- The 100-word cap is real. If the model produces 140, push back. Compression is the point.
- Re-run this every 60–90 days. The version you produce today will read embarrassingly off-base by the time you ship your first portfolio project — that's the signal it worked.
- For 17–20-year-olds: after Pass 3, ask the model for an *alternate* version that strips your sport / school / niche and writes a "professional-context-only" variant. You'll want both — one for personal exploration, one for things headed to a recommender's inbox.

---
title: Personal Context Bootstrap
shelf: Discovery
session: 2
lesson: 1
summary: Interview yourself into a paste-ready About You file plus your first 2–3 prompt receipts from Session 1.
date_filed: 2026-06-13
---

The end-of-Session-1 / start-of-Session-2 consolidation prompt. Run this in a fresh Claude chat after you've completed the Skill Inventory Audit and the intelligence diagnostic. It interviews you through the 6 About You fields, walks you through 2–3 prompts you actually ran in Session 1, and outputs paste-ready markdown files that drop straight into your forked library repo.

**Sits in the curriculum at:** Session 2 · Lesson 1 (Consolidation) · Library Bootstrap

## The prompt

```
You are helping me bootstrap the prompt library I forked from the
Compounding Intelligence workshop template. Your job is to interview
me and then produce paste-ready markdown files that drop straight
into the `prompts/` folder of my repo.

Operating rules (do not break these):

1. Don't fabricate. If you don't have enough info from me to fill in
   a field, ASK me — never make it up or guess to be nice. Better an
   empty field than a fake one.
2. Talk to me like a real person, not a form. Short questions. One
   or two at a time. Wait for my answer before moving on.
3. Be direct. If an answer I give is vague ("I like learning"), push
   back once and ask for the specific version ("Learning what? Last
   thing you went down a rabbit hole on?").
4. Default to picture-smart explanations unless I tell you otherwise.

Here's what we're building together, in order:

PART 1 — The 6 About You fields
Ask me about these one at a time. Show me the field name and a
one-line explanation, then wait for my answer.

The 6 fields:
  1. Who I am — identity composite. Multiple lenses (sport, school,
     faith, family background, niche interests).
  2. What I'm working on right now — concrete projects, classes,
     applications, decisions.
  3. What I keep coming back to — unanswered questions, decisions
     I'm avoiding, topics I revisit when stuck.
  4. How I think (intelligence profile) — my top 1–2 of: Word smart
     / Logic smart / Picture smart. Optionally one of: Music smart /
     Body smart / Pattern smart / People smart / Self smart.
  5. What's at stake right now — high-stakes deadlines, decisions,
     things I can't mess up.
  6. How I want AI to operate — style + challenge + honesty.

For field 4, if I'm not sure of my intelligence profile, ask me 2–3
quick situational questions ("When you understand something new, do
you usually picture it, talk it out, or work through the logic step
by step?") and propose a profile based on my answers. Then check
with me.

For field 6, if I don't have a strong opinion, suggest this default
and let me modify: "Push back hard. Don't agree by default. Prove
your claims when I ask 'how do you know.' Default to my [intelligence]
mode. Don't fabricate — if you don't have data, say so."

PART 2 — Session 1 prompt receipts
Once the 6 fields are filled, ask me: "What 2–3 things did you
actually work on in Session 1 today? For each one, tell me (a) what
you were trying to figure out, (b) the prompt you used (or roughly
what you asked), (c) what AI gave back, and (d) what it unlocked."
Walk through them one at a time.

If I only have 1, that's fine — make 1 receipt page. If I can't
remember specifics, ASK me — don't invent a prompt I never ran.

PART 3 — Assemble

When parts 1 and 2 are done, output everything in a single message
with this structure. Use the EXACT frontmatter schema below — my
library is a static site that reads these fields and renders them
on the shelves.

=== FILE: prompts/About_You.md ===
---
title: About You
shelf: Discovery
session: 2
lesson: 1
summary: [one sentence about who I am — pulled from my Field 1 answer]
date_filed: [today's date, YYYY-MM-DD]
---

[A one-paragraph intro: this is the file the student pastes at the
top of every real Claude or ChatGPT conversation. Keep it under
60 words.]

## 1. Who I am
[my field 1 answer]

## 2. What I'm working on right now
[my field 2 answer]

## 3. What I keep coming back to
[my field 3 answer]

## 4. How I think
[my field 4 answer]

## 5. What's at stake right now
[my field 5 answer]

## 6. How I want AI to operate
[my field 6 answer]

=== FILE: prompts/[Short_Receipt_Title].md ===
---
title: [Short receipt title in the same style as the other library
  cards — e.g., "Photosynthesis as a Diagram" or "Common App
  Through-Line"]
shelf: [pick one: Learning / Discovery / Research / Outreach]
session: 1
lesson: [best guess: 1, 2, or 3 based on where in Session 1 this
  came up; ask me if unsure]
summary: [one sentence — what did this prompt actually do?]
date_filed: [today's date]
intelligence: [the one this prompt leaned on — Word/Logic/Picture/etc.]
---

[One-paragraph blurb about what this receipt is for, who would
benefit from re-using it.]

**Sits in the curriculum at:** Session 1 · Lesson [N] · [block name]

## The prompt

```
[paste the prompt I actually ran, verbatim — quote it exactly,
don't paraphrase. If I gave you a rough version, ask me to recall
the actual wording before you write this section.]
```

## What I was trying to figure out
[my answer (a)]

## What AI gave me back
[my answer (c) — summary, not a full dump]

## How I used it / what it unlocked
[my answer (d)]

## What I'd change next time
[ask me, or leave blank with a note saying "to be filled in next
session"]

=== FILE: prompts/[Short_Receipt_Title_2].md ===
[Repeat the receipt block for each Session 1 prompt I gave you.]

After the file blocks, give me a 4-line checklist of what to do next:

1. Create each file at the path shown (above each block) in my
   `compounding-intelligence-library/` repo.
2. Run `node scripts/build.js` (or whatever build command my repo
   uses) so the new entries get picked up by `data/prompts.json`.
3. Commit and push.
4. Wait ~1 minute. Refresh my site URL. The new cards appear on
   the shelves.

Start now by introducing yourself in one sentence, then ask me
field 1.
```

## Notes for use

- Run this once, at the end of Session 1 or the start of Session 2. The output is the seed of your library — it gets bigger every time you save a real receipt.
- Sits next to `Skill_Inventory_Audit.md` in the workflow: the audit surfaces what you're good at; this prompt turns that surfacing into a paste-ready About You file plus your first receipts.
- If your library's build pipeline needs different frontmatter (e.g., you add `tags`), update the schema inside this prompt before handing it to a student.
- For 14–15 year-olds: do the interview with a parent in the room. Field 5 ("what's at stake") and field 6 ("how I want AI to operate") work better when there's an adult to push back on vague answers.

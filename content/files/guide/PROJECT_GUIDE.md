# 202610 China Trip — Project README

> **Read this file first** before creating, moving, renaming, editing, or deleting anything
> in this folder — whether you're a human or an AI assistant.
> If you change anything in this project, append an entry to the **Changelog** at the bottom.

## The trip

Family trip to **China (and Taiwan), October 18 – November 1, 2026** — 15 days.

**Travelers:** Justin Lin and Andrew Lin (brothers, planning this together), plus their mother
**Donna Lin** (full name **Chunyin Tsai**). Donna's itinerary differs: she arrives in Beijing
early (Oct 14) and continues to Taiwan after Oct 29 — see the separate "Donna itinerary" doc
in `Confirmations/`. (Lee Lin is Justin's father but is **not** on this trip.)

**Route:** Beijing → Huangshan → Wuzhen → Hangzhou → Macao → Hong Kong.

## What's in this folder

| File | What it is | Rule |
|---|---|---|
| `China Trip Itinerary - October 2026` | Google Doc — **the editable source of truth**. Justin and Andrew co-edit it. | All itinerary changes go here first. |
| `China Trip Itinerary - October 2026.pdf` | Printable snapshot of the Doc. | Never edit directly — regenerate from the Doc. (Currently one rebuild behind: header still names Lee Lin; see Changelog.) |
| `China Trip Itinerary - Interactive.html` | Interactive webapp version: expandable day cards, bookings tables, highlighted conflicts, checklists. Opens in any browser. | Rebuild/replace when the itinerary changes materially. |
| `Trip Expense Tracker` | Google Sheet: Expenses tab + Summary tab with per-person totals. | Log spending here; don't restructure the tabs. |
| `Packing Checklist` | Google Sheet: 34 items with checkbox columns for Justin and Andrew. | Check off as you pack; add rows, don't delete columns. |
| `Confirmations/` | Booking confirmation PDFs + Donna's itinerary doc. **This is the evidence locker.** | Never invent a booking detail — copy it from these files. |
| `PROJECT_GUIDE.md` | This file. | Update it when the project changes; append to the Changelog. |

## Naming convention (Confirmations/)

`YYYY_MMDD <vendor/description> -<traveler> <code>.pdf`, e.g.
`2026_1101 Cathay HKG-JFK A+J AA37.5kx2.pdf`. Keeps the folder sorted chronologically.

## For AI agents: how to update the itinerary

1. **Read the live Doc back first** (`docs documents get`). If Justin or Andrew edited it in
   Google since the last AI update, **stop and ask before overwriting** — a re-upload
   replaces the whole body and discards their edits.
2. Apply the change to your working copy, rebuild, and upload into the **same Doc ID**
   (`drive files update` + `--upload` converts in place). Never create a second itinerary Doc.
3. Read it back and verify headings/tables landed before announcing it's ready.
4. Regenerate the PDF snapshot from the updated Doc and replace the old PDF.
5. Update this README if the change affects structure, conventions, facts, or open issues.
6. **Append a Changelog entry** describing what you changed.

## Facts that must stay consistent

Corrected against the saved confirmations on 2026-10-11. Do not regress them:

- **Outbound:** CX841 JFK→HKG Oct 18, 10:00 AM → CX336 HKG→PEK Oct 19, arr 6:25 PM.
  Pre-booked business-car pickup at PEK T3 (order WYOO1GZNNK; driver contacts Mr. Lin).
- **Return:** CX840 HKG→JFK Nov 1, 4:35–7:05 PM (supersedes any 3:35 PM notes).
- **CA1551** PEK→TXN Oct 23, 1:05–3:15 PM (Justin/Andrew seats 14A/14C).
- **MF8719** HGH→MFM Oct 28, 2:45–5:30 PM, PNR JSX01J (supersedes any 2:40–4:00 PM notes).
- **Hotels:** Hampton Beijing Changping Oct 19 → China World Summit Wing Oct 20–22 →
  Holiday Inn Express Huangshan South Gate Oct 23 → **on Huangshan mountain Oct 24**
  (no mountain-top confirmation on file — plan stated, reservation undocumented) →
  Crowne Plaza Wuzhen Oct 25 → Midtown Shangri-La Hangzhou Oct 26 (2 rooms) →
  Holiday Inn Hangzhou Airport Zone Oct 27 (2 rooms) → Four Seasons Macao Oct 28
  (booked for 2 adults; three travelers overnight) → Conrad Hong Kong Oct 29–Nov 1.
- Donna flies **EVA BR802 MFM→TPE Oct 29, 1:15–2:55 PM**, then Taiwan through Nov 10.

## Open issues (only the humans can resolve — surface, don't guess)

1. Cathay flagged an **operational change on CX840** — re-check in Cathay's app.
2. Donna appears to hold **two MF8719 tickets** (PNRs JSX01J and NBQ046) — verify which is live.
3. No confirmation on file for the **Oct 24 Huangshan mountain-top hotel**.
4. Stale calendar entries still show cancelled St. Regis Beijing stays (Oct 19–23).
5. Southwest flights LGA→MDW→CHS on Oct 28 conflict with being in Macao — unresolved.
6. eSIM not yet purchased. Researched pick (Oct 11, esimdb.com): ESIM.DOG 30 GB / 12 days, $10.23 — covers all 10 mainland days, routes via Hong Kong so Google/Meta apps work with no VPN. Runner-up: Stellar 30 GB / 20 days, $10.24 (HK breakout, free VPN). Cheapest true 3 GB/day: Giga.Tel 3 GB/day / 15 days, $14.25 (also covers Hong Kong + Macao). MobiMatter 20 GB / 30 days ($13.99) fails the 3 GB/day bar. Buy and install before departure — the profile can't be installed once in China.

## Don'ts

- Don't share this folder or its contents publicly, and don't grant access to anyone new
  without Justin's explicit say-so.
- Don't move confirmation PDFs out of `Confirmations/`, and don't rename them out of
  the naming convention.
- Don't create duplicate itinerary Docs or PDFs — one editable Doc, one snapshot PDF.
- Don't treat the Donna itinerary doc as the family itinerary; hers diverges Oct 14–22
  and after Oct 29.

---

## Changelog

> AI agents: **append** a new entry at the end of this list every time you change anything
> in this folder (upload, edit, move, rename, delete). Format:
> `- YYYY-MM-DD — <your name>: <what changed and why, one or two lines>`
> Never rewrite or delete past entries — only append. Be specific (file names, not vague
> descriptions). Humans: same format, or just describe it and let the agent write it.

- 2026-10-11 — Milo (AI): Project base moved to shared Drive folder "202610 China Trip" for Justin + Andrew; uploaded 15-page itinerary PDF alongside existing confirmations.
- 2026-10-11 — Milo (AI): Created editable Google Doc "China Trip Itinerary - October 2026" in the shared folder (converted from styled source; verified headings/tables). This is now the source of truth.
- 2026-10-11 — Justin (human): Reorganized — moved itinerary PDF to the base folder; the first shared folder was renamed "Confirmations" and nested inside the base.
- 2026-10-11 — Milo (AI): Moved the itinerary Google Doc from Confirmations up to the base folder; wrote the first PROJECT_GUIDE.md.
- 2026-10-11 — Milo (AI): Created "Trip Expense Tracker" (Expenses + Summary tabs) and "Packing Checklist" (34 items, checkbox columns) Google Sheets in the base folder.
- 2026-10-11 — Milo (AI): Built "China Trip Itinerary - Interactive.html" (15 day cards, bookings tables, 6 conflict callouts, tech + packing checklists, sheet links) and uploaded it to the base folder.
- 2026-10-11 — Milo (AI): Set up a 30-minute Drive folder watch (today only) to catch new files or requests from Andrew.
- 2026-10-11 — Justin (human): Flagged that Lee Lin is not on the trip — verified against all 40 confirmations (no Lee booking; flights are J+A or J+A+Donna). Removed Lee from the webapp, Google Doc, guide, and expense tracker. PDF snapshot still needs one rebuild for its header (source fixed).
- 2026-10-11 — Justin (human): Reported sheet links not clickable in the webapp — root cause was `target="_blank"`, blocked by sandboxed viewers. Removed it and added copyable URL text under each card.
- 2026-10-11 — Milo (AI): Rewrote this guide README-style and added this changelog.
- 2026-10-11 — Milo (AI): Added eSIM pick from Oct 11 esimdb scrape to the itinerary (ESIM.DOG 30 GB/12 d, $10.23 — Hong Kong breakout, not yet purchased; runner-up Stellar 30 GB/20 d $10.24; Giga.Tel 3 GB/d/15 d $14.25 covers HK+Macao). Rebuilt the Google Doc, PDF snapshot, and interactive webapp; added eSIM purchase as open issue #6.

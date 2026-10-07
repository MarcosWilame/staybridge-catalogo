---
target: src/app/pages/PropertyDetailsPage.tsx
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\Wilam\\OneDrive\\Documentos\\STAYBRIDGE CATALOGO.v2.1\\src\\app\\pages\\PropertyDetailsPage.tsx"
target_fingerprint: "sha256:16b13664145508545ee55894ca6659f45bac082dd4ee66e72b33eff93f7d2bb6"
target_path: "C:\\Users\\Wilam\\OneDrive\\Documentos\\STAYBRIDGE CATALOGO.v2.1\\src\\app\\pages\\PropertyDetailsPage.tsx"
timestamp: 2026-10-07T04-24-46Z
slug: src-app-pages-propertydetailspage-tsx
closed: true
---
⚠️ DEGRADED: single-context (spawn_agent unavailable in this session)

# Critique: Property details /property/322

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3/4 | Breadcrumbs, availability and interaction feedback exist, but the gallery's blank/loading state is unclear. |
| 2 | Match System / Real World | 4/4 | Property type, price, bills, availability, visit and WhatsApp match the rental task. |
| 3 | User Control and Freedom | 3/4 | Back, carousel, lightbox close and share are available; fixed mobile layers reduce breathing room. |
| 4 | Consistency and Standards | 3/4 | Strong shared tokens and patterns, but information is repeated across gallery, facts and price card. |
| 5 | Error Prevention | 2/4 | Availability and bills are presented as defaults without enough distinction between confirmed and pending data. |
| 6 | Recognition Rather Than Recall | 3/4 | Labels and icons make the page scannable, but repeated badges dilute the primary signal. |
| 7 | Flexibility and Efficiency of Use | 2/4 | Good carousel/lightbox alternatives; limited quick access to key details and no compact desktop/mobile parity proof. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Premium surfaces are promising, but the blank gallery, repeated status content and fixed bars create visual noise. |
| 9 | Error Recovery | 3/4 | Image fallback and lead modal exist, but failed media needs a user-facing explanation and recovery action. |
| 10 | Help and Documentation | 2/4 | WhatsApp is clear, but visit, bills and entry conditions lack contextual microcopy for first-time renters. |
| **Total** |  | **27/40** | **Acceptable — significant improvements needed before the experience feels premium.** |

## Design Specificity Verdict

### LLM assessment

The page has a recognizable Staybridge language: evergreen navigation, warm yellow action color, rounded property surfaces, a large media-first opening and direct WhatsApp conversion. It is more authored than a generic listing template, especially through the gallery, mobile action bar and nearby-points patterns.

The experience is not yet consistently authored at the most important moment: the first mobile viewport. The dominant gallery surface currently reads as a pale empty container when media is unavailable or still loading. That makes the page feel unfinished and undermines trust before the user reaches price or contact. The page also asks the same status questions several times without clearly establishing one source of truth.

### Deterministic scan

The detector found 2 advisory findings in `src/app/pages/PropertyDetailsPage.tsx`:

- Line 848: 11px text outside the documented type ramp.
- Line 867: 1.05rem text outside the documented type ramp.

These are not blockers, but they confirm that the property page has small one-off typography values that should either be mapped to the system or explicitly added as a metadata size.

### Visual evidence

Browser inspection was completed on a fresh mobile viewport at `http://localhost:3001/property/322`. The visible page showed the fixed header, breadcrumbs, gallery controls, status badges, price/visit/WhatsApp bar and bottom navigation. The media region itself appeared as a large blank light surface, so the most visually dominant element did not communicate the property.

## Overall Impression

The foundation is credible and conversion-aware, but the page currently leads with an unresolved media state and too many simultaneous status signals. The single biggest opportunity is to make the first viewport feel complete and trustworthy: show the photo reliably, or show a deliberate media fallback, then let price and WhatsApp carry the next decision.

## What's Working

1. **The conversion path is explicit.** WhatsApp and visit actions are visible and easy to understand, including in the mobile sticky bar.
2. **The structure follows rental decision order.** Gallery, type/location, facts, price, entry conditions and contact are present in a sensible sequence.
3. **The implementation includes good interaction foundations.** Gallery navigation, lightbox behavior, meaningful image alt text, focus styles and reduced-motion support are already represented in the code.

## Priority Issues

### [P1] The first viewport can look like an empty gallery

**Why it matters:** Photography is the strongest trust and desirability signal on a property page. A blank gallery with arrows and badges makes the property look broken or unavailable.

**Fix:** Add an explicit loading skeleton and a deliberate error state with a neutral property-media placeholder, concise copy such as “Fotos indisponíveis no momento” and a retry/open-details action. Verify image URLs and fallback behavior at the route level, not only inside the image component.

**Suggested command:** `$impeccable harden /property/322`

### [P1] Status information is duplicated without one clear source of truth

**Why it matters:** “Consulte a disponibilidade”, “Bills a confirmar” and availability badges appear in multiple areas. Repetition consumes attention and can make a confirmed value look uncertain.

**Fix:** Define one compact status group near the title, then reuse only the specific status needed in the price/CTA card. Render “Bills a confirmar” only when the normalized property data actually says that; otherwise show the confirmed state.

**Suggested command:** `$impeccable distill /property/322`

### [P1] Mobile has two fixed action layers competing for vertical space

**Why it matters:** The sticky price/CTA bar plus bottom navigation compress the viewport and can obscure page content. Casey must distinguish navigation from the immediate property action.

**Fix:** Keep one primary fixed action layer on property pages. Move global navigation to a less dominant treatment or reserve explicit safe-area spacing. Keep WhatsApp primary and make visit secondary.

**Suggested command:** `$impeccable layout /property/322`

### [P2] Entry conditions and price hierarchy need stronger grouping

**Why it matters:** Weekly price, deposit, initial rent and bills are high-stakes information. The current dark price panel is visually strong, but the supporting values compete with availability and can become hard to compare.

**Fix:** Use a concise price block with one primary weekly price, a two-column cost summary, and a separate “Para entrar” section with structured deposit/rent labels. Keep “a confirmar” visually distinct from confirmed values.

**Suggested command:** `$impeccable clarify /property/322`

### [P2] Type scale contains undocumented one-off values

**Why it matters:** 11px and 1.05rem are minor inconsistencies, but one-off values accumulate and weaken the premium feeling.

**Fix:** Replace them with the documented label/body steps, or add an intentional metadata step to `DESIGN.md` if the compact captions are genuinely needed.

**Suggested command:** `$impeccable typeset /property/322`

## Persona Red Flags

### Jordan — First-Timer

- The phrase “Bills a confirmar” is clear but does not explain what the visitor should do next.
- Entry conditions are presented as a block of content rather than a simple “Você precisa pagar X + Y para entrar” summary.
- If the gallery stays blank, Jordan has no explanation that the issue is media availability rather than the property itself.

### Sam — Accessibility-Dependent User

- The page has meaningful button labels, skip link and visible focus styling in the code, which is a strength.
- The mobile gallery's visual state can still be ambiguous if the image fails; the fallback should be announced with clear alternative text or status copy.
- The repeated fixed layers increase the amount of linear content before the main property information is reached.

### Casey — Distracted Mobile User

- The page provides thumb-friendly CTAs, but two fixed navigation/action systems compete for attention.
- The large empty gallery consumes most of the first viewport without delivering useful information.
- The title, status and gallery badges are all visible at once; grouping them into a single compact summary would reduce scanning time.

## Minor Observations

- The target route’s breadcrumb is useful, but long property titles should be tested with very long addresses and room labels.
- “Bills” is an English term inside a Portuguese interface; use one consistent bilingual convention or “Contas”.
- The desktop gallery composition should be verified with 1, 2, 3, 4 and 5 media items so empty secondary cells never appear as intentional blank space.
- The mobile thumbnail strip is useful for many photos but may be redundant when the swipe carousel already has a counter; test whether it improves or interrupts the flow.
- The share action is correctly present, but success feedback should be announced to assistive technology as well as shown visually.

## Questions to Consider

- What if the first viewport always guaranteed either a real photo or a purposeful “photos coming soon” state?
- Can one status group answer bills and availability once, instead of repeating uncertainty in three places?
- On a property page, should the global bottom navigation remain visible, or should the property CTA own the bottom of the screen?
- What would a confident version of this page look like with 30% less visible text?

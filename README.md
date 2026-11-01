# CSUF Master of Public Administration (MPA)

Welcome to the **California State University, Fullerton (CSUF) Master of Public Administration (MPA)** program's official GitHub repository. This organization hosts resources and tools designed to support MPA students, faculty, and staff.

## About the Program

The CSUF MPA program prepares students for leadership roles in public administration through a comprehensive curriculum emphasizing:

- Public governance and policy
- Research and analysis
- Leadership in diverse and dynamic environments

The program is accredited by the **Network of Schools of Public Policy, Affairs, and Administration (NASPAA)**.

## Student Handbook (2026-2027)

This repository includes the digital version of the MPA Student Handbook for 2026-2027. The handbook serves as a comprehensive guide for students, detailing degree requirements, courses, resources, and faculty contacts.

### What's on the site

The site carries all 24 sections of the PDF handbook, numbered to match, with a "PDF p." link on each section that opens the PDF at that page. Around that content:

- **Study Plan Sketcher**: pick a concentration and an internship status, and see how twelve courses reach 36 units with overlaps counted once. It flags the 400-level cap, courses that share a title, and an undetermined internship. Students can tick off completed courses. Choices are saved in the browser only.
- **Course Finder**: every course named in the requirement lists, filterable by concentration and level, showing every place each course can count. Each card opens its University Catalog description, prerequisites, and typical schedule.
- **Concentration explorer**: the four concentrations side by side, generated from the same data.
- **Tuition estimator**: per-semester and whole-degree tuition at 2026–27 rates for one, two, or three courses a semester.
- **Search**: press `/` or `Ctrl`/`⌘`+`K`.
- Milestone checklist, light and dark themes, print styles (including "print my plan"), and deep links to every section and policy.

No build step and no third-party requests: fonts (Public Sans, Source Serif 4; SIL OFL) and icons (Lucide; ISC) are self-hosted.

### Updating for a new academic year

The PDF is the source of truth. Course and concentration lists live in one file, `scripts/handbook-data.js`, which drives the explorer, finder, and sketcher. After editing the PDF or that file:

```bash
node tools/verify-against-pdf.mjs            # data file vs. the newest mpa_student_handbook_*.pdf
```

It re-reads the PDF and fails if any core, breadth, concentration, or advisor-approved list, course title, tuition figure, or the 400-level cap has drifted. It also notes any course without a catalog description. It needs `pdftotext` (`poppler-utils` on Linux, `brew install poppler` on macOS). Prose sections live in `index.html`; each has a `PDF p.` link whose `#page=` value is the printed page number plus 4.

### Catalog descriptions

`scripts/catalog-descriptions.js` holds the Course Finder's descriptions, copied word for word from the [CSUF University Catalog](https://fullerton.catalog.acalog.com/content.php?catoid=101&navoid=15189). The catalog blocks automated downloads, so update it by hand when the catalog changes: paste a course's description, prerequisite, and "Typically Offered" lines into its entry. Where the program knows better than the catalog (POSC 521 now runs fall and spring), the entry says so in a comment.

## Accessibility

The site targets WCAG 2.2 AA and shares its stylesheet lineage with the [CRJU handbook](https://github.com/dadams-AU/crju-handbook); accessibility fixes are kept in sync between the two.

Colour contrast is checked by a script in this repo:

```bash
node tools/contrast-audit.mjs                # every page, both themes
node tools/contrast-audit.mjs index.html     # a single page
node tools/contrast-audit.mjs --json         # machine-readable
```

It serves the repo, drives headless Chromium, and measures the computed contrast of every text node against its real backdrop. It exits non-zero if anything fails, so it can gate a commit. Requires Node 18+ and a Chromium build (set `CHROME_PATH` if one isn't on your `PATH`).

Each page is measured twice, because the two passes answer different questions:

- **true** — what a sighted reader actually sees. Resolves gradients to their worst-case colour stop and composites translucent layers up the ancestor chain.
- **checker** — what WAVE and axe-style tools see. They read `background-color` only.

Three rules keep the site passing both:

1. **Every gradient background also sets an explicit `background-color`.** A gradient is a `background-image`, so the `background` shorthand leaves `background-color` transparent. A checker then falls through to the page background and reports white text on white — this accounted for 24 of the 26 items flagged on the handbook before the fallbacks were added. Use the gradient's lightest stop so the fallback is the genuine worst case. It also matters in forced-colours mode, with background images disabled, and in print.
2. **Links on a coloured panel need their own colour.** In `policy_styles.css` the `header` and `footer` are navy while the global link colour is the same navy, so links there must be overridden (the site uses `#FFD34D`). The breadcrumb link sat at 1:1 — invisible — until this was fixed.
3. **Text on a tinted panel is measured against the composited colour, not the swatch.** `.bg-orange-50` is a 10% tint that composites to `#FFF2E6`, against which the old callout text (`#c05621`) reached only 4.14:1 — a real AA failure, now `#9A3412` at 6.6:1.

## Contributions

Contributions to improve the handbook or create additional tools and resources for students are welcome. Please open an issue or submit a pull request with your suggestions or updates.

## License

This program handbook is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).


## Contact

For questions about the program or resources, please contact:

- Dr. David P. Adams, Program Director
  - Email: <dpadams@fullerton.edu>
  - Office: Gordon Hall 516

---

This organization is maintained by the Division of Politics, Administration & Justice at CSUF.

Last updated: 31 October 2026

© 2026 California State University, Fullerton. All rights reserved.

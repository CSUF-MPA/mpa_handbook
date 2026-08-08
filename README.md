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

### Key Sections

- **Introduction**: Mission and values of the program.
- **Degree Requirements**: Overview of prerequisites and core coursework.
- **Concentrations**: Specializations in Human Resources, Public Finance, Local Government, and Public Policy.
- **Capstone**: Comprehensive exam and seminar details.
- **Resources**: Campus support services for academic and personal growth.

The handbook is built using HTML, CSS, and JavaScript for interactive and accessible navigation.

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

Last updated: 12 July 2026

© 2026 California State University, Fullerton. All rights reserved.

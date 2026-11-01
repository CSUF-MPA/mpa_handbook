/*
 * CSUF MPA Student Handbook: page behaviour
 * ---------------------------------------------------------------
 * No dependencies. Course and concentration data come from
 * scripts/handbook-data.js (window.MPA_DATA), which mirrors the PDF.
 *
 *  - theme, contents drawer, scroll-spy, reading progress, back to top
 *  - tabs (ARIA tabs pattern), section link copying, details handling
 *  - milestone checklist, tuition estimator
 *  - concentration explorer, course finder, Study Plan sketcher
 *  - site search (press / or Ctrl+K)
 */
(function () {
    'use strict';

    const D = window.MPA_DATA;
    const CAT = window.MPA_CATALOG || null;
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ICON = name => `<svg class="i" aria-hidden="true"><use href="images/icons.svg#${name}"/></svg>`;
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const store = {
        get(key, fallback) {
            try {
                const v = localStorage.getItem(key);
                return v === null ? fallback : JSON.parse(v);
            } catch (e) { return fallback; }
        },
        set(key, value) {
            try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
        },
        remove(key) {
            try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
        }
    };

    function announce(message) {
        const el = $('#sr-announcer');
        if (!el) return;
        el.textContent = '';
        window.setTimeout(() => { el.textContent = message; }, 60);
    }

    let toastTimer;
    function toast(message) {
        let el = $('.toast');
        if (!el) {
            el = document.createElement('div');
            el.className = 'toast';
            el.setAttribute('aria-hidden', 'true');
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.classList.add('show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => el.classList.remove('show'), 1800);
        announce(message);
    }

    /* ------------------------------------------------------------ theme */

    function initTheme() {
        const btn = $('.theme-toggle');
        if (!btn) return;
        const sync = () => {
            const dark = document.documentElement.getAttribute('data-theme') === 'dark';
            btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
            const meta = $('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', dark ? '#0B1220' : '#00244E');
        };
        btn.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
            sync();
        });
        sync();
    }

    /* ---------------------------------------- pop-out (when embedded) */

    function initPopout() {
        let framed = false;
        try { framed = window.self !== window.top; } catch (e) { framed = true; }
        const btn = $('.popout');
        if (btn && framed) btn.hidden = false;
    }

    /* ----------------------------------------------- contents drawer */

    function initToc() {
        const toc = $('#toc');
        const toggle = $('.toc-toggle');
        const close = $('.toc-close');
        const backdrop = $('.toc-backdrop');
        if (!toc || !toggle) return;
        const mobile = window.matchMedia('(max-width: 1023px)');

        const open = () => {
            toc.classList.add('is-open');
            backdrop.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
            const current = $('a[aria-current="true"]', toc) || $('a', toc);
            window.setTimeout(() => (current || close).focus(), 30);
        };
        const shut = (returnFocus = true) => {
            if (!toc.classList.contains('is-open')) return;
            toc.classList.remove('is-open');
            backdrop.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            if (returnFocus) toggle.focus();
        };

        toggle.addEventListener('click', () => (toc.classList.contains('is-open') ? shut() : open()));
        close && close.addEventListener('click', () => shut());
        backdrop && backdrop.addEventListener('click', () => shut());
        toc.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
        toc.addEventListener('click', e => { if (e.target.closest('a') && mobile.matches) shut(false); });
        toc.addEventListener('focusout', e => {
            if (mobile.matches && toc.classList.contains('is-open') && e.relatedTarget && !toc.contains(e.relatedTarget)) shut(false);
        });
        const onChange = () => { if (!mobile.matches) shut(false); };
        mobile.addEventListener ? mobile.addEventListener('change', onChange) : mobile.addListener(onChange);
    }

    /* ----------------------------------------------------- scroll-spy */

    function initScrollSpy() {
        const toc = $('#toc');
        if (!toc || !('IntersectionObserver' in window)) return;
        const links = new Map($$('.toc-list a', toc).map(a => [a.getAttribute('href').slice(1), a]));
        const sections = [...links.keys()].map(id => document.getElementById(id)).filter(Boolean);
        const visible = new Set();

        const setActive = id => {
            links.forEach((a, key) => {
                if (key === id) a.setAttribute('aria-current', 'true');
                else a.removeAttribute('aria-current');
            });
            const a = links.get(id);
            if (a && window.matchMedia('(min-width: 1024px)').matches) {
                const top = a.offsetTop - toc.clientHeight / 2;
                toc.scrollTo({ top, behavior: reduceMotion() ? 'auto' : 'smooth' });
            }
        };

        const io = new IntersectionObserver(entries => {
            entries.forEach(en => (en.isIntersecting ? visible.add(en.target.id) : visible.delete(en.target.id)));
            const first = sections.find(s => visible.has(s.id));
            if (first) setActive(first.id);
        }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
        sections.forEach(s => io.observe(s));
    }

    /* ------------------------------ reading progress + back to top */

    function initScrollUi() {
        const bar = $('.read-progress span');
        const btn = $('.back-to-top');
        let ticking = false;
        const update = () => {
            ticking = false;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
            if (bar) bar.style.transform = `scaleX(${p})`;
            if (btn) {
                const show = window.scrollY > 700;
                if (show) btn.hidden = false;
                btn.classList.toggle('visible', show);
                btn.tabIndex = show ? 0 : -1;
                if (!show) btn.hidden = true;
            }
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
        }, { passive: true });
        update();
        btn && btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
            $('#main-content').focus({ preventScroll: true });
        });
    }

    /* ----------------------------------------------------------- tabs */

    function makeTabs(tablist, onSelect) {
        const tabs = $$('[role="tab"]', tablist);
        const select = (tab, focus) => {
            tabs.forEach(t => {
                const on = t === tab;
                t.setAttribute('aria-selected', String(on));
                t.tabIndex = on ? 0 : -1;
                const panel = document.getElementById(t.getAttribute('aria-controls'));
                if (panel) panel.hidden = !on;
            });
            if (focus) tab.focus();
            if (onSelect) onSelect(tab);
        };
        tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => select(tab, false));
            tab.addEventListener('keydown', e => {
                let next = null;
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
                if (e.key === 'Home') next = tabs[0];
                if (e.key === 'End') next = tabs[tabs.length - 1];
                if (next) { e.preventDefault(); select(next, true); }
            });
        });
        const initial = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
        if (initial) select(initial, false);
        return { select: tab => select(tab, false), tabs };
    }

    function initStaticTabs() {
        $$('[data-tabs] [role="tablist"]').forEach(list => makeTabs(list));
    }

    /* --------------------------------------------- section link copying */

    function initCopyLinks() {
        $$('.sec[id] > .sec-head').forEach(head => {
            const sec = head.parentElement;
            const h2 = $('h2', head);
            if (!h2) return;
            const name = h2.textContent.replace(/^\s*\d+\s*/, '').trim();
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'copy-link';
            btn.setAttribute('aria-label', `Copy link to “${name}”`);
            btn.innerHTML = ICON('link');
            btn.addEventListener('click', async () => {
                const url = `${location.origin}${location.pathname}#${sec.id}`;
                try {
                    await navigator.clipboard.writeText(url);
                } catch (e) {
                    const ta = document.createElement('textarea');
                    ta.value = url;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); } catch (err) { /* ignore */ }
                    ta.remove();
                }
                history.replaceState(null, '', `#${sec.id}`);
                toast('Link copied');
            });
            h2.after(btn);
        });
    }

    /* ------------------------------------------- details + navigation */

    function revealTarget(el) {
        if (!el) return;
        // open any collapsed <details> that contain (or are) the target
        for (let n = el; n; n = n.parentElement) {
            if (n.tagName === 'DETAILS') n.open = true;
            if (n.getAttribute && n.getAttribute('role') === 'tabpanel' && n.hidden) {
                const tab = document.querySelector(`[role="tab"][aria-controls="${n.id}"]`);
                if (tab) tab.click();
            }
        }
    }

    function goTo(el, { flash = true, focus = true } = {}) {
        if (!el) return;
        revealTarget(el);
        el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        if (focus) {
            if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(el.tagName)) {
                el.setAttribute('tabindex', '-1');
            }
            el.focus({ preventScroll: true });
        }
        if (flash && !reduceMotion()) {
            el.classList.remove('flash');
            void el.offsetWidth;
            el.classList.add('flash');
            window.setTimeout(() => el.classList.remove('flash'), 1900);
        }
    }

    function initDetails() {
        const fromHash = () => {
            const id = decodeURIComponent(location.hash.slice(1));
            if (!id) return;
            const el = document.getElementById(id);
            if (el && (el.tagName === 'DETAILS' || el.closest('details'))) {
                revealTarget(el);
                window.requestAnimationFrame(() => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
            }
        };
        window.addEventListener('hashchange', fromHash);
        fromHash();

        // Open a collapsed target before the browser scrolls to it, even if the hash is unchanged
        document.addEventListener('click', e => {
            const a = e.target.closest('a[href^="#"]');
            if (!a || a.hasAttribute('data-plan-with') || a.hasAttribute('data-finder-with')) return;
            const id = decodeURIComponent(a.getAttribute('href').slice(1));
            const el = id && document.getElementById(id);
            if (el && (el.tagName === 'DETAILS' || el.closest('details') || el.closest('[role="tabpanel"][hidden]'))) revealTarget(el);
        });

        $$('[data-expand-all]').forEach(btn => btn.addEventListener('click', () => {
            $$('details', $(btn.dataset.expandAll)).forEach(d => { d.open = true; });
        }));
        $$('[data-collapse-all]').forEach(btn => btn.addEventListener('click', () => {
            $$('details', $(btn.dataset.collapseAll)).forEach(d => { d.open = false; });
        }));

        // Print everything, then put the page back the way the reader left it
        let reopened = [];
        window.addEventListener('beforeprint', () => {
            reopened = $$('details:not([open])');
            reopened.forEach(d => { d.open = true; });
        });
        window.addEventListener('afterprint', () => {
            reopened.forEach(d => { d.open = false; });
            reopened = [];
            document.body.classList.remove('print-plan');
        });
    }

    /* ------------------------------------------------ milestones */

    function initMilestones() {
        const scope = $('[data-checklist-scope="milestones"]');
        if (!scope) return;
        const KEY = 'mpa-milestones-v1';
        const saved = store.get(KEY, {});
        const boxes = $$('input[type="checkbox"][data-key]', scope);
        const count = $('.milestone-count');
        const meter = $('[data-checklist="milestones"] .meter span');

        const update = (speak) => {
            const done = boxes.filter(b => b.checked).length;
            if (count) count.textContent = `${done} of ${boxes.length} done.`;
            if (meter) meter.style.width = `${Math.round((done / boxes.length) * 100)}%`;
            $$('.tl-item', scope).forEach(item => {
                const own = $$('input[type="checkbox"]', item);
                item.classList.toggle('is-done', own.length > 0 && own.every(b => b.checked));
            });
            if (speak) announce(`${done} of ${boxes.length} milestones done`);
        };
        boxes.forEach(b => {
            b.checked = !!saved[b.dataset.key];
            b.addEventListener('change', () => {
                saved[b.dataset.key] = b.checked;
                store.set(KEY, saved);
                update(true);
            });
        });
        update(false);
    }

    /* ----------------------------------------------- tuition estimator */

    function initEstimator() {
        const box = $('#estimator');
        if (!box || !D) return;
        box.hidden = false;
        const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const out = key => $(`[data-est="${key}"]`, box);

        const calc = () => {
            const units = Number(($('input[name="est-load"]:checked', box) || {}).value || 6);
            const nonres = ($('input[name="est-res"]:checked', box) || {}).value === 'nr';
            const base = units <= 6 ? D.costs.perSemester.upTo6 : D.costs.perSemester.sevenPlus;
            const perSem = base + (nonres ? D.costs.nonresidentPerUnit * units : 0);
            const semesters = Math.ceil(D.rules.totalUnits / units);
            out('sem').textContent = money(perSem);
            out('count').textContent = `${semesters} (${semesters / 2} yrs)`;
            out('total').textContent = money(perSem * semesters);

            const note = out('note');
            note.classList.remove('is-warn');
            if (semesters > 10) {
                note.classList.add('is-warn');
                note.textContent = `One course each fall and spring takes ${semesters} semesters, which is past the five-year (10-semester) time limit in §15; only an approved petition extends it, to seven years. Talk with the MPA Advisor about pacing.`;
            } else if (units === 6) {
                note.textContent = 'Two courses each fall and spring is the pace the program is designed around: three years.';
            } else if (units === 9) {
                note.textContent = 'Nine units is the fall/spring minimum for international students (§4). Seven or more units moves you into the higher tuition band.';
            } else {
                note.textContent = '';
            }
        };
        $$('input', box).forEach(i => i.addEventListener('change', calc));
        calc();
    }

    /* ======================================= course data helpers */

    const crossMap = new Map();
    if (D) D.crossListed.forEach(group => group.forEach(code => crossMap.set(code, group[0])));
    const canon = code => crossMap.get(code) || code;
    const titleOf = code => (D.courses[code] ? D.courses[code].title : code);
    const levelOf = code => D.level(code);
    const concById = id => D.concentrations.find(c => c.id === id);

    function slotKind(slot) {
        if (slot.pick === slot.from.length) return 'required';
        return /elective/i.test(slot.label) ? 'elective' : 'core option';
    }

    function slotBadge(slot) {
        const m = slot.label.match(/\(([^)]+)\)/);
        if (m) return m[1];
        return slot.pick === slot.from.length ? 'Required' : `Take ${slot.pick}`;
    }

    function rolesFor(code) {
        const roles = [];
        if (D.paCore.includes(code)) roles.push({ cls: 'core', label: 'PA core' });
        if (D.breadth.includes(code)) roles.push({ cls: 'breadth', label: 'PA core breadth (1 of 3)' });
        if (code === D.internship) roles.push({ cls: 'int', label: 'Internship, if required' });
        D.concentrations.forEach(c => {
            c.slots.forEach(s => {
                if (!s.from.some(x => canon(x) === canon(code))) return;
                const kind = slotKind(s);
                const label = kind === 'required' ? `${c.abbr} core` : kind === 'core option' ? `${c.abbr} core option` : `${c.abbr} elective`;
                roles.push({ cls: c.id, label, conc: c.id });
            });
        });
        const adv = D.concentrations.filter(c => c.advisor.includes(code));
        if (adv.length) {
            roles.push({
                cls: 'adv',
                label: adv.length === D.concentrations.length ? 'Advisor-approved: all four' : `Advisor-approved: ${adv.map(c => c.abbr).join(' · ')}`,
                adv: adv.map(c => c.id)
            });
        }
        return roles;
    }

    /* ======================================= concentration explorer */

    function initExplorer() {
        const root = $('#conc-explorer');
        if (!root || !D) return;

        const shape = c => c.slots.map(s => {
            if (s.pick === s.from.length) return s.from.join(' + ');
            const n = s.pick === 1 ? '1' : String(s.pick);
            return `${n} of ${s.from.length} ${slotKind(s) === 'elective' ? 'electives' : 'core options'}`;
        }).join(' · ');

        const tabs = D.concentrations.map((c, i) => `
            <button type="button" role="tab" class="conc-tab" data-c="${c.id}" id="ctab-${c.id}" aria-controls="cpanel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
                <span class="conc-abbr">${c.abbr}</span>
                <span class="conc-name">${esc(c.name)}</span>
                <span class="conc-shape">${esc(shape(c))}</span>
            </button>`).join('');

        const courseLi = code => {
            const info = D.courses[code];
            const also = D.paCore.includes(code) ? 'Also PA core' : D.breadth.includes(code) ? 'Also meets breadth' : '';
            return `<li><span class="code">${esc(info.alias || code)}</span> <span>${esc(info.title)}</span>${also ? `<span class="also">${also}</span>` : ''}${info.note ? `<span class="req-note">${esc(info.note)}</span>` : ''}</li>`;
        };

        const panels = D.concentrations.map((c, i) => `
            <div class="conc-panel" role="tabpanel" id="cpanel-${c.id}" aria-labelledby="ctab-${c.id}" data-c="${c.id}" tabindex="0"${i === 0 ? '' : ' hidden'}>
                <h3>Concentration in ${esc(c.name)}</h3>
                <div class="req-groups">
                    ${c.slots.map(s => `
                        <div class="req-group">
                            <h4>${esc(s.label.replace(/\s*\([^)]*\)\s*$/, ''))} <span class="req-pick">${esc(slotBadge(s))}</span></h4>
                            <ul class="course-list">${s.from.map(courseLi).join('')}</ul>
                        </div>`).join('')}
                </div>
                <details class="disclosure">
                    <summary>Advisor-Approved Electives <span class="adv-count">${c.advisor.length} courses</span></summary>
                    <p>Take the number of advisor-approved electives needed to complete the 36-unit Study Plan:</p>
                    <ul class="course-cols">${c.advisor.map(code => `<li><span class="code">${esc(code)}</span> ${esc(titleOf(code))}</li>`).join('')}</ul>
                </details>
                <div class="conc-actions">
                    <a class="btn btn-solid btn-small" href="#planner" data-plan-with="${c.id}">${ICON('pencil-ruler')} Sketch a plan with ${esc(c.short)}</a>
                    <a class="btn btn-quiet btn-small" href="#courses" data-finder-with="${c.id}">${ICON('funnel')} Browse its courses</a>
                </div>
            </div>`).join('');

        root.innerHTML = `<div class="conc-tabs" role="tablist" aria-label="Concentrations">${tabs}</div>${panels}`;
        makeTabs($('.conc-tabs', root));
    }

    /* ================================================ course finder */

    let finderApi = null;

    function initFinder() {
        const root = $('#course-finder');
        if (!root || !D) return;

        const opts = [['all', 'Any requirement'], ['core', 'Public Administration core & breadth'],
            ...D.concentrations.map(c => [c.id, c.name]), ['int', 'Internship']];

        root.innerHTML = `
            <div class="finder-controls">
                <div class="field">
                    <label for="finder-q">Search by number, title, or topic</label>
                    <input id="finder-q" type="search" placeholder="e.g. 525, budget, housing" autocomplete="off">
                </div>
                <div class="field">
                    <label for="finder-filter">Counts toward</label>
                    <select id="finder-filter">${opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select>
                </div>
                <fieldset class="seg">
                    <legend>Level</legend>
                    <div class="seg-options">
                        <label><input type="radio" name="finder-lvl" value="all" checked><span>All</span></label>
                        <label><input type="radio" name="finder-lvl" value="400"><span>400</span></label>
                        <label><input type="radio" name="finder-lvl" value="500"><span>500</span></label>
                    </div>
                </fieldset>
            </div>
            <div class="finder-bar">
                <p class="finder-count" id="finder-count" role="status" aria-live="polite"></p>
                ${CAT ? '<button type="button" class="btn btn-quiet btn-small" id="finder-expand" aria-pressed="false">Show all descriptions</button>' : ''}
            </div>
            <ul class="finder-grid" id="finder-grid"></ul>`;

        const codes = Object.keys(D.courses).sort((a, b) => {
            const na = Number(a.match(/\d{3}/)[0]);
            const nb = Number(b.match(/\d{3}/)[0]);
            return na - nb || a.localeCompare(b);
        });
        const data = codes.map(code => ({ code, info: D.courses[code], roles: rolesFor(code), lvl: levelOf(code), cat: CAT ? CAT.get(code) : null }));

        const descHtml = d => {
            if (!d.cat) return '';
            const c = d.cat;
            const meta = [
                c.prereq ? `<div><dt>Prerequisites</dt><dd>${esc(c.prereq)}</dd></div>` : '',
                c.credit ? `<div><dt>Level</dt><dd>${esc(c.credit)}</dd></div>` : ''
            ].join('');
            const flags = [c.consent, c.online ? 'One or more sections may be offered in any online format.' : ''].filter(Boolean);
            return `
                <details class="fcard-desc">
                    <summary>Catalog description<span class="sr-only"> for ${esc(d.code)}</span></summary>
                    <div class="fcard-desc-body">
                        <p>${esc(c.desc)}</p>
                        ${meta ? `<dl class="fcard-meta">${meta}</dl>` : ''}
                        ${flags.map(f => `<p class="fcard-flag">${esc(f)}</p>`).join('')}
                    </div>
                </details>`;
        };
        const grid = $('#finder-grid');
        const q = $('#finder-q');
        const filter = $('#finder-filter');
        const status = $('#finder-count');

        grid.innerHTML = data.map(d => `
            <li class="fcard" data-code="${esc(d.code)}">
                <div class="fcard-top"><span class="code">${esc(d.code)}</span><span class="lvl${d.lvl === 400 ? ' lvl-400' : ''}">${d.lvl}-level</span></div>
                <h3 class="fcard-title">${esc(d.info.title)}</h3>
                ${d.info.alias ? `<p class="fcard-alias">Listed as ${esc(d.info.alias)}</p>` : ''}
                ${d.info.note ? `<p class="fcard-note">${esc(d.info.note)}</p>` : ''}
                <ul class="roles" aria-label="Counts toward">${d.roles.map(r => `<li class="role role-${r.cls}">${esc(r.label)}</li>`).join('')}</ul>
                ${descHtml(d)}
            </li>`).join('');
        const cards = $$('.fcard', grid);

        const expand = $('#finder-expand');
        const syncExpand = () => {
            if (!expand) return;
            const visible = $$('.fcard:not([hidden]) .fcard-desc', grid);
            const allOpen = visible.length > 0 && visible.every(dt => dt.open);
            expand.setAttribute('aria-pressed', String(allOpen));
            expand.textContent = allOpen ? 'Hide all descriptions' : 'Show all descriptions';
        };
        if (expand) {
            expand.addEventListener('click', () => {
                const open = expand.getAttribute('aria-pressed') !== 'true';
                $$('.fcard:not([hidden]) .fcard-desc', grid).forEach(dt => { dt.open = open; });
                syncExpand();
            });
            grid.addEventListener('toggle', syncExpand, true);
        }

        const norm = s => s.toLowerCase().replace(/[‐-―]/g, '-');
        const apply = () => {
            const term = norm(q.value.trim());
            const compact = term.replace(/\s+/g, '');
            const f = filter.value;
            const lvl = ($('input[name="finder-lvl"]:checked', root) || {}).value || 'all';
            let shown = 0;
            data.forEach((d, i) => {
                const hay = norm(`${d.code} ${d.info.alias || ''} ${d.info.title} ${d.cat ? d.cat.desc : ''}`);
                const matchText = !term || hay.includes(term) || hay.replace(/\s+/g, '').includes(compact);
                const matchFilter = f === 'all'
                    || (f === 'core' && d.roles.some(r => r.cls === 'core' || r.cls === 'breadth'))
                    || (f === 'int' && d.code === D.internship)
                    || d.roles.some(r => r.conc === f || (r.adv && r.adv.includes(f)));
                const matchLvl = lvl === 'all' || String(d.lvl) === lvl;
                const on = matchText && matchFilter && matchLvl;
                cards[i].hidden = !on;
                if (on) shown += 1;
            });
            const label = f === 'all' ? '' : ` for ${filter.options[filter.selectedIndex].text}`;
            status.textContent = shown ? `Showing ${shown} of ${data.length} courses${label}.` : 'No courses match. Try a different number, word, or filter.';
            syncExpand();
        };
        q.addEventListener('input', apply);
        filter.addEventListener('change', apply);
        $$('input[name="finder-lvl"]', root).forEach(r => r.addEventListener('change', apply));
        apply();

        finderApi = {
            show({ query = '', conc = 'all' } = {}) {
                q.value = query;
                filter.value = conc;
                const all = $('input[name="finder-lvl"][value="all"]', root);
                if (all) all.checked = true;
                apply();
            }
        };

        document.addEventListener('click', e => {
            const a = e.target.closest('[data-finder-with]');
            if (!a) return;
            e.preventDefault();
            finderApi.show({ conc: a.dataset.finderWith });
            goTo($('#courses'), { flash: false });
            history.replaceState(null, '', '#courses');
        });
    }

    /* =========================================== Study Plan sketcher */

    function initPlanner() {
        const root = $('#planner-app');
        if (!root || !D) return;
        const KEY = 'mpa-plan-v1';
        const TOTAL_COURSES = D.rules.totalUnits / D.rules.unitsPerCourse;
        const OTHER = 'OTHER';
        let state = Object.assign({ c: null, intern: 'unknown', picks: {}, done: {} }, store.get(KEY, {}));
        const save = () => store.set(KEY, state);
        const picksFor = id => (state.picks[id] = state.picks[id] || {});

        // Build the list of rows (fixed courses and choice slots) for the current plan.
        function model() {
            const c = concById(state.c);
            const picks = c ? picksFor(c.id) : {};
            const rows = [];
            const taken = new Set();
            const add = (row) => {
                // Drop a saved choice that is no longer valid (already used above, or no longer offered)
                if (row.choice && row.code && row.code !== OTHER && (taken.has(canon(row.code)) || !row.options.includes(row.code))) row.code = '';
                if (row.choice && row.code === OTHER && !row.allowOther) row.code = '';
                rows.push(row);
                if (row.code && row.code !== OTHER) taken.add(canon(row.code));
            };

            D.paCore.forEach(code => add({ group: 'core', code, fixed: true }));

            if (c) {
                // concentration slots
                c.slots.forEach((s, si) => {
                    if (s.pick === s.from.length) {
                        s.from.forEach(code => {
                            if (D.paCore.includes(code)) add({ group: 'conc', code, fixed: true, counted: 'core', slot: s });
                            else add({ group: 'conc', code, fixed: true, slot: s });
                        });
                    } else {
                        const chosen = (picks[`s${si}`] || []).slice(0, s.pick);
                        for (let k = 0; k < s.pick; k++) {
                            add({ group: 'conc', key: `s${si}`, idx: k, choice: true, options: s.from, code: chosen[k] || '', slot: s });
                        }
                    }
                });

                // breadth: satisfied by any concentration course already in the plan?
                const inPlan = rows.filter(r => r.code && D.breadth.includes(r.code)).map(r => r.code);
                if (inPlan.length) {
                    rows.push({ group: 'breadth', satisfiedBy: inPlan[0] });
                } else {
                    add({ group: 'breadth', key: 'breadth', idx: 0, choice: true, options: D.breadth, code: (picks.breadth || [])[0] || '' });
                }

                if (state.intern === 'yes') add({ group: 'int', code: D.internship, fixed: true });

                // advisor-approved electives fill whatever is left of the twelve
                const used = rows.filter(r => !r.satisfiedBy && !r.counted).length;
                const n = Math.max(0, TOTAL_COURSES - used);
                const chosen = (picks.adv || []).slice(0, n);
                for (let k = 0; k < n; k++) {
                    add({ group: 'adv', key: 'adv', idx: k, choice: true, options: c.advisor, code: chosen[k] || '', allowOther: true });
                }
            }
            return { c, rows, taken };
        }

        const doneKey = row => (row.code === OTHER ? `${row.key}-${row.idx}-other` : canon(row.code));

        function optionList(row, takenElsewhere) {
            const opts = row.options.filter(code => code === row.code || !takenElsewhere.has(canon(code)));
            const html = [`<option value="">Choose a course…</option>`];
            const shown = code => (row.group === 'conc' && D.courses[code] && D.courses[code].alias) || code;
            const opt = code => `<option value="${esc(code)}"${code === row.code ? ' selected' : ''}>${esc(shown(code))}: ${esc(titleOf(code))}</option>`;
            [500, 400].forEach(lv => {
                const group = opts.filter(code => levelOf(code) === lv);
                if (group.length) html.push(`<optgroup label="${lv}-level courses">${group.map(opt).join('')}</optgroup>`);
            });
            if (row.allowOther) html.push(`<optgroup label="Other"><option value="${OTHER}"${row.code === OTHER ? ' selected' : ''}>Another approved course (e.g., transfer credit)</option></optgroup>`);
            return html.join('');
        }

        function rowHtml(row, rowsAll, i) {
            const id = `pl-${i}`;
            const isDone = row.code && !!state.done[doneKey(row)];
            const badges = [];
            if (row.code && row.code !== OTHER && levelOf(row.code) === 400) badges.push('<span class="pl-badge pl-badge-400">400-level</span>');
            if (row.code === D.internship) badges.push('<span class="pl-badge">300 hours</span>', '<span class="pl-badge">Outside 400-level limit</span>');
            if (row.code && D.paCore.includes(row.code) && row.group === 'core') {
                const c = concById(state.c);
                if (c && c.slots.some(s => s.pick === s.from.length && s.from.includes(row.code))) badges.push(`<span class="pl-badge">Also ${c.abbr} core</span>`);
            }
            const note = row.code && D.courses[row.code] && D.courses[row.code].note ? `<p class="pl-row-note">${esc(D.courses[row.code].note)}</p>` : '';

            if (row.choice) {
                const takenElsewhere = new Set(rowsAll.filter(r => r !== row && r.code && r.code !== OTHER).map(r => canon(r.code)));
                const label = row.group === 'adv' ? `Advisor-approved elective ${row.idx + 1}`
                    : row.group === 'breadth' ? 'Breadth course'
                    : `${row.slot.label.replace(/\s*\([^)]*\)\s*$/, '')}${row.slot.pick > 1 ? `, choice ${row.idx + 1} of ${row.slot.pick}` : ''}`;
                const cbLabel = row.code ? `Mark ${row.code === OTHER ? 'this course' : row.code} complete` : `${label}: choose a course first`;
                return `<li class="pl-row${isDone ? ' is-done' : ''}">
                    <input type="checkbox" id="${id}-done" data-done="${i}" aria-label="${esc(cbLabel)}"${isDone ? ' checked' : ''}${row.code ? '' : ' disabled'}>
                    <select class="pl-select" data-pick="${i}" aria-label="${esc(label)}">${optionList(row, takenElsewhere)}</select>
                    <span class="pl-print" aria-hidden="true">${row.code === OTHER ? 'Another approved course' : row.code ? `${esc(row.code)}: ${esc(titleOf(row.code))}` : '(not chosen yet)'}</span>
                    <span class="pl-badges">${badges.join('')}</span>
                    ${note}
                </li>`;
            }
            return `<li class="pl-row${isDone ? ' is-done' : ''}">
                <input type="checkbox" id="${id}-done" data-done="${i}"${isDone ? ' checked' : ''}>
                <label class="pl-course" for="${id}-done"><span class="code">${esc(row.code)}</span><span class="pl-title">${esc(titleOf(row.code))}</span></label>
                <span class="pl-badges">${badges.join('')}</span>
                ${note}
            </li>`;
        }

        function render(focusSel) {
            const { c, rows } = model();
            const idx = new Map(rows.map((r, i) => [r, i]));
            const groupRows = g => rows.filter(r => r.group === g && !r.satisfiedBy && !r.counted);
            const list = arr => `<ul class="pl-rows">${arr.map(r => rowHtml(r, rows, idx.get(r))).join('')}</ul>`;

            const concChoices = D.concentrations.map(x => `
                <label class="pl-choice" data-c="${x.id}">
                    <input type="radio" name="pl-conc" value="${x.id}"${state.c === x.id ? ' checked' : ''}>
                    <span>${esc(x.name)}<small>${x.abbr}</small></span>
                </label>`).join('');

            const internChoices = [['no', 'Not required', 'confirmed by your advisor'], ['yes', 'Required', 'POSC 497 joins the plan'], ['unknown', 'Not determined yet', 'ask early']]
                .map(([v, l, s]) => `<label class="pl-choice"><input type="radio" name="pl-intern" value="${v}"${state.intern === v ? ' checked' : ''}><span>${l}<small>${s}</small></span></label>`).join('');

            let board = '';
            if (!c) {
                board = `<p class="pl-hint">Choose a concentration above to lay out your twelve courses.</p>`;
            } else {
                const breadthSat = rows.find(r => r.satisfiedBy);
                const countedCore = rows.filter(r => r.counted);
                const concRows = groupRows('conc');
                board = `
                    <div class="pl-group">
                        <p class="pl-group-head">Public Administration Core <span>6 courses</span></p>
                        ${list(groupRows('core'))}
                    </div>
                    <div class="pl-group">
                        <p class="pl-group-head">Breadth: at least one of POSC 519, 525, 528</p>
                        ${breadthSat ? `<p class="pl-satisfied">${ICON('circle-check')} Met by ${esc(breadthSat.satisfiedBy)}, which is already in your ${esc(c.short)} requirements. Its units count once.</p>` : list(groupRows('breadth'))}
                    </div>
                    <div class="pl-group">
                        <p class="pl-group-head">${esc(c.name)} <span>${concRows.length} course${concRows.length === 1 ? '' : 's'}</span></p>
                        ${countedCore.map(r => `<p class="pl-satisfied">${ICON('circle-check')} ${esc(r.code)} is required here and is already counted in the core above.</p>`).join('')}
                        ${list(concRows)}
                    </div>
                    ${state.intern === 'yes' ? `<div class="pl-group"><p class="pl-group-head">Internship <span>required for you</span></p>${list(groupRows('int'))}</div>` : ''}
                    <div class="pl-group">
                        <p class="pl-group-head">Advisor-approved electives <span>${groupRows('adv').length} to reach 36 units</span></p>
                        ${groupRows('adv').length ? list(groupRows('adv')) : `<p class="pl-satisfied">${ICON('circle-check')} No electives needed: your required courses already reach 36 units.</p>`}
                    </div>`;
            }

            root.innerHTML = `
                <div class="pl-grid">
                    <div class="pl-main">
                        <fieldset class="pl-step">
                            <legend><span class="pl-step-n">1</span> Concentration</legend>
                            <div class="pl-choices pl-choices-2">${concChoices}</div>
                        </fieldset>
                        <fieldset class="pl-step">
                            <legend><span class="pl-step-n">2</span> Is the internship (POSC 497) required for you?</legend>
                            <div class="pl-choices">${internChoices}</div>
                            <p class="pl-hint">The MPA Director or MPA Advisor decides, based on your recent public or nonprofit experience. <a href="#internship">How it works</a></p>
                        </fieldset>
                        <div class="pl-step">
                            <h3><span class="pl-step-n">3</span> Your twelve courses</h3>
                            ${board}
                        </div>
                    </div>
                    ${summaryHtml(c, rows)}
                </div>`;

            bind();
            if (focusSel) {
                const el = $(focusSel, root);
                if (el) el.focus();
            }
        }

        function summaryHtml(c, rows) {
            const courseRows = rows.filter(r => !r.satisfiedBy && !r.counted);
            const chosen = courseRows.filter(r => r.code);
            const planned = chosen.length * D.rules.unitsPerCourse;
            const done = chosen.filter(r => state.done[doneKey(r)]).length * D.rules.unitsPerCourse;
            const total = D.rules.totalUnits;
            const C = 2 * Math.PI * 42;
            const arc = u => C * (1 - Math.min(u, total) / total);

            const checks = [];
            const push = (kind, title, text) => checks.push({ kind, title, text });
            const icon = { ok: 'circle-check', warn: 'triangle-alert', todo: 'circle-alert', info: 'info' };

            if (!c) {
                push('todo', 'Pick a concentration', 'Every student completes exactly one.');
            } else {
                const missing = courseRows.length - chosen.length;
                if (missing > 0) push('todo', `${planned} of ${total} units chosen`, `Choose ${missing} more course${missing === 1 ? '' : 's'} below.`);
                else push('ok', `${planned} of ${total} units planned`, 'Twelve courses, overlaps counted once.');

                const exempt = D.rules.exemptFrom400Limit || [];
                const four = chosen.filter(r => r.code !== OTHER && levelOf(r.code) === 400 && !exempt.includes(r.code)).map(r => r.code);
                const max = D.rules.max400LevelCourses;
                if (four.length > max) push('warn', `${four.length} courses at the 400 level`, `The MPA counts no more than ${max} (9 units) toward the degree (§17). POSC 497 doesn’t count toward this limit.`);
                else push('ok', `${four.length} of ${max} allowed 400-level courses`, four.length ? four.join(', ') : 'None so far.');

                if (state.intern === 'unknown') push('warn', 'Internship not determined', 'Ask the MPA Advisor or MPA Director early and make sure the answer is on your Study Plan (§10).');
                else if (state.intern === 'yes') push('info', 'POSC 497 is in your plan', '300 supervised hours. See the Lawson award (§22) for unpaid internships.');

                const titles = new Map();
                chosen.filter(r => r.code !== OTHER).forEach(r => {
                    const t = titleOf(r.code);
                    titles.set(t, (titles.get(t) || []).concat(r.code));
                });
                titles.forEach((codesWithTitle, t) => {
                    if (new Set(codesWithTitle.map(canon)).size > 1) push('warn', `${codesWithTitle.join(' and ')} share a title`, `Both are “${t}”. Check with your advisor that both can count.`);
                });
                if (chosen.some(r => r.code === OTHER)) push('info', 'Another approved course', 'Transfer and prior coursework must be evaluated by the MPA Advisor or MPA Director (§15).');
            }
            push('info', 'POSC 521 comes last, by permit', 'Take it in your final semester, after every other core course; the comprehensive exam is part of it. Enrollment is permit-only, so meet with the MPA Advisor first.');

            return `
                <aside class="pl-summary" aria-labelledby="pl-sum-h">
                    <h3 id="pl-sum-h">Your sketch</h3>
                    <div class="ring-wrap">
                        <svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
                            <circle class="ring-track" cx="50" cy="50" r="42"/>
                            <circle class="ring-plan" cx="50" cy="50" r="42" stroke-dasharray="${C}" stroke-dashoffset="${arc(planned)}"/>
                            <circle class="ring-done" cx="50" cy="50" r="42" stroke-dasharray="${C}" stroke-dashoffset="${arc(done)}"/>
                        </svg>
                        <div class="ring-text">
                            <span class="ring-big">${done}<small> / ${total}</small></span>
                            <span class="ring-sub">units completed</span>
                            <span class="ring-sub">${planned} units planned</span>
                        </div>
                    </div>
                    <p class="pl-legend" aria-hidden="true"><span class="lg-done">Completed</span><span class="lg-plan">Planned</span></p>
                    <ul class="pl-checks">
                        ${checks.map(k => `<li class="${k.kind}">${ICON(icon[k.kind])}<div><strong>${esc(k.title)}</strong>${esc(k.text)}</div></li>`).join('')}
                    </ul>
                    <div class="pl-actions">
                        <button type="button" class="btn btn-quiet btn-small" data-pl="print">${ICON('printer')} Print</button>
                        <button type="button" class="btn btn-quiet btn-small" data-pl="reset">${ICON('rotate-ccw')} Start over</button>
                    </div>
                </aside>`;
        }

        function bind() {
            const { rows } = model();
            $$('input[name="pl-conc"]', root).forEach(r => r.addEventListener('change', () => {
                state.c = r.value;
                save();
                render(`input[name="pl-conc"][value="${r.value}"]`);
                announce(`${concById(r.value).name} selected. ${$('.pl-checks li strong', root).textContent}.`);
            }));
            $$('input[name="pl-intern"]', root).forEach(r => r.addEventListener('change', () => {
                state.intern = r.value;
                save();
                render(`input[name="pl-intern"][value="${r.value}"]`);
            }));
            $$('select[data-pick]', root).forEach(sel => sel.addEventListener('change', () => {
                const row = rows[Number(sel.dataset.pick)];
                const picks = picksFor(state.c);
                const arr = (picks[row.key] || []).slice();
                arr[row.idx] = sel.value;
                picks[row.key] = arr;
                save();
                render(`select[data-pick="${sel.dataset.pick}"]`);
                const sum = $('.pl-checks li strong', root);
                if (sum) announce(sum.textContent);
            }));
            $$('input[data-done]', root).forEach(cb => cb.addEventListener('change', () => {
                const row = rows[Number(cb.dataset.done)];
                if (!row || !row.code) return;
                state.done[doneKey(row)] = cb.checked;
                save();
                render(`input[data-done="${cb.dataset.done}"]`);
                const big = $('.ring-big', root);
                if (big) announce(`${big.textContent.replace(/\s+/g, ' ')} units completed`);
            }));
            const print = $('[data-pl="print"]', root);
            print && print.addEventListener('click', () => {
                document.body.classList.add('print-plan');
                window.print();
            });
            const reset = $('[data-pl="reset"]', root);
            reset && reset.addEventListener('click', () => {
                if (!window.confirm('Clear your concentration, course choices, and completed marks from this sketch?')) return;
                state = { c: null, intern: 'unknown', picks: {}, done: {} };
                store.remove(KEY);
                render('input[name="pl-conc"]');
                announce('Sketch cleared');
            });
        }

        document.addEventListener('click', e => {
            const a = e.target.closest('[data-plan-with]');
            if (!a) return;
            e.preventDefault();
            state.c = a.dataset.planWith;
            save();
            render();
            goTo($('#planner'), { flash: false });
            history.replaceState(null, '', '#planner');
        });

        render();
    }

    /* ======================================================== search */

    function initSearch() {
        const dialog = $('#search-dialog');
        const input = $('#search-input');
        const results = $('#search-results');
        const status = $('#search-status');
        const suggest = $('#search-suggest');
        if (!dialog || !input || typeof dialog.showModal !== 'function') {
            $$('[data-open-search]').forEach(b => { b.hidden = true; });
            return;
        }

        let index = null;
        let lastFocus = null;
        const norm = s => s.toLowerCase().replace(/[‐-―]/g, '-').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();

        const build = () => {
            const items = [];
            $$('main .sec[id]').forEach(sec => {
                const h2 = $('h2', sec);
                const secTitle = h2 ? h2.textContent.replace(/^\s*\d+\s*/, '').trim() : sec.id;
                const num = h2 && $('.sec-num', h2) ? $('.sec-num', h2).textContent.trim() : '';
                const secLabel = /^\d+$/.test(num) ? `§${num} ${secTitle}` : secTitle;
                items.push({ el: sec, sec: secLabel, title: secTitle, text: secTitle, weight: 4 });
                let lastHeading = '';
                const clean = el => {
                    const c = el.cloneNode(true);
                    $$('.adv-count, .tag, .req-pick, .sec-num, .sr-only', c).forEach(n => n.remove());
                    return c.textContent.replace(/\s+/g, ' ').trim();
                };
                $$('h3, h4, summary, p, li, dt, dd, caption, tr', sec).forEach(el => {
                    if (/^H[34]$/.test(el.tagName) && !el.closest('.finder, .planner')) lastHeading = clean(el);
                    if (el.closest('.finder, .planner, .sec-head, .search-dialog, .conc-tabs, select, .flow-out, .accordion-tools')) return;
                    if (el.tagName === 'LI' && el.querySelector('li, p')) return;
                    if (el.tagName === 'P' && el.closest('li')) return;
                    if (el.tagName === 'DD' || el.tagName === 'DT') { if (el.closest('.stat-strip')) return; }
                    const text = el.textContent.replace(/\s+/g, ' ').trim();
                    if (text.length < 3) return;
                    const heading = /^(H3|H4|SUMMARY|CAPTION)$/.test(el.tagName);
                    let title = '';
                    if (heading) title = clean(el);
                    else {
                        const owner = el.closest('details');
                        const h = owner ? $('summary', owner) : null;
                        const card = el.closest('.award, .res, .person, .contact-card, .tl-body, .flow-step, .conc-panel');
                        const cardHead = card ? $('h3, h4', card) : null;
                        title = h ? clean(h) : cardHead ? clean(cardHead) : (lastHeading || secTitle);
                    }
                    items.push({ el, sec: secLabel, title, text, weight: heading ? 3 : 1 });
                });
            });
            // one entry per course, pointing at the course finder
            if (D) Object.entries(D.courses).forEach(([code, info]) => {
                const cat = CAT ? CAT.get(code) : null;
                items.push({ course: code, sec: 'Course Finder', title: `${code}: ${info.title}`, text: `${code} ${code.replace(' ', '')} ${info.alias || ''} ${info.title}${cat ? ` ${cat.desc}` : ''}`, weight: 3 });
            });
            items.forEach(it => { it.n = norm(it.text); it.nt = norm(it.title); });
            return items;
        };

        const highlight = (text, terms) => {
            let out = esc(text);
            terms.forEach(t => {
                if (t.length < 2) return;
                const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                out = out.replace(re, '<mark>$1</mark>');
            });
            return out;
        };

        const snippet = (text, term) => {
            const i = norm(text).indexOf(term);
            if (text.length <= 150) return text;
            const start = Math.max(0, i - 50);
            return `${start > 0 ? '…' : ''}${text.slice(start, start + 150).trim()}…`;
        };

        let current = [];
        const run = () => {
            const raw = input.value;
            const q = norm(raw);
            results.innerHTML = '';
            current = [];
            if (!q) { status.textContent = ''; suggest.hidden = false; return; }
            suggest.hidden = true;
            if (!index) index = build();
            const terms = q.split(' ').filter(Boolean);
            const scored = [];
            index.forEach(it => {
                const hay = it.n;
                const compact = hay.replace(/\s+/g, '');
                if (!terms.every(t => hay.includes(t) || compact.includes(t))) return;
                let score = it.weight;
                if (it.nt.includes(q)) score += 6;
                if (hay.includes(q)) score += 3;
                if (hay.startsWith(q)) score += 2;
                score -= Math.min(2, it.text.length / 400);
                scored.push({ it, score });
            });
            scored.sort((a, b) => b.score - a.score);
            const seen = new Set();
            const top = [];
            for (const s of scored) {
                const key = `${s.it.sec}|${s.it.text.slice(0, 80)}`;
                if (seen.has(key)) continue;
                seen.add(key);
                top.push(s.it);
                if (top.length >= 14) break;
            }
            current = top;
            status.textContent = top.length
                ? `${scored.length > top.length ? `Top ${top.length} of ${scored.length}` : top.length} result${top.length === 1 ? '' : 's'}. Use arrow keys to move, Enter to go.`
                : `Nothing found for “${raw.trim()}”. Try a shorter word or a course number.`;
            results.innerHTML = top.map((it, i) => `
                <li><a href="#" data-r="${i}">
                    <span class="sr-sec">${esc(it.sec)}</span>
                    <span class="sr-title">${highlight(it.title, terms)}</span>
                    ${it.text !== it.title ? `<span class="sr-snip">${highlight(snippet(it.text, terms[0]), terms)}</span>` : ''}
                </a></li>`).join('');
        };

        const openSearch = (prefill) => {
            lastFocus = document.activeElement;
            index = null; // rebuild: tool content may have changed
            dialog.showModal();
            if (typeof prefill === 'string') input.value = prefill;
            input.select();
            run();
        };
        const closeSearch = () => { if (dialog.open) dialog.close(); };

        const follow = i => {
            const it = current[i];
            if (!it) return;
            closeSearch();
            if (it.course) {
                if (finderApi) finderApi.show({ query: it.course });
                const card = $(`.fcard[data-code="${it.course}"]`);
                goTo(card || $('#courses'));
                history.replaceState(null, '', '#courses');
                return;
            }
            const sec = it.el.closest('.sec[id]');
            if (sec) history.replaceState(null, '', `#${sec.id}`);
            goTo(it.el);
        };

        $$('[data-open-search]').forEach(b => b.addEventListener('click', () => openSearch()));
        dialog.addEventListener('close', () => {
            if (lastFocus && document.contains(lastFocus) && !document.activeElement.closest('main')) lastFocus.focus();
        });
        dialog.addEventListener('click', e => { if (e.target === dialog) closeSearch(); });
        $('.search-close', dialog).addEventListener('click', closeSearch);
        input.addEventListener('input', run);
        input.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                // a search field's default Escape only clears the text; close in one press
                e.preventDefault();
                closeSearch();
            } else if (e.key === 'ArrowDown') {
                const first = $('a', results);
                if (first) { e.preventDefault(); first.focus(); }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                follow(0);
            }
        });
        results.addEventListener('click', e => {
            const a = e.target.closest('a[data-r]');
            if (!a) return;
            e.preventDefault();
            follow(Number(a.dataset.r));
        });
        results.addEventListener('keydown', e => {
            const links = $$('a', results);
            const i = links.indexOf(document.activeElement);
            if (e.key === 'ArrowDown' && i < links.length - 1) { e.preventDefault(); links[i + 1].focus(); }
            if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? links[i - 1] : input).focus(); }
        });
        $$('button[data-q]', suggest).forEach(b => b.addEventListener('click', () => {
            input.value = b.dataset.q;
            input.focus();
            run();
        }));

        document.addEventListener('keydown', e => {
            const t = e.target;
            const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
            if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                dialog.open ? closeSearch() : openSearch();
            } else if (e.key === '/' && !typing && !dialog.open) {
                e.preventDefault();
                openSearch();
            }
        });
    }

    /* ---------------------------------------------------------- boot */

    function boot() {
        initTheme();
        initPopout();
        initToc();
        initStaticTabs();
        initExplorer();
        initFinder();
        initPlanner();
        initEstimator();
        initMilestones();
        initCopyLinks();
        initDetails();
        initScrollSpy();
        initScrollUi();
        initSearch();

        // Rendering the tools changes the page height; land on a deep link again once they exist
        if (location.hash.length > 1) {
            const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
            if (target) window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();

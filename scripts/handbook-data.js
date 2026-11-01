/*
 * MPA Student Handbook 2026–2027: course and concentration data
 * ---------------------------------------------------------------
 * Single source for the concentration explorer, course finder and
 * Study Plan sketcher. Every list below is copied from the PDF handbook
 * (mpa_student_handbook_26-27.pdf), sections 8–11. The PDF governs.
 *
 * After editing, run:   node tools/verify-against-pdf.mjs
 * It re-reads the PDF and fails if any list here has drifted from it.
 */
(function (root) {
  'use strict';

  // Every course named anywhere in sections 8–11 of the PDF.
  // `alias` = cross-listed code printed in the PDF (e.g. "POSC/GEOG 478").
  const courses = {
    'POSC 509': { title: 'Foundations of Public Administration' },
    'POSC 521': {
      title: 'Capstone Seminar in Public Administration Theory',
      // Permit-only enrollment: MPA Director, Nov. 2026 (not yet in the PDF)
      note: 'Permit only. Meet with the MPA Advisor before enrolling.'
    },
    'POSC 523': { title: 'Administrative Research and Analysis' },
    'POSC 526': { title: 'Public Organizational Theory & Behavior' },
    'POSC 571': { title: 'Public Budgeting and Finance' },
    'POSC 572': { title: 'Human Resources Management for Public Organizations' },
    'POSC 519': { title: 'State and Local Government' },
    'POSC 525': { title: 'Local Government Management' },
    'POSC 528': { title: 'Seminar in Public Policy' },
    'POSC 497': { title: 'Internship in Public Administration' },

    'CRJU 405': { title: 'Criminal Justice Policy' },
    'CRJU 491': { title: 'Applied Policy Research', alias: 'CRJU/POSC 491' },
    'ECON 416': { title: 'Benefit Cost and Microeconomic Policy Analysis' },
    'ECON 417': { title: 'Public Finance' },
    'ENST 595T': {
      title: 'Selected Topics in Environmental Problems',
      note: 'Only approved sections count. Consult the MPA Advisor before enrolling.'
    },
    'MGMT 441': { title: 'Labor–Management Relations' },
    'POSC 421': { title: 'Government and the Economy' },
    'POSC 423': { title: 'Diversity in Public Management' },
    'POSC 424': { title: 'Health Policy' },
    'POSC 425': { title: 'Policy Analysis' },
    'POSC 426': { title: 'Education Politics and Policy' },
    'POSC 427': { title: 'Metropolitan Politics and Policymaking' },
    'POSC 428': { title: 'Environmental Policy and Politics' },
    'POSC 430': { title: 'Nonprofit Organizations and Advocacy' },
    'POSC 446': { title: 'Corruption, Ethics and Public Policy' },
    'POSC 459': { title: 'Social Welfare Politics and Policy' },
    'POSC 475': { title: 'Administrative Law' },
    'POSC 478': { title: 'Urban Planning Principles', alias: 'POSC/GEOG 478' },
    'POSC 484': { title: 'Planning Methods', alias: 'POSC/GEOG 484' },
    'POSC 491': { title: 'Applied Policy Research', alias: 'CRJU/POSC 491' },
    'POSC 522': { title: 'Seminar in Public Personnel Administration' },
    'POSC 580': { title: 'Emergency Management in Public Administration' },
    'POSC 582': { title: 'Organizational Development and Change' },
    'POSC 583': { title: 'Public Budgeting and Finance II' },
    'POSC 588': { title: 'Collaborative Governance' },
    'PUBH 424': { title: 'Health Policy' },
    'PUBH 524': { title: 'Public Health Administration' }
  };

  // §9 Public Administration Core: all six, plus at least one breadth course.
  const paCore = ['POSC 509', 'POSC 521', 'POSC 523', 'POSC 526', 'POSC 571', 'POSC 572'];
  const breadth = ['POSC 519', 'POSC 525', 'POSC 528'];
  const internship = 'POSC 497';

  // Codes the PDF prints as one cross-listed course ("CRJU/POSC 491").
  // The sketcher treats each group as a single course.
  // POSC 424/PUBH 424: the University Catalog says they are the same course.
  const crossListed = [['CRJU 491', 'POSC 491'], ['POSC 424', 'PUBH 424']];

  // §11 Program Concentrations. Each `slots` entry is one requirement group:
  //   pick = how many distinct courses from `from` the student must take.
  const concentrations = [
    {
      id: 'hr',
      name: 'Human Resources Management',
      short: 'Human Resources',
      abbr: 'HR',
      slots: [
        { label: 'Core Course', pick: 1, from: ['POSC 572'] },
        {
          label: 'Concentration Electives (Take Any Two)',
          pick: 2,
          from: ['MGMT 441', 'POSC 423', 'POSC 475', 'POSC 522', 'POSC 582']
        }
      ],
      advisor: [
        'CRJU 491', 'MGMT 441', 'POSC 421', 'POSC 423', 'POSC 424', 'POSC 425',
        'POSC 426', 'POSC 427', 'POSC 430', 'POSC 446', 'POSC 459', 'POSC 475',
        'POSC 478', 'POSC 484', 'POSC 491', 'POSC 519', 'POSC 522', 'POSC 525',
        'POSC 528', 'POSC 580', 'POSC 582', 'POSC 583', 'POSC 588', 'PUBH 424'
      ]
    },
    {
      id: 'lgm',
      name: 'Local Government Management',
      short: 'Local Government',
      abbr: 'LGM',
      slots: [
        { label: 'Core Course', pick: 1, from: ['POSC 525'] },
        { label: 'Concentration Core Courses (Take One)', pick: 1, from: ['POSC 427', 'POSC 519'] },
        {
          label: 'Concentration Electives (Take One)',
          pick: 1,
          from: ['POSC 478', 'POSC 484', 'POSC 427', 'POSC 519', 'POSC 580', 'POSC 588', 'ENST 595T']
        }
      ],
      advisor: [
        'CRJU 491', 'MGMT 441', 'POSC 421', 'POSC 423', 'POSC 424', 'POSC 425',
        'POSC 426', 'POSC 427', 'POSC 430', 'POSC 446', 'POSC 459', 'POSC 475',
        'POSC 478', 'POSC 484', 'POSC 491', 'POSC 519', 'POSC 522', 'POSC 528',
        'POSC 580', 'POSC 582', 'POSC 583', 'POSC 588', 'PUBH 424'
      ]
    },
    {
      id: 'fin',
      name: 'Public Finance Management',
      short: 'Public Finance',
      abbr: 'FIN',
      slots: [
        { label: 'Concentration Core Courses (Take Both)', pick: 2, from: ['POSC 571', 'POSC 583'] },
        {
          label: 'Concentration Electives (Take One)',
          pick: 1,
          from: ['POSC 421', 'POSC 425', 'ECON 416', 'ECON 417']
        }
      ],
      advisor: [
        'CRJU 491', 'ECON 416', 'ECON 417', 'POSC 421', 'POSC 423', 'POSC 424',
        'POSC 425', 'POSC 426', 'POSC 427', 'POSC 430', 'POSC 446', 'POSC 459',
        'POSC 475', 'POSC 478', 'POSC 484', 'POSC 491', 'POSC 519', 'POSC 525',
        'POSC 528', 'POSC 580', 'POSC 582', 'POSC 588', 'PUBH 424'
      ]
    },
    {
      id: 'pp',
      name: 'Public Policy',
      short: 'Public Policy',
      abbr: 'PP',
      slots: [
        { label: 'Concentration Core Courses (Take Both)', pick: 2, from: ['POSC 425', 'POSC 528'] },
        {
          label: 'Concentration Electives (Take One)',
          pick: 1,
          from: [
            'POSC 421', 'POSC 426', 'POSC 427', 'POSC 428', 'POSC 430',
            'CRJU 405', 'CRJU 491', 'ECON 416', 'PUBH 524'
          ]
        }
      ],
      advisor: [
        'CRJU 405', 'CRJU 491', 'ECON 416', 'POSC 421', 'POSC 423', 'POSC 424',
        'POSC 426', 'POSC 427', 'POSC 446', 'POSC 475', 'POSC 478', 'POSC 484',
        'POSC 491', 'POSC 519', 'POSC 525', 'POSC 580', 'POSC 582', 'POSC 583',
        'POSC 588', 'PUBH 424', 'PUBH 524'
      ]
    }
  ];

  // Program decisions that override the PDF until its next revision.
  // The verifier skips these courses in the PDF's lists and warns while
  // the PDF still prints them.
  const retired = {
    'POSC 539': 'Seminar in Nonprofit Sector Management: retired (confirmed by the MPA Director, Oct. 2026)'
  };

  // §8 and §17: rules the Study Plan sketcher checks.
  const rules = {
    totalUnits: 36,
    unitsPerCourse: 3,
    max400LevelCourses: 3,
    // POSC 497 does not count toward the 400-level limit (MPA Director, Oct. 2026).
    exemptFrom400Limit: ['POSC 497']
  };

  // §7 Cost of Degree, 2026–2027 estimates.
  const costs = {
    perSemester: { upTo6: 3320.58, sevenPlus: 5114.58 },
    nonresidentPerUnit: 471
  };

  const level = code => {
    const m = code.match(/\d{3}/);
    return m ? Number(m[0][0]) * 100 : null;
  };

  const DATA = { courses, paCore, breadth, internship, crossListed, retired, concentrations, rules, costs, level };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DATA;
  } else {
    root.MPA_DATA = DATA;
  }
})(typeof window !== 'undefined' ? window : globalThis);

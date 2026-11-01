/*
 * Catalog descriptions for the Course Finder
 * ---------------------------------------------------------------
 * Copied from the CSUF University Catalog course descriptions
 * (https://fullerton.catalog.acalog.com/content.php?catoid=101&navoid=15189)
 * in November 2026. Text is the catalog's own wording; only two missing
 * spaces were restored ("social and", "CBE (not").
 *
 * The catalog blocks automated downloads, so refresh this by hand: open
 * a course in the catalog and paste its description, prerequisite, and
 * "Typically Offered" lines into the matching entry below.
 *
 * Fields: desc, prereq, credit, offered, online (true if the catalog says
 * sections may be offered online), consent, same (cross-listed course
 * whose entry this one shares).
 */
(function (root) {
  'use strict';

  const UG = '400-level Undergraduate Course available for Graduate Credit';
  const GRAD = 'Graduate-level';

  const catalog = {
    'CRJU 405': {
      desc: 'Evolving purposes and practices associated with the development of criminal justice policies, principally in the U.S. Particular topics, such as sentencing legislation, illustrate the development, adoption and impact of public policy on criminal justice systems.',
      prereq: 'CRJU 101 or CRJU 300, CRJU 100 or CRJU 301, CRJU 330, CRJU 340; or graduate standing',
      credit: UG, online: true
    },
    'CRJU 491': { same: 'POSC 491' },
    'ECON 416': {
      desc: 'Application of economic models to public policy. Cost-Benefit analysis of public projects. Estimation of benefits and costs in a market economy. Concepts of economic welfare, efficiency, and equity. Applications to selected policy areas.',
      prereq: 'ECON 201 or graduate standing.',
      credit: UG, offered: 'Fall'
    },
    'ECON 417': {
      desc: 'Government finance at the federal, state and local levels; impact of taxation and spending on resource allocation, income distribution, stabilization and growth.',
      prereq: 'ECON 310, ECON 315 or ECON 515.',
      credit: UG, offered: 'Periodically'
    },
    'ENST 595T': {
      desc: 'Various environmental topics, contemporary or historic, that focus on problems (e.g., law, endangered habitats, planning, global environmental issues, etc.). Topic chosen and outline will be circulated prior to registration. May be repeated with different topics for a maximum of 18 units.',
      prereq: 'graduate standing in Environmental Studies.',
      credit: GRAD, online: true, offered: 'Fall/Spring'
    },
    'MGMT 441': {
      desc: 'Impact of labor-management relations upon labor, management and the public. Proper grievance procedure, collective bargaining and settlement of disputes.',
      prereq: 'CBE (not pre-business) major - BUAD 301 with a “C” (2.0) or better; other major - BUAD 210 with a “C” (2.0) or better; or graduate standing.',
      credit: UG, offered: 'Fall/Spring'
    },
    'POSC 421': {
      desc: 'Regulation and deregulation of business. Industrial policy. Government taxes and expenditures. Emphasis on national government.',
      prereq: 'POSC 320, any economics course, or graduate standing.',
      credit: UG, online: true, offered: 'Fall/Spring'
    },
    'POSC 423': {
      desc: 'Issues in public employment related to gender, race and ethnicity, disability, veteran status, age, culture and other current topics. Focus on leadership, mentoring, recruitment and discrimination. Topics of current interest include representative bureaucracy, equity and intersectionality.',
      prereq: 'POSC 320 or graduate standing',
      credit: UG, online: true, offered: 'Fall/Spring'
    },
    'POSC 424': {
      desc: 'Health policy actors and processes in the United States. Roles of Congress, the President, bureaucracy and interests groups in health policy and policy process are explored, including an introduction to policy analysis. (PUBH 424 and POSC 424 are the same course).',
      prereq: 'PUBH 320, POSC 320 or POSC 509.',
      credit: UG, offered: 'Periodically'
    },
    'POSC 425': {
      desc: 'Provides conceptual approach and skills required to understand and project the outcomes and effects of public policy; scope of approaches undertaken in policy analysis from both a political and an economic perspective.',
      prereq: 'POSC 100 or graduate standing.',
      credit: UG, offered: 'Fall/Spring'
    },
    'POSC 426': {
      desc: 'History and expansion of public education in the United States. Roles of school districts and the state and federal governments in setting education policy. Current issues of education policy and public higher education.',
      prereq: 'POSC 100 or graduate standing.',
      credit: UG, offered: 'Periodically'
    },
    'POSC 427': {
      desc: 'Policy issues and alternatives in urban and metropolitan problem areas, such as law enforcement, transportation, housing or poverty.',
      prereq: 'POSC 100 or graduate standing.',
      credit: UG, offered: 'Periodically'
    },
    'POSC 428': {
      desc: 'The political, social and economic dimensions of environmental policy in the United States. Topics include: history of environmental policy; government’s role in environmental protection; influence of interest groups and public opinion on environmental policy; impact of environmental policy on society.',
      prereq: 'G.E. Area 4A; POSC 100 or HONR 201B; or graduate standing.',
      credit: UG, online: true
    },
    'POSC 430': {
      desc: 'Purpose and history of the nonprofit sector in the United States. Topics include the management of modern nonprofits, and the nonprofit role in advocacy, lobbying, policymaking and policy implementation.',
      prereq: 'POSC 100, GE Area 4A; or graduate standing.',
      credit: UG, online: true, offered: 'Periodically'
    },
    'POSC 446': {
      desc: 'Ethical problems that face persons in the public service. Practical decision-making.',
      prereq: 'POSC 100 or HONR 201B; or graduate standing.',
      credit: UG, online: true
    },
    'POSC 459': {
      desc: 'American social policies, such as welfare, Social Security, and health care and the political environment in which they exist. Origins, implementation and reforms of current social policies, emphasizing questions of effectiveness and policy improvements.',
      prereq: 'POSC 100 or graduate standing.',
      credit: UG, offered: 'Periodically'
    },
    'POSC 475': {
      desc: 'Law as it affects public officials and agencies in their relations with private citizens and the business community. Case materials and regulatory practices.',
      prereq: 'POSC 100 or graduate standing.',
      credit: UG, online: true, offered: 'Periodically'
    },
    'POSC 478': {
      desc: 'Seminar/discussion on conceptual themes and legal foundations of American urban planning. Policy areas associated with urbanization and suburbanization processes: land use, economic development, redevelopment, housing systems, neighborhood dynamics and growth management. (GEOG 478 and POSC 478 are the same course.)',
      prereq: 'GEOG 361, POSC 320 or graduate standing.',
      credit: UG, offered: 'Periodically'
    },
    'POSC 484': {
      desc: 'Seminar and Practicum on methods in urban planning. Analytical techniques and basic data sources. Population forecasting, housing surveys, economic development, fiscal impacts and area revitalization. Individual and team projects. (GEOG 484 and POSC 484 are the same course.)',
      prereq: 'GEOG 478 or POSC 478.',
      credit: UG, offered: 'Periodically'
    },
    'POSC 491': {
      desc: 'Conduct independent research, under faculty supervision, on policy-related issues proposed by community partners, students and faculty. Research topics will vary each semester, but will be based within criminal justice, political science and/or public administration. May be repeated for a maximum of 6 units. Requires instructor approval, by application and faculty referral. (CRJU 491 and POSC 491 are the same course.)',
      prereq: 'for CRJU 491 - CRJU 100, CRJU 300, CRJU 340. For POSC 491 - POSC 100 or HONR 201B; POSC 321; or POSC 407.',
      credit: UG, consent: 'Department Consent Required', offered: 'Periodically'
    },
    'POSC 497': {
      desc: 'Work 12-20 hours per week as supervised interns in a public agency. Supervision by the faculty and cooperating agency. In addition, a weekly seminar.',
      prereq: 'POSC 320 or POSC 509.',
      credit: UG, online: true, offered: 'Fall/Spring'
    },
    'POSC 509': {
      desc: 'Introduction to the field of public administration. Topics include the history of the field, the legal and political environment of public administration, organizational theory and practice, decision-making, systems analysis, performance evaluation and administrative improvement. Non-Public Administration/Political Science graduate students must obtain department permission to enroll.',
      prereq: 'Public Administration or Political Science graduate standing.',
      credit: GRAD, offered: 'Fall/Spring'
    },
    'POSC 519': {
      desc: 'Structure, processes, functions and interrelationships of state and local governments in American society. State, county, municipal and special district government in California as compared with other states.',
      credit: GRAD, online: true, offered: 'Fall/Spr periodically'
    },
    'POSC 521': {
      desc: 'Concepts, models and ideologies of public administration within the larger political system.',
      prereq: 'POSC 509, POSC 523, POSC 526, POSC 571, POSC 572; Human Resources, Local Government Management, Public Finance Management or Public Policy concentration major.',
      // The catalog says "Fall"; the MPA Director confirmed fall and spring (Nov. 2026).
      credit: GRAD, online: true, offered: 'Fall/Spring'
    },
    'POSC 522': {
      desc: 'Topics in public personnel administration. May be repeated once for credit with different content.',
      credit: GRAD, offered: 'Periodically'
    },
    'POSC 523': {
      desc: 'Conceptual methods employed in administrative research and analysis: organization and procedure of surveys, performance evaluation, social impact assessment, computer data analysis and report writing.',
      credit: GRAD, online: true, offered: 'Fall/Spring'
    },
    'POSC 525': {
      desc: 'Critical administrative issues that local government professionals face. Topics include intergovernmental relations, urban political structure, fragmentation, planning, finance, and service delivery.',
      prereq: 'POSC 509.',
      credit: GRAD, online: true, offered: 'Spring/Summer'
    },
    'POSC 526': {
      desc: 'Management-oriented analysis of organizational behavior. Treatments of decision-making, leadership, communication, group dynamics and ethical aspects of organization. Applying theories of administration and systems management to public and volunteer programs and services. (POSC 526 and AGNG 526 are the same course).',
      prereq: 'Public Administration or Gerontology graduate standing.',
      credit: GRAD, offered: 'Fall/Spring'
    },
    'POSC 528': {
      desc: 'Interplay between public policy and program administration in federal government. Discuss administrators’ role in policy development, administrative discretion in implementing policy, use of political resources by administrators.',
      credit: GRAD, online: true, offered: 'Spring'
    },
    'POSC 571': {
      desc: 'State and local budgeting and taxes. Local financial management and cost benefit analysis. Emphasizes local government in Southern California.',
      prereq: 'Public Administration graduate standing.',
      credit: GRAD, online: true, offered: 'Fall/Spring'
    },
    'POSC 572': {
      desc: 'Students who have taken POSC 422 for credit on study plan may not also take this course as part of study plan. Political and legal environments of public personnel management, the general and career civil services and political appointment system and introduces the students to such personnel functions as selection, position classification, performance evaluation and compensation.',
      credit: GRAD, offered: 'Fall/Spring'
    },
    'POSC 580': {
      desc: 'Comprehensive review of the state-of-the-art in prevention, warning, evacuation, rescue and recovery systems. Development of public policy relating to land use planning, recovery and issues of liability; intergovernmental relations and effective planning.',
      credit: GRAD, offered: 'Periodically'
    },
    'POSC 582': {
      desc: 'Perspectives and theories on organization change and development. Introduction to a variety of concept skills and tools necessary to achieve organizational goals, and manage organizational change successfully.',
      prereq: 'POSC 526.',
      credit: GRAD, online: true, offered: 'Periodically'
    },
    'POSC 583': {
      desc: 'Introduction to basic principles of public sector financial management and accounting, including public budgeting practices and processes, governmental accounting standards and procedures, revenue sources and tax administration, cash management and purchasing, investment and debt management, risk management and auditing.',
      prereq: 'Graduate standing and POSC 571.',
      credit: GRAD, online: true, offered: 'Summer periodically'
    },
    'POSC 588': {
      desc: 'Topics include federalism, intersectoral public administration, intergovernmental relations, public-private partnerships, public contract management, interlocal agreements, network governance.',
      prereq: 'POSC 509.',
      credit: GRAD, online: true, offered: 'Winter periodically'
    },
    'PUBH 424': {
      desc: 'Health policy actors and processes in the United States. Roles of Congress, the President, bureaucracy and interests groups in health policy and policy process are explored, including an introduction to policy analysis. (PUBH 424 and POSC 424 are the same course).',
      prereq: 'PUBH 320, POSC 320 or POSC 509.',
      credit: UG, offered: 'Fall/Spring'
    },
    'PUBH 524': {
      desc: 'Essential management principles for public health settings, focusing on budgeting, financial reporting and human resources. Techniques for effective stakeholder engagement. Develop skills in organizational and resource stewardship to enhance public health initiatives.',
      prereq: 'Public Health graduate standing.',
      credit: GRAD
    }
  };

  const CATALOG = {
    source: 'CSUF University Catalog',
    url: 'https://fullerton.catalog.acalog.com/content.php?catoid=101&navoid=15189',
    copied: 'November 2026',
    get(code) {
      const entry = catalog[code];
      return entry && entry.same ? catalog[entry.same] : entry;
    },
    codes: Object.keys(catalog)
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CATALOG;
  else root.MPA_CATALOG = CATALOG;
})(typeof window !== 'undefined' ? window : globalThis);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';

interface MetaItem {
  id: string;
  testNumber: number;
  testType: 'practice' | 'mock';
  courseType: string;
  title: string;
  description: string;
}

const metaRaw = JSON.parse(fs.readFileSync('scripts/test_meta.json', 'utf-8'));
const readingMeta: MetaItem[] = metaRaw.reading;
const listeningMeta: MetaItem[] = metaRaw.listening;

console.log(`Processing ${readingMeta.length} reading tests and ${listeningMeta.length} listening tests...`);

// ==========================================
// READING TEST GENERATOR (40 Questions / 3 Passages)
// ==========================================

function generateReadingTest(meta: MetaItem) {
  const cleanTopic = meta.title.replace(/^CD-IELTS (Practice \d+:|Mock \d+:)/, '').trim();
  const subtopicA = cleanTopic.split('&')[0]?.trim() || cleanTopic;
  const subtopicB = cleanTopic.split('&')[1]?.trim() || 'Modern Applications';

  // Passage 1: Descriptive / Foundation (Q1 - Q13)
  const p1Title = `Passage 1: Foundations of ${subtopicA}`;
  const p1Subtitle = `Historical Emergence and Foundational Methodologies in ${cleanTopic}`;
  const p1Text = `Paragraph A: In recent decades, scholarly inquiry into ${cleanTopic.toLowerCase()} has fundamentally altered our understanding of modern applied research. Historical documentation and archaeological fieldwork across multiple continents demonstrate that early pioneers confronted profound technological and physical bottlenecks. Rather than relying on haphazard trial and error, rigorous empirical experimentation was systematically deployed to optimize performance under boundary conditions.

Paragraph B: The central theoretical challenge centered around measurement precision and environmental calibration. When analyzing initial specimens or field measurements, researchers discovered unexpected variability. In controlled laboratory replications, minor perturbations produced marked shifts in output metrics. Consequently, contemporary practitioners have integrated high-resolution computational modeling to simulate longitudinal stress distributions before full deployment.

Paragraph C: Empirical field investigations conducted across primary academic testing sites yielded remarkable datasets. As observed by leading research teams, the convergence of structural stability and material efficiency required a delicate architectural equilibrium. By utilizing modular configurations, engineers and scientists managed to multiply functional throughput without incurring exponential increases in manufacturing or resource expenditure.

Paragraph D: Beyond structural mechanics, secondary considerations regarding ecological sustainability and human factor adaptation became paramount. Cross-sectional epidemiological and environmental surveys revealed that unregulated implementation introduced secondary systemic externalities. Modern regulatory protocols therefore mandate strict environmental impact assessments and periodic lifecycle inspections to safeguard both human practitioners and indigenous biomes.

Paragraph E: Looking ahead to prospective developments, multidisciplinary integration between ${cleanTopic.toLowerCase()} and adjacent technological domains promises unprecedented breakthroughs. By harnessing advanced analytics, synthetic materials, and automated diagnostic sensors, future generations of systems will achieve self-monitoring and adaptive calibration. The historical evolution of this field affirms that persistent technical inquiry and cross-disciplinary collaboration remain the bedrock of sustainable progress.`;

  // Passage 2: Analytical / Case Study (Q14 - Q26)
  const p2Title = `Passage 2: Technological Adaptation and Structural Dynamics of ${subtopicB}`;
  const p2Subtitle = `Empirical Analysis of Industrial Implementation and Resource Optimization`;
  const p2Text = `Paragraph A: The transition from experimental prototypes to widespread industrial implementation of ${subtopicB.toLowerCase()} has prompted rigorous evaluation among institutional stakeholders. Early implementation schemes faced logistical hurdles, primarily linked to the irregular supply of raw materials and uneven workforce training. Studies conducted across five representative metropolitan zones revealed that facilities deploying standardized maintenance regimens demonstrated a forty percent reduction in unscheduled downtime compared to non-standardized counterparts.

Paragraph B: Economic viability remains a decisive factor in determining long-term adoption rates. While the capital investment required for automated infrastructure often exceeds conventional baseline projections by a significant margin, longitudinal financial modeling highlights clear economies of scale. Reduced operational overheads, coupled with substantial declines in consumable waste, typically enable complete capital expenditure recovery within six operating quarters.

Paragraph C: Technical oversight mechanisms have undergone a parallel evolution. Traditional manual verification, which relied heavily on retrospective diagnostic sampling, proved insufficient for detecting microscopic micro-fractures and thermal fluctuations in real time. The integration of fiber-optic sensor arrays and ultrasonic telemetry has transformed quality assurance protocols, permitting predictive maintenance interventions before catastrophic failures materialize.

Paragraph D: Community and demographic impacts present an equally intricate dimension. In regions where infrastructure modernization was implemented without adequate civic consultation, local populations expressed skepticism regarding noise pollution and visual disruption. Conversely, municipalities that established transparent stakeholder forums achieved near-unanimous public approval ratings, accompanied by faster permitting turnaround schedules.

Paragraph E: Environmental monitoring over extended observation windows underscores notable positive externalities. Carbon emissions associated with modernized processing lines dropped by twenty-eight percent relative to historical baselines. Concurrently, closed-loop water recirculation systems cut freshwater withdrawal demands by half, confirming that technological efficiency and ecological stewardship can be harmonized effectively.

Paragraph F: To consolidate these advancements, international standards organizations have initiated harmonization frameworks. Standardized nomenclature, unified stress-testing protocols, and reciprocal certification regimes are diminishing cross-border trade friction, creating fertile ground for collaborative global research and sustained industrial productivity.`;

  // Passage 3: Complex Theoretical Argument & Future Horizon (Q27 - Q40)
  const p3Title = `Passage 3: Theoretical Frontiers and Epistemological Paradigms in ${cleanTopic}`;
  const p3Subtitle = `Philosophical Implications and Future Trajectories of Applied Methodologies`;
  const p3Text = `Paragraph A: At the conceptual boundary of ${cleanTopic.toLowerCase()}, researchers are reassessing the epistemological assumptions that have historically governed scientific modeling. Deterministic frameworks, which long assumed that physical behavior could be exhaustively calculated through linear equations, are increasingly yielding to probabilistic models that account for systemic entropy and dynamic equilibrium.

Paragraph B: This paradigm shift is vividly illustrated in recent investigations of non-linear behavior under extreme stress regimes. When materials or operational frameworks are subjected to compound oscillatory pressures, emergent properties manifest that cannot be deduced from isolated component properties alone. Critics of traditional reductionist methodologies argue that only holistic, multi-scale simulations can adequately capture these emergent phenomena.

Paragraph C: Furthermore, cognitive and algorithmic dimensions are exerting a transformative influence on research methodologies. Machine learning algorithms, trained on vast corpora of historical performance telemetry, have begun identifying subtle geometric optimizations that human designers had historically overlooked. These algorithmically derived topologies, characterized by organic, curvilinear contours, challenge conventional aesthetic and fabrication norms.

Paragraph D: Despite these computational triumphs, prominent scholars caution against uncritical reliance on black-box algorithmic outputs. Without verifiable explanatory mechanisms, proprietary artificial intelligence models risk obscuring underlying causal principles, leaving engineers unable to diagnose anomalies that fall outside training distributions. The imperative for 'explainable and verifiable computing' has thus emerged as a cornerstone of rigorous scientific scholarship.

Paragraph E: Ethical and philosophical quandaries also warrant urgent scrutiny. As autonomous systems take on greater responsibility in structural diagnosis and resource allocation, the locus of professional accountability becomes diffuse. Should catastrophic systemic failure occur, apportioning legal and ethical responsibility among software developers, algorithm trainers, hardware manufacturers, and licensed inspectors poses profound institutional challenges.

Paragraph F: In synthesis, the intellectual trajectory of ${cleanTopic.toLowerCase()} epitomizes the perpetual dialectic between empirical discovery and conceptual refinement. Progress demands not merely the accumulation of ever-larger datasets, but the philosophical fortitude to continually question foundational axioms and cultivate ethical stewardship over expanding technological prowess.`;

  // Build 40 Questions
  const questions: any[] = [];

  // Q1 - Q7: Passage 1 True/False/Not Given
  questions.push(
    {
      id: `${meta.id}_q1`,
      number: 1,
      type: 'true_false_not_given',
      questionText: `Early practitioners of ${cleanTopic} relied exclusively on haphazard trial and error without empirical validation.`,
      correctAnswer: 'FALSE',
      explanation: `Paragraph A of Passage 1 explicitly states that pioneers used 'rigorous empirical experimentation' rather than trial and error.`
    },
    {
      id: `${meta.id}_q2`,
      number: 2,
      type: 'true_false_not_given',
      questionText: `Field specimens exhibited unexpected structural variability during initial laboratory calibrations.`,
      correctAnswer: 'TRUE',
      explanation: `Paragraph B confirms that researchers 'discovered unexpected variability' in initial specimens.`
    },
    {
      id: `${meta.id}_q3`,
      number: 3,
      type: 'true_false_not_given',
      questionText: `Government subsidies funded over seventy percent of the total project expenditure during initial trials.`,
      correctAnswer: 'NOT GIVEN',
      explanation: `The passage discusses resource expenditure in Paragraph C, but makes no mention of government subsidies or exact funding percentages.`
    },
    {
      id: `${meta.id}_q4`,
      number: 4,
      type: 'true_false_not_given',
      questionText: `Modular structural configurations enabled teams to expand throughput without exponential cost increases.`,
      correctAnswer: 'TRUE',
      explanation: `Paragraph C states modular configurations allowed teams to 'multiply functional throughput without incurring exponential increases in manufacturing or resource expenditure.'`
    },
    {
      id: `${meta.id}_q5`,
      number: 5,
      type: 'true_false_not_given',
      questionText: `Unregulated implementation of early systems caused secondary environmental externalities.`,
      correctAnswer: 'TRUE',
      explanation: `Paragraph D notes that cross-sectional surveys revealed 'unregulated implementation introduced secondary systemic externalities.'`
    },
    {
      id: `${meta.id}_q6`,
      number: 6,
      type: 'true_false_not_given',
      questionText: `Modern regulatory protocols have abolished periodic lifecycle inspections in favor of self-reporting.`,
      correctAnswer: 'FALSE',
      explanation: `Paragraph D explicitly states modern protocols 'mandate strict environmental impact assessments and periodic lifecycle inspections.'`
    },
    {
      id: `${meta.id}_q7`,
      number: 7,
      type: 'true_false_not_given',
      questionText: `Synthetic materials and automated sensors will completely eliminate the need for human engineers by 2040.`,
      correctAnswer: 'NOT GIVEN',
      explanation: `Paragraph E mentions synthetic materials and automated sensors achieving self-monitoring, but does not predict eliminating human engineers by 2040.`
    }
  );

  // Q8 - Q13: Passage 1 Fill in the blanks (Sentence Completion)
  questions.push(
    {
      id: `${meta.id}_q8`,
      number: 8,
      type: 'fill_blank',
      questionText: `Pioneers deployed rigorous ______ experimentation to optimize performance under extreme boundary conditions.`,
      correctAnswer: 'empirical',
      explanation: `Paragraph A of Passage 1 states: 'rigorous empirical experimentation was systematically deployed.'`
    },
    {
      id: `${meta.id}_q9`,
      number: 9,
      type: 'fill_blank',
      questionText: `Contemporary practitioners utilize computational modeling to simulate longitudinal ______ distributions.`,
      correctAnswer: 'stress',
      explanation: `Paragraph B specifies: 'computational modeling to simulate longitudinal stress distributions.'`
    },
    {
      id: `${meta.id}_q10`,
      number: 10,
      type: 'fill_blank',
      questionText: `Researchers sought a delicate architectural ______ between structural stability and material efficiency.`,
      correctAnswer: 'equilibrium',
      explanation: `Paragraph C highlights: 'the convergence of structural stability and material efficiency required a delicate architectural equilibrium.'`
    },
    {
      id: `${meta.id}_q11`,
      number: 11,
      type: 'fill_blank',
      questionText: `Modern regulatory standards mandate strict environmental ______ assessments prior to commissioning.`,
      correctAnswer: 'impact',
      explanation: `Paragraph D notes regulatory frameworks mandate: 'strict environmental impact assessments.'`
    },
    {
      id: `${meta.id}_q12`,
      number: 12,
      type: 'fill_blank',
      questionText: `Future systems are anticipated to achieve automated diagnostic self-monitoring and adaptive ______.`,
      correctAnswer: 'calibration',
      explanation: `Paragraph E states future generations will achieve: 'self-monitoring and adaptive calibration.'`
    },
    {
      id: `${meta.id}_q13`,
      number: 13,
      type: 'fill_blank',
      questionText: `Persistent inquiry combined with cross-disciplinary ______ remains the foundation of sustainable progress.`,
      correctAnswer: 'collaboration',
      explanation: `Paragraph E affirms: 'persistent technical inquiry and cross-disciplinary collaboration remain the bedrock.'`
    }
  );

  // Q14 - Q19: Passage 2 Multiple Choice
  questions.push(
    {
      id: `${meta.id}_q14`,
      number: 14,
      type: 'multiple_choice',
      options: [
        'A. Irregular raw material supply and uneven workforce training',
        'B. Immediate opposition from international trade unions',
        'C. Legal restrictions on automated computer algorithms',
        'D. Total failure of baseline electrical power grids'
      ],
      questionText: `According to Paragraph A of Passage 2, what primary logistical hurdles hindered early implementation schemes?`,
      correctAnswer: 'A',
      explanation: `Paragraph A states: 'Early implementation schemes faced logistical hurdles, primarily linked to the irregular supply of raw materials and uneven workforce training.'`
    },
    {
      id: `${meta.id}_q15`,
      number: 15,
      type: 'multiple_choice',
      options: [
        'A. Facilities with standardized maintenance regimens cut unscheduled downtime by 40%',
        'B. Standardized facilities incurred higher operational expenses throughout',
        'C. Metropolitan centers rejected standardized maintenance protocols',
        'D. Maintenance regimens had no measurable correlation with equipment performance'
      ],
      questionText: `What did comparative studies across five metropolitan zones demonstrate regarding standardized maintenance?`,
      correctAnswer: 'A',
      explanation: `Paragraph A concludes that facilities deploying standardized maintenance regimens demonstrated a 40% reduction in unscheduled downtime.`
    },
    {
      id: `${meta.id}_q16`,
      number: 16,
      type: 'multiple_choice',
      options: [
        'A. Capital expenditure recovery is typically achieved within six operating quarters',
        'B. Long-term operating costs consistently exceed initial capital expenses',
        'C. Consumable waste multiplies as production lines scale upwards',
        'D. Capital investment costs are usually lower than baseline projections'
      ],
      questionText: `What does longitudinal financial modeling indicate concerning capital expenditure recovery (Paragraph B)?`,
      correctAnswer: 'A',
      explanation: `Paragraph B confirms that economies of scale enable complete capital expenditure recovery within six operating quarters.`
    },
    {
      id: `${meta.id}_q17`,
      number: 17,
      type: 'multiple_choice',
      options: [
        'A. It was too fast for human technicians to comprehend',
        'B. It was incapable of detecting microscopic micro-fractures in real time',
        'C. It relied excessively on expensive satellite imaging networks',
        'D. It was prohibited by regional labor safety regulations'
      ],
      questionText: `Why did traditional manual verification prove insufficient for modern quality assurance (Paragraph C)?`,
      correctAnswer: 'B',
      explanation: `Paragraph C explains manual sampling proved insufficient for detecting microscopic micro-fractures and thermal fluctuations in real time.`
    },
    {
      id: `${meta.id}_q18`,
      number: 18,
      type: 'multiple_choice',
      options: [
        'A. Municipalities establishing transparent stakeholder forums gained high approval',
        'B. Public consultation invariably delayed development permits indefinitely',
        'C. Civic forums resulted in legal bans across all surveyed jurisdictions',
        'D. Public skepticism centered entirely on taxation rather than environmental factors'
      ],
      questionText: `According to Paragraph D, how did public stakeholder engagement impact project approval?`,
      correctAnswer: 'A',
      explanation: `Paragraph D highlights that transparent stakeholder forums achieved near-unanimous public approval and faster permitting turnaround.`
    },
    {
      id: `${meta.id}_q19`,
      number: 19,
      type: 'multiple_choice',
      options: [
        'A. By twenty-eight percent relative to historical baselines',
        'B. By exactly seventy-five percent within the first month',
        'C. Emissions increased due to intensive computer server usage',
        'D. No measurable shift in carbon emissions was documented'
      ],
      questionText: `By what margin did carbon emissions decrease following processing line modernization (Paragraph E)?`,
      correctAnswer: 'A',
      explanation: `Paragraph E explicitly reports: 'Carbon emissions associated with modernized processing lines dropped by twenty-eight percent.'`
    }
  );

  // Q20 - Q26: Passage 2 Matching / Fill in Blank
  questions.push(
    {
      id: `${meta.id}_q20`,
      number: 20,
      type: 'fill_blank',
      questionText: `Facilities with standardized maintenance regimens demonstrated a ______ percent reduction in downtime.`,
      correctAnswer: 'forty',
      explanation: `Paragraph A of Passage 2 reports a forty percent reduction in unscheduled downtime.`
    },
    {
      id: `${meta.id}_q21`,
      number: 21,
      type: 'fill_blank',
      questionText: `Longitudinal models indicate full capital recovery is reached within six ______ quarters.`,
      correctAnswer: 'operating',
      explanation: `Paragraph B confirms recovery occurs within 'six operating quarters.'`
    },
    {
      id: `${meta.id}_q22`,
      number: 22,
      type: 'fill_blank',
      questionText: `Quality assurance protocols were transformed through fiber-optic arrays and ultrasonic ______.`,
      correctAnswer: 'telemetry',
      explanation: `Paragraph C specifies: 'fiber-optic sensor arrays and ultrasonic telemetry has transformed quality assurance.'`
    },
    {
      id: `${meta.id}_q23`,
      number: 23,
      type: 'fill_blank',
      questionText: `Without transparent civic consultation, residents expressed skepticism concerning noise ______ and visual disruption.`,
      correctAnswer: 'pollution',
      explanation: `Paragraph D identifies concerns regarding 'noise pollution and visual disruption.'`
    },
    {
      id: `${meta.id}_q24`,
      number: 24,
      type: 'fill_blank',
      questionText: `Modernized facilities utilize closed-loop water ______ systems to reduce freshwater consumption.`,
      correctAnswer: 'recirculation',
      explanation: `Paragraph E highlights: 'closed-loop water recirculation systems cut freshwater withdrawal demands.'`
    },
    {
      id: `${meta.id}_q25`,
      number: 25,
      type: 'fill_blank',
      questionText: `Freshwater withdrawal demands were reduced by ______ due to water recirculation.`,
      correctAnswer: 'half',
      explanation: `Paragraph E notes recirculation systems 'cut freshwater withdrawal demands by half.'`
    },
    {
      id: `${meta.id}_q26`,
      number: 26,
      type: 'fill_blank',
      questionText: `International organizations are developing standardized ______ to diminish cross-border friction.`,
      correctAnswer: 'nomenclature',
      explanation: `Paragraph F cites 'standardized nomenclature, unified stress-testing protocols...'`
    }
  );

  // Q27 - Q32: Passage 3 True/False/Not Given (or Yes/No/Not Given)
  questions.push(
    {
      id: `${meta.id}_q27`,
      number: 27,
      type: 'true_false_not_given',
      questionText: `Deterministic equations are being complemented by probabilistic models that account for systemic entropy.`,
      correctAnswer: 'TRUE',
      explanation: `Paragraph A of Passage 3 states deterministic frameworks are yielding to probabilistic models.`
    },
    {
      id: `${meta.id}_q28`,
      number: 28,
      type: 'true_false_not_given',
      questionText: `Emergent structural properties can be completely deduced from isolated component properties alone.`,
      correctAnswer: 'FALSE',
      explanation: `Paragraph B states: 'emergent properties manifest that cannot be deduced from isolated component properties alone.'`
    },
    {
      id: `${meta.id}_q29`,
      number: 29,
      type: 'true_false_not_given',
      questionText: `Machine learning models have proposed curvilinear structural contours previously overlooked by human designers.`,
      correctAnswer: 'TRUE',
      explanation: `Paragraph C observes algorithms identified optimizations with 'organic, curvilinear contours' overlooked by humans.`
    },
    {
      id: `${meta.id}_q30`,
      number: 30,
      type: 'true_false_not_given',
      questionText: `All international research universities have formally prohibited the use of black-box algorithms.`,
      correctAnswer: 'NOT GIVEN',
      explanation: `Paragraph D discusses scholars cautioning against uncritical reliance on black-box algorithms, but makes no mention of formal bans.`
    },
    {
      id: `${meta.id}_q31`,
      number: 31,
      type: 'true_false_not_given',
      questionText: `The legal responsibility for autonomous systemic failure is easily assigned under existing statutory laws.`,
      correctAnswer: 'FALSE',
      explanation: `Paragraph E states that apportioning legal and ethical responsibility 'poses profound institutional challenges' and becomes diffuse.`
    },
    {
      id: `${meta.id}_q32`,
      number: 32,
      type: 'true_false_not_given',
      questionText: `Progress in modern research requires philosophical questioning in addition to large data sets.`,
      correctAnswer: 'TRUE',
      explanation: `Paragraph F affirms progress requires 'not merely the accumulation of ever-larger datasets, but the philosophical fortitude to continually question foundational axioms.'`
    }
  );

  // Q33 - Q36: Passage 3 Multiple Choice
  questions.push(
    {
      id: `${meta.id}_q33`,
      number: 33,
      type: 'multiple_choice',
      options: [
        'A. They account for dynamic equilibrium and systemic entropy',
        'B. They eliminate mathematical uncertainty completely',
        'C. They operate independently of empirical observations',
        'D. They have been permanently superseded by manual charts'
      ],
      questionText: `Why are researchers increasingly adopting probabilistic models (Paragraph A)?`,
      correctAnswer: 'A',
      explanation: `Paragraph A emphasizes that probabilistic models account for systemic entropy and dynamic equilibrium.`
    },
    {
      id: `${meta.id}_q34`,
      number: 34,
      type: 'multiple_choice',
      options: [
        'A. Multi-scale holistic simulations',
        'B. Single-variable linear regression',
        'C. Disassembly of materials into static components',
        'D. Complete avoidance of computational software'
      ],
      questionText: `What analytical approach do critics of reductionist methodologies advocate in Paragraph B?`,
      correctAnswer: 'A',
      explanation: `Paragraph B states: 'only holistic, multi-scale simulations can adequately capture these emergent phenomena.'`
    },
    {
      id: `${meta.id}_q35`,
      number: 35,
      type: 'multiple_choice',
      options: [
        'A. Proprietary algorithms may obscure underlying causal principles',
        'B. Algorithms operate too slowly for industrial applications',
        'C. Computational models consume excessive electrical energy',
        'D. Software companies refuse to license diagnostic programs'
      ],
      questionText: `What primary concern do scholars raise regarding black-box artificial intelligence outputs (Paragraph D)?`,
      correctAnswer: 'A',
      explanation: `Paragraph D warns that without verifiable explanatory mechanisms, AI models risk obscuring underlying causal principles.`
    },
    {
      id: `${meta.id}_q36`,
      number: 36,
      type: 'multiple_choice',
      options: [
        'A. The diffusion of professional accountability among multiple parties',
        'B. Universal consensus regarding legal liabilities',
        'C. Rapid settlement of structural failure claims in courts',
        'D. The absence of licensed safety inspectors in major facilities'
      ],
      questionText: `What institutional dilemma arises when autonomous systems experience catastrophic failure (Paragraph E)?`,
      correctAnswer: 'A',
      explanation: `Paragraph E highlights that the locus of accountability becomes diffuse among software developers, hardware builders, and inspectors.`
    }
  );

  // Q37 - Q40: Passage 3 Sentence Completion / Fill in Blanks
  questions.push(
    {
      id: `${meta.id}_q37`,
      number: 37,
      type: 'fill_blank',
      questionText: `Under compound oscillatory pressures, emergent ______ manifest that cannot be predicted from isolated parts.`,
      correctAnswer: 'properties',
      explanation: `Paragraph B of Passage 3 states: 'emergent properties manifest that cannot be deduced from isolated component properties alone.'`
    },
    {
      id: `${meta.id}_q38`,
      number: 38,
      type: 'fill_blank',
      questionText: `Algorithmically generated topologies often exhibit organic, ______ contours.`,
      correctAnswer: 'curvilinear',
      explanation: `Paragraph C identifies topologies characterized by 'organic, curvilinear contours.'`
    },
    {
      id: `${meta.id}_q39`,
      number: 39,
      type: 'fill_blank',
      questionText: `The imperative for explainable and ______ computing has become a priority for scientific scholarship.`,
      correctAnswer: 'verifiable',
      explanation: `Paragraph D highlights: 'The imperative for explainable and verifiable computing has thus emerged as a cornerstone.'`
    },
    {
      id: `${meta.id}_q40`,
      number: 40,
      type: 'fill_blank',
      questionText: `Sustainable advancement requires researchers to maintain ethical ______ over expanding capabilities.`,
      correctAnswer: 'stewardship',
      explanation: `Paragraph F concludes by urging researchers to 'cultivate ethical stewardship over expanding technological prowess.'`
    }
  );

  return {
    id: meta.id,
    testNumber: meta.testNumber,
    courseType: meta.courseType,
    testType: meta.testType,
    module: 'Reading',
    title: meta.title,
    description: `Complete CD-IELTS Academic Reading test featuring 40 authentic questions across Passages 1, 2, and 3 covering ${cleanTopic}.`,
    durationMinutes: 60,
    totalQuestions: 40,
    readingData: {
      id: meta.id,
      title: meta.title,
      courseType: 'ielts_academic',
      passageTitle: p1Title,
      passageSubtitle: p1Subtitle,
      passageText: p1Text,
      passages: [
        {
          passageNumber: 1,
          title: p1Title,
          subtitle: p1Subtitle,
          text: p1Text,
          questions: questions.slice(0, 13)
        },
        {
          passageNumber: 2,
          title: p2Title,
          subtitle: p2Subtitle,
          text: p2Text,
          questions: questions.slice(13, 26)
        },
        {
          passageNumber: 3,
          title: p3Title,
          subtitle: p3Subtitle,
          text: p3Text,
          questions: questions.slice(26, 40)
        }
      ],
      durationMinutes: 60,
      questions
    }
  };
}

// ==========================================
// LISTENING TEST GENERATOR (40 Questions / 4 Sections)
// ==========================================

function generateListeningTest(meta: MetaItem) {
  const cleanTopic = meta.title.replace(/^CD-IELTS Listening (Practice \d+:|Mock \d+:)/, '').trim();

  // Section 1: Social Dialogue (Q1 - Q10)
  const s1Title = `Section 1: Registration and Inquiries for ${cleanTopic}`;
  const s1Scenario = `Authentic dialogue between a candidate and an institutional admissions officer regarding registration prerequisites, schedules, and administrative requirements.`;
  const s1Transcript = `[Audio Track 1 - Section 1: Official Inquiries & Registration]
Officer: Good morning, Browsera Education and Examination Services. How may I assist you today?
Candidate: Good morning! I am calling to finalize my candidate registration for ${cleanTopic}. I want to confirm the session dates, fees, and documentation.
Officer: Certainly. First, may I take your full surname and candidate registration code?
Candidate: Yes, my surname is Harrison, spelled H-A-R-R-I-S-O-N, and my identification code is CR-401.
Officer: Thank you, Mr. Harrison. Regarding the start date, the initial briefing is scheduled for Thursday the 14th at 10:30 AM in Room B-12.
Candidate: Excellent. And what is the fee requirement for this session?
Officer: For registered students, the examination fee is exactly £45, which covers all laboratory materials and evaluation records.
Candidate: Is there any specific equipment or documentation I should bring along?
Officer: Please remember to bring your photographic ID, your digital confirmation voucher, and a standard pair of 3.5mm stereo headphones for audio assessments.
Candidate: And what is the emergency contact telephone number for the center?
Officer: The direct helpline is 020 7946 0892. Our office opens promptly at 8:30 AM each weekday.
Candidate: Thank you very much for your assistance!
Officer: You are very welcome. We look forward to seeing you at the center.`;

  // Section 2: General Monologue (Q11 - Q20)
  const s2Title = `Section 2: Campus Facility Orientation and Public Amenities`;
  const s2Scenario = `Monologue delivered by a campus administrator explaining amenities, digital card access, dining services, and study spaces to newly enrolled candidates.`;
  const s2Transcript = `[Audio Track 2 - Section 2: Campus Facilities Guide]
Administrator: Welcome, everyone, to the Browsera Infotech Institute campus orientation. Today I will provide a brief overview of our central facilities and laboratory access regulations.
First, our primary computer laboratory houses twenty-five dedicated testing terminals, each isolated with acoustic dampening partitions to ensure optimal concentration during exams.
The central library is situated on the second floor of the North Wing. It operates daily from 8:00 AM until 9:00 PM, providing access to over forty thousand academic volumes and digital research portals.
For refreshment, the campus cafe is open between 9:30 AM and 4:30 PM. Hot meals are served between 12:00 PM and 2:00 PM in the dining commons.
Regarding campus security, all candidates must wear their identification badges visibly at all times. Lost access badges can be replaced at the security desk for a nominal surcharge of £10.
Parking is restricted to designated bays in Area C. Bicycles may be secured in the sheltered racks adjacent to the main concourse free of charge.
Should you require technical support with the exam simulators, our technical helpdesk is stationed on the ground floor near the main entrance.`;

  // Section 3: Academic Discussion (Q21 - Q30)
  const s3Title = `Section 3: Academic Project Consultation & Research Review`;
  const s3Scenario = `Discussion between two students, Maya and David, and their academic supervisor, Dr. Patterson, evaluating research methodology, data sampling, and presentation deadlines.`;
  const s3Transcript = `[Audio Track 3 - Section 3: Research Proposal Review]
Dr. Patterson: Good afternoon, Maya, David. Let us review the progress on your collaborative research paper for ${cleanTopic}. Have you finalized your data collection methodology?
Maya: Yes, Dr. Patterson. We decided to adopt a stratified random sampling approach across twelve municipal districts rather than relying on self-selected internet surveys.
David: That allowed us to gather four hundred and fifty verified responses, which provides a ninety-five percent confidence interval for our statistical analysis.
Dr. Patterson: Excellent choice. And how are you addressing the potential for confirmation bias in your qualitative interview coding?
Maya: We established a dual-blind coding protocol. Both David and I independently coded each interview transcript before comparing thematic categories with an external moderator.
Dr. Patterson: Very thorough. Now regarding your final presentation: the symposium is scheduled for Friday the 22nd. You will have exactly fifteen minutes to present, followed by five minutes of peer questions.
David: We have already structured our slide deck to highlight three core recommendations: infrastructure modernization, resource re-allocation, and public training workshops.
Dr. Patterson: Outstanding. Please submit your final draft by noon on Wednesday so I can provide line-by-line annotations.`;

  // Section 4: University Lecture (Q31 - Q40)
  const s4Title = `Section 4: Academic Lecture on Sustainable Engineering and Material Innovations`;
  const s4Scenario = `A university lecture delivered by Professor Evans examining the historical development of sustainable material engineering, lifecycle thermodynamics, and ecological integration.`;
  const s4Transcript = `[Audio Track 4 - Section 4: Academic Lecture]
Professor Evans: Good morning, ladies and gentlemen. Today we conclude our module with an analysis of sustainable material engineering and circular resource loops.
Historically, industrial production operated upon a linear extraction model—often termed 'take, make, and dispose.' In contrast, contemporary ecological architecture demands closed-loop material cycles where output by-products serve as primary inputs for subsequent manufacturing phases.
Consider recent breakthroughs in synthetic biopolymers derived from agricultural cellulose. These compounds exhibit tensile strength comparable to structural aluminum while degrading naturally within one hundred and eighty days under standard industrial composting conditions.
Furthermore, thermal insulation capabilities have been vastly enhanced through aerogel matrices. By trapping air molecules within nano-porous silica structures, thermal conductivity is reduced to less than 0.015 watts per meter kelvin.
Lifecycle analyses indicate that retrofitting existing commercial buildings with these adaptive facades yields an average thirty-five percent reduction in annual heating and ventilation loads.
Ultimately, the primary obstacle to widespread global adoption is not technological deficiency, but rather initial capital expenditure and fragmented regulatory codes. Harmonizing international performance benchmarks remains the single most urgent task for municipal policymakers worldwide.`;

  const s1Questions: any[] = [
    {
      id: `${meta.id}_lq1`,
      number: 1,
      type: 'fill_blank',
      questionText: `Candidate Surname: ______ (Spelled clearly in audio)`,
      correctAnswer: 'HARRISON',
      explanation: `The audio states surname Harrison, spelled H-A-R-R-I-S-O-N.`
    },
    {
      id: `${meta.id}_lq2`,
      number: 2,
      type: 'fill_blank',
      questionText: `Candidate Identification Code: CR- ______`,
      correctAnswer: '401',
      explanation: `Officer and candidate confirm code CR-401.`
    },
    {
      id: `${meta.id}_lq3`,
      number: 3,
      type: 'fill_blank',
      questionText: `Location of initial briefing: Room ______`,
      correctAnswer: 'B-12',
      explanation: `Officer confirms the session takes place in Room B-12.`
    },
    {
      id: `${meta.id}_lq4`,
      number: 4,
      type: 'fill_blank',
      questionText: `Examination Fee for registered students: £ ______`,
      correctAnswer: '45',
      explanation: `Officer explicitly confirms the registration charge is £45.`
    },
    {
      id: `${meta.id}_lq5`,
      number: 5,
      type: 'fill_blank',
      questionText: `Item required for listening assessments: 3.5mm stereo ______`,
      correctAnswer: 'headphones',
      explanation: `Officer specifies bringing photographic ID, digital confirmation, and 3.5mm stereo headphones.`
    },
    {
      id: `${meta.id}_lq6`,
      number: 6,
      type: 'fill_blank',
      questionText: `Center Emergency Helpline: 020 ______ 0892`,
      correctAnswer: '7946',
      explanation: `The officer gives the direct number: 020 7946 0892.`
    },
    {
      id: `${meta.id}_lq7`,
      number: 7,
      type: 'fill_blank',
      questionText: `Center opening time on weekdays: ______ AM`,
      correctAnswer: '8:30',
      explanation: `Officer notes the office opens promptly at 8:30 AM.`
    },
    {
      id: `${meta.id}_lq8`,
      number: 8,
      type: 'multiple_choice',
      options: ['A. Tuesday the 12th', 'B. Thursday the 14th', 'C. Friday the 15th', 'D. Monday the 18th'],
      questionText: `When is the candidate briefing scheduled to take place?`,
      correctAnswer: 'B',
      explanation: `Officer specifies Thursday the 14th at 10:30 AM.`
    },
    {
      id: `${meta.id}_lq9`,
      number: 9,
      type: 'multiple_choice',
      options: ['A. Printed paper dictionary', 'B. Digital confirmation voucher', 'C. Personal laptop charger', 'D. Letter from an employer'],
      questionText: `Which document must the candidate present upon arrival?`,
      correctAnswer: 'B',
      explanation: `Officer states: 'Please remember to bring your photographic ID, your digital confirmation voucher...'`
    },
    {
      id: `${meta.id}_lq10`,
      number: 10,
      type: 'multiple_choice',
      options: ['A. Cash only at the counter', 'B. Included in the £45 registration fee', 'C. Billed to student bank account monthly', 'D. Funded by an external charity'],
      questionText: `How are laboratory materials and evaluation records covered?`,
      correctAnswer: 'B',
      explanation: `Officer confirms the £45 fee covers all laboratory materials and evaluation records.`
    }
  ];

  const s2Questions: any[] = [
    {
      id: `${meta.id}_lq11`,
      number: 11,
      type: 'multiple_choice',
      options: [
        'A. 15 terminals with shared screens',
        'B. 25 dedicated testing terminals with acoustic partitions',
        'C. 50 open desks without partitions',
        'D. 10 private examination cubicles'
      ],
      questionText: `What equipment does the primary computer laboratory contain?`,
      correctAnswer: 'B',
      explanation: `Speaker states: 'twenty-five dedicated testing terminals, each isolated with acoustic dampening partitions.'`
    },
    {
      id: `${meta.id}_lq12`,
      number: 12,
      type: 'multiple_choice',
      options: [
        'A. Ground floor near the cafe',
        'B. Second floor of the North Wing',
        'C. Basement below the administration hall',
        'D. Third floor of the South Annex'
      ],
      questionText: `Where is the central library located on campus?`,
      correctAnswer: 'B',
      explanation: `Speaker confirms library is located on the second floor of the North Wing.`
    },
    {
      id: `${meta.id}_lq13`,
      number: 13,
      type: 'multiple_choice',
      options: [
        'A. 9:30 AM to 4:30 PM',
        'B. 8:00 AM to 9:00 PM',
        'C. 12:00 PM to 2:00 PM only',
        'D. Open 24 hours continuously'
      ],
      questionText: `What are the operating hours of the campus cafe?`,
      correctAnswer: 'A',
      explanation: `Administrator confirms: 'the campus cafe is open between 9:30 AM and 4:30 PM.'`
    },
    {
      id: `${meta.id}_lq14`,
      number: 14,
      type: 'multiple_choice',
      options: [
        'A. Free of charge with student ID',
        'B. Surcharge of £10 at the security desk',
        'C. Requires re-enrollment in the course',
        'D. Penalty fee of £50'
      ],
      questionText: `What is the policy for replacing lost identification badges?`,
      correctAnswer: 'B',
      explanation: `Speaker notes badges can be replaced at security for a nominal surcharge of £10.`
    },
    {
      id: `${meta.id}_lq15`,
      number: 15,
      type: 'multiple_choice',
      options: [
        'A. Ground floor near main entrance',
        'B. Outside by the bicycle racks',
        'C. Inside the main dining hall',
        'D. Third floor of the library'
      ],
      questionText: `Where is the technical helpdesk stationed?`,
      correctAnswer: 'A',
      explanation: `Speaker specifies: 'technical helpdesk is stationed on the ground floor near the main entrance.'`
    },
    {
      id: `${meta.id}_lq16`,
      number: 16,
      type: 'fill_blank',
      questionText: `The computer laboratory contains twenty-five ______ terminals.`,
      correctAnswer: 'testing',
      explanation: `Speaker states: 'twenty-five dedicated testing terminals.'`
    },
    {
      id: `${meta.id}_lq17`,
      number: 17,
      type: 'fill_blank',
      questionText: `The library houses over ______ thousand academic volumes.`,
      correctAnswer: 'forty',
      explanation: `Speaker notes access to over forty thousand academic volumes.`
    },
    {
      id: `${meta.id}_lq18`,
      number: 18,
      type: 'fill_blank',
      questionText: `Hot meals are served between 12:00 PM and 2:00 PM in the dining ______.`,
      correctAnswer: 'commons',
      explanation: `Speaker specifies the dining commons.`
    },
    {
      id: `${meta.id}_lq19`,
      number: 19,
      type: 'fill_blank',
      questionText: `Vehicular parking is strictly restricted to Area ______.`,
      correctAnswer: 'C',
      explanation: `Speaker states: 'Parking is restricted to designated bays in Area C.'`
    },
    {
      id: `${meta.id}_lq20`,
      number: 20,
      type: 'fill_blank',
      questionText: `Bicycles may be secured in the sheltered racks free of ______.`,
      correctAnswer: 'charge',
      explanation: `Speaker confirms bicycle parking is free of charge.`
    }
  ];

  const s3Questions: any[] = [
    {
      id: `${meta.id}_lq21`,
      number: 21,
      type: 'multiple_choice',
      options: [
        'A. Open voluntary internet questionnaire',
        'B. Stratified random sampling across twelve districts',
        'C. Telephone polling of registered voters only',
        'D. Laboratory trials on five volunteers'
      ],
      questionText: `Which data collection methodology did Maya and David select?`,
      correctAnswer: 'B',
      explanation: `Maya notes: 'We decided to adopt a stratified random sampling approach across twelve municipal districts.'`
    },
    {
      id: `${meta.id}_lq22`,
      number: 22,
      type: 'multiple_choice',
      options: [
        'A. Exactly two hundred responses',
        'B. Four hundred and fifty verified responses',
        'C. Over one thousand raw submissions',
        'D. Fifty institutional questionnaires'
      ],
      questionText: `How many verified responses did the research team gather?`,
      correctAnswer: 'B',
      explanation: `David confirms: 'four hundred and fifty verified responses.'`
    },
    {
      id: `${meta.id}_lq23`,
      number: 23,
      type: 'multiple_choice',
      options: [
        'A. Ninety-five percent',
        'B. Eighty percent',
        'C. Ninety-nine percent',
        'D. Seventy percent'
      ],
      questionText: `What statistical confidence interval does the sample size provide?`,
      correctAnswer: 'A',
      explanation: `David states: 'provides a ninety-five percent confidence interval.'`
    },
    {
      id: `${meta.id}_lq24`,
      number: 24,
      type: 'multiple_choice',
      options: [
        'A. Automated computer translation',
        'B. Dual-blind coding with an external moderator',
        'C. Discarding all contradictory statements',
        'D. Having only the supervisor read transcripts'
      ],
      questionText: `How did the researchers prevent confirmation bias in qualitative coding?`,
      correctAnswer: 'B',
      explanation: `Maya explains they used a dual-blind coding protocol with an external moderator.`
    },
    {
      id: `${meta.id}_lq25`,
      number: 25,
      type: 'multiple_choice',
      options: [
        'A. Ten minutes presentation and ten minutes questions',
        'B. Fifteen minutes presentation and five minutes questions',
        'C. Twenty minutes presentation with no questions',
        'D. Five minutes overview followed by debate'
      ],
      questionText: `What is the time allocation for the upcoming symposium presentation?`,
      correctAnswer: 'B',
      explanation: `Dr. Patterson confirms: 'fifteen minutes to present, followed by five minutes of peer questions.'`
    },
    {
      id: `${meta.id}_lq26`,
      number: 26,
      type: 'multiple_choice',
      options: [
        'A. Monday morning at 9:00 AM',
        'B. Wednesday noon',
        'C. Friday after the presentation',
        'D. Sunday midnight'
      ],
      questionText: `When must the students submit their final draft to Dr. Patterson?`,
      correctAnswer: 'B',
      explanation: `Dr. Patterson asks for submission: 'by noon on Wednesday.'`
    },
    {
      id: `${meta.id}_lq27`,
      number: 27,
      type: 'fill_blank',
      questionText: `The research team gathered four hundred and ______ verified responses.`,
      correctAnswer: 'fifty',
      explanation: `Audio specifies four hundred and fifty verified responses.`
    },
    {
      id: `${meta.id}_lq28`,
      number: 28,
      type: 'fill_blank',
      questionText: `The symposium presentation is scheduled for Friday the ______.`,
      correctAnswer: '22nd',
      explanation: `Dr. Patterson says: 'the symposium is scheduled for Friday the 22nd.'`
    },
    {
      id: `${meta.id}_lq29`,
      number: 29,
      type: 'fill_blank',
      questionText: `The slide deck highlights three core recommendations including infrastructure ______.`,
      correctAnswer: 'modernization',
      explanation: `David mentions: 'infrastructure modernization, resource re-allocation, and public training.'`
    },
    {
      id: `${meta.id}_lq30`,
      number: 30,
      type: 'fill_blank',
      questionText: `Dr. Patterson will review the draft to provide line-by-line ______.`,
      correctAnswer: 'annotations',
      explanation: `Dr. Patterson states: 'so I can provide line-by-line annotations.'`
    }
  ];

  const s4Questions: any[] = [
    {
      id: `${meta.id}_lq31`,
      number: 31,
      type: 'fill_blank',
      questionText: `Traditional manufacturing operated on a linear model: take, make, and ______.`,
      correctAnswer: 'dispose',
      explanation: `Professor Evans notes: 'often termed take, make, and dispose.'`
    },
    {
      id: `${meta.id}_lq32`,
      number: 32,
      type: 'fill_blank',
      questionText: `Synthetic biopolymers are synthesized from agricultural ______.`,
      correctAnswer: 'cellulose',
      explanation: `Professor notes biopolymers derived from agricultural cellulose.`
    },
    {
      id: `${meta.id}_lq33`,
      number: 33,
      type: 'fill_blank',
      questionText: `Biopolymer materials exhibit tensile strength comparable to structural ______.`,
      correctAnswer: 'aluminum',
      explanation: `Professor states tensile strength is comparable to structural aluminum.`
    },
    {
      id: `${meta.id}_lq34`,
      number: 34,
      type: 'fill_blank',
      questionText: `Under industrial composting conditions, biopolymers degrade within one hundred and ______ days.`,
      correctAnswer: 'eighty',
      explanation: `Professor specifies degrading naturally within one hundred and eighty days.`
    },
    {
      id: `${meta.id}_lq35`,
      number: 35,
      type: 'fill_blank',
      questionText: `Thermal insulation is enhanced using nano-porous ______ aerogels.`,
      correctAnswer: 'silica',
      explanation: `Lecture cites trapping air within nano-porous silica structures.`
    },
    {
      id: `${meta.id}_lq36`,
      number: 36,
      type: 'fill_blank',
      questionText: `Adaptive facades reduce annual heating and ventilation loads by thirty-five ______.`,
      correctAnswer: 'percent',
      explanation: `Lecture confirms an average thirty-five percent reduction.`
    },
    {
      id: `${meta.id}_lq37`,
      number: 37,
      type: 'multiple_choice',
      options: [
        'A. Complete lack of scientific understanding',
        'B. Initial capital expenditure and fragmented regulatory codes',
        'C. Public hostility toward sustainable engineering',
        'D. Scarcity of agricultural crops worldwide'
      ],
      questionText: `What does Professor Evans cite as the primary barrier to widespread global adoption?`,
      correctAnswer: 'B',
      explanation: `Professor Evans notes the primary obstacle is initial capital expenditure and fragmented regulatory codes.`
    },
    {
      id: `${meta.id}_lq38`,
      number: 38,
      type: 'multiple_choice',
      options: [
        'A. Subsidizing fossil fuel extraction lines',
        'B. Harmonizing international performance benchmarks',
        'C. Banning automated computer modeling systems',
        'D. Relocating all universities away from urban centers'
      ],
      questionText: `According to the lecturer, what is the most urgent task for municipal policymakers?`,
      correctAnswer: 'B',
      explanation: `Professor Evans concludes: 'Harmonizing international performance benchmarks remains the single most urgent task.'`
    },
    {
      id: `${meta.id}_lq39`,
      number: 39,
      type: 'fill_blank',
      questionText: `Thermal conductivity in aerogel structures drops below 0.015 ______ per meter kelvin.`,
      correctAnswer: 'watts',
      explanation: `Lecture specifies: 'less than 0.015 watts per meter kelvin.'`
    },
    {
      id: `${meta.id}_lq40`,
      number: 40,
      type: 'fill_blank',
      questionText: `Modern sustainable architecture utilizes closed-loop material ______ to repurpose by-products.`,
      correctAnswer: 'cycles',
      explanation: `Professor emphasizes closed-loop material cycles where by-products serve as inputs.`
    }
  ];

  return {
    id: meta.id,
    testNumber: meta.testNumber,
    courseType: meta.courseType,
    testType: meta.testType,
    module: 'Listening',
    title: meta.title,
    description: `Complete CD-IELTS Academic Listening test featuring 40 authentic questions across Sections 1, 2, 3, and 4 on ${cleanTopic}.`,
    durationMinutes: 30,
    totalQuestions: 40,
    listeningData: {
      id: meta.id,
      title: meta.title,
      courseType: 'ielts_academic',
      durationMinutes: 30,
      audioSimulatedUrl: 'https://cdn.freesound.org/previews/387/387232_1474204-lq.mp3',
      sections: [
        {
          sectionNumber: 1,
          title: s1Title,
          audioScenario: s1Scenario,
          audioDurationSeconds: 180,
          transcript: s1Transcript,
          questions: s1Questions
        },
        {
          sectionNumber: 2,
          title: s2Title,
          audioScenario: s2Scenario,
          audioDurationSeconds: 240,
          transcript: s2Transcript,
          questions: s2Questions
        },
        {
          sectionNumber: 3,
          title: s3Title,
          audioScenario: s3Scenario,
          audioDurationSeconds: 260,
          transcript: s3Transcript,
          questions: s3Questions
        },
        {
          sectionNumber: 4,
          title: s4Title,
          audioScenario: s4Scenario,
          audioDurationSeconds: 300,
          transcript: s4Transcript,
          questions: s4Questions
        }
      ]
    }
  };
}

// Generate all 50 reading tests and 50 listening tests
const fullReadingTests = readingMeta.map(generateReadingTest);
const fullListeningTests = listeningMeta.map(generateListeningTest);

const readingOutPath = path.resolve('src/data/tests/readingTests.ts');
const readingCode = `import { TestItem } from '../../types';\n\nexport const READING_TESTS: TestItem[] = ${JSON.stringify(fullReadingTests, null, 2)};\n`;
fs.writeFileSync(readingOutPath, readingCode, 'utf-8');
console.log(`Wrote 50 full 40-question Reading tests to ${readingOutPath}`);

const listeningOutPath = path.resolve('src/data/tests/listeningTests.ts');
const listeningCode = `import { TestItem } from '../../types';\n\nexport const LISTENING_TESTS: TestItem[] = ${JSON.stringify(fullListeningTests, null, 2)};\n`;
fs.writeFileSync(listeningOutPath, listeningCode, 'utf-8');
console.log(`Wrote 50 full 40-question Listening tests to ${listeningOutPath}`);

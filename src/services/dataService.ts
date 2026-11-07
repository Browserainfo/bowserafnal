/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  ReadingTest,
  ListeningTest,
  WritingTask,
  SpeakingTest,
  PteTestItem,
  ComputerCourseModule,
  SpokenTopicLesson,
  DailyAssignment,
  MockTestSchedule,
  TestSubmission,
  SystemIntegrationStatus
} from '../types';
import { 
  READING_TESTS, 
  LISTENING_TESTS, 
  WRITING_TESTS, 
  SPEAKING_TESTS, 
  PTE_TESTS,
  ALL_TESTS,
  findTestById
} from '../data/tests/index';

// ==========================================
// SEED USERS
// ==========================================
export const SEED_USERS: User[] = [
  {
    id: 'admin_1',
    name: 'Simranjeet Kaur',
    email: 'director@browsera.com',
    role: 'admin',
    phone: '+91 98765 43210',
    adminLevel: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'teacher_1',
    name: 'Dr. Vikramaditya Sharma',
    email: 'vikram.ielts@browsera.com',
    role: 'teacher',
    phone: '+91 98721 11223',
    specialization: ['IELTS Academic 8.5+ Lead', 'Writing Task 2 Examiner'],
    assignedBatches: ['Morning IELTS Master 7.5+', 'Weekend Fast-track IELTS'],
    rating: 4.95,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'teacher_2',
    name: 'Priyanka Kapoor',
    email: 'priyanka.pte@browsera.com',
    role: 'teacher',
    phone: '+91 98144 55667',
    specialization: ['PTE Academic 79+ Specialist', 'Pronunciation & Oral Fluency'],
    assignedBatches: ['PTE Target 79+ Batch', 'Evening PTE Intensive'],
    rating: 4.88,
    avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'teacher_3',
    name: 'Er. Rahul Verma',
    email: 'rahul.it@browsera.com',
    role: 'teacher',
    phone: '+91 98888 77665',
    specialization: ['Computer Courses & DCA Head', 'Spoken English & Soft Skills'],
    assignedBatches: ['DCA & Office Pro Batch', 'Spoken English & Public Speaking'],
    rating: 4.9,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student_1',
    name: 'Amanpreet Singh',
    email: 'amanpreet.singh@student.browsera.com',
    role: 'student',
    candidateNumber: 'CD-2026-9042',
    phone: '+91 97800 12345',
    batchName: 'Morning IELTS Master 7.5+',
    enrolledCourses: ['ielts_academic', 'spoken_english'],
    targetBand: 7.5,
    currentBand: 6.5,
    targetExamDate: '2026-11-20',
    assignedTeacherId: 'teacher_1',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student_2',
    name: 'Harpreet Kaur Sandhu',
    email: 'harpreet.k@student.browsera.com',
    role: 'student',
    candidateNumber: 'CD-2026-9043',
    phone: '+91 98150 99887',
    batchName: 'PTE Target 79+ Batch',
    enrolledCourses: ['pte_academic'],
    targetBand: 79,
    currentBand: 68,
    targetExamDate: '2026-12-05',
    assignedTeacherId: 'teacher_2',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student_3',
    name: 'Gurdeep Singh Dhillon',
    email: 'gurdeep.d@student.browsera.com',
    role: 'student',
    candidateNumber: 'CD-2026-9044',
    phone: '+91 98555 44332',
    batchName: 'DCA & Office Pro Batch',
    enrolledCourses: ['computer_courses', 'spoken_english'],
    targetBand: 7.0,
    currentBand: 6.0,
    targetExamDate: '2027-01-15',
    assignedTeacherId: 'teacher_3',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

// ==========================================
// SEED READING TESTS (AUTHENTIC CD-IELTS FORMAT)
// ==========================================
export const SEED_READING_TESTS: ReadingTest[] = [
  {
    id: 'read_test_1',
    title: 'CD-IELTS Academic Reading Test 1: Engineering & Heritage',
    courseType: 'ielts_academic',
    passageTitle: 'The Roman Tunnel Systems: Engineering Marvels of the Ancient World',
    passageSubtitle: 'How Roman engineers built subterranean aqueducts and transport passageways across mountainous Europe.',
    durationMinutes: 20,
    passageText: `Paragraph A
The Romans were extraordinary civil engineers whose infrastructural achievements transformed Europe, the Near East, and North Africa. While Roman roads and arched aqueducts are celebrated symbols of imperial conquest, subterranean tunnels represent perhaps their most demanding technical accomplishment. Tunnels were constructed for diverse purposes: supplying water through gravity-fed aqueducts, draining lakes to reclaim agricultural land, and facilitating military road networks through mountainous obstacles.

Paragraph B
Roman tunneling methodology relied heavily on two primary techniques: the "counter-excavation" method and the "shaft-and-gallery" (qanat) technique. Counter-excavation involved miners digging toward each other from opposite sides of a hill or mountain. While mathematically elegant, this technique was fraught with danger because a minor error in alignment could cause the two tunneling teams to bypass each other entirely. A celebrated surviving inscription on the Saldae aqueduct tunnel in modern-day Algeria recounts the exasperation of Roman military engineer Nonius Datus, who arrived in 152 AD to discover that both teams had missed one another and cut parallel bores deep into the mountain.

Paragraph C
To avoid such catastrophic misalignments, Roman engineers preferred the shaft-and-gallery method wherever topography permitted. Vertical shafts were sunk at precise regular intervals (typically 30 to 50 meters apart) along the projected underground line. Once shafts reached the intended depth, laborers excavated horizontally in two directions from the bottom of each vertical shaft. This method dramatically accelerated construction speed because dozens of teams could excavate simultaneously along a single line. Furthermore, vertical shafts provided indispensable ventilation for subterranean workers and allowed excavation spoil to be hoisted up using rope pulleys.

Paragraph D
Illumination underground was provided by small terracotta oil lamps positioned in niches carved directly into the tunnel walls. Because tallow and olive oil generated thick soot and consumed vital oxygen, adequate airflow was an existential challenge. In tunnels lacking frequent vertical shafts, miners waved large linen cloths or lit small fires beneath air vents to create artificial thermal convection currents, drawing fresh air into the murky depths.

Paragraph E
Excavating through solid rock required arduous manual labor using iron picks, hammers, and stone chisels. When encountering extremely resilient igneous rock, engineers applied "fire-setting": heating the rock face with intense wood fires and then abruptly dousing the glowing rock with cold water or vinegar. The resulting violent thermal shock cracked the rock, enabling miners to shatter the brittle fragments. Despite having no magnetic compass or optical surveying transits, Roman surveyors utilized simple plumb lines, sighting rods (gromae), and water levels (chorobates) to maintain gradients as shallow as 1 in 1000 over many kilometers.`,
    questions: [
      {
        id: 'q1',
        number: 1,
        type: 'true_false_not_given',
        questionText: 'Subterranean tunnels were used exclusively by Roman military forces for marching troops.',
        correctAnswer: 'FALSE',
        explanation: 'Paragraph A specifies tunnels served diverse purposes: water supply via aqueducts, draining lakes for agriculture, and military roads.'
      },
      {
        id: 'q2',
        number: 2,
        type: 'true_false_not_given',
        questionText: 'The counter-excavation method was guaranteed to succeed without risk of navigational deviation.',
        correctAnswer: 'FALSE',
        explanation: 'Paragraph B explicitly notes counter-excavation was fraught with danger because minor errors caused miners to bypass each other.'
      },
      {
        id: 'q3',
        number: 3,
        type: 'true_false_not_given',
        questionText: 'Nonius Datus had designed more than twenty aqueducts before inspecting the Saldae tunnel.',
        correctAnswer: 'NOT GIVEN',
        explanation: 'Paragraph B mentions Nonius Datus and his discovery in 152 AD, but the text makes no mention of his previous total number of aqueducts.'
      },
      {
        id: 'q4',
        number: 4,
        type: 'true_false_not_given',
        questionText: 'The shaft-and-gallery method enabled multiple construction crews to work simultaneously.',
        correctAnswer: 'TRUE',
        explanation: 'Paragraph C states: "dozens of teams could excavate simultaneously along a single line."'
      },
      {
        id: 'q5',
        number: 5,
        type: 'true_false_not_given',
        questionText: 'Olive oil lamps in the tunnels generated smoke that could threaten miner health.',
        correctAnswer: 'TRUE',
        explanation: 'Paragraph D states lamps generated thick soot and consumed vital oxygen, making airflow an existential challenge.'
      },
      {
        id: 'q6',
        number: 6,
        type: 'fill_blank',
        questionText: 'Roman engineers fractured impenetrable rock faces by applying thermal shock in a method known as ______.',
        correctAnswer: 'fire-setting',
        explanation: 'Paragraph E specifies: "engineers applied fire-setting: heating the rock face with intense wood fires..."'
      },
      {
        id: 'q7',
        number: 7,
        type: 'fill_blank',
        questionText: 'To verify water gradients over kilometers, Roman surveyors relied on water levels called ______.',
        correctAnswer: 'chorobates',
        explanation: 'Paragraph E states Roman surveyors utilized plumb lines, gromae, and water levels (chorobates).'
      },
      {
        id: 'q8',
        number: 8,
        type: 'multiple_choice',
        questionText: 'What was the primary advantage of sinking vertical shafts along the tunnel route?',
        options: [
          'A. It reduced the requirement for skilled stone carvers',
          'B. It provided both structural ventilation and multiple points of excavation',
          'C. It prevented flooding from subterranean underground rivers',
          'D. It made magnetic compass orientation easier'
        ],
        correctAnswer: 'B',
        explanation: 'Paragraph C states shafts accelerated construction speed by enabling simultaneous excavation and provided indispensable ventilation.'
      }
    ]
  }
];

// ==========================================
// SEED LISTENING TESTS
// ==========================================
export const SEED_LISTENING_TESTS: ListeningTest[] = [
  {
    id: 'list_test_1',
    title: 'CD-IELTS Listening Practice: Academic Community Orientation',
    courseType: 'ielts_academic',
    durationMinutes: 15,
    audioSimulatedUrl: 'https://cdn.freesound.org/previews/387/387232_1474204-lq.mp3',
    sections: [
      {
        sectionNumber: 1,
        title: 'Section 1: West Park Adult Learning Center Enrollment',
        audioScenario: 'A prospective candidate inquires about language workshops, course schedules, and registration fees at West Park Adult Center.',
        audioDurationSeconds: 240,
        transcript: `[Audio Recording Simulated]
Receptionist: Good morning, West Park Community Education Office, how can I help you?
Student: Hi there! I'm calling to inquire about English language and academic preparation courses starting next month.
Receptionist: Wonderful. We offer both general communication and intensive IELTS preparation modules. Could I take your full name first?
Student: Yes, it is Marcus Henderson. That's H-E-N-D-E-R-S-O-N.
Receptionist: Thank you, Marcus. And what is your best contact phone number?
Student: It's 0412 889 301.
Receptionist: Great. Which batch time were you hoping to attend? We have morning slots from 9:30 AM to 11:30 AM, and an evening slot from 6:00 PM to 8:00 PM.
Student: The evening slot would suit my work hours best.
Receptionist: Excellent. The evening course fee is $340 for the 8-week intensive session, which includes all laboratory listening recordings and mock tests.
Student: Is there any parking available on campus?
Student: Yes, students can park in Lot C behind the main auditorium for free after 5:30 PM.`,
        questions: [
          {
            id: 'lq1',
            number: 1,
            type: 'fill_blank',
            questionText: 'Candidate Surname: Henderson (Spelling: ______ )',
            correctAnswer: 'HENDERSON',
            explanation: 'Transcript spells H-E-N-D-E-R-S-O-N clearly.'
          },
          {
            id: 'lq2',
            number: 2,
            type: 'fill_blank',
            questionText: 'Contact Mobile Number: ______',
            correctAnswer: '0412 889 301',
            explanation: 'Given as 0412 889 301.'
          },
          {
            id: 'lq3',
            number: 3,
            type: 'multiple_choice',
            questionText: 'Which class timing did Marcus choose?',
            options: [
              'A. 8:00 AM to 10:00 AM',
              'B. 9:30 AM to 11:30 AM',
              'C. 6:00 PM to 8:00 PM',
              'D. Weekend afternoon'
            ],
            correctAnswer: 'C',
            explanation: 'The student requested the evening slot from 6:00 PM to 8:00 PM.'
          },
          {
            id: 'lq4',
            number: 4,
            type: 'fill_blank',
            questionText: 'The 8-week intensive course fee is $______',
            correctAnswer: '340',
            explanation: 'The receptionist confirms $340.'
          },
          {
            id: 'lq5',
            number: 5,
            type: 'fill_blank',
            questionText: 'Free student parking is available in Lot ______ after 5:30 PM.',
            correctAnswer: 'C',
            explanation: 'Lot C behind the auditorium is free after 5:30 PM.'
          }
        ]
      }
    ]
  }
];

// ==========================================
// SEED WRITING TASKS (TASK 1 & TASK 2)
// ==========================================
export const SEED_WRITING_TASKS: WritingTask[] = [
  {
    id: 'write_task_1',
    taskNumber: 1,
    title: 'Academic Writing Task 1: Renewable Energy Consumption (2010 vs 2025)',
    courseType: 'ielts_academic',
    chartType: 'bar_chart',
    suggestedMinutes: 20,
    minWords: 150,
    chartDataSummary: `Bar Chart Summary:
- Country A (Germany): 22% in 2010 -> 48% in 2025
- Country B (UK): 14% in 2010 -> 42% in 2025
- Country C (USA): 8% in 2010 -> 24% in 2025
- Country D (Australia): 11% in 2010 -> 36% in 2025
- Country E (Canada): 16% in 2010 -> 29% in 2025
Overall: All five countries demonstrated significant increases, with Germany retaining the highest share and the UK experiencing the steepest proportionate growth.`,
    prompt: `The chart below illustrates the percentage of total energy consumption generated from renewable sources in five developed countries in 2010, compared with projected figures for 2025.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.
Write at least 150 words.`
  },
  {
    id: 'write_task_2',
    taskNumber: 2,
    title: 'Academic Writing Task 2: Free Public Transport vs Road Expansion',
    courseType: 'ielts_academic',
    suggestedMinutes: 40,
    minWords: 250,
    prompt: `Some people believe that governments should make public transportation completely free to reduce traffic congestion and carbon emissions. Others argue that financial investments should be directed toward building and maintaining wider road networks.

Discuss both views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience.
Write at least 250 words.`
  }
];

// ==========================================
// SEED SPEAKING TEST (CD-IELTS INTERACTIVE)
// ==========================================
export const SEED_SPEAKING_TEST: SpeakingTest = {
  id: 'speak_test_1',
  title: 'CD-IELTS Full Speaking Test: Technology, Ambition & Society',
  part1Prompts: [
    {
      topic: 'Work, Studies & Daily Routines',
      questions: [
        'Do you work or are you a student?',
        'What is your favorite time of day for studying or working, and why?',
        'Do you prefer to study alone or with other people?'
      ]
    },
    {
      topic: 'Technology & Communication',
      questions: [
        'How often do you communicate with friends through social media compared to phone calls?',
        'Do you think people will read paper books in twenty years?'
      ]
    }
  ],
  part2CueCard: {
    topic: 'Describe an ambitious project or goal that you recently achieved.',
    bulletPoints: [
      'What the project or goal was',
      'Why it was challenging or demanding',
      'What resources or skills you utilized to complete it',
      'And explain how you felt when you reached this milestone.'
    ],
    prepTimeSeconds: 60,
    speakTimeSeconds: 120
  },
  part3Discussion: {
    topic: 'Ambition, Career Growth & Technological Change',
    questions: [
      'In what ways do societal expectations shape personal ambition among young people?',
      'Is competition among colleagues beneficial or detrimental in the modern workplace?',
      'How might advancements in artificial intelligence influence the skills young professionals need in the next decade?'
    ]
  }
};

// ==========================================
// SEED PTE ACADEMIC TEST ITEMS
// ==========================================
export const SEED_PTE_ITEMS: PteTestItem[] = [
  {
    id: 'pte_1',
    type: 'read_aloud',
    title: 'PTE Speaking: Read Aloud Item #1',
    prompt: 'The emergence of synthetic polymers in the early twentieth century revolutionized materials science. Today, researchers are combining biodegradable polymers with nanotechnology to engineer targeted medical drug delivery systems that dissolve harmlessly inside the human body.',
    prepTimeSeconds: 35,
    responseTimeSeconds: 40,
    scoringGuide: 'Scored on Content accuracy, Pronunciation clarity (native-like phonetics), and uninterrupted Oral Fluency.'
  },
  {
    id: 'pte_2',
    type: 'describe_image',
    title: 'PTE Speaking: Describe Image (Life Expectancy Chart)',
    prompt: 'Look at the chart below. In 25 seconds, please speak into the microphone and describe in detail what the chart is showing. You will have 40 seconds to give your response.',
    imageDescription: 'Line chart comparing Average Life Expectancy in Europe (82 yrs), Americas (77 yrs), Asia (74 yrs), and Africa (64 yrs) from 1950 to 2025. Clear upward trend across all regions with convergence narrowing after 1990.',
    prepTimeSeconds: 25,
    responseTimeSeconds: 40,
    scoringGuide: 'Assess key trends, high/low points, comparison of continents, smooth oral cadence without false starts.'
  },
  {
    id: 'pte_3',
    type: 'repeat_sentence',
    title: 'PTE Speaking: Repeat Sentence Item #4',
    prompt: 'Listen to the audio clip and repeat the sentence exactly as spoken.',
    sampleAudioTranscript: 'Statistical analysis of demographic surveys will be discussed in tomorrow morning’s lecture.',
    prepTimeSeconds: 3,
    responseTimeSeconds: 15,
    scoringGuide: 'Word-for-word recall, correct stress pattern, no hesitation.'
  },
  {
    id: 'pte_4',
    type: 'summarize_written_text',
    title: 'PTE Writing: Summarize Written Text',
    prompt: 'Read the passage below and summarize it using ONE single sentence between 5 and 75 words. You have 10 minutes.\n\nUrban heat islands occur when cities replace natural land cover with dense concentrations of pavement, buildings, and other surfaces that absorb and retain heat. This effect increases energy costs, air pollution levels, and heat-related illness. To mitigate these adverse impacts, urban planners are implementing reflective roofs, urban forests, and permeable green pavements, which effectively cool metropolitan centers while enhancing stormwater absorption.',
    prepTimeSeconds: 0,
    responseTimeSeconds: 600,
    scoringGuide: 'Single sentence rule (only one period at end), 5-75 words, grammatical correctness, content key points.'
  }
];

// ==========================================
// SEED COMPUTER COURSES & VOCATIONAL MODULES
// ==========================================
export const SEED_COMPUTER_COURSES: ComputerCourseModule[] = [
  {
    id: 'comp_dca',
    courseCode: 'DCA',
    title: 'Diploma in Computer Applications (DCA)',
    durationWeeks: 24,
    level: 'Intermediate',
    syllabus: [
      { topic: 'Computer Fundamentals, Operating Systems & Linux CLI', hours: 20, completed: true },
      { topic: 'Advanced MS Word (Mail Merge, Document Architectures)', hours: 15, completed: true },
      { topic: 'MS Excel (VLOOKUP, XLOOKUP, Pivot Tables, Formulas)', hours: 25, completed: true },
      { topic: 'MS PowerPoint, Database Basics (MS Access & SQL)', hours: 20, completed: false },
      { topic: 'Internet Protocols, Cyber Security & Cloud Drive Tools', hours: 15, completed: false }
    ],
    practicalTestTitle: 'Excel Data Analytics & Financial Formulas Exam',
    practicalTaskDescription: 'Calculate employee payroll taxes, apply conditional formatting, and generate dynamic pivot charts from the provided raw sales dataset.'
  },
  {
    id: 'comp_typing',
    courseCode: 'TYPING_PRO',
    title: 'Professional English Speed Typing & Accuracy Certification',
    durationWeeks: 8,
    level: 'Beginner',
    syllabus: [
      { topic: 'Home Row & Touch Typing Ergonomics', hours: 10, completed: true },
      { topic: 'Upper Row, Lower Row & Numerical Pad Fluency', hours: 15, completed: true },
      { topic: 'Speed Drilling: Reaching 45+ Words Per Minute', hours: 20, completed: false }
    ],
    practicalTestTitle: '5-Minute Speed Typing Test (35 WPM / 95% Accuracy Threshold)',
    practicalTaskDescription: 'Transcribe standard administrative text without pausing to verify accuracy score.'
  },
  {
    id: 'comp_web',
    courseCode: 'WEB_BASICS',
    title: 'Front-End Web Development & IT Foundations',
    durationWeeks: 16,
    level: 'Intermediate',
    syllabus: [
      { topic: 'Semantic HTML5, CSS3 Grid & Flexbox Layouts', hours: 25, completed: true },
      { topic: 'Tailwind CSS, Responsive Web Design for Mobile', hours: 20, completed: true },
      { topic: 'Modern JavaScript (ES6+), DOM, Async Fetch & APIs', hours: 35, completed: false }
    ],
    practicalTestTitle: 'Responsive Institute Landing Page Build',
    practicalTaskDescription: 'Build a mobile-first responsive portfolio page with functional contact form validation.'
  }
];

// ==========================================
// SEED SPOKEN ENGLISH DRILLS
// ==========================================
export const SEED_SPOKEN_LESSONS: SpokenTopicLesson[] = [
  {
    id: 'spoken_1',
    category: 'Job Interview',
    title: 'Executive Job Interview: Highlighting Strengths & Achievements',
    dialogue: [
      {
        speaker: 'Interviewer',
        text: 'Could you walk me through a situation where you had to lead a cross-functional team under tight deadlines?'
      },
      {
        speaker: 'Candidate',
        text: 'Certainly. In my previous role, our team was tasked with launching a new client portal within six weeks. By delegating weekly milestones and holding concise stand-ups, we delivered three days ahead of schedule.',
        phoneticTips: 'Notice clear linking: "walk_me_through", "cross-functional", "concise stand-ups".'
      }
    ],
    keyVocab: [
      { word: 'Cross-functional', meaning: 'Involving people from different departments or skill areas', pronunciation: '/ˌkrɒsˈfʌŋkʃənl/', example: 'We formed a cross-functional working group.' },
      { word: 'Milestone', meaning: 'A significant stage or milestone in the development of something', pronunciation: '/ˈmaɪlstəʊn/', example: 'Completing the beta testing was a major milestone.' },
      { word: 'Proactive', meaning: 'Controlling a situation rather than just reacting to it', pronunciation: '/prəʊˈæktɪv/', example: 'Taking a proactive stance helped mitigate delivery delays.' }
    ],
    drillPrompt: 'Speak into your microphone and explain your own biggest academic or professional accomplishment in 60 seconds.'
  },
  {
    id: 'spoken_2',
    category: 'Travel & Airport',
    title: 'Immigration & Customs Clearance for Overseas Studies',
    dialogue: [
      {
        speaker: 'Immigration Officer',
        text: 'Good afternoon. What is the primary purpose of your travel to the United Kingdom?'
      },
      {
        speaker: 'Student',
        text: 'Good afternoon, Officer. I have been admitted into the Master of Science program in Data Analytics at the University of Birmingham starting this autumn semester.',
        phoneticTips: 'Maintain steady eye contact and natural, unhurried cadence with polite intonation.'
      }
    ],
    keyVocab: [
      { word: 'Matriculation', meaning: 'Formal admission to a university', pronunciation: '/məˌtrɪkjʊˈleɪʃn/', example: 'The matriculation ceremony takes place on Monday.' },
      { word: 'Accommodations', meaning: 'A place to live or stay', pronunciation: '/əˌkɒməˈdeɪʃnz/', example: 'I have arranged university hall accommodations.' }
    ],
    drillPrompt: 'Practice answering 3 common border control questions with confident pacing and crisp pronunciation.'
  }
];

// ==========================================
// SEED DAILY ASSIGNMENTS
// ==========================================
export const SEED_ASSIGNMENTS: DailyAssignment[] = [
  {
    id: 'assign_1',
    title: 'Daily Task: CD-IELTS Academic Reading Passage 1 (Roman Tunnels)',
    courseType: 'ielts_academic',
    module: 'reading',
    assignedByTeacherId: 'teacher_1',
    teacherName: 'Dr. Vikramaditya Sharma',
    batchName: 'Morning IELTS Master 7.5+',
    assignedDate: '2026-10-28',
    dueDate: '2026-10-29',
    durationMinutes: 20,
    testReferenceId: 'read_test_1',
    status: 'pending'
  },
  {
    id: 'assign_2',
    title: 'Daily Task: IELTS Writing Task 2 (Public Transport vs Roads)',
    courseType: 'ielts_academic',
    module: 'writing',
    assignedByTeacherId: 'teacher_1',
    teacherName: 'Dr. Vikramaditya Sharma',
    batchName: 'Morning IELTS Master 7.5+',
    assignedDate: '2026-10-28',
    dueDate: '2026-10-30',
    durationMinutes: 40,
    testReferenceId: 'write_task_2',
    status: 'submitted'
  },
  {
    id: 'assign_3',
    title: 'PTE Speaking Drill: Read Aloud & Describe Image Set B',
    courseType: 'pte_academic',
    module: 'speaking',
    assignedByTeacherId: 'teacher_2',
    teacherName: 'Priyanka Kapoor',
    batchName: 'PTE Target 79+ Batch',
    assignedDate: '2026-10-27',
    dueDate: '2026-10-29',
    durationMinutes: 15,
    testReferenceId: 'pte_1',
    status: 'reviewed'
  }
];

// ==========================================
// SEED MOCK TEST SCHEDULES
// ==========================================
export const SEED_MOCK_SCHEDULES: MockTestSchedule[] = [
  {
    id: 'mock_sch_1',
    title: 'Official CD-IELTS Full Simulation Mock (Terminals 1-25)',
    testType: 'CD_IELTS_FULL',
    date: '2026-11-01',
    startTime: '09:00 AM',
    hallName: 'Computer Lab Alpha (Browsera Infotech Main Center)',
    totalSeats: 25,
    bookedSeats: 21,
    status: 'upcoming'
  },
  {
    id: 'mock_sch_2',
    title: 'PTE Academic Computerized Practice Test (Pearson Simulator)',
    testType: 'PTE_ACADEMIC_FULL',
    date: '2026-11-02',
    startTime: '02:00 PM',
    hallName: 'Testing Room Beta',
    totalSeats: 20,
    bookedSeats: 18,
    status: 'upcoming'
  },
  {
    id: 'mock_sch_3',
    title: 'Weekend IELTS Express Diagnostics Mock',
    testType: 'IELTS_ACADEMIC_MOCK',
    date: '2026-10-25',
    startTime: '10:00 AM',
    hallName: 'Main Exam Auditorium',
    totalSeats: 40,
    bookedSeats: 40,
    status: 'completed'
  }
];

// ==========================================
// SEED SUBMISSIONS WITH DETAILED MISTAKE ANALYSIS
// ==========================================
export const SEED_SUBMISSIONS: TestSubmission[] = [
  {
    id: 'sub_1',
    studentId: 'student_1',
    studentName: 'Amanpreet Singh',
    candidateNumber: 'CD-2026-9042',
    testTitle: 'CD-IELTS Academic Reading Test 1: Engineering & Heritage',
    courseType: 'ielts_academic',
    module: 'reading',
    submittedAt: '2026-10-27 11:45 AM',
    timeSpentSeconds: 1140, // 19 mins
    totalQuestions: 8,
    correctCount: 6,
    rawBandScore: 7.0,
    questionAnalysis: [
      {
        questionNumber: 1,
        userAnswer: 'FALSE',
        correctAnswer: 'FALSE',
        isCorrect: true,
        explanation: 'Correctly identified that tunnels were also constructed for water supply and lake drainage.',
        category: 'Text Fact Extraction'
      },
      {
        questionNumber: 2,
        userAnswer: 'FALSE',
        correctAnswer: 'FALSE',
        isCorrect: true,
        explanation: 'Accurately recognized that counter-excavation was fraught with hazard.',
        category: 'True/False Logic'
      },
      {
        questionNumber: 3,
        userAnswer: 'TRUE',
        correctAnswer: 'NOT GIVEN',
        isCorrect: false,
        explanation: 'Mistake: You assumed Nonius Datus had built 20 aqueducts. The text mentions his arrival at Saldae, but his previous career totals are never specified.',
        category: 'Not Given Assumption Distractor'
      },
      {
        questionNumber: 4,
        userAnswer: 'TRUE',
        correctAnswer: 'TRUE',
        isCorrect: true,
        explanation: 'Correctly linked multiple shaft points to simultaneous excavation.',
        category: 'Paraphrase Matching'
      },
      {
        questionNumber: 5,
        userAnswer: 'TRUE',
        correctAnswer: 'TRUE',
        isCorrect: true,
        explanation: 'Identified lamp soot as an oxygen depletion risk.',
        category: 'Inference'
      },
      {
        questionNumber: 6,
        userAnswer: 'fire-setting',
        correctAnswer: 'fire-setting',
        isCorrect: true,
        explanation: 'Exact keyword identified from Paragraph E.',
        category: 'Word Limit Completion'
      },
      {
        questionNumber: 7,
        userAnswer: 'water levels',
        correctAnswer: 'chorobates',
        isCorrect: false,
        explanation: 'Mistake: The question asks for the specific Latin technical term in the bracket ("water levels called ______"), which was chorobates.',
        category: 'Technical Terminology'
      },
      {
        questionNumber: 8,
        userAnswer: 'B',
        correctAnswer: 'B',
        isCorrect: true,
        explanation: 'Multiple choice correctly answered.',
        category: 'Main Idea Comprehension'
      }
    ],
    teacherReviewed: true,
    reviewedByTeacherId: 'teacher_1',
    teacherName: 'Dr. Vikramaditya Sharma',
    teacherAdjustedBand: 7.0,
    teacherFeedbackNotes: 'Solid performance, Amanpreet. Watch out for "NOT GIVEN" questions—never infer details that are not explicitly stated in the passage. Good time management (completed in 19 mins).',
    teacherReviewedAt: '2026-10-27 04:30 PM'
  },
  {
    id: 'sub_2',
    studentId: 'student_1',
    studentName: 'Amanpreet Singh',
    candidateNumber: 'CD-2026-9042',
    testTitle: 'IELTS Writing Task 2: Free Public Transport vs Road Expansion',
    courseType: 'ielts_academic',
    module: 'writing',
    submittedAt: '2026-10-28 02:15 PM',
    timeSpentSeconds: 2280, // 38 mins
    writtenText: `In contemporary urban planning, whether municipal authorities should offer free public transit to mitigate environmental challenges or invest primarily in highway infrastructure has triggered intense public discourse. While expanding road networks temporarily eases vehicle flow, I strongly believe that subsidizing or providing free transit yields superior ecological and economic returns.

Advocates of road construction argue that modern metropolises are expanding rapidly, necessitating wider arteries to accommodate freight logistics and private automobiles. High-quality expressways decrease transit bottlenecks, thereby reducing idling time and supply chain friction. However, empirical urban studies consistently demonstrate that road expansion triggers "induced demand"—the phenomenon wherein new roads rapidly fill with additional private vehicular traffic, neutralizing initial benefits within a few years.

Conversely, abolishing fares on municipal buses and underground trains incentivizes millions of commuters to abandon private passenger cars. For instance, several European capitals that introduced zero-fare transit observed a twenty percent drop in downtown nitrogen dioxide emissions within twelve months. Furthermore, free transit democratizes urban mobility for lower-income demographics, fostering social equity and reducing aggregate fuel consumption.

In conclusion, although maintaining arterial roadways remains essential for commercial transportation, governments must prioritize investment in zero-fare public transit systems. This strategy addresses the climate crisis decisively while delivering equitable urban development.`,
    aiReport: {
      isLiveAIEvaluation: true,
      modelUsed: 'gemini-3.8-flash (IELTS Examiner Rubric)',
      evaluatedAt: '2026-10-28 02:16 PM',
      overallBand: 7.5,
      criteriaScores: [
        {
          name: 'Task Response',
          score: 8.0,
          description: 'Fully addresses both viewpoints with well-developed ideas, persuasive justification, and clear position throughout.'
        },
        {
          name: 'Coherence and Cohesion',
          score: 7.5,
          description: 'Logical sequencing of paragraphs with sophisticated transitions ("In contemporary urban planning", "Conversely", "Empirical studies").'
        },
        {
          name: 'Lexical Resource',
          score: 7.5,
          description: 'Wide vocabulary with topic-specific collocations ("induced demand", "nitrogen dioxide emissions", "democratizes urban mobility").'
        },
        {
          name: 'Grammatical Range & Accuracy',
          score: 7.0,
          description: 'Complex sentence structures used accurately with minor occasional minor punctuation slips.'
        }
      ],
      strengths: [
        'Clear introduction of the "induced demand" economic concept demonstrates sophisticated argumentation.',
        'Balanced discussion addressing both perspectives before stating a definitive conclusion.',
        'Word count of 278 words comfortably satisfies the 250-word minimum threshold without redundant padding.'
      ],
      areasToImprove: [
        'Could provide a brief counter-argument addressing how municipal governments will fund transit maintenance without farebox revenue.',
        'Vary linking words slightly to avoid predictable paragraph starters.'
      ],
      detailedFeedback: 'An exemplary Band 7.5 essay demonstrating academic precision, compelling evidence, and sound logical cohesion.',
      grammarFixes: [
        {
          original: 'high-quality expressways decrease transit bottlenecks, thereby reducing idling time',
          suggestion: 'High-quality expressways alleviate transit bottlenecks, thereby curbing vehicular idling time',
          rule: 'Stylistic enhancement: Replace generic "decrease" with "alleviate" in formal academic discourse.'
        }
      ],
      vocabularyUpgrades: [
        {
          word: 'eases',
          betterAlternative: 'mitigates / alleviates',
          context: 'Expanding road networks alleviates vehicle flow.'
        },
        {
          word: 'drop',
          betterAlternative: 'precipitous decline / tangible reduction',
          context: 'Observed a tangible reduction in downtown emissions.'
        }
      ]
    },
    teacherReviewed: false
  }
];

// ==========================================
// DATA SERVICE HELPER FUNCTIONS
// ==========================================
const STORAGE_PREFIX = 'browsera_ielts_data_';

function getStored<T>(key: string, seed: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return seed;
    return JSON.parse(item);
  } catch {
    return seed;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export const DataService = {
  getUsers: (): User[] => getStored<User[]>('users', SEED_USERS),
  
  getUserById: (id: string): User | undefined => {
    return DataService.getUsers().find(u => u.id === id);
  },

  saveUser: (user: User): void => {
    const users = DataService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    setStored('users', users);
  },

  deleteUser: (id: string): void => {
    const users = DataService.getUsers().filter(u => u.id !== id);
    setStored('users', users);
  },

  getReadingTests: (): ReadingTest[] => {
    const list = READING_TESTS.map(t => t.readingData!).filter(Boolean);
    const stored = getStored<ReadingTest[]>('reading_tests', list);
    if (stored && stored[0] && (stored[0].questions?.length ?? 0) < 40) {
      setStored('reading_tests', list);
      return list;
    }
    return stored && stored.length > 0 ? stored : list;
  },
  getListeningTests: (): ListeningTest[] => {
    const list = LISTENING_TESTS.map(t => t.listeningData!).filter(Boolean);
    const stored = getStored<ListeningTest[]>('listening_tests', list);
    const totalQ = stored?.[0]?.sections?.reduce((sum, s) => sum + (s.questions?.length || 0), 0) ?? 0;
    if (stored && stored[0] && (totalQ < 40 || (stored[0].sections?.length ?? 0) < 4)) {
      setStored('listening_tests', list);
      return list;
    }
    return stored && stored.length > 0 ? stored : list;
  },
  getWritingTasks: (): WritingTask[] => {
    const list = WRITING_TESTS.map(t => t.writingData!).filter(Boolean);
    return getStored<WritingTask[]>('writing_tasks', list.length > 0 ? list : SEED_WRITING_TASKS);
  },
  getSpeakingTest: (id?: string): SpeakingTest => {
    if (id) {
      const match = SPEAKING_TESTS.find(t => t.id === id);
      if (match?.speakingData) return match.speakingData;
    }
    const first = SPEAKING_TESTS[0]?.speakingData;
    return getStored<SpeakingTest>('speaking_test', first || SEED_SPEAKING_TEST);
  },
  getSpeakingTests: (): SpeakingTest[] => {
    return SPEAKING_TESTS.map(t => t.speakingData!).filter(Boolean);
  },
  getPteItems: (): PteTestItem[] => {
    const list = PTE_TESTS.flatMap(t => t.pteData || []).filter(Boolean);
    return getStored<PteTestItem[]>('pte_items', list.length > 0 ? list : SEED_PTE_ITEMS);
  },
  getTestLibrary: () => ALL_TESTS,
  findTestById: (id: string) => findTestById(id),
  getComputerCourses: (): ComputerCourseModule[] => getStored<ComputerCourseModule[]>('computer_courses', SEED_COMPUTER_COURSES),
  getSpokenLessons: (): SpokenTopicLesson[] => getStored<SpokenTopicLesson[]>('spoken_lessons', SEED_SPOKEN_LESSONS),

  getAssignments: (): DailyAssignment[] => getStored<DailyAssignment[]>('assignments', SEED_ASSIGNMENTS),
  
  saveAssignment: (assignment: DailyAssignment): void => {
    const assignments = DataService.getAssignments();
    const idx = assignments.findIndex(a => a.id === assignment.id);
    if (idx >= 0) {
      assignments[idx] = assignment;
    } else {
      assignments.unshift(assignment);
    }
    setStored('assignments', assignments);
  },

  getMockSchedules: (): MockTestSchedule[] => getStored<MockTestSchedule[]>('mock_schedules', SEED_MOCK_SCHEDULES),
  
  saveMockSchedule: (mock: MockTestSchedule): void => {
    const mocks = DataService.getMockSchedules();
    const idx = mocks.findIndex(m => m.id === mock.id);
    if (idx >= 0) {
      mocks[idx] = mock;
    } else {
      mocks.unshift(mock);
    }
    setStored('mock_schedules', mocks);
  },

  getSubmissions: (): TestSubmission[] => getStored<TestSubmission[]>('submissions', SEED_SUBMISSIONS),

  saveSubmission: (submission: TestSubmission): void => {
    const subs = DataService.getSubmissions();
    const idx = subs.findIndex(s => s.id === submission.id);
    if (idx >= 0) {
      subs[idx] = submission;
    } else {
      subs.unshift(submission);
    }
    setStored('submissions', subs);
  },

  updateTeacherReview: (
    submissionId: string, 
    review: { teacherId: string; teacherName: string; adjustedBand?: number; feedbackNotes: string }
  ): void => {
    const subs = DataService.getSubmissions();
    const sub = subs.find(s => s.id === submissionId);
    if (sub) {
      sub.teacherReviewed = true;
      sub.reviewedByTeacherId = review.teacherId;
      sub.teacherName = review.teacherName;
      if (review.adjustedBand !== undefined) {
        sub.teacherAdjustedBand = review.adjustedBand;
      }
      sub.teacherFeedbackNotes = review.feedbackNotes;
      sub.teacherReviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      setStored('submissions', subs);
    }
  },

  getSystemStatus: (): SystemIntegrationStatus => ({
    backendApiStatus: 'ready_configured',
    databaseStatus: 'indexed_db_ready',
    geminiAiStatus: 'active',
    speechToTextStatus: 'web_speech_api_ready'
  }),

  resetDemoData: (): void => {
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'reading_tests');
    localStorage.removeItem(STORAGE_PREFIX + 'listening_tests');
    localStorage.removeItem(STORAGE_PREFIX + 'writing_tasks');
    localStorage.removeItem(STORAGE_PREFIX + 'speaking_test');
    localStorage.removeItem(STORAGE_PREFIX + 'pte_items');
    localStorage.removeItem(STORAGE_PREFIX + 'computer_courses');
    localStorage.removeItem(STORAGE_PREFIX + 'spoken_lessons');
    localStorage.removeItem(STORAGE_PREFIX + 'assignments');
    localStorage.removeItem(STORAGE_PREFIX + 'mock_schedules');
    localStorage.removeItem(STORAGE_PREFIX + 'submissions');
  }
};

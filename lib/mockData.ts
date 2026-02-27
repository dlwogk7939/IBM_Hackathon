import { addDaysUTC, parseISODate, toISODate } from '@/lib/dateUtils';
import { Deadline, DeadlineType, MockStudent, SyllabusExtraction } from '@/lib/types';

export const TERM_START = '2026-01-12';
export const TERM_END = '2026-05-01';

export const SYLLABUS_TEMPLATES: Record<string, SyllabusExtraction> = {
  engineering: {
    course: 'CSE 3901',
    termStart: TERM_START,
    termEnd: TERM_END,
    deadlines: [
      { title: 'HW1', type: 'hw', date: '2026-01-23', weight: 10, course: 'CSE 3901' },
      { title: 'HW2', type: 'hw', date: '2026-02-06', weight: 10, course: 'CSE 3901' },
      { title: 'Midterm', type: 'exam', date: '2026-02-20', weight: 20, course: 'CSE 3901' },
      { title: 'Project', type: 'project', date: '2026-03-27', weight: 25, course: 'CSE 3901' },
      { title: 'Final Exam', type: 'exam', date: '2026-04-24', weight: 30, course: 'CSE 3901' }
    ]
  },
  science: {
    course: 'BIO 2200',
    termStart: TERM_START,
    termEnd: TERM_END,
    deadlines: [
      { title: 'Lab Report 1', type: 'hw', date: '2026-01-30', weight: 10, course: 'BIO 2200' },
      { title: 'Lab Report 2', type: 'hw', date: '2026-02-27', weight: 10, course: 'BIO 2200' },
      { title: 'Field Project', type: 'project', date: '2026-03-20', weight: 20, course: 'BIO 2200' },
      { title: 'Midterm', type: 'exam', date: '2026-03-06', weight: 20, course: 'BIO 2200' },
      { title: 'Final Exam', type: 'exam', date: '2026-04-28', weight: 30, course: 'BIO 2200' }
    ]
  },
  business: {
    course: 'BUS 3010',
    termStart: TERM_START,
    termEnd: TERM_END,
    deadlines: [
      { title: 'Case Study 1', type: 'hw', date: '2026-01-26', weight: 10, course: 'BUS 3010' },
      { title: 'Case Study 2', type: 'hw', date: '2026-02-16', weight: 10, course: 'BUS 3010' },
      { title: 'Market Analysis', type: 'project', date: '2026-03-30', weight: 25, course: 'BUS 3010' },
      { title: 'Midterm', type: 'exam', date: '2026-03-09', weight: 20, course: 'BUS 3010' },
      { title: 'Final Exam', type: 'exam', date: '2026-04-27', weight: 30, course: 'BUS 3010' }
    ]
  }
};

export const TEMPLATE_OPTIONS = [
  { id: 'engineering', label: 'Engineering Template (CSE 3901)' },
  { id: 'science', label: 'Science Template (BIO 2200)' },
  { id: 'business', label: 'Business Template (BUS 3010)' }
];

export function getTemplateExtraction(templateId: string): SyllabusExtraction {
  const template = SYLLABUS_TEMPLATES[templateId] ?? SYLLABUS_TEMPLATES.engineering;
  return {
    ...template,
    deadlines: template.deadlines.map((deadline) => ({ ...deadline }))
  };
}

const COURSE_CATALOG = [
  'CSE 3901',
  'MTH 2100',
  'BIO 2200',
  'BUS 3010',
  'PSY 1101',
  'ENG 2015',
  'CHE 1300',
  'ECO 2500',
  'HIS 2140'
];

function typeForIndex(index: number): DeadlineType {
  if (index === 2) {
    return 'project';
  }
  if (index === 3) {
    return 'exam';
  }
  return 'hw';
}

function titleForType(type: DeadlineType, index: number): string {
  if (type === 'exam') {
    return index > 3 ? 'Final Exam' : 'Midterm';
  }
  if (type === 'project') {
    return 'Course Project';
  }
  return `HW${index + 1}`;
}

function weightForType(type: DeadlineType): number {
  if (type === 'exam') {
    return 25;
  }
  if (type === 'project') {
    return 20;
  }
  return 10;
}

function buildCourseDeadlines(course: string, studentIdx: number, courseIdx: number): Deadline[] {
  const seed = studentIdx * 13 + courseIdx * 7 + course.charCodeAt(0);
  const termStartDate = parseISODate(TERM_START);

  const deadlines: Deadline[] = [];

  for (let i = 0; i < 5; i += 1) {
    const type = typeForIndex(i);
    const week = 1 + ((seed + i * 3) % 15);
    const dayOffsetInWeek = 1 + ((seed + i) % 5);
    const dueDate = addDaysUTC(termStartDate, (week - 1) * 7 + dayOffsetInWeek);

    deadlines.push({
      title: titleForType(type, i),
      type,
      date: toISODate(dueDate),
      weight: weightForType(type),
      course
    });
  }

  return deadlines.sort((a, b) => a.date.localeCompare(b.date));
}

export function generateMockStudents(): MockStudent[] {
  return Array.from({ length: 20 }, (_, idx) => {
    const studentId = `S${(1001 + idx).toString().padStart(4, '0')}`;
    const courseCount = 3 + (idx % 3);
    const startIdx = (idx * 2) % COURSE_CATALOG.length;

    const courses = Array.from({ length: courseCount }, (_, courseIdx) => {
      const course = COURSE_CATALOG[(startIdx + courseIdx) % COURSE_CATALOG.length];
      return {
        course,
        deadlines: buildCourseDeadlines(course, idx, courseIdx)
      };
    });

    return {
      studentId,
      courses
    };
  });
}

export const MOCK_STUDENTS = generateMockStudents();

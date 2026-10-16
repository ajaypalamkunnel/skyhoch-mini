import type { PrismaClient } from "../../src/generated/prisma/client";

export async function seedFutureLiveClasses(
  prisma: PrismaClient,
): Promise<void> {
  const tutors = await prisma.user.findMany({
    where: {
      email: {
        in: [
          "tutor1@skyhoc.com",
          "tutor2@skyhoc.com",
        ],
      },
      isActive: true,
      role: {
        type: "TUTOR",
        status: "ACTIVE",
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  const courses = await prisma.course.findMany({
    where: {
      title: {
        in: [
          "German A1 – Beginner",
          "German A2 – Elementary",
          "German B1 – Intermediate",
        ],
      },
      isActive: true,
    },
    select: {
      id: true,
      title: true,
    },
  });

  const tutorMap = new Map(
    tutors.map((tutor) => [tutor.email, tutor.id]),
  );

  const courseMap = new Map(
    courses.map((course) => [course.title, course.id]),
  );

  const requiredTutors = [
    "tutor1@skyhoc.com",
    "tutor2@skyhoc.com",
  ];

  const requiredCourses = [
    "German A1 – Beginner",
    "German A2 – Elementary",
    "German B1 – Intermediate",
  ];

  for (const email of requiredTutors) {
    if (!tutorMap.has(email)) {
      throw new Error(
        `Active tutor ${email} is not configured. Run user seeder first.`,
      );
    }
  }

  for (const title of requiredCourses) {
    if (!courseMap.has(title)) {
      throw new Error(
        `Active course "${title}" is not configured. Run course seeder first.`,
      );
    }
  }

  const futureLiveClasses = [
    // Week 1: Monday, October 19, 2026 to Friday, October 23, 2026 (10 classes, 2/day)
    {
      courseTitle: "German A1 – Beginner",
      tutorEmail: "tutor1@skyhoc.com",
      title: "German A1 – Family & Personal Introductions",
      startsAt: new Date("2026-10-19T10:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German A2 – Elementary",
      tutorEmail: "tutor2@skyhoc.com",
      title: "German A2 – Giving Directions & City Navigation",
      startsAt: new Date("2026-10-19T14:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German B1 – Intermediate",
      tutorEmail: "tutor1@skyhoc.com",
      title: "German B1 – Expressing Opinions & Everyday Debates",
      startsAt: new Date("2026-10-20T10:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German A1 – Beginner",
      tutorEmail: "tutor2@skyhoc.com",
      title: "German A1 – Food, Drinks & Ordering at a Restaurant",
      startsAt: new Date("2026-10-20T14:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German A2 – Elementary",
      tutorEmail: "tutor1@skyhoc.com",
      title: "German A2 – Travel, Booking Hotels & Transportation",
      startsAt: new Date("2026-10-21T10:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German B1 – Intermediate",
      tutorEmail: "tutor2@skyhoc.com",
      title: "German B1 – Workplace Communication & Formal Emails",
      startsAt: new Date("2026-10-21T14:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German A1 – Beginner",
      tutorEmail: "tutor1@skyhoc.com",
      title: "German A1 – Daily Routines & Telling Time",
      startsAt: new Date("2026-10-22T10:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German A2 – Elementary",
      tutorEmail: "tutor2@skyhoc.com",
      title: "German A2 – Shopping & Clothing Vocabulary",
      startsAt: new Date("2026-10-22T14:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German B1 – Intermediate",
      tutorEmail: "tutor1@skyhoc.com",
      title: "German B1 – Subjunctive II (Konjunktiv II) & Wishes",
      startsAt: new Date("2026-10-23T10:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German A1 – Beginner",
      tutorEmail: "tutor2@skyhoc.com",
      title: "German A1 – Hobbies & Free Time Activities",
      startsAt: new Date("2026-10-23T14:00:00+05:30"),
      durationMinutes: 60,
    },

    // Week 2: Monday, October 26, 2026 to Friday, October 30, 2026 (10 classes, 2/day)
    {
      courseTitle: "German A2 – Elementary",
      tutorEmail: "tutor1@skyhoc.com",
      title: "German A2 – Health, Body & Doctor Visits",
      startsAt: new Date("2026-10-26T10:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German B1 – Intermediate",
      tutorEmail: "tutor2@skyhoc.com",
      title: "German B1 – Passive Voice & News Reporting",
      startsAt: new Date("2026-10-26T14:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German A1 – Beginner",
      tutorEmail: "tutor1@skyhoc.com",
      title: "German A1 – Living & Housing Description",
      startsAt: new Date("2026-10-27T10:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German A2 – Elementary",
      tutorEmail: "tutor2@skyhoc.com",
      title: "German A2 – Past Tense (Perfekt) in Conversation",
      startsAt: new Date("2026-10-27T14:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German B1 – Intermediate",
      tutorEmail: "tutor1@skyhoc.com",
      title: "German B1 – Relative Clauses & Complex Sentences",
      startsAt: new Date("2026-10-28T10:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German A1 – Beginner",
      tutorEmail: "tutor2@skyhoc.com",
      title: "German A1 – Weather, Seasons & Calendar",
      startsAt: new Date("2026-10-28T14:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German A2 – Elementary",
      tutorEmail: "tutor1@skyhoc.com",
      title: "German A2 – Expressing Feelings & Giving Advice",
      startsAt: new Date("2026-10-29T10:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German B1 – Intermediate",
      tutorEmail: "tutor2@skyhoc.com",
      title: "German B1 – Culture, Traditions & Social Life in Germany",
      startsAt: new Date("2026-10-29T14:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German A1 – Beginner",
      tutorEmail: "tutor1@skyhoc.com",
      title: "German A1 – Speaking Fluency & Review Practice",
      startsAt: new Date("2026-10-30T10:00:00+05:30"),
      durationMinutes: 60,
    },
    {
      courseTitle: "German B1 – Intermediate",
      tutorEmail: "tutor2@skyhoc.com",
      title: "German B1 – Advanced Fluency & Exam Workshop",
      startsAt: new Date("2026-10-30T14:00:00+05:30"),
      durationMinutes: 60,
    },
  ];

  await prisma.liveClass.createMany({
    data: futureLiveClasses.map((liveClass) => ({
      courseId: courseMap.get(liveClass.courseTitle)!,
      tutorId: tutorMap.get(liveClass.tutorEmail)!,
      title: liveClass.title,
      startsAt: liveClass.startsAt,
      durationMinutes: liveClass.durationMinutes,
      status: "SCHEDULED",
    })),
    skipDuplicates: true,
  });

  console.log("✓ Future live classes seeded (20 classes across next 2 weeks)");
}

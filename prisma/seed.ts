import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna",
  "Ishaan", "Rohan", "Ananya", "Diya", "Saanvi", "Aadhya", "Kiara", "Myra",
  "Anika", "Pari", "Riya", "Ishita", "Kabir", "Dhruv", "Yash", "Aryan",
  "Neha", "Priyanka", "Tanvi", "Sneha", "Ritika", "Meera", "Shaurya", "Advait",
  "Nitya", "Avni", "Rudra", "Om", "Kavya", "Ira", "Vedant", "Samar",
];

const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Kumar", "Singh", "Patel", "Nair", "Iyer",
  "Rao", "Mehta", "Joshi", "Reddy", "Kapoor", "Malhotra", "Chatterjee", "Bose",
  "Agarwal", "Bhatt", "Desai", "Pillai",
];

const GRADE_SCALES = [
  { minPercent: 90, maxPercent: 100, grade: "A+", remark: "Outstanding" },
  { minPercent: 80, maxPercent: 89.99, grade: "A", remark: "Excellent" },
  { minPercent: 70, maxPercent: 79.99, grade: "B", remark: "Very Good" },
  { minPercent: 60, maxPercent: 69.99, grade: "C", remark: "Good" },
  { minPercent: 35, maxPercent: 59.99, grade: "D", remark: "Satisfactory" },
  { minPercent: 0, maxPercent: 34.99, grade: "F", remark: "Needs Improvement" },
];

function gradeFor(percent: number) {
  return GRADE_SCALES.find((g) => percent >= g.minPercent && percent <= g.maxPercent)!.grade;
}

function weekdaysAgo(count: number): Date[] {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (dates.length < count) {
    cursor.setDate(cursor.getDate() - 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) dates.push(new Date(cursor));
  }
  return dates.reverse();
}

async function main() {
  console.log("Seeding database...");

  await prisma.gradeScale.createMany({ data: GRADE_SCALES });

  const academicYear = await prisma.academicYear.create({
    data: {
      name: "2026-2027",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      isActive: true,
    },
  });

  const classNames = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  ];
  const schoolClasses = [];
  for (let i = 0; i < classNames.length; i++) {
    schoolClasses.push(
      await prisma.schoolClass.create({ data: { name: classNames[i], order: i + 1 } })
    );
  }

  const sections: Record<string, { id: string }> = {};
  for (const sc of schoolClasses) {
    for (const name of ["A", "B"]) {
      const section = await prisma.section.create({
        data: { name, schoolClassId: sc.id },
      });
      sections[`${sc.name}-${name}`] = section;
    }
  }

  const subjectDefs = [
    { name: "Mathematics", code: "MATH" },
    { name: "Science", code: "SCI" },
    { name: "English", code: "ENG" },
    { name: "Social Studies", code: "SST" },
    { name: "Hindi", code: "HIN" },
    { name: "Computer Science", code: "CS" },
  ];
  const subjects = [];
  for (const s of subjectDefs) {
    subjects.push(await prisma.subject.create({ data: s }));
  }

  const admin = await prisma.user.create({
    data: {
      name: "Anjali Verma",
      email: "admin@shubhvidyalaya.edu",
      password: hash("Admin@123"),
      role: "ADMIN",
      phone: "9800000001",
    },
  });
  await prisma.staff.create({
    data: {
      userId: admin.id,
      employeeId: "EMP0001",
      designation: "Principal",
      department: "Administration",
      basicSalary: 120000,
    },
  });

  const teacherDefs = [
    { name: "Rajesh Kumar", subjectCode: "MATH" },
    { name: "Priya Sharma", subjectCode: "SCI" },
    { name: "Sunita Singh", subjectCode: "ENG" },
    { name: "Amit Patel", subjectCode: "SST" },
    { name: "Kavita Nair", subjectCode: "HIN" },
    { name: "Vikram Rao", subjectCode: "CS" },
  ];
  const teacherStaffBySubject: Record<string, { id: string; userId: string; name: string }> = {};
  let empCounter = 2;
  for (const t of teacherDefs) {
    const email = `${t.name.toLowerCase().replace(" ", ".")}@shubhvidyalaya.edu`;
    const user = await prisma.user.create({
      data: {
        name: t.name,
        email,
        password: hash("Teacher@123"),
        role: "TEACHER",
        phone: `98000000${String(empCounter).padStart(2, "0")}`,
      },
    });
    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        employeeId: `EMP${String(empCounter).padStart(4, "0")}`,
        designation: "Subject Teacher",
        department: t.subjectCode,
        basicSalary: 55000,
      },
    });
    teacherStaffBySubject[t.subjectCode] = { id: staff.id, userId: user.id, name: t.name };
    empCounter++;
  }

  const accountantUser = await prisma.user.create({
    data: {
      name: "Deepak Mehta",
      email: "accountant@shubhvidyalaya.edu",
      password: hash("Accountant@123"),
      role: "ACCOUNTANT",
      phone: "9800000020",
    },
  });
  await prisma.staff.create({
    data: {
      userId: accountantUser.id,
      employeeId: "EMP0020",
      designation: "Accountant",
      department: "Finance",
      basicSalary: 45000,
    },
  });

  const librarianUser = await prisma.user.create({
    data: {
      name: "Meena Iyer",
      email: "librarian@shubhvidyalaya.edu",
      password: hash("Librarian@123"),
      role: "LIBRARIAN",
      phone: "9800000021",
    },
  });
  await prisma.staff.create({
    data: {
      userId: librarianUser.id,
      employeeId: "EMP0021",
      designation: "Librarian",
      department: "Library",
      basicSalary: 35000,
    },
  });

  const transportUser = await prisma.user.create({
    data: {
      name: "Suresh Yadav",
      email: "transport@shubhvidyalaya.edu",
      password: hash("Transport@123"),
      role: "TRANSPORT_STAFF",
      phone: "9800000022",
    },
  });
  await prisma.staff.create({
    data: {
      userId: transportUser.id,
      employeeId: "EMP0022",
      designation: "Transport Coordinator",
      department: "Transport",
      basicSalary: 30000,
    },
  });

  const allStaff = await prisma.staff.findMany();
  const paidMonth = new Date().getMonth() === 0 ? 12 : new Date().getMonth();
  const paidYear = new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
  const pendingMonth = new Date().getMonth() + 1;
  const pendingYear = new Date().getFullYear();
  for (const staff of allStaff) {
    const basic = Number(staff.basicSalary);
    const allowances = basic * 0.1;
    const deductions = basic * 0.05;
    await prisma.payroll.create({
      data: {
        staffId: staff.id,
        month: paidMonth,
        year: paidYear,
        basic,
        allowances,
        deductions,
        netPay: basic + allowances - deductions,
        status: "PAID",
        paidAt: new Date(),
      },
    });
    await prisma.payroll.create({
      data: {
        staffId: staff.id,
        month: pendingMonth,
        year: pendingYear,
        basic,
        allowances,
        deductions,
        netPay: basic + allowances - deductions,
        status: "PENDING",
      },
    });
  }

  for (const sc of schoolClasses) {
    for (const secName of ["A", "B"]) {
      const section = sections[`${sc.name}-${secName}`];
      const teacherForClass = Object.values(teacherStaffBySubject)[
        (sc.order + (secName === "A" ? 0 : 1)) % subjectDefs.length
      ];
      await prisma.section.update({
        where: { id: section.id },
        data: { classTeacherId: teacherForClass.id },
      });
      for (const subj of subjects) {
        const teacher = teacherStaffBySubject[subj.code];
        await prisma.classSubject.create({
          data: { sectionId: section.id, subjectId: subj.id, teacherId: teacher.id },
        });
      }
    }
  }

  const feeCategoryDefs = ["Tuition Fee", "Transport Fee", "Library Fee", "Examination Fee"];
  const feeCategories: Record<string, { id: string }> = {};
  for (const name of feeCategoryDefs) {
    feeCategories[name] = await prisma.feeCategory.create({ data: { name } });
  }

  const seededClasses = schoolClasses.filter((c) => ["Grade 9", "Grade 10"].includes(c.name));
  for (const sc of seededClasses) {
    const tuition = sc.name === "Grade 9" ? 5000 : 5500;
    await prisma.feeStructure.create({
      data: { schoolClassId: sc.id, feeCategoryId: feeCategories["Tuition Fee"].id, amount: tuition, frequency: "MONTHLY" },
    });
    await prisma.feeStructure.create({
      data: { schoolClassId: sc.id, feeCategoryId: feeCategories["Transport Fee"].id, amount: 12000, frequency: "ANNUAL" },
    });
    await prisma.feeStructure.create({
      data: { schoolClassId: sc.id, feeCategoryId: feeCategories["Library Fee"].id, amount: 1000, frequency: "ANNUAL" },
    });
    await prisma.feeStructure.create({
      data: { schoolClassId: sc.id, feeCategoryId: feeCategories["Examination Fee"].id, amount: 1500, frequency: "ANNUAL" },
    });
  }

  const examType = await prisma.examType.create({ data: { name: "Mid-Term Examination" } });

  let studentCounter = 1;
  let nameIdx = 0;
  const allStudentsBySection: Record<string, { id: string; firstName: string; lastName: string }[]> = {};

  for (const sc of seededClasses) {
    for (const secName of ["A", "B"]) {
      const section = sections[`${sc.name}-${secName}`];
      const studentsInSection: { id: string; firstName: string; lastName: string }[] = [];

      for (let i = 0; i < 10; i++) {
        const firstName = FIRST_NAMES[nameIdx % FIRST_NAMES.length];
        const lastName = LAST_NAMES[(nameIdx * 3) % LAST_NAMES.length];
        nameIdx++;
        const admissionNo = `ADM${String(studentCounter).padStart(4, "0")}`;
        const isDemoStudent = sc.name === "Grade 10" && secName === "A" && i === 0;

        let studentUserId: string | undefined;
        if (isDemoStudent) {
          const su = await prisma.user.create({
            data: {
              name: `${firstName} ${lastName}`,
              email: "student@shubhvidyalaya.edu",
              password: hash("Student@123"),
              role: "STUDENT",
              phone: `9700${String(studentCounter).padStart(6, "0")}`,
            },
          });
          studentUserId = su.id;
        }

        const student = await prisma.student.create({
          data: {
            userId: studentUserId,
            admissionNo,
            firstName,
            lastName,
            dob: new Date(2011 - sc.order, (studentCounter % 12), (studentCounter % 27) + 1),
            gender: studentCounter % 2 === 0 ? "MALE" : "FEMALE",
            bloodGroup: ["A+", "B+", "O+", "AB+"][studentCounter % 4],
            address: `${studentCounter} MG Road, New Delhi`,
            sectionId: section.id,
            rollNumber: String(i + 1),
            status: "ACTIVE",
          },
        });
        studentsInSection.push({ id: student.id, firstName, lastName });

        const fatherName = `${LAST_NAMES[(nameIdx + 5) % LAST_NAMES.length]} ${lastName}`;
        let guardianUserId: string | undefined;
        if (isDemoStudent) {
          const pu = await prisma.user.create({
            data: {
              name: `Mr. ${lastName}`,
              email: "parent@shubhvidyalaya.edu",
              password: hash("Parent@123"),
              role: "PARENT",
              phone: `9600${String(studentCounter).padStart(6, "0")}`,
            },
          });
          guardianUserId = pu.id;
        }
        await prisma.guardian.create({
          data: {
            studentId: student.id,
            userId: guardianUserId,
            name: `Mr. ${lastName}`,
            relation: "FATHER",
            phone: `9600${String(studentCounter).padStart(6, "0")}`,
            occupation: "Business",
          },
        });
        await prisma.guardian.create({
          data: {
            studentId: student.id,
            name: `Mrs. ${lastName}`,
            relation: "MOTHER",
            phone: `9500${String(studentCounter).padStart(6, "0")}`,
            occupation: "Homemaker",
          },
        });

        // Fee invoice for the year
        const structures = await prisma.feeStructure.findMany({ where: { schoolClassId: sc.id } });
        const total = structures.reduce((sum, s) => sum + Number(s.amount) * (s.frequency === "MONTHLY" ? 12 : 1), 0);
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNo: `INV-2026-${String(studentCounter).padStart(4, "0")}`,
            studentId: student.id,
            academicYearId: academicYear.id,
            dueDate: new Date("2026-08-31"),
            totalAmount: total,
            paidAmount: 0,
            status: "PENDING",
          },
        });
        for (const s of structures) {
          await prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              feeCategoryId: s.feeCategoryId,
              amount: Number(s.amount) * (s.frequency === "MONTHLY" ? 12 : 1),
            },
          });
        }

        const paymentPattern = studentCounter % 4;
        if (paymentPattern === 0) {
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: total,
              method: "ONLINE",
              receiptNo: `RCPT-${String(studentCounter).padStart(4, "0")}`,
            },
          });
          await prisma.invoice.update({ where: { id: invoice.id }, data: { paidAmount: total, status: "PAID" } });
        } else if (paymentPattern === 1) {
          const half = total / 2;
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: half,
              method: "CASH",
              receiptNo: `RCPT-${String(studentCounter).padStart(4, "0")}`,
            },
          });
          await prisma.invoice.update({ where: { id: invoice.id }, data: { paidAmount: half, status: "PARTIAL" } });
        } else if (paymentPattern === 2) {
          await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "OVERDUE" } });
        }

        studentCounter++;
      }
      allStudentsBySection[`${sc.name}-${secName}`] = studentsInSection;
    }
  }

  // Examinations & marks
  for (const sc of seededClasses) {
    const exam = await prisma.exam.create({
      data: {
        name: `${sc.name} Mid-Term Examination`,
        examTypeId: examType.id,
        academicYearId: academicYear.id,
        schoolClassId: sc.id,
        startDate: new Date("2026-09-15"),
        endDate: new Date("2026-09-22"),
      },
    });

    const examSubjects = [];
    for (let i = 0; i < subjects.length; i++) {
      const examSubject = await prisma.examSubject.create({
        data: {
          examId: exam.id,
          subjectId: subjects[i].id,
          examDate: new Date(2026, 8, 15 + i),
          maxMarks: 100,
          passMarks: 35,
        },
      });
      examSubjects.push(examSubject);
    }

    const teacherEntry = Object.values(teacherStaffBySubject)[0];
    for (const secName of ["A", "B"]) {
      const students = allStudentsBySection[`${sc.name}-${secName}`];
      for (const [idx, student] of students.entries()) {
        for (const examSubject of examSubjects) {
          const marks = 40 + ((idx * 7 + examSubject.maxMarks) % 58);
          await prisma.marksEntry.create({
            data: {
              examSubjectId: examSubject.id,
              studentId: student.id,
              marksObtained: marks,
              grade: gradeFor(marks),
              enteredById: teacherEntry.userId,
            },
          });
        }
      }
    }
  }

  // Timetable
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;
  const periodTimes = [
    ["09:00", "09:45"], ["09:45", "10:30"], ["10:45", "11:30"],
    ["11:30", "12:15"], ["13:00", "13:45"], ["13:45", "14:30"],
  ];
  for (const sc of seededClasses) {
    for (const secName of ["A", "B"]) {
      const section = sections[`${sc.name}-${secName}`];
      for (const day of days) {
        for (let p = 0; p < periodTimes.length; p++) {
          const subject = subjects[p % subjects.length];
          const teacher = teacherStaffBySubject[subject.code];
          await prisma.timetableSlot.create({
            data: {
              sectionId: section.id,
              subjectId: subject.id,
              teacherId: teacher.id,
              dayOfWeek: day,
              startTime: periodTimes[p][0],
              endTime: periodTimes[p][1],
              room: `Room ${sc.order}0${secName === "A" ? 1 : 2}`,
            },
          });
        }
      }
    }
  }

  // Homework
  for (const sc of seededClasses) {
    for (const secName of ["A", "B"]) {
      const section = sections[`${sc.name}-${secName}`];
      const students = allStudentsBySection[`${sc.name}-${secName}`];
      for (const subject of subjects.slice(0, 3)) {
        const teacher = teacherStaffBySubject[subject.code];
        const homework = await prisma.homework.create({
          data: {
            sectionId: section.id,
            subjectId: subject.id,
            teacherId: teacher.userId,
            title: `${subject.name} Chapter Review`,
            description: `Complete the exercise questions from the latest chapter in ${subject.name}.`,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
        for (const [idx, student] of students.entries()) {
          if (idx % 2 === 0) {
            await prisma.homeworkSubmission.create({
              data: {
                homeworkId: homework.id,
                studentId: student.id,
                submittedAt: new Date(),
                status: idx % 4 === 0 ? "GRADED" : "SUBMITTED",
                grade: idx % 4 === 0 ? "A" : null,
              },
            });
          }
        }
      }
    }
  }

  // Attendance
  const attendanceDates = weekdaysAgo(10);
  for (const sc of seededClasses) {
    for (const secName of ["A", "B"]) {
      const section = sections[`${sc.name}-${secName}`];
      const students = allStudentsBySection[`${sc.name}-${secName}`];
      for (const date of attendanceDates) {
        for (const [idx, student] of students.entries()) {
          const mod = (idx + date.getDate()) % 10;
          const status = mod === 0 ? "ABSENT" : mod === 1 ? "LATE" : "PRESENT";
          await prisma.studentAttendance.create({
            data: {
              studentId: student.id,
              sectionId: section.id,
              date,
              status,
              markedById: teacherStaffBySubject["MATH"].userId,
            },
          });
        }
      }
    }
  }

  for (const staff of allStaff) {
    for (const date of attendanceDates) {
      await prisma.staffAttendance.create({
        data: {
          staffId: staff.id,
          date,
          status: "PRESENT",
          checkIn: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 45),
          checkOut: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 30),
        },
      });
    }
  }

  // Leave requests
  const demoStudent = allStudentsBySection["Grade 10-A"][0];
  const demoStudentUser = await prisma.user.findUnique({ where: { email: "student@shubhvidyalaya.edu" } });
  if (demoStudentUser) {
    await prisma.leaveRequest.create({
      data: {
        applicantId: demoStudentUser.id,
        applicantType: "STUDENT",
        fromDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        toDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        reason: "Family function",
        status: "PENDING",
      },
    });
  }
  await prisma.leaveRequest.create({
    data: {
      applicantId: teacherStaffBySubject["SCI"].userId,
      applicantType: "STAFF",
      fromDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      toDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      reason: "Medical appointment",
      status: "APPROVED",
      approvedById: admin.id,
    },
  });

  // Notices
  const noticeDefs = [
    { title: "Annual Sports Day", content: "Annual Sports Day will be held on 15th October. All students must participate.", audience: "ALL" as const },
    { title: "Parent-Teacher Meeting", content: "PTM scheduled for this Saturday from 10 AM to 1 PM.", audience: "PARENTS" as const },
    { title: "Mid-Term Exam Schedule Released", content: "Mid-term examination datesheet has been published. Check the Examinations section.", audience: "STUDENTS" as const },
    { title: "Staff Meeting", content: "Monthly staff meeting on Friday after school hours in the staff room.", audience: "TEACHERS" as const },
    { title: "Library Renovation", content: "The library will be closed for renovation from 20th to 25th of this month.", audience: "ALL" as const },
  ];
  for (const n of noticeDefs) {
    await prisma.notice.create({
      data: { title: n.title, content: n.content, audience: n.audience, publishedById: admin.id },
    });
  }

  // Library
  const bookDefs = [
    { title: "The Discovery of India", author: "Jawaharlal Nehru", category: "History" },
    { title: "Wings of Fire", author: "A.P.J. Abdul Kalam", category: "Biography" },
    { title: "NCERT Mathematics Class 10", author: "NCERT", category: "Textbook" },
    { title: "NCERT Science Class 10", author: "NCERT", category: "Textbook" },
    { title: "Malgudi Days", author: "R.K. Narayan", category: "Fiction" },
    { title: "Panchatantra Tales", author: "Vishnu Sharma", category: "Fiction" },
    { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science" },
    { title: "The Jungle Book", author: "Rudyard Kipling", category: "Fiction" },
    { title: "Atlas of the World", author: "National Geographic", category: "Reference" },
    { title: "Introduction to Computer Science", author: "V. Rajaraman", category: "Textbook" },
    { title: "English Grammar in Use", author: "Raymond Murphy", category: "Reference" },
    { title: "The Story of My Experiments with Truth", author: "M.K. Gandhi", category: "Biography" },
    { title: "Encyclopedia of General Knowledge", author: "Various", category: "Reference" },
    { title: "Amar Chitra Katha Collection", author: "Anant Pai", category: "Fiction" },
    { title: "NCERT Social Science Class 10", author: "NCERT", category: "Textbook" },
  ];
  const books = [];
  for (const b of bookDefs) {
    books.push(
      await prisma.book.create({
        data: { ...b, totalCopies: 5, availableCopies: 5 },
      })
    );
  }
  const issueTargets = [
    ...allStudentsBySection["Grade 9-A"].slice(0, 4),
    ...allStudentsBySection["Grade 10-A"].slice(0, 4),
  ];
  for (const [idx, student] of issueTargets.entries()) {
    const book = books[idx % books.length];
    const issueDate = new Date(Date.now() - (14 - idx) * 24 * 60 * 60 * 1000);
    const dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    const overdue = idx % 4 === 0;
    const returned = idx % 3 === 0 && !overdue;
    await prisma.bookIssue.create({
      data: {
        bookId: book.id,
        studentId: student.id,
        issueDate,
        dueDate,
        returnDate: returned ? new Date() : null,
        fineAmount: overdue ? 50 : 0,
        status: returned ? "RETURNED" : overdue ? "OVERDUE" : "ISSUED",
      },
    });
    await prisma.book.update({
      where: { id: book.id },
      data: { availableCopies: { decrement: returned ? 0 : 1 } },
    });
  }

  // Transport
  const vehicleDefs = [
    { vehicleNo: "DL-1PC-1001", capacity: 40, driverName: "Ramesh Chand", driverPhone: "9811100001" },
    { vehicleNo: "DL-1PC-1002", capacity: 40, driverName: "Mohan Lal", driverPhone: "9811100002" },
    { vehicleNo: "DL-1PC-1003", capacity: 35, driverName: "Vijay Singh", driverPhone: "9811100003" },
  ];
  const routeDefs = [
    { name: "Route 1 - Rohini", stops: ["Rohini Sector 3", "Rohini Sector 7", "Rohini Sector 11"] },
    { name: "Route 2 - Dwarka", stops: ["Dwarka Sector 6", "Dwarka Sector 12", "Dwarka Sector 21"] },
    { name: "Route 3 - Saket", stops: ["Saket Metro", "Malviya Nagar", "Hauz Khas"] },
  ];
  const allRoutes: { id: string; stops: { id: string }[] }[] = [];
  for (let i = 0; i < routeDefs.length; i++) {
    const vehicle = await prisma.vehicle.create({ data: vehicleDefs[i] });
    const route = await prisma.route.create({ data: { name: routeDefs[i].name, vehicleId: vehicle.id } });
    const stops = [];
    for (let s = 0; s < routeDefs[i].stops.length; s++) {
      stops.push(
        await prisma.routeStop.create({
          data: {
            routeId: route.id,
            name: routeDefs[i].stops[s],
            sequence: s + 1,
            pickupTime: `0${7 + s}:${s === 0 ? "00" : "15"}`,
          },
        })
      );
    }
    allRoutes.push({ id: route.id, stops });
  }
  const transportTargets = [
    ...allStudentsBySection["Grade 9-B"].slice(0, 3),
    ...allStudentsBySection["Grade 10-B"].slice(0, 3),
  ];
  for (const [idx, student] of transportTargets.entries()) {
    const route = allRoutes[idx % allRoutes.length];
    const stop = route.stops[idx % route.stops.length];
    await prisma.studentTransport.create({
      data: { studentId: student.id, routeId: route.id, stopId: stop.id, feeAmount: 1000 },
    });
  }

  console.log("Seed complete.");
  console.log("Demo logins:");
  console.log("  Admin:      admin@shubhvidyalaya.edu / Admin@123");
  console.log("  Teacher:    rajesh.kumar@shubhvidyalaya.edu / Teacher@123");
  console.log("  Accountant: accountant@shubhvidyalaya.edu / Accountant@123");
  console.log("  Librarian:  librarian@shubhvidyalaya.edu / Librarian@123");
  console.log("  Transport:  transport@shubhvidyalaya.edu / Transport@123");
  console.log("  Student:    student@shubhvidyalaya.edu / Student@123");
  console.log("  Parent:     parent@shubhvidyalaya.edu / Parent@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

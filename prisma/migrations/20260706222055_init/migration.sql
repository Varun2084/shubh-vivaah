-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'LIBRARIAN', 'TRANSPORT_STAFF');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ALUMNI');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "GuardianRelation" AS ENUM ('FATHER', 'MOTHER', 'GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE');

-- CreateEnum
CREATE TYPE "LeaveApplicantType" AS ENUM ('STUDENT', 'STAFF');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FeeFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'ONLINE', 'CHEQUE');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "HomeworkStatus" AS ENUM ('ASSIGNED', 'SUBMITTED', 'GRADED', 'LATE');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "NoticeAudience" AS ENUM ('ALL', 'STUDENTS', 'TEACHERS', 'PARENTS', 'STAFF');

-- CreateEnum
CREATE TYPE "BookIssueStatus" AS ENUM ('ISSUED', 'RETURNED', 'OVERDUE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "school_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolClassId" TEXT NOT NULL,
    "classTeacherId" TEXT,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_subjects" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,

    CONSTRAINT "class_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "admissionNo" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "bloodGroup" TEXT,
    "address" TEXT,
    "admissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sectionId" TEXT,
    "rollNumber" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardians" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" "GuardianRelation" NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "occupation" TEXT,

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admissions" (
    "id" TEXT NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "appliedClassId" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "guardianPhone" TEXT NOT NULL,
    "guardianEmail" TEXT,
    "address" TEXT,
    "status" "AdmissionStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedDate" TIMESTAMP(3),

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_attendance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "remarks" TEXT,
    "markedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_attendance" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),

    CONSTRAINT "staff_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "applicantType" "LeaveApplicantType" NOT NULL,
    "fromDate" DATE NOT NULL,
    "toDate" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "fee_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" TEXT NOT NULL,
    "schoolClassId" TEXT NOT NULL,
    "feeCategoryId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "frequency" "FeeFrequency" NOT NULL,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "feeCategoryId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "exam_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examTypeId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "schoolClassId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_subjects" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "examDate" DATE NOT NULL,
    "maxMarks" INTEGER NOT NULL DEFAULT 100,
    "passMarks" INTEGER NOT NULL DEFAULT 35,

    CONSTRAINT "exam_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marks_entries" (
    "id" TEXT NOT NULL,
    "examSubjectId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "marksObtained" DECIMAL(5,2) NOT NULL,
    "grade" TEXT,
    "remarks" TEXT,
    "enteredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marks_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_scales" (
    "id" TEXT NOT NULL,
    "minPercent" DECIMAL(5,2) NOT NULL,
    "maxPercent" DECIMAL(5,2) NOT NULL,
    "grade" TEXT NOT NULL,
    "remark" TEXT,

    CONSTRAINT "grade_scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_slots" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT,

    CONSTRAINT "timetable_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homeworks" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homeworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_submissions" (
    "id" TEXT NOT NULL,
    "homeworkId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "fileUrl" TEXT,
    "status" "HomeworkStatus" NOT NULL DEFAULT 'ASSIGNED',
    "grade" TEXT,
    "remarks" TEXT,

    CONSTRAINT "homework_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "dateOfJoining" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "basicSalary" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "basic" DECIMAL(10,2) NOT NULL,
    "allowances" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netPay" DECIMAL(10,2) NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "audience" "NoticeAudience" NOT NULL DEFAULT 'ALL',
    "publishedById" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "category" TEXT,
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_issues" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "fineAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "BookIssueStatus" NOT NULL DEFAULT 'ISSUED',

    CONSTRAINT "book_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "pickupTime" TEXT NOT NULL,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_transport" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "stopId" TEXT NOT NULL,
    "feeAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "student_transport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_name_key" ON "academic_years"("name");

-- CreateIndex
CREATE UNIQUE INDEX "school_classes_name_key" ON "school_classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sections_schoolClassId_name_key" ON "sections"("schoolClassId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "class_subjects_sectionId_subjectId_key" ON "class_subjects"("sectionId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "students_admissionNo_key" ON "students"("admissionNo");

-- CreateIndex
CREATE UNIQUE INDEX "admissions_applicationNo_key" ON "admissions"("applicationNo");

-- CreateIndex
CREATE UNIQUE INDEX "student_attendance_studentId_date_key" ON "student_attendance"("studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "staff_attendance_staffId_date_key" ON "staff_attendance"("staffId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "fee_categories_name_key" ON "fee_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "fee_structures_schoolClassId_feeCategoryId_key" ON "fee_structures"("schoolClassId", "feeCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNo_key" ON "invoices"("invoiceNo");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receiptNo_key" ON "payments"("receiptNo");

-- CreateIndex
CREATE UNIQUE INDEX "exam_types_name_key" ON "exam_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "exam_subjects_examId_subjectId_key" ON "exam_subjects"("examId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "marks_entries_examSubjectId_studentId_key" ON "marks_entries"("examSubjectId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "homework_submissions_homeworkId_studentId_key" ON "homework_submissions"("homeworkId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_userId_key" ON "staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_employeeId_key" ON "staff"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_staffId_month_year_key" ON "payrolls"("staffId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicleNo_key" ON "vehicles"("vehicleNo");

-- CreateIndex
CREATE UNIQUE INDEX "routes_name_key" ON "routes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "student_transport_studentId_key" ON "student_transport"("studentId");

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_schoolClassId_fkey" FOREIGN KEY ("schoolClassId") REFERENCES "school_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_attendance" ADD CONSTRAINT "student_attendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_attendance" ADD CONSTRAINT "staff_attendance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_schoolClassId_fkey" FOREIGN KEY ("schoolClassId") REFERENCES "school_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_feeCategoryId_fkey" FOREIGN KEY ("feeCategoryId") REFERENCES "fee_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_feeCategoryId_fkey" FOREIGN KEY ("feeCategoryId") REFERENCES "fee_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "exam_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_schoolClassId_fkey" FOREIGN KEY ("schoolClassId") REFERENCES "school_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_subjects" ADD CONSTRAINT "exam_subjects_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_subjects" ADD CONSTRAINT "exam_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks_entries" ADD CONSTRAINT "marks_entries_examSubjectId_fkey" FOREIGN KEY ("examSubjectId") REFERENCES "exam_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks_entries" ADD CONSTRAINT "marks_entries_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks_entries" ADD CONSTRAINT "marks_entries_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homeworks" ADD CONSTRAINT "homeworks_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homeworks" ADD CONSTRAINT "homeworks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homeworks" ADD CONSTRAINT "homeworks_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "homeworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_issues" ADD CONSTRAINT "book_issues_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_issues" ADD CONSTRAINT "book_issues_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transport" ADD CONSTRAINT "student_transport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transport" ADD CONSTRAINT "student_transport_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transport" ADD CONSTRAINT "student_transport_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "route_stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

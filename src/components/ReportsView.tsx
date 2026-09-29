import React, { useState } from "react";
import {
  Classroom,
  Student,
  READING_LEVELS,
  MATH_LEVELS,
  ReadingLevel,
  MathLevel,
} from "../types";
import {
  Printer,
  Download,
  Share2,
  FileText,
  TrendingUp,
  User,
  Users,
  CheckCircle,
  Copy,
  Calendar,
  Sparkles,
} from "lucide-react";

interface ReportsViewProps {
  classroom: Classroom;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ classroom }) => {
  const [reportType, setReportType] = useState<"class" | "group" | "student">("class");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    classroom.students[0]?.id || ""
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    classroom.groups[0]?.id || ""
  );
  const [copiedText, setCopiedText] = useState(false);

  const selectedStudent =
    classroom.students.find((s) => s.id === selectedStudentId) ||
    classroom.students[0];

  const selectedGroup =
    classroom.groups.find((g) => g.id === selectedGroupId) ||
    classroom.groups[0];

  // Compute Class level distributions for Baseline vs Current
  const readingLevelsList: ReadingLevel[] = [
    "none",
    "letter",
    "word",
    "sentence",
    "paragraph",
    "story",
  ];
  const mathLevelsList: MathLevel[] = [
    "none",
    "single-digit",
    "two-digit-no-carry",
    "two-digit-with-carry",
    "multiplication-division",
  ];

  const readingDistributionCurrent = readingLevelsList.map((lvl) => {
    const count = classroom.students.filter(
      (s) => s.currentReadingLevel === lvl
    ).length;
    return { level: lvl, count };
  });

  const readingDistributionBaseline = readingLevelsList.map((lvl) => {
    const count = classroom.students.filter(
      (s) => s.baselineReadingLevel === lvl
    ).length;
    return { level: lvl, count };
  });

  const mathDistributionCurrent = mathLevelsList.map((lvl) => {
    const count = classroom.students.filter(
      (s) => s.currentMathLevel === lvl
    ).length;
    return { level: lvl, count };
  });

  const mathDistributionBaseline = mathLevelsList.map((lvl) => {
    const count = classroom.students.filter(
      (s) => s.baselineMathLevel === lvl
    ).length;
    return { level: lvl, count };
  });

  // Calculate total students who progressed at least one level
  const studentsAdvancedReading = classroom.students.filter((s) => {
    const baseRank = READING_LEVELS[s.baselineReadingLevel]?.numericRank || 0;
    const currRank = READING_LEVELS[s.currentReadingLevel]?.numericRank || 0;
    return currRank > baseRank;
  }).length;

  const studentsAdvancedMath = classroom.students.filter((s) => {
    const baseRank = MATH_LEVELS[s.baselineMathLevel]?.numericRank || 0;
    const currRank = MATH_LEVELS[s.currentMathLevel]?.numericRank || 0;
    return currRank > baseRank;
  }).length;

  // Generate shareable WhatsApp/SMS text summary
  const generateShareText = () => {
    if (reportType === "class") {
      const storyCount = classroom.students.filter(
        (s) => s.currentReadingLevel === "story"
      ).length;
      const nonReaderCount = classroom.students.filter(
        (s) => s.currentReadingLevel === "none"
      ).length;
      return `📊 LevelMatch FLN Progress Report: ${classroom.name} (${classroom.schoolName})\nTotal Students: ${classroom.students.length}\n• Reading: ${studentsAdvancedReading} moved up level. (Story fluent: ${storyCount}, Non-readers: ${nonReaderCount})\n• Math: ${studentsAdvancedMath} moved up level.\nTeaching at the Right Level in progress!`;
    } else if (reportType === "student" && selectedStudent) {
      return `📋 Student Progress Card: ${selectedStudent.name} (Roll #${selectedStudent.rollNumber}, ${classroom.name})\n• Reading Level: ${READING_LEVELS[selectedStudent.currentReadingLevel]?.name} (Baseline: ${READING_LEVELS[selectedStudent.baselineReadingLevel]?.name})\n• Math Level: ${MATH_LEVELS[selectedStudent.currentMathLevel]?.name} (Baseline: ${MATH_LEVELS[selectedStudent.baselineMathLevel]?.name})\nSchool: ${classroom.schoolName}`;
    } else if (reportType === "group" && selectedGroup) {
      return `👥 Group Report: ${selectedGroup.name} (${classroom.name})\nEnrolled: ${selectedGroup.studentIds.length} students\nFocus: ${selectedGroup.subject.toUpperCase()} level ${selectedGroup.level}\nCurriculum active on chalkboard daily.`;
    }
    return "";
  };

  const handleCopyText = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar (hidden during print) */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Official FLN Reporting
              </span>
              <span className="text-xs text-stone-500">
                School: <strong>{classroom.schoolName}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Class & Student Progress Reports
            </h2>
            <p className="text-xs text-stone-600 max-w-2xl">
              Generate formatted printable reports for headteachers, administrative reviews, or parent consultations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl border border-stone-200 transition-colors cursor-pointer"
              title="Copy text summary for WhatsApp or SMS updates"
            >
              {copiedText ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-600" />
                  <span>Copy for WhatsApp</span>
                </>
              )}
            </button>

            <button
              id="btn-print-report"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-200" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Scope Selector: Class vs Group vs Student */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setReportType("class")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                reportType === "class"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>Class Level Report</span>
            </button>

            <button
              onClick={() => setReportType("group")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                reportType === "group"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>Group Report</span>
            </button>

            <button
              onClick={() => setReportType("student")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                reportType === "student"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <User className="w-3.5 h-3.5 text-purple-700" />
              <span>Individual Student Card</span>
            </button>
          </div>

          {/* Conditional Selectors */}
          {reportType === "student" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">Select Student:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {classroom.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.rollNumber} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === "group" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">Select Group:</span>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {classroom.groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.subject} - {g.studentIds.length} stds)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div
        id="printable-report-card"
        className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0"
      >
        {/* Document Formal Header */}
        <div className="border-b-2 border-stone-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">
              Foundational Literacy & Numeracy Progress Report
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-1">
              {classroom.schoolName}
            </h1>
            <p className="text-xs text-stone-600">
              Class: <strong>{classroom.name}</strong> | Academic Year: <strong>{classroom.academicYear}</strong> | Teacher: <strong>{classroom.teacherName}</strong>
            </p>
          </div>

          <div className="text-right text-xs text-stone-500 font-mono">
            <div>Report Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</div>
            <div className="text-[11px] font-bold text-stone-700">Methodology: TaRL / Pratham FLN</div>
          </div>
        </div>

        {/* 1. CLASS REPORT VIEW */}
        {reportType === "class" && (
          <div className="space-y-6">
            {/* Impact Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Reading Improvements
                </span>
                <div className="text-2xl font-black text-emerald-950 mt-1">
                  {studentsAdvancedReading} / {classroom.students.length}
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Children advanced at least one foundational reading level
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Math Improvements
                </span>
                <div className="text-2xl font-black text-blue-950 mt-1">
                  {studentsAdvancedMath} / {classroom.students.length}
                </div>
                <p className="text-xs text-blue-800 mt-0.5">
                  Children advanced at least one foundational math level
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                  Current Story Fluent
                </span>
                <div className="text-2xl font-black text-purple-950 mt-1">
                  {classroom.students.filter((s) => s.currentReadingLevel === "story").length}
                </div>
                <p className="text-xs text-purple-800 mt-0.5">
                  Reading Grade 2+ passages at 60+ wpm
                </p>
              </div>
            </div>

            {/* Reading Level Baseline vs Current Comparison */}
            <div className="space-y-3">
              <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
                Reading Level Shift: Baseline vs. Current
              </h3>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Learning Level</th>
                      <th className="py-2.5 px-3 text-center">Baseline Count</th>
                      <th className="py-2.5 px-3 text-center">Current Count</th>
                      <th className="py-2.5 px-3 text-right">Net Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {readingLevelsList.map((lvl) => {
                      const base =
                        readingDistributionBaseline.find((b) => b.level === lvl)
                          ?.count || 0;
                      const curr =
                        readingDistributionCurrent.find((c) => c.level === lvl)
                          ?.count || 0;
                      const diff = curr - base;
                      const info = READING_LEVELS[lvl];

                      return (
                        <tr key={lvl} className="hover:bg-stone-50/50">
                          <td className="py-2 px-3 font-semibold text-stone-800 flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${info.colorClass.split(" ")[0]}`}
                            />
                            <span>{info.name}</span>
                          </td>
                          <td className="py-2 px-3 text-center text-stone-600 font-mono">
                            {base} ({Math.round((base / classroom.students.length) * 100)}%)
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-stone-900 font-mono">
                            {curr} ({Math.round((curr / classroom.students.length) * 100)}%)
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            {diff > 0 ? (
                              <span className="text-emerald-600">+{diff} ▲</span>
                            ) : diff < 0 ? (
                              <span className="text-stone-400">{diff} ▼</span>
                            ) : (
                              <span className="text-stone-400">0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Math Level Baseline vs Current Comparison */}
            <div className="space-y-3">
              <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
                Math Level Shift: Baseline vs. Current
              </h3>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Math Skill Tier</th>
                      <th className="py-2.5 px-3 text-center">Baseline Count</th>
                      <th className="py-2.5 px-3 text-center">Current Count</th>
                      <th className="py-2.5 px-3 text-right">Net Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {mathLevelsList.map((lvl) => {
                      const base =
                        mathDistributionBaseline.find((b) => b.level === lvl)
                          ?.count || 0;
                      const curr =
                        mathDistributionCurrent.find((c) => c.level === lvl)
                          ?.count || 0;
                      const diff = curr - base;
                      const info = MATH_LEVELS[lvl];

                      return (
                        <tr key={lvl} className="hover:bg-stone-50/50">
                          <td className="py-2 px-3 font-semibold text-stone-800 flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${info.colorClass.split(" ")[0]}`}
                            />
                            <span>{info.name}</span>
                          </td>
                          <td className="py-2 px-3 text-center text-stone-600 font-mono">
                            {base} ({Math.round((base / classroom.students.length) * 100)}%)
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-stone-900 font-mono">
                            {curr} ({Math.round((curr / classroom.students.length) * 100)}%)
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            {diff > 0 ? (
                              <span className="text-emerald-600">+{diff} ▲</span>
                            ) : diff < 0 ? (
                              <span className="text-stone-400">{diff} ▼</span>
                            ) : (
                              <span className="text-stone-400">0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Complete Class Roster Table */}
            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
                Full Classroom Student Roster ({classroom.students.length} Children)
              </h3>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-2 px-2.5">Roll</th>
                      <th className="py-2 px-2.5">Student Name</th>
                      <th className="py-2 px-2.5">Reading (Base → Current)</th>
                      <th className="py-2 px-2.5">Math (Base → Current)</th>
                      <th className="py-2 px-2.5">Last Checked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {classroom.students.map((st) => (
                      <tr key={st.id} className="hover:bg-stone-50">
                        <td className="py-1.5 px-2.5 font-mono text-stone-500">
                          #{st.rollNumber}
                        </td>
                        <td className="py-1.5 px-2.5 font-semibold text-stone-900">
                          {st.name}
                        </td>
                        <td className="py-1.5 px-2.5">
                          <span className="text-stone-500">
                            {READING_LEVELS[st.baselineReadingLevel]?.name.split(" ")[0]}
                          </span>{" "}
                          →{" "}
                          <strong className="text-emerald-800">
                            {READING_LEVELS[st.currentReadingLevel]?.name.split(" ")[0]}
                          </strong>
                        </td>
                        <td className="py-1.5 px-2.5">
                          <span className="text-stone-500">
                            {MATH_LEVELS[st.baselineMathLevel]?.name.split(" ")[0]}
                          </span>{" "}
                          →{" "}
                          <strong className="text-blue-800">
                            {MATH_LEVELS[st.currentMathLevel]?.name.split(" ")[0]}
                          </strong>
                        </td>
                        <td className="py-1.5 px-2.5 text-stone-500 font-mono text-[11px]">
                          {st.lastAssessedDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. GROUP REPORT VIEW */}
        {reportType === "group" && selectedGroup && (
          <div className="space-y-6">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Group Profile ({selectedGroup.subject.toUpperCase()})
                </span>
                <h2 className="text-xl font-bold text-stone-900">
                  {selectedGroup.name}
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Target Level: <strong>{selectedGroup.level}</strong> | Enrolled: <strong>{selectedGroup.studentIds.length} students</strong>
                </p>
              </div>

              <div className="text-xs font-semibold bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700">
                Peer Mentors Assigned: {selectedGroup.peerMentors?.length || 0}
              </div>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Roll #</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Baseline Level</th>
                    <th className="py-2.5 px-3">Current Level</th>
                    <th className="py-2.5 px-3">Progress Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {selectedGroup.studentIds.map((sid) => {
                    const student = classroom.students.find((s) => s.id === sid);
                    if (!student) return null;
                    const isReading = selectedGroup.subject === "reading";
                    const curr = isReading
                      ? student.currentReadingLevel
                      : student.currentMathLevel;
                    const base = isReading
                      ? student.baselineReadingLevel
                      : student.baselineMathLevel;
                    const moved = curr !== base;

                    return (
                      <tr key={sid} className="hover:bg-stone-50">
                        <td className="py-2 px-3 font-mono text-stone-500">
                          #{student.rollNumber}
                        </td>
                        <td className="py-2 px-3 font-bold text-stone-900">
                          {student.name}
                        </td>
                        <td className="py-2 px-3 text-stone-600">{base}</td>
                        <td className="py-2 px-3 font-bold text-emerald-800">
                          {curr}
                        </td>
                        <td className="py-2 px-3">
                          {moved ? (
                            <span className="text-emerald-700 font-semibold">
                              ✓ Improved since baseline
                            </span>
                          ) : (
                            <span className="text-stone-400">Practicing at level</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. INDIVIDUAL STUDENT REPORT CARD VIEW */}
        {reportType === "student" && selectedStudent && (
          <div className="space-y-6">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-800 text-white font-black text-lg flex items-center justify-center">
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {selectedStudent.name}
                  </h2>
                  <p className="text-xs text-stone-600">
                    Roll #{selectedStudent.rollNumber} | Gender: {selectedStudent.gender} | Class: {classroom.name}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-stone-500">
                <span>Last Evaluated: </span>
                <strong className="text-stone-800">{selectedStudent.lastAssessedDate}</strong>
              </div>
            </div>

            {/* Current Level Mastery Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Reading Mastery Tier
                </span>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-emerald-950">
                    {READING_LEVELS[selectedStudent.currentReadingLevel]?.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-200 font-bold text-emerald-900">
                    {READING_LEVELS[selectedStudent.currentReadingLevel]?.code}
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  {READING_LEVELS[selectedStudent.currentReadingLevel]?.shortDesc}
                </p>
                <div className="text-[11px] text-stone-500 pt-2 border-t border-emerald-200">
                  Baseline Check: <strong>{READING_LEVELS[selectedStudent.baselineReadingLevel]?.name}</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Math Mastery Tier
                </span>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-blue-950">
                    {MATH_LEVELS[selectedStudent.currentMathLevel]?.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-200 font-bold text-blue-900">
                    {MATH_LEVELS[selectedStudent.currentMathLevel]?.code}
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  {MATH_LEVELS[selectedStudent.currentMathLevel]?.shortDesc}
                </p>
                <div className="text-[11px] text-stone-500 pt-2 border-t border-blue-200">
                  Baseline Check: <strong>{MATH_LEVELS[selectedStudent.baselineMathLevel]?.name}</strong>
                </div>
              </div>
            </div>

            {/* Assessment History Timeline */}
            <div className="space-y-3">
              <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-stone-600" />
                <span>Diagnostic Assessment Timeline</span>
              </h3>

              <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
                {selectedStudent.history.map((h, i) => (
                  <div key={i} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-stone-500 mr-2">{h.date}</span>
                      <span className="font-bold text-stone-800">
                        Reading: {READING_LEVELS[h.readingLevel]?.name.split(" ")[0]} | Math: {MATH_LEVELS[h.mathLevel]?.name.split(" ")[0]}
                      </span>
                      {h.notes && (
                        <p className="text-[11px] text-stone-500 italic mt-0.5">{h.notes}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 rounded text-stone-600 self-start sm:self-center">
                      Verified Check #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Remarks Signature Area */}
            <div className="pt-8 border-t border-dashed border-stone-300 flex justify-between items-end text-xs text-stone-600">
              <div>
                <p className="font-semibold">Teacher Remarks:</p>
                <p className="italic text-stone-500 mt-1">
                  Active in daily blackboard sound chants and slate peer practice.
                </p>
              </div>

              <div className="text-right">
                <div className="w-40 border-b border-stone-400 mb-1" />
                <p className="font-bold text-stone-800">{classroom.teacherName}</p>
                <p className="text-[11px] text-stone-500">Primary Classroom Teacher</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { X, Plus, School, Users, Check } from "lucide-react";
import { Classroom, Student, ReadingLevel, MathLevel } from "../types";

interface NewClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClass: (newClass: Classroom) => void;
}

export const NewClassModal: React.FC<NewClassModalProps> = ({
  isOpen,
  onClose,
  onCreateClass,
}) => {
  const [className, setClassName] = useState("Grade 2 – Morning");
  const [grade, setGrade] = useState("Grade 2");
  const [section, setSection] = useState("A");
  const [schoolName, setSchoolName] = useState("Govt. Primary School, Rampur");
  const [teacherName, setTeacherName] = useState("Priya Sharma");
  const [studentInputMethod, setStudentInputMethod] = useState<"paste" | "count">("paste");
  const [studentNamesText, setStudentNamesText] = useState(
    "Amina Begum\nBikash Roy\nChirag Sharma\nDeepak Yadav\nEsha Verma\nFarida Khan\nGovind Das\nHeena Parveen\nImran Ansari\nJyoti Soren"
  );
  const [studentCount, setStudentCount] = useState(15);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    let names: string[] = [];
    if (studentInputMethod === "paste") {
      names = studentNamesText
        .split("\n")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
    } else {
      names = Array.from({ length: studentCount }, (_, i) => `Student ${i + 1}`);
    }

    if (names.length === 0) {
      names = ["Student 1", "Student 2", "Student 3"];
    }

    const readingPool: ReadingLevel[] = ["none", "letter", "word", "sentence", "paragraph", "story"];
    const mathPool: MathLevel[] = ["none", "single-digit", "two-digit-no-carry", "two-digit-with-carry", "multiplication-division"];

    const students: Student[] = names.map((name, idx) => {
      // Seed initial plausible distribution
      const rLevel = readingPool[Math.min(readingPool.length - 1, Math.floor(Math.random() * 4))];
      const mLevel = mathPool[Math.min(mathPool.length - 1, Math.floor(Math.random() * 3))];
      return {
        id: `std-${Date.now()}-${idx}`,
        name,
        rollNumber: String(idx + 1).padStart(2, "0"),
        gender: idx % 2 === 0 ? "female" : "male",
        currentReadingLevel: rLevel,
        currentMathLevel: mLevel,
        baselineReadingLevel: rLevel,
        baselineMathLevel: mLevel,
        lastAssessedDate: new Date().toISOString().split("T")[0],
        history: [
          {
            date: new Date().toISOString().split("T")[0],
            readingLevel: rLevel,
            mathLevel: mLevel,
            notes: "Initial baseline assessment",
          },
        ],
      };
    });

    const newClassroom: Classroom = {
      id: `class-${Date.now()}`,
      name: className,
      grade,
      section,
      schoolName,
      teacherName,
      academicYear: "2026–2027",
      students,
      diagnostics: [
        {
          id: `diag-init-${Date.now()}`,
          classId: `class-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          title: "Initial Class Baseline Diagnostic",
          subject: "both",
          summaryNote: "First baseline check administered upon class registration.",
          createdAt: new Date().toISOString(),
          entries: students.map((s) => ({
            studentId: s.id,
            readingLevel: s.currentReadingLevel,
            mathLevel: s.currentMathLevel,
          })),
        },
      ],
      groups: [],
      activityPlans: [],
    };

    onCreateClass(newClassroom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">Create New Classroom</h3>
              <p className="text-xs text-stone-500">Add a grade section and paste student names</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Classroom Name *
            </label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Grade 3 – Section B"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Grade</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. Grade 2"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Section</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. Morning or B"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Teacher</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Student Roster Entry</span>
              </label>
              <div className="flex text-xs bg-stone-100 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setStudentInputMethod("paste")}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                    studentInputMethod === "paste" ? "bg-white shadow-xs text-stone-900" : "text-stone-500"
                  }`}
                >
                  Paste Names (1 per line)
                </button>
                <button
                  type="button"
                  onClick={() => setStudentInputMethod("count")}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                    studentInputMethod === "count" ? "bg-white shadow-xs text-stone-900" : "text-stone-500"
                  }`}
                >
                  Quick Number Count
                </button>
              </div>
            </div>

            {studentInputMethod === "paste" ? (
              <div>
                <textarea
                  rows={6}
                  value={studentNamesText}
                  onChange={(e) => setStudentNamesText(e.target.value)}
                  placeholder="Paste student names here, one per line..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Tip: Copy-paste names directly from attendance registers or Excel sheets.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-stone-600 mb-1">
                  How many student placeholders to create?
                </label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={studentCount}
                  onChange={(e) => setStudentCount(parseInt(e.target.value) || 1)}
                  className="w-32 px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-semibold"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Creates Student 1, Student 2, ... which you can rename later.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2 -mx-5 -mb-5 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Class & Roster</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

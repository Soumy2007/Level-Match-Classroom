import React, { useState } from "react";
import { X, BookOpen, Calculator, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";
import { READING_LEVELS, MATH_LEVELS } from "../types";

interface AssessmentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDiagnostic: () => void;
}

export const AssessmentGuideModal: React.FC<AssessmentGuideModalProps> = ({
  isOpen,
  onClose,
  onStartDiagnostic,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"reading" | "math">("reading");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900">
                5-Minute Paper Diagnostic Tool Guide
              </h3>
              <p className="text-xs text-stone-600">
                Based on Teaching at the Right Level (TaRL / ASER) foundational check protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch inside modal: Reading vs Math */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveSubTab("reading")}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === "reading"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Reading Assessment Flow</span>
          </button>
          <button
            onClick={() => setActiveSubTab("math")}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeSubTab === "math"
                ? "border-blue-700 text-blue-800"
                : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Math Assessment Flow</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-5 text-stone-800 text-sm">
          {activeSubTab === "reading" ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950">
                <span className="font-bold">Protocol (Start at Paragraph Level):</span> Ask child to read the 4-line paragraph first.
                If they read with 2 or fewer errors, move up to Story. If they struggle, move down to Words, then Letters.
              </div>

              {/* Sample Card Visual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Story Sample */}
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span className="text-emerald-700 uppercase tracking-wide">Story Level Sample</span>
                    <span>7–10 lines</span>
                  </div>
                  <p className="font-serif text-sm leading-relaxed text-stone-800 bg-white p-3 rounded-lg border border-stone-200">
                    &ldquo;Rani loved rainy mornings. One day she saw a small green parrot shivering under the roof.
                    She brought a dry cloth and wrapped the bird gently. Her brother gave it two sweet grains of rice.
                    Soon the sun broke through the clouds, and the little parrot flew cheerfully into the guava tree.&rdquo;
                  </p>
                  <p className="text-xs text-stone-500">
                    <strong>Rule:</strong> Reads fluently with proper punctuation stops; can answer 2 simple recall questions.
                  </p>
                </div>

                {/* Paragraph Sample */}
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span className="text-teal-700 uppercase tracking-wide">Paragraph Level Sample</span>
                    <span>4 simple lines</span>
                  </div>
                  <p className="font-serif text-sm leading-relaxed text-stone-800 bg-white p-3 rounded-lg border border-stone-200">
                    &ldquo;Ali plays with his red ball.<br />
                    He goes to the village pond.<br />
                    Three white ducks swim in the water.<br />
                    Ali laughs and waves his hand.&rdquo;
                  </p>
                  <p className="text-xs text-stone-500">
                    <strong>Rule:</strong> Reads with 2 or fewer mistakes. If more than 2, test on Word list.
                  </p>
                </div>

                {/* Words & Letters Sample */}
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span className="text-amber-700 uppercase tracking-wide">Word Level Sample (10 Words)</span>
                    <span>Identify 4 of 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center font-mono font-bold text-stone-800 bg-white p-3 rounded-lg border border-stone-200 text-sm">
                    <span>cat</span>
                    <span>sun</span>
                    <span>big</span>
                    <span>pen</span>
                    <span>mat</span>
                    <span>dog</span>
                    <span>run</span>
                    <span>red</span>
                    <span>cup</span>
                    <span>man</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    <strong>Rule:</strong> Child chooses any 5 words. Must read at least 4 correctly to achieve Word Level.
                  </p>
                </div>

                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span className="text-rose-700 uppercase tracking-wide">Letter Level Sample (10 Letters)</span>
                    <span>Identify 4 of 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center font-mono text-base font-bold text-stone-800 bg-white p-3 rounded-lg border border-stone-200">
                    <span>M</span>
                    <span>a</span>
                    <span>T</span>
                    <span>s</span>
                    <span>B</span>
                    <span>k</span>
                    <span>P</span>
                    <span>r</span>
                    <span>D</span>
                    <span>l</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    <strong>Rule:</strong> If child cannot identify 4 letters, mark as <strong>Non-Reader</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950">
                <span className="font-bold">Protocol (Start at 2-Digit Subtraction):</span> Show the 2-digit subtraction problems.
                If correct, test on Division. If incorrect, test on 2-digit numbers, then 1-digit numbers, then physical counting.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2-Digit Subtraction with Borrowing */}
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span className="text-indigo-700 uppercase tracking-wide">2-Digit with Regrouping</span>
                    <span>2 Problems</span>
                  </div>
                  <div className="flex justify-around bg-white p-3 rounded-lg border border-stone-200 font-mono text-base">
                    <div>
                      &nbsp;&nbsp;6 3<br />
                      - 2 8<br />
                      -----<br />
                      &nbsp;&nbsp;(35)
                    </div>
                    <div>
                      &nbsp;&nbsp;7 1<br />
                      - 4 5<br />
                      -----<br />
                      &nbsp;&nbsp;(26)
                    </div>
                  </div>
                  <p className="text-xs text-stone-500">
                    <strong>Rule:</strong> Solves correctly with borrowing. If successful, test on 3-digit by 1-digit division.
                  </p>
                </div>

                {/* 2-Digit without Regrouping */}
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span className="text-blue-700 uppercase tracking-wide">2-Digit No Carry</span>
                    <span>10–99 Identification</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center font-mono font-bold text-stone-800 bg-white p-3 rounded-lg border border-stone-200 text-sm">
                    <span>24</span>
                    <span>57</span>
                    <span>31</span>
                    <span>89</span>
                    <span>40</span>
                    <span>65</span>
                    <span>18</span>
                    <span>72</span>
                    <span>93</span>
                    <span>36</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    <strong>Rule:</strong> Recognizes 2-digit numbers and can do 34 + 12 without carrying.
                  </p>
                </div>

                {/* 1-Digit Numbers */}
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span className="text-amber-700 uppercase tracking-wide">1-Digit (1–9 Numbers)</span>
                    <span>Identify 4 of 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center font-mono text-base font-bold text-stone-800 bg-white p-3 rounded-lg border border-stone-200">
                    <span>3</span>
                    <span>7</span>
                    <span>2</span>
                    <span>9</span>
                    <span>5</span>
                    <span>1</span>
                    <span>8</span>
                    <span>4</span>
                    <span>6</span>
                    <span>0</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    <strong>Rule:</strong> Identifies digits 1–9. If unable, mark as <strong>Beginner</strong>.
                  </p>
                </div>

                {/* Multiplication & Division */}
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span className="text-emerald-700 uppercase tracking-wide">Multiplication & Division</span>
                    <span>Word & Algorithm</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-stone-200 font-mono text-sm space-y-1">
                    <div>48 &times; 6 = ?</div>
                    <div>3 ) 195 ( = ?</div>
                  </div>
                  <p className="text-xs text-stone-500">
                    <strong>Rule:</strong> Solves 3-digit by 1-digit division with or without remainder.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Keep paper sheets laminated or in plastic sleeve for reuse
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onStartDiagnostic();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Enter Diagnostic Scores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

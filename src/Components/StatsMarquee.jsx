import React from "react";

const StatsMarquee = ({ speed = 18 }) => {
  // base items to show (you gave first 4; I added more sensible items so the strip looks full)
const baseItems = [
  "🎥 10+ Videos Indexed",
  "❓ 100+ Questions Answered",
  "🎓 GATE CSE Focused",
  "⚡ Fast RAG Retrieval",
  "⏱️ Timestamp Links Included",
  "🧩 Topic Summaries",
  "🔍 Smart Search",
  "🤖 AI-Powered Answers",
  "📝 Generate Quizzes & Flashcards",
  "📚 24/7 Study Buddy",
];


  // duplicate so we can scroll seamlessly
  const items = [...baseItems, ...baseItems];

  return (
    <>
      <style>{`
        /* marquee animation (moves left by 50% because content is duplicated) */
        .marquee-inner {
          animation: marqueeScroll linear infinite;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="relative overflow-hidden w-full max-w-5xl mx-auto select-none mt-20">
        {/* left fade */}
        <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none"
             style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85), transparent)" }} />

        {/* marquee content */}
        <div
          className="marquee-inner flex items-center gap-8 whitespace-nowrap will-change-transform min-w-[200%]"
          style={{ animationDuration: `${speed}s` }}
          aria-hidden="false"
        >
          <div className="flex items-center gap-8 px-6">
            {items.map((text, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/3 text-white/90 text-[8px] md:text-base"
                style={{ backdropFilter: "blur(6px)" }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* right fade */}
        <div className="absolute right-0 top-0 h-full w-20 z-10 pointer-events-none"
             style={{ background: "linear-gradient(270deg, rgba(0,0,0,0.85), transparent)" }} />
      </div>
    </>
  );
};

export default StatsMarquee;

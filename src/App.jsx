import React, { useState } from "react";
import StatsMarquee from "./Components/StatsMarquee";
import MediaInputWithUpload from "./Components/MediaInputWithUpload";


function App() {

  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <>
      <section className='flex flex-col items-center bg-linear-to-b from-black to-[#3B006E] text-white px-4 pb-44'>
        <nav className="flex items-center justify-between py-3 md:px-16 lg:px-24 xl:px-32 md:py-4 w-full">
          <a href="https://prebuiltui.com">
            <svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60">
              <text x="0" y="40"
                font-family="Poppins, Arial, sans-serif"
                font-size="40"
                font-weight="500"
                fill="white">
                RagAssist
              </text>
            </svg>

          </a>
        </nav>


        <StatsMarquee />


        <h1 className="text-[42px]/13 md:text-6xl/19 font-semibold text-center max-w-[840px] mt-4 bg-linear-to-r from-white to-[#5D009F] text-transparent bg-clip-text">
          AI Powered Smart Teaching Assistant
        </h1>
        <p className="text-gray-200 text-sm max-md:px-2 text-center max-w-sm mt-3">
          Ask a question about the lecture videos and get answers with video references !
        </p>

        <MediaInputWithUpload />

        <div className='relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 md:px-0 mt-14'>
          <div className='bg-linear-to-b from-[#2A0150] to-[#090025] hover:-translate-y-1 transition duration-300 border border-violet-900 rounded-lg p-6 space-y-4'>
            <div className='flex items-start justify-between'>
              <img className='w-12 h-12' src='/images/question.png' alt="question" />
              <button className='bg-purple-950 text-xs text-slate-50 rounded-full px-4 py-2'>New</button>
            </div>
            <p className='text-lg text-gray-50'>Ask Anything</p>
            <p className='text-sm text-gray-200'>Get answers from your lecture videos with accurate references.</p>
          </div>
          <div className='bg-linear-to-b from-[#2A0150] to-[#090025] hover:-translate-y-1 transition duration-300 border border-violet-900 rounded-lg p-6 space-y-4'>
            <img className='w-12 h-12' src='/images/video.png' alt="video" />
            <p className='text-lg text-gray-50'>Video Timestamp Links</p>
            <p className='text-sm text-gray-200'>Every answer includes exact timestamps to help you revisit the lecture.</p>
          </div>
          <div className='bg-linear-to-b from-[#2A0150] to-[#090025] hover:-translate-y-1 transition duration-300 border border-violet-900 rounded-lg p-6 space-y-4'>
            <img className='w-12 h-12' src='/images/search.png' alt="search" />
            <p className='text-lg text-gray-50'>Smart Search</p>
            <p className='text-sm text-gray-200'>Instantly find the exact moment a topic appears in the lecture.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;

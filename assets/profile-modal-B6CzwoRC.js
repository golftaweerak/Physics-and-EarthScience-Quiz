import{T as d,g as c,a as g}from"./gamification-Cy3UuTrW.js";import{ACHIEVEMENTS as u,BADGES as b}from"./gamification-registry-DzpjLHof.js";function M(e){const t=v(),r=x();setTimeout(()=>{r.classList.remove("scale-95","opacity-0"),r.classList.add("scale-100","opacity-100")},10);const a=m(e);r.innerHTML=`
        ${f(a)}
        <div class="flex-grow overflow-y-auto modern-scrollbar bg-gray-50 dark:bg-gray-900 relative z-10 flex flex-col">
            <div class="px-5 sm:px-8 pb-8 text-center flex-grow flex flex-col pt-6">
                ${h(a)}
                ${y(a)}
                <div class="space-y-3 animate-slide-up flex-grow" style="animation-delay: 0.3s;">
                    ${s("badges","🏅 เหรียญรางวัล",a.badges,k)}
                    ${s("achievements","🏆 ความสำเร็จ",a.achievements,w)}
                </div>
            </div>
        </div>
    `,t.appendChild(r),document.body.appendChild(t),$(r);const o=()=>{r.classList.replace("scale-100","scale-95"),r.classList.replace("opacity-100","opacity-0"),setTimeout(()=>t.remove(),200)};t.onclick=l=>l.target===t&&o(),r.querySelector("#close-profile-modal").onclick=o,L(r,a.badges)}function m(e){const t=e.level||1,r=d.overall,a=Math.min(Math.max(0,t-1),r.length-1),o=e.totalQuestionsAnswered||e.quizzesCompleted*20||0,l=o>0?Math.min(100,(e.totalCorrectAnswers||0)/o*100).toFixed(0):0;return{name:e.displayName||"ผู้เรียน",level:t,levelBorder:g(t),avatarFrame:c(e.avatar),avatarHtml:e.avatar?.includes("/")||e.avatar?.includes(".")?`<img src="${e.avatar}" class="w-full h-full rounded-full object-cover">`:`<span class="text-4xl sm:text-5xl">${e.avatar||"🧑‍🎓"}</span>`,rankTitle:r[a],selectedTitle:e.selectedTitle,xp:(e.xp||0).toLocaleString(),completed:(e.quizzesCompleted||0).toLocaleString(),accuracy:`${l}%`,badges:b.filter(i=>(e.badges||[]).includes(i.id)),achievements:u.filter(i=>(e.unlockedAchievements||[]).includes(i.id)),headerGradient:p(t)}}function p(e){return e>=30?"from-rose-500 via-red-500 to-red-600":e>=20?"from-fuchsia-500 via-purple-500 to-purple-600":e>=10?"from-amber-400 via-orange-400 to-orange-500":"from-cyan-500 via-cyan-600 to-blue-600"}function v(){const e=document.createElement("div");return e.className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in font-sarabun text-gray-800 dark:text-gray-100",e}function x(){const e=document.createElement("div");return e.className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden transform transition-all scale-95 opacity-0 flex flex-col max-h-[85vh] ring-1 ring-white/10",e}function f(e){return`
        <!-- Header Wrapper: Increased z-index to 20 to sit ABOVE the scrolling content (z-10) -->
        <div class="relative shrink-0 z-20 text-white shadow-xl">
             <!-- Background Container (Overflow Hidden) -->
             <div class="absolute inset-0 h-40 bg-gradient-to-br ${e.headerGradient} overflow-hidden rounded-t-[2rem]">
                <div class="absolute inset-0 bg-white/10 pattern-dots opacity-30"></div>
                <div class="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
                <div class="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
             </div>

             <!-- Content Container (Overflow Visible for Badge) -->
             <div class="relative h-40 flex flex-col items-center justify-center pt-4 z-10">
                <div class="relative z-20 transform translate-y-2 group">
                     <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 shadow-2xl ${e.levelBorder} bg-white/20 backdrop-blur-md ring-4 ring-white/30 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
                        <div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden ${e.avatarFrame} shadow-inner">
                            ${e.avatarHtml}
                        </div>
                    </div>
                    <!-- Level Badge: Positioned absolute related to avatar group, z-index high -->
                    <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs sm:text-sm font-bold px-4 py-0.5 rounded-full border-2 border-white/20 shadow-xl whitespace-nowrap z-50 ring-2 ring-black/10 flex items-center gap-1">
                        <span class="text-[10px] opacity-70 uppercase tracking-widest">LVL</span>
                        <span>${e.level}</span>
                    </div>
                </div>
            </div>
            
            <button id="close-profile-modal" class="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-all duration-300 backdrop-blur-md hover:scale-110 shadow-lg border border-white/10 z-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    `}function h(e){return`
        <div class="mb-6 animate-slide-up" style="animation-delay: 0.1s;">
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-kanit tracking-tight leading-tight px-1 py-1 drop-shadow-sm">
                ${e.name}
            </h2>
            <div class="flex items-center justify-center gap-2 mt-1 flex-wrap">
                <span class="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base tracking-wide">${e.rankTitle}</span>
                ${e.selectedTitle?`
                    <span class="text-gray-300 dark:text-gray-600">•</span>
                    <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-700/50 shadow-sm">
                        👑 ${e.selectedTitle}
                    </div>
                `:""}
            </div>
        </div>
    `}function y(e){return`
        <div class="grid grid-cols-3 gap-3 mb-6 animate-slide-up" style="animation-delay: 0.2s;">
            ${n("Total XP",e.xp,"blue","M13 10V3L4 14h7v7l9-11h-7z")}
            ${n("Quizzes",e.completed,"green","M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4")}
            ${n("Accuracy",e.accuracy,"purple","M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z")}
        </div>
    `}function n(e,t,r,a){const o={blue:"text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",green:"text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20",purple:"text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20"};return`
        <div class="flex flex-col items-center p-3 rounded-2xl border ${o[r]||o.blue} hover:scale-105 transition-transform duration-300 shadow-sm backdrop-blur-sm">
            <div class="w-8 h-8 rounded-full flex items-center justify-center mb-1.5 bg-white dark:bg-white/10 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="${a}" clip-rule="evenodd"/></svg>
            </div>
            <div class="text-lg font-black font-mono leading-none mb-1 tracking-tight">${t}</div>
            <div class="text-[9px] font-bold opacity-80 uppercase tracking-widest">${e}</div>
        </div>
    `}function s(e,t,r,a){const o=r.length,l=`<span class="ml-2 text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">${o}</span>`,i=o>0?a(r):'<div class="text-center py-6 text-gray-400 text-sm italic">ยังไม่มีรายการนี้</div>';return`
      <div class="accordion-item bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md" id="accordion-${e}">
          <button class="accordion-header w-full flex items-center justify-between p-4 py-3 text-left focus:outline-none group">
              <div class="font-bold text-gray-700 dark:text-gray-200 flex items-center text-sm sm:text-base">
                  ${t} ${l}
              </div>
              <div class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center transform transition-transform duration-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
          </button>
          <div class="accordion-content transition-all duration-300 ease-in-out overflow-hidden" style="max-height: 0px; opacity: 0;">
              <div class="p-4 pt-0 border-t border-gray-100 dark:border-gray-700/50">
                  ${i}
              </div>
          </div>
      </div>
  `}function k(e){return`
        <div class="grid grid-cols-5 sm:grid-cols-6 gap-4 pt-4 px-2 justify-items-center">
            ${e.map(t=>`
                <button class="badge-item flex flex-col items-center gap-2 group relative outline-none focus:scale-110 transition-transform duration-300" data-badge-id="${t.id}">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-3xl transition-all duration-300 transform group-hover:scale-125 group-hover:rotate-6 filter drop-shadow-sm group-hover:drop-shadow-lg relative">
                        <span class="relative z-10">${t.icon}</span>
                    </div>
                </button>
            `).join("")}
        </div>
    `}function w(e){return`
        <div class="grid grid-cols-1 gap-2 pt-2">
            ${e.map(t=>`
                <div class="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-900/50 transition-colors shadow-sm">
                    <div class="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0">
                        ${t.icon}
                    </div>
                    <div class="min-w-0 flex-grow text-left">
                        <div class="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 truncate">${t.title}</div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400 truncate">${t.desc}</div>
                    </div>
                    ${t.rewardTitle?'<div class="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 font-mono tracking-tighter border border-gray-200 dark:border-gray-600">TITLE</div>':""}
                </div>
            `).join("")}
        </div>
    `}function $(e){e.querySelectorAll(".accordion-header").forEach(t=>{t.onclick=()=>{const r=t.closest(".accordion-item"),a=r.querySelector(".accordion-content"),o=t.querySelector("div:last-child");a.style.maxHeight==="0px"||a.style.maxHeight===""?(a.style.maxHeight=a.scrollHeight+100+"px",a.style.opacity="1",o.classList.add("rotate-180"),r.classList.add("ring-2","ring-blue-100","dark:ring-blue-900/30")):(a.style.maxHeight="0px",a.style.opacity="0",o.classList.remove("rotate-180"),r.classList.remove("ring-2","ring-blue-100","dark:ring-blue-900/30"))}})}function L(e,t){e.querySelectorAll(".badge-item").forEach(r=>{r.onclick=a=>{a.stopPropagation();const o=r.dataset.badgeId,l=t.find(i=>i.id===o);l&&C(l)}})}function C(e){const t=document.createElement("div");t.className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm";const r=document.createElement("div");r.className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl transform scale-95 opacity-0 transition-all duration-300 relative border border-gray-100 dark:border-gray-800 text-center",r.innerHTML=`
      <button id="close-badge-modal" class="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-full transition-all z-50">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>

      <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-${e.color||"blue"}-500/5 to-transparent rounded-t-[2rem] pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col items-center pt-2">
          <!-- Icon Container -->
          <div class="w-24 h-24 rounded-3xl bg-white dark:bg-gray-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-none flex items-center justify-center text-6xl mb-6 ring-1 ring-gray-100 dark:ring-gray-700 animate-float">
              ${e.icon}
          </div>
          
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-kanit tracking-tight">
              ${e.name}
          </h3>
          
          <div class="h-1 w-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"></div>

          <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">
              ${e.desc}
          </p>
      </div>
  `,t.appendChild(r),document.body.appendChild(t),requestAnimationFrame(()=>{r.classList.remove("scale-95","opacity-0"),r.classList.add("scale-100","opacity-100")});const a=()=>{r.classList.remove("scale-100","opacity-100"),r.classList.add("scale-95","opacity-0"),setTimeout(()=>t.remove(),200)};t.onclick=o=>o.target===t&&a(),r.querySelector("#close-badge-modal").onclick=a}export{M as o};

const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/data-manager-GBz3Ac12.js","assets/preload-helper-DP0d4xQl.js","assets/firebase-config-D2ElzwY6.js"])))=>i.map(i=>d[i]);
import{_ as $e}from"./preload-helper-DP0d4xQl.js";import{Gamification as qe,XP_THRESHOLDS as pe,getAvatarFrameClass as ce,getLevelBorderClass as Ce,SHOP_ITEMS as T,ACHIEVEMENTS as ue,PROFICIENCY_GROUPS as A,SKILL_TREE_PERKS as Fe,BADGES as Ee,TRACK_TITLES as Qe,THEME_DEFINITIONS as Oe,WEEKLY_BOSSES as Re}from"./gamification-DOhD7JaP.js";import{o as Xe}from"./profile-modal-B6nmzgqH.js";import{c as _,e as Le,h as Q,i as Ue}from"./data-manager-GBz3Ac12.js";import{r as fe}from"./daily-quests-renderer-BqFrjb0P.js";import{M}from"./modal-handler-CjwIEypi.js";import{e as C,s as $}from"./utils-DIzHyVl3.js";import{c as We,a as Ke,q as be,o as Ge,l as Ye,v as Je,x as Ve,y as Ze}from"./firebase-config-D2ElzwY6.js";import{S as te}from"./site-config-I-RQ9TTj.js";import{s as I}from"./sub-category-data-Bkbt3HM0.js";import{a as Se}from"./custom-quiz-handler-DchUfBx_.js";function D(){const t=document.documentElement.classList.contains("dark");return{gridColor:t?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)",textColor:t?"#e5e7eb":"#374151"}}function et(t,r=.7){return`rgba(${{"border-gray-500":"107, 114, 128","border-indigo-500":"99, 102, 241","border-teal-500":"20, 184, 166","border-orange-500":"249, 115, 22","border-rose-400":"251, 113, 133","border-red-500":"239, 68, 68","border-amber-500":"245, 158, 11","border-green-400":"74, 222, 128","border-purple-500":"168, 85, 247","border-indigo-600":"79, 70, 229","border-teal-600":"13, 148, 136","border-purple-600":"147, 51, 234","border-purple-400":"192, 132, 252","border-purple-700":"126, 34, 206","border-pink-500":"236, 72, 153","border-yellow-500":"234, 179, 8"}[t]||"107, 114, 128"}, ${r})`}function tt(t){return{"border-gray-500":"#6b7280","border-indigo-500":"#6366f1","border-teal-500":"#14b8a6","border-orange-500":"#f97316","border-rose-400":"#fb7185","border-green-400":"#4ade80","border-purple-500":"#a855f7","border-red-500":"#ef4444","border-amber-500":"#f59e0b","border-indigo-600":"#4f46e5","border-teal-600":"#0d9488","border-purple-600":"#9333ea","border-purple-400":"#c084fc","border-purple-700":"#7e22ce","border-pink-500":"#ec4899","border-yellow-500":"#eab308"}[t]||"#6b7280"}async function Be(t=[]){const{getQuizzesList:r}=await $e(async()=>{const{getQuizzesList:o}=await import("./data-manager-GBz3Ac12.js").then(s=>s.o);return{getQuizzesList:o}},__vite__mapDeps([0,1,2])),a=[...await r(),...t],n=[];for(const o of a){const s=o.storageKey||`quizState-${o.id||o.customId}`,l=localStorage.getItem(s);if(l)try{const i=JSON.parse(l);if(!i||typeof i!="object"||!Array.isArray(i.userAnswers)){console.warn(`Skipping invalid or incomplete stats for ${o.storageKey}`);continue}const d=i.shuffledQuestions?.length||0,g=i.userAnswers||[],b=g.filter(u=>u!==null).length,c=d>0&&b>=d,p=g.filter(u=>u&&u.isCorrect).length;let f=o.url;!f&&o.customId&&(f=`./quiz/index.html?id=${o.customId}`),n.push({...o,...i,score:p,storageKey:s,url:f,isFinished:c})}catch(i){console.error(`Failed to process stats for ${o.storageKey}.Data might be corrupted.`,i)}}return n}function Ie(t,r="all"){let e=null;if(r!=="all"){const s=parseInt(r);e=new Date,e.setDate(e.getDate()-s)}const a=t.filter(s=>s.isFinished&&s.lastAttemptTimestamp).map(s=>{const l=s.shuffledQuestions?.length||0,i=s.score||0,d=l>0?i/l*100:0;return{date:new Date(s.lastAttemptTimestamp),score:d}}).filter(s=>!e||s.date>=e).sort((s,l)=>s.date-l.date),n=a.map(s=>s.date.toLocaleDateString("th-TH",{day:"numeric",month:"short"})),o=a.map(s=>s.score);return{labels:n,data:o}}function rt(t){const r={};t.forEach(o=>{!o.userAnswers||!o.shuffledQuestions||o.userAnswers.forEach((s,l)=>{if(!s)return;const i=o.shuffledQuestions[l];if(!i||!i.subCategory||!i.subCategory.specific)return;(Array.isArray(i.subCategory.specific)?i.subCategory.specific:[i.subCategory.specific]).forEach(g=>{const b=g.replace(/^ว\s[\d\.]+\sม\.[\d\/]+\s/,"").replace(/^\d+\.\s/,"").trim();r[b]||(r[b]={correct:0,total:0}),r[b].total++,s.isCorrect&&r[b].correct++})})});const e=Object.entries(r).map(([o,s])=>({name:o,...s,score:s.total>0?s.correct/s.total*100:0})).filter(o=>o.total>=5);if(e.length<2)return{best:null,worst:null};e.sort((o,s)=>s.score-o.score);const a=e[0],n=e[e.length-1];return a&&n&&a.score>n.score?{best:a,worst:n}:{best:null,worst:null}}function st(t){const r={theory:{correct:0,total:0},calculation:{correct:0,total:0}};t.forEach(n=>{!n.userAnswers||!n.shuffledQuestions||n.userAnswers.forEach((o,s)=>{if(!o)return;const l=n.shuffledQuestions[s];if(!l)return;const i=l.type==="fill-in-number"?"calculation":"theory";r[i].total++,o.isCorrect&&r[i].correct++})});const e=r.theory.total>0?r.theory.correct/r.theory.total*100:0,a=r.calculation.total>0?r.calculation.correct/r.calculation.total*100:0;return{theory:{...r.theory,score:e},calculation:{...r.calculation,score:a}}}function G(t,r,e,a){const n={green:{bg:"bg-green-100 dark:bg-green-900/40",text:"text-green-700 dark:text-green-300"},red:{bg:"bg-red-100 dark:bg-red-900/40",text:"text-red-700 dark:text-red-300"},blue:{bg:"bg-blue-100 dark:bg-blue-900/40",text:"text-blue-700 dark:text-blue-300"},purple:{bg:"bg-purple-100 dark:bg-purple-900/40",text:"text-purple-700 dark:text-purple-400"},gray:{bg:"bg-gray-100 dark:bg-gray-700/60",text:"text-gray-700 dark:text-gray-300"}},o=n[a]||n.gray,s=document.createElement("div");return s.className="flex items - center gap - 4 p - 4 bg - white dark: bg - gray - 800 / 50 rounded - xl shadow - sm border border - gray - 200 dark: border - gray - 700",s.innerHTML=`
    <div class="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center ${o.bg} ${o.text}">
        ${e}
        </div>
    <div>
        <p class="text-xl font-bold text-gray-800 dark:text-gray-200">${t}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">${r}</p>
    </div>
`,s}function me(t,r,e,a,n){const s={green:{bg:"bg-green-100 dark:bg-green-900/40",text:"text-green-700 dark:text-green-300",border:"border-green-200 dark:border-green-800/50",light:"bg-green-500"},red:{bg:"bg-red-100 dark:bg-red-900/40",text:"text-red-700 dark:text-red-300",border:"border-red-200 dark:border-red-800/50",light:"bg-red-500"}}[n],l=document.createElement("div");return l.className=`p - 5 bg - white dark: bg - gray - 800 / 50 rounded - 2xl shadow - sm border ${s.border} flex items - start gap - 4 transition - all duration - 300 hover: shadow - lg hover: -translate - y - 1`,l.innerHTML=`
    <div class="flex-shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center ${s.bg} ${s.text}">
        ${a.replace("h-6 w-6","h-8 w-8")}
        </div>
    <div class="flex-grow min-w-0">
        <div class="flex justify-between items-start gap-2 mb-1">
            <p class="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">${t}</p>
            <span class="text-lg font-black font-kanit ${s.text}">${e}%</span>
        </div>
        <h4 class="text-lg font-bold text-gray-800 dark:text-gray-100 font-kanit leading-tight pb-2">${r}</h4>
        <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div class="${s.light} h-full" style="width: ${e}%"></div>
        </div>
    </div>
`,l}function at(t){const r=document.getElementById("analysis-summary-grid")||document.getElementById("summary-cards-grid"),e=document.getElementById("insight-cards-container");if(!r||!e)return;e.innerHTML="";let a=0,n=0;t.forEach(b=>{b.totalTimeSpent&&b.shuffledQuestions&&b.userAnswers&&b.userAnswers.some(c=>c!==null)&&(a+=b.totalTimeSpent,n+=b.shuffledQuestions.length)});const o=n>0?a/n:0,s='<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>';if(n>0){const b=G(`${o.toFixed(1)} วิ / ข้อ`,"เวลาเฉลี่ยต่อข้อ",s,"purple");r.appendChild(b)}const l=rt(t);if(l.best){const c=me("หัวข้อที่ถนัดที่สุด",l.best.name,l.best.score.toFixed(0),'<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>',"green");e.appendChild(c)}if(l.worst){const c=me("หัวข้อที่ควรทบทวน",l.worst.name,l.worst.score.toFixed(0),'<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>',"red");e.appendChild(c)}const i=st(t),d='<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" /></svg>',g='<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zM6 7a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 100 2h4a1 1 0 100-2H6z" clip-rule="evenodd" /></svg>';if(i.theory.total>0){const b=G(`${i.theory.score.toFixed(0)}% `,"ความแม่นยำ(ทฤษฎี)",d,"blue");r.appendChild(b)}if(i.calculation.total>0){const b=G(`${i.calculation.score.toFixed(0)}% `,"ความแม่นยำ(คำนวณ)",g,"blue");r.appendChild(b)}}function Te(t){const r=document.getElementById("score-trend-chart")?.closest("section"),e=document.getElementById("score-trend-chart")?.getContext("2d");if(e){const a=Chart.getChart(e);a&&a.destroy()}if(!(!e||!r)){if(typeof Chart>"u"){console.warn("Chart.js is not loaded. Skipping score trend chart.");return}if(t.labels.length<2){r.innerHTML=`
    <h2 class="text-xl font-bold font-kanit mb-4 text-center"> แนวโน้มคะแนน(Score Trend)</h2>
        <div class="flex items-center justify-center h-56">
            <p class="text-center text-gray-500 dark:text-gray-400">ทำแบบทดสอบให้เสร็จอย่างน้อย 2 ชุด<br>เพื่อดูแนวโน้มคะแนนของคุณที่นี่</p>
        </div>
`;return}document.documentElement.classList.contains("dark"),new Chart(e,{type:"line",data:{labels:t.labels,datasets:[{label:"คะแนน (%)",data:t.data,fill:!0,backgroundColor:"rgba(59, 130, 246, 0.1)",borderColor:"rgba(59, 130, 246, 1)",tension:.3,pointBackgroundColor:"rgba(59, 130, 246, 1)",pointBorderColor:"#fff",pointHoverBackgroundColor:"#fff",pointHoverBorderColor:"rgba(59, 130, 246, 1)",pointRadius:4,pointHoverRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{y:{beginAtZero:!0,max:100,ticks:{color:D().textColor,callback:a=>a+"%"},grid:{color:D().gridColor}},x:{ticks:{color:D().textColor},grid:{display:!1}}},plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(0,0,0,0.8)",padding:12,callbacks:{label:a=>` คะแนน: ${a.raw.toFixed(1)}% `}}}}})}}function ot(t,r){let e=0,a=0;t.forEach(s=>{e+=s.score||0,a+=s.userAnswers?.filter(l=>l!==null).length||0});const n=a>0?e/a*100:0,o=t.filter(s=>s.isFinished).length;return{totalCorrect:e,totalIncorrect:a-e,totalQuestions:a,completedQuizzes:o,inProgressQuizzes:t.length-o,averageScore:n.toFixed(1),totalQuizCount:r}}function nt(t){const r={};return t.forEach(e=>{e.userAnswers&&e.userAnswers.forEach(a=>{if(!a)return;const n=a.sourceQuizCategory||e.category||"Uncategorized";r[n]||(r[n]={correct:0,total:0}),r[n].total++,a.isCorrect&&r[n].correct++})}),Object.entries(r).map(([e,a])=>{const n=_[e]||{order:99};return{subjectKey:e,subject:Le(e),score:a.total>0?a.correct/a.total*100:0,order:n.order}}).filter(e=>e.score>0).sort((e,a)=>e.order-a.order)}function Me(t,r="overall"){const e={};let a={};if(r!=="overall"){if(r.startsWith("physics_")){const o=r.split("_")[1],s=I.Physics[o];s&&s.chapters&&s.chapters.forEach(l=>{a[l.title]=l.shortTitle||l.title.split(":")[0]})}else if(r==="earth_basic"){const o=I.EarthSpaceScienceBasic;o&&o.units&&o.units.forEach(s=>{s.chapters.forEach(l=>{a[l.title]=l.shortTitle||l.title})})}else if(r==="earth_adv"){const o=I.EarthSpaceScienceAdvance;o&&o.chapters&&o.chapters.forEach(s=>{a[s.title]=s.shortTitle||s.title})}else if(r==="posn_earth"){const o=I.EarthAndSpace;o&&Object.keys(o).forEach(s=>{o[s].forEach(l=>{a[l]=s}),a[s]=s})}else if(r==="posn_astro"){const o=I.ASTRONOMY_POSN;o&&o.forEach(s=>{a[s.topic]=s.topic})}}t.forEach(o=>{o.userAnswers&&o.userAnswers.forEach(s=>{if(!s)return;const l=s.sourceQuizCategory||o.category||"Uncategorized";if(typeof s.subCategory!="object"||!s.subCategory.main||!s.subCategory.specific)return;const i=s.subCategory.main,d=s.subCategory.specific;let g=i;if(r!=="overall"){const b=a[i];if(!b)return;g=b}e[l]||(e[l]={}),e[l][g]||(e[l][g]={}),e[l][g][d]||(e[l][g][d]={correct:0,total:0}),e[l][g][d].total++,s.isCorrect&&e[l][g][d].correct++})});const n={};for(const o in e){n[o]={};for(const s in e[o]){const l=Object.entries(e[o][s]).map(([i,d])=>({name:i,...d,averageScore:d.total>0?d.correct/d.total*100:0})).filter(i=>i.total>0).sort((i,d)=>i.name.localeCompare(d.name,"th"));l.length>0&&(n[o][s]=l)}}return n}function lt(t){const r=document.getElementById("analysis-summary-grid")||document.getElementById("summary-cards-grid");if(!r)return;const e=t.totalQuizCount>0?t.completedQuizzes/t.totalQuizCount*100:0,a=t.totalQuizCount>0?t.inProgressQuizzes/t.totalQuizCount*100:0,n=t.totalQuestions>0?t.totalCorrect/t.totalQuestions*100:0,o=[{label:"ทำเสร็จแล้ว",value:`${t.completedQuizzes} <span class="text-sm font-normal text-gray-500 dark:text-gray-400">/ ${t.totalQuizCount} ชุด</span>`,percentage:e,color:"bg-blue-500",icon:'<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',iconBgColor:"bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300",borderColor:"border-blue-200 dark:border-blue-800/50",shadowColor:"hover:shadow-blue-500/10"},{label:"กำลังทำ",value:`${t.inProgressQuizzes} <span class="text-sm font-normal text-gray-500 dark:text-gray-400">/ ${t.totalQuizCount} ชุด</span>`,percentage:a,color:"bg-indigo-500",icon:'<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>',iconBgColor:"bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300",borderColor:"border-indigo-200 dark:border-indigo-800/50",shadowColor:"hover:shadow-indigo-500/10"},{label:"ตอบถูกทั้งหมด",value:`${t.totalCorrect} <span class="font-normal text-gray-500 text-sm">/ ${t.totalQuestions} ข้อ</span>`,percentage:n,color:"bg-green-500",icon:'<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>',iconBgColor:"bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300",borderColor:"border-green-200 dark:border-green-800/50",shadowColor:"hover:shadow-green-500/10"},{label:"คะแนนเฉลี่ย",value:`${t.averageScore}% `,percentage:parseFloat(t.averageScore),color:"bg-purple-500",icon:'<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>',iconBgColor:"bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",borderColor:"border-purple-200 dark:border-purple-800/50",shadowColor:"hover:shadow-purple-500/10"}];r.innerHTML=o.map(s=>{const l=s.percentage.toFixed(0);return`
    <div class="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border ${s.borderColor||"border-gray-200 dark:border-gray-700/60"} flex flex-col gap-3 transition-all duration-300 hover:shadow-lg ${s.shadowColor||""} hover:-translate-y-1 group">
            <div class="flex items-center justify-between">
                <span class="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">${s.label}</span>
                <div class="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${s.iconBgColor} transition-transform group-hover:scale-110 duration-300">
                    ${s.icon}
                </div>
            </div>
            <div>
                <span class="font-black text-3xl text-gray-800 dark:text-gray-100 font-kanit">${s.value}</span>
                <div class="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2 mt-2 overflow-hidden shadow-inner">
                    <div class="${s.color} h-2 rounded-full relative" style="width: ${l}%">
                    </div>
                </div>
            </div>
        </div>
    `}).join("")}function it(t){if(typeof Chart>"u"){console.warn("Chart.js is not loaded. Skipping subject performance chart.");return}const r=document.getElementById("subject-performance-chart")?.getContext("2d");if(!r||t.length===0)return;if(r){const s=Chart.getChart(r);s&&s.destroy()}const e=t.map(s=>s.subject),a=t.map(s=>s.score),n=t.map(s=>{const l=_[s.subjectKey]||{};return et(l.color||"border-gray-500",.7)}),o=t.map(s=>{const l=_[s.subjectKey]||{};return tt(l.color||"border-gray-500")});new Chart(r,{type:"bar",data:{labels:e,datasets:[{label:"คะแนนเฉลี่ย (%)",data:a,backgroundColor:n,borderColor:o,borderWidth:1,borderRadius:4}]},options:{indexAxis:"y",responsive:!0,maintainAspectRatio:!1,scales:{x:{beginAtZero:!0,max:100,grid:{color:D().gridColor},ticks:{color:D().textColor,callback:function(s){return s+"%"}}},y:{grid:{display:!1},ticks:{color:D().textColor,font:{family:"'Kanit', sans-serif",weight:"bold"}}}},plugins:{legend:{display:!1},tooltip:{callbacks:{label:s=>`คะแนนเฉลี่ย: ${s.raw.toFixed(1)}% `}}}}})}function Pe(t){const r=document.getElementById("subject-performance-container");if(!r)return;r.innerHTML='<h2 class="text-2xl font-bold font-kanit text-gray-800 dark:text-gray-100 mb-4">วิเคราะห์คะแนนรายบทเรียน</h2>';const e=Object.keys(t).sort((a,n)=>{const o=_[a]?.order||99,s=_[n]?.order||99;return o-s});if(e.length===0||Object.values(t).every(a=>Object.keys(a).length===0)){r.innerHTML+='<p class="text-center text-gray-500 dark:text-gray-400">ไม่มีข้อมูลคะแนน</p>';return}e.forEach(a=>{const n=t[a],o=_[a]||{displayName:a,color:"border-gray-500",icon:"./assets/icons/study.png"};if(Object.keys(n).length===0)return;const s=document.createElement("div");s.className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden";let l="";Object.keys(n).sort((f,u)=>f.localeCompare(u,"th")).forEach(f=>{const u=n[f];if(!u||u.length===0)return;const x=u.reduce((w,k)=>(w.correct+=k.correct,w.total+=k.total,w),{correct:0,total:0}),m=x.total>0?x.correct/x.total*100:0,y=m.toFixed(0),v=m>=75?"bg-green-500":m>=50?"bg-yellow-500":"bg-red-500",h=u.map(w=>{const k=w.averageScore,E=k>=75?"bg-green-500":k>=50?"bg-yellow-500":"bg-red-500";return`
    <div class="p-3 border-t border-gray-200 dark:border-gray-700/50">
                        <div class="flex justify-between items-center text-sm">
                            <span class="font-medium text-gray-700 dark:text-gray-200">${w.name.replace(/^ว\s[\d\.]+\sม\.[\d\/]+\s/,"").replace(/^\d+\.\s/,"").trim()}</span>
                            <span class="font-semibold text-gray-800 dark:text-gray-100">${w.correct}/${w.total} <span class="font-normal text-gray-500 dark:text-gray-400">(${k.toFixed(0)}%)</span></span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1.5">
                            <div class="${E} h-2 rounded-full" style="width: ${k}%"></div>
                        </div>
                    </div>
    `}).join("");l+=`
    <details class="group bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-4 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                    <summary class="flex justify-between items-center cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors list-none">
                        <div class="flex-grow min-w-0">
                            <div class="flex justify-between items-baseline mb-1">
                                <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit truncate pr-2">${f}</h4>
                                <span class="font-kanit font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0 text-sm sm:text-base">${y}%</span>
                            </div>
                            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div class="${v} h-2.5 rounded-full" style="width: ${y}%"></div>
                            </div>
                        </div>
                        <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ml-2 sm:ml-4 group-open:rotate-90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div class="border-t border-gray-200 dark:border-gray-700/50">
                        ${h}
                    </div>
                </details>
    `});const d=Object.values(n).flat().reduce((f,u)=>f+u.total,0),g=Object.values(n).flat().reduce((f,u)=>f+u.correct,0),b=d>0?g/d*100:0,c=b.toFixed(0),p=b>=75?"bg-green-500":b>=50?"bg-yellow-500":"bg-red-500";s.innerHTML=`
    <details class="group">
                <summary class="flex justify-between items-center cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors list-none">
                    <div class="flex items-center flex-grow min-w-0 gap-3 sm:gap-4">
                        <div class="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center border-4 ${o.color} bg-white p-1 sm:p-1.5 overflow-hidden">
                            <img src="${o.icon}" alt="${o.displayName} Icon" class="h-full w-full object-contain">
                        </div>
                        <div class="flex-grow min-w-0">
                            <div class="flex justify-between items-baseline mb-1">
                                <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 font-kanit truncate pr-2">${o.displayName}</h3>
                                <span class="font-kanit font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0 text-base sm:text-lg">${c}%</span>
                            </div>
                            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div class="${p} h-2.5 rounded-full" style="width: ${c}%"></div>
                            </div>
                        </div>
                    </div>
                    <svg class="chevron-icon h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ml-2 sm:ml-4 group-open:rotate-90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div class="border-t border-gray-200 dark:border-gray-700 pt-2">
                    ${l}
                </div>
            </details>
    `,r.appendChild(s)})}function dt(t){const r=document.getElementById("detailed-stats-container");if(r){if(r.className="grid grid-cols-1 md:grid-cols-2 gap-4",t.sort((e,a)=>e.isFinished!==a.isFinished?e.isFinished?1:-1:(a.lastAttemptTimestamp||0)-(e.lastAttemptTimestamp||0)),t.length===0){r.innerHTML='<p class="text-center text-gray-500 dark:text-gray-400 md:col-span-2">ไม่มีประวัติการทำแบบทดสอบ</p>';return}r.innerHTML=t.map((e,a)=>{const{title:n,url:o,isFinished:s,score:l,shuffledQuestions:i,userAnswers:d,icon:g,altText:b,category:c,storageKey:p}=e,f=i?.length||0,u=d?.filter(E=>E!==null).length||0,x=f>0?(l/f*100).toFixed(0):0,y=_[c]?.color?.split("-")[1]||"gray";let v,h,w,k;return s?(v=`ทำเสร็จแล้ว - คะแนน ${x}% `,h="text-green-600 dark:text-green-400",w="ดูผล / ทำใหม่",k="bg - gray - 200 dark: bg - gray - 700 text - gray - 800 dark: text - gray - 200 hover: bg - gray - 300 dark: hover: bg - gray - 600"):(v=`ทำไป ${u}/${f} ข้อ`,h="text-blue-600 dark:text-blue-400",w="ทำต่อ",k="bg-blue-600 hover:bg-blue-700 text-white"),`
            <div class="stat-quiz-card flex flex-col bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:border-${y}-400 dark:hover:border-${y}-500 transform hover:-translate-y-1" style="animation-delay: ${a*50}ms;">
                <div class="flex items-center gap-4 flex-grow">
                    <div class="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-2 overflow-hidden">
                        <img src="${g||"./assets/icons/dices.png"}" alt="${b||n}" loading="lazy" class="h-full w-full object-contain">
                    </div>
                    <div class="flex-grow min-w-0">
                        <h4 class="font-bold text-gray-800 dark:text-gray-100 truncate">${n}</h4>
                        <p class="text-sm font-medium ${h}">${v}</p>
                    </div>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <a href="${o}" 
                       data-is-finished="${s}"
                       data-storage-key="${p}"
                       data-quiz-title="${n}"
                       class="quiz-stat-item block w-full text-center px-4 py-2 rounded-md text-sm font-bold transition ${k}">
                        ${w}
                    </a>
                </div>
            </div>
        `}).join("")}}let q;function ct(t,r,e){if(!q)try{q=new M("completed-quiz-modal")}catch(s){console.error("Failed to initialize completed-quiz-modal:",s);return}const a=document.getElementById("completed-modal-title"),n=document.getElementById("completed-view-results-btn"),o=document.getElementById("completed-start-over-btn");!a||!n||!o||(a.textContent=t,n.onclick=()=>{const s=r.includes("?")?`${r}&action=view_results`:`${r}?action=view_results`;window.location.href=s,q.close()},o.onclick=()=>{localStorage.removeItem(e),window.location.href=r,q.close()},q.open())}function ut(){const t=document.getElementById("detailed-stats-container");!t||t.dataset.listenersInitialized||(t.dataset.listenersInitialized="true",t.addEventListener("click",r=>{const e=r.target.closest(".quiz-stat-item");if(!e)return;r.preventDefault();const a=e.dataset.isFinished==="true",n=e.getAttribute("href"),o=e.dataset.storageKey,s=e.dataset.quizTitle;if(!n||!o){console.error("Missing URL or storageKey on clicked stat item.",e);return}a?ct(s,n,o):window.location.href=n}))}const gt=["🧑‍🎓","👩‍🎓","👨‍🔬","👩‍🔬","👨‍🚀","👩‍🚀","👽","🤖","👻","💩"];let re=null,Y=null,xe=null,J=null,R=null,V="consumable",Z="all",F="overall",se="highschool",ee="",ae="overall",oe="7",ge={analysis:!1};async function nr(t){const r=t||new qe;L(r),ie(r),ve(r),U(r),fe(r,"profile-daily-quests-container"),le(r),_t(r),Tt(r),kt(r),Mt(r),Ht(r),$t(r),Ct(r),It(),Lt(r),St(r),Bt(),zt(r),Dt(r),pt(r),document.getElementById("radar-chart-loader")?.classList.remove("hidden"),document.getElementById("history-chart-loader")?.classList.remove("hidden"),document.getElementById("strengths-weaknesses-loader")?.classList.remove("hidden"),Et(r);const e=await Q();Qt(r,e),Ot(r,e),we(e),(await Promise.all([P(r,e),W(r,e),de(e)])).every(Boolean)&&document.getElementById("refresh-charts-btn")?.classList.add("hidden"),R&&window.removeEventListener("gamification-updated",R),R=async()=>{L(r),ie(r),ve(r),U(r),fe(r,"profile-daily-quests-container"),le(r);const n=await Q();we(n),await Promise.all([P(r,n),W(r,n),de(n)])},window.addEventListener("gamification-updated",R)}function pt(t){const r=document.querySelectorAll(".primary-tab-btn"),e=document.querySelectorAll(".hub-panel"),a=document.getElementById("tab-sliding-indicator"),n=s=>{if(!a||!s)return;const l=s.getBoundingClientRect(),i=s.parentElement.getBoundingClientRect();a.style.display="block",a.style.width=`${l.width}px`,a.style.left=`${l.left-i.left}px`,setTimeout(()=>{a.style.opacity="1"},50)},o=document.querySelector(".primary-tab-btn.active");o&&setTimeout(()=>n(o),100),window.addEventListener("resize",()=>{const s=document.querySelector(".primary-tab-btn.active");s&&n(s)}),r.forEach(s=>{s.addEventListener("click",async()=>{const l=s.dataset.tabTarget;r.forEach(d=>{d.classList.remove("active","text-blue-600","dark:text-blue-400"),d.classList.add("text-gray-500","dark:text-gray-400","hover:text-gray-900","dark:hover:text-gray-100")}),s.classList.add("active","text-blue-600","dark:text-blue-400"),s.classList.remove("text-gray-500","dark:text-gray-400","hover:text-gray-900","dark:hover:text-gray-100"),n(s),e.forEach(d=>d.classList.add("hidden"));const i=document.getElementById(`panel-${l}`);i&&(i.classList.remove("hidden"),i.classList.add("animate-fade-in")),l==="analysis"&&!ge.analysis?await ne(t):l==="history"&&await X(t)})})}async function ne(t){if(!document.getElementById("panel-analysis"))return;const e=await Se(),a=await Be(e),n=document.getElementById("rpg-stat-str");n&&(n.textContent=`${t?.state?.streak||0} วัน`);const o=document.getElementById("rpg-stat-spd");let s=0,l=0;if(a.forEach(f=>{const u=Array.isArray(f.userAnswers)?f.userAnswers.filter(x=>x!==null).length:0;f.totalTimeSpent&&u>0&&(s+=f.totalTimeSpent,l+=f.shuffledQuestions?.length||u)}),o&&(o.textContent=l>0?`${(s/l).toFixed(1)}s/ข้อ`:"--"),a.length===0){const f=document.getElementById("analysis-summary-grid");f&&(f.innerHTML='<div class="col-span-full glass-card rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400">ยังไม่มีสถิติการทำแบบทดสอบสำหรับวิเคราะห์</div>');return}const{getQuizzesList:i}=await $e(async()=>{const{getQuizzesList:f}=await import("./data-manager-GBz3Ac12.js").then(u=>u.o);return{getQuizzesList:f}},__vite__mapDeps([0,1,2])),d=await i(),g=ot(a,d.length+e.length);lt(g);const b=Ie(a,oe);Te(b);const c=nt(a);it(c);const p=Me(a,ae);Pe(p),at(a),ft(t,a),ge.analysis=!0}async function X(t){He(t),Ae(t);const r=await Se(),a=(await Be(r)).filter(o=>o.title.toLowerCase().includes(ee.toLowerCase())||Le(o.category).toLowerCase().includes(ee.toLowerCase()));dt(a),ut();const n=document.getElementById("history-search-input");n&&!n.dataset.initialized&&(n.addEventListener("input",o=>{ee=o.target.value,X(t)}),n.dataset.initialized="true")}function ft(t,r){const e=document.querySelectorAll(".trend-range-btn");e.forEach(n=>{n.addEventListener("click",()=>{oe=n.dataset.range,e.forEach(s=>s.classList.remove("active","bg-blue-100","text-blue-700")),n.classList.add("active","bg-blue-100","text-blue-700");const o=Ie(r,oe);Te(o)})});const a=document.getElementById("topic-syllabus-select");a&&a.addEventListener("change",n=>{ae=n.target.value;const o=Me(r,ae);Pe(o)})}function ye(t,r,e){const a=document.getElementById(t);if(a)if(r!==null&&r!==e){Ft(a,r,e,1e3);const o=e<r?"text-red-500":"text-green-500";a.classList.add(o,"scale-125","inline-block","transition-transform"),setTimeout(()=>a.classList.remove(o,"scale-125"),500)}else a.textContent=e.toLocaleString()}function L(t){const r=t.getCurrentLevel(),e=r.title;J!==null&&J!==e&&$("ปลดล็อกฉายาใหม่!",`คุณได้รับฉายา: "${e}"`,"🌟","gold");const a=document.getElementById("user-rank-title");a&&(a.textContent=`${e} (Lv.${r.level})`);const n=document.getElementById("user-level");n&&(n.textContent=r.level);const o=t.state.xp;ye("current-xp",Y,o);const s=document.getElementById("next-level-xp"),l=document.getElementById("xp-needed"),i=document.getElementById("xp-progress-bar"),d=document.getElementById("next-level-quest-container"),g=document.getElementById("next-level-quest-desc"),b=document.getElementById("next-level-quest-progress"),c=pe[r.level-1],p=pe[r.level];if(p){const h=p.xp-c.xp,w=Math.max(0,t.state.xp-c.xp),k=Math.max(0,p.xp-t.state.xp),E=Math.min(100,Math.max(0,w/h*100));i&&(i.style.width="0%",setTimeout(()=>{i.style.width=`${E}%`},100)),s&&(s.textContent=p.xp.toLocaleString()),l&&(l.textContent=k.toLocaleString())}else i&&(i.style.width="100%"),s&&(s.textContent="MAX"),l&&(l.textContent="0");if(d)if(r.nextLevelQuest){d.classList.remove("hidden"),g&&(g.textContent=r.nextLevelQuest.desc);const h=t.getQuestProgressValue(r.nextLevelQuest),w=r.nextLevelQuest.target;b&&(b.textContent=`(${h}/${w})`)}else d.classList.add("hidden");const f=document.getElementById("profile-display-name");f&&(f.textContent=t.state.displayName||"ผู้เรียน (Guest)");const u=document.getElementById("profile-email-display");if(u){const h=t.authManager.currentUser;h&&h.email?(u.innerHTML=`
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span class="truncate max-w-[200px] sm:max-w-[320px] md:max-w-[450px]" title="${C(h.email)}">${C(h.email)}</span>
            `,u.classList.remove("hidden")):u.classList.add("hidden")}const x=document.getElementById("profile-avatar-display"),m=document.getElementById("level-frame-container");if(x&&m){const h=t.state.avatar||"🧑‍🎓";xe!==h&&(h.includes("/")||h.includes(".")?x.innerHTML=`<img src="${C(h)}" alt="Profile Avatar" class="w-full h-full rounded-full object-cover">`:x.innerHTML=C(h),x.classList.remove("anim-avatar-pop"),x.offsetWidth,x.classList.add("anim-avatar-pop"),xe=h);const w=ce(h);x.className=`w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl cursor-pointer transition-transform transform ${w}`;const k=Ce(r.level);m.className="w-full h-full rounded-full p-1 transition-all duration-300",m.classList.add(...k.split(" "))}const y=document.getElementById("edit-title-btn");y&&(t.state.selectedTitle?y.innerHTML=`<span class="text-purple-600 dark:text-purple-400 font-bold">《 ${C(t.state.selectedTitle)} 》</span>`:y.innerHTML="🏷️ เปลี่ยนฉายา"),ye("shop-user-xp",Y,o);const v=document.getElementById("edit-theme-btn");v&&(v.textContent=t.state.selectedTheme?"🎨 ธีม: กำหนดเอง":"🎨 ธีม: มาตรฐาน"),wt(t),bt(t),mt(t),ht(t),vt(t),He(t),Ae(t),J=e,Y=o,t.updateHeaderAvatar()}function bt(t){const r=t.getCurrentWeeklyBoss();let e=document.getElementById("boss-card-slot-perks-tab");if(!e){let s=document.getElementById("weekly-boss-card-container");if(s)e=s;else{const l=document.getElementById("next-level-quest-container");l&&l.parentElement&&(e=document.createElement("div"),e.id="weekly-boss-card-container",e.className="mt-4",l.parentElement.insertBefore(e,l.nextSibling))}}if(!e)return;const a=Math.min(100,Math.max(0,r.currentHp/r.maxHp*100)),n=r.currentHp<=0;e.innerHTML=`
        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-indigo-950/40 to-slate-900/60 border-2 border-purple-500/40 shadow-xl relative overflow-hidden group">
            

            <!-- Main Info & CTA Layout -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 relative z-10 pr-10">
                <!-- Boss Icon & Details -->
                <div class="flex items-center gap-3">
                    <span class="text-4xl p-2 rounded-xl bg-purple-900/50 border border-purple-500/30 shadow-inner shrink-0">${r.icon}</span>
                    <div class="min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h4 class="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white font-kanit tracking-wide leading-snug">
                                ⚔️ บอสประจำสัปดาห์: <span class="text-purple-600 dark:text-purple-300">${C(r.name)}</span>
                            </h4>
                            <button id="boss-info-btn" type="button" title="รายละเอียดกติกาบอส" class="w-5 h-5 rounded-full border border-purple-400/60 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-serif font-bold text-xs flex items-center justify-center hover:bg-purple-600 hover:text-white transition shadow-xs cursor-pointer">
                                i
                            </button>
                        </div>
                        <p class="text-xs text-gray-600 dark:text-purple-300/80 mt-1">
                            ตอบถูก 1 ข้อ = โจมตี 5 HP | รางวัลพิชิต: <span class="text-yellow-600 dark:text-yellow-400 font-extrabold">+${r.bonusXp} XP</span>
                        </p>
                    </div>
                </div>
                
                <!-- Separate HP Pill and Challenge CTA Button -->
                <div class="flex flex-col sm:items-end gap-2 shrink-0">
                    <!-- HP Status Pill -->
                    <span class="text-xs font-mono font-bold px-3 py-1 rounded-full inline-self-start sm:inline-self-auto ${n?"bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40":"bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 shadow-xs"}">
                        ${n?"พิชิตแล้ว 🏆":`HP: ${r.currentHp} / ${r.maxHp}`}
                    </span>
                    <!-- Prominent Challenge Button -->
                    <a href="./quiz/index.html?id=random&category=${r.category||"all"}&mode=boss" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs sm:text-sm font-extrabold font-kanit rounded-xl shadow-lg shadow-red-500/30 transition transform hover:scale-105 active:scale-95 border border-red-300/30 tracking-wide animate-pulse hover:animate-none">
                        ⚔️ ลุยบอสตัวนี้!
                    </a>
                </div>
            </div>

            <!-- Health Bar -->
            <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3.5 border border-purple-500/20 p-0.5 shadow-inner mt-1">
                <div class="h-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 transition-all duration-500 rounded-full shadow-xs" style="width: ${a}%"></div>
            </div>
        </div>
    `;const o=e.querySelector("#boss-info-btn");o&&o.addEventListener("click",s=>{s.preventDefault(),s.stopPropagation(),xt(r)})}function mt(t){const r=document.getElementById("boss-leaderboard-list");if(!r)return;const e=t.state.bossDamageDealt||0,a=t.state.displayName||"ผู้เรียน",n=[{name:"Dr. AstroStar",dmg:Math.max(140,e+35),title:"ผู้พิชิต Astro-Behemoth",isUser:!1},{name:"QuantumMaster",dmg:Math.max(110,e+15),title:"ผู้พิชิต Quantum-Overlord",isUser:!1},{name:a,dmg:e,title:t.state.selectedTitle||"นักต่อสู้บอส",isUser:!0}].sort((s,l)=>l.dmg-s.dmg).slice(0,3),o=["🥇","🥈","🥉"];r.innerHTML=n.map((s,l)=>`
        <div class="p-3 rounded-xl border flex items-center justify-between gap-3 ${s.isUser?"bg-purple-900/40 dark:bg-purple-950/80 border-purple-500/60 shadow-md text-white":"bg-white/80 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700"} transition">
            <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-xl shrink-0">${o[l]}</span>
                <div class="min-w-0">
                    <div class="flex items-center gap-1.5 truncate">
                        <span class="font-extrabold text-xs text-gray-900 dark:text-white font-kanit truncate">${C(s.name)}</span>
                        ${s.isUser?'<span class="px-1.5 py-0.5 rounded-full bg-purple-500 text-white text-[9px] font-extrabold shrink-0 shadow-xs">คุณ</span>':""}
                    </div>
                    <span class="text-[10px] ${s.isUser?"text-purple-200 dark:text-purple-300":"text-gray-500 dark:text-gray-400"} truncate block font-medium">${C(s.title)}</span>
                </div>
            </div>
            <span class="text-xs font-extrabold font-mono ${s.isUser?"text-yellow-300":"text-purple-600 dark:text-purple-300"} shrink-0">
                ${s.dmg} HP
            </span>
        </div>
    `).join("")}function xt(t){const r=document.getElementById("boss-rules-modal");r&&r.remove();const e=document.documentElement.classList.contains("dark"),a=document.createElement("div");a.id="boss-rules-modal",a.className=`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in ${e?"dark":""}`;const n=e?"bg-slate-900 text-slate-100 border-purple-500/50 shadow-2xl":"bg-white text-slate-800 border-purple-200 shadow-2xl",o=e?"text-white":"text-slate-900",s=e?"text-slate-300":"text-slate-600",l=e?"bg-slate-800 text-slate-300 hover:bg-slate-700":"bg-slate-100 text-slate-600 hover:bg-slate-200",i=c=>c==="physics"?"ฟิสิกส์":c==="earth"?"วิทย์โลก & ธรณีวิทยา":"ดาราศาสตร์",d=c=>c==="physics"?e?"text-blue-300":"text-blue-700":c==="earth"?e?"text-emerald-300":"text-emerald-700":e?"text-purple-300":"text-purple-700",g=(Re||[]).map(c=>{const p=c.id===t.id;return`
            <div class="flex items-center gap-3 p-2.5 rounded-xl ${p?e?"bg-purple-900/40 border border-purple-500/50":"bg-purple-50 border border-purple-300":""} transition-all">
                <span class="text-2xl shrink-0">${c.icon}</span>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-extrabold text-sm ${o} font-kanit">${c.name}</span>
                        ${p?`<span class="text-[10px] px-1.5 py-0.5 rounded-full ${e?"bg-amber-900/60 text-amber-300 border border-amber-600/50":"bg-amber-100 text-amber-700 border border-amber-300"} font-bold">ตัวปัจจุบัน</span>`:""}
                    </div>
                    <p class="text-xs ${s}">
                        หมวด: <span class="font-bold ${d(c.category)}">${i(c.category)}</span> · HP: ${c.maxHp} · รางวัล: <span class="${e?"text-amber-300":"text-amber-600"} font-bold">+${c.bonusXp} XP</span>
                    </p>
                </div>
            </div>
        `}).join("");a.innerHTML=`
        <div class="${n} rounded-3xl max-w-md w-full p-6 sm:p-7 border relative overflow-hidden font-sarabun">
            <!-- Top Gradient Accent -->
            <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500"></div>

            <button id="close-boss-modal-btn" class="absolute top-5 right-5 w-8 h-8 rounded-full ${l} flex items-center justify-center transition font-bold cursor-pointer">
                ✕
            </button>

            <!-- Header -->
            <div class="flex items-center gap-3 mb-6">
                <span class="text-3xl shrink-0">⚔️</span>
                <div>
                    <h3 class="font-extrabold text-xl ${o} font-kanit leading-tight">กติกาบอสประจำสัปดาห์</h3>
                    <p class="text-xs ${e?"text-purple-300":"text-purple-600"} font-bold mt-0.5">บอสปัจจุบัน: ${C(t.name)}</p>
                </div>
            </div>

            <!-- Rules List -->
            <div class="space-y-5 mb-6 text-xs sm:text-sm">
                <div class="flex items-start gap-3.5">
                    <div class="w-9 h-9 rounded-2xl ${e?"bg-red-950/80 text-red-300 border border-red-700/50":"bg-red-100 text-red-700"} flex items-center justify-center font-bold text-base shrink-0 shadow-xs">🎯</div>
                    <div>
                        <h4 class="font-extrabold ${o} font-kanit text-sm mb-1">เป้าหมายสัปดาห์</h4>
                        <p class="${s} leading-relaxed">ช่วยกันทำควิซเพื่อลด HP บอสจาก <span class="${e?"text-red-300 font-bold":"text-red-700 font-bold"}">${t.maxHp} HP</span> ให้เหลือ 0 ก่อนสิ้นสุดสัปดาห์</p>
                    </div>
                </div>
                <div class="flex items-start gap-3.5">
                    <div class="w-9 h-9 rounded-2xl ${e?"bg-orange-950/80 text-orange-300 border border-orange-700/50":"bg-orange-100 text-orange-700"} flex items-center justify-center font-bold text-base shrink-0 shadow-xs">💥</div>
                    <div>
                        <h4 class="font-extrabold ${o} font-kanit text-sm mb-1">พลังโจมตี</h4>
                        <p class="${s} leading-relaxed">ตอบคำถามถูก 1 ข้อ = ลด HP บอสลง <span class="${e?"text-orange-300 font-bold":"text-orange-700 font-bold"}">5 HP</span> ทันที</p>
                    </div>
                </div>
                <div class="flex items-start gap-3.5">
                    <div class="w-9 h-9 rounded-2xl ${e?"bg-amber-950/80 text-amber-300 border border-amber-700/50":"bg-amber-100 text-amber-700"} flex items-center justify-center font-bold text-base shrink-0 shadow-xs">🏆</div>
                    <div>
                        <h4 class="font-extrabold ${o} font-kanit text-sm mb-1">รางวัลพิชิต & เหรียญตรา</h4>
                        <p class="${s} leading-relaxed">ล้มบอสสำเร็จ รับโบนัส <span class="${e?"text-amber-300 font-bold":"text-amber-600 font-bold"}">+${t.bonusXp} XP</span> และปลดล็อกเหรียญตราเกียรติยศประจำบอสตัวนั้น!</p>
                    </div>
                </div>
            </div>

            <!-- All Bosses Section -->
            <div class="mb-5">
                <h4 class="font-extrabold text-sm ${o} font-kanit mb-3 flex items-center gap-2">
                    <span>📋</span> รายชื่อบอสทั้งหมด (สลับทุกสัปดาห์)
                </h4>
                <div class="space-y-2 ${e?"bg-slate-800/60 border-slate-700/60":"bg-slate-50 border-slate-200"} border rounded-2xl p-3">
                    ${g}
                </div>
            </div>

            <!-- Action Button -->
            <button id="confirm-boss-modal-btn" class="w-full py-3 bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white font-extrabold font-kanit text-sm rounded-2xl shadow-lg transition active:scale-95 cursor-pointer">
                รับทราบ & พร้อมลุย! ⚔️
            </button>
        </div>
    `,document.body.appendChild(a);const b=()=>a.remove();a.querySelector("#close-boss-modal-btn").onclick=b,a.querySelector("#confirm-boss-modal-btn").onclick=b,a.onclick=c=>{c.target===a&&b()}}function yt(){const t=document.getElementById("skill-tree-info-modal");t&&t.remove();const r=document.documentElement.classList.contains("dark"),e=document.createElement("div");e.id="skill-tree-info-modal",e.className=`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in ${r?"dark":""}`;const a=r?"bg-slate-900 text-slate-100 border-purple-500/50 shadow-2xl":"bg-white text-slate-800 border-purple-200 shadow-2xl",n=r?"text-white":"text-slate-900",o=r?"text-purple-300":"text-purple-600",s=r?"text-slate-300":"text-slate-600",l=r?"bg-slate-800 text-slate-300 hover:bg-slate-700":"bg-slate-100 text-slate-600 hover:bg-slate-200";e.innerHTML=`
        <div class="${a} rounded-3xl max-w-md w-full p-6 sm:p-7 border relative overflow-hidden font-sarabun">
            <!-- Top Gradient Accent -->
            <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>

            <button id="close-skill-info-modal" class="absolute top-5 right-5 w-8 h-8 rounded-full ${l} flex items-center justify-center transition font-bold cursor-pointer">
                ✕
            </button>

            <!-- Header -->
            <div class="flex items-center gap-3 mb-6">
                <span class="text-3xl shrink-0">🌳</span>
                <div>
                    <h3 class="font-extrabold text-xl ${n} font-kanit leading-tight">คู่มือ Perks</h3>
                    <p class="text-xs ${o} font-bold mt-0.5">การสะสม SP และการเพิ่มระดับความสามารถติดตัว</p>
                </div>
            </div>

            <!-- Content List (Spacious & Clean, No heavy nested borders) -->
            <div class="space-y-5 my-6 text-xs sm:text-sm">
                <!-- Item 1: SP Source -->
                <div class="flex items-start gap-3.5">
                    <div class="w-9 h-9 rounded-2xl ${r?"bg-purple-950/80 text-purple-300 border border-purple-700/50":"bg-purple-100 text-purple-700"} flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                        🌟
                    </div>
                    <div>
                        <h4 class="font-extrabold ${n} font-kanit text-sm mb-1">แต้ม SP หาจากไหน?</h4>
                        <p class="${s} leading-relaxed">
                            รับทันที <span class="${r?"text-purple-300 font-bold":"text-purple-700 font-bold"}">+1 SP ทุกครั้งที่เลเวลอัป</span> และสามารถรับ <span class="${r?"text-amber-300 font-bold":"text-amber-600 font-bold"}">+1 SP ฟรี</span> จากเควสประจำ 2 สัปดาห์!
                        </p>
                    </div>
                </div>

                <!-- Item 2: Multi-Level -->
                <div class="flex items-start gap-3.5">
                    <div class="w-9 h-9 rounded-2xl ${r?"bg-indigo-950/80 text-indigo-300 border border-indigo-700/50":"bg-indigo-100 text-indigo-700"} flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                        📈
                    </div>
                    <div>
                        <h4 class="font-extrabold ${n} font-kanit text-sm mb-1">การอัปทักษะเป็นลำดับขั้น</h4>
                        <p class="${s} leading-relaxed">
                            อัปเกรดได้หลายระดับ เช่น <span class="${r?"text-indigo-300 font-bold":"text-indigo-700 font-bold"}">Lv.1 (+5%) ➔ Lv.3 (+15%) ➔ Lv.5 (+30%)</span> โดยระดับที่สูงขึ้นจะใช้ SP เพิ่มขึ้น (1-3 SP)
                        </p>
                    </div>
                </div>

                <!-- Item 3: Passive Effects -->
                <div class="flex items-start gap-3.5">
                    <div class="w-9 h-9 rounded-2xl ${r?"bg-amber-950/80 text-amber-300 border border-amber-700/50":"bg-amber-100 text-amber-700"} flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                        ⚡
                    </div>
                    <div>
                        <h4 class="font-extrabold ${n} font-kanit text-sm mb-1">ผลของทักษะติดตัว (Passive Perks)</h4>
                        <p class="${s} leading-relaxed">
                            ทักษะที่อัปเกรดแล้วจะมีผลทำงานถาวร ช่วยเพิ่ม XP ควิซ, เพิ่มโบนัส Combo และลดราคาไอเทมในร้านค้า
                        </p>
                    </div>
                </div>
            </div>

            <!-- Action Button -->
            <button id="confirm-close-skill-info" class="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold font-kanit text-sm rounded-2xl shadow-lg transition active:scale-95 cursor-pointer">
                เข้าใจแล้ว!
            </button>
        </div>
    `,document.body.appendChild(e);const i=()=>e.remove();e.querySelector("#close-skill-info-modal").onclick=i,e.querySelector("#confirm-close-skill-info").onclick=i,e.onclick=d=>{d.target===e&&i()}}function ht(t){const r=t.getAvailableSkillPoints(),e=document.getElementById("skill-tree-container");if(!e)return;const a=t.getBiWeeklyQuestProgress(),{quest:n,currentCount:o,targetCount:s,isCompleted:l,isClaimed:i}=a,d=Math.min(100,Math.round(o/s*100)),g=(Fe||[]).map(f=>{const u=t.getPerkLevel(f.id),x=f.maxLevel||1,m=u>=x,y=f.levels?f.levels.find(B=>B.level===u+1):null,v=f.levels?f.levels.find(B=>B.level===u):null,h=y?y.costSP:1,w=r>=h&&!m,k=Array.from({length:x},(B,j)=>`<div class="w-2.5 h-2.5 rounded-full ${j<u?"bg-purple-500 shadow-xs":"bg-gray-300 dark:bg-gray-700"}" title="Level ${j+1}"></div>`).join("");let E="";u===0?E=y?y.desc:"ยังไม่เคยอัปเกรด":E=v?v.desc:"";let H="";return!m&&u>0&&y&&(H=` <span class="text-purple-600 dark:text-purple-400 font-bold">(ขั้นถัดไป: ${y.desc})</span>`),`
            <div class="p-4 rounded-2xl ${u>0?"bg-purple-50/90 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800/80 shadow-xs":"bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700 shadow-xs"} flex flex-col justify-between gap-3.5 transition-all">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-start gap-3 min-w-0">
                        <span class="text-3xl p-2.5 rounded-2xl ${u>0?"bg-purple-200/80 dark:bg-purple-900/60":"bg-gray-100 dark:bg-gray-700/80"} shrink-0 shadow-inner">${f.icon}</span>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap mb-1">
                                <h4 class="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white font-kanit">${C(f.name)}</h4>
                                <span class="px-2 py-0.5 rounded-full ${m?"bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 border border-green-300/40":u>0?"bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-300/40":"bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"} text-[11px] font-bold font-mono">
                                    Lv. ${u} / ${x}
                                </span>
                            </div>
                            <p class="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                                ${C(E)}${H}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-2 pt-2.5 border-t border-gray-200/80 dark:border-gray-700/60">
                    <div class="flex items-center gap-1.5" title="ระดับขั้นทักษะ">
                        ${k}
                    </div>
                    <button data-perk-id="${f.id}" ${m||!w?"disabled":""} class="unlock-perk-btn px-4 py-1.5 rounded-xl text-xs font-black font-kanit transition-all shrink-0 ${m?"bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-300/40 cursor-default":w?"bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white cursor-pointer shadow-md hover:scale-105 active:scale-95":"bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}">
                        ${m?"สูงสุดแล้ว ✓":`อัปเกรด (ใช้ ${h} SP)`}
                    </button>
                </div>
            </div>
        `}).join("");e.innerHTML=`
        <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div class="flex items-center gap-3">
                <span class="text-2xl p-2 bg-purple-100 dark:bg-purple-950/70 rounded-2xl shrink-0">🌳</span>
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="font-extrabold text-lg text-gray-900 dark:text-white font-kanit">Perks</h3>
                        <!-- Info Button -->
                        <button id="skill-tree-info-btn" type="button" title="คู่มือ Perks" class="w-5 h-5 rounded-full border border-purple-400/60 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-serif font-bold text-xs flex items-center justify-center hover:bg-purple-600 hover:text-white transition shadow-xs cursor-pointer">
                            i
                        </button>
                        <!-- Respec / Reset SP Button -->
                        <button id="respec-sp-btn" type="button" title="รีเซ็ตแต้ม SP ทั้งหมด" class="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-500 hover:text-white text-slate-600 dark:text-slate-300 font-kanit font-bold text-xs transition border border-slate-300 dark:border-slate-600 cursor-pointer flex items-center gap-1">
                            <span>🔄</span> รีเซ็ต SP
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">สะสม SP เพื่อพัฒนาความสามารถติดตัวถาวรของผู้เรียน</p>
                </div>
            </div>
            <span class="px-4 py-1.5 rounded-full bg-purple-600 text-white text-xs sm:text-sm font-black font-mono border border-purple-400 shadow-lg">
                มี ${r} SP
            </span>
        </div>

        <!-- Bi-Weekly Quest Banner -->
        <div class="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-300/80 dark:border-amber-600/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg">🎯</span>
                    <h4 class="font-extrabold text-sm text-gray-900 dark:text-white font-kanit">${C(n.title)}</h4>
                    <span class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-300/40">ภารกิจ 2 สัปดาห์</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-300 mb-2">${C(n.desc)}</p>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden max-w-md">
                    <div class="bg-gradient-to-r from-amber-500 to-purple-600 h-full rounded-full transition-all duration-500" style="width: ${d}%"></div>
                </div>
                <div class="flex items-center justify-between text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                    <span>ความคืบหน้า: ${o} / ${s} ${n.type==="boss_damage"?"HP":n.type==="perfect_scores"||n.type==="quizzes_completed"?"ครั้ง":"ข้อ"}</span>
                    <span>รางวัล: +${n.rewardSP} SP 🎁 +${n.rewardXP||100} XP</span>
                </div>
            </div>
            <button id="claim-biweekly-btn" ${!l||i?"disabled":""} class="px-4 py-2 rounded-xl text-xs font-black font-kanit transition-all shrink-0 ${i?"bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-default":l?"bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white cursor-pointer shadow-lg animate-bounce":"bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300/40 cursor-not-allowed"}">
                ${i?"รับแล้ว ✓":l?"🎁 รับ 1 SP ฟรี!":`${o}/${s}`}
            </button>
        </div>

        <!-- Perks Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${g}
        </div>
    `;const b=e.querySelector("#skill-tree-info-btn");b&&(b.onclick=()=>yt());const c=e.querySelector("#respec-sp-btn");c&&(c.onclick=()=>{const f=t.state.allocatedSkillPoints||0;if(f<=0){$("ยังไม่ได้ใช้ SP","ยังไม่มีการใช้อัปเกรดทักษะใดๆ","ℹ️","info");return}const x=!t.state.hasUsedFreeRespec?`คุณต้องการคืนแต้ม ${f} SP ทั้งหมดเพื่อจัดสายทักษะใหม่หรือไม่?

✨ สิทธิ์รีเซ็ตฟรีครั้งแรก! (ครั้งถัดไปจะใช้ 1,000 XP)`:`คุณต้องการคืนแต้ม ${f} SP ทั้งหมดเพื่อจัดสายทักษะใหม่หรือไม่?

⚠️ การรีเซ็ตครั้งนี้จะใช้ 1,000 XP`;if(confirm(x)){const m=t.resetSkillPoints();m.success?($("รีเซ็ตทักษะสำเร็จ! 🔄",`ได้รับคืน ${m.refundedSP} SP เรียบร้อยแล้ว!`,"✨","gold"),L(t)):$("ไม่สามารถรีเซ็ตได้",m.message,"⚠️","error")}});const p=e.querySelector("#claim-biweekly-btn");p&&l&&!i&&(p.onclick=()=>{const f=t.claimBiWeeklyQuestReward();f.success&&($("รับรางวัลสำเร็จ! 🎁",`ได้รับ +1 SP และ +${f.rewardXP} XP ถาวร!`,"✨","gold"),L(t))}),e.querySelectorAll(".unlock-perk-btn").forEach(f=>{f.addEventListener("click",u=>{const x=u.currentTarget.dataset.perkId,m=u.currentTarget.getBoundingClientRect(),y=t.allocateSkillPoint(x);y.success?(_e(m.left+m.width/2,m.top+m.height/2),$("อัปเกรดทักษะสำเร็จ! 🌳",`ทักษะ "${y.perk.name}" เป็นระดับ ${y.newLevel} แล้ว!`,"✨","gold"),L(t)):$("ไม่สามารถอัปเกรดได้",y.message,"⚠️","error")})})}function vt(t){const r=document.getElementById("profile-weekly-quest-container"),e=document.getElementById("profile-monthly-quest-container");if(r){const a=t.getWeeklyQuestProgress(),{quest:n,currentCount:o,targetCount:s,isCompleted:l,isClaimed:i}=a,d=Math.min(100,Math.round(o/s*100));r.innerHTML=`
            <div class="space-y-3">
                <h4 class="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest flex items-center justify-between">
                    <span class="flex items-center gap-1.5"><span>📅</span> ภารกิจประจำสัปดาห์ (Weekly)</span>
                    <span class="text-[10px] text-gray-400 font-bold normal-case">รีเซ็ตทุกวันจันทร์</span>
                </h4>
                <div class="p-4 rounded-2xl bg-white/70 dark:bg-gray-800/80 border border-blue-200/80 dark:border-blue-800/60 shadow-sm relative overflow-hidden transition hover:shadow-md">
                    <div class="flex items-start gap-3">
                        <span class="text-3xl shrink-0 p-2 rounded-xl bg-blue-100 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/50">${n.icon||"📜"}</span>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-2 mb-0.5">
                                <h5 class="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white font-kanit truncate">${C(n.title)}</h5>
                                <span class="text-xs font-black font-mono text-yellow-600 dark:text-yellow-400 shrink-0">+${n.rewardXP} XP</span>
                            </div>
                            <p class="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-2.5">${C(n.desc)}</p>
                            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-1.5">
                                <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" style="width: ${d}%"></div>
                            </div>
                            <div class="flex items-center justify-between text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400">
                                <span>${o} / ${s}</span>
                                <button id="claim-weekly-btn" ${!l||i?"disabled":""} class="px-3 py-1 rounded-lg text-xs font-bold font-kanit transition-all ${i?"bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-default":l?"bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer shadow-md animate-bounce":"bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-300/40 cursor-not-allowed"}">
                                    ${i?"รับแล้ว ✓":l?"🎁 รับรางวัล!":`${o}/${s}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;const g=r.querySelector("#claim-weekly-btn");g&&l&&!i&&(g.onclick=()=>{const b=t.claimWeeklyQuestReward();b.success&&($("รับรางวัลสำเร็จ! 🎁",`ได้รับ +${b.rewardXP} XP ถาวร!`,"✨","gold"),L(t))})}if(e){const a=t.getMonthlyQuestProgress(),{quest:n,currentCount:o,targetCount:s,isCompleted:l,isClaimed:i}=a,d=Math.min(100,Math.round(o/s*100));e.innerHTML=`
            <div class="space-y-3">
                <h4 class="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest flex items-center justify-between">
                    <span class="flex items-center gap-1.5"><span>🗓️</span> ภารกิจประจำเดือน (Monthly)</span>
                    <span class="text-[10px] text-gray-400 font-bold normal-case">รีเซ็ตทุกวันที่ 1</span>
                </h4>
                <div class="p-4 rounded-2xl bg-white/70 dark:bg-gray-800/80 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm relative overflow-hidden transition hover:shadow-md">
                    <div class="flex items-start gap-3">
                        <span class="text-3xl shrink-0 p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/50">${n.icon||"🏆"}</span>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-2 mb-0.5">
                                <h5 class="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white font-kanit truncate">${C(n.title)}</h5>
                                <span class="text-xs font-black font-mono text-purple-600 dark:text-purple-300 shrink-0">+${n.rewardSP} SP 🎁 +${n.rewardXP} XP</span>
                            </div>
                            <p class="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-2.5">${C(n.desc)}</p>
                            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-1.5">
                                <div class="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" style="width: ${d}%"></div>
                            </div>
                            <div class="flex items-center justify-between text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400">
                                <span>${o} / ${s}</span>
                                <button id="claim-monthly-btn" ${!l||i?"disabled":""} class="px-3 py-1 rounded-lg text-xs font-bold font-kanit transition-all ${i?"bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-default":l?"bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer shadow-md animate-bounce":"bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 cursor-not-allowed"}">
                                    ${i?"รับแล้ว ✓":l?"🎁 รับรางวัล!":`${o}/${s}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;const g=e.querySelector("#claim-monthly-btn");g&&l&&!i&&(g.onclick=()=>{const b=t.claimMonthlyQuestReward();b.success&&($("รับรางวัลสำเร็จ! 🎁",`ได้รับ +${b.rewardSP} SP และ +${b.rewardXP} XP ถาวร!`,"✨","gold"),L(t))})}}function le(t){const r=document.getElementById("sync-status-wrapper"),e=document.getElementById("connection-status"),a=document.getElementById("last-sync-display");if(!r||!e)return;r.classList.remove("hidden");const n=t.authManager?.currentUser,o=navigator.onLine;if(!n)e.innerHTML=`
            <span class="w-2 h-2 rounded-full bg-gray-400"></span>
            <span class="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">Guest (Local)</span>
        `,e.className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600",a&&(a.textContent="");else if(o?(e.innerHTML=`
                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span class="text-green-700 dark:text-green-300 text-[10px] sm:text-xs">Cloud Synced</span>
            `,e.className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"):(e.innerHTML=`
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span class="text-yellow-700 dark:text-yellow-300 text-[10px] sm:text-xs">Offline</span>
            `,e.className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"),a&&re){const s=re.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"});a.textContent=`ล่าสุด: ${s}`}}function wt(t){const r=document.getElementById("recent-badges");if(!r)return;const e=t.getEarnedBadges().slice(-3).reverse();e.length===0?r.innerHTML='<span class="text-sm text-gray-400">ยังไม่มีเหรียญรางวัล</span>':r.innerHTML=e.map(a=>`
            <div class="recent-badge-item w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-xl shadow-sm border border-yellow-200 dark:border-yellow-700/50 transition-transform hover:scale-110 cursor-pointer" title="${a.name}: ${a.desc}" data-id="${a.id}">
                ${a.icon}
            </div>
        `).join("")}function kt(t){const r=new M("name-edit-modal"),e=document.getElementById("edit-name-btn"),a=document.getElementById("save-name-btn"),n=document.getElementById("new-display-name"),o=document.getElementById("name-change-current-xp"),s=50;if(e&&e.addEventListener("click",()=>{n&&(n.value=t.state.displayName||""),o&&(o.textContent=t.state.xp.toLocaleString()),a&&(t.state.freeNameChangeAvailable?(a.disabled=!1,a.innerHTML="<span>บันทึก (ฟรี 1 ครั้ง)</span>",a.classList.remove("opacity-50","cursor-not-allowed","bg-gray-400"),a.classList.add("bg-blue-600","hover:bg-blue-700")):t.state.xp<s?(a.disabled=!0,a.innerHTML=`<span>ต้องการ ${s} XP</span>`,a.classList.add("opacity-50","cursor-not-allowed","bg-gray-400"),a.classList.remove("bg-blue-600","hover:bg-blue-700")):(a.disabled=!1,a.innerHTML=`<span>บันทึก (ใช้ ${s} XP)</span>`,a.classList.remove("opacity-50","cursor-not-allowed","bg-gray-400"),a.classList.add("bg-blue-600","hover:bg-blue-700"))),r.open(),setTimeout(()=>n?.focus(),100)}),a&&n){const l=()=>{const i=t.state.freeNameChangeAvailable;if(!i&&t.state.xp<s){$("XP ไม่พอ",`คุณต้องการ ${s} XP เพื่อเปลี่ยนชื่อ`,"⚠️","error");return}const d=n.value.trim();if(d){let g="";i?(t.state.freeNameChangeAvailable=!1,g="เปลี่ยนชื่อเรียบร้อยแล้ว (ฟรี)",t.setDisplayName(d),L(t),r.close(),$("บันทึกสำเร็จ",g,"✏️")):t.spendXP(s)?(g=`เปลี่ยนชื่อเรียบร้อยแล้ว (-${s} XP)`,t.setDisplayName(d),L(t),r.close(),$("บันทึกสำเร็จ",g,"✏️")):$("ข้อผิดพลาด","XP ไม่เพียงพอ","❌","error")}else $("ข้อผิดพลาด","กรุณาระบุชื่อ","⚠️","error")};a.addEventListener("click",l),n.addEventListener("keydown",i=>{i.key==="Enter"&&l()})}}function $t(t){const r=document.getElementById("reset-gamification-btn");if(!r)return;const e=new M("confirm-action-modal"),a=document.getElementById("confirm-modal-title"),n=document.getElementById("confirm-modal-description");r.addEventListener("click",()=>{a&&(a.textContent="รีเซ็ตข้อมูลความคืบหน้า?"),n&&(n.innerHTML='คุณแน่ใจหรือไม่ที่จะลบข้อมูลเลเวล, XP, และเหรียญรางวัลทั้งหมด? <br><strong class="text-red-600 dark:text-red-500">การกระทำนี้ไม่สามารถย้อนกลับได้</strong>');const o=document.getElementById("confirm-action-btn");if(!o)return;const s=o.cloneNode(!0);o.parentNode.replaceChild(s,o),s.addEventListener("click",()=>{t.resetProgress(),Object.keys(localStorage).forEach(l=>{l.startsWith("quizState-")&&localStorage.removeItem(l)}),e.close(),window.location.reload()}),e.open()})}function Ct(t){const r=document.getElementById("recalculate-xp-btn");r&&r.addEventListener("click",()=>{const e=r.querySelector("svg");e&&e.classList.add("animate-spin"),r.disabled=!0,r.classList.add("opacity-75","cursor-not-allowed"),setTimeout(()=>{try{const a=t.recalculateFromHistory();L(t),ie(t),$("คำนวณใหม่สำเร็จ",`คะแนนของคุณคือ ${a.totalXP.toLocaleString()} XP จาก ${a.completed} แบบทดสอบ`,"✅")}catch(a){console.error(a),$("เกิดข้อผิดพลาด","ไม่สามารถคำนวณคะแนนใหม่ได้","❌","error")}finally{e&&e.classList.remove("animate-spin"),r.disabled=!1,r.classList.remove("opacity-75","cursor-not-allowed")}},500)})}function Et(t){const r=document.getElementById("refresh-charts-btn");r&&r.addEventListener("click",async()=>{const e=r.querySelector("svg");e&&e.classList.add("animate-spin"),document.getElementById("radar-chart-loader")?.classList.remove("hidden"),document.getElementById("history-chart-loader")?.classList.remove("hidden"),document.getElementById("strengths-weaknesses-loader")?.classList.remove("hidden");const a=await Q(),[n,o,s]=await Promise.all([P(t,a),W(t,a),de(a)]);n&&o&&s&&r.classList.add("hidden"),e&&e.classList.remove("animate-spin"),$("อัปเดตข้อมูล","โหลดข้อมูลกราฟล่าสุดเรียบร้อยแล้ว","🔄")})}function Lt(t){const r=document.getElementById("manual-sync-btn");r&&r.addEventListener("click",async()=>{const e=r.querySelector("svg");e&&e.classList.add("animate-spin"),r.disabled=!0,r.classList.add("opacity-50","cursor-not-allowed");try{await t.forceCloudSync()?(re=new Date,le(t),$("ซิงค์ข้อมูลสำเร็จ","ข้อมูลล่าสุดถูกโหลดเรียบร้อยแล้ว","☁️")):t.authManager.currentUser?$("ซิงค์ไม่สำเร็จ","ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้","⚠️","error"):$("ไม่ได้เข้าสู่ระบบ","ระบบบันทึกข้อมูลในเครื่อง (Local) เท่านั้น","💻")}catch(a){console.error(a),$("ข้อผิดพลาด","เกิดข้อผิดพลาดในการซิงค์","❌","error")}finally{e&&e.classList.remove("animate-spin"),r.disabled=!1,r.classList.remove("opacity-50","cursor-not-allowed")}})}function St(t){const r=document.getElementById("leaderboard-list"),e=document.querySelectorAll(".leaderboard-tab");if(!r)return;const a=async n=>{r.innerHTML=`
            <div class="flex flex-col items-center justify-center h-40 text-gray-500">
                <svg class="animate-spin h-6 w-6 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>กำลังโหลดอันดับ...</span>
            </div>
        `;try{const o=We(Ke,"users"),s=be(o,Ge(n,"desc"),Ye(10)),l=await t.authManager.retryOperation(()=>Je(s)),i=[];if(l.forEach(m=>{i.push({id:m.id,...m.data()})}),i.length===0){r.innerHTML='<div class="text-center py-8 text-gray-500">ยังไม่มีข้อมูลการจัดอันดับ</div>';return}const d=t.authManager?.currentUser,g=d?d.uid:null,b=i.some(m=>m.id===g);let c=null;if(!b&&g)try{const m=t.state[n]||0,y=`cached_rank_${n}_${g}`,v=localStorage.getItem(y);let h=null;if(v)try{h=JSON.parse(v)}catch{}const w=h?.isFailure?14400*1e3:300*1e3;let k=null;if(h&&h.score===m&&Date.now()-h.timestamp<w)k=h.rank;else{const E=be(o,Ve(n,">",m));k=(await t.authManager.retryOperation(()=>Ze(E))).data().count+1,localStorage.setItem(y,JSON.stringify({rank:k,score:m,timestamp:Date.now()}))}c={rank:k,id:g,displayName:t.state.displayName,avatar:t.state.avatar,selectedTitle:t.state.selectedTitle,score:m,isMe:!0,level:t.state.level}}catch(m){if(m.code==="resource-exhausted"||m?.message?.includes("Quota")||m?.message?.includes("exceeded")){console.debug("Leaderboard rank fetch quota exceeded (falling back to cached/50+)");const y=`cached_rank_${n}_${g}`,v=localStorage.getItem(y),h=v?JSON.parse(v).rank:"50+";localStorage.setItem(y,JSON.stringify({rank:h,score:t.state[n]||0,timestamp:Date.now(),isFailure:!0})),c={rank:h,id:g,displayName:t.state.displayName,avatar:t.state.avatar,selectedTitle:t.state.selectedTitle,score:t.state[n]||0,isMe:!0,level:t.state.level}}else console.warn("Failed to fetch user rank:",m)}const p=(m,y)=>{try{const v=new Date().toDateString(),h=`leaderboard_anchor_${m}_${g}`,w=localStorage.getItem(h);if(w){const k=JSON.parse(w);if(k.date===v)return k.rank}return localStorage.setItem(h,JSON.stringify({date:v,rank:y})),y}catch(v){return console.warn("Rank anchor error:",v),y}};let f="";if(b||c){const m=b?i.findIndex(h=>h.id===g)+1:c.rank,v=p(n,m)-m;v>0?f=`<span class="text-[10px] sm:text-xs font-bold text-green-500 flex items-center gap-0.5" title="อันดับขึ้น ${v} อันดับจากเมื่อเช้า">▲ ${v}</span>`:v<0?f=`<span class="text-[10px] sm:text-xs font-bold text-red-500 flex items-center gap-0.5" title="อันดับลง ${Math.abs(v)} อันดับจากเมื่อเช้า">▼ ${Math.abs(v)}</span>`:f='<span class="text-[10px] sm:text-xs font-bold text-gray-300 dark:text-gray-600" title="อันดับคงที่">-</span>'}const u=(m,y,v)=>{let h=`<span class="font-bold text-gray-500 w-6 text-center text-sm sm:text-base">${y}</span>`;y===1&&(h='<span class="text-xl sm:text-2xl">🥇</span>'),y===2&&(h='<span class="text-xl sm:text-2xl">🥈</span>'),y===3&&(h='<span class="text-xl sm:text-2xl">🥉</span>');let w=v&&m.score!==void 0?m.score:m[n]||0;if(w===0&&n.includes("TrackXP")){let S=0,N="overall";const K=te.categories.find(O=>O.id===n);if(K&&K.track&&(N=K.track),N!=="overall"){for(const O of Object.values(A))O.track===N&&(S+=m[O.field]||0);S>w&&(w=S)}}const k=w.toLocaleString();let E="overall";const H=te.categories.find(S=>S.id===n);H&&H.track&&(E=H.track);let B=1,j="ผู้เริ่มต้น";if(E==="overall"){B=m.level||1;const S=Qe.overall,N=Math.min(Math.max(0,B-1),S.length-1);j=S[N]}else{const S=t.getLevelInfo(w,E);B=S.level,j=S.title}const z=m.avatar||"🧑‍🎓",je=z.includes("/")||z.includes(".")?`<img src="${z}" class="w-full h-full rounded-full object-cover">`:`<span class="text-2xl sm:text-3xl">${z}</span>`,ze=Ce(B),De=ce(z,"small"),Ne=`
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0.5 shadow-md ${ze}">
                        <div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden ${De}">
                            ${je}
                        </div>
                    </div>
                `;return`
                    <div onclick="window.openProfileModal(this)" data-user='${JSON.stringify(m).replace(/'/g,"&#39;")}' class="cursor-pointer flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg ${v?"bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-md hover:scale-[1.02] z-10 relative":"hover:bg-gray-50 dark:hover:bg-gray-700/30"} transition-all duration-200">
                        <div class="flex items-center justify-center w-6 sm:w-8 flex-shrink-0">
                            ${h}
                        </div>
                    <div class="flex-shrink-0 relative">
                            ${Ne}
                        </div>
                        <div class="flex-grow min-w-0 flex flex-col justify-center">
                            <div class="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate flex items-center gap-2">
                                ${m.displayName||"ผู้เรียน"} 
                                ${v?`<span class="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded-md">(คุณ)</span> ${f}`:""}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-tight">
                                <span class="text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">${j}</span>
                                ${m.selectedTitle?`<span class="hidden sm:inline text-gray-300 dark:text-gray-600">•</span> <span class="truncate max-w-[100px] sm:max-w-none">《 ${m.selectedTitle} 》</span>`:""}
                            </div>
                        </div>
                        <div class="flex-shrink-0 text-right">
                            <div class="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base">
                                ${k}
                            </div>
                            <div class="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium uppercase">XP</div>
                        </div>
                    </div>
                `};window.openProfileModal=m=>{try{const y=JSON.parse(m.dataset.user);Xe(y)}catch(y){console.error("Error opening profile",y)}};let x=i.map((m,y)=>u(m,y+1,m.id===g)).join("");c&&(x+=`
                    <div class="flex items-center justify-center py-1 opacity-50">
                        <div class="h-1 w-1 bg-gray-400 rounded-full mx-0.5"></div>
                        <div class="h-1 w-1 bg-gray-400 rounded-full mx-0.5"></div>
                        <div class="h-1 w-1 bg-gray-400 rounded-full mx-0.5"></div>
                    </div>
                    ${u(c,c.rank,!0)}
                `),x+=`
                <div class="mt-3 text-center">
                    <a href="./leaderboard.html" class="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        ดูอันดับทั้งหมด &rarr;
                    </a>
                </div>
            `,r.innerHTML=x}catch(o){console.error("Leaderboard error:",o),r.innerHTML='<div class="text-center py-8 text-red-500 text-sm">ไม่สามารถโหลดข้อมูลได้<br>(ต้องเชื่อมต่ออินเทอร์เน็ต)</div>'}};e.forEach(n=>{n.addEventListener("click",()=>{e.forEach(o=>o.className="leaderboard-tab flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"),n.className="leaderboard-tab flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300",a(n.dataset.type)})}),a("xp")}function Bt(){const t=document.getElementById("goto-shop-btn"),r=document.getElementById("shop-section"),e=document.getElementById("shop-content"),a=e?.previousElementSibling;!t||!r||!e||!a||t.addEventListener("click",n=>{if(n.preventDefault(),e.style.maxHeight==="0px"){const s=a.querySelector(".chevron-icon");e.style.maxHeight=e.scrollHeight+"px",e.style.opacity="1",s&&s.classList.remove("-rotate-90");const l=()=>{e.style.opacity==="1"&&(e.style.maxHeight="none",e.style.overflow="visible"),e.removeEventListener("transitionend",l)};e.addEventListener("transitionend",l)}setTimeout(()=>{r.scrollIntoView({behavior:"smooth",block:"start"}),r.classList.add("ring-4","ring-yellow-400","scale-[1.02]","z-10"),setTimeout(()=>{r.classList.remove("ring-4","ring-yellow-400","scale-[1.02]","z-10")},1500)},50)})}function It(){const t=document.querySelectorAll(".collapsible-header"),r=document.getElementById("expand-all-btn"),e=document.getElementById("collapse-all-btn"),a=(n,o=null)=>{const s=n.dataset.target,l=document.getElementById(s),i=n.querySelector(".chevron-icon");if(!l||!i)return;const d=l.style.maxHeight==="0px";if(o!==null?o:d){l.style.maxHeight=l.scrollHeight+"px",l.style.opacity="1",i.classList.remove("-rotate-90");const b=()=>{l.style.opacity==="1"&&(l.style.maxHeight="none",l.style.overflow="visible"),l.removeEventListener("transitionend",b)};l.addEventListener("transitionend",b)}else l.style.maxHeight==="none"&&(l.style.maxHeight=l.scrollHeight+"px",l.style.overflow="hidden"),l.offsetHeight,l.style.maxHeight="0px",l.style.opacity="0",i.classList.add("-rotate-90")};t.forEach(n=>{n.addEventListener("click",o=>{o.target.closest("button")||o.target.closest("a")||a(n)})}),r&&r.addEventListener("click",()=>{t.forEach(n=>a(n,!0))}),e&&e.addEventListener("click",()=>{t.forEach(n=>a(n,!1))})}function Tt(t){const r=new M("avatar-modal"),e=document.getElementById("edit-avatar-btn"),a=document.getElementById("profile-avatar-display"),n=document.getElementById("avatar-grid"),o=()=>{n&&he(t,n),r.open()};e&&e.addEventListener("click",o),a&&a.addEventListener("click",o),n&&(he(t,n),n.addEventListener("click",s=>{const l=s.target.closest(".avatar-option");if(l){const i=l.dataset.avatar;t.setAvatar(i),L(t);const d=new Audio("./assets/audio/correct.mp3");d.volume=.5,d.play().catch(()=>{}),r.close(),$("บันทึกสำเร็จ","เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว","😎"),n.querySelectorAll(".avatar-option").forEach(g=>{g.classList.remove("bg-blue-100","dark:bg-blue-900/50","ring-2","ring-blue-500")}),l.classList.add("bg-blue-100","dark:bg-blue-900/50","ring-2","ring-blue-500")}}))}function he(t,r){const e=t.getInventory?t.getInventory()||[]:[],a=T.filter(s=>s.type==="avatar"&&e.includes(s.id)).map(s=>s.value),n=[...gt,...a],o=[...new Set(n)];r.innerHTML=o.map(s=>{const i=s.includes("/")||s.includes(".")?`<img src="${C(s)}" alt="Avatar" class="w-8 h-8 rounded-full object-cover mx-auto">`:C(s),d=T.find(p=>p.value===s&&p.type==="avatar"),g=t.state.avatar===s;let c=`avatar-option text-3xl p-2 rounded-full transition-all relative group ${ce(s)}`;return g?c+=" bg-blue-100 dark:bg-blue-900/50 scale-110 z-10":c+=" hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700",`
        <button class="${c}" data-avatar="${s}" title="${d?d.name:""}">
            ${i}
        </button>
    `}).join("")}function Mt(t){const r=new M("title-modal"),e=document.getElementById("edit-title-btn"),a=document.getElementById("title-grid");e&&e.addEventListener("click",()=>{Pt(t,a,r),r.open()})}function Pt(t,r,e){if(!r)return;const a=t.state.unlockedAchievements||[],n=ue.filter(d=>a.includes(d.id)&&d.rewardTitle).map(d=>d.rewardTitle),o=t.getInventory(),s=T.filter(d=>d.type==="title"&&o.includes(d.id)).map(d=>d.value),l=[...new Set([...n,...s])];let i=`
        <button class="title-option w-full text-left p-3 rounded-lg border transition-colors ${t.state.selectedTitle?"border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700":"bg-blue-100 border-blue-500 dark:bg-blue-900/50"}" data-title="">
            <span class="font-bold text-gray-600 dark:text-gray-400">ไม่ใส่ฉายา</span>
        </button>
    `;l.forEach(d=>{const b=t.state.selectedTitle===d?"bg-blue-100 border-blue-500 dark:bg-blue-900/50":"border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700";i+=`
            <button class="title-option w-full text-left p-3 rounded-lg border transition-colors ${b}" data-title="${d}">
                <span class="font-bold text-gray-800 dark:text-gray-200">《 ${d} 》</span>
            </button>
        `}),l.length===0&&(i+='<p class="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">ปลดล็อกความสำเร็จเพื่อรับฉายาใหม่!</p>'),r.innerHTML=i,r.querySelectorAll(".title-option").forEach(d=>{d.addEventListener("click",()=>{const g=d.dataset.title;t.equipTitle(g||null),L(t),e.close(),$("บันทึกสำเร็จ",g?`เลือกฉายา "${g}" แล้ว`:"ลบฉายาแล้ว","🏷️")})})}function Ht(t){const r=new M("theme-modal"),e=document.getElementById("edit-theme-btn"),a=document.getElementById("theme-grid");e&&e.addEventListener("click",()=>{At(t,a,r),r.open()})}function At(t,r,e){if(!r)return;const a=t.getInventory(),n=T.filter(s=>s.type==="theme"&&a.includes(s.id));let o=`
        <button class="theme-option w-full text-left p-3 rounded-lg border transition-colors ${t.state.selectedTheme?"border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700":"bg-blue-100 border-blue-500 dark:bg-blue-900/50"}" data-theme="">
            <span class="font-bold text-gray-800 dark:text-gray-200">🎨 ค่าเริ่มต้น (Default)</span>
        </button>
    `;n.forEach(s=>{const i=t.state.selectedTheme===s.value?"bg-blue-100 border-blue-500 dark:bg-blue-900/50":"border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700";o+=`
            <button class="theme-option w-full text-left p-3 rounded-lg border transition-colors ${i}" data-theme="${s.value}">
                <span class="font-bold text-gray-800 dark:text-gray-200">${s.icon} ${s.name}</span>
            </button>
        `}),r.innerHTML=o,r.querySelectorAll(".theme-option").forEach(s=>{s.addEventListener("click",()=>{const l=s.dataset.theme;t.equipTheme(l||null),L(t),e.close(),$("บันทึกสำเร็จ","เปลี่ยนธีมเรียบร้อยแล้ว","🎨")})})}function _t(t){const r=new M("shop-details-modal"),e=document.getElementById("shop-items-grid"),a=document.getElementById("shop-modal-buy-btn"),n=document.getElementById("shop-modal-icon"),o=document.getElementById("shop-modal-title"),s=document.getElementById("shop-modal-type"),l=document.getElementById("shop-modal-desc"),i=document.getElementById("shop-modal-status");let d=null;e&&e.addEventListener("click",g=>{const b=g.target.closest(".shop-item-card");if(b){const c=b.dataset.id,p=T.find(f=>f.id===c);if(p){d=c,n&&(n.textContent=p.icon),o&&(o.textContent=p.name),s&&(s.textContent=p.type==="avatar"?"Avatar":p.type==="theme"?"Theme":"Title"),l&&(p.type==="theme"?l.innerHTML=`<span>${p.desc}</span>
                            <div class="mt-4 text-left text-xs sm:text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                <span class="font-bold block mb-1 text-gray-700 dark:text-gray-200">สิ่งที่เปลี่ยนแปลง:</span>
                                <ul class="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400">
                                    <li>สีหลักของปุ่มและไอคอน</li>
                                    <li>สีพื้นหลังและส่วนหัว (Header)</li>
                                    <li>สีไฮไลท์ข้อความและ Scrollbar</li>
                                    <li>เอฟเฟกต์เงาและการไล่ระดับสี</li>
                                </ul>
                            </div>`:l.textContent=p.desc);const u=t.getInventory().includes(p.id),x=t.state.xp>=p.cost,m=p.type==="consumable",y=m?t.getItemCount(p.id):0;u&&!m?(a.disabled=!0,a.className="w-full py-3 rounded-xl text-white font-bold text-lg shadow-md bg-gray-400 cursor-not-allowed",a.innerHTML="<span>เป็นเจ้าของแล้ว</span>",i.textContent="คุณมีสินค้านี้แล้ว",i.className="mt-2 text-sm font-medium text-green-600 dark:text-green-400",i.classList.remove("hidden")):x?(a.disabled=!1,a.className="w-full py-3 rounded-xl text-white font-bold text-lg shadow-md transition-transform transform hover:scale-105 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700",a.innerHTML=`<span>ยืนยันการแลก</span> <span class="bg-white/20 px-2 py-0.5 rounded text-sm">${p.cost} XP</span>`,m?(i.textContent=`คุณมีอยู่แล้ว: ${y} ชิ้น`,i.className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400",i.classList.remove("hidden")):i.classList.add("hidden")):(a.disabled=!0,a.className="w-full py-3 rounded-xl text-white font-bold text-lg shadow-md bg-gray-400 cursor-not-allowed",a.innerHTML=`<span>XP ไม่พอ (${p.cost} XP)</span>`,i.textContent=`ต้องการอีก ${p.cost-t.state.xp} XP`,i.className="mt-2 text-sm font-medium text-red-500",i.classList.remove("hidden")),r.open()}}}),a&&a.addEventListener("click",()=>{if(!d)return;const g=t.buyItem(d);if(g.success){$("ซื้อสำเร็จ",g.message,"🛒");const b=new Audio("./assets/audio/badge-unlock.mp3");b.volume=.7,b.play().catch(()=>{});const c=T.find(f=>f.id===d),p=document.getElementById("shop-modal-icon");if(c&&p){const f=p.getBoundingClientRect(),u=f.left+f.width/2,x=f.top+f.height/2;_e(u,x),Ut(c.icon,p)}L(t),U(t),r.close()}else $("ซื้อไม่สำเร็จ",g.message,"❌","error")})}function U(t){const r=document.getElementById("shop-items-grid");if(!r)return;r.className="flex flex-col gap-6";const e=t.getInventory(),a=[{type:"consumable",label:"ไอเทมตัวช่วย",icon:"⚡",desc:"ตัวช่วยเพิ่มประสิทธิภาพการทำแบบทดสอบ"},{type:"avatar",label:"อวตารโปรไฟล์",icon:"👤",desc:"เปลี่ยนกรอบรูปโปรไฟล์ระดับพิเศษ"},{type:"theme",label:"ธีมสีพรีเมียม",icon:"🎨",desc:"เปลี่ยนธีมสีบรรยากาศเว็บไซต์"},{type:"title",label:"ฉายายศพิเศษ",icon:"🏷️",desc:"ฉายาแสดงความเก่งต่อท้ายชื่อ"}],n=`
        <div class="flex space-x-3 overflow-x-auto p-1.5 no-scrollbar select-none" role="tablist">
            ${a.map(i=>{const d=i.type===V;return`
                    <button 
                        class="shop-tab-btn flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl transition-all duration-200 cursor-pointer ${d?"bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400 dark:ring-blue-500 font-extrabold transform scale-105":"bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700 font-bold"}"
                        data-type="${i.type}"
                        role="tab"
                        aria-selected="${d}"
                    >
                        <span class="text-xl filter drop-shadow-xs">${i.icon}</span>
                        <span class="text-xs sm:text-sm font-kanit whitespace-nowrap">${i.label}</span>
                    </button>
                `}).join("")}
        </div>
    `,o=a.find(i=>i.type===V)||a[0],s=T.filter(i=>i.type===o.type);let l="";if(s.length===0)l=`
            <div class="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <span class="text-5xl mb-3 opacity-40">🛒</span>
                <p class="font-bold text-sm font-kanit">ไม่มีสินค้าในหมวดหมู่นี้</p>
            </div>`;else{const i=s.map(d=>{const g=e.includes(d.id),b=t.state.xp>=d.cost,c=d.type==="consumable",p=c?t.getItemCount(d.id):0;let f="",u="border-gray-200/90 dark:border-gray-700/80",x="";d.cost>=500?x="hover:shadow-purple-500/20 hover:border-purple-400/80":d.cost>=200&&(x="hover:shadow-blue-500/20 hover:border-blue-400/80"),g&&!c?(f='<span class="absolute top-3 right-3 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">ครอบครองแล้ว ✓</span>',u="border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20"):c&&p>0&&(f=`<span class="absolute top-3 right-3 bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-blue-500/30">มี ${p} ชิ้น</span>`);const m=g&&!c?'<span class="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg> ได้รับแล้ว</span>':`<div class="flex items-center gap-1.5 ${b?"text-yellow-600 dark:text-yellow-400 bg-yellow-100/80 dark:bg-yellow-950/60 border border-yellow-300/50":"text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40"} font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-xs">
                     <span>🪙 ${d.cost.toLocaleString()}</span> <span class="text-[10px] opacity-80">XP</span>
                   </div>`;return`
                <div class="shop-item-card relative bg-white/90 dark:bg-gray-800/90 p-5 rounded-3xl border ${u} shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center h-full ${x}" data-id="${d.id}">
                    ${f}
                    <div class="w-20 h-20 mb-3 mt-1 rounded-2xl bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 relative overflow-hidden border border-gray-200/60 dark:border-gray-700/60">
                        <div class="text-5xl transform group-hover:rotate-6 transition-transform duration-300 filter drop-shadow-md relative z-10">${d.icon}</div>
                    </div>
                    <h4 class="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base w-full truncate px-1 mb-1.5 font-kanit">${C(d.name)}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-2 mb-4 h-9 leading-relaxed w-full">${C(d.desc)}</p>
                    <div class="mt-auto w-full flex justify-center">
                        ${m}
                    </div>
                </div>
            `}).join("");l=`
            <div class="anim-fade-in space-y-4">
                <div class="px-1 flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 font-kanit tracking-wide">
                            ${o.label}
                        </h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">${o.desc}</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-2">
                    ${i}
                </div>
            </div>
        `}r.innerHTML=n+l,r.querySelectorAll(".shop-tab-btn").forEach(i=>{i.addEventListener("click",()=>{V=i.dataset.type,U(t)})})}function ie(t){const r=document.getElementById("track-progress-container");if(!r)return;const e=(o,s,l,i)=>`
        <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    ${i} ${o}
                </span>
                <span class="text-xs font-bold text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">Lv.${s.level}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div class="${l} h-2.5 rounded-full transition-all duration-1000 relative" style="width: ${s.progressPercent}%">
                </div>
            </div>
            <div class="flex justify-between text-xs mt-1.5 text-gray-500 dark:text-gray-400">
                <span class="font-medium">${s.title}</span>
                <span>${s.currentXP.toLocaleString()} / ${s.nextLevelXP?s.nextLevelXP.toLocaleString():"MAX"} XP</span>
            </div>
        </div>
    `,a=["bg-purple-500","bg-teal-500","bg-blue-500","bg-orange-500","bg-pink-500"],n=["🔭","🌍","⚛️","🧪","🧬"];r.innerHTML=te.categories.map((o,s)=>{const l=t.state[o.id]||0,i=t.getLevelInfo(l,o.track),d=a[s%a.length],g=n[s%n.length];return e(o.label,i,d,g)}).join("")}function He(t){const r=document.getElementById("profile-badges-grid");if(!r)return;const e=t.state.badges;r.innerHTML=Ee.map(a=>{const n=e.includes(a.id),o=n?null:jt(t,a.id);let s="badge-card relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group cursor-pointer overflow-hidden aspect-square",l="text-4xl sm:text-5xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",i="text-[9px] sm:text-xs font-bold text-center w-full px-1 z-10 transition-colors leading-tight break-words",d="",g="",b="",c="text-gray-700 dark:text-gray-300";n?(a.tier==="gold"?(d="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/10",g="border-2 border-yellow-400 dark:border-yellow-600",b="shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40",c="text-yellow-800 dark:text-yellow-200"):a.tier==="silver"?(d="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-800",g="border-2 border-slate-300 dark:border-slate-500",b="shadow-lg shadow-slate-500/20 hover:shadow-slate-500/40",c="text-slate-700 dark:text-slate-300"):(d="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10",g="border-2 border-orange-300 dark:border-orange-600",b="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40",c="text-orange-800 dark:text-orange-200"),s+=` ${d} ${g} ${b} hover:-translate-y-1`):(s+=" bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100",l+=" grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-70",c="text-gray-400 dark:text-gray-500");let p="";return n?p=`
                <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full transition-transform ease-in-out" style="transition-duration: 0.7s;"></div>
            `:o?p=`
                    <div class="absolute inset-x-0 bottom-0 h-1 bg-gray-200 dark:bg-gray-700">
                        <div class="h-full bg-blue-500 transition-all duration-500" style="width: ${Math.min(100,Math.max(0,o.current/o.target*100))}%"></div>
                    </div>
                `:p=`
                    <div class="absolute top-2 right-2 text-gray-300 dark:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                `,`
            <div class="${s}" data-id="${a.id}">
                <div class="${l}">${a.icon}</div>
                <div class="${i} ${c}">${a.name}</div>
                ${p}
                
                <!-- Tooltip -->
                <div class="absolute bottom-full mb-3 hidden group-hover:block w-48 p-3 bg-gray-900/95 dark:bg-gray-800/95 text-white text-xs rounded-xl shadow-xl z-50 text-center pointer-events-none backdrop-blur-sm border border-gray-700 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                    <div class="font-bold text-${a.tier==="gold"?"yellow-400":a.tier==="silver"?"slate-300":"orange-300"} mb-1 text-sm">${a.name}</div>
                    <div class="text-gray-300 leading-relaxed mb-2">${a.desc}</div>
                    ${o&&!n?`
                        <div class="pt-2 border-t border-gray-700/50">
                            <div class="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>ความคืบหน้า</span>
                                <span class="font-mono">${o.current}/${o.target} ${o.label}</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${o.current/o.target*100}%"></div>
                            </div>
                        </div>
                    `:""}
                    ${n?'<div class="mt-1 text-[10px] text-green-400 font-bold">✓ ได้รับแล้ว</div>':""}
                    <!-- Arrow -->
                    <div class="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900/95 dark:bg-gray-800/95 rotate-45 border-r border-b border-gray-700"></div>
                </div>
            </div>
        `}).join("")}function jt(t,r){const e=t.state;switch(r){case"first_quiz":return{current:e.quizzesCompleted,target:1,label:""};case"perfect_score":return{current:e.perfectScores>0?1:0,target:1,label:""};case"streak_3":return{current:e.streak,target:3,label:"วัน"};case"streak_7":return{current:e.streak,target:7,label:"วัน"};case"streak_14":return{current:e.streak,target:14,label:"วัน"};case"streak_30":return{current:e.streak,target:30,label:"วัน"};case"streak_60":return{current:e.streak,target:60,label:"วัน"};case"quiz_master_5":return{current:e.quizzesCompleted,target:5,label:"ครั้ง"};case"quiz_master_10":return{current:e.quizzesCompleted,target:10,label:"ครั้ง"};case"quiz_master_25":return{current:e.quizzesCompleted,target:25,label:"ครั้ง"};case"quiz_master_50":return{current:e.quizzesCompleted,target:50,label:"ครั้ง"};case"quiz_master_100":return{current:e.quizzesCompleted,target:100,label:"ครั้ง"};case"high_scorer_3":return{current:e.highScores80||0,target:3,label:"ครั้ง"};case"high_scorer_5":return{current:e.highScores80||0,target:5,label:"ครั้ง"};case"high_scorer_10":return{current:e.highScores80||0,target:10,label:"ครั้ง"};case"perfect_scorer_3":return{current:e.perfectScores||0,target:3,label:"ครั้ง"};case"perfect_scorer_5":return{current:e.perfectScores||0,target:5,label:"ครั้ง"};case"earth_lover":return{current:t.getEarthLevel().level,target:3,label:"Lv"};case"earth_expert":return{current:t.getEarthLevel().level,target:5,label:"Lv"};case"earth_master":return{current:t.getEarthLevel().level,target:10,label:"Lv"};case"physics_lover":return{current:t.getPhysicsLevel().level,target:3,label:"Lv"};case"physics_expert":return{current:t.getPhysicsLevel().level,target:5,label:"Lv"};case"physics_master":return{current:t.getPhysicsLevel().level,target:10,label:"Lv"};case"xp_5k":return{current:e.xp,target:5e3,label:"XP"};case"xp_10k":return{current:e.xp,target:1e4,label:"XP"};case"shop_spender":return{current:t.getInventory().length,target:5,label:"ชิ้น"};case"dual_expert":const a=t.getPhysicsLevel().level,n=t.getEarthLevel().level;return{current:Math.min(a,n),target:5,label:"Lv (Min)"};case"weekend_learner_3":return{current:e.weekendQuizzesCompleted||0,target:3,label:"ครั้ง"};case"weekend_learner_5":return{current:e.weekendQuizzesCompleted||0,target:5,label:"ครั้ง"};case"weekend_learner_10":return{current:e.weekendQuizzesCompleted||0,target:10,label:"ครั้ง"};case"weekend_learner_15":return{current:e.weekendQuizzesCompleted||0,target:15,label:"ครั้ง"};case"marathon_runner":return{current:e.badges.includes("marathon_runner")?1:0,target:1,label:""};default:return null}}function zt(t){const r=document.getElementById("profile-badges-grid"),e=document.getElementById("recent-badges"),a=new M("badge-details-modal"),n=o=>{const s=o.target.closest(".badge-card, .recent-badge-item");if(s&&s.dataset.id){const l=s.dataset.id,i=Ee.find(d=>d.id===l);if(i){const d=t.state.badges.includes(l),g=document.getElementById("badge-modal-icon"),b=document.getElementById("badge-modal-name"),c=document.getElementById("badge-modal-desc"),p=document.getElementById("badge-modal-status");g&&(g.textContent=i.icon,d?g.classList.remove("grayscale","opacity-50"):g.classList.add("grayscale","opacity-50"),g.classList.remove("anim-item-pop"),g.offsetWidth,g.classList.add("anim-item-pop")),b&&(b.textContent=i.name),c&&(c.textContent=i.desc),p&&(d?p.innerHTML='<span class="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-bold">ได้รับแล้ว</span>':p.innerHTML='<span class="px-3 py-1 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-sm font-bold">ยังไม่ได้รับ</span>'),a.open()}}};r&&r.addEventListener("click",n),e&&e.addEventListener("click",n)}function Ae(t){const r=document.getElementById("profile-achievements-list");if(!r)return;const e=t.state.unlockedAchievements||[];r.innerHTML=ue.map(a=>{const n=e.includes(a.id);let o=0;a.type==="level"?o=t.getCurrentLevel().level:a.type==="total_correct"?o=t.state.totalCorrectAnswers||0:a.type==="total_quizzes"?o=t.state.quizzesCompleted||0:a.type==="total_items"?o=t.getInventory().length:a.type==="total_avatars"?o=t.getInventory().filter(x=>{const m=T.find(y=>y.id===x);return m&&m.type==="avatar"}).length:a.type==="high_scores_80"?o=t.state.highScores80||0:a.type==="perfect_scores"?o=t.state.perfectScores||0:a.type==="theory_xp"?o=t.state.theoryXP||0:a.type==="calculation_xp"?o=t.state.calculationXP||0:a.type==="item_usage"?o=t.state.itemUsageCount||0:a.type==="total_xp"&&(o=t.state.xp||0);const s=Math.min(100,Math.max(0,o/a.target*100));let l="achievement-card relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 group cursor-pointer overflow-hidden aspect-square",i="text-4xl sm:text-5xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",d="text-[9px] sm:text-xs font-bold text-center w-full px-1 z-10 transition-colors leading-tight break-words",g="",b="",c="",p="text-gray-700 dark:text-gray-300";n?(g="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/10",b="border-2 border-purple-300 dark:border-purple-600",c="shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40",p="text-purple-800 dark:text-purple-200",l+=` ${g} ${b} ${c} hover:-translate-y-1`):(l+=" bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100",i+=" grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-70",p="text-gray-400 dark:text-gray-500");let f="";return n?f=`
                <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -translate-x-full group-hover:translate-x-full transition-transform ease-in-out" style="transition-duration: 0.7s;"></div>
            `:f=`
                <div class="absolute inset-x-0 bottom-0 h-1 bg-gray-200 dark:bg-gray-700">
                    <div class="h-full bg-blue-500 transition-all duration-500" style="width: ${s}%"></div>
                </div>
            `,`
            <div class="${l}" data-id="${a.id}" title="${a.title}">
                <div class="${i}">${a.icon}</div>
                <div class="${d} ${p}">${a.title}</div>
                ${f}
                
                <!-- Tooltip -->
                <div class="absolute bottom-full mb-3 hidden group-hover:block w-48 p-3 bg-gray-900/95 dark:bg-gray-800/95 text-white text-xs rounded-xl shadow-xl z-50 text-center pointer-events-none backdrop-blur-sm border border-gray-700 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                    <div class="font-bold text-purple-300 mb-1 text-sm">${a.title}</div>
                    <div class="text-gray-300 leading-relaxed mb-2">${a.desc}</div>
                    ${n?'<div class="mt-1 text-[10px] text-green-400 font-bold">✓ ปลดล็อกแล้ว</div>':`
                        <div class="pt-2 border-t border-gray-700/50">
                            <div class="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>ความคืบหน้า</span>
                                <span class="font-mono">${o}/${a.target}</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${s}%"></div>
                            </div>
                        </div>
                    `}
                    ${a.rewardTitle?`<div class="mt-2 pt-2 border-t border-gray-700/50 text-[10px] text-yellow-400">🎁 รางวัล: ${a.rewardTitle}</div>`:""}
                    <!-- Arrow -->
                    <div class="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900/95 dark:bg-gray-800/95 rotate-45 border-r border-b border-gray-700"></div>
                </div>
            </div>
        `}).join("")}function Dt(t){const r=document.getElementById("profile-achievements-list"),e=new M("achievement-details-modal");r&&r.addEventListener("click",a=>{const n=a.target.closest(".achievement-card");if(n&&n.dataset.id){const o=n.dataset.id,s=ue.find(l=>l.id===o);if(s){const i=(t.state.unlockedAchievements||[]).includes(o),d=document.getElementById("achievement-modal-icon"),g=document.getElementById("achievement-modal-name"),b=document.getElementById("achievement-modal-desc"),c=document.getElementById("achievement-modal-status");let p=0;s.type==="level"?p=t.getCurrentLevel().level:s.type==="total_correct"?p=t.state.totalCorrectAnswers||0:s.type==="total_quizzes"?p=t.state.quizzesCompleted||0:s.type==="total_items"?p=t.getInventory().length:s.type==="total_avatars"?p=t.getInventory().filter(u=>{const x=T.find(m=>m.id===u);return x&&x.type==="avatar"}).length:s.type==="high_scores_80"?p=t.state.highScores80||0:s.type==="perfect_scores"?p=t.state.perfectScores||0:s.type==="theory_xp"?p=t.state.theoryXP||0:s.type==="calculation_xp"?p=t.state.calculationXP||0:s.type==="item_usage"?p=t.state.itemUsageCount||0:s.type==="total_xp"&&(p=t.state.xp||0);const f=Math.min(100,Math.max(0,p/s.target*100));if(d&&(d.textContent=s.icon,i?d.classList.remove("grayscale","opacity-50"):d.classList.add("grayscale","opacity-50")),g&&(g.textContent=s.title),b){let u=`<div class="mb-4">${s.desc}</div>`;i||(u+=`
                            <div class="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600">
                                <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-bold">
                                    <span>ความคืบหน้า</span>
                                    <span>${p.toLocaleString()} / ${s.target.toLocaleString()}</span>
                                </div>
                                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                                    <div class="bg-blue-500 h-full transition-all duration-700" style="width: ${f}%"></div>
                                </div>
                            </div>
                        `),b.innerHTML=u}if(c)if(i){let u='<div class="space-y-2">';u+='<span class="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-bold block w-fit mx-auto">✓ ปลดล็อกแล้ว</span>',s.rewardTitle&&(u+=`<div class="text-xs text-yellow-600 dark:text-yellow-400 font-bold">🎁 รางวัล: ฉายา "《 ${s.rewardTitle} 》"</div>`),u+="</div>",c.innerHTML=u}else c.innerHTML='<span class="px-3 py-1 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-sm font-bold">ยังไม่ปลดล็อก</span>';e.open()}}})}function ve(t){const r=document.getElementById("profile-quest-history");if(!r)return;const e=t.state.questHistory||[];if(e.length===0){r.innerHTML='<p class="text-center text-gray-500 dark:text-gray-400 text-sm py-4">ยังไม่มีประวัติการทำภารกิจ</p>';return}r.innerHTML=e.map(a=>`
        <div class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-100 dark:border-gray-700">
            <div class="flex flex-col">
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">${a.desc}</span>
                <span class="text-[10px] text-gray-400">${a.date}</span>
            </div>
            <span class="text-xs font-bold text-green-600 dark:text-green-400">+${a.xp} XP</span>
        </div>
    `).join("")}async function P(t,r=null,e="overall"){const a=document.getElementById("skills-radar-chart")?.getContext("2d"),n=document.getElementById("radar-chart-loader");if(!a)return!1;n&&n.classList.remove("hidden");try{r||(r=await Q());const o=se;let s=r,l={};if(o==="highschool")if(e==="overall")Object.entries(A).forEach(([u,x])=>{(x.track==="physics"||x.track==="earth")&&(l[u]={label:x.label,keywords:x.keywords})});else if(e.startsWith("physics_")){const u=e.split("_")[1],x=I.Physics?.[u];x?.chapters&&x.chapters.forEach(m=>{const y=m.shortTitle||m.title.split(":")[0].trim(),v=[m.title,m.shortTitle,y,`บทที่ ${y.replace("บทที่","").trim()}`,...m.keywords||[]].filter(Boolean);l[y]={label:y,keywords:v}})}else e==="earth_basic"&&I.EarthSpaceScienceBasic?.units?.forEach(x=>x.chapters.forEach(m=>{const y=m.shortTitle||m.title;l[y]={label:y,keywords:[m.title,m.shortTitle,...m.keywords||[]].filter(Boolean)}}));else if(e==="overall")l={ธรณีวิทยา:{label:"ธรณีวิทยา",keywords:["geology","ธรณีวิทยา"]},บรรยากาศ:{label:"บรรยากาศ",keywords:["meteorology","อุตุนิยมวิทยา"]},มหาสมุทร:{label:"มหาสมุทร",keywords:["oceanography","สมุทรศาสตร์"]},ดาราศาสตร์:{label:"ดาราศาสตร์",keywords:["astro","ดาราศาสตร์"]},การคำนวณ:{label:"การคำนวณ",keywords:["calc","physics"]}};else if(e==="posn_earth"){const u=I.EarthAndSpace;u&&Object.keys(u).forEach(x=>l[x]={label:x,keywords:[x]})}else e==="posn_astro"&&I.ASTRONOMY_POSN?.forEach(x=>l[x.topic]={label:x.topic,keywords:[x.topic]});const i={};Object.keys(l).forEach(u=>i[u]={correct:0,total:0,label:l[u].label}),s.forEach(u=>{u.userAnswers&&u.userAnswers.forEach(x=>{if(!x)return;const m=[x.subCategory,typeof x.subCategory=="object"?x.subCategory?.main:"",x.sourceQuizCategory,u.category,u.title].filter(Boolean).join(" ").toLowerCase();for(const[y,v]of Object.entries(l))v.keywords.some(h=>m.includes(h.toLowerCase()))&&(i[y].total++,x.isCorrect&&i[y].correct++)})});const d=Object.values(i).map(u=>u.label),g=Object.values(i).map(u=>u.total>0?u.correct/u.total*100:0),{gridColor:b,textColor:c,themeColors:p}=Xt(t),f=Chart.getChart(a);return f&&f.destroy(),new Chart(a,{type:"radar",data:{labels:d,datasets:[{label:"ความถนัด",data:g,backgroundColor:p.background,borderColor:p.border,pointBackgroundColor:p.point,pointHoverRadius:6,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{r:{angleLines:{color:b},grid:{color:b},pointLabels:{color:c,font:{family:"Kanit",size:11}},ticks:{display:!1},suggestedMin:0,suggestedMax:100}},plugins:{legend:{display:!1},tooltip:{callbacks:{label:u=>{const x=Object.values(i)[u.dataIndex];return`ความแม่นยำ: ${u.raw.toFixed(1)}% (${x.correct}/${x.total})`}}}}}}),Nt(i,o,t),qt(i,o),!0}catch(o){return console.error("Radar Chart Error:",o),!1}finally{n&&n.classList.add("hidden")}}function we(t){const r=document.getElementById("learning-heatmap-grid"),e=document.getElementById("learning-heatmap-months");if(!r)return;const a=c=>{const p=c.getFullYear(),f=String(c.getMonth()+1).padStart(2,"0"),u=String(c.getDate()).padStart(2,"0");return`${p}-${f}-${u}`},n={};Array.isArray(t)&&t.forEach(c=>{const p=c.lastAttemptTimestamp;if(!p)return;const f=new Date(p);if(isNaN(f.getTime()))return;const u=Array.isArray(c.userAnswers)?c.userAnswers.filter(m=>m!==null).length:0;if(u<=0)return;const x=a(f);n[x]=(n[x]||0)+u});const o=20,s=o*7,l=new Date;l.setHours(0,0,0,0);const i=new Date(l);i.setDate(l.getDate()+(6-l.getDay()));const d=new Date(i);d.setDate(i.getDate()-(s-1));const g=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];if(e){const c=[];let p=-1;for(let f=0;f<o;f++){const u=new Date(d);u.setDate(d.getDate()+f*7);const x=u.getMonth();x!==p&&(c.push(`<span>${g[x]}</span>`),p=x)}e.innerHTML=c.join("")}const b=[];for(let c=0;c<s;c++){const p=new Date(d);p.setDate(d.getDate()+c);const f=a(p),u=p>l?0:n[f]||0;let x="hm-lvl-0";u>=16?x="hm-lvl-4":u>=9?x="hm-lvl-3":u>=4?x="hm-lvl-2":u>=1&&(x="hm-lvl-1");const m=`${p.getDate()} ${g[p.getMonth()]}`,y=p>l?" opacity-30":"";b.push(`<div class="heatmap-cell ${x}${y}" title="${m}: ${u} ข้อ"></div>`)}r.innerHTML=b.join("")}function Nt(t,r,e){const a=document.getElementById("mastery-rank-icon"),n=document.getElementById("mastery-rank-name"),o=document.getElementById("mastery-rank-subtitle");if(!a||!n)return;const s=t?Object.values(t):[],l=s.reduce((f,u)=>f+(u.correct||0),0),i=s.reduce((f,u)=>f+(u.total||0),0),d=i>0?l/i*100:0;let g={name:"Newbie (ผู้เริ่มต้น)",icon:"🌱",color:"text-gray-700 dark:text-gray-300"};i===0?(g={name:"Newbie (ผู้เริ่มต้น)",icon:"🌱",color:"text-gray-700 dark:text-gray-300"},o&&(o.textContent="ทำโจทย์เพื่อปลดล็อกยศ")):(r==="highschool"?d>=85&&i>=10?g={name:"Master Physicist (เซียนสายวิทย์)",icon:"⚛️",color:"text-purple-700 dark:text-purple-300"}:d>=70?g={name:"Expert Learner (ผู้เชี่ยวชาญ)",icon:"🧠",color:"text-blue-700 dark:text-blue-300"}:d>=50?g={name:"Apprentice (นักเรียนฝึกหัด)",icon:"📐",color:"text-emerald-700 dark:text-emerald-300"}:g={name:"Learner (ผู้กำลังเรียนรู้)",icon:"📖",color:"text-amber-700 dark:text-amber-300"}:d>=85&&i>=10?g={name:"Olympian (ผู้แทน สอวน.)",icon:"🥇",color:"text-yellow-600 dark:text-yellow-300"}:d>=70?g={name:"Bronze Medalist (รอบชิงชนะเลิศ)",icon:"🥉",color:"text-orange-700 dark:text-orange-300"}:d>=50?g={name:"Qualifier (ผู้ผ่านการคัดเลือก)",icon:"📝",color:"text-blue-700 dark:text-blue-300"}:g={name:"Challenger (ผู้ท้าชิง สอวน.)",icon:"🏹",color:"text-amber-700 dark:text-amber-300"},o&&(o.textContent=`ความแม่นยำรวม: ${d.toFixed(1)}% (${l}/${i} ข้อ)`)),a.textContent=g.icon,n.textContent=g.name,n.className=`text-lg font-black leading-tight ${g.color}`;const b=document.getElementById("rpg-stat-acc"),c=document.getElementById("rpg-stat-str");document.getElementById("rpg-stat-spd");const p=document.getElementById("rpg-stat-int");b&&(b.textContent=i>0?`${d.toFixed(1)}%`:"0%"),c&&e?.state&&(c.textContent=`${e.state.streak||0} วัน`),p&&(i===0?p.textContent="เริ่มต้น":d>=80?p.textContent="ระดับสูง":d>=60?p.textContent="ระดับท้าทาย":p.textContent="ปานกลาง")}function qt(t,r){const e=document.getElementById("weakest-area-name"),a=document.getElementById("smart-focus-btn");if(!e||!a)return;const n=Object.entries(t).filter(l=>l[1].total>0);if(n.length===0){e.textContent="ยังไม่มีข้อมูลการฝึกฝนมากพอ",a.classList.add("opacity-50","pointer-events-none");return}n.sort((l,i)=>l[1].correct/l[1].total-i[1].correct/i[1].total);const o=n[0],s=(o[1].correct/o[1].total*100).toFixed(0);e.textContent=`${o[1].label} (แม่นยำ ${s}%)`,a.classList.remove("opacity-50","pointer-events-none"),a.onclick=()=>{const l=o[0];$("Smart Focus",`กำลังเตรียมตะลุยโจทย์: ${o[1].label}`,"🔥"),setTimeout(()=>{window.location.href=`quiz/index.html?mode=smart_focus&topic=${encodeURIComponent(l)}`},1e3)}}function Ft(t,r,e,a){if(!t)return;t.animationId&&cancelAnimationFrame(t.animationId);let n=null;const o=s=>{n||(n=s);const l=Math.min((s-n)/a,1),i=1-Math.pow(1-l,4),d=Math.floor(i*(e-r)+r);t.textContent=d.toLocaleString(),l<1?t.animationId=window.requestAnimationFrame(o):(t.textContent=e.toLocaleString(),t.animationId=null)};t.animationId=window.requestAnimationFrame(o)}function Qt(t,r){const e=document.querySelectorAll(".history-range-btn");e.length!==0&&e.forEach(a=>{a.addEventListener("click",async()=>{const n=a.dataset.range;if(n===Z)return;e.forEach(s=>{s.classList.remove("bg-white","dark:bg-gray-600","shadow","text-blue-600","dark:text-blue-300"),s.classList.add("text-gray-500","dark:text-gray-400","hover:text-gray-700","dark:hover:text-gray-200")}),a.classList.add("bg-white","dark:bg-gray-600","shadow","text-blue-600","dark:text-blue-300"),a.classList.remove("text-gray-500","dark:text-gray-400","hover:text-gray-700","dark:hover:text-gray-200"),Z=n;const o=document.getElementById("history-chart-loader");o&&o.classList.remove("hidden"),await W(t,r,Z),o&&o.classList.add("hidden")})})}function Ot(t,r){const e=document.getElementById("proficiency-mode-select"),a=document.getElementById("track-toggle-highschool"),n=document.getElementById("track-toggle-posn"),o=s=>{if(se=s,e){e.innerHTML="";const l=document.createElement("option");l.value="overall",l.textContent=s==="highschool"?"ภาพรวม ม.ปลาย":"ภาพรวม สอวน.",e.appendChild(l),s==="highschool"?[{v:"physics_m4",t:"ฟิสิกส์ ม.4"},{v:"physics_m5",t:"ฟิสิกส์ ม.5"},{v:"physics_m6",t:"ฟิสิกส์ ม.6"},{v:"earth_basic",t:"วท. โลกพื้นฐาน"},{v:"earth_adv",t:"วท. โลกเพิ่มเติม"}].forEach(i=>{const d=document.createElement("option");d.value=i.v,d.textContent=i.t,e.appendChild(d)}):[{v:"posn_earth",t:"สอวน. วิทยาศาสตร์โลก"},{v:"posn_astro",t:"สอวน. ดาราศาสตร์"}].forEach(i=>{const d=document.createElement("option");d.value=i.v,d.textContent=i.t,e.appendChild(d)})}a&&n&&(s==="highschool"?(a.className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm",n.className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"):(n.className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm",a.className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"))};a&&a.addEventListener("click",()=>{o("highschool"),F="overall",P(t,r,"overall")}),n&&n.addEventListener("click",()=>{o("posn"),F="overall",P(t,r,"overall")}),e&&e.addEventListener("change",async s=>{const l=s.target.value;l!==F&&(F=l,P(t,r,F))}),o(se)}function Rt(t){let r=t.canvas.parentNode.querySelector("div.chartjs-tooltip");if(!r){r=document.createElement("div"),r.className="chartjs-tooltip bg-gray-900/95 dark:bg-gray-700/95 text-white text-xs rounded-lg shadow-xl pointer-events-auto absolute transition-all duration-150 z-50 backdrop-blur-sm border border-gray-700 dark:border-gray-600",r.style.opacity=0,r.style.transition="opacity .3s";const e=document.createElement("table");e.style.margin="0px",r.appendChild(e),t.canvas.parentNode.appendChild(r)}return r}function Xt(t){const r=document.documentElement.classList.contains("dark"),e=r?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)",a=r?"#e5e7eb":"#374151",n=t?.state?.selectedTheme?.replace("theme-","")||"default",o=Oe[n]||{main:"#3b82f6",secondary:"#60a5fa"},s={background:r?`rgba(${ke(o.main)}, 0.2)`:`rgba(${ke(o.main)}, 0.1)`,border:o.main,point:o.secondary||o.main};return{gridColor:e,textColor:a,themeColors:s}}function ke(t){t=t.replace("#","");const r=parseInt(t.substring(0,2),16),e=parseInt(t.substring(2,4),16),a=parseInt(t.substring(4,6),16);return`${r}, ${e}, ${a}`}function Ut(t,r){const e=document.querySelector('[data-tab-target="shop"]'),a=document.getElementById("user-hub-btn");let n=e||a;if(!r||!n)return;const o=document.createElement("div");o.textContent=t,o.style.position="fixed",o.style.fontSize="4rem",o.style.zIndex="10000",o.style.pointerEvents="none",o.style.transition="all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",o.style.textShadow="0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)";const s=r.getBoundingClientRect(),l=s.left+s.width/2,i=s.top+s.height/2;o.style.left=`${l}px`,o.style.top=`${i}px`,o.style.transform="translate(-50%, -50%) scale(1) rotate(0deg)",o.style.opacity="1",document.body.appendChild(o),o.offsetWidth,requestAnimationFrame(()=>{const d=n.getBoundingClientRect(),g=d.left+d.width/2,b=d.top+d.height/2;o.style.left=`${g}px`,o.style.top=`${b}px`,o.style.transform="translate(-50%, -50%) scale(0.2) rotate(720deg)",o.style.opacity="0"}),o.addEventListener("transitionend",()=>{o.remove(),n.animate&&n.animate([{transform:"scale(1)"},{transform:"scale(1.2)"},{transform:"scale(1)"}],{duration:300,easing:"ease-out"})})}function _e(t,r){const e=["#FBBF24","#F59E0B","#3B82F6","#60A5FA","#FFFFFF"];for(let a=0;a<30;a++){const n=document.createElement("div");n.className="fixed z-[10001] rounded-full pointer-events-none";const o=Math.random()*8+4;n.style.width=`${o}px`,n.style.height=`${o}px`,n.style.backgroundColor=e[Math.floor(Math.random()*e.length)],n.style.left=`${t}px`,n.style.top=`${r}px`,n.style.boxShadow=`0 0 10px ${n.style.backgroundColor}`,document.body.appendChild(n);const s=Math.random()*Math.PI*2,l=Math.random()*200+50,i=Math.cos(s)*l,d=Math.sin(s)*l,g=n.animate([{transform:"translate(-50%, -50%) scale(1)",opacity:1},{transform:`translate(calc(-50% + ${i}px), calc(-50% + ${d}px)) scale(0)`,opacity:0}],{duration:600+Math.random()*400,easing:"cubic-bezier(0, .9, .57, 1)"});g.onfinish=()=>n.remove()}}function Wt(t){const{chart:r,tooltip:e}=t,a=Rt(r);if(e.opacity===0){a.style.opacity=0,a.style.pointerEvents="none";return}else a.style.pointerEvents="auto";if(e.body){const d=e.title||[],g=e.body.map(m=>m.lines),b=document.createElement("thead"),c=document.createElement("tr"),p=document.createElement("th");p.colSpan=2,p.className="text-right pb-1 border-b border-gray-600/50 mb-2";const f=document.createElement("button");f.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>',f.className="p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer",f.type="button",f.onclick=m=>{m.stopPropagation(),a.style.opacity=0,a.style.pointerEvents="none",r.setActiveElements([],{x:0,y:0}),r.update()},p.appendChild(f),c.appendChild(p),b.appendChild(c),d.forEach(m=>{const y=document.createElement("tr");y.style.borderWidth=0;const v=document.createElement("th");v.style.borderWidth=0,v.className="text-left font-bold py-2 font-kanit text-sm";const h=document.createTextNode(m);v.appendChild(h),y.appendChild(v),b.appendChild(y)});const u=document.createElement("tbody");g.forEach((m,y)=>{const v=e.labelColors[y],h=document.createElement("span");h.style.background=v.backgroundColor,h.style.borderColor=v.borderColor,h.style.borderWidth="2px",h.style.marginRight="8px",h.style.height="10px",h.style.width="10px",h.style.display="inline-block",h.style.borderRadius="50%";const w=document.createElement("tr");w.style.backgroundColor="inherit",w.style.borderWidth=0;const k=document.createElement("td");k.style.borderWidth=0,k.className="py-1 font-sarabun";const E=document.createTextNode(m);k.appendChild(h),k.appendChild(E),w.appendChild(k),u.appendChild(w)});const x=a.querySelector("table");for(;x.firstChild;)x.firstChild.remove();x.appendChild(b),x.appendChild(u)}const{offsetLeft:n,offsetTop:o}=r.canvas;a.style.opacity=1,a.style.left=n+e.caretX+"px",a.style.top=o+e.caretY+"px",a.style.padding="12px";let s="-50%",l="-100%",i="-10px";e.yAlign==="top"?(l="0",i="10px"):e.yAlign==="center"&&(l="-50%",i="0"),a.style.transform=`translate(${s}, ${l})`,a.style.marginTop=i}async function W(t,r=null,e="all"){const a=document.getElementById("proficiency-history-chart")?.getContext("2d"),n=document.getElementById("history-chart-loader");if(!a)return n&&n.classList.add("hidden"),!1;if(window.addEventListener("auth-synced",()=>{console.log("Data synced event received. Refreshing charts..."),t.authManager,typeof P=="function"&&P(t);const o=document.querySelector(".primary-tab-btn.active");if(o){const s=o.dataset.tabTarget;s==="analysis"&&typeof ne=="function"?(ge.analysis=!1,ne(t)):s==="history"&&typeof X=="function"&&X(t)}}),typeof Chart>"u")return console.warn("Chart.js is not loaded. Skipping history chart rendering."),n&&n.classList.add("hidden"),!1;try{r||(r=await Q());const o={};Object.keys(A).forEach(c=>{o[c]=[]});let s=null;if(e!=="all"){const c=parseInt(e);s=new Date,s.setDate(s.getDate()-c)}r.forEach(c=>{if(!c.userAnswers||!c.lastAttemptTimestamp)return;const p=new Date(c.lastAttemptTimestamp);if(s&&p<s)return;let f=null;const u=c.userAnswers.find(v=>v);let x=(c.category||"").toLowerCase();if(u&&u.subCategory)if(typeof u.subCategory=="string")x+=" "+String(u.subCategory).toLowerCase();else{const v=String(u.subCategory.main||"").toLowerCase(),h=u.subCategory.specific,w=Array.isArray(h)?h.join(" "):String(h||"");x+=" "+v+" "+w.toLowerCase()}const m=(v,h)=>{if(!v)return!1;const w=v.toLowerCase();return h.some(k=>w.includes(k.toLowerCase()))},y=[];for(const[v,h]of Object.entries(A))m(x,h.keywords)&&y.push(v);y.forEach(v=>{if(v){const h=c.score||0,w=c.shuffledQuestions?c.shuffledQuestions.length:c.amount||0,k=w>0?h/w*100:0;o[v].push({x:new Date(c.lastAttemptTimestamp),y:k,title:c.title})}})}),Object.keys(o).forEach(c=>{o[c].sort((p,f)=>p.x-f.x)});const l=Object.keys(A).map((c,p)=>{const f=A[c],u=o[c],x=p*360/Object.keys(A).length%360,m=`hsla(${x}, 70%, 50%, 1)`,y=`hsla(${x}, 70%, 50%, 0.1)`;return{label:f.label,data:u,borderColor:m,backgroundColor:y,borderWidth:2,tension:.3,pointRadius:3,pointHoverRadius:5,hidden:u.length===0}}).filter(c=>c.data.length>0),i=document.documentElement.classList.contains("dark"),d=i?"#e5e7eb":"#374151",g=i?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)",b=Chart.getChart(a);return b&&b.destroy(),new Chart(a,{type:"line",data:{datasets:l},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{type:"time",time:{unit:e==="7"||e==="14"?"day":e==="30"?"week":"month",displayFormats:{day:"d MMM",week:"d MMM",month:"MMM yyyy"},tooltipFormat:"d MMM yyyy HH:mm"},grid:{color:g},ticks:{color:d}},y:{beginAtZero:!0,max:100,grid:{color:g},ticks:{color:d,callback:c=>c+"%"}}},plugins:{legend:{labels:{color:d,font:{family:"'Kanit', sans-serif"}}},tooltip:{enabled:!1,external:Wt,callbacks:{label:c=>`${c.dataset.label}: ${c.raw.y.toFixed(1)}% (${c.raw.title})`}}},interaction:{mode:"nearest",axis:"x",intersect:!1}}}),!0}catch(o){return console.error("Failed to render history chart:",o),!1}finally{n&&n.classList.add("hidden")}}async function de(t=null){const r=document.getElementById("strengths-list"),e=document.getElementById("weaknesses-list"),a=document.getElementById("strengths-weaknesses-loader");if(!r||!e)return a&&a.classList.add("hidden"),!1;try{const n="strengths_weaknesses_cache_v3",s=localStorage.getItem("last_quiz_completed_timestamp")||"0";let l=null;const i=localStorage.getItem(n);if(i)try{l=JSON.parse(i)}catch(c){console.warn("Could not parse strengths/weaknesses cache. Recalculating...",c),localStorage.removeItem(n)}localStorage.removeItem("strengths_weaknesses_cache"),localStorage.removeItem("strengths_weaknesses_cache_v2");let d;l&&l.timestamp>=s?d=l.analysis:(d=await Ue(t),localStorage.setItem(n,JSON.stringify({timestamp:new Date().getTime(),analysis:d})));const{strengths:g,weaknesses:b}=d;return g.length>0?r.innerHTML=g.map(c=>`
                <li class="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800/30 flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mr-2" title="${c.name}">${c.name}</span>
                    <span class="text-xs font-bold text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm">${c.percentage.toFixed(0)}%</span>
                </li>
            `).join(""):r.innerHTML='<li class="text-sm text-gray-500 dark:text-gray-400 italic">ยังไม่มีข้อมูลเพียงพอ</li>',b.length>0?e.innerHTML=b.map(c=>`
                <li class="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-100 dark:border-yellow-800/30 flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mr-2" title="${c.name}">${c.name}</span>
                    <span class="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm">${c.percentage.toFixed(0)}%</span>
                </li>
            `).join(""):e.innerHTML='<li class="text-sm text-gray-500 dark:text-gray-400 italic">ยังไม่มีข้อมูลเพียงพอ</li>',!0}catch(n){return console.error("Failed to render strengths and weaknesses:",n),r&&(r.innerHTML='<li class="text-sm text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</li>'),e&&(e.innerHTML='<li class="text-sm text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</li>'),!1}finally{a&&a.classList.add("hidden")}}export{nr as initializeProfile};

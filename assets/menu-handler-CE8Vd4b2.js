import{M as R}from"./modal-handler-Dhq6IeBb.js";import{a as N,g as j,c as B}from"./data-manager-L12rPSmt.js";import{a as W,g as G,o as J}from"./custom-quiz-handler-BKmlal4H.js";import{a as X}from"./utils-BUPztk3_.js";function b(n,H,v,w="./"){const z=n.amount||n.questions?.length||0;if(z===0)return"";const S=n.storageKey||`quizState-${n.id||n.customId}`,c=n.id||n.customId,Q=H(c),d=(n.icon||"./assets/icons/dices.png").replace(/^\.\//,w),p=n.altText||"ไอคอนแบบทดสอบ",u=j(S,z);let k="",C="",f="",y="font-medium",L="";return u.isFinished?k=`
            <div class="text-[11px] font-medium text-green-600 dark:text-green-400 mt-0.5">
                ทำเสร็จแล้ว (${u.score}/${u.totalQuestions})
            </div>`:u.hasProgress&&u.answeredCount>0&&(k=`
            <div class="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                ทำต่อ (${u.answeredCount}/${u.totalQuestions} ข้อ)
            </div>`),c===v&&(C="bg-blue-100 dark:bg-blue-900/50 border-blue-500",f='<span class="inline-block h-2 w-2 mr-2 bg-blue-500 rounded-full" aria-hidden="true"></span>',y="font-bold",L="scale-110 shadow-lg shadow-blue-500/40"),`
        <a href="${Q}" data-storage-key="${S}" data-total-questions="${z}" data-quiz-title="${n.title}" class="quiz-menu-item group block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 border-l-2 border-transparent hover:border-blue-400 ${C}">
            <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-white dark:bg-gray-200 p-1 transition-all duration-300 group-hover:scale-110 ${L} overflow-hidden" style="min-width: 2rem; min-height: 2rem;">
                    <img src="${d}" alt="${p}" class="h-full w-full object-contain">
                </div>
                <div class="flex-grow min-w-0">
                    <span class="${y} whitespace-normal group-hover:text-blue-600 dark:group-hover:text-blue-400">${f}${n.title}</span>
                    ${k}
                </div>
            </div>
        </a>
    `}async function et(){await(async()=>{const v=document.getElementById("main-menu-dropdown"),w=document.getElementById("menu-quiz-list");if(!v||!w)return!1;if(w.dataset.menuInitialized==="true")return!0;w.dataset.menuInitialized="true";const z=new R("completed-quiz-modal"),c=new URLSearchParams(window.location.search).get("id"),Q=window.location.pathname.includes("/quiz/"),d=Q?"../":"./",p=t=>`${Q?"":"./quiz/"}index.html?id=${t}`,u=W(),k=N(),C=new Promise(t=>setTimeout(()=>t([]),3e3));let f=[],y=[];try{const t=await Promise.race([Promise.all([u,k]),C]);Array.isArray(t)&&t.length===2&&([f,y]=t)}catch(t){console.warn("Failed to load quizzes for menu:",t)}Array.isArray(f)||(f=[]),Array.isArray(y)||(y=[]);const A=[...y,...f].map(t=>{const e=t.amount||t.questions?.length||0;if(e===0)return null;const s=t.storageKey||`quizState-${t.id||t.customId}`,g=j(s,e);return{...t,...g,storageKey:s}}).filter(Boolean),P=A.filter(t=>t.hasProgress&&t.answeredCount>0).sort((t,e)=>e.lastAttemptTimestamp-t.lastAttemptTimestamp).slice(0,3),V=new Set(P.map(t=>t.id||t.customId)),F=A.filter(t=>t.customId&&!V.has(t.customId)),U=A.filter(t=>t.id&&!V.has(t.id)&&!t.isRemedialOnly).reduce((t,e)=>{const s=e.category||"Uncategorized";return t[s]||(t[s]=[]),t[s].push(e),t},{}),O=Object.keys(U).sort((t,e)=>{const s=B[t]?.order||99,g=B[e]?.order||99;return s-g});let r="";return P.length>0&&(r+=`
                <div class="px-4 pt-2 pb-1 flex items-center gap-2">
                    <svg class="h-4 w-4 text-gray-400 shrink-0" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
                    <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ทำล่าสุด</h4>
                </div>
            `,P.forEach(t=>{r+=b(t,p,c,d)}),r+='<hr class="my-2 border-gray-200 dark:border-gray-600">'),O.forEach(t=>{const e=U[t],s=B[t];if(!s||!e||e.length===0)return;const g=(s.icon||"./assets/icons/study.png").replace(/^\.\//,d);r+=`
                <details class="group menu-category-item">
                    <summary class="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div class="flex items-center gap-2">
                            <div class="shrink-0 h-5 w-5" style="min-width: 1.25rem; min-height: 1.25rem;">
                                <img src="${g}" alt="${s.title}" class="h-full w-full object-contain">
                            </div>
                            <span class="font-semibold text-sm text-gray-800 dark:text-gray-200">${s.title}</span>
                        </div>
                        <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-open:rotate-90 shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                    </summary>
                    <div class="pl-4 pt-1 pb-2 space-y-1">
            `;const I=G(t),M=I?.units?I.units.flatMap(m=>m.chapters):I?.chapters;if(Array.isArray(M)){const m="แนวข้อสอบ",T=e.filter(a=>a.subCategory===m),D=e.filter(a=>a.subCategory!==m),K=new Set;M.forEach(a=>{const o=a.title,i=D.filter(l=>{const h=l.subCategory===o;return h&&K.add(l.id),h});if(i.length>0){let l=o;if(t==="EarthSpaceScienceBasic")l=`บทที่ ${a.chapterId}: ${o}`;else if(t==="EarthSpaceScienceAdvance"){const x=i[0];if(x?.description){const $=x.description.match(/บทที่\s*(\d+)/);$?.[1]&&(l=`บทที่ ${$[1]}: ${o}`)}}r+=`<p class="px-2 pt-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">${l}</p>`;const h=i.map(x=>b(x,p,c,d)).join("");r+=`<div class="space-y-px pl-2">${h}</div>`}});const E=D.filter(a=>!K.has(a.id));if(E.length>0&&(E.sort((a,o)=>a.title.localeCompare(o.title,"th",{numeric:!0})),r+='<p class="px-2 pt-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ชุดข้อสอบทั่วไป</p>',r+=`<div class="space-y-px pl-2">${E.map(a=>b(a,p,c,d)).join("")}</div>`),T.length>0){const a=o=>{const i=o.title||"";let l=99,h=99,x=99;i.includes("เทอม 1")||i.includes("ภาค 1")?l=1:(i.includes("เทอม 2")||i.includes("ภาค 2"))&&(l=2),i.includes("กลางภาค")?h=1:i.includes("ปลายภาค")&&(h=2);const $=i.match(/ชุดที่\s*(\d+)/);return $&&(x=parseInt($[1],10)),`${String(l).padStart(2,"0")}-${String(h).padStart(2,"0")}-${String(x).padStart(2,"0")}`};T.sort((o,i)=>a(o).localeCompare(a(i))),r+=`<p class="px-2 pt-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">${m}</p>`,r+=`<div class="space-y-px pl-2">${T.map(o=>b(o,p,c,d)).join("")}</div>`}}else e.forEach(m=>{r+=b(m,p,c,d)});r+=`
                    </div>
                </details>
            `}),F.length>0&&(r+='<hr class="my-2 border-gray-200 dark:border-gray-600">',r+=`
                <div class="px-4 pt-2 pb-1 flex items-center gap-2">
                    <svg class="h-4 w-4 text-gray-400 shrink-0" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>
                    <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">แบบทดสอบที่สร้างเอง</h4>
                </div>
            `,F.sort((t,e)=>(e.lastAttemptTimestamp||0)-(t.lastAttemptTimestamp||0)).forEach(t=>{r+=b(t,p,c,d)})),w.innerHTML=r,v.dataset.hasListener||(v.addEventListener("click",t=>{const e=t.target.closest("a");if(e&&e.classList.contains("quiz-menu-item")){const s=e.dataset.storageKey,g=parseInt(e.dataset.totalQuestions,10)||0;if(!s||g===0)return;if(j(s,g).isFinished){t.preventDefault();const M=e.dataset.quizTitle||"แบบทดสอบ";J({title:M,url:e.href,storageKey:s,triggerElement:e,modal:z,onStartOver:m=>X.deleteQuizHistoryItem(m)})}}}),v.dataset.hasListener="true"),!0})()||console.warn("⚠️ MenuHandler: initializeMenu failed (elements not found). Ensure header is loaded first.")}export{et as i};

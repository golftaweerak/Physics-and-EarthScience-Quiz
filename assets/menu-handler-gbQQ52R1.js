import{M as K}from"./modal-handler-CjwIEypi.js";import{getQuizzesList as O,getQuizProgress as P,categoryDetails as A}from"./data-manager-Dj4VFpfw.js";import{g as R,a as W}from"./custom-quiz-handler-BbGD_uES.js";function L(r,T,p,h="./"){const d=r.amount||r.questions?.length||0;if(d===0)return"";const u=r.storageKey||`quizState-${r.id||r.customId}`,m=r.id||r.customId,o=T(m),y=(r.icon||"./assets/icons/dices.png").replace(/^\.\//,h),B=r.altText||"ไอคอนแบบทดสอบ",a=P(u,d);let f="",l="",g="",w="font-medium",x="";return a.isFinished?f=`
            <div class="text-[11px] font-medium text-green-600 dark:text-green-400 mt-0.5">
                ทำเสร็จแล้ว (${a.score}/${a.totalQuestions})
            </div>`:a.hasProgress&&a.answeredCount>0&&(f=`
            <div class="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                ทำต่อ (${a.answeredCount}/${a.totalQuestions} ข้อ)
            </div>`),m===p&&(l="bg-blue-100 dark:bg-blue-900/50 border-blue-500",g='<span class="inline-block h-2 w-2 mr-2 bg-blue-500 rounded-full" aria-hidden="true"></span>',w="font-bold",x="scale-110 shadow-lg shadow-blue-500/40"),`
        <a href="${o}" data-storage-key="${u}" data-total-questions="${d}" data-quiz-title="${r.title}" class="quiz-menu-item group block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 border-l-2 border-transparent hover:border-blue-400 ${l}">
            <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-white dark:bg-gray-200 p-1 transition-all duration-300 group-hover:scale-110 ${x} overflow-hidden" style="min-width: 2rem; min-height: 2rem;">
                    <img src="${y}" alt="${B}" class="h-full w-full object-contain">
                </div>
                <div class="flex-grow min-w-0">
                    <span class="${w} whitespace-normal group-hover:text-blue-600 dark:group-hover:text-blue-400">${g}${r.title}</span>
                    ${f}
                </div>
            </div>
        </a>
    `}async function X(){await(async()=>{const p=document.getElementById("main-menu-dropdown"),h=document.getElementById("menu-quiz-list");if(!p||!h)return!1;if(h.dataset.menuInitialized==="true")return!0;h.dataset.menuInitialized="true";const d=new K("completed-quiz-modal"),u=document.getElementById("completed-view-results-btn"),m=document.getElementById("completed-start-over-btn");let o="",y="";const a=new URLSearchParams(window.location.search).get("id"),f=window.location.pathname.includes("/quiz/"),l=f?"../":"./",g=t=>`${f?"":"./quiz/"}index.html?id=${t}`,w=R(),x=O(),j=new Promise(t=>setTimeout(()=>t([]),3e3));let b=[],z=[];try{const t=await Promise.race([Promise.all([w,x]),j]);Array.isArray(t)&&t.length===2&&([b,z]=t)}catch(t){console.warn("Failed to load quizzes for menu:",t)}Array.isArray(b)||(b=[]),Array.isArray(z)||(z=[]);const C=[...z,...b].map(t=>{const e=t.amount||t.questions?.length||0;if(e===0)return null;const s=t.storageKey||`quizState-${t.id||t.customId}`,c=P(s,e);return{...t,...c,storageKey:s}}).filter(Boolean),M=C.filter(t=>t.hasProgress&&t.answeredCount>0).sort((t,e)=>e.lastAttemptTimestamp-t.lastAttemptTimestamp).slice(0,3),S=new Set(M.map(t=>t.id||t.customId)),V=C.filter(t=>t.customId&&!S.has(t.customId)),H=C.filter(t=>t.id&&!S.has(t.id)&&!t.isRemedialOnly).reduce((t,e)=>{const s=e.category||"Uncategorized";return t[s]||(t[s]=[]),t[s].push(e),t},{}),F=Object.keys(H).sort((t,e)=>{const s=A[t]?.order||99,c=A[e]?.order||99;return s-c});let i="";return M.length>0&&(i+=`
                <div class="px-4 pt-2 pb-1 flex items-center gap-2">
                    <svg class="h-4 w-4 text-gray-400 shrink-0" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
                    <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ทำล่าสุด</h4>
                </div>
            `,M.forEach(t=>{i+=L(t,g,a,l)}),i+='<hr class="my-2 border-gray-200 dark:border-gray-600">'),F.forEach(t=>{const e=H[t],s=A[t];if(!s||!e||e.length===0)return;const c=(s.icon||"./assets/icons/study.png").replace(/^\.\//,l);i+=`
                <details class="group menu-category-item">
                    <summary class="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div class="flex items-center gap-2">
                            <div class="shrink-0 h-5 w-5" style="min-width: 1.25rem; min-height: 1.25rem;">
                                <img src="${c}" alt="${s.title}" class="h-full w-full object-contain">
                            </div>
                            <span class="font-semibold text-sm text-gray-800 dark:text-gray-200">${s.title}</span>
                        </div>
                        <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-open:rotate-90 shrink-0" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                    </summary>
                    <div class="pl-4 pt-1 pb-2 space-y-1">
            `;const k=W(t),$=k?.units?k.units.flatMap(n=>n.chapters):k?.chapters;Array.isArray($)?$.forEach(n=>{const I=n.title,E=e.filter(v=>v.subCategory===I);if(E.length>0){let v=I;if(t==="EarthSpaceScienceBasic")v=`บทที่ ${n.chapterId}: ${I}`;else if(t==="EarthSpaceScienceAdvance"){const Q=E[0];if(Q?.description){const U=Q.description.match(/บทที่\s*(\d+)/);U?.[1]&&(v=`บทที่ ${U[1]}: ${I}`)}}i+=`<p class="px-2 pt-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">${v}</p>`;const D=E.map(Q=>L(Q,g,a,l)).join("");i+=`<div class="space-y-px pl-2">${D}</div>`}}):e.forEach(n=>{i+=L(n,g,a,l)}),i+=`
                    </div>
                </details>
            `}),V.length>0&&(i+='<hr class="my-2 border-gray-200 dark:border-gray-600">',i+=`
                <div class="px-4 pt-2 pb-1 flex items-center gap-2">
                    <svg class="h-4 w-4 text-gray-400 shrink-0" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>
                    <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">แบบทดสอบที่สร้างเอง</h4>
                </div>
            `,V.sort((t,e)=>(e.lastAttemptTimestamp||0)-(t.lastAttemptTimestamp||0)).forEach(t=>{i+=L(t,g,a,l)})),h.innerHTML=i,p.dataset.hasListener||(p.addEventListener("click",t=>{const e=t.target.closest("a");if(e&&e.classList.contains("quiz-menu-item")){const s=e.dataset.storageKey,c=parseInt(e.dataset.totalQuestions,10)||0;if(!s||c===0)return;if(P(s,c).isFinished){t.preventDefault();const $=e.dataset.quizTitle||"แบบทดสอบ",n=document.getElementById("completed-modal-title");n&&(n.textContent=$),o=e.href,y=s,d.open(e)}}}),p.dataset.hasListener="true"),u&&!u.dataset.hasListener&&(u.addEventListener("click",()=>{if(o){const t=o.includes("?")?"&":"?";window.location.href=`${o}${t}action=view_results`}d.close()}),u.dataset.hasListener="true"),m&&!m.dataset.hasListener&&(m.addEventListener("click",()=>{y&&localStorage.removeItem(y),o&&(window.location.href=o),d.close()}),m.dataset.hasListener="true"),!0})()||console.warn("⚠️ MenuHandler: initializeMenu failed (elements not found). Ensure header is loaded first.")}export{X as i};

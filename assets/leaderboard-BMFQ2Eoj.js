import{a as w}from"./utils-BUPztk3_.js";import{c as D,a as F,q as O,o as A,l as U,v as q,x as B,y as z}from"./firebase-config-D2ElzwY6.js";import{PROFICIENCY_GROUPS as m,TRACK_TITLES as C,getLevelBorderClass as J,getAvatarFrameClass as K,XP_THRESHOLDS as G}from"./gamification-DcusPSHJ.js";import{o as Q}from"./profile-modal-CKyVrE8Q.js";import"./preload-helper-DP0d4xQl.js";import"./site-config-I-RQ9TTj.js";function V(c,d){let f="overall";d==="physicsTrackXP"&&(f="physics"),d==="earthTrackXP"&&(f="earth");for(const o of Object.values(m))if(o.field===d){f=o.track;break}let a=1;for(const o of G)if(c>=o.xp)a=o.level;else break;const n=C[f]||C.overall,$=Math.min(a-1,n.length-1),P=n[$];return{level:a,title:P}}async function se(){const c=document.getElementById("leaderboard-list-full"),d=document.querySelectorAll(".leaderboard-tab");if(!c||d.length===0)return;const f=async a=>{c.innerHTML=`
            <div class="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg class="animate-spin h-8 w-8 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>กำลังโหลดอันดับ...</span>
            </div>
        `;try{const n=D(F,"users"),$=O(n,A(a,"desc"),U(50)),P=await w.retryOperation(()=>q($)),o=[];if(P.forEach(e=>{o.push({id:e.id,...e.data()})}),o.length===0){c.innerHTML='<div class="text-center py-16 text-gray-500">ยังไม่มีข้อมูลการจัดอันดับ</div>';return}const I=w?.currentUser,x=I?I.uid:null,h=await w.loadUserData()||{},S=o.some(e=>e.id===x);let g=null;if(!S&&x)try{const e=h[a]||0,r=O(n,B(a,">",e));g={rank:(await w.retryOperation(()=>z(r))).data().count+1,id:x,displayName:h.displayName,avatar:h.avatar,selectedTitle:h.selectedTitle,score:e,isMe:!0}}catch(e){console.warn("Failed to fetch user rank:",e)}let L=null;if(x){let e=null;if(S?e=o.findIndex(r=>r.id===x)+1:g&&(e=g.rank),e){const r=`lb_last_rank_${a}_${x}`,i=JSON.parse(localStorage.getItem(r));i&&(L=i.rank-e),localStorage.setItem(r,JSON.stringify({rank:e,timestamp:Date.now()}))}}const j=(e,r,i)=>{let b="";const u=i?L:e.rankChange||null;if(u!==null&&u!==0){const t=u>0;b=`<div class="text-[10px] font-bold ${t?"text-green-500":"text-red-500"} flex items-center justify-center -mt-1">${t?"▲":"▼"} ${Math.abs(u)}</div>`}else u===0&&(b='<div class="text-[10px] font-bold text-gray-400 flex items-center justify-center -mt-1">-</div>');let y=r,k="text-gray-500 text-lg";r===1?(y="🥇",k="text-3xl"):r===2?(y="🥈",k="text-3xl"):r===3&&(y="🥉",k="text-3xl");const E=`
                    <div class="flex flex-col items-center justify-center w-8">
                        <span class="font-bold ${k}">${y}</span>
                        ${b}
                    </div>
                `;let s;if(i&&e.score!==void 0)s=e.score;else if(s=e[a]||0,a==="physicsTrackXP"){let t=0;for(const l of Object.values(m))l.track==="physics"&&(t+=e[l.field]||0);s=Math.max(s,t)}else if(a==="earthTrackXP"){let t=0;for(const l of Object.values(m))l.track==="earth"&&(t+=e[l.field]||0);s=Math.max(s,t)}else if(a==="posnEarthTrackXP"){let t=0;for(const l of Object.values(m))l.track==="posn_earth"&&(t+=e[l.field]||0);s=Math.max(s,t)}else if(a==="posnAstroTrackXP"){let t=0;for(const l of Object.values(m))l.track==="posn_astro"&&(t+=e[l.field]||0);s=Math.max(s,t)}const X=s.toLocaleString();let v,T;if(a==="xp"){v=e.level||1;const t=C.overall,l=Math.min(v-1,t.length-1);T=t[l]}else{const t=V(s,a);v=t.level,T=t.title}const p=e.avatar||"🧑‍🎓",H=p.includes("/")||p.includes(".")?`<img src="${p}" class="w-full h-full rounded-full object-cover">`:`<span class="text-3xl">${p}</span>`,N=J(v),R=K(p,"small"),_=`
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0.5 shadow-md ${N}">
                        <div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden ${R}">
                            ${H}
                        </div>
                    </div>
                `;return`
                    <div onclick="window.openProfileModal(this)" data-user='${JSON.stringify(e).replace(/'/g,"&#39;")}' class="cursor-pointer flex items-center gap-4 p-3 rounded-xl ${i?"bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/50 dark:border-blue-700 shadow-lg scale-[1.01] z-10 relative":"bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"} transition-all duration-200">
                        <div class="flex-shrink-0">${E}</div>
                        <div class="flex-shrink-0">${_}</div>
                        <div class="flex-grow min-w-0 flex flex-col justify-center">
                            <div class="font-bold text-lg text-gray-800 dark:text-gray-200 truncate">
                                ${e.displayName||"ผู้เรียน"} ${i?'<span class="text-sm text-blue-600 dark:text-blue-400 ml-1">(คุณ)</span>':""}
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2">
                                <span class="font-bold text-gray-600 dark:text-gray-300">(Lv.${v})</span>
                                <span class="text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">${T}</span>
                                ${e.selectedTitle?`<span class="hidden sm:inline text-gray-400 dark:text-gray-600">•</span> <span class="truncate max-w-[150px] sm:max-w-none">《 ${e.selectedTitle} 》</span>`:""}
                            </div>
                        </div>
                        <div class="flex-shrink-0 text-right">
                            <div class="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">
                                ${X}
                            </div>
                            <div class="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase">XP</div>
                        </div>
                    </div>
                `};window.openProfileModal=e=>{try{const r=JSON.parse(e.dataset.user);Q(r)}catch(r){console.error("Error opening profile",r)}};let M=o.map((e,r)=>j(e,r+1,e.id===x)).join("");g&&(M+=`
                    <div class="flex items-center justify-center py-2 opacity-60">
                        <div class="h-1.5 w-1.5 bg-gray-400 rounded-full mx-1"></div>
                        <div class="h-1.5 w-1.5 bg-gray-400 rounded-full mx-1"></div>
                        <div class="h-1.5 w-1.5 bg-gray-400 rounded-full mx-1"></div>
                    </div>
                    ${j(g,g.rank,!0)}
                `),c.innerHTML=M}catch(n){console.error("Leaderboard error:",n),c.innerHTML='<div class="text-center py-16 text-red-500">ไม่สามารถโหลดข้อมูลได้<br>กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</div>'}};d.forEach(a=>{a.addEventListener("click",()=>{d.forEach(n=>n.className="leaderboard-tab whitespace-nowrap py-2 px-4 rounded-full text-sm font-bold transition-all bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"),a.className="leaderboard-tab whitespace-nowrap py-2 px-4 rounded-full text-sm font-bold transition-all bg-blue-600 text-white shadow-md",f(a.dataset.type)})}),f("xp")}export{se as initializeLeaderboard};

import{_ as ze}from"./physics_syllabus_data-Mnn3TXVG.js";import{getCurrentSemester as X,setCurrentSemester as Te,getCurrentCourseCode as je,getSemesterSummary as Ne,getSingleStudentScoreFromCloud as he,getStudentsByRoomFromCloud as _e}from"./data-manager-D4i2SJL_.js";import{M as te}from"./modal-handler-CjwIEypi.js";import{r as Oe}from"./student-card-renderer-Dri2xE_r.js";import{a as G}from"./auth-manager-DxJDYVU6.js";import"./firebase-config-L8WamaTR.js";const qe=["taweerak.t@promma.ac.th","boonyaporn.kha@promma.ac.th","praewa.p@promma.ac.th","manthana.k@promma.ac.th"],ve={"กิจกรรม 1.1":"https://forms.office.com/r/KFtWGZEb7S","แบบฝึก 1.1":"https://forms.office.com/r/abX7Vtwtww","แบบฝึก 1.2":"https://forms.office.com/r/Bsxg9Yx9JD","ท้ายบท 1":"https://forms.office.com/r/AFG3Ymt4Ni","Quiz 1":"https://forms.office.com/r/G4hdEDwbcX","แบบฝึก 2.1":"https://forms.office.com/r/tYmRtd438x","แบบฝึก 2.2":"https://forms.office.com/r/u785wcNf3X","ท้ายบท 2":"https://forms.office.com/r/MF4mget9mY","Quiz 2":"https://forms.office.com/r/a2AYEKGPPv","แบบฝึก 3.1":"https://forms.office.com/r/ubX306JhHy","ท้ายบท 3":"https://forms.office.com/r/VAic0B5szk","Quiz 3":"https://forms.office.com/r/2zMb0Xzrc9","แบบฝึก 4.1":"https://forms.office.com/r/ArkkdbnpXb","ท้ายบท 4":"https://forms.office.com/r/L8BwGLdh4V","Quiz 4":"https://forms.office.com/r/zfvAMhzHVq","แบบฝึก 5.1":"https://forms.cloud.microsoft/r/vEjY1BajQQ","แบบฝึก 5.2":"https://forms.cloud.microsoft/r/mmB2LXmSNn","ท้ายบท 5":"https://forms.cloud.microsoft/r/1uf2B3y7sM","Quiz 5":"https://forms.cloud.microsoft/r/gMTxMUjiT6","Quiz 6":"https://forms.office.com/r/dAs6nwpZ9e","Quiz 7":"https://forms.office.com/r/x6XEYgXLMG","Quiz 8":"https://forms.office.com/r/LmJASCtdX2","Quiz 9":"https://forms.office.com/r/jiUCum58kV","Quiz 10":"https://forms.office.com/r/ZcvePkp98p"},Pe={"mid [20]":"คะแนนข้อกา (30)","mid [10]":"คะแนนข้อเขียน (10)","mid [20]2":"คะแนนกลางภาค (20)"},Ve=[/^บท\s\d+\s\[\d+\]$/,/ก่อนปลายภาค/,/นำเสนอ/],De=["บทที่ 1","บทที่ 2","บทที่ 3","กลางภาค","บทที่ 4","บทที่ 5","บทที่ 6","บทที่ 7","บทที่ 8","บทที่ 9","บทที่ 10","อื่นๆ"];let V=!1,q=[],ee=[];async function Ke(){const c=document.getElementById("student-id-input"),h=document.getElementById("search-btn"),m=document.getElementById("result-container"),i=document.getElementById("clear-btn"),g=document.getElementById("default-message"),v=new te("dev-password-modal"),y=document.getElementById("dev-password-form"),L=document.getElementById("dev-password-input"),H=document.getElementById("dev-password-error"),j=new te("override-code-modal"),S=document.getElementById("override-code-content"),N=document.getElementById("copy-override-code-btn"),D=document.getElementById("log-data-content"),E=document.getElementById("copy-log-data-btn"),re=document.getElementById("download-override-file-btn"),F=document.getElementById("semester-selector");F&&(F.value=X(),F.addEventListener("change",()=>{Te(F.value),window.location.reload()}));const se=document.querySelector(".max-w-3xl.mx-auto"),ae=document.querySelector("#student-id-input")?.closest(".bg-white"),oe=X(),ne=je(),de=document.getElementById("course-code-display"),ie=document.getElementById("title-course-code");de&&(de.textContent=ne),ie&&(ie.textContent=ne);try{const e=await Ne(oe);if(e&&e.lastUpdated&&se&&ae){const a=new Date(e.lastUpdated).toLocaleString("th-TH",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Bangkok"}),b=document.createElement("div");b.className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4 -mt-4",b.textContent=`อัปเดตข้อมูลล่าสุด: ${a} น.`,se.insertBefore(b,ae)}}catch(e){console.warn("Could not load lastUpdated for semester",oe,e)}if(!c||!h||!m||!i){console.error("Required elements for score search are missing from the DOM.");return}const _=document.getElementById("quick-user-container"),le=e=>{if(!_)return;if(!e||!e.email){_.classList.add("hidden"),_.innerHTML="";return}const o=e.email.trim().toLowerCase().match(/^(\d{5})@promma\.ac\.th$/);if(o){const a=o[1];_.innerHTML=`
                <span class="text-xs text-gray-500 dark:text-gray-400">เข้าสู่ระบบด้วย:</span>
                <button type="button" id="quick-my-score-btn" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 transition shadow-sm cursor-pointer">
                    <span>👤 ดูคะแนนของฉัน (${a})</span>
                </button>
            `,_.classList.remove("hidden"),document.getElementById("quick-my-score-btn")?.addEventListener("click",()=>{c.value=a,i.classList.remove("hidden"),U()})}else _.classList.add("hidden"),_.innerHTML=""};G.currentUser&&le(G.currentUser),G.onUserChange(le);function we(){V=!0;const e=document.querySelector(".student-card-container")?.dataset.studentId;if(e){const o=q.find(a=>a.id===e);o&&R(o)}document.getElementById("edit-mode-btn")?.classList.add("bg-green-600","text-white"),document.getElementById("edit-mode-btn")?.classList.remove("bg-gray-200","text-gray-700")}y&&y.addEventListener("submit",e=>{e.preventDefault(),L.value==="promma_dev"?(v.close(),we()):H&&(H.textContent="รหัสผ่านไม่ถูกต้อง")}),N&&N.addEventListener("click",()=>{navigator.clipboard.writeText(S.value).then(()=>{N.textContent="คัดลอกแล้ว!",setTimeout(()=>{N.textContent="คัดลอกโค้ด"},2e3)})}),E&&E.addEventListener("click",()=>{navigator.clipboard.writeText(D.value).then(()=>{E.textContent="คัดลอกแล้ว!",setTimeout(()=>{E.textContent="คัดลอกข้อมูล Log"},2e3)})}),re&&re.addEventListener("click",()=>{const e=S.value,o=new Blob([e],{type:"text/javascript;charset=utf-8;"}),a=document.createElement("a");a.href=URL.createObjectURL(o),a.download="score-overrides.js",document.body.appendChild(a),a.click(),document.body.removeChild(a)}),m.addEventListener("click",async e=>{const o=e.target.closest(".student-card-btn");if(!o)return;const a=o.dataset.studentId;if(!a)return;z("กำลังโหลดข้อมูล...","info");const b=q.find(n=>n.id===a);if(b){R(b);return}try{const n=await he(a);n?R(n):z("ไม่พบข้อมูลนักเรียนนี้ในระบบ","error")}catch(n){console.warn("Cloud ID lookup failed on card click:",n),z("ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้แบบเรียลไทม์ กรุณาลองใหม่","error")}});function Ce(e){const o=e.trim().toLowerCase(),a=o.match(/^ห้อง\s*(\d{1,2})$/);if(a)return a[1];const b=o.match(/\/(\d{1,2})$/);return b?b[1]:/^\d{1,2}$/.test(o)?o:null}async function U(){const e=c.value.trim();if(e.length===0){z("กรุณากรอกรหัสนักเรียนหรือห้องเรียนเพื่อค้นหา","error");return}const o=/^\d{5}$/.test(e),a=Ce(e);if(!o&&!a){z("กรุณากรอกรหัสนักเรียน 5 หลัก หรือเลขห้องเรียนให้ถูกต้อง (เช่น 42472, ห้อง 1, 4/1, 1)","error");return}h.disabled=!0;const b=h.innerHTML;h.innerHTML=`
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังค้นหา...
        `;try{if(o){const n=await he(e);n?(q=[n],ee=JSON.parse(JSON.stringify(q)),R(n)):z("ไม่พบข้อมูลนักเรียนนี้ในระบบ","error")}else{const n=await _e(a);if(n&&n.length>0){q=n,ee=JSON.parse(JSON.stringify(q)),m.innerHTML="";const P={cardType:"button",isClickable:()=>!0},M=document.createElement("div");M.className="mb-4 text-left border-b border-gray-200 dark:border-gray-700 pb-2",M.innerHTML=`
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit">รายชื่อนักเรียน ห้อง ม.4/${a}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">พบนักเรียนทั้งหมด ${n.length} คน (คลิกที่ชื่อเพื่อดูคะแนนเก็บและสถานะการส่งงาน)</p>
                    `,m.appendChild(M);const O=document.createElement("div");m.appendChild(O),Oe(n,O,P)}else z(`ไม่พบข้อมูลนักเรียนสำหรับห้อง ม.4/${a} ในภาคเรียนนี้`,"error")}}catch(n){console.error("Search failed:",n),z("เกิดข้อผิดพลาดในการดึงข้อมูลจากเซิร์ฟเวอร์ กรุณาลองใหม่","error")}finally{h.disabled=!1,h.innerHTML=b}}h.addEventListener("click",U),c.addEventListener("keydown",e=>{e.key==="Enter"&&U()});const ce=new URLSearchParams(window.location.search),Y=ce.get("id"),$e=ce.get("auto");Y&&/^\d{5}$/.test(Y)&&(c.value=Y,i.classList.remove("hidden"),$e==="1"&&U()),i.addEventListener("click",()=>{c.value="",g&&(m.innerHTML="",m.appendChild(g),g.classList.remove("hidden")),i.classList.add("hidden"),c.focus()}),c.addEventListener("input",()=>{i.classList.toggle("hidden",c.value.length===0)});function z(e,o="info"){g&&g.classList.add("hidden");const a=o==="error",b=a?'<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>':'<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',n=a?"bg-red-100 dark:bg-red-900/30":"bg-blue-100 dark:bg-blue-900/30",P=a?"border-red-500":"border-blue-500",M=a?"text-red-700 dark:text-red-300":"text-blue-700 dark:text-blue-300",O=a?"เกิดข้อผิดพลาด":"ข้อมูล";m.innerHTML=`
            <div class="anim-card-pop-in p-4 rounded-lg shadow-md border-l-4 ${n} ${P}" role="alert">
                <div class="flex">
                    <div class="flex-shrink-0 ${M}">
                        ${b}
                    </div>
                    <div class="ml-3">
                        <p class="font-bold ${M}">${O}</p>
                        <p class="text-sm mt-1 ${M}">${e}</p>
                    </div>
                </div>
            </div>
        `}function J(e){const o=parseFloat(e);return e==="4"||e==="4.0"||o===4?{textClass:"grade-text-4",heroClass:"grade-hero-4",chipClass:"chip-grade-4"}:o>=3?{textClass:"grade-text-3",heroClass:"grade-hero-3",chipClass:"chip-grade-3"}:o>=2?{textClass:"grade-text-2",heroClass:"grade-hero-2",chipClass:"chip-grade-2"}:o>=1?{textClass:"grade-text-1",heroClass:"grade-hero-1",chipClass:"chip-grade-1"}:{textClass:"grade-text-0",heroClass:"grade-hero-0",chipClass:"chip-grade-0"}}function Le(e,o,a){const b=e[a];if(!e.hasOwnProperty(a)||b===null)return"";let n;return V?n=`<input type="number" data-key="${a}" class="score-input w-20 text-right p-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" value="${b??""}">`:n=`<span class="font-mono text-sm text-gray-700 dark:text-gray-300">${Math.round(b)}</span>`,`
            <tr class="bg-gray-50/70 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-750/50">
                <td class="py-2 px-4 pl-8 sm:pl-10 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <div class="flex items-center gap-1.5">
                        <svg class="h-3 w-3 text-gray-400 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                        <span class="italic">${o}</span>
                    </div>
                </td>
                <td class="py-2 px-4 text-right">
                    ${n}
                </td>
            </tr>
        `}function R(e){g&&g.classList.add("hidden");const o=G.currentUser,a=!!(o&&o.email&&qe.includes(o.email.trim().toLowerCase()));let b=null;if(o&&o.email){const t=o.email.trim().toLowerCase().match(/^(\d{5})@promma\.ac\.th$/);t&&(b=t[1])}const n=!!(a||b&&b===e.id);e.assignments&&e.assignments.forEach(t=>{if(!e.hasOwnProperty(t.name)&&t.score!==null&&t.score!==void 0&&t.score!==""){const r=parseFloat(t.score);e[t.name]=isNaN(r)?t.score:r}});const P=X()==="2/2568";P&&(e.hasOwnProperty("กลางภาค")&&!e.hasOwnProperty("กลางภาค [20]")&&(e["กลางภาค [20]"]=e.กลางภาค),e.hasOwnProperty("ปลายภาค")&&!e.hasOwnProperty("ปลายภาค [30]")&&(e["ปลายภาค [30]"]=e.ปลายภาค));const M=["ก่อนกลางภาค [25]","กลางภาค [20]","หลังกลางภาค [25]","ก่อนปลายภาค [70]","ปลายภาค [30]","รวม [100]","เกรด"],O=P?{"ก่อนกลางภาค [25]":[{label:"บทที่ 6",key:"บท 6 [10]"},{label:"บทที่ 7",key:"บท 7 [10]"},{label:"กิจกรรม ธรณีพิบัติภัย",key:"กิจกรรม [5]"}],"หลังกลางภาค [25]":[{label:"บทที่ 8",key:"บท 8 [10]"},{label:"บทที่ 9",key:"บท 9 [5]"},{label:"บทที่ 10",key:"บท 10 [10]"}]}:{"ก่อนกลางภาค [25]":[{label:"บทที่ 1",key:"บท 1 [10]"},{label:"บทที่ 2",key:"บท 2 [10]"},{label:"บทที่ 3",key:"บท 3 [5]"}],"หลังกลางภาค [25]":[{label:"บทที่ 4",key:"บท 4 [10]"},{label:"บทที่ 5",key:"บท 5 [10]"},{label:"นำเสนอ",key:"นำเสนอ [5]"}]},Se=M.map(t=>{if(e.hasOwnProperty(t)){const r=e[t],s=t==="เกรด",d=t==="รวม [100]",k=t==="กลางภาค [20]",f=t==="ปลายภาค [30]",w=s||d||k||f,l=w?"bg-blue-50/70 dark:bg-gray-800/60":"",$=w?"font-bold text-blue-900 dark:text-blue-300":"font-medium text-gray-700 dark:text-gray-300";let p=w?"font-bold":"font-semibold",u="";if(!n&&(s||k||f))s?u='<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">🔒 เจ้าของบัญชีเท่านั้น</span>':u='<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">🔒 ข้อมูลส่วนบุคคล</span>';else if(V)u=`<input type="${typeof r=="number"&&!s?"number":"text"}" data-key="${t}" class="score-input w-24 text-right p-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" value="${r??""}">`;else{if(s){p+=" text-2xl ";const T=J(r);p+=` ${T.textClass} `}else if(d)p+=" text-xl text-green-600 dark:text-green-400";else if(k){const T=parseFloat(r);isNaN(T)?p+=" text-lg text-gray-900 dark:text-white":p+=T>=12?" text-lg text-green-600 dark:text-green-400":" text-lg text-red-600 dark:text-red-400"}else if(f){const T=parseFloat(r);isNaN(T)?p+=" text-lg text-gray-900 dark:text-white":p+=T>=15?" text-lg text-green-600 dark:text-green-400":" text-lg text-red-600 dark:text-red-400"}else p+=" text-gray-900 dark:text-white";let C=r??"-";typeof r=="number"&&!s&&(C=Math.round(r)),u=`<span class="${p}">${C}</span>`}let I="";const x=e.ซ่อมมั้ย||e.ซ่อมกลางภาค;if(t==="กลางภาค [20]"&&x&&x.trim()!=="-"){const C=x.trim();I=`<div class="mt-1"><span class="inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full border ${C.includes("ไม่ต้อง")||C.includes("ซ่อมแล้ว")?"bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800":"bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800"}">ซ่อมมั้ย: ${C}</span></div>`}let A=`
                    <tr class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${l}">
                        <td class="py-3 px-4 align-middle ${$}">
                            <div>${t}</div>
                            ${I}
                        </td>
                        <td class="py-3 px-4 text-right align-middle">
                            ${u}
                        </td>
                    </tr>
                `;return O[t]&&(n||t.includes("กลางภาค")||t==="รวม [100]")&&(A+=O[t].map(C=>!n&&(C.key.includes("กลางภาค [20]")||C.key.includes("ปลายภาค [30]"))?"":Le(e,C.label,C.key)).join("")),A}return""}).join(""),ge=e["รวม [100]"]!==void 0&&e["รวม [100]"]!==null?Math.round(Number(e["รวม [100]"])):"-",ue=e.เกรด!==void 0&&e.เกรด!==null?e.เกรด:"-",Ee=J(ue),Me=`
            <details class="summary-score-accordion group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6 transition-all duration-200">
                <summary class="p-3.5 sm:p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer list-none flex items-center justify-between select-none">
                    <div class="flex items-center gap-2 sm:gap-3">
                        <div class="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                            <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <span class="text-sm sm:text-base font-bold text-gray-900 dark:text-white font-kanit">สรุปคะแนนรายวิชา</span>
                            <span class="text-[11px] text-gray-400 dark:text-gray-500 block sm:hidden">แตะเพื่อย่อ/ขยายตาราง</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 sm:gap-3">
                        ${n?`
            <div class="flex items-center gap-1.5 sm:gap-2">
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold chip-total font-kanit shadow-xs">
                    รวม: ${ge}
                </span>
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold ${Ee.chipClass} font-kanit shadow-xs">
                    เกรด: ${ue}
                </span>
            </div>
        `:`
            <div class="flex items-center gap-1.5 sm:gap-2">
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold chip-total font-kanit shadow-xs">
                    รวม: ${ge}
                </span>
                <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                    🔒 โหมดเพื่อนดู
                </span>
            </div>
        `}
                        <div class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-transform duration-300 group-open:rotate-180">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </summary>
                <div class="border-t border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800/40">
                    <table class="w-full text-sm sm:text-base">
                        <tbody>
                            ${Se}
                        </tbody>
                    </table>
                </div>
            </details>
        `,Be=["กิจกรรม","แบบฝึก","quiz","ท้ายบท","ใบงาน"],B=(e.assignments||[]).filter(t=>t&&t.name&&Be.some(r=>t.name.toLowerCase().includes(r))),Q=B.filter(t=>{const r=t.score;if(r==null)return!1;const s=String(r).trim().toLowerCase();return s!==""&&s!=="-"&&s!=="ยังไม่ส่ง"}).length,Z=B.length-Q,me=B.length>0?Q/B.length*100:0,be=Re(B),Ie=`
            <div class="grid grid-cols-3 gap-2.5 sm:gap-4 mb-4">
                <button type="button" id="show-submitted-btn" class="p-3 sm:p-4 bg-green-50/80 dark:bg-green-950/30 rounded-xl text-center border border-green-200 dark:border-green-800 transition-transform transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm hover:shadow">
                    <div class="text-2xl sm:text-4xl font-extrabold text-green-600 dark:text-green-400 font-kanit">${Q}</div>
                    <div class="text-xs sm:text-sm font-medium text-green-800 dark:text-green-300 mt-1">งานที่ส่งแล้ว</div>
                </button>
                <button type="button" id="show-missing-btn" class="p-3 sm:p-4 bg-red-50/80 dark:bg-red-950/30 rounded-xl text-center border ${Z>0?"border-red-300 dark:border-red-700":"border-red-200 dark:border-red-800"} transition-transform transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer shadow-sm hover:shadow">
                    <div class="text-2xl sm:text-4xl font-extrabold text-red-600 dark:text-red-400 font-kanit">${Z}</div>
                    <div class="text-xs sm:text-sm font-medium text-red-800 dark:text-red-300 mt-1">งานที่ค้างส่ง</div>
                </button>
                <div class="p-3 sm:p-4 bg-blue-50/80 dark:bg-blue-950/30 rounded-xl text-center border border-blue-200 dark:border-blue-800 shadow-sm">
                    <div class="text-2xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-kanit">${me.toFixed(0)}%</div>
                    <div class="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300 mt-1">ความสมบูรณ์</div>
                </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6 overflow-hidden shadow-inner">
                <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-700" style="width: ${me}%"></div>
            </div>
        `,K=B.filter(t=>t.name.toLowerCase().includes("quiz"));K.sort((t,r)=>{const s=parseInt(t.name.match(/\d+/)?.[0]||0,10),d=parseInt(r.name.match(/\d+/)?.[0]||0,10);return s-d});let pe="";K.length>0&&(pe=`
                <figure class="mb-8">
                    <figcaption class="p-3.5 text-base sm:text-lg font-bold text-left text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800 rounded-t-xl border-x border-t border-gray-200 dark:border-gray-700 font-kanit flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                        </svg>
                        แบบทดสอบท้ายบท (Quiz)
                    </figcaption>
                    <div class="p-3 sm:p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-b-xl shadow-sm">
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                            ${K.map(r=>{const s=ve[r.name]||"#",d=r.score,k=d&&d.toString().trim()!==""&&d.toString().trim()!=="-"&&d.toString().toLowerCase()!=="ยังไม่ส่ง"&&!isNaN(parseFloat(d)),f=parseFloat(d),w=k&&!isNaN(f)&&f>=8;let l,$,p,u;k?w?(l=`<span class="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold quiz-badge-gold rounded-full shadow-xs whitespace-nowrap">${n?`⭐ ${d} คะแนน`:"⭐ ดีเยี่ยม"}</span>`,$="quiz-card-gold hover:shadow-amber-500/10 hover:border-amber-400",p="quiz-text-gold",u=`
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        `):(l=`<span class="px-2.5 py-0.5 text-xs font-bold text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50 rounded-full border border-green-200 dark:border-green-800 whitespace-nowrap">${n?`${d} คะแนน`:"ส่งแล้ว ✓"}</span>`,$="border-green-200 dark:border-green-800/80 bg-green-50/40 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-900/30",p="text-green-600 dark:text-green-400",u=`
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        `):(l='<span class="px-2.5 py-0.5 text-xs font-bold text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50 rounded-full border border-red-200 dark:border-red-800 whitespace-nowrap">ยังไม่ทำ</span>',$="border-red-200 dark:border-red-800/80 bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-900/30",p="text-red-600 dark:text-red-400",u=`
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    `);const I=k?w?'<span class="quiz-text-gold font-semibold">ยอดเยี่ยม!</span>':"คลิกดูแบบทดสอบ":'<span class="text-blue-600 dark:text-blue-400 font-bold">คลิกทำแบบทดสอบ ↗</span>';return`
                    <a href="${s}" target="_blank" rel="noopener noreferrer" class="group flex items-center justify-between p-3 sm:p-3.5 rounded-xl border ${$} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                        <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                            <div class="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700 ${p} shrink-0">
                                ${u}
                            </div>
                            <div class="min-w-0">
                                <h4 class="font-bold text-gray-900 dark:text-white font-kanit group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm sm:text-base truncate">${r.name}</h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                                    ${I}
                                </p>
                            </div>
                        </div>
                        <div class="shrink-0 flex items-center">
                            ${l}
                        </div>
                    </a>
                `}).join("")}
                        </div>
                    </div>
                </figure>
            `);let xe="";if(Object.keys(be).length>0){const t=Object.entries(be).map(([r,s])=>{const d=s.filter(f=>{const w=f.score;if(w==null)return!0;const l=String(w).trim().toLowerCase();return l===""||l==="-"||l==="ยังไม่ส่ง"}).length,k=d>0?`<span class="chapter-badge px-2 py-0.5 text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full border border-red-200 dark:border-red-800">ค้าง ${d} งาน</span>`:'<span class="chapter-badge px-2 py-0.5 text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">ครบแล้ว ✓</span>';return`
                    <details class="chapter-details group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300 open:ring-2 open:ring-blue-500/50 open:shadow-md" data-has-missing="${d>0}">
                        <summary class="flex justify-between items-center p-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div class="flex items-center gap-2.5">
                                <h4 class="font-bold text-gray-800 dark:text-gray-200 font-kanit text-sm sm:text-base">${r}</h4>
                                ${k}
                            </div>
                            <svg class="h-5 w-5 text-gray-400 transition-transform duration-300 group-open:rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                            </svg>
                        </summary>
                        <div class="border-t border-gray-200 dark:border-gray-700">
                            <ul class="divide-y divide-gray-200 dark:divide-gray-700/60">
                                ${s.map(ke).join("")}
                            </ul>
                        </div>
                    </details>
                `}).join("");xe=`
                <figure class="mt-8">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <figcaption class="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-kanit flex items-center gap-2">
                            <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>รายการงานที่ต้องส่ง</span>
                        </figcaption>
                        <!-- Filter Tabs -->
                        <div class="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
                            <button type="button" class="assignment-filter-btn px-3 py-1.5 rounded-lg transition active bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm cursor-pointer" data-filter="all">
                                ทั้งหมด (${B.length})
                            </button>
                            <button type="button" class="assignment-filter-btn px-3 py-1.5 rounded-lg transition text-gray-600 dark:text-gray-400 hover:text-red-600 cursor-pointer" data-filter="missing">
                                ค้างส่ง (${Z})
                            </button>
                            <button type="button" class="assignment-filter-btn px-3 py-1.5 rounded-lg transition text-gray-600 dark:text-gray-400 hover:text-green-600 cursor-pointer" data-filter="submitted">
                                ส่งแล้ว (${Q})
                            </button>
                        </div>
                    </div>
                    <div id="assignment-accordion-list" class="space-y-3">
                        ${t}
                    </div>
                </figure>
            `}let W="";if(n&&e.hasOwnProperty("เกรด")){const t=e.เกรด;W=`
                <div class="flex-shrink-0 flex items-center gap-1.5 sm:flex-col sm:justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl ${J(t).heroClass} text-center self-start sm:self-auto shadow-md">
                    <span class="text-[11px] font-medium opacity-90">เกรดเฉลี่ย</span>
                    <span class="text-xl sm:text-2xl font-extrabold font-kanit leading-none">${t}</span>
                </div>
            `}else n||(W=`
                <div class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-gray-600 shadow-sm self-start sm:self-auto">
                    <span>🤝 โหมดเพื่อนดู</span>
                </div>
            `);const Ae=n?"":`
            <div class="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-3 shadow-sm">
                <div class="text-2xl select-none">🤝</div>
                <div class="text-xs sm:text-sm">
                    <div class="font-bold flex items-center gap-2">
                        <span>โหมดเพื่อนช่วยเช็คงาน (Peer Assist View)</span>
                        <span class="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">ปกป้องข้อมูลส่วนตัว</span>
                    </div>
                    <p class="text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                        ระบบแสดงคะแนนเก็บ รายการงานค้าง และสถานะการสอบซ่อม เพื่อให้เพื่อนช่วยเตือนกันได้สะดวก<br class="hidden sm:inline">
                        <span class="opacity-80">เกรดและคะแนนสอบทางการจะแสดงเมื่อเจ้าตัวเข้าสู่ระบบด้วยอีเมลโรงเรียน</span>
                    </p>
                </div>
            </div>
        `;m.innerHTML=`
            <div class="student-card-container bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden anim-card-pop-in" data-student-id="${e.id}">
                <!-- Student Card Header -->
                <div class="p-4 sm:p-6 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-start sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div class="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div class="min-w-0">
                            <h2 class="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white font-kanit truncate">${e.name}</h2>
                            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 font-medium">
                                <span class="inline-flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">รหัส: <strong class="text-blue-600 dark:text-blue-400 font-mono">${e.id}</strong></span>
                                ${e.room?`<span class="inline-flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">ห้อง: <strong class="text-blue-600 dark:text-blue-400">${e.room}</strong></span>`:""}
                                ${e.ordinal?`<span class="inline-flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">เลขที่: <strong class="text-blue-600 dark:text-blue-400">${e.ordinal}</strong></span>`:""}
                            </div>
                        </div>
                    </div>
                    ${W}
                </div>

                <div class="p-5 sm:p-6 space-y-6">
                    ${Ae}
                    ${Ie}
                    ${Me}
                    ${pe}
                    ${xe}
                </div>

                <div id="edit-controls-container" class="p-4 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 ${V?"":"hidden"}">
                    <button id="save-overrides-btn" data-studentid="${e.id}" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                        สร้างโค้ดสำหรับบันทึกการแก้ไข
                    </button>
                </div>
            </div>
        `,document.getElementById("show-submitted-btn")?.addEventListener("click",()=>{const t=B.filter(r=>{const s=r.score;if(s==null)return!1;const d=String(s).trim().toLowerCase();return d!==""&&d!=="-"&&d!=="ยังไม่ส่ง"});ye("submitted",`งานที่ส่งแล้ว (${t.length} รายการ)`,t)}),document.getElementById("show-missing-btn")?.addEventListener("click",()=>{const t=B.filter(r=>{const s=r.score;if(s==null)return!0;const d=String(s).trim().toLowerCase();return d===""||d==="-"||d==="ยังไม่ส่ง"});ye("missing",`งานที่ค้างส่ง (${t.length} รายการ)`,t)});const fe=document.querySelectorAll(".assignment-filter-btn"),He=document.querySelectorAll(".chapter-details");fe.forEach(t=>{t.addEventListener("click",()=>{const r=t.dataset.filter;fe.forEach(s=>{s.classList.remove("bg-white","dark:bg-gray-700","text-blue-600","dark:text-blue-400","shadow-sm"),s.classList.add("text-gray-600","dark:text-gray-400")}),t.classList.add("bg-white","dark:bg-gray-700","text-blue-600","dark:text-blue-400","shadow-sm"),t.classList.remove("text-gray-600","dark:text-gray-400"),He.forEach(s=>{const d=s.dataset.hasMissing==="true",k=s.querySelectorAll(".assignment-item");if(r==="missing")d?(s.classList.remove("hidden"),s.open=!0,k.forEach(f=>{f.classList.toggle("hidden",f.dataset.status!=="missing")})):s.classList.add("hidden");else if(r==="submitted"){let f=0;k.forEach(w=>{const l=w.dataset.status==="submitted";w.classList.toggle("hidden",!l),l&&f++}),f===0?s.classList.add("hidden"):s.classList.remove("hidden")}else s.classList.remove("hidden"),k.forEach(f=>f.classList.remove("hidden"))})})}),document.getElementById("edit-mode-btn")?.addEventListener("click",()=>{V?(V=!1,R(e)):v.open()}),document.getElementById("save-overrides-btn")?.addEventListener("click",async t=>{const r=t.target.dataset.studentid,s=q.find(l=>l.id===r),d=ee.find(l=>l.id===r);if(!d||!s){alert("Error: Could not find student data to compare.");return}const k={},f=[];let w=!1;if(document.querySelectorAll(".score-input").forEach(l=>{const $=l.dataset.key,p=d[$];let u=l.value;typeof p=="number"&&(u=u===""?null:parseFloat(u),isNaN(u)&&(u=null));const I=p!=null,x=u!=null;(I!==x||I&&x&&u!==p)&&(k[$]=u,w=!0,f.push({timestamp:new Date().toISOString(),student_id:r,student_name:s.name,score_key:$,original_value:p??"N/A",new_value:u??"N/A"}))}),w){let l={};try{const x=await ze(()=>import("./score-overrides-BZG-1gOY.js"),[]);x.encryptedScoreOverrides&&x.encryptedScoreOverrides.trim()!==""&&(l=JSON.parse(atob(x.encryptedScoreOverrides)))}catch{console.log("No existing score-overrides.js found or it's empty, creating new one.")}const $={...l};$[r]={...l[r]||{},...k};const p=btoa(JSON.stringify($,null,2));S.value=`export const encryptedScoreOverrides = "${p}"; `;const u=`timestamp,student_id,student_name,score_key,original_value,new_value
`,I=f.map(x=>{const A=C=>`"${String(C??"").replace(/"/g,'""')}"`;return[A(x.timestamp),A(x.student_id),A(x.student_name),A(x.score_key),A(x.original_value),A(x.new_value)].join(",")}).join(`
`);D.value=u+I,j.open()}else alert("ไม่มีการเปลี่ยนแปลงคะแนน")})}}function ke(c){const h=ve[c.name]||null,m=c.name.toLowerCase(),i=Pe[m]||c.name,g=c.score;let v,y=!1;if(isNaN(parseFloat(g))){y=!!(g&&g.toString().trim()!==""&&g.toString().trim()!=="-"&&g.toString().toLowerCase()!=="ยังไม่ส่ง");const j=y?"text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/50 border border-green-200 dark:border-green-800":"text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/50 border border-red-200 dark:border-red-800";let S=g||"ยังไม่ส่ง";!y&&m.includes("quiz")&&(S="ขาด"),v=`<span class="px-2.5 py-0.5 text-xs font-semibold ${j} rounded-full">${S}</span>`}else y=!0,parseFloat(g)>=8&&m.includes("quiz")?v=`<span class="inline-flex items-center gap-1 font-mono font-bold quiz-badge-gold px-2 py-0.5 rounded-full text-xs">⭐ ${g}</span>`:v=`<span class="font-mono font-bold text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">${g}</span>`;const L=y?"submitted":"missing",H=`
    <div class="flex-grow min-w-0 pr-4">
        <span class="text-gray-800 dark:text-gray-200 text-sm font-medium">${i}</span>
    </div>
    <div class="flex items-center gap-2.5 flex-shrink-0">
        ${v}
        ${h?`
            <span class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/60 transition-colors">
                ทำทันที ↗
            </span>
        `:""}
    </div>
    `;return h?`<li class="assignment-item block" data-status="${L}"><a href="${h}" target="_blank" rel="noopener noreferrer" class="group flex justify-between items-center py-3 px-4 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200">${H}</a></li>`:`<li class="assignment-item flex justify-between items-center py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200" data-status="${L}">${H}</li>`}function ye(c,h,m){const i=`interactive-assignment-modal-${c}`,g=document.getElementById(i);g&&g.remove();const v=`interactive-assignment-content-${c}`,y=`
        <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                </div>
                <input type="text" id="modal-search-input-${c}" placeholder="ค้นหาชื่องาน..." class="w-full p-2 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400">
            </div>
        </div>
    `,L=`
        <div id="${i}" class="modal fixed inset-0 flex items-center justify-center z-[9999] hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title-${i}">
            <div data-modal-overlay class="absolute inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm" aria-hidden="true"></div>
            <div class="modal-container relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
                <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 id="modal-title-${i}" class="text-xl font-bold text-gray-900 dark:text-white font-kanit">${h}</h2>
                    <button data-modal-close class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors" aria-label="Close modal">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                ${y}
                <div id="${v}" class="p-4 sm:p-6 flex-grow overflow-y-auto modern-scrollbar">
                    <!-- Assignment list will be rendered here -->
                </div>
            </div>
        </div>
    `;document.getElementById("modals-placeholder").insertAdjacentHTML("beforeend",L),document.getElementById(i);const H=document.getElementById(v),j=document.getElementById(`modal-search-input-${c}`),S=()=>{const N=j.value.toLowerCase(),D=m.filter(E=>!N||E.name&&E.name.toLowerCase().includes(N));if(D.length===0)H.innerHTML='<p class="text-center text-gray-500 dark:text-gray-400 py-8">ไม่พบรายการที่ตรงกับคำค้นหา</p>';else{const E=D.map(ke).join("");H.innerHTML=`<ul class="divide-y divide-gray-200 dark:divide-gray-700">${E}</ul>`}};j.addEventListener("input",S),S(),new te(i).open()}function Re(c){if(!c||c.length===0)return{};const h=c.reduce((i,g)=>{const v=g.name.toLowerCase();if(Ve.some(L=>L.test(v)))return i;let y;if(v.includes("mid")||v.includes("ซ่อมแล้วกลางภาค"))y="กลางภาค";else if(v.includes("quiz"))y="แบบทดสอบท้ายบท (Quiz)";else{const L=v.match(/(\d+)/);y=L?`บทที่ ${L[1]}`:"อื่นๆ"}return i[y]||(i[y]=[]),i[y].push(g),i},{}),m={};return De.forEach(i=>{h[i]&&(m[i]=h[i])}),Object.keys(h).forEach(i=>{m[i]||(m[i]=h[i])}),X()==="2/2568"&&delete m["บทที่ 5"],delete m["แบบทดสอบท้ายบท (Quiz)"],m}export{Re as groupAssignments,Ke as initializeScoreSearch};

import{_ as ye}from"./physics_syllabus_data-Mnn3TXVG.js";import{getCurrentSemester as V,setCurrentSemester as ve,getCurrentCourseCode as ke,getSemesterSummary as we,getSingleStudentScoreFromCloud as de,getStudentsByRoomFromCloud as Ce}from"./data-manager-Dj4VFpfw.js";import{M as Z}from"./modal-handler-CjwIEypi.js";import{r as $e}from"./student-card-renderer-Dri2xE_r.js";import{a as le}from"./auth-manager-DxJDYVU6.js";import"./firebase-config-L8WamaTR.js";const ie=["taweerak.t@promma.ac.th","boonyaporn.kha@promma.ac.th","praewa.p@promma.ac.th","manthana.k@promma.ac.th"],ge={"กิจกรรม 1.1":"https://forms.office.com/r/KFtWGZEb7S","แบบฝึก 1.1":"https://forms.office.com/r/abX7Vtwtww","แบบฝึก 1.2":"https://forms.office.com/r/Bsxg9Yx9JD","ท้ายบท 1":"https://forms.office.com/r/AFG3Ymt4Ni","Quiz 1":"https://forms.office.com/r/G4hdEDwbcX","แบบฝึก 2.1":"https://forms.office.com/r/tYmRtd438x","แบบฝึก 2.2":"https://forms.office.com/r/u785wcNf3X","ท้ายบท 2":"https://forms.office.com/r/MF4mget9mY","Quiz 2":"https://forms.office.com/r/a2AYEKGPPv","แบบฝึก 3.1":"https://forms.office.com/r/ubX306JhHy","ท้ายบท 3":"https://forms.office.com/r/VAic0B5szk","Quiz 3":"https://forms.office.com/r/2zMb0Xzrc9","แบบฝึก 4.1":"https://forms.office.com/r/ArkkdbnpXb","ท้ายบท 4":"https://forms.office.com/r/L8BwGLdh4V","Quiz 4":"https://forms.office.com/r/zfvAMhzHVq","แบบฝึก 5.1":"https://forms.cloud.microsoft/r/vEjY1BajQQ","แบบฝึก 5.2":"https://forms.cloud.microsoft/r/mmB2LXmSNn","ท้ายบท 5":"https://forms.cloud.microsoft/r/1uf2B3y7sM","Quiz 5":"https://forms.cloud.microsoft/r/gMTxMUjiT6","Quiz 6":"https://forms.office.com/r/dAs6nwpZ9e","Quiz 7":"https://forms.office.com/r/x6XEYgXLMG","Quiz 8":"https://forms.office.com/r/LmJASCtdX2","Quiz 9":"https://forms.office.com/r/jiUCum58kV","Quiz 10":"https://forms.office.com/r/ZcvePkp98p"},Ee={"mid [20]":"คะแนนข้อกา (30)","mid [10]":"คะแนนข้อเขียน (10)","mid [20]2":"คะแนนกลางภาค (20)"},Le=[/^บท\s\d+\s\[\d+\]$/,/ก่อนปลายภาค/,/นำเสนอ/],Se=["บทที่ 1","บทที่ 2","บทที่ 3","กลางภาค","บทที่ 4","บทที่ 5","บทที่ 6","บทที่ 7","บทที่ 8","บทที่ 9","บทที่ 10","อื่นๆ"];let P=!1,T=[],J=[];async function Te(){const i=document.getElementById("student-id-input"),f=document.getElementById("search-btn"),c=document.getElementById("result-container"),s=document.getElementById("clear-btn"),m=document.getElementById("default-message"),h=new Z("dev-password-modal"),y=document.getElementById("dev-password-form"),w=document.getElementById("dev-password-input"),A=document.getElementById("dev-password-error"),j=new Z("override-code-modal"),O=document.getElementById("override-code-content"),z=document.getElementById("copy-override-code-btn"),R=document.getElementById("log-data-content"),L=document.getElementById("copy-log-data-btn"),K=document.getElementById("download-override-file-btn"),q=document.getElementById("semester-selector");q&&(q.value=V(),q.addEventListener("change",()=>{ve(q.value),window.location.reload()}));const W=document.querySelector(".max-w-3xl.mx-auto"),ee=document.querySelector("#student-id-input")?.closest(".bg-white"),te=V(),re=ke(),oe=document.getElementById("course-code-display"),se=document.getElementById("title-course-code");oe&&(oe.textContent=re),se&&(se.textContent=re);try{const e=await we(te);if(e&&e.lastUpdated&&W&&ee){const o=new Date(e.lastUpdated).toLocaleString("th-TH",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Bangkok"}),a=document.createElement("div");a.className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4 -mt-4",a.textContent=`อัปเดตข้อมูลล่าสุด: ${o} น.`,W.insertBefore(a,ee)}}catch(e){console.warn("Could not load lastUpdated for semester",te,e)}if(!i||!f||!c||!s){console.error("Required elements for score search are missing from the DOM.");return}function me(){P=!0;const e=document.querySelector(".student-card-container")?.dataset.studentId;if(e){const d=T.find(o=>o.id===e);d&&D(d)}document.getElementById("edit-mode-btn")?.classList.add("bg-green-600","text-white"),document.getElementById("edit-mode-btn")?.classList.remove("bg-gray-200","text-gray-700")}y&&y.addEventListener("submit",e=>{e.preventDefault(),w.value==="promma_dev"?(h.close(),me()):A&&(A.textContent="รหัสผ่านไม่ถูกต้อง")}),z&&z.addEventListener("click",()=>{navigator.clipboard.writeText(O.value).then(()=>{z.textContent="คัดลอกแล้ว!",setTimeout(()=>{z.textContent="คัดลอกโค้ด"},2e3)})}),L&&L.addEventListener("click",()=>{navigator.clipboard.writeText(R.value).then(()=>{L.textContent="คัดลอกแล้ว!",setTimeout(()=>{L.textContent="คัดลอกข้อมูล Log"},2e3)})}),K&&K.addEventListener("click",()=>{const e=O.value,d=new Blob([e],{type:"text/javascript;charset=utf-8;"}),o=document.createElement("a");o.href=URL.createObjectURL(d),o.download="score-overrides.js",document.body.appendChild(o),o.click(),document.body.removeChild(o)}),c.addEventListener("click",async e=>{const d=e.target.closest(".student-card-btn");if(!d)return;const o=d.dataset.studentId;if(!o)return;const a=le.currentUser,u=a&&a.email&&ie.includes(a.email.trim().toLowerCase());let v=null;if(a&&a.email){const n=a.email.trim().toLowerCase().match(/^(\d{5})@promma\.ac\.th$/);n&&(v=n[1])}if(!u&&(!v||o!==v)){S("คุณไม่มีสิทธิ์เข้าถึงข้อมูลคะแนนของนักเรียนคนอื่นเพื่อความเป็นส่วนตัว","error");return}S("กำลังโหลดข้อมูล...","info");const C=T.find(n=>n.id===o);if(C){D(C);return}try{const n=await de(o);n?D(n):S("ไม่พบข้อมูลนักเรียนนี้ในระบบ","error")}catch(n){console.warn("Cloud ID lookup failed on card click:",n),S("ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้แบบเรียลไทม์ กรุณาลองใหม่","error")}});function fe(e){const d=e.trim().toLowerCase(),o=d.match(/^ห้อง\s*(\d{1,2})$/);if(o)return o[1];const a=d.match(/\/(\d{1,2})$/);return a?a[1]:/^\d{1,2}$/.test(d)?d:null}const G=async()=>{const e=i.value.trim();if(e.length===0){S("กรุณากรอกรหัสนักเรียนหรือห้องเรียนเพื่อค้นหา","error");return}const d=/^\d{5}$/.test(e),o=fe(e);if(!d&&!o){S("กรุณากรอกรหัสนักเรียน 5 หลัก หรือเลขห้องเรียนให้ถูกต้อง (เช่น 42472, ห้อง 1, 4/1, 1)","error");return}f.disabled=!0;const a=f.innerHTML;f.innerHTML=`
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังค้นหา...
        `;try{if(d){const u=await de(e);u?(T=[u],J=JSON.parse(JSON.stringify(T)),D(u)):S("ไม่พบข้อมูลนักเรียนนี้ในระบบ","error")}else{const u=await Ce(o);if(u&&u.length>0){T=u,J=JSON.parse(JSON.stringify(T)),c.innerHTML="";const v=le.currentUser,C=v&&v.email&&ie.includes(v.email.trim().toLowerCase());let n=null;if(v&&v.email){const H=v.email.trim().toLowerCase().match(/^(\d{5})@promma\.ac\.th$/);H&&(n=H[1])}const F={cardType:"button",isClickable:H=>!!(C||n&&H.id===n)},U=document.createElement("div");U.className="mb-4 text-left border-b border-gray-200 dark:border-gray-700 pb-2",U.innerHTML=`
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit">รายชื่อนักเรียน ห้อง ม.4/${o}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">พบนักเรียนทั้งหมด ${u.length} คน ${C?"(คุณอยู่ในสิทธิ์ครู: สามารถคลิกดูคะแนนรายบุคคลได้)":n?"(คุณสามารถคลิกดูคะแนนเฉพาะของตัวคุณเองได้)":"(ไม่อนุญาตให้คลิกดูคะแนนรายบุคคล เพื่อความเป็นส่วนตัว)"}</p>
                    `,c.appendChild(U);const Q=document.createElement("div");c.appendChild(Q),$e(u,Q,F)}else S(`ไม่พบข้อมูลนักเรียนสำหรับห้อง ม.4/${o} ในภาคเรียนนี้`,"error")}}catch(u){console.error("Search failed:",u),S("เกิดข้อผิดพลาดในการดึงข้อมูลจากเซิร์ฟเวอร์ กรุณาลองใหม่","error")}finally{f.disabled=!1,f.innerHTML=a}};f.addEventListener("click",G),i.addEventListener("keydown",e=>{e.key==="Enter"&&G()});const ne=new URLSearchParams(window.location.search),X=ne.get("id"),be=ne.get("auto");X&&/^\d{5}$/.test(X)&&(i.value=X,s.classList.remove("hidden"),be==="1"&&G()),s.addEventListener("click",()=>{i.value="",m&&(c.innerHTML="",c.appendChild(m),m.classList.remove("hidden")),s.classList.add("hidden"),i.focus()}),i.addEventListener("input",()=>{s.classList.toggle("hidden",i.value.length===0)});function S(e,d="info"){m&&m.classList.add("hidden");const o=d==="error",a=o?'<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>':'<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',u=o?"bg-red-100 dark:bg-red-900/30":"bg-blue-100 dark:bg-blue-900/30",v=o?"border-red-500":"border-blue-500",C=o?"text-red-700 dark:text-red-300":"text-blue-700 dark:text-blue-300",n=o?"เกิดข้อผิดพลาด":"ข้อมูล";c.innerHTML=`
            <div class="anim-card-pop-in p-4 rounded-lg shadow-md border-l-4 ${u} ${v}" role="alert">
                <div class="flex">
                    <div class="flex-shrink-0 ${C}">
                        ${a}
                    </div>
                    <div class="ml-3">
                        <p class="font-bold ${C}">${n}</p>
                        <p class="text-sm mt-1 ${C}">${e}</p>
                    </div>
                </div>
            </div>
        `}function pe(e,d,o){const a=e[o];if(!e.hasOwnProperty(o)||a===null)return"";let u;return P?u=`<input type="number" data-key="${o}" class="score-input w-20 text-right p-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" value="${a??""}">`:u=`<span class="font-mono text-sm text-gray-700 dark:text-gray-300">${Math.round(a)}</span>`,`
        <tr class="bg-gray-50 dark:bg-gray-800/50">
                <td class="py-2 px-4 pl-10 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <svg class="h-3 w-3 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                    </svg>
                    <span class="italic">${d}</span>
                </td>
                <td class="py-2 px-4 text-right">
                    ${u}
                </td>
            </tr>
        `}function D(e){m&&m.classList.add("hidden"),e.assignments&&e.assignments.forEach(t=>{if(!e.hasOwnProperty(t.name)&&t.score!==null&&t.score!==void 0&&t.score!==""){const r=parseFloat(t.score);e[t.name]=isNaN(r)?t.score:r}});const d=V()==="2/2568";d&&(e.hasOwnProperty("กลางภาค")&&!e.hasOwnProperty("กลางภาค [20]")&&(e["กลางภาค [20]"]=e.กลางภาค),e.hasOwnProperty("ปลายภาค")&&!e.hasOwnProperty("ปลายภาค [30]")&&(e["ปลายภาค [30]"]=e.ปลายภาค));const o=["ก่อนกลางภาค [25]","กลางภาค [20]","หลังกลางภาค [25]","ก่อนปลายภาค [70]","ปลายภาค [30]","รวม [100]","เกรด"],a=d?{"ก่อนกลางภาค [25]":[{label:"บทที่ 6",key:"บท 6 [10]"},{label:"บทที่ 7",key:"บท 7 [10]"},{label:"กิจกรรม ธรณีพิบัติภัย",key:"กิจกรรม [5]"}],"หลังกลางภาค [25]":[{label:"บทที่ 8",key:"บท 8 [10]"},{label:"บทที่ 9",key:"บท 9 [5]"},{label:"บทที่ 10",key:"บท 10 [10]"}],"รวม [100]":[{label:"คะแนนก่อนสอบกลางภาค",key:"ก่อนกลางภาค [25]"},{label:"คะแนนสอบกลางภาค",key:"กลางภาค [20]"},{label:"คะแนนก่อนสอบปลายภาค",key:"ก่อนปลายภาค [70]"},{label:"คะแนนสอบปลายภาค",key:"ปลายภาค [30]"}]}:{"ก่อนกลางภาค [25]":[{label:"บทที่ 1",key:"บท 1 [10]"},{label:"บทที่ 2",key:"บท 2 [10]"},{label:"บทที่ 3",key:"บท 3 [5]"}],"หลังกลางภาค [25]":[{label:"บทที่ 4",key:"บท 4 [10]"},{label:"บทที่ 5",key:"บท 5 [10]"},{label:"นำเสนอ",key:"นำเสนอ [5]"}],"รวม [100]":[{label:"คะแนนก่อนสอบกลางภาค",key:"ก่อนกลางภาค [25]"},{label:"คะแนนสอบกลางภาค",key:"กลางภาค [20]"},{label:"คะแนนก่อนสอบปลายภาค",key:"ก่อนปลายภาค [70]"},{label:"คะแนนสอบปลายภาค",key:"ปลายภาค [30]"}]},v=`
        <figure class="mb-6">
                <figcaption class="p-3 text-lg font-semibold text-left text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800 rounded-t-lg border-x border-t border-gray-200 dark:border-gray-700">
                    สรุปคะแนน
                </figcaption>
                <div class="border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
                    <table class="w-full text-base">
                        <tbody>
                            ${o.map(t=>{if(e.hasOwnProperty(t)){const r=e[t],$=t==="เกรด",k=t==="รวม [100]",N=t==="กลางภาค [20]",M=t==="ปลายภาค [30]",E=$||k||N||M,p=E?"bg-blue-50 dark:bg-gray-800/60":"",I=E?"font-bold text-blue-900 dark:text-blue-300":"font-medium text-gray-700 dark:text-gray-300";let g=E?"font-bold":"font-semibold";if($){g+=" text-2xl ";const l=parseFloat(r);r==="4"||r==="4.0"||l===4?g+="text-green-600 dark:text-green-400":l>=3?g+="text-blue-600 dark:text-blue-400":l>=2?g+="text-yellow-600 dark:text-yellow-400":l>=1?g+="text-orange-500 dark:text-orange-400":g+="text-red-600 dark:text-red-400"}else if(k)g+=" text-xl text-green-600 dark:text-green-400";else if(N){const l=parseFloat(r);isNaN(l)?g+=" text-lg text-gray-900 dark:text-white":g+=l>=12?" text-lg text-green-600 dark:text-green-400":" text-lg text-red-600 dark:text-red-400"}else if(M){const l=parseFloat(r);isNaN(l)?g+=" text-lg text-gray-900 dark:text-white":g+=l>=18?" text-lg text-green-600 dark:text-green-400":" text-lg text-red-600 dark:text-red-400"}else g+=" text-gray-900 dark:text-white";let x;if(P)x=`<input type="${typeof r=="number"&&!$?"number":"text"}" data-key="${t}" class="score-input w-24 text-right p-1 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" value="${r??""}">`;else{let l=r??"-";typeof r=="number"&&!$&&(l=Math.round(r)),x=`<span class="${g}">${l}</span>`}let _="";const b=e.ซ่อมมั้ย||e.ซ่อมกลางภาค;if(t==="กลางภาค [20]"&&b&&b.trim()!=="-"){const l=b.trim();_=`<div class="pt-1.5"><span class="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${l.includes("ไม่ต้อง")||l.includes("ซ่อมแล้ว")?"bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800":"bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800"}">ซ่อมมั้ย?: ${l}</span></div>`}let B=`
        <tr class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${p}">
                        <td class="py-3 px-4 ${I}">${t}</td>
                        <td class="py-3 px-4 text-right">
                            ${x}
                            ${_}
                        </td>
                    </tr>
        `;return a[t]&&(B+=a[t].map(l=>pe(e,l.label,l.key)).join("")),B}return""}).join("")}
                        </tbody>
                    </table>
                </div>
            </figure>
        `,C=["กิจกรรม","แบบฝึก","quiz","ท้ายบท","ใบงาน"],n=e.assignments.filter(t=>C.some(r=>t.name.toLowerCase().includes(r))),F=n.filter(t=>t.score&&t.score.toLowerCase()!=="ยังไม่ส่ง").length,U=n.length-F,Q=n.length>0?F/n.length*100:0,H=Me(n),xe=`
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <button id="show-submitted-btn" class="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-center border border-green-200 dark:border-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                    <div class="text-4xl font-bold text-green-600 dark:text-green-400">${F}</div>
                    <div class="text-sm font-medium text-green-800 dark:text-green-300">งานที่ส่งแล้ว</div>
                </button>
                <button id="show-missing-btn" class="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg text-center border border-red-200 dark:border-red-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                    <div class="text-4xl font-bold text-red-600 dark:text-red-400">${U}</div>
                    <div class="text-sm font-medium text-red-800 dark:text-red-300">งานที่ค้างส่ง</div>
                </button>
                <div class="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-center border border-blue-200 dark:border-blue-700">
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">${Q.toFixed(0)}%</div>
                    <div class="text-sm font-medium text-blue-800 dark:text-blue-300">ความสมบูรณ์</div>
                </div>
            </div>
        <div class="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 mb-8 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500" style="width: ${Q}%"></div>
        </div>
    `,Y=n.filter(t=>t.name.toLowerCase().includes("quiz"));Y.sort((t,r)=>{const $=parseInt(t.name.match(/\d+/)?.[0]||0,10),k=parseInt(r.name.match(/\d+/)?.[0]||0,10);return $-k});let ae="";Y.length>0&&(ae=`
        <figure class="mb-8">
                    <figcaption class="p-3 text-lg font-semibold text-left text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800 rounded-t-lg border-x border-t border-gray-200 dark:border-gray-700 font-kanit flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                        </svg>
                        Quiz
                    </figcaption>
                    <div class="p-4 sm:p-5 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-b-lg shadow-inner">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                            ${Y.map(r=>{const $=ge[r.name]||"#",k=r.score,N=k&&k.toLowerCase()!=="ยังไม่ส่ง"&&!isNaN(parseFloat(k));let M,E,p;return N?(M=`<span class="px-2.5 py-1 text-xs font-bold text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50 rounded-full border border-green-200 dark:border-green-800">${k}</span>`,E="border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20",p="text-green-500"):(M='<span class="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50 rounded-full border border-red-200 dark:border-red-800">ขาด</span>',E="border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20",p="text-red-500"),`
        <a href="${$}" target="_blank" rel="noopener noreferrer" class="group flex flex-col justify-between p-4 rounded-xl border ${E} transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div class="flex justify-between items-start mb-3">
                            <div class="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ${p}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            ${M}
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-900 dark:text-white font-kanit group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${r.name}</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">คลิกเพื่อทำแบบทดสอบ <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></p>
                        </div>
                    </a>
        `}).join("")}
                        </div>
                    </div>
                </figure>
        `);const he=Object.keys(H).length>0?`
        <figure>
                <figcaption class="p-4 text-lg font-semibold text-left text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800">
                    รายการงานที่ต้องส่ง
                </figcaption>
                <div class="space-y-2 p-4 bg-gray-50 dark:bg-gray-900/30">
                    ${Object.entries(H).map(([t,r])=>`
                        <details class="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300 open:ring-2 open:ring-blue-500 open:shadow-lg">
                            <summary class="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <h4 class="font-bold text-gray-800 dark:text-gray-200 font-kanit">${t}</h4>
                                <svg class="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 group-open:rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                            </summary>
                            <div class="border-t border-gray-200 dark:border-gray-700">
                                <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                                    ${r.map(ue).join("")}
                                </ul>
                            </div>
                        </details>
                    `).join("")}
                </div>
            </figure>
        `:"";c.innerHTML=`
        <div class="student-card-container bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden anim-card-pop-in" data-student-id="${e.id}">
                <div class="p-6 bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                    <div class="flex-shrink-0 h-16 w-16 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-4 border-white dark:border-gray-800 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div class="min-w-0">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white font-kanit truncate">${e.name}</h2>
                        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                            <span>รหัสนักเรียน: <strong class="font-semibold text-blue-600 dark:text-blue-400">${e.id}</strong></span>
                            ${e.room?`<span class="border-l border-gray-300 dark:border-gray-600 pl-4">ห้อง: <strong class="font-semibold text-blue-600 dark:text-blue-400">${e.room}</strong></span>`:""}
                            ${e.ordinal?`<span class="border-l border-gray-300 dark:border-gray-600 pl-4">เลขที่: <strong class="font-semibold text-blue-600 dark:text-blue-400">${e.ordinal}</strong></span>`:""}
                        </div>
                    </div>
                    <!-- <div class="ml-auto">
                        <button id="edit-mode-btn" class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600">
                            แก้ไขคะแนน
                        </button>
                    </div> -->
                </div>
                <div class="p-6 space-y-8">
                    ${v}
                    ${ae}
                    ${xe}
                    ${he}
                </div>
                <div id="edit-controls-container" class="p-4 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 ${P?"":"hidden"}">
                    <button id="save-overrides-btn" data-studentid="${e.id}" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                        สร้างโค้ดสำหรับบันทึกการแก้ไข
                    </button>
                </div>
            </div>
        `,document.getElementById("show-submitted-btn")?.addEventListener("click",()=>{const t=n.filter(r=>r.score&&r.score.toLowerCase()!=="ยังไม่ส่ง");ce("submitted",`งานที่ส่งแล้ว(${t.length} รายการ)`,t)}),document.getElementById("show-missing-btn")?.addEventListener("click",()=>{const t=n.filter(r=>!r.score||r.score.toLowerCase()==="ยังไม่ส่ง");ce("missing",`งานที่ค้างส่ง(${t.length} รายการ)`,t)}),document.getElementById("edit-mode-btn")?.addEventListener("click",()=>{P?(P=!1,D(e)):h.open()}),document.getElementById("save-overrides-btn")?.addEventListener("click",async t=>{const r=t.target.dataset.studentid,$=T.find(p=>p.id===r),k=J.find(p=>p.id===r);if(!k||!$){alert("Error: Could not find student data to compare.");return}const N={},M=[];let E=!1;if(document.querySelectorAll(".score-input").forEach(p=>{const I=p.dataset.key,g=k[I];let x=p.value;typeof g=="number"&&(x=x===""?null:parseFloat(x),isNaN(x)&&(x=null));const _=g!=null,b=x!=null;(_!==b||_&&b&&x!==g)&&(N[I]=x,E=!0,M.push({timestamp:new Date().toISOString(),student_id:r,student_name:$.name,score_key:I,original_value:g??"N/A",new_value:x??"N/A"}))}),E){let p={};try{const b=await ye(()=>import("./score-overrides-BZG-1gOY.js"),[]);b.encryptedScoreOverrides&&b.encryptedScoreOverrides.trim()!==""&&(p=JSON.parse(atob(b.encryptedScoreOverrides)))}catch{console.log("No existing score-overrides.js found or it's empty, creating new one.")}const I={...p};I[r]={...p[r]||{},...N};const g=btoa(JSON.stringify(I,null,2));O.value=`export const encryptedScoreOverrides = "${g}"; `;const x=`timestamp,student_id,student_name,score_key,original_value,new_value
`,_=M.map(b=>{const B=l=>`"${String(l??"").replace(/"/g,'""')}"`;return[B(b.timestamp),B(b.student_id),B(b.student_name),B(b.score_key),B(b.original_value),B(b.new_value)].join(",")}).join(`
`);R.value=x+_,j.open()}else alert("ไม่มีการเปลี่ยนแปลงคะแนน")})}}function ue(i){const f=ge[i.name]||null,c=i.name.toLowerCase(),s=Ee[c]||i.name,m=i.score;let h;if(isNaN(parseFloat(m))){const w=m&&m.toLowerCase()!=="ยังไม่ส่ง",A=w?"text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/50":"text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/50";let j=m||"ยังไม่ส่ง";!w&&c.includes("quiz")&&(j="ขาด"),h=`<span class="px-2 py-1 text-xs font-semibold ${A} rounded-full">${j}</span>`}else h=`<span class="font-mono font-bold text-gray-800 dark:text-gray-200">${m}</span>`;const y=`
    <div class="flex-grow min-w-0 pr-4">
        <span class="text-gray-700 dark:text-gray-300 text-sm font-medium">${s}</span>
        </div>
    <div class="flex items-center gap-3 flex-shrink-0">
        ${h}
        ${f?'<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>':'<div class="w-4 h-4"></div>'}
    </div>
`;return f?`<li class="block"><a href="${f}" target="_blank" rel="noopener noreferrer" class="group flex justify-between items-center py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">${y}</a></li>`:`<li class="flex justify-between items-center py-3 px-4 opacity-75">${y}</li>`}function ce(i,f,c){const s=`interactive-assignment-modal-${i}`,m=document.getElementById(s);m&&m.remove();const h=`interactive-assignment-content-${i}`,y=`
        <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
                </div>
                <input type="text" id="modal-search-input-${i}" placeholder="ค้นหาชื่องาน..." class="w-full p-2 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400">
            </div>
        </div>
    `,w=`
        <div id="${s}" class="modal fixed inset-0 flex items-center justify-center z-[9999] hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title-${s}">
            <div data-modal-overlay class="absolute inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm" aria-hidden="true"></div>
            <div class="modal-container relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
                <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 id="modal-title-${s}" class="text-xl font-bold text-gray-900 dark:text-white font-kanit">${f}</h2>
                    <button data-modal-close class="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors" aria-label="Close modal">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                ${y}
                <div id="${h}" class="p-4 sm:p-6 flex-grow overflow-y-auto modern-scrollbar">
                    <!-- Assignment list will be rendered here -->
                </div>
            </div>
        </div>
    `;document.getElementById("modals-placeholder").insertAdjacentHTML("beforeend",w),document.getElementById(s);const A=document.getElementById(h),j=document.getElementById(`modal-search-input-${i}`),O=()=>{const z=j.value.toLowerCase(),R=c.filter(L=>!z||L.name&&L.name.toLowerCase().includes(z));if(R.length===0)A.innerHTML='<p class="text-center text-gray-500 dark:text-gray-400 py-8">ไม่พบรายการที่ตรงกับคำค้นหา</p>';else{const L=R.map(ue).join("");A.innerHTML=`<ul class="divide-y divide-gray-200 dark:divide-gray-700">${L}</ul>`}};j.addEventListener("input",O),O(),new Z(s).open()}function Me(i){if(!i||i.length===0)return{};const f=i.reduce((s,m)=>{const h=m.name.toLowerCase();if(Le.some(w=>w.test(h)))return s;let y;if(h.includes("mid")||h.includes("ซ่อมแล้วกลางภาค"))y="กลางภาค";else if(h.includes("quiz"))y="แบบทดสอบท้ายบท (Quiz)";else{const w=h.match(/(\d+)/);y=w?`บทที่ ${w[1]}`:"อื่นๆ"}return s[y]||(s[y]=[]),s[y].push(m),s},{}),c={};return Se.forEach(s=>{f[s]&&(c[s]=f[s])}),Object.keys(f).forEach(s=>{c[s]||(c[s]=f[s])}),V()==="2/2568"&&delete c["บทที่ 5"],delete c["แบบทดสอบท้ายบท (Quiz)"],c}export{Me as groupAssignments,Te as initializeScoreSearch};

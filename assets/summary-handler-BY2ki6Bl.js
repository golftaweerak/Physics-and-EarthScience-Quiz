import{b as I,j as E,k as j,s as N}from"./data-manager-D3Z5ycE8.js";import"./preload-helper-DP0d4xQl.js";import"./firebase-config-D2ElzwY6.js";const R={ROOM:"room"};let L=I(),h=null,r={key:"room",direction:"asc"},F=[],s="overall";const H={4:{chart:"rgba(20, 184, 166, 0.7)",border:"#0d9488",chip:"bg-teal-500/20 text-teal-800 dark:text-teal-200 border-teal-500/30"},"3.5":{chart:"rgba(6, 182, 212, 0.7)",border:"#0891b2",chip:"bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 border-cyan-500/30"},3:{chart:"rgba(14, 165, 233, 0.7)",border:"#0284c7",chip:"bg-sky-500/20 text-sky-800 dark:text-sky-200 border-sky-500/30"},"2.5":{chart:"rgba(250, 204, 21, 0.7)",border:"#eab308",chip:"bg-yellow-400/20 text-yellow-800 dark:text-yellow-200 border-yellow-400/30"},2:{chart:"rgba(245, 158, 11, 0.7)",border:"#d97706",chip:"bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/30"},"1.5":{chart:"rgba(249, 115, 22, 0.7)",border:"#ea580c",chip:"bg-orange-500/20 text-orange-800 dark:text-orange-200 border-orange-500/30"},1:{chart:"rgba(239, 68, 68, 0.7)",border:"#dc2626",chip:"bg-red-500/20 text-red-800 dark:text-red-200 border-red-500/30"},0:{chart:"rgba(185, 28, 28, 0.7)",border:"#991b1b",chip:"bg-red-700/20 text-red-800 dark:text-red-200 border-red-700/30"},รอ:{chart:"rgba(168, 85, 247, 0.7)",border:"#9333ea",chip:"bg-purple-500/20 text-purple-800 dark:text-purple-200 border-purple-500/30"},มส:{chart:"rgba(236, 72, 153, 0.7)",border:"#db2777",chip:"bg-pink-500/20 text-pink-800 dark:text-pink-200 border-pink-500/30"},"N/A":{chart:"rgba(107, 114, 128, 0.7)",border:"#4b5563",chip:"bg-gray-500/20 text-gray-800 dark:text-gray-200 border-gray-500/30"}};function O(t){const n=document.getElementById("grade-chart")?.getContext("2d");if(!n){console.error("Chart canvas element not found");return}const o=["4","3.5","3","2.5","2","1.5","1","0","รอ","มส","N/A"],i=[],k=[],b=[],u=[];o.forEach(g=>{if(t[g]!==void 0&&t[g]>0){i.push(`เกรด ${g}`),k.push(t[g]);const a=H[g]||H["N/A"];b.push(a.chart),u.push(a.border)}});const c=document.documentElement.classList.contains("dark"),w=c?"rgba(173, 173, 173, 0.1)":"rgba(0, 0, 0, 0.1)",d=c?"#e5e7eb":"#1f2937";Chart.getChart(n)&&Chart.getChart(n).destroy(),new Chart(n,{type:"bar",data:{labels:i,datasets:[{label:"จำนวนนักเรียน",data:k,backgroundColor:b,borderColor:u,borderWidth:1,borderRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{callbacks:{label:function(g){let a=g.dataset.label||"";return a&&(a+=": "),g.parsed.y!==null&&(a+=`${g.parsed.y} คน`),a}}}},onClick:null,scales:{y:{beginAtZero:!0,title:{display:!0,text:"จำนวนนักเรียน (คน)",color:d,font:{family:"'Kanit', sans-serif",weight:"600"}},ticks:{color:d,precision:0,font:{weight:"500"}},grid:{color:w}},x:{ticks:{color:d,font:{family:"'Kanit', sans-serif",weight:"500"}},grid:{display:!1}}},onHover:(g,a)=>{g.native.target.style.cursor=a[0]?"pointer":"default"}}})}function A(t){if(!h)return;const n=document.getElementById("grade-chart-title");n&&(n.textContent=t==="all"?"การกระจายของเกรดนักเรียนทั้งหมด":`การกระจายของเกรด (ห้อง ${t})`);let o;t==="all"?o=h.gradeDistribution||{}:o=h.summaryByRoom?.[t]?.gradeDistribution||{},O(o)}function T(t,n){if(isNaN(t))return"text-gray-500 dark:text-gray-400";for(const{limit:o,colorClass:i}of n)if(t>=o)return i;return"text-red-500 dark:text-red-400"}const P=[{limit:80,colorClass:"text-teal-500 dark:text-teal-400"},{limit:70,colorClass:"text-sky-500 dark:text-sky-400"},{limit:60,colorClass:"text-green-500 dark:text-green-400"},{limit:50,colorClass:"text-amber-500 dark:text-amber-400"}],z=[{limit:32,colorClass:"text-teal-500 dark:text-teal-400"},{limit:28,colorClass:"text-sky-500 dark:text-sky-400"},{limit:24,colorClass:"text-green-500 dark:text-green-400"},{limit:20,colorClass:"text-amber-500 dark:text-amber-400"}],_=[{limit:90,colorClass:"text-teal-500 dark:text-teal-400"},{limit:75,colorClass:"text-sky-500 dark:text-sky-400"},{limit:50,colorClass:"text-amber-500 dark:text-amber-400"}];function G(t){return T(t,P)}function D(t){return T(t,z)}const V=[{limit:24,colorClass:"text-teal-500 dark:text-teal-400"},{limit:21,colorClass:"text-sky-500 dark:text-sky-400"},{limit:18,colorClass:"text-green-500 dark:text-green-400"},{limit:15,colorClass:"text-amber-500 dark:text-amber-400"}];function K(t){return T(t,V)}function q(t){return T(t,_)}function C(){const t=document.getElementById("room-summary-tbody"),n=document.getElementById("sort-indicator-room"),o=document.getElementById("sort-indicator-score"),i=document.getElementById("sort-indicator-grade"),k=document.getElementById("sort-indicator-completion"),b=document.getElementById("sort-indicator-midterm"),u=document.getElementById("sort-indicator-final");if(!t||!h)return;const c=Object.keys(h.summaryByRoom).sort((a,e)=>{if(r.key==="room")return r.direction==="asc"?a.localeCompare(e,void 0,{numeric:!0}):e.localeCompare(a,void 0,{numeric:!0});{const v=h.summaryByRoom[a],x=h.summaryByRoom[e],l=v[r.key],y=x[r.key];if(l==="N/A")return 1;if(y==="N/A")return-1;const p=parseFloat(l),f=parseFloat(y);return r.direction==="desc"?f-p:p-f}});s==="midterm"?t.innerHTML=c.map(a=>{const e=h.summaryByRoom[a],v=parseFloat(e.averageMidtermTerm2),x=D(v),l=e.passCountTerm2+e.failCountTerm2>0?(e.passCountTerm2/(e.passCountTerm2+e.failCountTerm2)*100).toFixed(0):"N/A",y=l>=80?"bg-teal-500":l>=60?"bg-sky-500":l>=50?"bg-amber-500":"bg-red-500";return`
                <tr data-room="${a}" class="border-b dark:border-gray-700 last:border-b-0">
                    <td class="px-4 py-3 align-middle">
                        <div class="font-bold text-lg text-gray-900 dark:text-white">ห้อง ${a}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${e.studentCount} คน</div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="font-bold text-xl ${x}">${e.averageMidtermTerm2}</div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="font-bold text-xl text-gray-800 dark:text-gray-100">${e.midtermSD||"N/A"}</div>
                    </td>
                    <td class="px-4 py-3 align-middle">
                        <div class="flex items-center justify-between text-xs mb-1">
                            <span class="font-semibold text-gray-600 dark:text-gray-300">ผ่าน ${l}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div class="${y} h-2.5 rounded-full" style="width: ${l}%"></div>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="text-sm"><span class="font-bold text-green-500">${e.passCountTerm2}</span> ผ่าน / <span class="font-bold text-red-500">${e.failCountTerm2}</span> ไม่ผ่าน</div>
                    </td>
                </tr>
            `}).join(""):s==="final"?t.innerHTML=c.map(a=>{const e=h.summaryByRoom[a],v=parseFloat(e.averageFinalScore),x=K(v),l=e.passCountFinal??0,y=e.failCountFinal??0,p=e.passCountFinal!==void 0&&l+y>0?(l/(l+y)*100).toFixed(0):"N/A",f=p>=80?"bg-teal-500":p>=60?"bg-sky-500":p>=50?"bg-amber-500":"bg-red-500";return`
                <tr data-room="${a}" class="border-b dark:border-gray-700 last:border-b-0">
                    <td class="px-4 py-3 align-middle">
                        <div class="font-bold text-lg text-gray-900 dark:text-white">ห้อง ${a}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${e.studentCount} คน</div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="font-bold text-xl ${x}">${e.averageFinalScore??"N/A"}</div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="font-bold text-xl text-gray-800 dark:text-gray-100">${e.finalSD??"N/A"}</div>
                    </td>
                    <td class="px-4 py-3 align-middle">
                        <div class="flex items-center justify-between text-xs mb-1">
                            <span class="font-semibold text-gray-600 dark:text-gray-300">ผ่าน ${p==="N/A"?"N/A":`${p}%`}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div class="${f} h-2.5 rounded-full" style="width: ${p==="N/A"?0:p}%"></div>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="text-sm"><span class="font-bold text-green-500">${e.passCountFinal??"-"}</span> ผ่าน / <span class="font-bold text-red-500">${e.failCountFinal??"-"}</span> ไม่ผ่าน</div>
                    </td>
                </tr>
            `}).join(""):t.innerHTML=c.map(a=>{const e=h.summaryByRoom[a],v=parseFloat(e.averageScore),x=G(v),l=parseFloat(e.completionPercentage),y=q(l),p=l>=90?"bg-teal-500":l>=75?"bg-sky-500":l>=50?"bg-amber-500":"bg-red-500",f=parseFloat(e.averageGrade);let m="text-gray-800 dark:text-gray-200";return isNaN(f)||(f>=3.5?m="text-teal-500":f>=2.5?m="text-sky-500":f>=1.5?m="text-amber-500":m="text-red-500"),`
                <tr data-room="${a}" class="border-b dark:border-gray-700 last:border-b-0">
                    <td class="px-4 py-3 align-middle">
                        <div class="font-bold text-lg text-gray-900 dark:text-white">ห้อง ${a}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${e.studentCount} คน</div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="font-bold text-xl ${x}">${e.averageScore}</div>
                    </td>
                    <td class="px-4 py-3 align-middle">
                        <div class="flex items-center justify-between text-xs mb-1">
                            
                            <span class="font-semibold ${y}">${e.completionPercentage}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div class="${p} h-2.5 rounded-full" style="width: ${e.completionPercentage}%"></div>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-center align-middle">
                        <div class="font-bold text-xl ${m}">${e.averageGrade}</div>
                    </td>
                </tr>
            `}).join(""),t.querySelectorAll("tr[data-room]").forEach(a=>{s==="midterm"||s==="final"?(a.style.cursor="pointer",a.classList.add("hover:bg-gray-50","dark:hover:bg-gray-700/30","transition-colors"),a.addEventListener("click",()=>{const e=a.getAttribute("data-room");Y(e,F)})):a.style.cursor="default"});const g=r.direction==="desc"?'<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>':'<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>';n&&(n.innerHTML=""),o&&(o.innerHTML=""),i&&(i.innerHTML=""),k&&(k.innerHTML=""),b&&(b.innerHTML=""),u&&(u.innerHTML=""),r.key==="room"&&n?n.innerHTML=g:r.key==="averageScore"&&o?o.innerHTML=g:r.key==="averageGrade"&&i?i.innerHTML=g:r.key==="completionPercentage"&&k?k.innerHTML=g:r.key==="averageMidtermTerm2"&&b?b.innerHTML=g:r.key==="averageFinalScore"&&u&&(u.innerHTML=g)}function W(){const t=document.getElementById("sort-avg-score-btn"),n=document.getElementById("sort-room-btn"),o=document.getElementById("sort-avg-grade-btn"),i=document.getElementById("sort-completion-btn"),k=document.getElementById("sort-avg-midterm-btn"),b=document.getElementById("sort-avg-final-btn");t&&t.addEventListener("click",()=>{r.key==="averageScore"?r.direction=r.direction==="desc"?"asc":"desc":(r.key="averageScore",r.direction="desc"),C()}),n&&n.addEventListener("click",()=>{r.key==="room"?r.direction=r.direction==="desc"?"asc":"desc":(r.key="room",r.direction="asc"),C()}),o&&o.addEventListener("click",()=>{r.key==="averageGrade"?r.direction=r.direction==="desc"?"asc":"desc":(r.key="averageGrade",r.direction="desc"),C()}),i&&i.addEventListener("click",()=>{r.key==="completionPercentage"?r.direction=r.direction==="desc"?"asc":"desc":(r.key="completionPercentage",r.direction="desc"),C()}),k&&k.addEventListener("click",()=>{r.key==="averageMidtermTerm2"?r.direction=r.direction==="desc"?"asc":"desc":(r.key="averageMidtermTerm2",r.direction="desc"),C()}),b&&b.addEventListener("click",()=>{r.key==="averageFinalScore"?r.direction=r.direction==="desc"?"asc":"desc":(r.key="averageFinalScore",r.direction="desc"),C()})}function M(t,n,o){const i=document.getElementById("summary-container");if(!i)return;F=n;const b=new Date(o).toLocaleString("th-TH",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Bangkok"}),c='<option value="all">นักเรียนทั้งหมด</option>'+(t.summaryByRoom?Object.keys(t.summaryByRoom).sort((x,l)=>x.localeCompare(l,void 0,{numeric:!0})):[]).map(x=>`<option value="${x}">ห้อง ${x}</option>`).join(""),a=s==="midterm"?`
        <tr>
            <th scope="col" class="px-4 py-3 text-left">
                <button id="sort-room-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>ห้องเรียน</span>
                    <span id="sort-indicator-room" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <button id="sort-avg-midterm-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>คะแนนกลางภาคเฉลี่ย</span>
                    <span id="sort-indicator-midterm" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <span>ส่วนเบี่ยงเบนมาตรฐาน (SD)</span>
            </th>
            <th scope="col" class="px-4 py-3 text-center w-1/4">
                <span>อัตราการผ่าน</span>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <span>จำนวนคน (ผ่าน/ไม่ผ่าน)</span>
            </th>
        </tr>
    `:s==="final"?`
        <tr>
            <th scope="col" class="px-4 py-3 text-left">
                <button id="sort-room-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>ห้องเรียน</span>
                    <span id="sort-indicator-room" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <button id="sort-avg-final-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>คะแนนปลายภาคเฉลี่ย</span>
                    <span id="sort-indicator-final" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <span>ส่วนเบี่ยงเบนมาตรฐาน (SD)</span>
            </th>
            <th scope="col" class="px-4 py-3 text-center w-1/4">
                <span>อัตราการผ่าน</span>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <span>จำนวนคน (ผ่าน/ไม่ผ่าน)</span>
            </th>
        </tr>
    `:`
        <tr>
            <th scope="col" class="px-4 py-3 text-left">
                <button id="sort-room-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>ห้องเรียน</span>
                    <span id="sort-indicator-room" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <button id="sort-avg-score-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>คะแนนรวมเฉลี่ย</span>
                    <span id="sort-indicator-score" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center w-1/4">
                <button id="sort-completion-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>การส่งงาน</span>
                    <span id="sort-indicator-completion" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
            <th scope="col" class="px-4 py-3 text-center">
                <button id="sort-avg-grade-btn" class="inline-flex items-center gap-1 group font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-1">
                    <span>เกรดเฉลี่ย</span>
                    <span id="sort-indicator-grade" class="text-gray-500 dark:text-gray-400 transition-opacity"></span>
                </button>
            </th>
        </tr>
    `,e=`
        <!-- Student Search Section -->
        <div class="text-center text-sm text-gray-500 dark:text-gray-400 mb-6 -mt-4">อัปเดตข้อมูลล่าสุด: ${b} น.</div>

        <!-- Student Search Banner -->
        <div class="mb-8 p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 dark:border-blue-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="p-3 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div class="text-left">
                    <h4 class="font-bold text-gray-800 dark:text-white font-kanit">ต้องการค้นหาคะแนนรายบุคคล?</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ค้นหาผลคะแนนรายวิชาด้วยรหัสประจำตัวนักเรียน 5 หลัก</p>
                </div>
            </div>
            <a href="./scores.html" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-blue-500/20 flex items-center justify-center gap-2 transform active:scale-95 shrink-0">
                <span>ไปที่หน้าค้นหาคะแนน</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
        </div>

        <!-- Mode Toggle Segmented Control -->
        <div class="flex justify-center mb-8">
            <div class="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
                <button id="btn-mode-overall" class="px-5 py-2 rounded-lg font-kanit font-bold text-sm transition-all duration-200 flex items-center gap-2 ${s==="overall"?"bg-blue-600 text-white shadow-md":"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    <span>สรุปผลรวม</span>
                </button>
                <button id="btn-mode-midterm" class="px-5 py-2 rounded-lg font-kanit font-bold text-sm transition-all duration-200 flex items-center gap-2 ${s==="midterm"?"bg-blue-600 text-white shadow-md":"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>สถิติกลางภาค</span>
                </button>
                <button id="btn-mode-final" class="px-5 py-2 rounded-lg font-kanit font-bold text-sm transition-all duration-200 flex items-center gap-2 ${s==="final"?"bg-blue-600 text-white shadow-md":"text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    <span>สถิติปลายภาค</span>
                </button>
            </div>
        </div>

        <!-- Overall Stats Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <!-- Student Counts Box -->
            <div class="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col col-span-1">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit mb-4">ภาพรวมนักเรียน</h3>
                <div class="grid grid-cols-3 gap-4 flex-grow">
                    <div id="card-all-students" class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
                        <div class="text-4xl font-bold text-blue-600 dark:text-blue-400 font-kanit">${t.totalStudents}</div>
                        <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">นักเรียนทั้งหมด</div>
                    </div>
                    <div id="card-complete-students" class="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
                        <div class="text-4xl font-bold text-green-600 dark:text-green-400 font-kanit">${t.studentsWithNoMissing}</div>
                        <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">ส่งงานครบ</div>
                    </div>
                    <div id="card-missing-students" class="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-center flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
                        <div class="text-4xl font-bold text-red-600 dark:text-red-400 font-kanit">${t.studentsWithMissing}</div>
                        <div class="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">ยังส่งงานไม่ครบ</div>
                    </div>
                </div>
            </div>

            <!-- Other Stats Box -->
            <div class="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 col-span-2">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit mb-4">${s==="midterm"?"ภาพรวมคะแนนสอบกลางภาค":s==="final"?"ภาพรวมคะแนนสอบปลายภาค":"ภาพรวมคะแนนและงาน"}</h3>
                <div class="grid ${s==="overall"?"grid-cols-2 sm:grid-cols-4":"grid-cols-2 sm:grid-cols-3"} gap-4">
                    ${s==="midterm"?`
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${t.averageMidtermScore}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">คะแนนเฉลี่ย</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${t.midtermSD}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">ส่วนเบี่ยงเบนมาตรฐาน (SD)</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-green-600 dark:text-green-400 font-kanit">${t.highestMidtermScore}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">คะแนนสูงสุด</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-red-600 dark:text-red-400 font-kanit">${t.lowestMidtermScore}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">คะแนนต่ำสุด</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-teal-600 dark:text-teal-400 font-kanit">${t.midtermPassCount} คน</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">จำนวนคนผ่าน (>= 12)</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-rose-600 dark:text-rose-400 font-kanit">${t.midtermFailCount} คน</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">จำนวนคนตก (< 12)</div>
                        </div>
                    `:s==="final"?`
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${t.averageFinalScore??"N/A"}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">คะแนนเฉลี่ย</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${t.finalSD??"N/A"}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">ส่วนเบี่ยงเบนมาตรฐาน (SD)</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-green-600 dark:text-green-400 font-kanit">${t.highestFinalScore??"N/A"}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">คะแนนสูงสุด</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-red-600 dark:text-red-400 font-kanit">${t.lowestFinalScore??"N/A"}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">คะแนนต่ำสุด</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-teal-600 dark:text-teal-400 font-kanit">${t.finalPassCount!==void 0?`${t.finalPassCount} คน`:"-"}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">จำนวนคนผ่าน (>= 15)</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-rose-600 dark:text-rose-400 font-kanit">${t.finalFailCount!==void 0?`${t.finalFailCount} คน`:"-"}</div>
                            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">จำนวนคนตก (< 15)</div>
                        </div>
                    `:`
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${t.averageScore}</div>
                            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนเฉลี่ย</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${t.completionPercentage}%</div>
                            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">การส่งงาน</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-green-600 dark:text-green-400 font-kanit">${t.highestScore}</div>
                            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนสูงสุด</div>
                        </div>
                        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div class="text-2xl font-bold text-red-600 dark:text-red-400 font-kanit">${t.lowestScore}</div>
                            <div class="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนต่ำสุด</div>
                        </div>
                    `}
                </div>
            </div>
        </div>

        <!-- Grade Distribution Chart -->
        <div class="mt-8 bg-white dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60 ${s==="midterm"||s==="final"?"hidden":""}">
            <div class="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 id="grade-chart-title" class="text-lg font-bold text-gray-800 dark:text-white font-kanit">การกระจายของเกรด</h3>
                <div class="relative">
                    <select id="grade-chart-room-filter" class="appearance-none mt-1 p-2 pr-10 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm cursor-pointer">
                        ${c}
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 group-hover:text-blue-500 transition-colors"><svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></div>
                </div>
            </div>
            <div class="relative h-96">
                <canvas id="grade-chart"></canvas>
            </div>
            <!-- Grade Summary Chips Section (moved inside) -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white font-kanit mb-4">สรุปตามเกรด</h3>
                <div id="grade-summary-cards-container" class="flex flex-wrap gap-3 items-center">
                    <!-- Grade summary cards will be injected here by the script -->
                </div>
            </div>
        </div>

        <!-- Per-Room Summary Table -->
        <div class="mt-8 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60 overflow-hidden">
            <h3 class="p-4 text-lg font-bold text-gray-800 dark:text-white font-kanit border-b border-gray-200 dark:border-gray-700">สรุปรายห้องเรียน</h3>
            <div class="overflow-x-auto modern-scrollbar">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-700 dark:text-gray-400 uppercase">
                        ${a}
                    </thead>
                    <tbody id="room-summary-tbody">
                        <!-- Table rows will be rendered by updateRoomSummaryTable() -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Container for detailed student table per room -->
        <div id="room-detail-container" class="mt-8">
            <!-- Detailed table will be rendered here -->
        </div>
    `;i.innerHTML=e,C(),((x,l,y)=>{W();const p=document.getElementById("btn-mode-overall"),f=document.getElementById("btn-mode-midterm"),m=document.getElementById("btn-mode-final");p&&f&&m&&(p.addEventListener("click",()=>{s!=="overall"&&(s="overall",M(x,l,y))}),f.addEventListener("click",()=>{s!=="midterm"&&(s="midterm",M(x,l,y))}),m.addEventListener("click",()=>{s!=="final"&&(s="final",M(x,l,y))}));const S=document.getElementById("grade-chart-room-filter");S&&S.addEventListener("change",$=>{A($.target.value)}),s==="overall"&&A("all")})(t,n,o)}async function U(){try{L=I();const t=E(),n=document.getElementById("course-code-display"),o=document.getElementById("title-course-code");n&&(n.textContent=t),o&&(o.textContent=t);const i=async u=>{L=u;const c=document.getElementById("summary-container");if(!c)return;const w=E();n&&(n.textContent=w),o&&(o.textContent=w);const d=document.getElementById("semester-selector");d&&(d.value=u);const g="summary_session_semester_selected";if(["1/2568","2/2568","1/2569","2/2569"].includes(u)){sessionStorage.setItem(g,u),c.innerHTML=`
                    <div id="loading-spinner" class="text-center py-16">
                        <svg class="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <p class="mt-4 text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูลสรุป...</p>
                    </div>
                `;let e=!1;try{const v=await j(u);if(v)try{h=v,M(h,[],v.lastUpdated),e=!0}catch(x){console.error("Error during rendering:",x),c.innerHTML=`
                                <div class="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[400px]">
                                    <div class="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl shadow-lg border border-red-200 dark:border-red-900 max-w-2xl text-left">
                                        <h3 class="text-xl font-bold text-red-800 dark:text-red-400 font-kanit mb-4">เกิดข้อผิดพลาดในการแสดงผลข้อมูล</h3>
                                        <pre class="text-sm text-red-600 dark:text-red-300 whitespace-pre-wrap overflow-auto max-h-64 font-mono">${x.stack||x.message}</pre>
                                    </div>
                                </div>
                            `;return}}catch(v){console.warn(`Semester ${u} summary data not found or error loading:`,v)}e||(c.innerHTML=`
                        <div class="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[400px]">
                            <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md">
                                <div class="bg-blue-50 dark:bg-blue-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 class="text-2xl font-bold text-gray-800 dark:text-white font-kanit mb-2">ยังไม่เปิดภาคเรียน</h3>
                                <p class="text-gray-600 dark:text-gray-400">ข้อมูลสำหรับภาคเรียนที่ ${u} จะแสดงที่นี่เมื่อเริ่มภาคเรียน</p>
                            </div>
                        </div>
                    `)}else{c.innerHTML=`
                    <div class="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[50vh]">
                        <div class="bg-blue-900/40 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-blue-500/10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-400 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 class="text-3xl font-bold text-gray-800 dark:text-white font-kanit mb-4 tracking-wide">เริ่มต้นดูคะแนน</h3>
                        <p class="text-gray-500 dark:text-gray-400 font-sarabun text-lg max-w-md leading-relaxed">กรุณาเลือกภาคเรียนที่ต้องการจากเมนูด้านบน<br/>เพื่อแสดงข้อมูลสรุปและสถิติคะแนน</p>
                    </div>
                `;const v=document.getElementById("display-mode-toggle")?.closest("div.w-full");v&&v.classList.add("hidden")}},k="summary_session_semester_selected",b=document.getElementById("semester-selector");b&&(b.value="",b.addEventListener("change",u=>{const c=u.target.value;c?(N(c),i(c)):i("")})),i("")}catch(t){console.error("Failed to initialize summary page:",t);const n=document.getElementById("summary-container");n&&(n.innerHTML=`
                <div class="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[400px]">
                    <div class="bg-red-50 dark:bg-red-900/20 p-5 rounded-full mb-6 animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl md:text-3xl font-bold font-kanit text-gray-800 dark:text-white mb-3">ขออภัย ไม่สามารถโหลดข้อมูลได้</h3>
                    <p class="text-gray-600 dark:text-gray-300 max-w-md mb-8 text-base md:text-lg leading-relaxed">
                        ระบบไม่สามารถดึงข้อมูลสรุปคะแนนได้ในขณะนี้<br>อาจเกิดจากปัญหาการเชื่อมต่อหรือเซิร์ฟเวอร์ขัดข้อง
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                        <button onclick="window.location.reload()" class="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            ลองใหม่อีกครั้ง
                        </button>
                        <a href="./index.html" class="inline-flex items-center justify-center px-6 py-3.5 border border-gray-200 dark:border-gray-700 text-base font-bold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                            กลับสู่หน้าหลัก
                        </a>
                    </div>
                </div>`)}}function Y(t,n){const o=document.getElementById("room-detail-container");if(!o)return;if(!t||s!=="midterm"&&s!=="final"){o.innerHTML="";return}const i=n.filter(m=>String(m[R.ROOM])===t);if(i.length===0){o.innerHTML="";return}const k=i.length,b=s==="final",u=b?"คะแนนปลายภาค":"คะแนนกลางภาค",c=b?15:12,w=b?"ปลายภาค":"กลางภาค",d=i.map(m=>parseFloat(m[u])).filter(m=>!isNaN(m)),g=d.length>0?(d.reduce((m,S)=>m+S,0)/d.length).toFixed(2):"N/A";let a="N/A";if(d.length>0){const m=d.reduce(($,B)=>$+B,0)/d.length,S=d.reduce(($,B)=>$+Math.pow(B-m,2),0);a=Math.sqrt(S/d.length).toFixed(2)}const e=d.length>0?Math.max(...d):"N/A",v=d.length>0?Math.min(...d):"N/A",x=d.filter(m=>m>=c).length,l=d.filter(m=>m<c).length,y=d.length>0?(x/d.length*100).toFixed(0):"0",p=`
        <div class="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/60 mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white font-kanit">สถิติการสอบ${w} ห้อง ${t}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">จำนวนนักเรียนที่เข้าสอบ: ${d.length} จาก ${k} คน</p>
                </div>
                <button id="close-room-detail-btn" class="self-start sm:self-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg text-sm transition-colors flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    <span>ปิดกล่องนี้</span>
                </button>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div class="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl text-center">
                    <div class="text-xl font-bold text-blue-600 dark:text-blue-400 font-kanit">${g}</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">คะแนนเฉลี่ย</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700/40 rounded-xl text-center">
                    <div class="text-xl font-bold text-gray-800 dark:text-gray-100 font-kanit">${a}</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">ส่วนเบี่ยงเบนมาตรฐาน (SD)</div>
                </div>
                <div class="p-3 bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl text-center">
                    <div class="text-xl font-bold text-green-600 dark:text-green-400 font-kanit">${e}</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">คะแนนสูงสุด</div>
                </div>
                <div class="p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-center">
                    <div class="text-xl font-bold text-red-600 dark:text-red-400 font-kanit">${v}</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">คะแนนต่ำสุด</div>
                </div>
                <div class="p-3 bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 rounded-xl text-center">
                    <div class="text-xl font-bold text-teal-600 dark:text-teal-400 font-kanit">${x} คน (${y}%)</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">จำนวนคนผ่าน (>= ${c})</div>
                </div>
                <div class="p-3 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl text-center">
                    <div class="text-xl font-bold text-rose-600 dark:text-rose-400 font-kanit">${l} คน</div>
                    <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">จำนวนคนตก (< ${c})</div>
                </div>
            </div>
        </div>
    `;o.innerHTML=p;const f=o.querySelector("#close-room-detail-btn");f&&f.addEventListener("click",()=>{o.innerHTML=""}),o.scrollIntoView({behavior:"smooth",block:"start"})}export{U as initializeSummaryPage};

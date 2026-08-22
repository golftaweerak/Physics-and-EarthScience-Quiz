function u(n){const g=["กิจกรรม","แบบฝึก","quiz","ท้ายบท","ใบงาน"];if(!n.assignments||!Array.isArray(n.assignments))return{submitted:0,total:0,percentage:"0",missing:0};const c=n.assignments.filter(t=>t&&typeof t.name=="string"&&g.some(r=>t.name.toLowerCase().includes(r))),x=t=>{if(t==null)return!1;const r=String(t).trim().toLowerCase();return r!==""&&r!=="-"&&r!=="ยังไม่ส่ง"},d=c.filter(t=>x(t.score)).length,l=c.length,i=l>0?d/l*100:0,b=l-d;return{submitted:d,total:l,percentage:i.toFixed(0),missing:b}}function C(n,g,c){const{cardType:x,basePath:d="./",customFields:l,isClickable:i=!0}=c;if(!n||n.length===0){g.innerHTML='<p class="text-center text-gray-500 dark:text-gray-400 py-4">ไม่พบนักเรียนที่ตรงกับคำค้นหา</p>';return}const b=n.map(t=>{let r="";if(l&&l.length>0)r=`<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-center w-full sm:flex-1 sm:ml-4 mt-2 sm:mt-0">${l.map(e=>{const a=t[e.key],s=a!=null&&a!==""?a:"-",o=typeof e.formatter=="function"?e.formatter(s,t):`<p class="font-bold text-base sm:text-lg ${e.valueClass||"text-gray-800 dark:text-gray-200"}">${s}</p>`;return`
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">${e.label}</p>
                        ${o}
                    </div>
                `}).join("")}</div>`;else{const y=t["รวม [100]"]!==void 0?t["รวม [100]"]:null,e=t.เกรด??"N/A";let a="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200";e>=4?a="bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300":e>=3?a="bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300":e>=2?a="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300":e>=1?a="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300":e>=0&&(a="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300");const s=u(t);let o="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200";s.percentage>=90?o="bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300":s.percentage>=75?o="bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300":s.percentage>=50?o="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300":o="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300";const f=s.missing>0?"bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300":"bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300";r=`
                <div class="flex items-center justify-start sm:justify-end gap-2 sm:gap-3 text-center w-full sm:w-auto mt-2 sm:mt-0">
                    ${y!==null?`
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">คะแนนรวม</p>
                        <p class="font-bold text-base sm:text-lg">${Number(y).toFixed(2)}</p>
                    </div>
            `:""}
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">ค้างส่ง</p>
                        <p class="font-bold text-base sm:text-lg px-2 py-0.5 rounded-md ${f}">${s.missing}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">ส่งงาน</p>
                        <p class="font-bold text-base sm:text-lg px-2 py-0.5 rounded-md ${o}">${s.percentage}%</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">เกรด</p>
                        <p class="font-bold text-base sm:text-lg px-2 py-0.5 rounded-md ${a}">${e}</p>
                    </div>
                </div>
            `}const m=`
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center ${x==="button"?"pointer-events-none":""}">
                <div class="w-full sm:w-auto">
                    <p class="font-bold text-gray-800 dark:text-gray-100 truncate">${t.name}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        รหัส: <span class="font-mono">${t.id}</span> | 
                        ห้อง: <span class="font-semibold">${t.room||"N/A"}</span> |
                        เลขที่: <span class="font-semibold">${t.ordinal||"N/A"}</span>
                    </p>
                </div>
                ${r}
            </div>
        `,k=typeof i=="function"?i(t):i,p=`block w-full text-left p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 shadow-sm ${k?"hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer":"cursor-default"}`;return k?x==="link"?`<a href="${d}scores.html?id=${t.id}&auto=1" class="${p}">${m}</a>`:`<button data-student-id="${t.id}" class="student-card-btn ${p}">${m}</button>`:`<div class="${p}">${m}</div>`}).join("");g.innerHTML=`<div class="space-y-2">${b}</div>`}export{C as r};

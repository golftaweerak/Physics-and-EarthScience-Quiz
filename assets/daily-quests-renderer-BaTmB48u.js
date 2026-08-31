import{G as u}from"./gamification-Cy3UuTrW.js";import{s as i}from"./auth-manager-DxJDYVU6.js";function x(d,y){let t,o;typeof d=="string"?(o=d,t=new u):(t=d,o=y);const a=document.getElementById(o);if(!a)return;const c=t.state.activeQuests||[],g=t.state.rerolls||0;if(c.length===0){a.innerHTML='<p class="text-center text-sm text-gray-500 dark:text-gray-400 py-4">ไม่มีภารกิจประจำวันในขณะนี้</p>';return}a.innerHTML=c.map((e,l)=>{const r=Math.min(100,e.progress/e.target*100),n=e.completed;let m="bg-blue-500";n&&(m="bg-green-500");const b=["quiz_complete","quiz_category","high_score"].includes(e.type)?'<span class="text-[10px] text-orange-500 dark:text-orange-400 font-normal">(ต้องทำ 20 ข้อขึ้นไป)</span>':"";return`
            <div class="daily-quest-item p-3 rounded-lg flex items-center gap-4 ${n?"bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700":"bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"}">
                <div class="text-3xl flex-shrink-0">${n?"✅":"📜"}</div>
                <div class="flex-grow min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-1">
                        <p class="font-bold text-sm text-gray-800 dark:text-gray-100 truncate" title="${e.desc}">${e.desc}</p>
                        ${b}
                    </div>
                    <div class="flex items-center gap-2 mt-1.5">
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div class="${m} h-2.5 rounded-full transition-all duration-500" style="width: ${r}%"></div>
                        </div>
                        <span class="text-xs font-mono text-gray-500 dark:text-gray-400 flex-shrink-0">${e.progress}/${e.target}</span>
                    </div>
                </div>
                <div class="flex-shrink-0 flex flex-col items-center gap-1">
                    <span class="text-xs font-bold text-yellow-500 dark:text-yellow-400">+${e.xp} XP</span>
                    <button 
                        data-quest-index="${l}" 
                        class="reroll-quest-btn p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-500 transition-colors ${n||g===0?"hidden":""}"
                        title="เปลี่ยนภารกิจ (เหลือ ${g} ครั้ง)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.51A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.51-1.276z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        `}).join("");const p=t.canClaimMysteryChest(),f=new Date().toISOString().split("T")[0],s=t.state.mysteryChestClaimedDate===f;if(p||s){const e=`
            <div class="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-2 ${s?"border-gray-300 dark:border-gray-700 opacity-80":"border-amber-400 dark:border-amber-500 animate-pulse"} flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${s?"🎁":"✨🎁✨"}</span>
                    <div>
                        <p class="font-bold text-sm text-gray-800 dark:text-gray-100 font-kanit">กล่องสุ่มสมบัติรายวัน</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${s?"คุณเปิดรับของขวัญวันนี้ไปแล้ว":"ภารกิจครบแล้ว! กดเพื่อรับของขวัญฟรี"}</p>
                    </div>
                </div>
                <button id="claim-mystery-chest-btn" ${s?"disabled":""} class="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs rounded-lg shadow-md transition-all transform ${s?"opacity-50 cursor-not-allowed":"hover:scale-105 active:scale-95 cursor-pointer"}">
                    ${s?"รับแล้ว ✓":"เปิดกล่อง! 🎉"}
                </button>
            </div>
        `;a.insertAdjacentHTML("beforeend",e);const l=a.querySelector("#claim-mystery-chest-btn");l&&!s&&l.addEventListener("click",()=>{const r=t.claimMysteryChest();r.success?(i("เปิดกล่องสุ่มสมบัติสำเร็จ! 🎁",`คุณได้รับ: ${r.reward.icon} ${r.reward.name}`,"✨","gold"),x(t,o)):i("ไม่สามารถรับได้",r.message,"⚠️","error")})}a.querySelectorAll(".reroll-quest-btn").forEach(e=>{e.addEventListener("click",()=>{const l=parseInt(e.dataset.questIndex,10),r=t.rerollQuest(l);r.success?(i("เปลี่ยนภารกิจสำเร็จ",`คุณมีสิทธิ์เปลี่ยนภารกิจอีก ${r.rerollsLeft} ครั้ง`,"🔄"),x(t,o)):i("ไม่สำเร็จ",r.message,"❌","error")})})}export{x as r};

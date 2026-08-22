import"./auth-manager-DxJDYVU6.js";class c{constructor(e={}){this.id=e.id||"base-sim",this.title=e.title||"Simulation",this.description=e.description||"",this.containerId=e.containerId||"sim-container",this.canvas=null,this.ctx=null,this.width=800,this.height=500,this.isActive=!1,this.quests=e.quests||[],this.completedQuests=new Set,this.lastFormulaCache="",this.tabs=e.tabs||[],this.activeTabId=this.tabs.length>0?this.tabs[0].id:null;const t=this.tabs.find(a=>a.id===this.activeTabId)||{};this.initialState=t.initialState||e.initialState||{},this.state=JSON.parse(JSON.stringify(this.initialState)),this.controls=t.controls||e.controls||[],this.quests=t.quests||e.quests||[],this.onCompleteAllQuests=e.onCompleteAllQuests||null}async init(){console.log(`Initializing Simulation: ${this.title}`);const e=document.getElementById(this.containerId);if(!e){console.error(`Container #${this.containerId} not found.`);return}this.setupLayout(e),this.setupCanvas(),this.setupControls(),this.setupQuestUI(),this.setupTabs(),this.isActive=!0,this.startLoop()}setupLayout(e){e.innerHTML=`
            <div class="flex flex-col gap-4 h-full max-h-[90vh]">
                <!-- Header with Tabs -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-bold font-kanit text-slate-800 dark:text-slate-200">${this.title}</h2>
                        <p class="text-sm text-slate-500 dark:text-slate-400">${this.description}</p>
                    </div>
                    <div id="sim-tabs-container" class="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
                </div>

                <div class="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
                    <!-- Main Simulation Area -->
                    <div class="flex-grow relative bg-slate-50 dark:bg-slate-900/20 rounded-3xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 min-h-[380px]">
                        <canvas id="sim-canvas" class="w-full h-full block"></canvas>
                        
                        <!-- KaTeX Formula Overlay -->
                        <div id="sim-formula-overlay" class="absolute top-4 left-4 max-w-[280px] sm:max-w-xs p-3 sm:p-4 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-lg pointer-events-auto transition-all duration-300">
                            <div id="math-formula-content" class="space-y-2"></div>
                        </div>

                        <!-- Mini Graphs Container (Floating Responsive) -->
                        <div id="sim-graphs-container" class="absolute top-4 right-4 pointer-events-none z-10"></div>
                    </div>

                    <!-- Control & Quest Sidebar -->
                    <div class="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto pr-1">
                        <!-- Controls Card -->
                        <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                            <h3 class="font-kanit font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                 เครื่องมือควบคุม
                            </h3>
                            <div id="sim-controls-container" class="space-y-4"></div>
                            <div class="pt-2 flex gap-2">
                                <button id="sim-reset-btn" class="flex-grow py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold font-kanit text-sm transition-all active:scale-95">รีเซ็ต</button>
                                <button id="sim-play-pause-btn" class="flex-grow py-3 px-4 rounded-xl font-bold font-kanit text-sm transition-all active:scale-95 shadow-lg"></button>
                            </div>
                        </div>

                        <!-- Quests Card -->
                        <div class="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-sm flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <h3 class="font-kanit font-bold text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    ภารกิจเรียนรู้
                                </h3>
                                <span id="quest-counter-badge" class="text-xs font-bold font-kanit px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                                    0/${this.quests.length}
                                </span>
                            </div>
                            <div id="sim-quests-container" class="space-y-2.5"></div>
                        </div>

                        <!-- 5 Formulas Reference Card -->
                        <div class="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-3xl border border-amber-200/60 dark:border-amber-900/30 shadow-sm">
                            <details class="group">
                                <summary class="cursor-pointer font-kanit font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-between">
                                    <span class="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        สรุป 5 สูตรการเคลื่อนที่ (ม.4)
                                    </span>
                                    <span class="text-amber-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div class="mt-3 text-xs space-y-1.5 font-mono text-slate-700 dark:text-slate-300 border-t border-amber-200/50 dark:border-amber-900/30 pt-2">
                                    <div class="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg flex justify-between"><span>1. v = u + at</span><span class="text-[10px] text-slate-400 font-kanit">(ไม่มี s)</span></div>
                                    <div class="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg flex justify-between"><span>2. s = ut + ½at²</span><span class="text-[10px] text-slate-400 font-kanit">(ไม่มี v)</span></div>
                                    <div class="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg flex justify-between"><span>3. s = vt - ½at²</span><span class="text-[10px] text-slate-400 font-kanit">(ไม่มี u)</span></div>
                                    <div class="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg flex justify-between"><span>4. s = ((u+v)/2)t</span><span class="text-[10px] text-slate-400 font-kanit">(ไม่มี a)</span></div>
                                    <div class="p-1.5 bg-white/80 dark:bg-slate-900/80 rounded-lg flex justify-between"><span>5. v² = u² + 2as</span><span class="text-[10px] text-slate-400 font-kanit">(ไม่มี t)</span></div>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        `,this.updatePlayPauseButton()}updatePlayPauseButton(){const e=document.getElementById("sim-play-pause-btn");if(!e)return;this.state.isFinished?(e.textContent="เริ่มใหม่",e.className="flex-grow py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold font-kanit text-sm transition-all active:scale-95 shadow-lg shadow-amber-500/20"):(e.textContent=this.state.isPaused?"เริ่ม":"หยุด",e.className=this.state.isPaused?"flex-grow py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold font-kanit text-sm transition-all active:scale-95 shadow-lg shadow-green-500/20":"flex-grow py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold font-kanit text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20"),e.onclick=()=>{this.state.isFinished?(this.reset(),this.state.isPaused=!1):this.state.isPaused=!this.state.isPaused,this.updatePlayPauseButton()};const t=document.getElementById("sim-reset-btn");t&&(t.onclick=()=>this.reset())}setupTabs(){const e=document.getElementById("sim-tabs-container");if(!e||this.tabs.length===0){e&&(e.style.display="none");return}e.innerHTML=this.tabs.map(t=>`
        <button data-tab-id="${t.id}" class="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold font-kanit transition-all ${this.activeTabId===t.id?"bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm":"text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}">
            ${t.label}
        </button>
    `).join(""),e.querySelectorAll("button").forEach(t=>{t.onclick=()=>this.switchTab(t.dataset.tabId)})}switchTab(e){if(this.activeTabId===e)return;this.activeTabId=e;const t=this.tabs.find(a=>a.id===e);this.initialState=t.initialState||{},this.controls=t.controls||[],this.quests=t.quests||[],this.lastFormulaCache="",this.reset(),this.setupTabs(),this.setupControls(),this.setupQuestUI()}setupCanvas(){this.canvas=document.getElementById("sim-canvas"),this.canvas&&(this.ctx=this.canvas.getContext("2d"),window.ResizeObserver&&this.canvas.parentElement?new ResizeObserver(()=>this.resizeCanvas()).observe(this.canvas.parentElement):window.addEventListener("resize",()=>this.resizeCanvas()),this.resizeCanvas())}resizeCanvas(){if(!this.canvas||!this.canvas.parentElement)return;const e=this.canvas.parentElement.getBoundingClientRect();if(!e.width||!e.height)return;const t=window.devicePixelRatio||1;this.width=e.width,this.height=e.height,this.canvas.width=Math.floor(this.width*t),this.canvas.height=Math.floor(this.height*t),this.ctx.setTransform(1,0,0,1,0,0),this.ctx.scale(t,t)}setupControls(){const e=document.getElementById("sim-controls-container");e&&(e.innerHTML="",this.controls.forEach(t=>{const a=document.createElement("div");if(a.className="space-y-1.5",t.type==="slider"){const i=t.step||1;a.innerHTML=`
            <div class="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                <label for="${t.id}">${t.label}</label>
                <span id="${t.id}-val" class="text-blue-600 dark:text-blue-400 font-mono">${this.state[t.key]}${t.unit||""}</span>
            </div>
            <div class="flex items-center gap-2">
                <button class="sim-stepper-btn px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors" data-action="dec">
                    -
                </button>
                <input type="range" id="${t.id}" min="${t.min}" max="${t.max}" step="${i}" value="${this.state[t.key]}" 
                       class="flex-grow h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600">
                <button class="sim-stepper-btn px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors" data-action="inc">
                    +
                </button>
            </div>
        `;const s=a.querySelector("input"),n=l=>{const r=parseFloat(l);this.state[t.key]=r,s.value=r;const o=document.getElementById(`${t.id}-val`);o&&(o.textContent=`${r}${t.unit||""}`),t.onChange&&t.onChange(r),this.refreshOptionButtons()};s.oninput=l=>n(l.target.value),a.querySelectorAll(".sim-stepper-btn").forEach(l=>{l.onclick=()=>{let r=parseFloat(s.value);l.dataset.action==="dec"?r-=i:r+=i,r=Math.min(Math.max(r,t.min),t.max),n(r)}})}else t.type==="buttons"&&(a.innerHTML=`
            <div class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">${t.label}</div>
            <div class="flex flex-wrap gap-1.5" data-control-key="${t.key}">
                ${t.options.map(i=>{const s=i.value,n=typeof s=="number"||typeof s=="string"&&!isNaN(Number(s))&&s.trim()!==""?parseFloat(s):s,l=this.state[t.key],o=(typeof n=="number"&&typeof l=="number"&&!isNaN(n)&&!isNaN(l)?Math.abs(n-l)<.01:String(n)===String(l))?"px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-bold transition-all border border-blue-600 shadow-sm":"px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all border border-slate-200 dark:border-slate-700";return`<button data-val="${i.value}" class="${o}">${i.label}</button>`}).join("")}
            </div>
        `,a.querySelectorAll("button").forEach(i=>{i.onclick=()=>{const s=i.dataset.val,n=typeof s=="string"&&!isNaN(Number(s))&&s.trim()!==""?parseFloat(s):s;this.state[t.key]=n;const l=document.getElementById(t.linkId);if(l){l.value=n;const r=document.getElementById(`${t.linkId}-val`);r&&(r.textContent=`${n}${t.linkUnit||""}`)}this.refreshOptionButtons(),t.onChange&&t.onChange(n)}}));e.appendChild(a)}))}refreshOptionButtons(){this.controls.filter(e=>e.type==="buttons").forEach(e=>{const t=document.querySelector(`[data-control-key="${e.key}"]`);if(!t)return;const a=this.state[e.key];t.querySelectorAll("button").forEach(i=>{const s=i.dataset.val,n=typeof s=="string"&&!isNaN(Number(s))&&s.trim()!==""?parseFloat(s):s,l=typeof n=="number"&&typeof a=="number"&&!isNaN(n)&&!isNaN(a)?Math.abs(n-a)<.01:String(n)===String(a);i.className=l?"px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-bold transition-all border border-blue-600 shadow-sm":"px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all border border-slate-200 dark:border-slate-700"})})}setupQuestUI(){const e=document.getElementById("sim-quests-container"),t=document.getElementById("quest-counter-badge");e&&(this.completedQuests.clear(),t&&(t.textContent=`0/${this.quests.length}`),e.innerHTML=this.quests.map((a,i)=>`
            <div id="quest-${i}" class="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all flex items-start gap-3 shadow-xs">
                <div class="quest-checkbox w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 transition-all mt-0.5">
                    <svg class="w-3.5 h-3.5 text-white scale-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p class="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-snug">${a.text}</p>
            </div>
        `).join(""))}updateQuestStatus(e,t){if(t&&!this.completedQuests.has(e)){this.completedQuests.add(e);const a=document.getElementById(`quest-${e}`);if(a){a.classList.add("border-green-200","bg-green-50/60","dark:border-green-900/30","dark:bg-green-900/10");const s=a.querySelector(".quest-checkbox");if(s){s.classList.replace("border-slate-200","bg-green-500"),s.classList.add("border-green-500");const n=s.querySelector("svg");n&&n.classList.remove("scale-0")}}const i=document.getElementById("quest-counter-badge");i&&(i.textContent=`${this.completedQuests.size}/${this.quests.length}`,this.completedQuests.size===this.quests.length&&(i.classList.replace("bg-blue-100","bg-green-100"),i.classList.replace("text-blue-600","text-green-600"))),this.completedQuests.size===this.quests.length&&(this.onCompleteAllQuests?this.onCompleteAllQuests():this.showCelebrationBanner())}}showCelebrationBanner(){const e=document.getElementById("sim-quests-container");if(!e||document.getElementById("sim-quest-celebration"))return;const t=document.createElement("div");t.id="sim-quest-celebration",t.className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-kanit font-bold text-xs text-center shadow-md animate-bounce mt-2",t.innerHTML="🎉 ยินดีด้วย! คุณทำครบทุกภารกิจในโหมดนี้สำเร็จแล้ว",e.appendChild(t)}renderMath(e,t){const a=document.getElementById(e);if(!(!a||!window.katex))try{window.katex.render(t,a,{throwOnError:!1,displayMode:!0})}catch(i){console.error("KaTeX Error:",i)}}startLoop(){const e=t=>{this.isActive&&(this.state.isPaused||(this.update(t),this.checkQuests()),this.render(),requestAnimationFrame(e))};requestAnimationFrame(e)}update(e){}render(){}checkQuests(){this.quests.forEach((e,t)=>{!this.completedQuests.has(t)&&e.condition(this.state)&&this.updateQuestStatus(t,!0)})}reset(){this.state=JSON.parse(JSON.stringify(this.initialState)),this.completedQuests.clear(),this.lastFormulaCache="",this.setupQuestUI(),this.updatePlayPauseButton(),this.refreshOptionButtons()}destroy(){this.isActive=!1}}export{c as B};

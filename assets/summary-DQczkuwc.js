const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/common-init-BxdIXgEt.js","assets/preload-helper-DP0d4xQl.js","assets/menu-handler-CE8Vd4b2.js","assets/modal-handler-Dhq6IeBb.js","assets/data-manager-L12rPSmt.js","assets/firebase-config-D2ElzwY6.js","assets/custom-quiz-handler-BKmlal4H.js","assets/sub-category-data-Bkbt3HM0.js","assets/utils-BUPztk3_.js","assets/summary-handler-C8Ehh0w4.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */import{_ as i}from"./preload-helper-DP0d4xQl.js";import{a as c}from"./utils-BUPztk3_.js";import{Gamification as u}from"./gamification-DcusPSHJ.js";import"./firebase-config-D2ElzwY6.js";import"./site-config-I-RQ9TTj.js";async function x(){try{const r=c.waitForAuthReady(),{loadComponent:e}=await i(async()=>{const{loadComponent:t}=await import("./component-loader-CAANrA7H.js");return{loadComponent:t}},[]);await Promise.all([e("#main_header-placeholder","./components/main_header.html"),e("#footer-placeholder","./components/footer.html"),e("#modals-placeholder","./components/modals_common.html")]);const{initializeCommonComponents:m}=await i(async()=>{const{initializeCommonComponents:t}=await import("./common-init-BxdIXgEt.js");return{initializeCommonComponents:t}},__vite__mapDeps([0,1,2,3,4,5,6,7,8]));await m();const n=await r,g=new URLSearchParams(window.location.search).get("dev")==="true",h=n&&n.email&&n.email.endsWith("@promma.ac.th")||g,s=document.getElementById("main-content"),o=document.getElementById("loading-spinner");if(h){s&&s.classList.remove("hidden");const{initializeSummaryPage:t}=await i(async()=>{const{initializeSummaryPage:a}=await import("./summary-handler-C8Ehh0w4.js");return{initializeSummaryPage:a}},__vite__mapDeps([9,4,1,5]));await t(),o&&o.classList.add("hidden")}else o&&o.classList.add("hidden"),(()=>{const a=document.getElementById("access-denied-modal");if(a){a.classList.remove("hidden");const l=document.getElementById("access-denied-login-btn");l&&l.addEventListener("click",()=>{c.login().catch(console.error)}),requestAnimationFrame(()=>{requestAnimationFrame(()=>{a.classList.remove("opacity-0");const d=a.querySelector(".transform");d&&d.classList.replace("scale-95","scale-100")})})}else document.body.insertAdjacentHTML("beforeend",`
                        <div class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md font-sarabun">
                            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-gray-200 dark:border-gray-700">
                                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-kanit">สงวนสิทธิ์การเข้าถึง</h3>
                                <p class="text-gray-600 dark:text-gray-300 mb-8">ขออภัย หน้านี้สำหรับอีเมล <br><span class="font-bold text-blue-600 dark:text-blue-400">@promma.ac.th</span> เท่านั้น</p>
                                <div class="flex flex-col gap-3">
                                    <button onclick="location.reload()" class="inline-block w-full px-6 py-3.5 font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all">ลองใหม่อีกครั้ง</button>
                                    <a href="./index.html" class="inline-block w-full px-6 py-3.5 font-bold rounded-xl text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">กลับสู่หน้าหลัก</a>
                                </div>
                            </div>
                        </div>`)})()}catch(r){console.error("Failed to initialize summary page:",r);const e=document.getElementById("summary-container");e&&(e.innerHTML=`
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
                </div>`)}}document.addEventListener("DOMContentLoaded",x);new u;

const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ch2_combined_motion-DhV3cfs2.js","assets/simulation-engine-qVjUUPGI.js","assets/auth-manager-DxJDYVU6.js","assets/firebase-config-L8WamaTR.js","assets/ch2_linear_motion-Chd21n-R.js","assets/ch2_vertical_motion-CnHmLK7B.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */import"./app-loader-zQbcTp4X.js";import{_ as a}from"./physics_syllabus_data-Mnn3TXVG.js";import"./component-loader-NT3M_rx6.js";import"./common-init-B_fcrrDf.js";import"./menu-handler-D2lJqOlm.js";import"./modal-handler-CjwIEypi.js";import"./data-manager-CW1_qL6J.js";import"./firebase-config-L8WamaTR.js";import"./custom-quiz-handler-wEh03rco.js";import"./sub-category-data-BbbMhFlG.js";import"./auth-manager-DxJDYVU6.js";import"./cosmic-starfield-B0A4CayO.js";import"./site-config-I-RQ9TTj.js";const n={modules:Object.assign({"./simulations/physics/m4/ch2_combined_motion.js":()=>a(()=>import("./ch2_combined_motion-DhV3cfs2.js"),__vite__mapDeps([0,1,2,3])),"./simulations/physics/m4/ch2_linear_motion.js":()=>a(()=>import("./ch2_linear_motion-Chd21n-R.js"),__vite__mapDeps([4,1,2,3])),"./simulations/physics/m4/ch2_vertical_motion.js":()=>a(()=>import("./ch2_vertical_motion-CnHmLK7B.js"),__vite__mapDeps([5,1,2,3]))}),async load(i){let e="";if(i==="m4-ch2"||i==="m4-ch2-v"?e="./simulations/physics/m4/ch2_combined_motion.js":i==="m4-ch7"&&(e="./simulations/physics/m4/ch7_projectile.js"),!e)throw new Error(`ไม่พบรหัส Simulation "${i}" ในระบบ`);const o=this.modules[e];if(!o)throw new Error(`Simulation "${i}" อยู่ระหว่างการพัฒนา (ยังไม่พร้อมใช้งาน)`);try{const t=await o();if(!t.SimulationModule)throw new Error(`Module at ${e} does not export "SimulationModule"`);return t.SimulationModule}catch(t){throw console.error(`Failed to load module for ${i}:`,t),new Error(`ไม่สามารถโหลดไฟล์ Simulation ได้ (${t.message})`)}}};async function s(){const e=new URLSearchParams(window.location.search).get("id"),o=document.getElementById("sim-container");if(!e){o.innerHTML=`
          <div class="p-8 text-center flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <div class="text-5xl mb-2">🔎</div>
            <h3 class="text-xl font-bold font-kanit text-slate-800 dark:text-slate-200">ไม่พบรหัส Simulation</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">กรุณาเลือกบทเรียนจากคลัง Simulation</p>
            <a href="./simulations.html" class="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold font-kanit text-sm shadow-md transition-all">
              ไปยังคลัง Simulation
            </a>
          </div>`;return}try{const t=await n.load(e);await new t({containerId:"sim-container"}).init()}catch(t){console.error(t),o.innerHTML=`
          <div class="p-8 text-center flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <div class="text-5xl mb-2">🛠️</div>
            <h3 class="text-xl font-bold font-kanit text-slate-800 dark:text-slate-200">ไม่สามารถโหลด Simulation ได้</h3>
            <p class="text-sm text-red-500 font-medium max-w-md">${t.message}</p>
            <a href="./simulations.html" class="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold font-kanit text-sm transition-all">
              กลับไปที่คลัง Simulation
            </a>
          </div>`}}window.addEventListener("load",s);

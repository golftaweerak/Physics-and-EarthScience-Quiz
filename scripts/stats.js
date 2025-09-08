import { quizList } from "../data/quizzes-list.js";
import { getSavedCustomQuizzes } from "./custom-quiz-handler.js";
import { categoryDetails, getCategoryDisplayName } from "./data-manager.js";
import { ModalHandler } from "./modal-handler.js";

/**
 * Retrieves all finished quiz stats from localStorage.
 * @returns {Array<object>} An array of quiz objects merged with their progress.
 */
function getAllStats() {
  const allQuizzes = [...quizList, ...getSavedCustomQuizzes()];
  const allStats = [];

  for (const quiz of allQuizzes) {
    const data = localStorage.getItem(quiz.storageKey);
    if (data) {
      try {
        const progress = JSON.parse(data);
        const totalQuestions = progress.shuffledQuestions?.length || 0;
        const answeredCount = progress.userAnswers?.filter((a) => a !== null).length || 0;
        const isFinished = totalQuestions > 0 && answeredCount >= totalQuestions;

        // Ensure a valid URL exists. Standard quizzes have a `url` property.
        // Custom quizzes do not, so we must construct it.
        let finalUrl = quiz.url;
        if (!finalUrl && quiz.customId) {
          // The path is relative to the root where stats.html is located.
          finalUrl = `./quiz/index.html?id=${quiz.customId}`;
        }

        allStats.push({
          ...quiz, // title, category, url, icon etc.
          ...progress, // score, userAnswers, etc.
          url: finalUrl, // Use the canonical or constructed URL
          isFinished: isFinished, // Add the calculated property
        });
      } catch (e) {
        console.error(`Failed to parse stats for ${quiz.storageKey}`, e);
      }
    }
  }

  return allStats;
}

/**
 * Calculates aggregate summary statistics from all completed quizzes.
 * @param {Array<object>} stats - The array of stats from getAllStats.
 * @param {number} totalAvailableQuizzes - The total number of quizzes available (static + custom).
 * @returns {object} An object containing summary data.
 */
function calculateSummary(stats, totalAvailableQuizzes) {
  let totalCorrect = 0;
  let totalAnswered = 0;

  stats.forEach((stat) => {
    totalCorrect += stat.score || 0;
    // If userAnswers exists, count the non-null entries. Otherwise, it's 0.
    totalAnswered += stat.userAnswers?.filter((a) => a !== null).length || 0;
  });

  const averageScore =
    totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

  const completedQuizzes = stats.filter((s) => s.isFinished).length;

  return {
    totalCorrect,
    totalIncorrect: totalAnswered - totalCorrect,
    totalQuestions: totalAnswered,
    completedQuizzes: completedQuizzes,
    inProgressQuizzes: stats.length - completedQuizzes,
    averageScore: averageScore.toFixed(1),
    totalQuizCount: totalAvailableQuizzes,
  };
}

/**
 * Calculates the average score for each main subject category.
 * @param {Array<object>} stats - The array of stats from getAllStats.
 * @returns {Array<object>} A sorted array of objects, each containing subject name, score, and order.
 */
function calculateSubjectPerformance(stats) {
    const performanceBySubject = {};

    stats.forEach(stat => {
        const subject = stat.category || 'Uncategorized';
        if (!performanceBySubject[subject]) {
            performanceBySubject[subject] = { correct: 0, total: 0 };
        }
        performanceBySubject[subject].correct += stat.score || 0;
        performanceBySubject[subject].total += stat.shuffledQuestions?.length || 0;
    });

    return Object.entries(performanceBySubject)
        .map(([subjectKey, data]) => {
            const details = categoryDetails[subjectKey] || { order: 99 };
            return {
                subject: getCategoryDisplayName(subjectKey),
                score: data.total > 0 ? (data.correct / data.total) * 100 : 0,
                order: details.order,
            };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => a.order - b.order);
}
/**
 * Calculates performance metrics grouped by subject (category), then by chapter (main subCategory),
 * and finally by learning outcome/specific topic (specific subCategory).
 * @param {Array<object>} stats - The array of stats from getAllStats, which includes userAnswers.
 * @returns {object} A nested object representing the grouped performance data.
 */
function calculateGroupedPerformance(stats) {
    const performanceBySubject = {};

    stats.forEach(stat => {
        if (!stat.userAnswers) return;

        stat.userAnswers.forEach(answer => {
            const subject = stat.category || 'Uncategorized';
            if (!answer || typeof answer.subCategory !== 'object' || !answer.subCategory.main || !answer.subCategory.specific) {
                return;
            }

            const chapter = answer.subCategory.main;
            const learningOutcome = answer.subCategory.specific;

            // Initialize structures
            if (!performanceBySubject[subject]) {
                performanceBySubject[subject] = {};
            }
            if (!performanceBySubject[subject][chapter]) {
                performanceBySubject[subject][chapter] = {};
            }
            if (!performanceBySubject[subject][chapter][learningOutcome]) {
                performanceBySubject[subject][chapter][learningOutcome] = { correct: 0, total: 0 };
            }

            // Increment counts.
            performanceBySubject[subject][chapter][learningOutcome].total++;
            if (answer.isCorrect) {
                performanceBySubject[subject][chapter][learningOutcome].correct++;
            }
        });
    });

    const finalGroupedData = {};
    for (const subject in performanceBySubject) {
        finalGroupedData[subject] = {};
        for (const chapter in performanceBySubject[subject]) {
            const outcomes = Object.entries(performanceBySubject[subject][chapter])
                .map(([name, data]) => ({
                    name, ...data,
                    averageScore: data.total > 0 ? (data.correct / data.total) * 100 : 0,
                }))
                .filter(item => item.total > 0)
                .sort((a, b) => a.name.localeCompare(b.name, 'th'));

            if (outcomes.length > 0) {
                finalGroupedData[subject][chapter] = outcomes;
            }
        }
    }

    return finalGroupedData;
}
/**
 * Renders the four summary cards at the top of the page.
 * @param {object} summary - The summary object from calculateSummary.
 */
function renderSummaryCards(summary) {
  const container = document.getElementById("summary-cards-grid");
  if (!container) return;

  const completedPercentage =
    summary.totalQuizCount > 0
      ? (summary.completedQuizzes / summary.totalQuizCount) * 100
      : 0;
  const inProgressPercentage =
    summary.totalQuizCount > 0
      ? (summary.inProgressQuizzes / summary.totalQuizCount) * 100
      : 0;
  const correctPercentage =
    summary.totalQuestions > 0
      ? (summary.totalCorrect / summary.totalQuestions) * 100
      : 0;

  const cards = [
    {
      label: "ทำเสร็จแล้ว",
      value: `${summary.completedQuizzes} <span class="text-sm font-normal text-gray-500 dark:text-gray-400">/ ${summary.totalQuizCount} ชุด</span>`,
      percentage: completedPercentage,
      color: "bg-blue-500",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      iconBgColor: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300",
    },
    {
      label: "กำลังทำ",
      value: `${summary.inProgressQuizzes} <span class="text-sm font-normal text-gray-500 dark:text-gray-400">/ ${summary.totalQuizCount} ชุด</span>`,
      percentage: inProgressPercentage,
      color: "bg-indigo-500",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>`,
      iconBgColor: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300",
    },
    {
      label: "ตอบถูกทั้งหมด",
      value: `${summary.totalCorrect} <span class="font-normal text-gray-500 text-sm">/ ${summary.totalQuestions} ข้อ</span>`,
      percentage: correctPercentage,
      color: "bg-green-500",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`,
      iconBgColor: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300",
    },
    {
      label: "คะแนนเฉลี่ย",
      value: `${summary.averageScore}%`,
      percentage: parseFloat(summary.averageScore),
      color: "bg-purple-500",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>`,
      iconBgColor: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
    },
  ];

  container.innerHTML = cards
    .map((card) => {
      const percentage = card.percentage.toFixed(0);
      return `
        <div class="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-start sm:items-center gap-4">
            <div class="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${card.iconBgColor}">
                ${card.icon}
            </div>
            <div class="flex-grow">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-1 sm:gap-0">
                    <span class="font-medium text-gray-700 dark:text-gray-200 text-sm">${card.label}</span>
                    <span class="font-bold text-xl text-gray-800 dark:text-gray-100 flex-shrink-0">${card.value}</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="${card.color} h-2 rounded-full" style="width: ${percentage}%"></div>
                </div>
            </div>
        </div>
        `;
    })
    .join("");
}

/**
 * Renders the overall progress donut chart.
 * @param {object} summary - The summary object from calculateSummary.
 */
function renderOverallChart(summary) {
  const ctx = document.getElementById("overall-chart")?.getContext("2d");
  if (!ctx) return;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["ตอบถูก", "ตอบผิด"],
      datasets: [
        {
          data: [summary.totalCorrect, summary.totalIncorrect],
          backgroundColor: ["#22c55e", "#ef4444"],
          borderColor: document.documentElement.classList.contains("dark")
            ? "#1f2937" // Use gray-800 to match the card background in dark mode
            : "#ffffff",
          borderWidth: 4,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: document.documentElement.classList.contains("dark")
              ? "#d1d5db" // gray-300 for better contrast in dark mode
              : "#374151", // gray-700 for better readability
            font: { family: "'Kanit', sans-serif", size: 14 },
          },
        },
        tooltip: {
          titleFont: { family: "'Kanit', sans-serif" },
          bodyFont: { family: "'Sarabun', sans-serif" },
        },
      },
    },
  });
}

/**
 * Renders a horizontal bar chart showing the average score per subject.
 * @param {Array<object>} subjectData - Data from calculateSubjectPerformance.
 */
function renderSubjectPerformanceChart(subjectData) {
    const ctx = document.getElementById('subject-performance-chart')?.getContext('2d');
    if (!ctx || subjectData.length === 0) return;

    const labels = subjectData.map(d => d.subject);
    const scores = subjectData.map(d => d.score);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'คะแนนเฉลี่ย (%)',
                data: scores,
                backgroundColor: scores.map(score => score >= 75 ? 'rgba(34, 197, 94, 0.7)' : score >= 50 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                borderColor: scores.map(score => score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'),
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            indexAxis: 'y', // Make it a horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
                        callback: function(value) {
                            return value + '%'
                        }
                    }
                },
                y: {
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
                        font: { family: "'Kanit', sans-serif" }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: context => `คะแนนเฉลี่ย: ${context.raw.toFixed(1)}%` } }
            }
        }
    });
}

/**
 * Initializes the tab navigation functionality.
 */
function initializeTabs() {
    const tabContainer = document.querySelector('[aria-label="Tabs"]');
    if (!tabContainer) return;

    const tabs = tabContainer.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('[role="tabpanel"]');

    const activeTabClasses = ['border-blue-500', 'text-blue-600', 'dark:border-blue-400', 'dark:text-blue-400', 'font-bold'];
    const inactiveTabClasses = ['border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'dark:text-gray-400', 'dark:hover:text-gray-200', 'dark:hover:border-gray-500', 'font-medium'];

    tabContainer.addEventListener('click', (e) => {
        const clickedTab = e.target.closest('[role="tab"]');
        if (!clickedTab) return;

        // Deactivate all tabs and hide all panels
        tabs.forEach(tab => {
            tab.setAttribute('aria-selected', 'false');
            tab.classList.remove(...activeTabClasses);
            tab.classList.add(...inactiveTabClasses);
            
            const panelId = tab.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (panel) panel.classList.add('hidden');
        });

        // Activate the clicked tab and show its panel
        clickedTab.setAttribute('aria-selected', 'true');
        clickedTab.classList.remove(...inactiveTabClasses);
        clickedTab.classList.add(...activeTabClasses);
        const activePanel = document.getElementById(clickedTab.getAttribute('aria-controls'));
        if (activePanel) activePanel.classList.remove('hidden');
    });
}
/**
 * Renders the performance data as a series of nested accordions, grouped by subject and then chapter.
 * @param {object} groupedData - Data from calculateGroupedCategoryPerformance.
 */
let isAccordionListenerAttached = false;

function renderPerformanceAccordions(groupedData) {
    const container = document.getElementById("subject-performance-container");
    if (!container) return;

    // Add the title here dynamically
    container.innerHTML = `<h2 class="text-2xl font-bold font-kanit text-gray-800 dark:text-gray-100 mb-4">วิเคราะห์คะแนนรายบทเรียน</h2>`;

    const sortedSubjects = Object.keys(groupedData).sort((a, b) => {
        const orderA = categoryDetails[a]?.order || 99;
        const orderB = categoryDetails[b]?.order || 99;
        return orderA - orderB;
    });

    if (sortedSubjects.length === 0) {
        container.innerHTML += `<p class="text-center text-gray-500 dark:text-gray-400">ไม่มีข้อมูลคะแนน</p>`;
        return;
    }

    sortedSubjects.forEach(subjectKey => {
        const chapters = groupedData[subjectKey];
        const subjectDetails = categoryDetails[subjectKey] || { displayName: subjectKey, color: 'border-gray-500', icon: './assets/icons/study.png' };

        const subjectAccordion = document.createElement('div');
        subjectAccordion.className = 'bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden';

        let chapterAccordionsHTML = '';
        const sortedChapters = Object.keys(chapters).sort((a, b) => a.localeCompare(b, 'th'));

        sortedChapters.forEach(chapterTitle => {
            const outcomes = chapters[chapterTitle];
            if (!outcomes || outcomes.length === 0) return;

            const chapterStats = outcomes.reduce((acc, sub) => {
                acc.correct += sub.correct;
                acc.total += sub.total;
                return acc;
            }, { correct: 0, total: 0 });
            const chapterAvg = chapterStats.total > 0 ? (chapterStats.correct / chapterStats.total) * 100 : 0;
            const chapterPercentage = chapterAvg.toFixed(0);
            const chapterColorClass = chapterAvg >= 75 ? 'bg-green-500' : chapterAvg >= 50 ? 'bg-yellow-500' : 'bg-red-500';

            const outcomeItemsHTML = outcomes.map(data => {
                const percentage = data.averageScore.toFixed(0);
                const colorClass = percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                return `
                    <div class="p-3 border-t border-gray-200 dark:border-gray-700/50">
                        <div class="flex justify-between items-center text-sm">
                            <span class="font-medium text-gray-700 dark:text-gray-200">${data.name.replace(/^ว\s[\d\.]+\sม\.[\d\/]+\s/, '').replace(/^\d+\.\s/, '').trim()}</span>
                            <span class="font-semibold text-gray-800 dark:text-gray-100">${data.correct}/${data.total} <span class="font-normal text-gray-500 dark:text-gray-400">(${percentage}%)</span></span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1.5">
                            <div class="${colorClass} h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            }).join('');

            chapterAccordionsHTML += `
                <div class="bg-gray-50 dark:bg-gray-800/30 rounded-lg mx-4 mb-2 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                    <div class="category-accordion-toggle flex justify-between items-center cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors">
                        <div class="flex-grow min-w-0">
                            <div class="flex justify-between items-baseline mb-1">
                                <h4 class="text-base font-bold text-gray-800 dark:text-gray-200 font-kanit truncate pr-2">${chapterTitle}</h4>
                                <span class="font-kanit font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0 text-sm sm:text-base">${chapterPercentage}%</span>
                            </div>
                            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div class="${chapterColorClass} h-2 rounded-full" style="width: ${chapterPercentage}%"></div>
                            </div>
                        </div>
                        <svg class="chevron-icon h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ml-2 sm:ml-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    <div class="specific-categories-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                        <div class="overflow-hidden">
                            ${outcomeItemsHTML}
                        </div>
                    </div>
                </div>
            `;
        });

        // Calculate overall stats for the subject header
        const subjectTotal = Object.values(chapters).flat().reduce((sum, outcome) => sum + outcome.total, 0);
        const subjectCorrect = Object.values(chapters).flat().reduce((sum, outcome) => sum + outcome.correct, 0);
        const subjectAvg = subjectTotal > 0 ? (subjectCorrect / subjectTotal) * 100 : 0;
        const subjectPercentage = subjectAvg.toFixed(0);
        const subjectColorClass = subjectAvg >= 75 ? 'bg-green-500' : subjectAvg >= 50 ? 'bg-yellow-500' : 'bg-red-500';

        subjectAccordion.innerHTML = `
            <div class="subject-accordion-toggle flex justify-between items-center cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div class="flex items-center flex-grow min-w-0 gap-3 sm:gap-4">
                    <div class="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center border-4 ${subjectDetails.color} bg-white p-1 sm:p-1.5">
                        <img src="${subjectDetails.icon}" alt="${subjectDetails.displayName} Icon" class="h-full w-full object-contain">
                    </div>
                    <div class="flex-grow min-w-0">
                        <div class="flex justify-between items-baseline mb-1">
                            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 font-kanit truncate pr-2">${subjectDetails.displayName}</h3>
                            <span class="font-kanit font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0 text-base sm:text-lg">${subjectPercentage}%</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div class="${subjectColorClass} h-2.5 rounded-full" style="width: ${subjectPercentage}%"></div>
                        </div>
                    </div>
                </div>
                <svg class="chevron-icon h-6 w-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ml-2 sm:ml-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
            <div class="chapters-container grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out">
                <div class="overflow-hidden pt-2">
                    ${chapterAccordionsHTML}
                </div>
            </div>
        `;
        container.appendChild(subjectAccordion);
    });

    // Add event listener for the accordions, but only once.
    if (!isAccordionListenerAttached && sortedSubjects.length > 0) {
        container.addEventListener('click', (e) => {
            const toggle = e.target.closest('.subject-accordion-toggle, .category-accordion-toggle');
            if (!toggle) return;

            const content = toggle.nextElementSibling;
            const icon = toggle.querySelector('.chevron-icon');
            const isOpen = content.classList.contains('grid-rows-[1fr]');
            content.classList.toggle('grid-rows-[1fr]', !isOpen);
            content.classList.toggle('grid-rows-[0fr]', isOpen);
            icon.classList.toggle('rotate-180', !isOpen);
        });
        isAccordionListenerAttached = true;
    }
}
/**
 * Renders the detailed list of all quizzes taken, ensuring each item is a functional link
 * that allows the user to retake the quiz, now displayed as info-rich cards.
 * @param {Array<object>} stats - The array of stats from getAllStats.
 */
function renderDetailedList(stats) {
    const container = document.getElementById("detailed-stats-container");
    if (!container) return;

    // The container is now a grid.
    container.className = "grid grid-cols-1 md:grid-cols-2 gap-6";

    stats.sort((a, b) => {
        if (a.isFinished !== b.isFinished) {
            return a.isFinished ? 1 : -1; // In-progress quizzes first
        }
        return (b.lastAttemptTimestamp || 0) - (a.lastAttemptTimestamp || 0); // Then by most recent
    });

    if (stats.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 md:col-span-2">ไม่มีประวัติการทำแบบทดสอบ</p>`;
        return;
    }

    container.innerHTML = stats.map((stat, index) => {
        const { title, url, isFinished, score, shuffledQuestions, userAnswers, icon, altText, category, storageKey } = stat;
        const totalQuestions = shuffledQuestions?.length || 0;
        const answeredCount = userAnswers?.filter((a) => a !== null).length || 0;
        const scorePercentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(0) : 0;

        const categoryDetail = categoryDetails[category];
        const colorName = categoryDetail?.color?.split('-')[1] || 'gray';

        let statusText, statusColor, buttonText, buttonColor;

        if (isFinished) {
            statusText = `ทำเสร็จแล้ว - คะแนน ${scorePercentage}%`;
            statusColor = 'text-green-600 dark:text-green-400';
            buttonText = 'ดูผล / ทำใหม่';
            buttonColor = `bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600`;
        } else {
            statusText = `ทำไป ${answeredCount}/${totalQuestions} ข้อ`;
            statusColor = 'text-blue-600 dark:text-blue-400';
            buttonText = 'ทำต่อ';
            buttonColor = `bg-blue-600 hover:bg-blue-700 text-white`;
        }

        return `
            <div class="stat-quiz-card flex flex-col bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:border-${colorName}-400 dark:hover:border-${colorName}-500 transform hover:-translate-y-1" style="animation-delay: ${index * 50}ms;">
                <div class="flex items-start gap-4 flex-grow">
                    <div class="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-2">
                        <img src="${icon || './assets/icons/dices.png'}" alt="${altText || title}" class="h-full w-full object-contain">
                    </div>
                    <div class="min-w-0">
                        <h4 class="font-bold text-gray-800 dark:text-gray-100 truncate">${title}</h4>
                        <p class="text-sm font-medium ${statusColor}">${statusText}</p>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <a href="${url}" 
                       data-is-finished="${isFinished}"
                       data-storage-key="${storageKey}"
                       data-quiz-title="${title}"
                       class="quiz-stat-item block w-full text-center px-4 py-2 rounded-lg text-sm font-bold transition ${buttonColor}">
                        ${buttonText}
                    </a>
                </div>
            </div>
        `;
    }).join("");
}

/**
 * Shows a modal asking the user whether to view results or restart a completed quiz.
 * @param {string} title - The title of the quiz.
 * @param {string} url - The base URL of the quiz.
 * @param {string} storageKey - The localStorage key for the quiz's progress.
 */
let finishedQuizModalHandler;

function showFinishedQuizModal(title, url, storageKey) {
    if (!finishedQuizModalHandler) return;

    const modalTitle = document.getElementById('finished-quiz-modal-title');
    const viewBtn = document.getElementById('view-results-btn');
    const restartBtn = document.getElementById('restart-quiz-btn');

    if (!modalTitle || !viewBtn || !restartBtn) return;

    modalTitle.textContent = title;

    // Directly assign onclick handlers. This is simpler and automatically
    // replaces any previous handlers. The cloneNode pattern is not needed here.
    viewBtn.onclick = () => {
        // Construct the URL to view results and navigate.
        const finalUrl = url.includes('?') ? `${url}&action=view_results` : `${url}?action=view_results`;
        window.location.href = finalUrl;
        finishedQuizModalHandler.close();
    };

    restartBtn.onclick = () => {
        // Clear the saved state for this quiz and navigate to start it over.
        localStorage.removeItem(storageKey);
        window.location.href = url;
        finishedQuizModalHandler.close();
    };

    finishedQuizModalHandler.open();
}

/**
 * Sets up a single, unified event listener for all quiz items in the detailed list.
 * Clicking any item will navigate to the quiz URL to retake it.
 */
function setupActionListeners() {
    const container = document.getElementById("detailed-stats-container");
    if (!container) return;

    container.addEventListener('click', (e) => {
        const statItem = e.target.closest('.quiz-stat-item');
        if (!statItem) return;

        // Prevent the default link behavior to handle navigation via script.
        e.preventDefault();

        const isFinished = statItem.dataset.isFinished === 'true';
        const url = statItem.getAttribute('href');
        const storageKey = statItem.dataset.storageKey;
        const title = statItem.dataset.quizTitle;

        if (!url || !storageKey) {
            console.error('Missing URL or storageKey on clicked stat item.', statItem);
            return;
        }

        if (isFinished) {
            // For finished quizzes, show a modal with options.
            showFinishedQuizModal(title, url, storageKey);
        } else {
            // For quizzes in progress, navigate directly to resume.
            window.location.href = url;
        }
    });
}

/**
 * Main function to build the entire stats page.
 * It orchestrates fetching, calculating, and rendering all components.
 */
export function buildStatsPage() {
    const loadingSpinner = document.getElementById("loading-spinner");
    const noStatsMessage = document.getElementById("no-stats-message");
    const statsContent = document.getElementById("stats-content");

    const allStats = getAllStats();
    const totalAvailableQuizzes = quizList.length + getSavedCustomQuizzes().length;

    loadingSpinner.classList.add("hidden");

    if (allStats.length === 0) {
        noStatsMessage.classList.remove("hidden");
        document.getElementById("clear-stats-btn").disabled = true;
    } else {
        const groupedData = calculateGroupedPerformance(allStats);
        const summary = calculateSummary(allStats, totalAvailableQuizzes);
        const subjectPerformance = calculateSubjectPerformance(allStats);
        renderSummaryCards(summary);
        renderOverallChart(summary);
        renderSubjectPerformanceChart(subjectPerformance);
        renderPerformanceAccordions(groupedData);
        renderDetailedList(allStats);
        finishedQuizModalHandler = new ModalHandler('finished-quiz-modal');
        setupActionListeners();
        initializeTabs();
        statsContent.classList.add("anim-fade-in");
        statsContent.style.opacity = 1;
    }
}

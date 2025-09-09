export async function loadHeader() {
    const headerPlaceholder = document.getElementById('main_header-placeholder');
    if (!headerPlaceholder) return;

    // Determine base path based on current page location
    const isSubdirectory = window.location.pathname.includes('/quiz/');
    const basePath = isSubdirectory ? '../' : './';

    try {
        const response = await fetch(`${basePath}header.html`);
        if (!response.ok) throw new Error('Header not found');
        let headerHTML = await response.text();
        
        // Adjust asset paths within the loaded HTML
        headerHTML = headerHTML.replace(/src="\.\//g, `src="${basePath}`);
        headerHTML = headerHTML.replace(/href="\.\//g, `href="${basePath}`);

        headerPlaceholder.innerHTML = headerHTML;
    } catch (error) {
        console.error('Failed to load header:', error);
        headerPlaceholder.innerHTML = '<p class="text-red-500 text-center">Failed to load header.</p>';
    }
}
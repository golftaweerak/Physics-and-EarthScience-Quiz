import { execSync } from 'child_process';

console.log('🚀 Step 1: Staging files...');
try {
    execSync('git add .', { stdio: 'inherit' });
} catch (e) {}

console.log('📝 Step 2: Committing changes...');
try {
    execSync('git commit -m "Update and deploy web app"', { stdio: 'inherit' });
} catch (e) {
    console.log('ℹ️ Nothing to commit.');
}

console.log('⬆️ Step 3: Pushing to main branch...');
try {
    execSync('git push origin main', { stdio: 'inherit' });
} catch (e) {
    console.warn('⚠️ Push warning:', e.message);
}

console.log('📦 Step 4: Building production bundle...');
try {
    execSync('npm run build', { stdio: 'inherit' });
} catch (e) {
    console.error('❌ Build failed:', e.message);
    process.exit(1);
}

console.log('🌐 Step 5: Publishing to GitHub Pages...');
try {
    execSync('npx gh-pages -d dist --branch gh-pages --dotfiles -f', { stdio: 'inherit' });
} catch (e) {
    console.log('ℹ️ Deployment finished with warnings.');
} finally {
    console.log('🔄 Step 6: Ensuring workspace is back on main branch...');
    try {
        execSync('git checkout main', { stdio: 'inherit' });
        console.log('✅ Successfully back on main branch!');
    } catch (e) {
        console.error('❌ Could not checkout main:', e.message);
    }
}

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

console.log('🚀 Step 1: Staging files on main...');
try {
    execSync('git add .', { stdio: 'inherit' });
} catch (e) {}

console.log('📝 Step 2: Committing changes on main...');
try {
    execSync('git commit -m "Update and deploy web app"', { stdio: 'inherit' });
} catch (e) {
    console.log('ℹ️ Nothing to commit on main.');
}

console.log('⬆️ Step 3: Pushing main branch to remote...');
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

console.log('🌐 Step 5: Publishing dist to gh-pages branch cleanly...');
try {
    execSync('git checkout -B gh-pages', { stdio: 'inherit' });
    execSync('git rm -rf --cached .', { stdio: 'inherit' });
    execSync('git add dist/* -f', { stdio: 'inherit' });
    execSync('git commit -m "Deploy production dist build"', { stdio: 'inherit' });
    execSync('git push -u origin gh-pages -f', { stdio: 'inherit' });
    console.log('🎉 GitHub Pages branch published successfully!');
} catch (e) {
    console.error('❌ Deployment error:', e.message);
} finally {
    console.log('🔄 Step 6: Switching workspace back to main branch...');
    try {
        execSync('git checkout main -f', { stdio: 'inherit' });
        console.log('✅ Workspace is cleanly on main branch!');
    } catch (e) {
        console.error('❌ Could not checkout main:', e.message);
    }
}

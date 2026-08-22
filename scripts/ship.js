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
    execSync('npx rimraf node_modules/.cache/gh-pages', { stdio: 'inherit' });
    execSync('npx gh-pages -d dist --dotfiles -m "Deploy production dist build"', { stdio: 'inherit' });
    console.log('🎉 GitHub Pages branch published successfully!');
} catch (e) {
    console.error('❌ Deployment error:', e.message);
}

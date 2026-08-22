import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import ghpages from 'gh-pages';

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

console.log('🌐 Step 5: Publishing dist directly to gh-pages branch...');
try {
    execSync('git add dist -f', { stdio: 'inherit' });
    const tree = execSync('git write-tree --prefix=dist').toString().trim();
    
    let parentCommit = '';
    try {
        parentCommit = execSync('git rev-parse origin/gh-pages').toString().trim();
    } catch (e) {}

    const commitCmd = parentCommit 
        ? `git commit-tree ${tree} -p ${parentCommit} -m "Deploy production dist build"`
        : `git commit-tree ${tree} -m "Deploy production dist build"`;
        
    const newCommit = execSync(commitCmd).toString().trim();
    execSync(`git update-ref refs/heads/gh-pages ${newCommit}`, { stdio: 'inherit' });
    execSync('git push origin gh-pages', { stdio: 'inherit' });
    execSync('git reset HEAD dist', { stdio: 'ignore' });

    console.log('🎉 GitHub Pages branch deployed successfully!');
} catch (e) {
    console.error('❌ Deployment error:', e.message);
}

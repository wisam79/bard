const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, '..', 'src'));
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Instead of complex logic, if the file contains text-white, we replace it conditionally per line
    const lines = content.split('\n');
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes('text-white') && !line.includes('dark:text-white')) {
            // Check for known background classes in the same line that necessitate white text
            if (line.includes('bg-primary-') || 
                line.includes('bg-red-') || 
                line.includes('bg-green-') || 
                line.includes('bg-blue-') ||
                line.includes('btn-primary')) {
                continue;
            }
            // Add dark:text-white text-gray-900 to ensure light mode uses dark text
            lines[i] = line.replace(/text-white/g, 'dark:text-white text-gray-900');
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(file, lines.join('\n'), 'utf8');
        changedFiles++;
    }
});
console.log('Done! Updated ' + changedFiles + ' files.');

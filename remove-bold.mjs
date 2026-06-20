import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.astro')) {
        results.push(file);
      }
    }
  });
  return results;
}

const astroFiles = walk('src/pages');

astroFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/<b>/g, '').replace(/<\/b>/g, '');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
console.log('Done removing <b> tags.');

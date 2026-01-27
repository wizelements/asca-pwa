// Fix failed downloads with alternative horse images
const https = require('https');
const fs = require('fs');
const path = require('path');

const projectPath = 'c:\\Users\\jacla\\projects\\asca-pwa';

// Alternative URLs for failed images
const fixes = [
  { path: 'hero/blog.jpg', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=400&fit=crop&q=80' },
  { path: 'gallery/lesson-1.jpg', url: 'https://images.unsplash.com/photo-1520052205864-92d242b3a76b?w=800&h=600&fit=crop&q=80' },
  { path: 'blog/trail-tips.jpg', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&q=80' },
];

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            const size = fs.statSync(dest).size / 1024;
            resolve(size);
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          const size = fs.statSync(dest).size / 1024;
          resolve(size);
        });
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔧 Fixing missing images...\n');
  
  for (const fix of fixes) {
    const dest = path.join(projectPath, 'public', 'images', fix.path);
    try {
      const size = await downloadImage(fix.url, dest);
      console.log(`✅ ${fix.path} (${size.toFixed(1)}KB)`);
    } catch (err) {
      console.log(`❌ ${fix.path}: ${err.message}`);
    }
  }
  
  console.log('\n✅ Done!');
}

main().catch(console.error);

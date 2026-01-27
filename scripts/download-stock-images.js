// Download and save optimized stock horse images for ASCA PWA
// Uses Unsplash Source API for royalty-free horse/equestrian images

const https = require('https');
const fs = require('fs');
const path = require('path');

const projectPath = 'c:\\Users\\jacla\\projects\\asca-pwa';

// Image configurations with Unsplash Source URLs
const imageConfigs = {
  hero: [
    { name: 'home.jpg', url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&h=400&fit=crop&q=80', desc: 'Horse riding hero' },
    { name: 'about.jpg', url: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?w=1200&h=400&fit=crop&q=80', desc: 'Horse in field' },
    { name: 'members.jpg', url: 'https://images.unsplash.com/photo-1450052590821-8bf91254a353?w=1200&h=400&fit=crop&q=80', desc: 'Group riding' },
    { name: 'calendar.jpg', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop&q=80', desc: 'Horse event' },
    { name: 'blog.jpg', url: 'https://images.unsplash.com/photo-1534773728080-33d31da021e3?w=1200&h=400&fit=crop&q=80', desc: 'Trail riding' },
    { name: 'donate.jpg', url: 'https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=1200&h=400&fit=crop&q=80', desc: 'Horse care' },
    { name: 'involved.jpg', url: 'https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?w=1200&h=400&fit=crop&q=80', desc: 'Community ride' },
  ],
  gallery: [
    { name: 'trail-ride-1.jpg', url: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=800&h=600&fit=crop&q=80', desc: 'Trail ride' },
    { name: 'lesson-1.jpg', url: 'https://images.unsplash.com/photo-1508761845413-c98a6bf1a136?w=800&h=600&fit=crop&q=80', desc: 'Riding lesson' },
    { name: 'event-1.jpg', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=600&fit=crop&q=80', desc: 'Community event' },
    { name: 'horses-1.jpg', url: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=800&h=600&fit=crop&q=80', desc: 'Horses' },
    { name: 'barn-1.jpg', url: 'https://images.unsplash.com/photo-1584714268709-c3dd9c92b378?w=800&h=600&fit=crop&q=80', desc: 'Barn' },
  ],
  members: [
    { name: 'member-1.jpg', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80', desc: 'Member portrait' },
    { name: 'member-2.jpg', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80', desc: 'Member portrait' },
    { name: 'member-3.jpg', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80', desc: 'Member portrait' },
    { name: 'member-4.jpg', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&q=80', desc: 'Member portrait' },
    { name: 'member-5.jpg', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&q=80', desc: 'Member portrait' },
  ],
  events: [
    { name: 'event-placeholder.jpg', url: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=800&h=400&fit=crop&q=80', desc: 'Event' },
  ],
  blog: [
    { name: 'therapy.jpg', url: 'https://images.unsplash.com/photo-1509914398892-963f53e6e2f1?w=800&h=400&fit=crop&q=80', desc: 'Therapy' },
    { name: 'trail-tips.jpg', url: 'https://images.unsplash.com/photo-1534773728080-33d31da021e3?w=800&h=400&fit=crop&q=80', desc: 'Trail' },
    { name: 'fundraiser.jpg', url: 'https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?w=800&h=400&fit=crop&q=80', desc: 'Fundraiser' },
  ],
};

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
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
  console.log('🖼️  Downloading stock images for ASCA PWA...\n');
  
  for (const [category, images] of Object.entries(imageConfigs)) {
    const dir = path.join(projectPath, 'public', 'images', category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    console.log(`📁 ${category}/`);
    
    for (const img of images) {
      const dest = path.join(dir, img.name);
      try {
        const size = await downloadImage(img.url, dest);
        console.log(`   ✅ ${img.name} (${size.toFixed(1)}KB)`);
      } catch (err) {
        console.log(`   ❌ ${img.name}: ${err.message}`);
      }
    }
    console.log('');
  }
  
  console.log('✅ Download complete!');
}

main().catch(console.error);

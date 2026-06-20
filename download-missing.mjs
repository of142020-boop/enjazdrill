import fs from 'fs';
import path from 'path';
import https from 'https';

const images = [
  'https://enjazdrill.com/wp-content/uploads/2018/11/quote-1.png',
  'https://enjazdrill.com/wp-content/uploads/2025/12/outdoor-image-01.webp',
  'https://enjazdrill.com/wp-content/uploads/2025/12/image-1.webp',
  'https://enjazdrill.com/wp-content/uploads/2025/12/snow-1.webp',
  'https://enjazdrill.com/wp-content/uploads/2025/12/outdoor-image-04.webp'
];

const dir = './public/images';

const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const filename = decodeURIComponent(url.split('/').pop());
    const filepath = path.join(dir, filename);
    
    if (fs.existsSync(filepath)) {
      console.log('موجود مسبقاً:', filename);
      return resolve();
    }
    
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log('✅ تم تحميل:', filename);
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
};

async function main() {
  for (const url of images) {
    try {
      await downloadImage(url);
    } catch (err) {
      console.error(err.message);
    }
  }
}

main();

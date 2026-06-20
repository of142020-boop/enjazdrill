import fs from 'fs';
import path from 'path';
import https from 'https';

const images = [
  'https://enjazdrill.com/wp-content/uploads/2025/12/%D9%83%D9%88%D8%B1.webp',
  'https://enjazdrill.com/wp-content/uploads/2025/12/%D9%85%D9%86%D8%B4%D8%A7%D8%B1.webp',
  'https://enjazdrill.com/wp-content/uploads/2025/12/9.webp',
  'https://enjazdrill.com/wp-content/uploads/2026/01/cropped-core-drill-augers-concrete-cutting-drilling-austria-drill-799344f1b8cd17dc43aacb2df36c2cea-scaled-1.png'
];

const dir = './public/images';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const filename = decodeURIComponent(url.split('/').pop());
    const filepath = path.join(dir, filename);
    
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
      console.error('❌ خطأ في تحميل:', filename, err.message);
      reject(err);
    });
  });
};

async function main() {
  console.log('جارِ تحميل الصور إلى مجلد public/images...');
  for (const url of images) {
    try {
      await downloadImage(url);
    } catch (err) {
      console.error(err.message);
    }
  }
  console.log('اكتمل تحميل جميع الصور!');
}

main();

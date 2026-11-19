const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const targetDir = path.join(rootDir, 'assets', 'images');
const sourceLogoPath = path.join(targetDir, 'logo.png');

if (!fs.existsSync(sourceLogoPath)) {
  console.error('Source logo not found at:', sourceLogoPath);
  process.exit(1);
}

async function generateAll() {
  console.log('[generate-assets] Processing user Barbie logo into all Android & Expo assets...');

  // 1. Read source logo and get trimmed buffer
  const sourceImage = sharp(sourceLogoPath);
  const trimmedBuffer = await sourceImage.trim().toBuffer();
  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  console.log(`✓ Trimmed source logo: ${trimmedMeta.width}x${trimmedMeta.height}`);

  // 2. Master Icon: icon.png (1024x1024)
  // Clean blush squircle surface with the trimmed logo centered (800x800 fit)
  const iconCanvasSize = 1024;
  const iconTargetSize = 820; // 80% of canvas for balanced margins
  const resizedForIcon = await sharp(trimmedBuffer)
    .resize(iconTargetSize, iconTargetSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const iconBackgroundSvg = `
    <svg width="${iconCanvasSize}" height="${iconCanvasSize}" viewBox="0 0 ${iconCanvasSize} ${iconCanvasSize}">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="60%" stop-color="#FFF5F8" />
          <stop offset="100%" stop-color="#FFE4EE" />
        </radialGradient>
      </defs>
      <rect width="${iconCanvasSize}" height="${iconCanvasSize}" rx="220" fill="url(#bgGlow)" />
    </svg>
  `;
  const iconBgBuffer = await sharp(Buffer.from(iconBackgroundSvg)).png().toBuffer();

  await sharp(iconBgBuffer)
    .composite([{ input: resizedForIcon, gravity: 'center' }])
    .png({ compressionLevel: 9, quality: 95 })
    .toFile(path.join(targetDir, 'icon.png'));
  console.log('✓ Created assets/images/icon.png (1024x1024)');

  // 3. Android Adaptive Foreground: android-icon-foreground.png (432x432)
  // Must be strictly within 270x270 safe zone centered on 432x432 transparent canvas
  const fgCanvasSize = 432;
  const fgSafeSize = 270; // 62.5% of 432 (inside Android's 288px circle mask)
  const resizedForFg = await sharp(trimmedBuffer)
    .resize(fgSafeSize, fgSafeSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: fgCanvasSize,
      height: fgCanvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resizedForFg, gravity: 'center' }])
    .png({ compressionLevel: 9, quality: 95 })
    .toFile(path.join(targetDir, 'android-icon-foreground.png'));
  console.log('✓ Created assets/images/android-icon-foreground.png (432x432, safe zone centered)');

  // 4. Android Adaptive Background: android-icon-background.png (432x432)
  const bgSvg = `
    <svg width="432" height="432" viewBox="0 0 432 432">
      <defs>
        <radialGradient id="adaptiveBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="65%" stop-color="#FFF0F6" />
          <stop offset="100%" stop-color="#FFE4EE" />
        </radialGradient>
      </defs>
      <rect width="432" height="432" fill="url(#adaptiveBg)" />
    </svg>
  `;
  await sharp(Buffer.from(bgSvg))
    .png({ compressionLevel: 9 })
    .toFile(path.join(targetDir, 'android-icon-background.png'));
  console.log('✓ Created assets/images/android-icon-background.png (432x432)');

  // 5. Android Themed Monochrome: android-icon-monochrome.png (432x432)
  // Threshold/grayscale version of the foreground for Android 13+
  const monoResized = await sharp(resizedForFg)
    .threshold(128)
    .toBuffer();

  await sharp({
    create: {
      width: fgCanvasSize,
      height: fgCanvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: monoResized, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(targetDir, 'android-icon-monochrome.png'));
  console.log('✓ Created assets/images/android-icon-monochrome.png (432x432)');

  // 6. Splash Icon: splash-icon.png (512x512)
  const splashTargetSize = 420;
  const resizedForSplash = await sharp(trimmedBuffer)
    .resize(splashTargetSize, splashTargetSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resizedForSplash, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(targetDir, 'splash-icon.png'));
  console.log('✓ Created assets/images/splash-icon.png (512x512)');

  // 7. Notification Icon: notification-icon.png (96x96, pure white silhouette with alpha)
  const notifTargetSize = 72;
  // Create solid white mask from trimmed logo
  const notifMask = await sharp(trimmedBuffer)
    .resize(notifTargetSize, notifTargetSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toColourspace('b-w')
    .threshold(50)
    .toBuffer();

  // Colorize mask to pure white with alpha
  const whiteNotif = await sharp(notifMask)
    .negate({ alpha: false })
    .tint({ r: 255, g: 255, b: 255 })
    .toBuffer();

  await sharp({
    create: {
      width: 96,
      height: 96,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: whiteNotif, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(targetDir, 'notification-icon.png'));
  console.log('✓ Created assets/images/notification-icon.png (96x96 white silhouette)');

  // 8. Favicon: favicon.png (48x48)
  const resizedFavicon = await sharp(trimmedBuffer)
    .resize(44, 44, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 48,
      height: 48,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resizedFavicon, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(targetDir, 'favicon.png'));
  console.log('✓ Created assets/images/favicon.png (48x48)');

  console.log('\n[generate-assets] All assets successfully generated from the Barbie logo!');
}

generateAll().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});

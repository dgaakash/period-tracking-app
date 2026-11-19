const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Master Icon SVG (1024x1024)
// Option 1: Princess Tiara & Blooming Lotus Heart
const masterIconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0F5" />
      <stop offset="50%" stop-color="#FFE4EE" />
      <stop offset="100%" stop-color="#FFD1E3" />
    </linearGradient>

    <!-- Barbie Heart Gradient -->
    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF63B0" />
      <stop offset="40%" stop-color="#FF2E93" />
      <stop offset="100%" stop-color="#C2185B" />
    </linearGradient>

    <!-- Lotus Blossom Gradient -->
    <linearGradient id="lotusGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#FFE8F3" />
      <stop offset="100%" stop-color="#D8B4FE" />
    </linearGradient>

    <!-- Golden Crown Gradient -->
    <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="45%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FF8F00" />
    </linearGradient>
  </defs>

  <!-- Full Background with rounded squircle -->
  <rect width="1024" height="1024" rx="230" fill="url(#bgGrad)" />

  <!-- Outer Decorative Ring -->
  <circle cx="512" cy="512" r="436" fill="none" stroke="#FFA4CF" stroke-width="8" stroke-opacity="0.6" />
  <circle cx="512" cy="512" r="416" fill="#FFFFFF" fill-opacity="0.5" stroke="#FF77B9" stroke-width="4" stroke-dasharray="12 12" />

  <!-- Main Barbie Heart Shape -->
  <path d="M 512,820 
           C 352,680 152,504 152,308 
           C 152,176 252,88 380,88 
           C 452,88 492,128 512,160 
           C 532,128 572,88 644,88 
           C 772,88 872,176 872,308 
           C 872,504 672,680 512,820 Z"
        fill="url(#heartGrad)" />

  <!-- Inner Shimmer Accent on Left Lobule -->
  <path d="M 240,260 C 240,190 290,144 360,136 C 320,152 270,200 270,260 C 270,290 280,316 290,340 C 260,316 240,290 240,260 Z"
        fill="#FFFFFF" fill-opacity="0.4" />

  <!-- Blooming Lotus Petals (Feminine Wellness Core) -->
  <g transform="translate(0, 48)">
    <path d="M 512,650 
             C 432,500 432,330 512,220 
             C 592,330 592,500 512,650 Z"
          fill="url(#lotusGrad)" />

    <path d="M 492,630 
             C 376,524 324,384 396,300 
             C 448,360 492,490 492,630 Z"
          fill="#FFFFFF" fill-opacity="0.92" />

    <path d="M 532,630 
             C 648,524 700,384 628,300 
             C 576,360 532,490 532,630 Z"
          fill="#FFFFFF" fill-opacity="0.92" />

    <circle cx="512" cy="450" r="28" fill="#FFFFFF" />
    <circle cx="512" cy="450" r="18" fill="#FF2E93" fill-opacity="0.8" />
  </g>

  <!-- Princess Tiara / Golden Diadem Crest -->
  <g>
    <path d="M 432,92 L 464,148 L 512,44 L 560,148 L 592,92 L 564,176 L 460,176 Z" fill="url(#crownGrad)" />
    <circle cx="432" cy="84" r="12" fill="#FFF59D" />
    <circle cx="512" cy="36" r="18" fill="#FFFFFF" stroke="#FFA000" stroke-width="5" />
    <circle cx="592" cy="84" r="12" fill="#FFF59D" />
  </g>

  <!-- Sparkle Stars -->
  <path d="M 780,140 Q 780,190 830,190 Q 780,190 780,240 Q 780,190 730,190 Q 780,190 780,140 Z" fill="#FFD54F" />
  <circle cx="780" cy="190" r="8" fill="#FFFFFF" />

  <path d="M 210,670 Q 210,704 244,704 Q 210,704 210,738 Q 210,704 176,704 Q 210,704 210,670 Z" fill="#C8A2FF" />
  <path d="M 790,620 Q 790,640 810,640 Q 790,640 790,660 Q 790,640 770,640 Q 790,640 790,620 Z" fill="#FF8FC7" />
</svg>
`;

// 2. Android Adaptive Foreground SVG (432x432)
// Positioned inside the 72dp safe area (288x288px) centered at (216, 216)
const androidForegroundSvg = `
<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fgHeart" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF63B0" />
      <stop offset="40%" stop-color="#FF2E93" />
      <stop offset="100%" stop-color="#C2185B" />
    </linearGradient>

    <linearGradient id="fgLotus" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#FFE8F3" />
      <stop offset="100%" stop-color="#D8B4FE" />
    </linearGradient>

    <linearGradient id="fgCrown" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="45%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FF8F00" />
    </linearGradient>
  </defs>

  <!-- Scaled emblem centered at (216, 216) -->
  <g transform="translate(216, 216) scale(0.28) translate(-512, -512)">
    <!-- Medallion Glow Backing -->
    <circle cx="512" cy="512" r="436" fill="#FFFFFF" fill-opacity="0.9" stroke="#FFA4CF" stroke-width="12" />
    <circle cx="512" cy="512" r="406" fill="none" stroke="#FF77B9" stroke-width="6" stroke-dasharray="14 14" />

    <!-- Main Barbie Heart Shape -->
    <path d="M 512,820 
             C 352,680 152,504 152,308 
             C 152,176 252,88 380,88 
             C 452,88 492,128 512,160 
             C 532,128 572,88 644,88 
             C 772,88 872,176 872,308 
             C 872,504 672,680 512,820 Z"
          fill="url(#fgHeart)" />

    <!-- Blooming Lotus Core -->
    <g transform="translate(0, 48)">
      <path d="M 512,650 
               C 432,500 432,330 512,220 
               C 592,330 592,500 512,650 Z"
            fill="url(#fgLotus)" />

      <path d="M 492,630 
               C 376,524 324,384 396,300 
               C 448,360 492,490 492,630 Z"
            fill="#FFFFFF" fill-opacity="0.92" />

      <path d="M 532,630 
               C 648,524 700,384 628,300 
               C 576,360 532,490 532,630 Z"
            fill="#FFFFFF" fill-opacity="0.92" />

      <circle cx="512" cy="450" r="28" fill="#FFFFFF" />
      <circle cx="512" cy="450" r="18" fill="#FF2E93" fill-opacity="0.8" />
    </g>

    <!-- Princess Tiara -->
    <g>
      <path d="M 432,92 L 464,148 L 512,44 L 560,148 L 592,92 L 564,176 L 460,176 Z" fill="url(#fgCrown)" />
      <circle cx="432" cy="84" r="12" fill="#FFF59D" />
      <circle cx="512" cy="36" r="18" fill="#FFFFFF" stroke="#FFA000" stroke-width="5" />
      <circle cx="592" cy="84" r="12" fill="#FFF59D" />
    </g>

    <!-- Sparkle Stars -->
    <path d="M 780,140 Q 780,190 830,190 Q 780,190 780,240 Q 780,190 730,190 Q 780,190 780,140 Z" fill="#FFD54F" />
    <circle cx="780" cy="190" r="8" fill="#FFFFFF" />
    <path d="M 210,670 Q 210,704 244,704 Q 210,704 210,738 Q 210,704 176,704 Q 210,704 210,670 Z" fill="#C8A2FF" />
  </g>
</svg>
`;

// 3. Android Adaptive Background SVG (432x432)
const androidBackgroundSvg = `
<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgRadial" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF0F5" />
      <stop offset="70%" stop-color="#FFE4EE" />
      <stop offset="100%" stop-color="#FFD1E3" />
    </radialGradient>
  </defs>
  <rect width="432" height="432" fill="url(#bgRadial)" />
</svg>
`;

// 4. Monochrome Icon SVG (432x432) for Android 13+ Themed Icons
const androidMonochromeSvg = `
<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(216, 216) scale(0.28) translate(-512, -512)">
    <circle cx="512" cy="512" r="436" fill="#FFFFFF" />
    <path d="M 512,820 
             C 352,680 152,504 152,308 
             C 152,176 252,88 380,88 
             C 452,88 492,128 512,160 
             C 532,128 572,88 644,88 
             C 772,88 872,176 872,308 
             C 872,504 672,680 512,820 Z"
          fill="#000000" />
    <g transform="translate(0, 48)">
      <path d="M 512,650 
               C 432,500 432,330 512,220 
               C 592,330 592,500 512,650 Z"
            fill="#FFFFFF" />
    </g>
    <g>
      <path d="M 432,92 L 464,148 L 512,44 L 560,148 L 592,92 L 564,176 L 460,176 Z" fill="#000000" />
    </g>
  </g>
</svg>
`;

// 5. Splash Icon SVG (512x512)
const splashIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spHeart" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF63B0" />
      <stop offset="40%" stop-color="#FF2E93" />
      <stop offset="100%" stop-color="#C2185B" />
    </linearGradient>

    <linearGradient id="spLotus" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#FFE8F3" />
      <stop offset="100%" stop-color="#D8B4FE" />
    </linearGradient>

    <linearGradient id="spCrown" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="45%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FF8F00" />
    </linearGradient>
  </defs>

  <g transform="translate(256, 256) scale(0.42) translate(-512, -512)">
    <circle cx="512" cy="512" r="436" fill="#FFFFFF" fill-opacity="0.9" stroke="#FFA4CF" stroke-width="10" />
    <circle cx="512" cy="512" r="406" fill="none" stroke="#FF77B9" stroke-width="5" stroke-dasharray="14 14" />

    <path d="M 512,820 
             C 352,680 152,504 152,308 
             C 152,176 252,88 380,88 
             C 452,88 492,128 512,160 
             C 532,128 572,88 644,88 
             C 772,88 872,176 872,308 
             C 872,504 672,680 512,820 Z"
          fill="url(#spHeart)" />

    <g transform="translate(0, 48)">
      <path d="M 512,650 
               C 432,500 432,330 512,220 
               C 592,330 592,500 512,650 Z"
            fill="url(#spLotus)" />

      <path d="M 492,630 
               C 376,524 324,384 396,300 
               C 448,360 492,490 492,630 Z"
            fill="#FFFFFF" fill-opacity="0.92" />

      <path d="M 532,630 
               C 648,524 700,384 628,300 
               C 576,360 532,490 532,630 Z"
            fill="#FFFFFF" fill-opacity="0.92" />

      <circle cx="512" cy="450" r="28" fill="#FFFFFF" />
      <circle cx="512" cy="450" r="18" fill="#FF2E93" fill-opacity="0.8" />
    </g>

    <g>
      <path d="M 432,92 L 464,148 L 512,44 L 560,148 L 592,92 L 564,176 L 460,176 Z" fill="url(#spCrown)" />
      <circle cx="432" cy="84" r="12" fill="#FFF59D" />
      <circle cx="512" cy="36" r="18" fill="#FFFFFF" stroke="#FFA000" stroke-width="5" />
      <circle cx="592" cy="84" r="12" fill="#FFF59D" />
    </g>
  </g>
</svg>
`;

// 6. Notification Icon (96x96 pure white silhouette with alpha for Android status bar)
const notificationIconSvg = `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(48, 50) scale(0.08) translate(-512, -512)">
    <path d="M 512,820 
             C 352,680 152,504 152,308 
             C 152,176 252,88 380,88 
             C 452,88 492,128 512,160 
             C 532,128 572,88 644,88 
             C 772,88 872,176 872,308 
             C 872,504 672,680 512,820 Z"
          fill="#FFFFFF" />
    <path d="M 432,92 L 464,148 L 512,44 L 560,148 L 592,92 L 564,176 L 460,176 Z" fill="#FFFFFF" />
  </g>
</svg>
`;

// 7. Favicon (48x48)
const faviconSvg = `
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="favHeart" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF63B0" />
      <stop offset="100%" stop-color="#FF2E93" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="10" fill="#FFF0F5" />
  <g transform="translate(24, 25) scale(0.038) translate(-512, -512)">
    <path d="M 512,820 
             C 352,680 152,504 152,308 
             C 152,176 252,88 380,88 
             C 452,88 492,128 512,160 
             C 532,128 572,88 644,88 
             C 772,88 872,176 872,308 
             C 872,504 672,680 512,820 Z"
          fill="url(#favHeart)" />
    <path d="M 432,92 L 464,148 L 512,44 L 560,148 L 592,92 L 564,176 L 460,176 Z" fill="#FFD54F" />
  </g>
</svg>
`;

async function generateAll() {
  console.log('[generate-assets] Generating brand new Barbie Option 1 icons...');

  // 1. icon.png (1024x1024)
  await sharp(Buffer.from(masterIconSvg))
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(path.join(targetDir, 'icon.png'));
  console.log('✓ Created assets/images/icon.png (1024x1024)');

  // 2. android-icon-foreground.png (432x432)
  await sharp(Buffer.from(androidForegroundSvg))
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(path.join(targetDir, 'android-icon-foreground.png'));
  console.log('✓ Created assets/images/android-icon-foreground.png (432x432)');

  // 3. android-icon-background.png (432x432)
  await sharp(Buffer.from(androidBackgroundSvg))
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(path.join(targetDir, 'android-icon-background.png'));
  console.log('✓ Created assets/images/android-icon-background.png (432x432)');

  // 4. android-icon-monochrome.png (432x432)
  await sharp(Buffer.from(androidMonochromeSvg))
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(path.join(targetDir, 'android-icon-monochrome.png'));
  console.log('✓ Created assets/images/android-icon-monochrome.png (432x432)');

  // 5. splash-icon.png (512x512)
  await sharp(Buffer.from(splashIconSvg))
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(path.join(targetDir, 'splash-icon.png'));
  console.log('✓ Created assets/images/splash-icon.png (512x512)');

  // 6. notification-icon.png (96x96)
  await sharp(Buffer.from(notificationIconSvg))
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(path.join(targetDir, 'notification-icon.png'));
  console.log('✓ Created assets/images/notification-icon.png (96x96)');

  // 7. favicon.png (48x48)
  await sharp(Buffer.from(faviconSvg))
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(path.join(targetDir, 'favicon.png'));
  console.log('✓ Created assets/images/favicon.png (48x48)');

  console.log('[generate-assets] All assets successfully created with rich Barbie colors!');
}

generateAll().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});

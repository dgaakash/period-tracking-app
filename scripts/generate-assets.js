const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Master Icon SVG (1024x1024)
const masterIconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <Stop offset="0%" stopColor="#FFF5F8" />
      <Stop offset="50%" stopColor="#FFF0F6" />
      <Stop offset="100%" stopColor="#FFE0ED" />
    </linearGradient>

    <!-- Barbie Heart Gradient -->
    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <Stop offset="0%" stopColor="#FF77B9" />
      <Stop offset="40%" stopColor="#FF4FA3" />
      <Stop offset="100%" stopColor="#D81B60" />
    </linearGradient>

    <!-- Lotus Petal Gradient -->
    <linearGradient id="lotusGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <Stop offset="0%" stopColor="#FFF0F6" />
      <Stop offset="45%" stopColor="#FFD6E7" />
      <Stop offset="100%" stopColor="#C8A2FF" />
    </linearGradient>

    <!-- Golden Crown Gradient -->
    <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <Stop offset="0%" stopColor="#FFF59D" />
      <Stop offset="50%" stopColor="#FFD54F" />
      <Stop offset="100%" stopColor="#FFA000" />
    </linearGradient>

    <!-- Radial Glow -->
    <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
      <Stop offset="0%" stopColor="#FF4FA3" stopOpacity="0.4" />
      <Stop offset="65%" stopColor="#FF8FC7" stopOpacity="0.12" />
      <Stop offset="100%" stopColor="#FFF0F6" stopOpacity="0" />
    </radialGradient>
  </defs>

  <!-- Full Background with subtle round border -->
  <rect width="1024" height="1024" rx="228" fill="url(#bgGrad)" />

  <!-- Outer Ambient Glow -->
  <circle cx="512" cy="512" r="430" fill="url(#haloGlow)" />

  <!-- Medallion Inner Circle -->
  <circle cx="512" cy="512" r="370" fill="#FFFFFF" stroke="#FFE0ED" stroke-width="12" />
  <circle cx="512" cy="512" r="346" fill="none" stroke="#FFF0F6" stroke-width="8" stroke-dasharray="16 16" />

  <!-- Main Barbie Heart Silhouette -->
  <path d="M 512,776 
           C 376,664 216,536 216,380 
           C 216,270 298,198 396,198 
           C 460,198 494,230 512,260 
           C 530,230 564,198 628,198 
           C 726,198 808,270 808,380 
           C 808,536 648,664 512,776 Z"
        fill="url(#heartGrad)" />

  <!-- Blooming Lotus Core -->
  <g transform="translate(0, 42)">
    <!-- Central Lotus Petal -->
    <path d="M 512,624 
             C 456,516 456,390 512,310 
             C 568,390 568,516 512,624 Z"
          fill="url(#lotusGrad)" />

    <!-- Left Wing -->
    <path d="M 494,606 
             C 404,524 368,426 414,364 
             C 458,400 494,490 494,606 Z"
          fill="#FFFFFF" fill-opacity="0.9" />

    <!-- Right Wing -->
    <path d="M 530,606 
             C 620,524 656,426 610,364 
             C 566,400 530,490 530,606 Z"
          fill="#FFFFFF" fill-opacity="0.9" />
  </g>

  <!-- Golden Crown / Sparkle Diadem -->
  <g transform="translate(0, -32)">
    <path d="M 450,190 L 476,226 L 512,154 L 548,226 L 574,190 L 556,244 L 468,244 Z" fill="url(#crownGrad)" />
    <circle cx="450" cy="180" r="12" fill="#FFE082" />
    <circle cx="512" cy="144" r="16" fill="#FFF8E1" />
    <circle cx="574" cy="180" r="12" fill="#FFE082" />
  </g>

  <!-- Sparkle Accents -->
  <!-- Top Right Sparkle -->
  <path d="M 750,240 Q 750,266 776,266 Q 750,266 750,292 Q 750,266 724,266 Q 750,266 750,240 Z" fill="#FF8FC7" />
  <!-- Bottom Left Sparkle -->
  <path d="M 270,640 Q 270,662 292,662 Q 270,662 270,684 Q 270,662 248,662 Q 270,662 270,640 Z" fill="#C8A2FF" />
</svg>
`;

// 2. Android Adaptive Foreground SVG (432x432)
// Placed inside the safe center 288x288 region
const androidForegroundSvg = `
<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fgHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <Stop offset="0%" stopColor="#FF77B9" />
      <Stop offset="40%" stopColor="#FF4FA3" />
      <Stop offset="100%" stopColor="#D81B60" />
    </linearGradient>

    <linearGradient id="fgLotusGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <Stop offset="0%" stopColor="#FFF0F6" />
      <Stop offset="45%" stopColor="#FFD6E7" />
      <Stop offset="100%" stopColor="#C8A2FF" />
    </linearGradient>

    <linearGradient id="fgCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <Stop offset="0%" stopColor="#FFF59D" />
      <Stop offset="50%" stopColor="#FFD54F" />
      <Stop offset="100%" stopColor="#FFA000" />
    </linearGradient>
  </defs>

  <!-- Scaled emblem centered at (216, 216) within 72dp safe area -->
  <g transform="translate(216, 222) scale(0.32) translate(-512, -512)">
    <!-- Medallion Inner Circle -->
    <circle cx="512" cy="512" r="370" fill="#FFFFFF" stroke="#FFE0ED" stroke-width="14" />

    <!-- Main Barbie Heart Silhouette -->
    <path d="M 512,776 
             C 376,664 216,536 216,380 
             C 216,270 298,198 396,198 
             C 460,198 494,230 512,260 
             C 530,230 564,198 628,198 
             C 726,198 808,270 808,380 
             C 808,536 648,664 512,776 Z"
          fill="url(#fgHeartGrad)" />

    <!-- Blooming Lotus Core -->
    <g transform="translate(0, 42)">
      <path d="M 512,624 
               C 456,516 456,390 512,310 
               C 568,390 568,516 512,624 Z"
            fill="url(#fgLotusGrad)" />

      <path d="M 494,606 
               C 404,524 368,426 414,364 
               C 458,400 494,490 494,606 Z"
            fill="#FFFFFF" fill-opacity="0.9" />

      <path d="M 530,606 
               C 620,524 656,426 610,364 
               C 566,400 530,490 530,606 Z"
            fill="#FFFFFF" fill-opacity="0.9" />
    </g>

    <!-- Golden Crown -->
    <g transform="translate(0, -32)">
      <path d="M 450,190 L 476,226 L 512,154 L 548,226 L 574,190 L 556,244 L 468,244 Z" fill="url(#fgCrownGrad)" />
      <circle cx="450" cy="180" r="12" fill="#FFE082" />
      <circle cx="512" cy="144" r="16" fill="#FFF8E1" />
      <circle cx="574" cy="180" r="12" fill="#FFE082" />
    </g>
  </g>
</svg>
`;

// 3. Android Adaptive Background SVG (432x432)
const androidBackgroundSvg = `
<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgRadial" cx="50%" cy="50%" r="50%">
      <Stop offset="0%" stopColor="#FFF5F8" />
      <Stop offset="70%" stopColor="#FFF0F6" />
      <Stop offset="100%" stopColor="#FFDDEB" />
    </radialGradient>
  </defs>
  <rect width="432" height="432" fill="url(#bgRadial)" />
</svg>
`;

// 4. Monochrome Icon SVG (432x432) for Android 13+ Themed Icons
const androidMonochromeSvg = `
<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(216, 222) scale(0.32) translate(-512, -512)">
    <circle cx="512" cy="512" r="370" fill="#FFFFFF" />
    <path d="M 512,776 
             C 376,664 216,536 216,380 
             C 216,270 298,198 396,198 
             C 460,198 494,230 512,260 
             C 530,230 564,198 628,198 
             C 726,198 808,270 808,380 
             C 808,536 648,664 512,776 Z"
          fill="#000000" />
    <g transform="translate(0, 42)">
      <path d="M 512,624 
               C 456,516 456,390 512,310 
               C 568,390 568,516 512,624 Z"
            fill="#FFFFFF" />
    </g>
  </g>
</svg>
`;

// 5. Splash Icon SVG (512x512)
const splashIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <Stop offset="0%" stopColor="#FF77B9" />
      <Stop offset="40%" stopColor="#FF4FA3" />
      <Stop offset="100%" stopColor="#D81B60" />
    </linearGradient>

    <linearGradient id="spLotusGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <Stop offset="0%" stopColor="#FFF0F6" />
      <Stop offset="45%" stopColor="#FFD6E7" />
      <Stop offset="100%" stopColor="#C8A2FF" />
    </linearGradient>

    <linearGradient id="spCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <Stop offset="0%" stopColor="#FFF59D" />
      <Stop offset="50%" stopColor="#FFD54F" />
      <Stop offset="100%" stopColor="#FFA000" />
    </linearGradient>
  </defs>

  <g transform="translate(256, 256) scale(0.44) translate(-512, -512)">
    <circle cx="512" cy="512" r="370" fill="#FFFFFF" stroke="#FFE0ED" stroke-width="12" />

    <path d="M 512,776 
             C 376,664 216,536 216,380 
             C 216,270 298,198 396,198 
             C 460,198 494,230 512,260 
             C 530,230 564,198 628,198 
             C 726,198 808,270 808,380 
             C 808,536 648,664 512,776 Z"
          fill="url(#spHeartGrad)" />

    <g transform="translate(0, 42)">
      <path d="M 512,624 
               C 456,516 456,390 512,310 
               C 568,390 568,516 512,624 Z"
            fill="url(#spLotusGrad)" />

      <path d="M 494,606 
               C 404,524 368,426 414,364 
               C 458,400 494,490 494,606 Z"
            fill="#FFFFFF" fill-opacity="0.9" />

      <path d="M 530,606 
               C 620,524 656,426 610,364 
               C 566,400 530,490 530,606 Z"
            fill="#FFFFFF" fill-opacity="0.9" />
    </g>

    <g transform="translate(0, -32)">
      <path d="M 450,190 L 476,226 L 512,154 L 548,226 L 574,190 L 556,244 L 468,244 Z" fill="url(#spCrownGrad)" />
      <circle cx="450" cy="180" r="12" fill="#FFE082" />
      <circle cx="512" cy="144" r="16" fill="#FFF8E1" />
      <circle cx="574" cy="180" r="12" fill="#FFE082" />
    </g>
  </g>
</svg>
`;

async function renderAssets() {
  console.log('Rendering redesigned Barbie wellness icons...');

  // 1. icon.png (1024x1024)
  await sharp(Buffer.from(masterIconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(targetDir, 'icon.png'));
  console.log('✓ Created assets/images/icon.png (1024x1024)');

  // 2. android-icon-foreground.png (432x432)
  await sharp(Buffer.from(androidForegroundSvg))
    .resize(432, 432)
    .png()
    .toFile(path.join(targetDir, 'android-icon-foreground.png'));
  console.log('✓ Created assets/images/android-icon-foreground.png (432x432)');

  // 3. android-icon-background.png (432x432)
  await sharp(Buffer.from(androidBackgroundSvg))
    .resize(432, 432)
    .png()
    .toFile(path.join(targetDir, 'android-icon-background.png'));
  console.log('✓ Created assets/images/android-icon-background.png (432x432)');

  // 4. android-icon-monochrome.png (432x432)
  await sharp(Buffer.from(androidMonochromeSvg))
    .resize(432, 432)
    .png()
    .toFile(path.join(targetDir, 'android-icon-monochrome.png'));
  console.log('✓ Created assets/images/android-icon-monochrome.png (432x432)');

  // 5. splash-icon.png (512x512)
  await sharp(Buffer.from(splashIconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(targetDir, 'splash-icon.png'));
  console.log('✓ Created assets/images/splash-icon.png (512x512)');

  // 6. notification-icon.png (96x96)
  await sharp(Buffer.from(androidMonochromeSvg))
    .resize(96, 96)
    .png()
    .toFile(path.join(targetDir, 'notification-icon.png'));
  console.log('✓ Created assets/images/notification-icon.png (96x96)');

  // 7. favicon.png (48x48)
  await sharp(Buffer.from(masterIconSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(targetDir, 'favicon.png'));
  console.log('✓ Created assets/images/favicon.png (48x48)');

  console.log('All brand assets successfully generated!');
}

renderAssets().catch((err) => {
  console.error('Failed to generate assets:', err);
  process.exit(1);
});

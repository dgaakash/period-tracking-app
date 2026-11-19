const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Xavier\\.gemini\\antigravity\\brain\\ffae270d-7672-4c2e-9070-8f2196727d2d';
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

// Option 1: Princess Tiara & Blooming Lotus Heart
const option1Svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0F5" />
      <stop offset="50%" stop-color="#FFE4EE" />
      <stop offset="100%" stop-color="#FFD1E3" />
    </linearGradient>
    <linearGradient id="heartGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF63B0" />
      <stop offset="40%" stop-color="#FF2E93" />
      <stop offset="100%" stop-color="#C2185B" />
    </linearGradient>
    <linearGradient id="lotusGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#FFE8F3" />
      <stop offset="100%" stop-color="#D8B4FE" />
    </linearGradient>
    <linearGradient id="crownGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="45%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FF8F00" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="115" fill="url(#bgGrad1)" />

  <circle cx="256" cy="256" r="218" fill="none" stroke="#FFA4CF" stroke-width="3" stroke-opacity="0.6" />
  <circle cx="256" cy="256" r="208" fill="#FFFFFF" fill-opacity="0.5" stroke="#FF77B9" stroke-width="2" stroke-dasharray="6 6" />

  <!-- Main Barbie Heart Shape -->
  <g>
    <path d="M 256,410 
             C 176,340 76,252 76,154 
             C 76,88 126,44 190,44 
             C 226,44 246,64 256,80 
             C 266,64 286,44 322,44 
             C 386,44 436,88 436,154 
             C 436,252 336,340 256,410 Z"
          fill="url(#heartGrad1)" />
  </g>

  <!-- Inner Shimmer Accent on Left Lobule -->
  <path d="M 120,130 C 120,95 145,72 180,68 C 160,76 135,100 135,130 C 135,145 140,158 145,170 C 130,158 120,145 120,130 Z"
        fill="#FFFFFF" fill-opacity="0.4" />

  <!-- Blooming Lotus Petals (Feminine Wellness Core) -->
  <g transform="translate(0, 24)">
    <path d="M 256,325 
             C 216,250 216,165 256,110 
             C 296,165 296,250 256,325 Z"
          fill="url(#lotusGrad1)" />
    
    <path d="M 246,315 
             C 188,262 162,192 198,150 
             C 224,180 246,245 246,315 Z"
          fill="#FFFFFF" fill-opacity="0.92" />
    
    <path d="M 266,315 
             C 324,262 350,192 314,150 
             C 288,180 266,245 266,315 Z"
          fill="#FFFFFF" fill-opacity="0.92" />
          
    <circle cx="256" cy="225" r="14" fill="#FFFFFF" />
    <circle cx="256" cy="225" r="9" fill="#FF2E93" fill-opacity="0.75" />
  </g>

  <!-- Princess Tiara / Golden Diadem Crest -->
  <g>
    <path d="M 216,46 L 232,74 L 256,22 L 280,74 L 296,46 L 282,88 L 230,88 Z" fill="url(#crownGrad1)" />
    <circle cx="216" cy="42" r="6" fill="#FFF59D" />
    <circle cx="256" cy="18" r="9" fill="#FFFFFF" stroke="#FFA000" stroke-width="2.5" />
    <circle cx="296" cy="42" r="6" fill="#FFF59D" />
  </g>

  <!-- Sparkle Stars -->
  <path d="M 390,70 Q 390,95 415,95 Q 390,95 390,120 Q 390,95 365,95 Q 390,95 390,70 Z" fill="#FFD54F" />
  <circle cx="390" cy="95" r="4" fill="#FFFFFF" />

  <path d="M 105,335 Q 105,352 122,352 Q 105,352 105,369 Q 105,352 88,352 Q 105,352 105,335 Z" fill="#C8A2FF" />
  <path d="M 395,310 Q 395,320 405,320 Q 395,320 395,330 Q 395,320 385,320 Q 395,320 395,310 Z" fill="#FF8FC7" />
</svg>`;

// Option 2: Butterfly Love Wings & Wellness Pearl
const option2Svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2F7" />
      <stop offset="50%" stop-color="#FFE0EC" />
      <stop offset="100%" stop-color="#FFC5DC" />
    </linearGradient>
    <linearGradient id="wingGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5DA2" />
      <stop offset="45%" stop-color="#FF2E93" />
      <stop offset="100%" stop-color="#8E24AA" />
    </linearGradient>
    <linearGradient id="innerWing2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="50%" stop-color="#FFD6E7" />
      <stop offset="100%" stop-color="#E1BEE7" />
    </linearGradient>
    <linearGradient id="goldAcc2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="50%" stop-color="#FFD54F" />
      <stop offset="100%" stop-color="#FFA000" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="115" fill="url(#bgGrad2)" />

  <circle cx="256" cy="256" r="218" fill="none" stroke="#FFA4CF" stroke-width="3" stroke-opacity="0.6" />
  <circle cx="256" cy="256" r="208" fill="#FFFFFF" fill-opacity="0.5" stroke="#FF77B9" stroke-width="2" stroke-dasharray="6 6" />

  <g>
    <!-- Butterfly Wings Formed into a Heart Silhouette -->
    <path d="M 256,220 C 230,130 160,80 100,110 C 60,130 60,190 90,240 C 130,300 220,340 256,395 C 292,340 382,300 422,240 C 452,190 452,130 412,110 C 352,80 282,130 256,220 Z" fill="url(#wingGrad2)" />
  </g>

  <!-- Inner Shimmer Wing Patterns -->
  <path d="M 245,215 C 210,140 165,115 125,135 C 100,150 100,185 120,220 C 150,265 210,295 240,335 Z" fill="url(#innerWing2)" fill-opacity="0.9" />
  <path d="M 267,215 C 302,140 347,115 387,135 C 412,150 412,185 392,220 C 362,265 302,295 272,335 Z" fill="url(#innerWing2)" fill-opacity="0.9" />

  <!-- Center Teardrop & Butterfly Body -->
  <path d="M 256,160 C 248,160 242,185 242,230 C 242,280 256,335 256,335 C 256,335 270,280 270,230 C 270,185 264,160 256,160 Z" fill="url(#goldAcc2)" />
  <circle cx="256" cy="148" r="14" fill="url(#goldAcc2)" />

  <!-- Antennae -->
  <path d="M 252,140 C 240,110 215,98 192,104" stroke="#FFD54F" stroke-width="4.5" stroke-linecap="round" fill="none" />
  <circle cx="192" cy="104" r="6.5" fill="#FFF59D" />
  
  <path d="M 260,140 C 272,110 297,98 320,104" stroke="#FFD54F" stroke-width="4.5" stroke-linecap="round" fill="none" />
  <circle cx="320" cy="104" r="6.5" fill="#FFF59D" />

  <!-- Sparkles -->
  <path d="M 390,70 Q 390,90 410,90 Q 390,90 390,110 Q 390,90 370,90 Q 390,90 390,70 Z" fill="#FFD54F" />
  <path d="M 105,335 Q 105,350 120,350 Q 105,350 105,365 Q 105,350 90,350 Q 105,350 105,335 Z" fill="#FF8FC7" />
</svg>`;

// Option 3: Luna Cycle & Radiant Barbie Heart
const option3Svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0F7" />
      <stop offset="50%" stop-color="#FCE4EC" />
      <stop offset="100%" stop-color="#E8EAF6" />
    </linearGradient>
    <linearGradient id="heartGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5DA2" />
      <stop offset="50%" stop-color="#FF2E93" />
      <stop offset="100%" stop-color="#C2185B" />
    </linearGradient>
    <linearGradient id="moonGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9C4" />
      <stop offset="40%" stop-color="#FFE082" />
      <stop offset="100%" stop-color="#FFB300" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="115" fill="url(#bgGrad3)" />

  <circle cx="256" cy="256" r="218" fill="none" stroke="#FFA4CF" stroke-width="3" stroke-opacity="0.6" />
  <circle cx="256" cy="256" r="208" fill="#FFFFFF" fill-opacity="0.5" stroke="#FF77B9" stroke-width="2" stroke-dasharray="6 6" />

  <!-- Elegant Golden Crescent Moon Cradling the Heart -->
  <path d="M 285,65 C 385,105 415,220 370,315 C 325,410 215,445 120,400 C 230,420 330,355 340,240 C 350,140 295,85 285,65 Z" fill="url(#moonGrad3)" />

  <!-- Center Barbie Heart -->
  <g>
    <path d="M 235,380 
             C 165,315 80,240 80,160 
             C 80,105 125,68 180,68 
             C 212,68 228,85 235,100 
             C 242,85 258,68 290,68 
             C 345,68 390,105 390,160 
             C 390,240 305,315 235,380 Z"
          fill="url(#heartGrad3)" />
  </g>

  <!-- Glowing North Star Symbol in the Heart Center -->
  <path d="M 235,125 Q 235,175 285,175 Q 235,175 235,225 Q 235,175 185,175 Q 235,175 235,125 Z" fill="#FFFFFF" />
  <path d="M 235,145 Q 235,175 265,175 Q 235,175 235,205 Q 235,175 205,175 Q 235,175 235,145 Z" fill="#FFF9C4" />
  <circle cx="235" cy="175" r="7" fill="#FF2E93" />

  <!-- Sparkles -->
  <path d="M 115,75 Q 115,90 130,90 Q 115,90 115,105 Q 115,90 100,90 Q 115,90 115,75 Z" fill="#FFD54F" />
  <path d="M 390,65 Q 390,83 408,83 Q 390,83 390,101 Q 390,83 372,83 Q 390,83 390,65 Z" fill="#FF8FC7" />
  <path d="M 105,335 Q 105,348 118,348 Q 105,348 105,361 Q 105,348 92,348 Q 105,348 105,335 Z" fill="#C8A2FF" />
</svg>`;

async function run() {
  const p1 = path.join(artifactDir, 'logo-option-1.png');
  const p2 = path.join(artifactDir, 'logo-option-2.png');
  const p3 = path.join(artifactDir, 'logo-option-3.png');

  await sharp(Buffer.from(option1Svg)).png().toFile(p1);
  await sharp(Buffer.from(option2Svg)).png().toFile(p2);
  await sharp(Buffer.from(option3Svg)).png().toFile(p3);

  console.log('✓ Successfully generated 3 logo options at:', artifactDir);

  // Check colors
  for (const [name, p] of [['Option 1', p1], ['Option 2', p2], ['Option 3', p3]]) {
    const { data } = await sharp(p).raw().toBuffer({ resolveWithObject: true });
    const centerIdx = (256 * 512 + 256) * 4;
    console.log(`${name} Center RGBA:`, data[centerIdx], data[centerIdx+1], data[centerIdx+2], data[centerIdx+3]);
  }
}

run().catch(console.error);

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const appGradlePath = path.join(androidDir, 'app', 'build.gradle');
const gradlePropsPath = path.join(androidDir, 'gradle.properties');
const proguardRulesPath = path.join(androidDir, 'app', 'proguard-rules.pro');

if (!fs.existsSync(androidDir)) {
  console.log('[optimize-android-build] android/ directory not found, skipping.');
  process.exit(0);
}

console.log('[optimize-android-build] Optimizing Android Gradle configuration for small APK size & fast build...');

// 1. Optimize gradle.properties
if (fs.existsSync(gradlePropsPath)) {
  let props = fs.readFileSync(gradlePropsPath, 'utf8');

  const optimizations = [
    'org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+UseG1GC',
    'org.gradle.parallel=true',
    'org.gradle.caching=true',
    'android.enableR8.fullMode=true',
  ];

  for (const opt of optimizations) {
    const key = opt.split('=')[0];
    if (props.includes(key)) {
      props = props.replace(new RegExp(`^${key}=.*$`, 'm'), opt);
    } else {
      props += `\n${opt}`;
    }
  }

  fs.writeFileSync(gradlePropsPath, props);
  console.log('✓ Updated android/gradle.properties with high-performance daemon & R8 full mode');
}

// 2. Optimize android/app/build.gradle
if (fs.existsSync(appGradlePath)) {
  let gradle = fs.readFileSync(appGradlePath, 'utf8');

  // Enable Proguard
  gradle = gradle.replace(
    /def enableProguardInReleaseBuilds = false/g,
    'def enableProguardInReleaseBuilds = true'
  );

  // Enable ABI splits for smaller per-device APKs and generate universal APK
  gradle = gradle.replace(
    /def enableSeparateBuildPerCPUArchitecture = false/g,
    'def enableSeparateBuildPerCPUArchitecture = true'
  );
  gradle = gradle.replace(
    /universalApk false/g,
    'universalApk true'
  );

  // Ensure release build type uses signingConfigs.debug if release signing is missing, and enables shrinkResources
  if (gradle.includes('buildTypes {') && gradle.includes('release {')) {
    // Inject signingConfig signingConfigs.debug and shrinkResources into release block
    gradle = gradle.replace(
      /(release\s*\{[^}]*?)(\n\s*\})/,
      (match, body, end) => {
        let updated = body;
        if (!updated.includes('signingConfig')) {
          updated += '\n            signingConfig signingConfigs.debug';
        }
        if (!updated.includes('shrinkResources')) {
          updated += '\n            shrinkResources true';
        }
        return updated + end;
      }
    );
  }

  fs.writeFileSync(appGradlePath, gradle);
  console.log('✓ Configured android/app/build.gradle: ProGuard enabled, resource shrinking enabled, ABI splits enabled, fallback debug signing set');
}

// 3. ProGuard rules for Reanimated & SQLite
if (fs.existsSync(proguardRulesPath)) {
  let rules = fs.readFileSync(proguardRulesPath, 'utf8');
  const customRules = `
# Keep Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keepclassmembers class com.swmansion.reanimated.** { *; }

# Keep SQLite
-keep class io.requery.android.database.** { *; }
-keep class expo.modules.sqlite.** { *; }

# Keep Lucide & SVG
-keep class com.horcrux.svg.** { *; }
`;

  if (!rules.includes('com.swmansion.reanimated')) {
    rules += `\n${customRules}\n`;
    fs.writeFileSync(proguardRulesPath, rules);
    console.log('✓ Added ProGuard rules for Reanimated and SQLite');
  }
}

console.log('[optimize-android-build] Done! Ready for assembleRelease.');

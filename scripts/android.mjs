import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// ponytail: use the platform SDK defaults when the IDE terminal has no Android environment.
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || join(homedir(), process.platform === 'darwin' ? 'Library/Android/sdk' : 'Android/Sdk');
const emulatorDir = join(sdk, 'emulator');
const adbDir = join(sdk, 'platform-tools');
if (!existsSync(join(emulatorDir, process.platform === 'win32' ? 'emulator.exe' : 'emulator'))) {
  console.error(`Không tìm thấy Android Emulator tại ${sdk}. Cài SDK trong Android Studio hoặc đặt ANDROID_HOME.`);
  process.exit(1);
}
const env = { ...process.env, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk, PATH: [emulatorDir, adbDir, process.env.PATH].join(process.platform === 'win32' ? ';' : ':') };
if (!env.JAVA_HOME && process.platform === 'darwin') {
  const java = spawnSync('/usr/libexec/java_home', ['-v', '21'], { encoding: 'utf8' });
  if (java.status === 0) env.JAVA_HOME = java.stdout.trim();
}
if (process.argv.includes('--check')) {
  console.log(`Android SDK: ${sdk}\nJAVA_HOME: ${env.JAVA_HOME || 'system default'}`);
  for (const [command, args] of [['emulator', ['-list-avds']], ['adb', ['devices']]]) {
    const result = spawnSync(command, args, { env, stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
  }
} else {
  const result = spawnSync(process.execPath, ['node_modules/expo/bin/cli', 'run:android', ...process.argv.slice(2)], { env, stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  process.exit(result.status || (result.error ? 1 : 0));
}

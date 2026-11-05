const fs = require('fs');
const path = require('path');

// Generate 44.1kHz, 16-bit Stereo PCM WAV for Korean Temple Bell (범종 / 에밀레종)
const SAMPLE_RATE = 44100;
const DURATION_SEC = 9.8; // 9.8 seconds solemn Korean temple bell resonance
const TOTAL_SAMPLES = Math.floor(SAMPLE_RATE * DURATION_SEC);

const leftChannel = new Float32Array(TOTAL_SAMPLES);
const rightChannel = new Float32Array(TOTAL_SAMPLES);

// 1. 당목(나무 방망이) 타격 충격음 (Thump Transient + Wood Contact)
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  if (t > 0.35) break;

  // 저음 펀치: 당목이 청동 당좌에 부딪히는 묵직한 충격
  const thumpEnv = Math.exp(-t * 26.0);
  const thumpFreq = 72 + 150 * Math.exp(-t * 40.0);
  const thump = Math.sin(2 * Math.PI * thumpFreq * t) * thumpEnv * 0.52;

  // 당목 나무 결 마찰 소음
  const noiseEnv = Math.exp(-t * 55.0);
  const noise = (Math.random() * 2 - 1) * noiseEnv * 0.22;

  // 청동 순간 충격음 (금속성 어택 클릭)
  const metalEnv = Math.exp(-t * 70.0);
  const metalContact = Math.sin(2 * Math.PI * 920 * t) * metalEnv * 0.25;

  const strikeTotal = thump + noise + metalContact;
  leftChannel[i] += strikeTotal * 0.95;
  rightChannel[i] += strikeTotal * 0.95;
}

// 2. 한국 범종의 음향학적 배음 스펙트럼 (에밀레종 실측 맥놀이 주파수)
// f1a: 118.0 Hz, f1b: 119.35 Hz -> 1.35 Hz 맥놀이 (약 0.74초 주기로 웅~ 웅~ 웅~ 파동)
const modes = [
  // [freq, amplitude, decayTau, panOffset, phase]
  // 서브 우퍼 대역 (명동 울림통 공명)
  { freq: 59.0, amp: 0.22, tau: 5.2, pan: 0.0, phase: 0 },

  // 기음 쌍 (한국 범종의 장엄한 맥놀이)
  { freq: 118.0, amp: 0.44, tau: 7.2, pan: -0.06, phase: 0 },
  { freq: 119.35, amp: 0.42, tau: 7.2, pan: 0.06, phase: 0.2 },

  // 2차 배음 쌍
  { freq: 236.2, amp: 0.30, tau: 5.8, pan: -0.12, phase: 0.4 },
  { freq: 238.1, amp: 0.28, tau: 5.8, pan: 0.12, phase: 0.8 },

  // 3차 배음 쌍
  { freq: 354.5, amp: 0.22, tau: 4.5, pan: -0.18, phase: 1.1 },
  { freq: 357.2, amp: 0.19, tau: 4.5, pan: 0.18, phase: 1.4 },

  // 청동 고유의 맑고 장엄한 상음(Harmonics)
  { freq: 512.0, amp: 0.16, tau: 3.6, pan: -0.22, phase: 0.5 },
  { freq: 674.0, amp: 0.12, tau: 3.0, pan: 0.22, phase: 0.7 },
  { freq: 885.0, amp: 0.09, tau: 2.4, pan: -0.28, phase: 1.2 },
  { freq: 1120.0, amp: 0.065, tau: 1.9, pan: 0.28, phase: 0.3 },
  { freq: 1450.0, amp: 0.045, tau: 1.4, pan: -0.32, phase: 0.9 },
  { freq: 1980.0, amp: 0.028, tau: 1.0, pan: 0.32, phase: 1.7 },
  { freq: 2650.0, amp: 0.016, tau: 0.7, pan: 0.0, phase: 2.1 }
];

for (const mode of modes) {
  const twoPiFreq = 2 * Math.PI * mode.freq;
  const decayRate = 1 / mode.tau;
  const leftGain = mode.amp * (1 - mode.pan);
  const rightGain = mode.amp * (1 + mode.pan);

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // 부드럽고 자연스러운 타격 진입 (10ms 어택)
    const attack = Math.min(1.0, t / 0.01);
    // 지수적 감쇄
    let env = attack * Math.exp(-t * decayRate);

    // 후반부 자연스러운 페이드아웃 (끝부분 클릭 방지)
    if (t > DURATION_SEC - 0.8) {
      const fadeProgress = (t - (DURATION_SEC - 0.8)) / 0.8;
      env *= Math.cos(fadeProgress * Math.PI * 0.5);
    }

    // 미세한 공명 숨결
    const swell = 1.0 + 0.06 * Math.sin(2 * Math.PI * 0.6 * t);
    const sample = Math.sin(twoPiFreq * t + mode.phase) * env * swell;

    leftChannel[i] += sample * leftGain;
    rightChannel[i] += sample * rightGain;
  }
}

// 3. 범종각 석조 공간 음향 잔향 (Reverberation)
const reverbDelays = [
  { delaySamples: Math.floor(0.027 * SAMPLE_RATE), feedback: 0.44 },
  { delaySamples: Math.floor(0.035 * SAMPLE_RATE), feedback: 0.40 },
  { delaySamples: Math.floor(0.041 * SAMPLE_RATE), feedback: 0.36 },
  { delaySamples: Math.floor(0.052 * SAMPLE_RATE), feedback: 0.31 },
];

function applyReverb(channel) {
  const out = new Float32Array(channel.length);
  out.set(channel);

  for (const { delaySamples, feedback } of reverbDelays) {
    const buffer = new Float32Array(delaySamples);
    let bufIdx = 0;
    for (let i = 0; i < channel.length; i++) {
      const delayed = buffer[bufIdx];
      const input = channel[i] + delayed * feedback;
      buffer[bufIdx] = input;
      bufIdx = (bufIdx + 1) % delaySamples;
      out[i] += delayed * 0.24;
    }
  }
  return out;
}

const revLeft = applyReverb(leftChannel);
const revRight = applyReverb(rightChannel);

// 4. 피크 정규화 (-0.3dB)
let maxPeak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const l = Math.abs(revLeft[i]);
  const r = Math.abs(revRight[i]);
  if (l > maxPeak) maxPeak = l;
  if (r > maxPeak) maxPeak = r;
}

const targetPeak = 0.95;
const normGain = maxPeak > 0 ? targetPeak / maxPeak : 1.0;

// 5. 16-bit Stereo PCM WAV 생성
const numChannels = 2;
const bytesPerSample = 2;
const blockAlign = numChannels * bytesPerSample;
const byteRate = SAMPLE_RATE * blockAlign;
const dataSize = TOTAL_SAMPLES * blockAlign;
const buffer = Buffer.alloc(44 + dataSize);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);

// fmt chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(16, 34); // 16-bit

// data chunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

let offset = 44;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  // Left
  let sL = Math.max(-1.0, Math.min(1.0, revLeft[i] * normGain));
  let valL = sL < 0 ? sL * 32768 : sL * 32767;
  buffer.writeInt16LE(Math.floor(valL), offset);
  offset += 2;

  // Right
  let sR = Math.max(-1.0, Math.min(1.0, revRight[i] * normGain));
  let valR = sR < 0 ? sR * 32768 : sR * 32767;
  buffer.writeInt16LE(Math.floor(valR), offset);
  offset += 2;
}

const outPath = path.join(__dirname, '..', 'public', 'audio', 'beomjong.wav');
fs.writeFileSync(outPath, buffer);
console.log(`Generated high-fidelity Korean Beomjong sound: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);

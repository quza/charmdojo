/**
 * Sound Effects for Combo System
 * Uses Web Audio API to generate sounds programmatically
 */

let audioContext: AudioContext | null = null;

/**
 * Get or create audio context
 * Lazy initialization to avoid issues with autoplay policies
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a combo increase sound
 * Higher combo levels have higher pitch and volume
 * 
 * @param comboLevel - Current combo level (0-5)
 */
export function playComboIncreaseSound(comboLevel: number) {
  try {
    const ctx = getAudioContext();
    
    // Create oscillator for the sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Configure sound based on combo level
    const baseFrequency = 440; // A4
    const frequencyMultiplier = 1 + (comboLevel * 0.15); // Increase pitch with combo
    oscillator.frequency.value = baseFrequency * frequencyMultiplier;
    
    // Use a pleasant sine wave
    oscillator.type = 'sine';
    
    // Volume increases slightly with combo level
    const baseVolume = 0.15;
    const volumeBoost = comboLevel * 0.03;
    const targetVolume = Math.min(baseVolume + volumeBoost, 0.3);
    
    // Envelope: quick attack, short sustain, quick release
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.01); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15); // Decay/release
    
    // Play sound
    oscillator.start(now);
    oscillator.stop(now + 0.15);
    
    // Add a second harmonic for higher combos (x4, x5)
    if (comboLevel >= 4) {
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      
      harmonic.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);
      
      harmonic.frequency.value = baseFrequency * frequencyMultiplier * 2; // Octave up
      harmonic.type = 'sine';
      
      harmonicGain.gain.setValueAtTime(0, now);
      harmonicGain.gain.linearRampToValueAtTime(targetVolume * 0.5, now + 0.01);
      harmonicGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      harmonic.start(now);
      harmonic.stop(now + 0.15);
    }
  } catch (error) {
    // Silently fail if Web Audio API is not available or errors occur
    console.debug('Could not play combo increase sound:', error);
  }
}

/**
 * Play a combo break sound
 * Descending "whoosh" to indicate combo loss
 */
export function playComboBreakSound() {
  try {
    const ctx = getAudioContext();
    
    // Create oscillator for the sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Descending frequency (from high to low)
    const now = ctx.currentTime;
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    
    // Use triangle wave for a softer sound
    oscillator.type = 'triangle';
    
    // Envelope: quick attack, fade out
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    // Play sound
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  } catch (error) {
    // Silently fail if Web Audio API is not available or errors occur
    console.debug('Could not play combo break sound:', error);
  }
}

/**
 * Preload audio context on user interaction
 * Call this on first user click/tap to ensure audio works
 */
export function initAudioContext() {
  try {
    getAudioContext();
  } catch (error) {
    console.debug('Could not initialize audio context:', error);
  }
}


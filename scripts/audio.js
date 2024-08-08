const notes = [
    261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25
];

let audioContext, oscillator, gainNode;

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
}

function playNote() {
    if (oscillator) {
        oscillator.stop();
    }
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(notes[Math.floor(Math.random() * notes.length)], audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}
let mic, fft, audioContext, audioSource,bufferSource;
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// Load the default music file on page load for testing
const defaultMusicFilePath = 'music.mp3'; // Adjust the path accordingly



$(document).ready(function () {

    $('#startAudioContextButton').on('click', function () {
        // Check if the AudioContext is already running
        if (audioContext && audioContext.state === 'running') {
            console.log('AudioContext is already running.');
            return;
        }

        // Create and store the audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Call the setup function after the audio context is created
        setup();
    });
    // Create and store the audio context
   // audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Initialize other components or call loadMusicFile here if needed
   
});


function setup() {
    createCanvas(600, 300).parent('pitchGraphContainer');
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT();
    fft.setInput(mic);

    // File input change event
    $('#fileInput').on('change', handleFileSelect);
}




// Function to load a music file
function loadMusicFile(filePath) {
    // Check if audioContext and audioContext.createBufferSource are defined
    if (!audioContext || !audioContext.createBufferSource) {
        console.error('AudioContext or createBufferSource is undefined.');
        return;
    }

    // Check if the AudioContext is suspended and resume it if needed
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('AudioContext has been resumed.');
            createBufferSource(filePath);
        });
    } else {
        createBufferSource(filePath);
    }
}


function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const filePath = URL.createObjectURL(file);
        loadMusicFile(filePath);
    }
}


function draw() {
    background(255);

    // Draw pitch graph
    let spectrum = fft.analyze();
    noFill();
    beginShape();
    for (let i = 0; i < spectrum.length; i++) {
        const frequency = map(i, 0, spectrum.length, 20, 20000);
        const note = frequencyToNote(frequency);
        const y = map(spectrum[i], 0, 255, height, 0);
        text(note, i * 10, y + 20); // Adjust the vertical position
        vertex(i, y);
    }
    endShape();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (audioSource) {
            audioSource.disconnect();
        }

       
        audioSource = audioContext.createBufferSource();

        const reader = new FileReader();
        reader.onload = function (e) {
            const arrayBuffer = e.target.result;
            audioContext.decodeAudioData(arrayBuffer, function (buffer) {
                audioSource.buffer = buffer;
                audioSource.connect(fft.input);
                audioSource.start();
            });
        };

        reader.readAsArrayBuffer(file);
    }
}
function createBufferSource(filePath) {
    if (!audioContext) {
        console.error('AudioContext is undefined.');
        return;
    }

    if (audioSource) {
        audioSource.disconnect();
    }

    audioSource = audioContext.createBufferSource();

    // Load the sound file
    loadSound(filePath, function (buffer) {
        if (!buffer) {
            console.error('Failed to load sound file.');
            return;
        }

        // Set the buffer and connect to the input
        audioSource.buffer = buffer;
        audioSource.connect(fft.input);

        // Handle the 'ended' event to reset the audioSource
        audioSource.onended = function () {
            console.log('Audio playback ended.');
            audioSource.disconnect();
        };

        // Start the audio playback
        audioSource.start();
    });
}

// Function to convert frequency to musical note
function frequencyToNote(frequency) {
    const hertzPerOctave = 261.63 * Math.pow(2, 1 / 12); // Hertz value for C4
    const halfSteps = Math.round(Math.log(frequency / 261.63) / Math.log(2) * 12);
    const octave = Math.floor(halfSteps / 12) + 4; // Starting from C4
    const noteIndex = (halfSteps % 12 + 12) % 12; // Wrap to positive values
    const noteName = noteNames[noteIndex];
    return `${noteName}${octave}`;
}

function loadMusicFile(filePath) {
    if (audioSource) {
        audioSource.disconnect();
    }

    audioSource = audioContext.createBufferSource();

    loadSound(filePath, function (buffer) {
        audioSource.buffer = buffer;
        audioSource.connect(fft.input);
        audioSource.start();
    });
}

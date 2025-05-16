const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const pads = document.querySelectorAll('.pad');

const bufferMap = new Map();
const activeSources = []; // array di tutte le sorgenti audio attive

// Precarica tutti i suoni
pads.forEach(async pad => {
    const soundPath = pad.dataset.sound;
    try {
        const response = await fetch(soundPath);
        if (!response.ok) throw new Error(`Errore nel caricamento di ${soundPath}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        bufferMap.set(soundPath, audioBuffer);

        // Imposta colore originale
        const button = pad.querySelector('.button');
        const color = getComputedStyle(pad).getPropertyValue('--color');
        button.dataset.originalColor = color;
        button.style.backgroundColor = color;
    } catch (error) {
        console.error('Errore nel precaricare i suoni:', error);
    }
});

pads.forEach(pad => {
    const button = pad.querySelector('.button');
    const soundPath = pad.dataset.sound;

    button.addEventListener('click', () => {
        // Stoppa tutti i suoni in riproduzione
        activeSources.forEach(({ source, button }) => {
            source.stop();
            if (button) {
                button.style.backgroundColor = button.dataset.originalColor;
            }
        });
        activeSources.length = 0;

        const buffer = bufferMap.get(soundPath);
        if (!buffer) return;

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();

        button.style.backgroundColor = 'red';

        // Quando termina, ripristina il colore
        source.onended = () => {
            button.style.backgroundColor = button.dataset.originalColor;
        };

        // Memorizza il suono attivo
        activeSources.push({ source, button });
    });
});

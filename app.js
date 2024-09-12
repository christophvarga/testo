const colorButton = document.getElementById('colorButton');
const photoButton = document.getElementById('photoButton');
const switchCameraButton = document.getElementById('switchCameraButton');
const meditationButton = document.getElementById('meditationButton');
const meditationDurationSelect = document.getElementById('meditationDuration');
const meditationTimerDisplay = document.getElementById('meditationTimer');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photoGallery = document.getElementById('photoGallery');
const meditationSound = document.getElementById('meditationSound');

const themes = [
    { background: '#003300', text: '#00ff00' },
    { background: '#000033', text: '#00ffff' },
    { background: '#330033', text: '#ff00ff' },
    { background: '#333300', text: '#ffff00' },
    { background: '#330000', text: '#ff0000' },
    { background: '#000000', text: '#ffffff' }
];
let currentThemeIndex = 0;
let photos = [];
let facingMode = "environment";
let currentStream;
let meditationTimer;

console.log("Meditation sound element:", meditationSound);

function playSound() {
    console.log("Attempting to play sound");
    meditationSound.play().then(() => {
        console.log("Sound played successfully");
    }).catch(error => {
        console.error("Error playing sound:", error);
    });
}

// Set initial theme
setTheme(currentThemeIndex);

function setTheme(index) {
    document.documentElement.style.setProperty('--background-color', themes[index].background);
    document.documentElement.style.setProperty('--text-color', themes[index].text);
    document.documentElement.style.setProperty('--button-text', themes[index].text);
}

colorButton.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    setTheme(currentThemeIndex);
});

function startCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    
    const constraints = {
        video: { facingMode: { exact: facingMode } }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
            video.play();
        })
        .catch(err => {
            console.error("Fehler beim Zugriff auf die Kamera:", err);
            return navigator.mediaDevices.getUserMedia({ video: true });
        })
        .then(stream => {
            if (stream) {
                currentStream = stream;
                video.srcObject = stream;
                video.play();
            }
        })
        .catch(err => {
            console.error("Fehler beim Zugriff auf die Fallback-Kamera:", err);
        });
}

switchCameraButton.addEventListener('click', () => {
    facingMode = facingMode === "user" ? "environment" : "user";
    startCamera();
});

photoButton.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const photoDataUrl = canvas.toDataURL('image/jpeg');
    const timestamp = new Date().toISOString();
    photos.unshift({ dataUrl: photoDataUrl, timestamp: timestamp });
    
    if (photos.length > 5) {
        photos.pop();
    }
    
    updatePhotoGallery();
    savePhotosToLocalStorage();
});

function updatePhotoGallery() {
    photoGallery.innerHTML = '';
    photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.dataUrl;
        img.title = photo.timestamp;
        photoGallery.appendChild(img);
    });
}

function savePhotosToLocalStorage() {
    localStorage.setItem('photos', JSON.stringify(photos));
}

meditationButton.addEventListener('click', () => {
    if (meditationTimer) {
        clearInterval(meditationTimer);
        meditationTimer = null;
        meditationTimerDisplay.classList.add('hidden');
        meditationButton.textContent = "Meditate";
        meditationSound.pause();
        meditationSound.currentTime = 0;
        console.log("Meditation stopped");
        return;
    }

    const duration = parseInt(meditationDurationSelect.value, 10);
    let timeLeft = duration * 60 + 5; // 5 Sekunden Vorlauf

    // Spiele den Ton am Anfang
    playSound();

    meditationTimerDisplay.classList.remove('hidden');

    meditationTimer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        meditationTimerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft === duration * 60) {
            // Spiele den Ton nach dem Vorlauf erneut
            playSound();
        }

        if (timeLeft <= 0) {
            clearInterval(meditationTimer);
            meditationTimer = null;
            meditationTimerDisplay.classList.add('hidden');
            meditationButton.textContent = "Meditate";
            // Spiele den Ton am Ende
            playSound();
        }
    }, 1000);

    meditationButton.textContent = "Stop";
    console.log("Meditation started");
});

function requestPermissions() {
    return navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
            stream.getTracks().forEach(track => track.stop());
            console.log("Permissions granted");
        })
        .catch(error => {
            console.error("Error requesting permissions:", error);
        });
}

window.addEventListener('load', () => {
    const savedPhotos = localStorage.getItem('photos');
    if (savedPhotos) {
        photos = JSON.parse(savedPhotos);
        updatePhotoGallery();
    }
    
    requestPermissions().then(() => {
        startCamera();
        
        // Test sound playback
        console.log("Testing sound playback");
        playSound();
    });
});

navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Verfügbare Kameras:', videoDevices);
    })
    .catch(err => {
        console.error('Fehler beim Auflisten der Geräte:', err);
    });
const colorButton = document.getElementById('colorButton');
const photoButton = document.getElementById('photoButton');
const switchCameraButton = document.getElementById('switchCameraButton');
const meditationButton = document.getElementById('meditationButton');
const meditationDurationSlider = document.getElementById('meditationDuration');
const durationOutput = document.getElementById('durationOutput');
const meditationTimerDisplay = document.getElementById('meditationTimer');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photoGallery = document.getElementById('photoGallery');
const beepSound = document.getElementById('beepSound');

const colors = ['#4a90e2', '#50c878', '#f39c12', '#e74c3c', '#9b59b6', '#34495e'];
let currentColorIndex = 0;
let photos = [];
let facingMode = "environment";
let currentStream;
let meditationTimer;

colorButton.addEventListener('click', () => {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    document.documentElement.style.setProperty('--primary-color', colors[currentColorIndex]);
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

meditationDurationSlider.addEventListener('input', () => {
    durationOutput.textContent = `${meditationDurationSlider.value} min`;
});

meditationButton.addEventListener('click', () => {
    if (meditationTimer) {
        clearInterval(meditationTimer);
        meditationTimer = null;
        meditationTimerDisplay.classList.add('hidden');
        meditationButton.querySelector('span').textContent = "Meditate";
        return;
    }

    const duration = parseInt(meditationDurationSlider.value, 10);
    let timeLeft = duration * 60 + 5; // 5 Sekunden Vorlauf

    beepSound.play();
    meditationTimerDisplay.classList.remove('hidden');

    meditationTimer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        meditationTimerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft === duration * 60) {
            beepSound.play(); // Beep nach Vorlauf
        }

        if (timeLeft <= 0) {
            clearInterval(meditationTimer);
            meditationTimer = null;
            meditationTimerDisplay.classList.add('hidden');
            meditationButton.querySelector('span').textContent = "Meditate";
            beepSound.play();
        }
    }, 1000);

    meditationButton.querySelector('span').textContent = "Stop";
});

window.addEventListener('load', () => {
    const savedPhotos = localStorage.getItem('photos');
    if (savedPhotos) {
        photos = JSON.parse(savedPhotos);
        updatePhotoGallery();
    }
    startCamera();
});

navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Verfügbare Kameras:', videoDevices);
    })
    .catch(err => {
        console.error('Fehler beim Auflisten der Geräte:', err);
    });
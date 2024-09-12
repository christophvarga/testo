const colorButton = document.getElementById('colorButton');
const photoButton = document.getElementById('photoButton');
const switchCameraButton = document.getElementById('switchCameraButton');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photoGallery = document.getElementById('photoGallery');
const body = document.body;

const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
let currentColorIndex = 0;
let photos = [];
let facingMode = "environment"; // Start mit der Rückkamera
let currentStream;

colorButton.addEventListener('click', () => {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    body.style.backgroundColor = colors[currentColorIndex];
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
            // Fallback, falls die exakte Kamera nicht verfügbar ist
            const fallbackConstraints = { video: true };
            return navigator.mediaDevices.getUserMedia(fallbackConstraints);
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

window.addEventListener('load', () => {
    const savedPhotos = localStorage.getItem('photos');
    if (savedPhotos) {
        photos = JSON.parse(savedPhotos);
        updatePhotoGallery();
    }
    startCamera(); // Startet die Kamera beim Laden der Seite
});

// Optional: Überprüfen Sie die verfügbaren Kameras
navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Verfügbare Kameras:', videoDevices);
    })
    .catch(err => {
        console.error('Fehler beim Auflisten der Geräte:', err);
    });
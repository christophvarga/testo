const colorButton = document.getElementById('colorButton');
const photoButton = document.getElementById('photoButton');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photoGallery = document.getElementById('photoGallery');
const body = document.body;

const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
let currentColorIndex = 0;
let photos = [];

colorButton.addEventListener('click', () => {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    body.style.backgroundColor = colors[currentColorIndex];
});

// Kamera-Zugriff anfordern
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        console.error("Fehler beim Zugriff auf die Kamera:", err);
    });

photoButton.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const photoDataUrl = canvas.toDataURL('image/jpeg');
    photos.unshift(photoDataUrl);
    
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
        img.src = photo;
        img.style.width = '100px';
        img.style.height = 'auto';
        img.style.margin = '5px';
        photoGallery.appendChild(img);
    });
}

function savePhotosToLocalStorage() {
    localStorage.setItem('photos', JSON.stringify(photos));
}

// Beim Laden der Seite gespeicherte Fotos abrufen
window.addEventListener('load', () => {
    const savedPhotos = localStorage.getItem('photos');
    if (savedPhotos) {
        photos = JSON.parse(savedPhotos);
        updatePhotoGallery();
    }
});
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhmlc2atm/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'Yousef'; 

let uploadedImageUrl = null;

const photoInput = document.getElementById('photo');
if (photoInput) {
    photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        document.getElementById('upText').innerText = 'Uploading...';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
            const resData = await res.json();
            uploadedImageUrl = resData.secure_url;
            document.getElementById('upText').innerText = 'Image Uploaded';
            document.getElementById('delete-photo').style.display = 'flex';
        } catch (err) {
            document.getElementById('upText').innerText = 'Error! ❌';
        }
    });
}

function generate() {
    const nameInput = document.getElementById('name');
    if (!nameInput || !nameInput.value) return alert("Please enter your name!");

    const payload = {
        name: nameInput.value,
        fb: document.getElementById('fb')?.value || '',
        ig: document.getElementById('ig')?.value || '',
        ln: document.getElementById('ln')?.value || '',
        wa: document.getElementById('wa')?.value || '',
        img: uploadedImageUrl
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));
    const profileUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}profile.html?data=${encoded}`;

    const shortPayload = { 
        n: payload.name, 
        f: payload.fb, 
        i: payload.ig, 
        l: payload.ln, 
        w: payload.wa,
        p: payload.img 
    };
    
    const shortEncoded = encodeURIComponent(JSON.stringify(shortPayload));
    const qrUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}profile.html?data=${shortEncoded}`;

    document.getElementById('main-card').style.display = 'none';
    const resultArea = document.getElementById('result-area');
    resultArea.style.display = 'block';

    document.getElementById('display-name').innerText = payload.name;
    document.getElementById('display-name').setAttribute('data-text', payload.name);
    
    if (uploadedImageUrl) {
        const imgElement = document.getElementById('profile-img');
        imgElement.src = uploadedImageUrl;
        imgElement.style.display = 'block'; 
    }

    const socialLinks = {
        'link-fb': payload.fb,
        'link-ig': payload.ig,
        'link-ln': payload.ln,
        'link-wa': payload.wa ? `https://wa.me/${payload.wa}` : null
    };

    Object.entries(socialLinks).forEach(([id, url]) => {
        const el = document.getElementById(id);
        if (el) {
            if (url) {
                el.href = url.startsWith('http') ? url : `https://${url}`;
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        }
    });

    const qrBox = document.getElementById('qrcode');
    if (qrBox) {
        qrBox.innerHTML = ""; 
        new QRCode(qrBox, {
            text: qrUrl,
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.L
        });
    }

    window.generatedProfileUrl = profileUrl;
}

function copyProfileLink() {
    if (window.generatedProfileUrl) {
        navigator.clipboard.writeText(window.generatedProfileUrl).then(() => {
            const copyText = document.getElementById('copyText');
            const originalText = copyText.innerText;
            copyText.innerText = "Link Copied";
            setTimeout(() => { copyText.innerText = originalText; }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    } else {
        alert("No link generated yet!");
    }
}

const deleteBtn = document.getElementById('delete-photo');
if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
        uploadedImageUrl = null;
        document.getElementById('photo').value = '';
        document.getElementById('upText').innerText = 'Upload Identity Photo';
        deleteBtn.style.display = 'none';
    });
}

// --- الجزء المطور لحركة الكروت (Parallax System) المعدل للموبايل والبروفايل ---

function moveElement(el, x, y, isMouse = false) {
    if (!el) return;
    // تم استخدام transition سريع جداً للموس وصفر للموبايل لضمان السلاسة
    el.style.transition = isMouse ? "transform 0.1s ease-out" : "none";
    el.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
}

// 1. دعم الموبايل (Touch & Gyroscope)
// الحركة مع اللمس (Touch) أضمن وأسرع على المتصفحات من الـ Gyro
document.addEventListener('touchmove', (e) => {
    const cards = document.querySelectorAll('.card, .profile-card, #result-area');
    const touch = e.touches[0];
    
    cards.forEach(card => {
        if (getComputedStyle(card).display !== 'none') {
            const rect = card.getBoundingClientRect();
            const x = (touch.clientX - rect.left - rect.width / 2) / 10;
            const y = (touch.clientY - rect.top - rect.height / 2) / 10;
            moveElement(card, x, y);
        }
    });
}, { passive: true });

// دعم الـ Gyroscope (اختياري إضافي)
window.addEventListener('deviceorientation', (event) => {
    const cards = document.querySelectorAll('.card, .profile-card, #result-area');
    let x = event.gamma / 4; 
    let y = (event.beta - 45) / 4; 

    if (event.gamma !== null) {
        cards.forEach(card => {
            if (getComputedStyle(card).display !== 'none') {
                moveElement(card, x, y);
            }
        });
    }
});

// 2. حركة الماوس للكمبيوتر
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.card, .profile-card, #result-area');
    cards.forEach(card => {
        if (getComputedStyle(card).display !== 'none') {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 15;
            const y = (e.clientY - rect.top - rect.height / 2) / 15;
            moveElement(card, x, y, true);
        }
    });
});

// 3. إعادة الكارت لوضعه الطبيعي (للماوس واللمس)
const resetEvents = ['mouseleave', 'touchend'];
resetEvents.forEach(evt => {
    document.addEventListener(evt, () => {
        const cards = document.querySelectorAll('.card, .profile-card, #result-area');
        cards.forEach(card => {
            card.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
            card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        });
    });
});

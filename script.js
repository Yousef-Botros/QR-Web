const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhmlc2atm/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'Yousef'; 

let uploadedImageUrl = null;

// --- 1. Cloudinary & Photo Logic ---
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

const deleteBtn = document.getElementById('delete-photo');
if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
        uploadedImageUrl = null;
        document.getElementById('photo').value = '';
        document.getElementById('upText').innerText = 'Upload Identity Photo';
        deleteBtn.style.display = 'none';
    });
}

// --- 2. Generation Logic ---
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

    // بيانات مختصرة للـ QR لضمان سرعة المسح
    const shortPayload = { n: payload.name, f: payload.fb, i: payload.ig, l: payload.ln, w: payload.wa, p: payload.img };
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
    
    // تفعيل حساسات الموبايل فور توليد الكارت
    initGyro();
}

function copyProfileLink() {
    if (window.generatedProfileUrl) {
        navigator.clipboard.writeText(window.generatedProfileUrl).then(() => {
            const copyText = document.getElementById('copyText');
            const originalText = copyText.innerText;
            copyText.innerText = "Link Copied";
            setTimeout(() => { copyText.innerText = originalText; }, 2000);
        }).catch(err => console.error('Failed to copy: ', err));
    } else {
        alert("No link generated yet!");
    }
}

// --- 3. Professional Parallax System (Modified for Stability & Interactivity) ---

function moveElement(el, x, y, isMouse = false) {
    if (!el) return;
    // تم تحسين الـ transition ليكون أسرع في الاستجابة وأهدى في الحركة
    el.style.transition = isMouse ? "transform 0.2s cubic-bezier(0.03, 0.98, 0.52, 0.99)" : "transform 0.1s ease-out";
    el.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
}

// دعم الموبايل (Gyroscope)
function initGyro() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(state => { if (state === 'granted') window.addEventListener('deviceorientation', handleGyro); })
            .catch(console.error);
    } else {
        window.addEventListener('deviceorientation', handleGyro);
    }
}

function handleGyro(event) {
    const cards = document.querySelectorAll('.card, .profile-card, #result-area');
    // تم القسمة على 8 بدل 3 لتقليل المرجحة العنيفة على الموبايل
    let x = event.gamma / 8; 
    let y = (event.beta - 45) / 8; 

    cards.forEach(card => {
        if (getComputedStyle(card).display !== 'none') {
            moveElement(card, x, y);
        }
    });
}

// دعم الماوس للكمبيوتر
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.card, .profile-card, #result-area');
    cards.forEach(card => {
        if (getComputedStyle(card).display !== 'none') {
            const rect = card.getBoundingClientRect();
            // تم القسمة على 35 بدل 15 ليكون التأثير ناعم ولا يؤثر على دقة الضغط على الأزرار
            const x = (e.clientX - rect.left - rect.width / 2) / 35;
            const y = (e.clientY - rect.top - rect.height / 2) / 35;
            moveElement(card, x, y, true);
        }
    });
});

// إعادة الوضع الطبيعي عند الخروج بالماوس أو انتهاء اللمس
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

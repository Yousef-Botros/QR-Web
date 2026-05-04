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

    // الرابط الكامل لزرار النسخ (فيه كل البيانات بأساميها الأصلية)
    const encoded = encodeURIComponent(JSON.stringify(payload));
    const profileUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}profile.html?data=${encoded}`;

    // --- التعديل هنا: نظام الاختصارات للـ QR Code عشان الصورة تظهر واللينك يصغر ---
    const shortPayload = { 
        n: payload.name, 
        f: payload.fb, 
        i: payload.ig, 
        l: payload.ln, 
        w: payload.wa,
        p: payload.img // p اختصار لـ photo (رابط Cloudinary)
    };
    
    const shortEncoded = encodeURIComponent(JSON.stringify(shortPayload));
    const qrUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}profile.html?data=${shortEncoded}`;

    document.getElementById('main-card').style.display = 'none';
    const resultArea = document.getElementById('result-area');
    resultArea.style.display = 'block';

    document.getElementById('display-name').innerText = payload.name;
    document.getElementById('display-name').setAttribute('data-text', payload.name);
    
    // ابحث عن الجزء ده في الـ generate function وعدله كدة:
    if (uploadedImageUrl) {
        const imgElement = document.getElementById('profile-img');
        imgElement.src = uploadedImageUrl;
        imgElement.style.display = 'block'; // ده السطر اللي كان ناقص عشان الصورة تظهر في المعاينة
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
            text: qrUrl, // اللينك اللي فيه الصورة بس باختصارات
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

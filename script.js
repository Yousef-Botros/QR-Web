const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhmlc2atm/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'Yousef'; 

let uploadedImageUrl = null;
const photoInput = document.getElementById('photo');

if (photoInput) {
    photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const upText = document.getElementById('upText');
        upText.innerText = 'Uploading...';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        try {
            const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
            const data = await res.json();
            uploadedImageUrl = data.secure_url;
            upText.innerText = 'Image Uploaded ✅';
            if (document.getElementById('delete-photo')) document.getElementById('delete-photo').style.display = 'flex';
        } catch (err) {
            upText.innerText = 'Error! ❌';
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
    const currentPath = window.location.pathname;
    const directory = currentPath.substring(0, currentPath.lastIndexOf('/'));
    const profileUrl = `${window.location.origin}${directory}/profile.html?data=${encoded}`;

    document.getElementById('main-card').style.display = 'none';
    const resultArea = document.getElementById('result-area');
    resultArea.style.display = 'block';
    
    resultArea.innerHTML = `
        <div class="static-qr-card" style="text-align: center; padding: 40px; background: rgba(255,255,255,0.1); backdrop-filter: blur(15px); border-radius: 30px; border: 1px solid rgba(255,255,255,0.2); max-width: 400px; margin: auto; position: relative; z-index: 100;">
            <h2 style="margin-bottom: 20px; color: white;">Ready to Share!</h2>
            <div id="qrcode" style="background: white; padding: 15px; border-radius: 20px; display: inline-block; margin-bottom: 25px;"></div>
            
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <button class="main-btn" onclick="copyProfileLink('${profileUrl}')" style="cursor: pointer !important; position: relative; z-index: 101;">
                    <i class="fas fa-copy"></i> <span id="copyText">Copy Profile Link</span>
                </button>
                <button class="main-btn" onclick="window.location.reload()" style="background: rgba(255,255,255,0.1); cursor: pointer !important; position: relative; z-index: 101;">
                    <i class="fas fa-undo"></i> Create New One
                </button>
            </div>
        </div>
    `;

    new QRCode(document.getElementById('qrcode'), {
        text: profileUrl,
        width: 180,
        height: 180,
        correctLevel: QRCode.CorrectLevel.H
    });

    window.generatedProfileUrl = profileUrl;
}

function copyProfileLink(url) {
    const link = url || window.generatedProfileUrl;
    const el = document.createElement('textarea');
    el.value = link;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    
    const btnText = document.getElementById('copyText');
    btnText.innerText = "Link Copied! ✅";
    setTimeout(() => btnText.innerText = "Copy Profile Link", 2000);
}

function initLimited3D() {
    document.addEventListener('mousemove', (e) => {
        const mainCard = document.getElementById('main-card');
        
        if (mainCard && getComputedStyle(mainCard).display !== 'none') {
            const rect = mainCard.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 30;
            const y = (rect.height / 2 - (e.clientY - rect.top)) / 30;
            mainCard.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg)`;
        }
    });

    document.addEventListener('mouseleave', () => {
        const mainCard = document.getElementById('main-card');
        if (mainCard) mainCard.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
    });
}
initLimited3D();

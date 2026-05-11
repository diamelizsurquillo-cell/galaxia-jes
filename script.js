document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    //  1. WELCOME SCREEN
    // ============================================================
    const welcomeScreen = document.getElementById('welcome-screen');
    const enterBtn = document.getElementById('enter-btn');
    const uiContainer = document.getElementById('ui-container');

    // Mini star field for welcome
    const wCanvas = document.getElementById('welcome-canvas');
    const wCtx = wCanvas.getContext('2d');
    wCanvas.width = window.innerWidth;
    wCanvas.height = window.innerHeight;
    const wStars = Array.from({length: 300}, () => ({
        x: Math.random() * wCanvas.width,
        y: Math.random() * wCanvas.height,
        r: Math.random() * 1.5,
        speed: Math.random() * 0.5 + 0.1,
        alpha: Math.random()
    }));
    function drawWelcomeStars() {
        wCtx.clearRect(0, 0, wCanvas.width, wCanvas.height);
        wStars.forEach(s => {
            s.alpha += (Math.random() - 0.5) * 0.05;
            s.alpha = Math.max(0.1, Math.min(1, s.alpha));
            wCtx.fillStyle = `rgba(255,255,255,${s.alpha})`;
            wCtx.beginPath();
            wCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            wCtx.fill();
        });
        if (!welcomeScreen.classList.contains('hide')) requestAnimationFrame(drawWelcomeStars);
    }
    drawWelcomeStars();

    enterBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hide');
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            uiContainer.classList.add('visible');
            // Try to play music on enter
            bgMusic.play().then(() => {
                isMusicPlaying = true;
                muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                muteBtn.classList.add('playing');
            }).catch(() => {});
        }, 1200);
        bootGalaxy();
    });

    // ============================================================
    //  2. CANVAS ENGINE — STARS (TWINKLING)
    // ============================================================
    const spaceCanvas = document.getElementById('deep-space-canvas');
    const spaceCtx = spaceCanvas.getContext('2d');
    const nebulaCanvas = document.getElementById('nebula-canvas');
    const nebulaCtx = nebulaCanvas.getContext('2d');
    const galaxyCanvas = document.getElementById('spiral-galaxy-canvas');
    const galaxyCtx = galaxyCanvas.getContext('2d');
    const tilt = 0.35;

    function resizeCanvases() {
        [spaceCanvas, nebulaCanvas, galaxyCanvas].forEach(c => {
            c.width = window.innerWidth;
            c.height = window.innerHeight;
        });
        drawNebula();
        drawDeepSpace();
        // Responsive scale
        const wrapper = document.getElementById('galaxy-wrapper');
        const scale = window.innerWidth < 900 ? window.innerWidth / 900 : 1;
        wrapper.style.transform = `scale(${scale})`;
    }
    window.addEventListener('resize', resizeCanvases);

    let bgStars = [];
    function initDeepSpace() {
        bgStars = Array.from({length: 1500}, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 1.8,
            baseAlpha: Math.random() * 0.7 + 0.3,
            twinkleSpeed: Math.random() * 0.03 + 0.01,
            twinkleOffset: Math.random() * Math.PI * 2
        }));
    }

    let starTime = 0;
    function drawDeepSpace() {
        spaceCtx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
        bgStars.forEach(s => {
            // Twinkling effect using sine wave
            const alpha = s.baseAlpha + Math.sin(starTime * s.twinkleSpeed + s.twinkleOffset) * 0.3;
            spaceCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, Math.min(1, alpha))})`;
            spaceCtx.beginPath();
            spaceCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            spaceCtx.fill();
        });
        starTime++;
    }

    // ============================================================
    //  3. NEBULA
    // ============================================================
    function drawNebula() {
        nebulaCtx.clearRect(0, 0, nebulaCanvas.width, nebulaCanvas.height);
        const cx = nebulaCanvas.width / 2;
        const cy = nebulaCanvas.height / 2;
        const nebulae = [
            { x: cx - 200, y: cy - 100, rx: 350, ry: 180, color: 'rgba(76,29,149,' },
            { x: cx + 150, y: cy + 50,  rx: 300, ry: 200, color: 'rgba(168,85,247,' },
            { x: cx - 50,  y: cy + 120, rx: 250, ry: 150, color: 'rgba(255,107,157,' },
            { x: cx + 250, y: cy - 150, rx: 200, ry: 120, color: 'rgba(59,130,246,' },
            { x: cx,       y: cy,       rx: 400, ry: 250, color: 'rgba(255,215,0,' },
        ];
        nebulae.forEach(n => {
            const grad = nebulaCtx.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(n.rx, n.ry));
            grad.addColorStop(0, n.color + '0.08)');
            grad.addColorStop(0.5, n.color + '0.03)');
            grad.addColorStop(1, 'transparent');
            nebulaCtx.fillStyle = grad;
            nebulaCtx.beginPath();
            nebulaCtx.ellipse(n.x, n.y, n.rx, n.ry, 0, 0, Math.PI * 2);
            nebulaCtx.fill();
        });
    }

    // ============================================================
    //  4. SPIRAL GALAXY PARTICLES
    // ============================================================
    const galaxyStars = [];
    const numStars = 4000;
    const arms = 4;
    const armSpread = 0.4;

    function initGalaxyStars() {
        for (let i = 0; i < numStars; i++) {
            const radius = Math.pow(Math.random(), 2) * 800 + 30;
            const armOffset = (i % arms) * ((Math.PI * 2) / arms);
            const spiralAngle = radius * 0.012;
            const randomOffset = (Math.random() - 0.5) * armSpread * (Math.random() * 2);
            const angle = armOffset + spiralAngle + randomOffset;
            galaxyStars.push({
                radius, baseAngle: angle,
                speed: 0.0002 + (1 / (radius + 50)) * 0.05,
                size: Math.random() * 2.5,
                color: i % 4 === 0 ? '#ffb7b2' : (i % 3 === 0 ? '#4c1d95' : (i % 2 === 0 ? '#ffd700' : '#ffffff')),
                alpha: Math.random() * 0.7 + 0.1
            });
        }
    }

    let time = 0;
    function drawGalaxy() {
        galaxyCtx.clearRect(0, 0, galaxyCanvas.width, galaxyCanvas.height);
        const cx = galaxyCanvas.width / 2;
        const cy = galaxyCanvas.height / 2;
        galaxyCtx.globalCompositeOperation = 'lighter';
        galaxyStars.forEach(s => {
            const currentAngle = s.baseAngle + time * s.speed;
            const x = cx + Math.cos(currentAngle) * s.radius;
            const y = cy + Math.sin(currentAngle) * s.radius * tilt;
            galaxyCtx.fillStyle = s.color;
            galaxyCtx.globalAlpha = s.alpha;
            galaxyCtx.beginPath();
            galaxyCtx.arc(x, y, s.size, 0, Math.PI * 2);
            galaxyCtx.fill();
        });
        // Planet trails
        planets.forEach(p => {
            galaxyCtx.beginPath();
            galaxyCtx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
            galaxyCtx.lineWidth = 2;
            galaxyCtx.lineCap = 'round';
            for (let i = 0; i < 25; i++) {
                const trailAngle = p.angle - i * 0.015 * Math.sign(p.orbitSpeed);
                const tx = cx + Math.cos(trailAngle) * p.orbitRadius;
                const ty = cy + Math.sin(trailAngle) * p.orbitRadius * tilt;
                if (i === 0) galaxyCtx.moveTo(tx, ty);
                else galaxyCtx.lineTo(tx, ty);
            }
            galaxyCtx.stroke();
        });
        time++;
    }

    // ============================================================
    //  5. PARALLAX
    // ============================================================
    let parallaxX = 0, parallaxY = 0;
    document.addEventListener('mousemove', (e) => {
        parallaxX = (e.clientX / window.innerWidth - 0.5) * 2;
        parallaxY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    window.addEventListener('deviceorientation', (e) => {
        parallaxX = ((e.gamma || 0) / 45);
        parallaxY = ((e.beta || 0) / 90);
    });
    function applyParallax() {
        const wrapper = document.getElementById('galaxy-wrapper');
        const scale = window.innerWidth < 900 ? window.innerWidth / 900 : 1;
        wrapper.style.transform = `translate(${parallaxX * 12}px, ${parallaxY * 12}px) scale(${scale})`;
        nebulaCanvas.style.transform = `translate(${parallaxX * 6}px, ${parallaxY * 6}px)`;
    }

    // ============================================================
    //  6. SHOOTING STARS
    // ============================================================
    function spawnShootingStar() {
        const container = document.getElementById('shooting-stars-container');
        const star = document.createElement('div');
        star.style.cssText = `position:fixed;width:${80 + Math.random()*80}px;height:2px;border-radius:2px;pointer-events:none;background:linear-gradient(to left,transparent,rgba(255,255,255,0.9),transparent);filter:drop-shadow(0 0 4px white);z-index:5;`;
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight * 0.5;
        const angle = 25 + Math.random() * 35;
        const dist = 500 + Math.random() * 400;
        const dx = Math.cos(angle * Math.PI / 180) * dist;
        const dy = Math.sin(angle * Math.PI / 180) * dist;
        const dur = 700 + Math.random() * 600;
        star.style.left = startX + 'px';
        star.style.top = startY + 'px';
        container.appendChild(star);
        star.animate([
            { transform: `rotate(${angle}deg) translateX(0)`, opacity: 1 },
            { transform: `rotate(${angle}deg) translateX(${dist}px)`, opacity: 0 }
        ], { duration: dur, easing: 'linear', fill: 'forwards' });
        setTimeout(() => star.remove(), dur + 50);
        setTimeout(spawnShootingStar, 3000 + Math.random() * 5000);
    }

    // ============================================================
    //  7. PARTICLE EXPLOSION
    // ============================================================
    function createParticles(x, y) {
        const container = document.getElementById('particles-container');
        for (let i = 0; i < 25; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const angle = (Math.PI * 2 / 25) * i + (Math.random() - 0.5);
            const dist = 40 + Math.random() * 80;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            const size = 2 + Math.random() * 4;
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            container.appendChild(p);
            p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${dx}px,${dy}px) scale(0)`, opacity: 0 }
            ], { duration: 600 + Math.random() * 400, easing: 'ease-out', fill: 'forwards' });
            setTimeout(() => p.remove(), 1100);
        }
    }

    // ============================================================
    //  8. SUPABASE INTEGRATION
    // ============================================================
    const supabaseUrl = 'https://bafgrphusfkpxaqiyoqm.supabase.co';
    const supabaseKey = 'sb_publishable_I9dYqAqLLVAxkaENes86pA_jy86lZhA';
    const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

    let photos = []; // { src, name, description }
    let descriptions = {};
    const orbitsContainer = document.getElementById('orbits-container');
    const photoCounter = document.getElementById('photo-counter');
    let planets = [];

    async function loadDescriptions() {
        try {
            const { data, error } = await _supabase.storage.from('photos').download('_descriptions.json');
            if (!error && data) {
                descriptions = JSON.parse(await data.text());
            }
        } catch (e) { descriptions = {}; }
    }

    async function saveDescriptions() {
        const blob = new Blob([JSON.stringify(descriptions)], { type: 'application/json' });
        await _supabase.storage.from('photos').upload('_descriptions.json', blob, { upsert: true });
    }

    async function loadPhotos() {
        await loadDescriptions();
        const { data, error } = await _supabase.storage.from('photos').list();
        if (error) { console.error("Error cargando fotos:", error); return; }
        const validFiles = data.filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '_descriptions.json');
        photos = validFiles.map(file => {
            const { data: urlData } = _supabase.storage.from('photos').getPublicUrl(file.name);
            return { src: urlData.publicUrl, name: file.name, description: descriptions[file.name] || '' };
        });
        initPlanets();
    }

    function initPlanets() {
        planets.forEach(p => { if (p.element) p.element.remove(); });
        planets = [];
        photos.forEach((photo, index) => addPlanet(photo.src, index));
        updateCounter();
    }

    function addPlanet(src, index) {
        const orbitRadius = 330 + (index * 85) % 450;
        const planetObj = {
            src, index, orbitRadius,
            angle: Math.random() * Math.PI * 2,
            orbitSpeed: (Math.random() * 0.002 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
            selfAngle: 0,
            selfSpeed: Math.random() * 1 + 0.5,
            element: null,
            isHovered: false
        };
        const container = document.createElement('div');
        container.className = 'planet-container';
        const img = document.createElement('img');
        img.className = 'planet';
        img.src = src;
        const glow = document.createElement('div');
        glow.className = 'planet-glow';
        container.appendChild(img);
        container.appendChild(glow);
        orbitsContainer.appendChild(container);
        planetObj.element = container;
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            // Particle explosion at click position
            createParticles(e.clientX, e.clientY);
            openModal(index);
            playSound();
        });
        container.addEventListener('mouseenter', () => { planetObj.isHovered = true; });
        container.addEventListener('mouseleave', () => { planetObj.isHovered = false; });
        planets.push(planetObj);
    }

    function updateCounter() {
        photoCounter.textContent = `Recuerdos en la galaxia: ${photos.length}`;
    }

    // ============================================================
    //  9. MAIN ANIMATION LOOP
    // ============================================================
    function animate() {
        drawDeepSpace(); // Twinkling stars
        drawGalaxy();    // Spiral + trails
        applyParallax();

        planets.forEach(p => {
            if (!p.isHovered) {
                p.angle += p.orbitSpeed;
                p.selfAngle += p.selfSpeed;
            }
            const x = Math.cos(p.angle) * p.orbitRadius;
            const y = Math.sin(p.angle) * p.orbitRadius * tilt;
            p.element.style.zIndex = Math.floor(50 + y);
            p.element.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${p.selfAngle}deg)`;
            if (p.isHovered) p.element.style.zIndex = 1000;
        });

        requestAnimationFrame(animate);
    }

    // ============================================================
    //  10. LIVE COUNTER
    // ============================================================
    function updateLiveCounter() {
        const start = new Date(2023, 0, 23);
        const now = new Date();
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        let days = now.getDate() - start.getDate();
        if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        document.getElementById('c-years').textContent = years;
        document.getElementById('c-months').textContent = months;
        document.getElementById('c-days').textContent = days;
        document.getElementById('c-hours').textContent = String(now.getHours()).padStart(2, '0');
        document.getElementById('c-min').textContent = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('c-sec').textContent = String(now.getSeconds()).padStart(2, '0');
    }

    // ============================================================
    //  11. MODAL (CINEMATIC)
    // ============================================================
    const modal = document.getElementById('lightbox');
    const modalImg = document.getElementById('modal-img');
    const modalDesc = document.getElementById('modal-description');
    const closeBtn = document.querySelector('.close');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentPhotoIndex = 0;

    function openModal(index) {
        currentPhotoIndex = index;
        updateModalImage();
        modal.style.display = 'block';
        requestAnimationFrame(() => modal.classList.add('show'));
    }
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 400);
    }
    function updateModalImage() {
        modalImg.src = photos[currentPhotoIndex].src;
        modalDesc.textContent = photos[currentPhotoIndex].description || '';
    }
    closeBtn.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
        updateModalImage();
    });
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
        updateModalImage();
    });
    window.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });

    // ============================================================
    //  12. UPLOAD LOGIC (WITH DESCRIPTIONS)
    // ============================================================
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');

    uploadBtn.addEventListener('click', () => {
        const pwd = prompt("Ingresa la clave para subir fotos:");
        if (pwd === "47902831") fileInput.click();
        else if (pwd !== null) alert("Clave incorrecta. No puedes modificar la galaxia.");
    });

    fileInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            const desc = prompt("Agrega una descripción para estos recuerdos (opcional):") || '';
            const originalText = uploadBtn.innerHTML;
            uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Subiendo ${files.length}...`;
            uploadBtn.style.pointerEvents = 'none';
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileName = `${Date.now()}_${i}_${file.name}`;
                const { error } = await _supabase.storage.from('photos').upload(fileName, file);
                if (error) { console.error("Error:", error.message); continue; }
                if (desc) descriptions[fileName] = desc;
                const { data: urlData } = _supabase.storage.from('photos').getPublicUrl(fileName);
                photos.push({ src: urlData.publicUrl, name: fileName, description: desc });
                addPlanet(urlData.publicUrl, photos.length - 1);
                updateCounter();
            }
            if (desc) await saveDescriptions();
            uploadBtn.innerHTML = originalText;
            uploadBtn.style.pointerEvents = 'auto';
            fileInput.value = '';
        }
    });

    // ============================================================
    //  13. AUDIO
    // ============================================================
    const bgMusic = document.getElementById('bg-music');
    const clickSound = document.getElementById('click-sound');
    const muteBtn = document.getElementById('mute-btn');
    let isMusicPlaying = false;
    let isMuted = false;

    muteBtn.addEventListener('click', () => {
        if (!isMusicPlaying) {
            bgMusic.play().then(() => {
                isMusicPlaying = true;
                isMuted = false;
                muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                muteBtn.classList.add('playing');
            }).catch(e => console.log(e));
        } else {
            isMuted = !isMuted;
            bgMusic.muted = isMuted;
            muteBtn.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
            if (isMuted) muteBtn.classList.remove('playing');
            else muteBtn.classList.add('playing');
        }
    });

    function playSound() {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    }

    // ============================================================
    //  14. BOOT
    // ============================================================
    function bootGalaxy() {
        initDeepSpace();
        resizeCanvases();
        initGalaxyStars();
        loadPhotos();
        animate();
        spawnShootingStar();
        updateLiveCounter();
        setInterval(updateLiveCounter, 1000);
    }
});

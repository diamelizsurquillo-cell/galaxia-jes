document.addEventListener('DOMContentLoaded', () => {
    // --- CANVAS GALAXY ENGINE ---
    const spaceCanvas = document.getElementById('deep-space-canvas');
    const spaceCtx = spaceCanvas.getContext('2d');
    const galaxyCanvas = document.getElementById('spiral-galaxy-canvas');
    const galaxyCtx = galaxyCanvas.getContext('2d');

    const tilt = 0.35; // Perspective tilt. 1 = top-down circle, 0.35 = 3D ellipse

    function resize() {
        spaceCanvas.width = window.innerWidth;
        spaceCanvas.height = window.innerHeight;
        galaxyCanvas.width = window.innerWidth;
        galaxyCanvas.height = window.innerHeight;
        drawDeepSpace(); // Redraw static stars on resize
    }
    window.addEventListener('resize', resize);

    // Deep Space Background (Static)
    let bgStars = [];
    function initDeepSpace() {
        bgStars = Array.from({length: 1500}, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 1.5,
            alpha: Math.random() * 0.8 + 0.2
        }));
    }
    
    function drawDeepSpace() {
        spaceCtx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
        bgStars.forEach(s => {
            spaceCtx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            spaceCtx.beginPath();
            spaceCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            spaceCtx.fill();
        });
    }

    // Spiral Galaxy Particles
    const galaxyStars = [];
    const numStars = 4000;
    const arms = 4;
    const armSpread = 0.4;

    function initGalaxyStars() {
        for (let i = 0; i < numStars; i++) {
            // Logarithmic distribution: more stars near the center
            const radius = Math.pow(Math.random(), 2) * 800 + 30; 
            
            const armOffset = (i % arms) * ((Math.PI * 2) / arms);
            const spiralAngle = radius * 0.012; // Controls how tightly the arms wind
            const randomOffset = (Math.random() - 0.5) * armSpread * (Math.random() * 2);
            
            const angle = armOffset + spiralAngle + randomOffset;
            
            galaxyStars.push({
                radius,
                baseAngle: angle,
                speed: 0.0002 + (1 / (radius + 50)) * 0.05, // Inner moves faster
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

        // Draw dust particles
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

        // Draw Light Trails for Planets
        planets.forEach(p => {
            galaxyCtx.beginPath();
            // A gradient trail would be perfect, but simple opacity fading works well
            galaxyCtx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
            galaxyCtx.lineWidth = 3;
            galaxyCtx.lineCap = 'round';
            
            const trailLength = 30;
            for (let i = 0; i < trailLength; i++) {
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


    // --- DOM PLANETS LOGIC ---
    const defaultUrls = [
        'https://images.unsplash.com/photo-1518599904199-0ca897819ddb?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=300&q=80'
    ];

    let photos = [];
    try {
        const stored = localStorage.getItem('galaxy_photos');
        if (stored) {
            photos = JSON.parse(stored);
            // Filtrar y eliminar las fotos por defecto guardadas
            photos = photos.filter(p => !defaultUrls.includes(p.src));
            localStorage.setItem('galaxy_photos', JSON.stringify(photos));
        }
    } catch(e) {
        photos = [];
    }

    const orbitsContainer = document.getElementById('orbits-container');
    const photoCounter = document.getElementById('photo-counter');
    let planets = [];

    function initPlanets() {
        planets.forEach(p => { if(p.element) p.element.remove(); });
        planets = [];
        photos.forEach((photo, index) => {
            addPlanet(photo.src, index);
        });
        updateCounter();
    }

    function addPlanet(src, index) {
        // Aumentamos el radio base para que las órbitas bordeen el texto y no lo tapen
        // Usamos un radio menor en móviles para que quepan en la pantalla
        const baseRadius = window.innerWidth < 768 ? 180 : 320;
        const orbitRadius = baseRadius + (index * 80) % 400;
        
        const planetObj = {
            src: src,
            index: index,
            orbitRadius: orbitRadius,
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
        
        // Interactions
        container.addEventListener('click', (e) => {
            e.stopPropagation();
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

    // Main Animation Loop
    function animate() {
        drawGalaxy(); // Canvas updates

        // DOM Planet updates
        planets.forEach(p => {
            if (!p.isHovered) {
                p.angle += p.orbitSpeed;
                p.selfAngle += p.selfSpeed;
            }
            
            // Calculate 3D projected coordinates
            const x = Math.cos(p.angle) * p.orbitRadius;
            const y = Math.sin(p.angle) * p.orbitRadius * tilt;
            
            // Dynamic Z-Index: Elements in "front" (positive Y) get higher z-index
            const baseZIndex = 50; 
            p.element.style.zIndex = Math.floor(baseZIndex + y);

            // Apply position and self-rotation
            p.element.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${p.selfAngle}deg)`;
            
            if(p.isHovered) {
                 p.element.style.zIndex = 1000; // Bring to absolute front when hovered
            }
        });

        requestAnimationFrame(animate);
    }

    // --- MODAL & UI LOGIC ---
    const modal = document.getElementById('lightbox');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.querySelector('.close');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentPhotoIndex = 0;

    function openModal(index) {
        currentPhotoIndex = index;
        updateModalImage();
        modal.classList.add('show');
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }

    function updateModalImage() {
        modalImg.src = photos[currentPhotoIndex].src;
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
    window.addEventListener('click', (event) => {
        if (event.target == modal) closeModal();
    });

    // Upload Logic
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    
    uploadBtn.addEventListener('click', () => {
        const pwd = prompt("Ingresa la clave para subir fotos:");
        if (pwd === "47902831") {
            fileInput.click();
        } else if (pwd !== null) {
            alert("Clave incorrecta. No puedes modificar la galaxia.");
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const newSrc = event.target.result;
                photos.push({ src: newSrc });
                try {
                    localStorage.setItem('galaxy_photos', JSON.stringify(photos));
                } catch(e) {
                    console.warn("Storage quota exceeded.");
                }
                addPlanet(newSrc, photos.length - 1);
                updateCounter();
            };
            reader.readAsDataURL(file);
        }
    });

    // Audio Logic
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
            }).catch(e => console.log(e));
        } else {
            isMuted = !isMuted;
            bgMusic.muted = isMuted;
            muteBtn.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
        }
    });

    function playSound() {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => {}); 
    }

    const playMusicOnInteract = () => {
        if (!isMusicPlaying) {
            bgMusic.play().then(() => {
                isMusicPlaying = true;
                muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            }).catch(e => {});
        }
        document.removeEventListener('click', playMusicOnInteract);
    };
    document.addEventListener('click', playMusicOnInteract);

    // Boot
    initDeepSpace();
    resize();
    initGalaxyStars();
    initPlanets();
    animate();
});

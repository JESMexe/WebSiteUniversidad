document.addEventListener('DOMContentLoaded', () => {
    const soundToggle = document.getElementById('sound-toggle');
    const backgroundMusic = document.getElementById('background-music');
    
    if (soundToggle && backgroundMusic) {
        // --- LÓGICA DE MÚSICA PERSISTENTE ---
        // Al cargar la página, revisa si la música debería estar sonando
        const musicState = sessionStorage.getItem('musicState');
        if (musicState === 'playing') {
            const musicTime = parseFloat(sessionStorage.getItem('musicTime') || '0');
            backgroundMusic.currentTime = musicTime;
            const playPromise = backgroundMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    soundToggle.textContent = '🔊';
                }).catch(error => {
                    console.log("La reproducción automática fue bloqueada. Se requiere interacción del usuario.");
                    soundToggle.textContent = '🔇';
                });
            }
        }

        soundToggle.addEventListener('click', () => {
            if (backgroundMusic.paused) {
                backgroundMusic.play().then(() => {
                    soundToggle.textContent = '🔊';
                    sessionStorage.setItem('musicState', 'playing');
                });
            } else {
                backgroundMusic.pause();
                soundToggle.textContent = '🔇';
                sessionStorage.setItem('musicState', 'paused');
            }
        });

        // Al salir de la página, guarda el estado y el tiempo de la música
        window.addEventListener('beforeunload', () => {
            if (!backgroundMusic.paused) {
                sessionStorage.setItem('musicState', 'playing');
                sessionStorage.setItem('musicTime', backgroundMusic.currentTime.toString());
            } else {
                sessionStorage.setItem('musicState', 'paused');
            }
        });
    }

    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Gracias por tu mensaje. Ha sido enviado.');
            contactForm.reset();
        });
    }

    // --- ANIMACIÓN DE NAVE EN SECCIÓN INICIO ---
    const nave = document.querySelector('#inicio .columna-imagen img');
    const inicioSection = document.getElementById('inicio');

    if (nave && inicioSection) {
        // Usamos una línea de tiempo de anime.js para controlar la animación con el scroll.
        const naveTimeline = anime.timeline({
            targets: nave,
            autoplay: false,
            easing: 'linear'
        });

        naveTimeline
            // 1. Animación de entrada: Ocurre en el primer 30% del scroll de la sección.
            .add({
                translateY: [50, 0], // La nave "entra" deslizándose hacia arriba
                duration: 300 
            })
            // 2. Animación de escalado: Ocurre en el 70% restante del scroll.
            .add({
                scale: [1, 1.5],
                duration: 700
            });

        // Escuchamos el evento de scroll para actualizar la animación.
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroHeight = inicioSection.offsetHeight;

            // Solo animamos si estamos dentro de la sección de inicio.
            if (scrollY < heroHeight) {
                // Calculamos el porcentaje de scroll dentro de la sección.
                const scrollPercent = scrollY / heroHeight;
                // Movemos la línea de tiempo de la animación al punto correspondiente.
                naveTimeline.seek(naveTimeline.duration * scrollPercent);
            }
        });
    }

    // --- ANIMACIÓN DE PARTÍCULAS EN SECCIÓN MISIÓN ---
    const misionSection = document.getElementById('mision');
    const misionCanvas = document.getElementById('mision-canvas');

    if (misionSection && misionCanvas) {
        const misionCtx = misionCanvas.getContext('2d');
        let misionParticles = [];
        const misionParticleCount = 100;
        let misionAnimationId = null;

        let mouse = {
            x: undefined,
            y: undefined,
            radius: 100
        };

        misionSection.addEventListener('mousemove', (event) => {
            const rect = misionSection.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        });

        misionSection.addEventListener('mouseleave', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        function resizeMisionCanvas() {
            misionCanvas.width = misionSection.offsetWidth;
            misionCanvas.height = misionSection.offsetHeight;
        }
        resizeMisionCanvas();

        function createMisionParticle() {
            return {
                x: Math.random() * misionCanvas.width,
                y: Math.random() * misionCanvas.height,
                radius: Math.random() * 1.5 + 0.5,
                color: 'rgba(224, 224, 224, 0.4)', // Partículas grises tenues
                vx: (Math.random() - 0.5) * 0.2, // Deriva muy lenta
                vy: (Math.random() - 0.5) * 0.2,
            };
        }

        function initMisionParticles() {
            misionParticles = [];
            for (let i = 0; i < misionParticleCount; i++) {
                misionParticles.push(createMisionParticle());
            }
        }

        function animateMisionParticles() {
            if (!misionCtx) return;
            misionCtx.clearRect(0, 0, misionCanvas.width, misionCanvas.height);
            misionParticles.forEach(p => {
                // Interacción con el mouse
                if (mouse.x !== undefined) {
                    let dx = p.x - mouse.x;
                    let dy = p.y - mouse.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        p.x += (dx / distance) * force * 1.5;
                        p.y += (dy / distance) * force * 1.5;
                    }
                }

                // Movimiento base
                p.x += p.vx;
                p.y += p.vy;

                // Colisión con los bordes
                if (p.x < 0 || p.x > misionCanvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > misionCanvas.height) p.vy *= -1;

                misionCtx.beginPath();
                misionCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                misionCtx.fillStyle = p.color;
                misionCtx.fill();
            });
            misionAnimationId = requestAnimationFrame(animateMisionParticles);
        }

        const misionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!misionAnimationId) {
                        initMisionParticles();
                        animateMisionParticles();
                    }
                } else {
                    if (misionAnimationId) {
                        cancelAnimationFrame(misionAnimationId);
                        misionAnimationId = null;
                        if (misionCtx) misionCtx.clearRect(0, 0, misionCanvas.width, misionCanvas.height);
                    }
                }
            });
        }, { threshold: 0.1 });

        misionObserver.observe(misionSection);
        window.addEventListener('resize', resizeMisionCanvas);
    }

    // --- LÓGICA DEL MENÚ HAMBURGUESA ---
    const hamburger = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('nav');
    const body = document.body;

    if (hamburger && nav) {
        // Abrir/cerrar el menú principal
        hamburger.addEventListener('click', () => {
            body.classList.toggle('nav-active');
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
        });

        // Manejar clics dentro del menú de navegación
        nav.addEventListener('click', (e) => {
            const target = e.target;
            const isDropdownTrigger = target.matches('.dropdown > a, .dropdown-submenu > a');

            // Si es un enlace de dropdown en móvil, abrir/cerrar submenú
            if (isDropdownTrigger && window.innerWidth <= 768) {
                e.preventDefault(); // Prevenir la navegación para poder abrir el submenú
                const parentLi = target.parentElement;
                parentLi.classList.toggle('open');
            } 
            // Si es un enlace normal (que no sea un trigger de dropdown)
            else if (target.tagName === 'A') {
                // Cerrar el menú si está activo
                if (body.classList.contains('nav-active')) {
                    body.classList.remove('nav-active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }
});

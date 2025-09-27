document.addEventListener('DOMContentLoaded', () => {
    // --- GESTIÓN DE PARTÍCULAS POR SECCIÓN ---
    const globalCanvas = document.getElementById('background-animation');
    const snowCanvas = document.getElementById('snow-canvas');
    const datosSection = document.getElementById('datos-planeta');
    const caractSection = document.getElementById('caracteristicas');
    const heroSection = document.getElementById('hero-mann');
    const enganoSection = document.getElementById('el-engano');
    const confrontacionSection = document.getElementById('la-confrontacion');

    let globalCtx, snowCtx;
    let starParticles = [];
    let snowParticles = [];
    const starParticleCount = 150; // Más estrellas
    const snowParticleCount = 80;
    let snowAnimationId = null;
    const visibleStarSections = new Set();

    // --- LÓGICA PARA ESTRELLAS ESTÁTICAS Y COMETAS (SECCIONES 1, 3, 4 y 5) ---
    let comet = null;
    let cometIntervalId = null;
    let universeAnimationId = null;

    if (globalCanvas) {
        globalCtx = globalCanvas.getContext('2d');
        globalCanvas.width = window.innerWidth;
        globalCanvas.height = window.innerHeight;
        globalCanvas.style.display = 'none'; // Oculto por defecto

        function createStarParticle() {
            return {
                x: Math.random() * globalCanvas.width,
                y: Math.random() * globalCanvas.height,
                radius: Math.random() * 1.2,
                color: 'rgba(220, 220, 220, 0.8)',
            };
        }

        function initStars() {
            starParticles = [];
            for (let i = 0; i < starParticleCount; i++) {
                starParticles.push(createStarParticle());
            }
        }

        function drawStars() {
            if (!globalCtx) return;
            globalCtx.clearRect(0, 0, globalCanvas.width, globalCanvas.height);
            starParticles.forEach(p => {
                globalCtx.beginPath();
                globalCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                globalCtx.fillStyle = p.color;
                globalCtx.fill();
            });
        }

        function createComet() {
            const side = Math.random() > 0.5 ? 'left' : 'right';
            return {
                x: side === 'left' ? -20 : globalCanvas.width + 20,
                y: Math.random() * globalCanvas.height * 0.6, // Parte superior
                radius: 2,
                color: 'rgba(255, 255, 255, 1)',
                vx: (side === 'left' ? 1 : -1) * (Math.random() * 3 + 3), // Velocidad rápida
                vy: Math.random() * 1.5 + 0.5,
                trail: [] // Array para guardar la estela
            };
        }

        function animateUniverse() {
            if (globalCanvas.style.display !== 'block') return;

            globalCtx.clearRect(0, 0, globalCanvas.width, globalCanvas.height);
            drawStars(); // Dibuja las estrellas estáticas en cada frame

            if (comet) {
                // Añade la posición actual a la estela
                comet.trail.push({ x: comet.x, y: comet.y });
                // Limita la longitud de la estela
                if (comet.trail.length > 20) {
                    comet.trail.shift();
                }

                comet.x += comet.vx;
                comet.y += comet.vy;

                // Dibuja la estela
                comet.trail.forEach((p, index) => {
                    const opacity = (index / comet.trail.length) * 0.5;
                    globalCtx.beginPath();
                    globalCtx.arc(p.x, p.y, comet.radius * (index / comet.trail.length), 0, Math.PI * 2);
                    globalCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    globalCtx.fill();
                });

                // Dibuja el cometa
                globalCtx.beginPath();
                globalCtx.arc(comet.x, comet.y, comet.radius, 0, Math.PI * 2);
                globalCtx.fillStyle = comet.color;
                globalCtx.shadowBlur = 15;
                globalCtx.shadowColor = 'white';
                globalCtx.fill();
                globalCtx.shadowBlur = 0; // Resetea la sombra

                // Si el cometa sale de la pantalla, lo elimina
                if (comet.x < -30 || comet.x > globalCanvas.width + 30 || comet.y > globalCanvas.height + 30) {
                    comet = null;
                }
            }
            universeAnimationId = requestAnimationFrame(animateUniverse);
        }

        const starObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    visibleStarSections.add(entry.target);
                } else {
                    visibleStarSections.delete(entry.target);
                }
            });

            if (visibleStarSections.size > 0) {
                if (globalCanvas.style.display !== 'block') {
                    globalCanvas.style.display = 'block';
                    initStars();
                    animateUniverse(); // Inicia el bucle de animación
                    if (!cometIntervalId) {
                        cometIntervalId = setInterval(() => {
                            if (!comet) { // Solo crea un cometa si no hay uno activo
                                comet = createComet();
                            }
                        }, 8000); // Un cometa nuevo cada 8 segundos
                    }
                }
            } else {
                globalCanvas.style.display = 'none';
                if (universeAnimationId) {
                    cancelAnimationFrame(universeAnimationId);
                    universeAnimationId = null;
                }
                if (cometIntervalId) {
                    clearInterval(cometIntervalId);
                    cometIntervalId = null;
                }
                comet = null;
            }
        }, { threshold: 0.01 });

        [heroSection, datosSection, confrontacionSection].forEach(section => {
            if (section) starObserver.observe(section);
        });

        window.addEventListener('resize', () => {
            if (globalCanvas.style.display === 'block') {
                globalCanvas.width = window.innerWidth;
                globalCanvas.height = window.innerHeight;
                initStars();
                // Las estrellas se redibujarán en el bucle de animación
            }
        });
    }

    // --- LÓGICA PARA NIEVE (SECCIÓN 2) ---
    if (snowCanvas && caractSection) {
        snowCtx = snowCanvas.getContext('2d');

        // Objeto para guardar la posición del mouse
        let mouse = {
            x: undefined,
            y: undefined,
            radius: 80 // Radio de influencia
        };

        caractSection.addEventListener('mousemove', (event) => {
            const rect = caractSection.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        });

        caractSection.addEventListener('mouseleave', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        function resizeSnowCanvas() {
            snowCanvas.width = caractSection.offsetWidth;
            snowCanvas.height = caractSection.offsetHeight;
        }
        resizeSnowCanvas();

        function createSnowParticle() {
            return {
                x: Math.random() * snowCanvas.width,
                y: Math.random() * snowCanvas.height,
                radius: Math.random() * 2 + 1,
                color: 'rgba(240, 240, 240, 0.8)',
                vx: (Math.random() - 0.5) * 0.5,
                vy: Math.random() * 1 + 0.5,
            };
        }

        function initSnow() {
            snowParticles = [];
            for (let i = 0; i < snowParticleCount; i++) {
                snowParticles.push(createSnowParticle());
            }
        }

        function animateSnow() {
            if (!snowCtx) return;
            snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
            snowParticles.forEach(p => {
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

                if (p.y > snowCanvas.height + p.radius) {
                    p.y = -p.radius;
                    p.x = Math.random() * snowCanvas.width;
                }
                if (p.x < -p.radius || p.x > snowCanvas.width + p.radius) {
                    p.x = Math.random() * snowCanvas.width;
                }

                snowCtx.beginPath();
                snowCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                snowCtx.fillStyle = p.color;
                snowCtx.fill();
            });
            snowAnimationId = requestAnimationFrame(animateSnow);
        }

        const snowObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!snowAnimationId) {
                        initSnow();
                        animateSnow();
                    }
                } else {
                    if (snowAnimationId) {
                        cancelAnimationFrame(snowAnimationId);
                        snowAnimationId = null;
                        if(snowCtx) snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
                    }
                }
            });
        }, { threshold: 0.1 });

        snowObserver.observe(caractSection);
        window.addEventListener('resize', resizeSnowCanvas);
    }

    // --- ANIMACIÓN DE SCROLL PARA ELEMENTOS GENÉRICOS ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Para que la animación ocurra solo una vez
            }
        });
    }, { threshold: 0.1 });

    const elementsToReveal = document.querySelectorAll('.scroll-reveal');
    elementsToReveal.forEach(el => observer.observe(el));

    // --- ANIMACIÓN DE IMAGEN "PEEKING" (SECCIÓN 3) ---
    const peekingImage = document.querySelector('.peeking-image');
    if (peekingImage && enganoSection) {
        const peekingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    peekingImage.classList.add('is-visible');
                } else {
                    peekingImage.classList.remove('is-visible');
                }
            });
        }, { threshold: 0.3 }); // Se activa cuando el 30% de la sección es visible

        peekingObserver.observe(enganoSection);
    }

    // --- ANIMACIÓN DE IMAGEN "PEEKING" IZQUIERDA (SECCIÓN 3) ---
    const peekingImageLeft = document.querySelector('.peeking-image-left');
    if (peekingImageLeft && enganoSection) {
        const peekingObserverLeft = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    peekingImageLeft.classList.add('is-visible');
                } else {
                    peekingImageLeft.classList.remove('is-visible');
                }
            });
        }, { threshold: 0.3 });
        peekingObserverLeft.observe(enganoSection);
    }

    // --- ANIMACIÓN DEL PLANETA EN LA PRIMERA SECCIÓN ---
    const scrollObject = document.querySelector('.scroll-object');

    if (scrollObject && heroSection) {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const heroHeight = heroSection.offsetHeight;
                    const scrollY = window.scrollY;

                    // Solo animar si estamos dentro de la primera sección
                    if (scrollY < heroHeight) {
                        const progress = scrollY / heroHeight;
                        // Escala de 1 a 1.5 (la mitad del doble de su tamaño)
                        const scale = 1 + progress * 0.5;
                        // La opacidad va de 1 a 0, desapareciendo al final de la sección
                        const opacity = 1 - progress;

                        scrollObject.style.transform = `translateX(-50%) scale(${scale})`;
                        scrollObject.style.opacity = opacity;
                    } else {
                        // Asegurarse de que esté oculto si ya pasamos la sección
                        scrollObject.style.opacity = 0;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // --- ANIMACIÓN DE LA SECCIÓN DE DATOS ---
    if (datosSection) {
        const dataAnimation = anime.timeline({
            autoplay: false,
            easing: 'easeOutExpo'
        })
        .add({
            targets: '.data-point',
            opacity: [0, 1],
            delay: anime.stagger(200)
        })
        .add({
            targets: '.data-point .line',
            scaleX: [0, 1],
            easing: 'easeOutSine',
            delay: anime.stagger(200)
        }, '-=800'); // Se ejecuta casi al mismo tiempo

        const dataObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animación de entrada del planeta
                    anime({
                        targets: '.datos-planeta-img',
                        translateX: ['-100vw', '0vw'],
                        opacity: [0, 0.8],
                        duration: 1200,
                        easing: 'easeOutCubic'
                    });
                    // Animación de entrada de los datos
                    dataAnimation.direction = 'normal';
                    dataAnimation.play();
                } else {
                    // Animación de salida del planeta
                    anime({
                        targets: '.datos-planeta-img',
                        translateX: '-100vw',
                        opacity: 0,
                        duration: 800,
                        easing: 'easeInCubic'
                    });
                    // Animación de salida de los datos (se reproduce en reversa)
                    if (dataAnimation.progress > 0 && dataAnimation.direction === 'normal') {
                        dataAnimation.direction = 'reverse';
                        dataAnimation.play();
                    }
                }
            });
        }, { threshold: 0.5 }); // Se activa cuando el 50% de la sección es visible
        
        dataObserver.observe(datosSection);
    }
});

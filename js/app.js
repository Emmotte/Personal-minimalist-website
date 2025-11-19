// Main application JavaScript
class PortfolioApp {
    constructor() {
        this.p5Instance = null;
        this.typographyCanvas = null;
        this.particles = []; // For p5.js particles
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }

    setupApp() {
        this.setupP5Typography();
        this.setupAnimeJS();
        this.setupEventListeners();
        this.setupCursorParticles(); // Site-wide cursor particles
        this.setupScrollAnimations();
    }

    setupP5Typography() {
        console.log('Setting up P5 typography...');
        
        // Create p5 instance for hero typography and background particles
        const sketch = (p) => {
            let creativeText = "Emmett Tupper";
            let time = 0;
            let particles = []; // Local array for p5 background particles
            const NUM_BACKGROUND_PARTICLES = 100; // Number of background particles

            class Particle {
                constructor(p) {
                    this.p = p;
                    this.x = p.random(p.width);
                    this.y = p.random(p.height);
                    this.vx = p.random(-0.5, 0.5);
                    this.vy = p.random(-0.5, 0.5);
                    this.alpha = p.random(100, 200); // Brighter particles
                    this.radius = p.random(1, 3);
                }

                update() {
                    this.x += this.vx;
                    this.y += this.vy;

                    if (this.x < 0 || this.x > this.p.width) this.vx *= -1;
                    if (this.y < 0 || this.y > this.p.height) this.vy *= -1;
                }

                draw() {
                    this.p.noStroke();
                    this.p.fill(255, this.alpha); // White particles
                    this.p.ellipse(this.x, this.y, this.radius * 2);
                }
            }

            p.setup = () => {
                console.log('P5 setup called');
                const heroSection = document.querySelector('.hero');
                const canvas = p.createCanvas(heroSection.offsetWidth, heroSection.offsetHeight);
                canvas.parent('hero-typography');
                canvas.id('typography-canvas');
                canvas.style('position', 'absolute');
                canvas.style('top', '0');
                canvas.style('left', '0');
                canvas.style('z-index', '1');
                canvas.style('pointer-events', 'none');
                
                p.textAlign(p.CENTER, p.CENTER);
                
                // Hide HTML h1 once p5 is ready
                const htmlH1 = document.querySelector('.hero h1');
                if (htmlH1) {
                    htmlH1.style.opacity = '0';
                    console.log('Hidden HTML h1, P5 text is now active');
                }

                // Initialize background particles
                for (let i = 0; i < NUM_BACKGROUND_PARTICLES; i++) {
                    particles.push(new Particle(p));
                }
            };

            p.draw = () => {
                p.clear();
                time += 0.01;

                // Draw animated typography
                this.drawAnimatedText(p, creativeText, time);
                
                // Update and draw background particles
                for (let i = 0; i < particles.length; i++) {
                    particles[i].update();
                    particles[i].draw();

                    // Connect particles
                    for (let j = i + 1; j < particles.length; j++) {
                        let d = p.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        if (d < 100) { // Connect if within 100 pixels
                            p.stroke(255, p.map(d, 0, 100, 200, 0)); // White lines, fading with distance (increased alpha)
                            p.strokeWeight(0.5);
                            p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        }
                    }
                }

                // Mouse interaction for p5 particles (splatter effect)
                if (p.mouseIsPressed) {
                    const numSplatterParticles = p.floor(p.random(5, 10));
                    for (let i = 0; i < numSplatterParticles; i++) {
                        const size = p.random(3, 8);
                        const angle = p.random(p.TWO_PI);
                        const speed = p.random(1, 5);

                        particles.push({
                            x: p.mouseX,
                            y: p.mouseY,
                            vx: p.cos(angle) * speed,
                            vy: p.sin(angle) * speed,
                            size: size,
                            life: 1 // Life from 1 to 0
                        });
                    }
                }
                // Remove dead particles from the p5 sketch's local array
                for (let i = particles.length - 1; i >= 0; i--) {
                    particles[i].life -= 0.01;
                    if (particles[i].life <= 0) {
                        particles.splice(i, 1);
                    }
                }
            };

            p.windowResized = () => {
                const heroSection = document.querySelector('.hero');
                p.resizeCanvas(heroSection.offsetWidth, heroSection.offsetHeight);
            };
        };

        // Create p5 instance
        this.p5Instance = new p5(sketch);
        
        // Fallback: if p5 doesn't work after 3 seconds, show HTML text
        setTimeout(() => {
            const canvas = document.getElementById('typography-canvas');
            const htmlH1 = document.querySelector('.hero h1');
            if (!canvas && htmlH1) {
                htmlH1.style.opacity = '1';
                console.log('Fallback: Showing HTML text');
            }
        }, 3000);
    }

    drawAnimatedText(p, text, time) {
        const fontSize = Math.min(60, p.width / 12); // Responsive font size
        p.textSize(fontSize);
        p.textStyle(p.BOLD);
        
        const x = p.width / 2;
        const y = p.height / 2 - 120; // Match the CSS transform: translateY(-120px)

        // Draw main text with wave effect
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charX = x - p.textWidth(text) / 2 + (i * fontSize * 0.7);
            const waveOffset = p.sin(time * 2 + i * 0.5) * 15;
            const rotation = p.sin(time * 3 + i * 0.3) * 0.05;
            
            p.push();
            p.translate(charX, y + waveOffset);
            p.rotate(rotation);
            
            // Ensure solid white color
            p.fill(255); 
            p.strokeWeight(1);
            p.stroke(255, 100); // Slightly transparent stroke
            p.text(char, 0, 0);
            p.pop();
        }

        // Draw shadow text for depth
        p.push();
        p.translate(x + 4, y + 4);
        p.fill(255, 50);
        p.noStroke();
        p.text(text, 0, 0);
        p.pop();
    }

    setupAnimeJS() {
        // CTA button scroll to portfolio with Anime.js
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                anime({
                    targets: 'html, body',
                    scrollTop: document.getElementById('photography').offsetTop, // Changed from 'portfolio' to 'photography'
                    duration: 1500,
                    easing: 'easeInOutQuad'
                });
            });
        }

        // Initial animations for non-p5 elements
        anime.timeline({
            easing: 'easeOutExpo'
        })
        .add({
            targets: '.hero-subtitle',
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 1500,
            delay: 1000
        })
        .add({
            targets: '.cta-button',
            scale: [0.8, 1],
            opacity: [0, 1],
            rotateZ: [-0, 0],
            duration: 1200,
            delay: 200
        }, '-=800');

        // CTA button continuous animation - reduced zoom
        anime({
            targets: '.cta-button',
            scale: [1, 1., 1], /* Reduced from 1.05 to 1.02 */
            duration: 2000,
            loop: true,
            easing: 'easeInOutSine',
            direction: 'alternate'
        });
    }

    setupEventListeners() {
        // Mouse move parallax effect
        document.addEventListener('mousemove', (e) => {
            const hero = document.querySelector('.hero-content');
            if (hero) {
                const x = (e.clientX - window.innerWidth / 2) / 50;
                const y = (e.clientY - window.innerHeight / 2) / 50;
                
                anime({
                    targets: '.hero-subtitle',
                    translateX: x * 0.5,
                    translateY: y * 0.5,
                    duration: 1000,
                    easing: 'easeOutQuad'
                });
            }
        });

        // Portfolio item hover effects
        document.querySelectorAll('.portfolio-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                anime({
                    targets: this,
                    translateY: -10,
                    rotateY: 0,
                    scale: 1.02,
                    duration: 600,
                    easing: 'easeOutQuad'
                });
                
                anime({
                    targets: this.querySelector('.portfolio-image img'),
                    scale: 1.1,
                    translateZ: 20,
                    duration: 600,
                    easing: 'easeOutQuad'
                });
            });

            item.addEventListener('mouseleave', function() {
                anime({
                    targets: this,
                    translateY: 0,
                    rotateY: 0,
                    scale: 1,
                    duration: 600,
                    easing: 'easeOutQuad'
                });
                
                anime({
                    targets: this.querySelector('.portfolio-image img'),
                    scale: 1,
                    translateZ: 0,
                    duration: 600,
                    easing: 'easeOutQuad'
                });
            });
        });
    }

    setupCursorParticles() {
        document.addEventListener('mousemove', (e) => {
            const numSplatterParticles = anime.random(5, 10); // Create 5 to 10 particles
            for (let i = 0; i < numSplatterParticles; i++) {
                const particle = document.createElement('div');
                const size = anime.random(3, 8); // Random size for splatter
                const startX = e.clientX - size / 2; // Center particle
                const startY = e.clientY - size / 2; // Center particle

                particle.style.cssText = `
                    position: fixed;
                    left: ${startX}px;
                    top: ${startY}px;
                    width: ${size}px;
                    height: ${size}px;
                    background: white;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    opacity: 0; /* Start invisible */
                `;
                document.body.appendChild(particle);

                const angle = Math.random() * Math.PI * 2; // Random angle for splatter direction
                const distance = anime.random(20, 60); // Random distance to splatter
                const endX = startX + Math.cos(angle) * distance;
                const endY = startY + Math.sin(angle) * distance;

                anime({
                    targets: particle,
                    translateX: [0, endX - startX],
                    translateY: [0, endY - startY],
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    duration: anime.random(500, 1200),
                    easing: 'easeOutCirc',
                    complete: () => particle.remove()
                });
            }
        });
    }

    setupScrollAnimations() {
        let ticking = false;

        function updateAnimationsOnScroll() {
            const scrolled = window.pageYOffset;
            const windowHeight = window.innerHeight;
            
            // Hero parallax with p5 canvas
            const heroContent = document.querySelector('.hero-content');
            const typographyCanvas = document.getElementById('typography-canvas');
            if (heroContent && typographyCanvas) {
                const heroProgress = scrolled / 800;
                anime.set(heroContent, {
                    opacity: 1 - heroProgress
                });
                anime.set(typographyCanvas, {
                    translateY: scrolled * 0.3,
                    opacity: 1 - heroProgress * 0.5
                });
            }

            // Portfolio section 3D parallax
            const portfolioSection = document.querySelector('.portfolio');
            if (portfolioSection) {
                const portfolioRect = portfolioSection.getBoundingClientRect();
                if (portfolioRect.top < windowHeight && portfolioRect.bottom > 0) {
                    const portfolioProgress = (windowHeight - portfolioRect.top) / windowHeight;
                    anime.set(portfolioSection, {
                        translateY: portfolioProgress * 30,
                        rotateY: portfolioProgress * 2 - 1
                    });
                }
            }

            // About section 3D parallax
            const aboutContent = document.querySelector('.about-content');
            if (aboutContent) {
                const aboutRect = aboutContent.getBoundingClientRect();
                if (aboutRect.top < windowHeight && aboutRect.bottom > 0) {
                    const aboutProgress = (windowHeight - aboutRect.top) / windowHeight;
                    anime.set(aboutContent, {
                        translateY: aboutProgress * 20,
                        rotateX: aboutProgress * 3 - 1.5,
                        scale: 0.95 + aboutProgress * 0.05
                    });
                }
            }

            // Contact section 3D parallax
            const contactContent = document.querySelector('.contact-content');
            if (contactContent) {
                const contactRect = contactContent.getBoundingClientRect();
                if (contactRect.top < windowHeight && contactRect.bottom > 0) {
                    const contactProgress = (windowHeight - contactRect.top) / windowHeight;
                    anime.set(contactContent, {
                        translateY: contactProgress * 15,
                        rotateY: contactProgress * 1 - 0.5
                    });
                }
            }

            ticking = false;
        }

        // Optimized scroll handler
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateAnimationsOnScroll);
                ticking = true;
            }
        });

        // Intersection Observer for scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    
                    if (target.classList.contains('portfolio-item')) {
                        anime({
                            targets: target,
                            translateY: [50, 0],
                            rotateX: [15, 0],
                            opacity: [0, 1],
                            scale: [0.9, 1],
                            duration: 1000,
                            easing: 'easeOutQuad',
                            delay: anime.stagger(100, {grid: [14, 5], from: 'center'})
                        });
                    } else if (target.tagName === 'H2') {
                        anime({
                            targets: target,
                            translateY: [30, 0],
                            rotateX: [10, 0],
                            opacity: [0, 1],
                            duration: 1200,
                            easing: 'easeOutExpo'
                        });
                    } else if (target.classList.contains('about-content')) {
                        anime.timeline({
                            easing: 'easeOutExpo'
                        })
                        .add({
                            targets: '.about-text',
                            translateX: [-100, 0],
                            opacity: [0, 1],
                            duration: 1500
                        })
                        .add({
                            targets: '.about-image',
                            translateX: [100, 0],
                            opacity: [0, 1],
                            rotate: [360, 0],
                            duration: 1500
                        }, '-=1000');
                    } else if (target.classList.contains('contact-content')) {
                        anime({
                            targets: '.contact-content > *',
                            translateY: [30, 0],
                            opacity: [0, 1],
                            duration: 1000,
                            delay: anime.stagger(200),
                            easing: 'easeOutQuad'
                        });
                    } else if (target.tagName === 'FOOTER') {
                        anime({
                            targets: target,
                            translateY: [50, 0],
                            opacity: [0, 1],
                            duration: 1000,
                            easing: 'easeOutQuad'
                        });
                    }
                    
                    target.classList.add('visible');
                    observer.unobserve(target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.portfolio-item, .about-content, .contact-content, h2, footer'
        );
        animateElements.forEach(el => {
            observer.observe(el);
        });
    }

}

// Initialize the app
const portfolioApp = new PortfolioApp();
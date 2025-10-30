// Main application JavaScript
class PortfolioApp {
    constructor() {
        this.p5Instance = null;
        this.typographyCanvas = null;
        this.particles = [];
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
        this.setupScrollAnimations();
    }

    setupP5Typography() {
        console.log('Setting up P5 typography...');
        
        // Create p5 instance for hero typography
        const sketch = (p) => {
            let creativeText = "Emmett Tupper";
            let time = 0;

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
                
                // Use default font to avoid loading issues
                p.textAlign(p.CENTER, p.CENTER);
                
                // Hide HTML h1 once p5 is ready
                const htmlH1 = document.querySelector('.hero h1');
                if (htmlH1) {
                    htmlH1.style.opacity = '0';
                    console.log('Hidden HTML h1, P5 text is now active');
                }
            };

            p.draw = () => {
                p.clear();
                time += 0.01;

                // Draw animated typography
                this.drawAnimatedText(p, creativeText, time);
                
                // Update and draw particles
                this.updateParticles(p, time);
                
                // Mouse interaction
                if (p.mouseIsPressed) {
                    this.createMouseParticles(p, p.mouseX, p.mouseY);
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
            
            // Enhanced color animation
            const alpha = 255;
            p.fill(0, alpha);
            p.strokeWeight(1);
            p.stroke(0, alpha * 0.3);
            p.text(char, 0, 0);
            p.pop();
        }

        // Draw shadow text for depth
        p.push();
        p.translate(x + 4, y + 4);
        p.fill(0, 50);
        p.noStroke();
        p.text(text, 0, 0);
        p.pop();
    }

    updateParticles(p, time) {
        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.01;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            p.push();
            p.fill(0, particle.life * 100);
            p.noStroke();
            p.circle(particle.x, particle.y, particle.size);
            p.pop();
        }
    }

    createMouseParticles(p, mx, my) {
        // Create particles at mouse position
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: mx,
                y: my,
                vx: p.random(-3, 3),
                vy: p.random(-3, 3),
                size: p.random(1, 3),
                life: 1
            });
        }
    }

    setupAnimeJS() {
        // CTA button scroll to portfolio with Anime.js
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                anime({
                    targets: 'html, body',
                    scrollTop: document.getElementById('portfolio').offsetTop,
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

        // Floating particles effect
        setInterval(() => this.createParticle(), 2000);
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
        `;
        document.body.appendChild(particle);

        anime({
            targets: particle,
            translateY: [window.innerHeight + 100, -100],
            translateX: () => anime.random(-100, 100),
            opacity: [0, 0.8, 0],
            duration: anime.random(3000, 6000),
            easing: 'linear',
            complete: () => particle.remove()
        });
    }
}

// Initialize the app
const portfolioApp = new PortfolioApp();
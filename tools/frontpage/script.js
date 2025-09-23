// Front page JavaScript for FreeThings.win

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation on scroll for tool cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all tool cards and documentation cards
    const toolCards = document.querySelectorAll('.tool-card');
    const docCards = document.querySelectorAll('#docs .feature-card');
    const allCards = [...toolCards, ...docCards];
    
    allCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add click tracking for tool cards (for analytics)
    const toolCardsClickable = document.querySelectorAll('.tool-card:not(.coming-soon)');
    toolCardsClickable.forEach(card => {
        card.addEventListener('click', function() {
            const toolName = this.querySelector('h3').textContent;
            console.log(`Tool clicked: ${toolName}`);
            
            // You can add analytics tracking here
            // Example: gtag('event', 'tool_click', { tool_name: toolName });
        });
    });

    // Add click tracking for documentation cards (for analytics)
    const docCardsClickable = document.querySelectorAll('#docs .feature-card');
    docCardsClickable.forEach(card => {
        card.addEventListener('click', function() {
            const guideName = this.querySelector('h3').textContent;
            console.log(`Documentation clicked: ${guideName}`);
            
            // You can add analytics tracking here
            // Example: gtag('event', 'doc_click', { guide_name: guideName });
        });
    });

    // Add hover effects for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add typing effect to hero title (optional enhancement)
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }

    // Add parallax effect to hero section (subtle)
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Add tool search functionality (if needed in future)
    function addToolSearch() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search tools...';
        searchInput.className = 'tool-search';
        
        const toolsSection = document.querySelector('.tools-section .container');
        if (toolsSection) {
            const title = toolsSection.querySelector('h2');
            title.insertAdjacentElement('afterend', searchInput);
        }
    }

    // Initialize tool search if needed
    // addToolSearch();

    // Add keyboard navigation for accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

    // Add loading state for tool cards
    function showLoadingState() {
        const toolCards = document.querySelectorAll('.tool-card:not(.coming-soon)');
        toolCards.forEach(card => {
            card.addEventListener('click', function() {
                this.style.opacity = '0.7';
                this.style.pointerEvents = 'none';
                
                // Reset after navigation
                setTimeout(() => {
                    this.style.opacity = '1';
                    this.style.pointerEvents = 'auto';
                }, 1000);
            });
        });
    }

    showLoadingState();

    // Add tool statistics animation
    function animateStats() {
        const stats = document.querySelectorAll('.stat-number, .about-stat-number');
        
        stats.forEach(stat => {
            const finalValue = stat.textContent;
            const isNumber = !isNaN(parseInt(finalValue));
            
            if (isNumber) {
                const targetValue = parseInt(finalValue);
                let currentValue = 0;
                const increment = targetValue / 50;
                
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= targetValue) {
                        stat.textContent = finalValue;
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(currentValue);
                    }
                }, 30);
            }
        });
    }

    // Trigger stats animation when they come into view
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    });

    const heroStats = document.querySelector('.hero-stats');
    const aboutStats = document.querySelector('.about-stats');
    
    if (heroStats) statsObserver.observe(heroStats);
    if (aboutStats) statsObserver.observe(aboutStats);
});

// Add CSS for keyboard navigation
const style = document.createElement('style');
style.textContent = `
    .keyboard-navigation *:focus {
        outline: 2px solid #2563eb !important;
        outline-offset: 2px !important;
    }
    
    .tool-search {
        width: 100%;
        max-width: 400px;
        padding: 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
        margin: 2rem auto;
        display: block;
        transition: border-color 0.3s ease;
    }
    
    .tool-search:focus {
        outline: none;
        border-color: #2563eb;
    }
`;
document.head.appendChild(style);

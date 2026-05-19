const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; });
function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();
document.querySelectorAll('a, button, .project-card, .acard, .process-step, .tag').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); ring.classList.add('hovering'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); ring.classList.remove('hovering'); });
});

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
});

function closeMobile() {
    mobileNav.classList.remove('open');
}

const revealEls = document.querySelectorAll('.reveal');
const projectCards = document.querySelectorAll('.project-card');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => observer.observe(el));

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay) || 0;
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);
            cardObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

projectCards.forEach(card => cardObserver.observe(card));

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

function animateCounter(el, target, suffix = '') {
    let start = 0;
    const duration = 1500;
    const step = timestamp => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const nums = entry.target.querySelectorAll('.stat-number');
            nums.forEach(num => {
                const text = num.textContent;
                if (text.includes('+')) animateCounter(num, parseInt(text), '+');
                else if (text.includes('%')) animateCounter(num, parseInt(text), '%');
                else if (text === 'IA' || text === '48h') return;
            });
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsBand = document.querySelector('.stats-band');
if (statsBand) statObserver.observe(statsBand);

if (window.innerWidth <= 768) {

    const cards = document.querySelectorAll('.acard');
    const aboutSection = document.querySelector('#sobre');

    let started = false;

    function animateCards() {

        cards.forEach(card => {
            card.classList.remove('hide');
        });

        setTimeout(() => {
            cards[0].classList.add('hide');
        }, 4000);

        setTimeout(() => {
            cards[1].classList.add('hide');
        }, 5200);

    }

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting && !started) {

                started = true;

                animateCards();

                setInterval(() => {
                    animateCards();
                }, 10000);

            }

        });

    }, {
        threshold: 0.5
    });

    observer.observe(aboutSection);

}
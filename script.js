const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

function closeMenu(){menuButton.classList.remove('active');nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');document.body.classList.remove('menu-open')}
menuButton.addEventListener('click',()=>{const opening=!nav.classList.contains('open');menuButton.classList.toggle('active',opening);nav.classList.toggle('open',opening);menuButton.setAttribute('aria-expanded',String(opening));menuButton.setAttribute('aria-label',opening?'Close navigation':'Open navigation');document.body.classList.toggle('menu-open',opening)});
navLinks.forEach(link=>link.addEventListener('click',closeMenu));
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>12),{passive:true});

const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -30px'});
document.querySelectorAll('.reveal').forEach((el,index)=>{el.style.transitionDelay=`${Math.min(index%4,3)*60}ms`;observer.observe(el)});

const sections=[...document.querySelectorAll('main section[id]')];
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${entry.target.id}`))}}),{rootMargin:'-35% 0px -55%'});
sections.forEach(section=>sectionObserver.observe(section));

const typeSelect=document.querySelector('#requirement-type');
const choiceButtons=[...document.querySelectorAll('[data-inquiry-choice]')];
function chooseInquiry(value){typeSelect.value=value;choiceButtons.forEach(button=>button.classList.toggle('active',button.dataset.inquiryChoice===value))}
choiceButtons.forEach(button=>button.addEventListener('click',()=>chooseInquiry(button.dataset.inquiryChoice)));
document.querySelectorAll('[data-inquiry]').forEach(link=>link.addEventListener('click',()=>chooseInquiry(link.dataset.inquiry)));
typeSelect.addEventListener('change',()=>choiceButtons.forEach(button=>button.classList.toggle('active',button.dataset.inquiryChoice===typeSelect.value)));

document.querySelector('#contact-form').addEventListener('submit',event=>{event.preventDefault();const note=event.currentTarget.querySelector('.form-note');note.textContent='Thanks — this preview is ready to connect to your preferred form service or backend.';note.classList.add('success')});
document.querySelector('#year').textContent=new Date().getFullYear();

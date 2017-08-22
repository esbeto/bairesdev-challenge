/**
 * Smooth scroll function
 * It uses a default cubic easing function and a default duration of 600 ms
 *
 * Browser Support:
 * http://caniuse.com/#feat=requestanimationframe
 */
function scrollTo(destination, targetId) {
    const start = window.pageYOffset;

    const startTime = 'now' in window.performance ?
        performance.now() :
        new Date().getTime();

    const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight);

    const windowHeight = window.innerHeight ||
        document.documentElement.clientHeight ||
        document.getElementsByTagName('body')[0].clientHeight;

    const destinationBounds = destination.getBoundingClientRect();

    const destinationOffset = destinationBounds.top + window.pageYOffset;

    const destinationOffsetToScroll = Math.round(
        documentHeight - destinationOffset < windowHeight ?
            documentHeight - windowHeight :
            destinationOffset);

    if ('requestAnimationFrame' in window === false) {
        window.scroll(0, destinationOffsetToScroll);
        window.location.hash = targetId;
        return;
    }

    function scroll() {
        const now = 'now' in window.performance ?
            performance.now() :
            new Date().getTime();

        const time = Math.min(1, ((now - startTime) / 600));

        const timeFunction = function(t) {
            // Ease-In-Out cubic function from d3js
            // (We stand on the shoulders of giants)
            // https://github.com/d3/d3-ease/blob/master/src/cubic.js
            return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
        };

        const pageYOffset = Math.round(window.pageYOffset + 1);

        window.scroll(0, Math.ceil((timeFunction(time) * (destinationOffsetToScroll - start)) + start));

        if (pageYOffset >= destinationOffsetToScroll) {
            window.location.hash = targetId;
            return;
        }

        requestAnimationFrame(scroll);
    }

    scroll();
}

/**
 * Semantically link to the scrollTo function
 */
function navigateTo(targetId) {
    const element = document.querySelector(targetId);
    const sourceLink = document.querySelector('[href="' + targetId + '"]');
    const panelLinks = document.querySelectorAll('.panel nav a');

    for (let i = 0; i < panelLinks.length ; i++) {
        panelLinks[i].classList.remove('active');
    }

    sourceLink.classList.add('active');

    scrollTo(element, targetId);
}

/**
 * Prevent Safari double scroll
 */
function preventDefaultBehavior(event) {
    event.preventDefault();
}

const panelLinks = document.querySelectorAll('.panel nav a');

for (let i = 0; i < panelLinks.length ; i++) {
    panelLinks[i].addEventListener('click', preventDefaultBehavior, false);
}

/**
 * Scrolling function for sticky section headers
 */
function scrollBrain() {
    const pageYOffset = Math.round(window.pageYOffset + 1);
    for (let i = 0; i < articles.length ; i++) {
        const articleHeader = articles[i].querySelector('header');
        const articleHeaderBounds = articleHeader.getBoundingClientRect();
        const articleBounds = articles[i].getBoundingClientRect();
        const articleOffset = Math.round(articleBounds.top + window.pageYOffset);
        const articleBottom = Math.round(articleOffset + articleBounds.height - articleHeaderBounds.height);
        articleHeader.style.width = articleBounds.width + 'px';

        if (pageYOffset >= articleOffset && pageYOffset <= articleBottom) {
            articleHeader.classList.add('fixed');
        } else {
            articleHeader.classList.remove('fixed');
        }
    }
}

// window.addEventListener("scroll", scrollBrain, false);

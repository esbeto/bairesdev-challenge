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

        const currentPosition = Math.ceil((timeFunction(time) * (destinationOffsetToScroll - start)) + start);

        window.scroll(0, currentPosition);

        const approximation = Math.abs(currentPosition - destinationOffsetToScroll);

        if (approximation < 2) {
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
    const sourceLinks = document.querySelectorAll('[href="' + targetId + '"]');
    const panelLinks = document.querySelectorAll('.panel nav a');

    for (let i = 0; i < panelLinks.length ; i++) {
        panelLinks[i].classList.remove('active');
    }

    for (let i = 0; i < sourceLinks.length ; i++) {
        sourceLinks[i].classList.add('active');
    }

    scrollTo(element, targetId);
}

/**
 * Prevent Safari double scroll
 */
function preventSafariDoubleScroll() {
    const panelLinks = document.querySelectorAll('.panel nav a');

    for (let i = 0; i < panelLinks.length ; i++) {
        panelLinks[i].addEventListener('click', function(event) {
            event.preventDefault();
        }, true);
    }
}

/**
 * Copy the header to prevent jagged scrolling effect
 */
function prepareStickyHeader() {
    const articles = document.querySelectorAll('.panel');

    for (let i = 0; i < articles.length ; i++) {
        const articleHeader = articles[i].querySelector('header');
        const firstSection = articles[i].querySelector('section');
        const articleStickyHeader = articleHeader.cloneNode(true);

        articleStickyHeader.classList.add('sticky');

        articles[i].insertBefore(articleStickyHeader, firstSection);
    }
}

/**
 * Scrolling function for sticky section headers
 */
function scrollBrain() {
    const pageYOffset = Math.round(window.pageYOffset + 1);
    const articles = document.querySelectorAll('.panel');

    for (let i = 0; i < articles.length ; i++) {
        const articleHeader = articles[i].querySelector('header');
        const articleHeaderBounds = articleHeader.getBoundingClientRect();
        const articleStickyHeader = articles[i].querySelector('.sticky');
        const articleStickyHeaderBounds = articleStickyHeader.getBoundingClientRect();
        const articleBounds = articles[i].getBoundingClientRect();
        // Just enough height to show the sticky header when navigating to the first menu item
        const articleOffset = Math.round(
            articleBounds.top + articleHeaderBounds.height +
            window.pageYOffset - articleStickyHeaderBounds.height
        );
        // Just enough height to hide the sticky header when leaving the panel
        const articleBottom = Math.round(
            articleOffset + articleBounds.height -
            articleHeaderBounds.height - articleStickyHeaderBounds.height
        );

        // Position fixed isn't aware of parent's width, so it is set here
        articleStickyHeader.style.width = articles[i].clientWidth + 'px';

        if (pageYOffset >= articleOffset && pageYOffset <= articleBottom) {
            articleStickyHeader.classList.add('active');
        } else {
            articleStickyHeader.classList.remove('active');
        }
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    // Preparations
    preventSafariDoubleScroll();
    prepareStickyHeader();

    // Scrolling Behavior
    window.addEventListener('scroll', scrollBrain, false);
    window.addEventListener('resize', scrollBrain, false);
});
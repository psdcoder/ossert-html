const supportPageOffset = window.pageXOffset !== undefined;
const isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
const header = document.getElementById('sticky-project-header');
const fixed = header.querySelector('.gem-header__fixed');

export function onScroll() {
    const windowScroll = getWindowScroll();
    const fix = (header.offsetTop + header.offsetHeight + 15) < windowScroll;

    fixed.classList.toggle('gem-header__fixed_hidden', !fix);
}

function getWindowScroll() {
    return supportPageOffset
        ? window.pageYOffset
        : (isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop);
}
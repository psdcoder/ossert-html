const supportPageOffset = window.pageXOffset !== undefined;
const isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
const header = document.getElementById('sticky-project-header');

export function onScroll() {
    const windowScroll = getWindowScroll();
    const fix = header.offsetTop < windowScroll;

    if (fix) {
        header.style.height = header.clientHeight + 'px';
        header.classList.add('gem-header_sticky');
    } else {
        header.style.height = 'auto';
        header.classList.remove('gem-header_sticky');
    }
}

function getWindowScroll() {
    return supportPageOffset
        ? window.pageYOffset
        : (isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop);
}
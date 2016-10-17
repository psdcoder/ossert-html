import $ from 'jquery';
const $header = $('#sticky-project-header');
const $fixed = $header.find('.gem-header__fixed');

const $document = $(document);

export function onScroll() {
  const fix = ($header.offset().top + $header.height() + 15) < $document.scrollTop();

  $fixed.toggleClass('gem-header__fixed_hidden', !fix);
}

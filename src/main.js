import $ from 'jquery';
import rafThrottle from 'raf-throttle';
import { onScroll } from './blocks/gem-header';
import { init as helpTooltipInit } from './blocks/help-tooltip';
import { draw } from './blocks/gem-stats-chart';
import { smoothAnchorScrolling } from './blocks/link';
import { isMobileView } from './blocks/utils';

$(() => {
  $(window).on('scroll', rafThrottle(onScroll));
  onScroll();

  smoothAnchorScrolling();

  if (!isMobileView()) {
    helpTooltipInit();
  }

  $('.gem-stats-chart').each(function onEachChart() {
    draw(this, $(this).data('columns'));
  });
});

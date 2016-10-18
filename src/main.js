import $ from 'jquery';
import rafThrottle from 'raf-throttle';
import { onScroll } from './blocks/gem-header';
import { init as helpTooltipInit } from './blocks/help-tooltip';
import { draw } from './blocks/gem-stats-chart';
import { smoothAnchorScrolling } from './blocks/link';

$(() => {
  $(window).on('scroll', rafThrottle(onScroll));

  smoothAnchorScrolling();

  helpTooltipInit();

  $('.gem-stats-chart').each(function onEachChart() {
    draw(this, $(this).data('columns'));
  });
});

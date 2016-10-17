import $ from 'jquery';
import rafThrottle from 'raf-throttle';
import { onScroll } from './blocks/gem-header';
import { init as helpTooltipInit } from './blocks/help-tooltip';

$(() => {
  $(window).on('scroll', rafThrottle(onScroll));
  helpTooltipInit();
});

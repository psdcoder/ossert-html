import rafThrottle from 'raf-throttle';
import { onScroll } from './blocks/gem-header';

window.addEventListener('scroll', rafThrottle(onScroll));
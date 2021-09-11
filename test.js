import { dom } from './test/index.js';

const dumpEventData = title => e => {
    console.group(title);
    console.log('Handler attached to:', e.handlerAttachedToElement);
    console.log('Handler triggered by:', e.handlerTriggeredByElement);
    console.log('Handler child selector:', e.handlerChildSelector);
    console.log('Handler element:', e.handlerElement);
    console.groupEnd();
};

const main = dom('#main');

main.on('click', dumpEventData('#main click'));

main.onchild('.button', 'click', dumpEventData('#main .button click'));

main.onchild('[name^=select]', 'change', dumpEventData('#main [name^=select] change 1'));

main.onchild('[name^=select]', 'change', dumpEventData('#main [name^=select] change 2'));

dom('#button2').on('click', dumpEventData('#button2 click'));

window.dom = dom;
window.main = main;

// document.addEventListener('click', e => {
//     console.log(e.currentTarget);
//     console.log(e.target);
// });

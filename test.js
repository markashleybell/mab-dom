import { dom } from './test/index.js';

window.dom = dom;

const main = dom('#main');

main.on('click', e => {
    console.log('TOP');
});

main.onchild('.button', 'click', e => {
    console.log(e);
});

main.onchild('[name^=select]', 'change', e => {
    console.log(e);
});

main.onchild('[name^=select]', 'change', e => {
    console.log('TEST');
});

window.main = main;

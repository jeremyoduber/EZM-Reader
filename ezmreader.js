/*

    HTML5 Reader for Electric Zine Maker, made by Jeremy Oduber in 2019 and 2020
    v20.4
    Me:
        https://twitter.com/JeremyOduber
    This:
        https://jeremyoduber.itch.io/js-zine
    Electric Zine Maker: 
        https://alienmelon.itch.io/electric-zine-maker
    
*/

//---- USER OPTIONS ----//
const TEMPLATE = 1; // Change this value to set the template
/*  
    Available templates:
        1: 8 page folded zine or z-fold (default)
        2: 18 page square accordion 
        3: 16 page mini-booklet
        4: 16 page micro-mini
*/
const BGCOLOR = '#f5f5f5'; // Change this hex value to set the background color.
//---- END USER OPTIONS ----//

// Setup constants and variables
const FOV = 45;
const LOADING_OVERLAY = document.querySelector('#loading');
let card_amount;
let current_state = 0;
let textures = [];
let pages = [];

document.body.style.background = BGCOLOR;

function getTextures(num) {
    return ['pages/FRONT.png', 'pages/INNERFRONT.png'].concat(
        new Array(num).fill().map((_, idx) => 'pages/' + (idx + 1) + '.png'),
        ['pages/BACK.png']
    );
}

// Select template
switch (TEMPLATE) {
    default:
    case 1:
        card_amount = 4;
        textures = getTextures(5);
        break;
    case 2:
        card_amount = 9;
        textures = getTextures(15);
        break;
    case 3:
    case 4:
        card_amount = 8;
        textures = getTextures(13);
        break;
}

// Preloader
Promise.all(
    textures.map(
        src =>
            new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
                img.alt = src.split('/')[1].split('.')[0];
            })
    )
)
    .then(imgs => {
        LOADING_OVERLAY.remove();
        const list = document.createElement('ul');
        pages = imgs.map((img, idx) => {
            const li = document.createElement('li');
            const flip = idx % 2;
            li.className = 'depth-' + Math.min(2, idx);
            li.style.transform = 'translateX(100%) rotateY(0deg) scaleZ(' + (flip ? -1 : 1) + ')';
            li.appendChild(img);
            list.appendChild(li);
            return li;
        });
        document.body.appendChild(list);

        function updatePerspective() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            list.style.perspective = Math.sqrt(((w / 2) * w) / 2 + ((h / 2) * h) / 2) / Math.tan(((FOV / 2) * Math.PI) / 180) + 'px';
        }

        window.addEventListener('resize', updatePerspective);
        updatePerspective();
    })
    .catch(error => {
        console.error(error);
        LOADING_OVERLAY.textContent = 'Something went wrong! See console for details.';
    });

// Keyboard input
document.addEventListener('keyup', function onKeyUp(key) {
    if (key.key === 'ArrowLeft' || key.key === 'a') {
        flipLeft();
    } else if (key.key === 'ArrowRight' || key.key === 'd') {
        flipRight();
    }
});

// Mouse input
document.addEventListener('pointerup', function onPointerUp(event) {
    if (event.button !== 0) return;
    if (event.clientX < window.innerWidth / 2) {
        flipRight();
    } else {
        flipLeft();
    }
});

function getPages(state) {
    return [pages[state * 2], pages[state * 2 + 1]].filter(i => i);
}
function replaceTransformPerPage(state, search, replace) {
    getPages(state).forEach(page => {
        page.style.transform = page.style.transform.replace(search, replace);
    });
}
function setDepth(state, depth) {
    getPages(state).forEach(page => {
        page.className = page.className.replace(/depth-\d+/, 'depth-' + Math.min(depth, 2));
    });
}

// Flip page left
function flipLeft() {
    if (current_state >= card_amount) return;
    replaceTransformPerPage(current_state, '0deg', '-180deg');
    setDepth(current_state - 1, 1);
    setDepth(current_state - 2, 2);
    setDepth(current_state + 1, 0);
    setDepth(current_state + 2, 1);
    ++current_state;
}

// Flip page right
function flipRight() {
    if (current_state <= 0) return;
    replaceTransformPerPage(current_state - 1, '-180deg', '0deg');
    setDepth(current_state - 3, 1);
    setDepth(current_state - 2, 0);
    setDepth(current_state + 1, 2);
    setDepth(current_state, 1);
    --current_state;
}

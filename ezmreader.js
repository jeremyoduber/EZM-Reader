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
const TEMPLATE = 1;         // Change this value to set the template
/*  
    Available templates:
        1: 8 page folded zine or z-fold (default)
        2: 18 page square accordion 
        3: 16 page mini-booklet
        4: 16 page micro-mini
*/
const BGCOLOR = 0xf5f5f5;   // Change this hex value to set the background color.
//---- END USER OPTIONS ----//


// Setup constants and variables
const FOV = 45;
const HEIGHT = 650;
const VFOV = FOV * (Math.PI / 180);
const MANAGER = new THREE.LoadingManager();
const LOADER = new THREE.TextureLoader(MANAGER);
const LOADING_OVERLAY = document.querySelector('#loading');
let card_size = new THREE.Vector2();
let card_amount;
let current_state = 0;
let textures = [];
let cards = [];
let texture_count = -1;


// Three.js intitalization
let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(BGCOLOR);
document.body.appendChild(renderer.domElement);
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(FOV, window.innerWidth/window.innerHeight, 1, 2000);
camera.position.z = HEIGHT / (2* Math.tan(VFOV / 2) );
camera.lookAt(scene.position);
window.addEventListener('resize', function()
{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
});


// Preloader
MANAGER.onLoad = function () {
    LOADING_OVERLAY.remove();
}

function getTextures(num) {
    return ['pages/FRONT.png', 'pages/INNERFRONT.png'].concat(new Array(num).fill().map((_, idx) => 'pages/' + (idx + 1) + '.png'), ['pages/BACK.png']);
}

// Select template
switch(TEMPLATE){
    default:
    case 1:
        card_size.set(421, 595);
        card_amount = 4; 
        textures = getTextures(5);
        break;
    case 2:
        card_size.set(421, 421);
        card_amount = 9;
        textures = getTextures(15);
        break;
    case 3:
        card_size.set(421, 595);
        card_amount = 8;
        textures = getTextures(13);
        break;
    case 4:
        card_size.set(306, 396)
        card_amount = 8;
        textures = getTextures(13);
        break;
}


// Create cards
for (let a=0; a < card_amount; a++){

    let card_front_geo = new THREE.PlaneGeometry(card_size.x, card_size.y);
    let card_back_geo = new THREE.PlaneGeometry(card_size.x, card_size.y);
    card_back_geo.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));
    texture_count += 1;
    let card_front_tex = LOADER.load(textures[texture_count]);
    card_front_tex.minFilter = THREE.LinearFilter;
    texture_count += 1;
    let card_back_tex = LOADER.load(textures[texture_count]);
    card_back_tex.minFilter = THREE.LinearFilter;
    let card_front_mat = new THREE.MeshBasicMaterial({map: card_front_tex});
    let card_back_mat = new THREE.MeshBasicMaterial({map: card_back_tex});
    card_front_mesh = new THREE.Mesh(card_front_geo, card_front_mat);
    card_front_mesh.position.x = card_size.x / 2;
    card_back_mesh = new THREE.Mesh(card_back_geo, card_back_mat);
    card_back_mesh.position.x = card_size.x / 2;
    let card = new THREE.Object3D();
    
    card.add(card_front_mesh);
    card.add(card_back_mesh);
    
    if (a == 0){
        card.position.z = 0;
    } else if (a == 1){
        card.position.z = -1;
    } else {
        card.position.z = -2;
    }

    cards.push(card);
    scene.add(card);
}

function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


// Keyboard input
document.addEventListener('keyup', function onKeyUp(key){
    if (key.key === 'ArrowLeft' || key.key === 'a'){
        flipLeft();
    } else if (key.key === 'ArrowRight' || key.key === 'd'){
        flipRight();
    }
});

// Mouse input
document.addEventListener("pointerup", function onPointerUp(event){
    if (event.button !== 0) return;
    if (event.clientX < window.innerWidth / 2) {
        flipRight();
    } else {
        flipLeft();
    }
});

// Flip page left
function flipLeft(){

    if (current_state < card_amount){
        
        gsap.to(cards[current_state].rotation, {duration: .8, y: -Math.PI, ease: "power2.inOut"});
        
        if (current_state > 0){
            gsap.to(cards[current_state - 1].position, {duration: .3, z: -1});
        }
        
        if (current_state > 1){
            gsap.to(cards[current_state - 2].position, {duration: .3, z: -2});            
        }
        
        if (current_state < card_amount - 1){
            gsap.to(cards[current_state + 1].position, {duration: .3, z: 0});        
        }
        
        if (current_state < card_amount - 2 ){
            gsap.to(cards[current_state + 2].position, {duration: .3, z: -1});            
        }
        
        current_state += 1;
        
    }
}

// Flip page right
function flipRight(){
    
     if (current_state > 0){

        gsap.to(cards[current_state - 1].rotation, {duration: .8, y: 0, ease: "power2.inOut"});
        
        if (current_state > 2){
            gsap.to(cards[current_state -3].position, {duration: .3, z: -1});
        }

        if (current_state > 1){
            gsap.to(cards[current_state - 2].position, {duration: .3, z: 0});
        }

        if (current_state < card_amount - 1){
            gsap.to(cards[current_state + 1].position, {duration: .3, z: -2});
        }

        if (current_state < card_amount){
            gsap.to(cards[current_state].position, {duration: .3, z: -1});
        }
       
        current_state -= 1;
        
    }
}

// Animate, I guess.
animate(); 
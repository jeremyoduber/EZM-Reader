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
let mouse = new THREE.Vector2;
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
    LOADING_OVERLAY.classList.add('loading-hidden');
}


// Select template
switch(TEMPLATE){
    case 1: 
        card_size.set(421, 595);
        card_amount = 4; 
        textures = ['pages/FRONT.png', 'pages/INNERFRONT.png', 'pages/1.png', 'pages/2.png', 'pages/3.png', 'pages/4.png', 'pages/5.png', 'pages/BACK.png'];
        break;
    case 2:
        card_size.set(421, 421);
        card_amount = 9;
        textures = ['pages/FRONT.png', 'pages/INNERFRONT.png', 'pages/1.png', 'pages/2.png', 'pages/3.png', 'pages/4.png', 'pages/5.png', 'pages/6.png', 'pages/7.png', 
        'pages/8.png', 'pages/9.png', 'pages/10.png', 'pages/11.png', 'pages/12.png', 'pages/13.png', 'pages/14.png', 'pages/15.png', 'pages/BACK.png'];
        break;
    case 3:
        card_size.set(421, 595);
        card_amount = 8;
        textures = ['pages/FRONT.png', 'pages/INNERFRONT.png', 'pages/1.png', 'pages/2.png', 'pages/3.png', 'pages/4.png', 'pages/5.png', 'pages/6.png', 'pages/7.png', 
        'pages/8.png', 'pages/9.png', 'pages/10.png', 'pages/11.png', 'pages/12.png', 'pages/13.png', 'pages/BACK.png'];
        break;
    case 4:
        card_size.set(306, 396)
        card_amount = 8;
        textures = ['pages/FRONT.png', 'pages/INNERFRONT.png', 'pages/1.png', 'pages/2.png', 'pages/3.png', 'pages/4.png', 'pages/5.png', 'pages/6.png', 'pages/7.png', 
        'pages/8.png', 'pages/9.png', 'pages/10.png', 'pages/11.png', 'pages/12.png', 'pages/13.png', 'pages/BACK.png'];
        break;
    default:
        card_size.set(421, 595);
        card_amount = 4;
        textures = ['pages/FRONT.png', 'pages/INNERFRONT.png', 'pages/1.png', 'pages/2.png', 'pages/3.png', 'pages/4.png', 'pages/5.png', 'pages/BACK.png'];

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


// Create hitboxes for mouse control
let hitbox_geo = new THREE.PlaneGeometry(card_size.x/2, card_size.y);
let hitbox_mat = new THREE.MeshBasicMaterial({color: 0xf8f800});
hitbox_mat.transparent = true;
hitbox_mat.opacity = 0;
let hitbox_right_mesh = new THREE.Mesh(hitbox_geo, hitbox_mat);
hitbox_right_mesh.position.x = (card_size.x / 4) * 3;
hitbox_right_mesh.position.z = 1;
let hitbox_left_mesh = new THREE.Mesh(hitbox_geo, hitbox_mat);
hitbox_left_mesh.position.x = -(card_size.x / 4) * 3;
hitbox_left_mesh.position.z = 1;

scene.add(hitbox_right_mesh);
scene.add(hitbox_left_mesh);

function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


// Keyboard input
document.addEventListener('keyup', keyInput);

function keyInput(key){

    if (key.keyCode === 65 || key.keyCode === 37){
        flipLeft();
    }
    if (key.keyCode === 68 || key.keyCode === 39){
        flipRight();
    }
    
}


// Mouse input
let raycaster = new THREE.Raycaster();
document.addEventListener("mouseup", raycast, false);

function raycast(event){
    
    mouse.x = (event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects( scene.children );

	for ( let i = 0; i < intersects.length; i++ ){
        let intersected = intersects[0].object;

        if (intersected == hitbox_left_mesh){
            flipRight();
        } else if (intersected == hitbox_right_mesh){
            flipLeft();
        }
    }
}


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
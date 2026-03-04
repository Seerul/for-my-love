import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RectAreaLight } from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'



const scene = new THREE.Scene()
const loadingManager = new THREE.LoadingManager()

const textureLoader = new THREE.TextureLoader()
const modelLoader = new GLTFLoader()

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

const hoverables = []
const allowedNames = ['car', 'nezuko', 'capybara', 'Fountain_Pen']

modelLoader.load(
    "public/Models/main.glb",
    (gltf) => {
        
        const main = gltf.scene;
        main.scale.set(2, 2, 2);
        main.position.set(0, -2.5, 0); 
        main.rotation.y = Math.PI; 
        
        gltf.scene.traverse((child) => {
            
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true; // optional if you want screen parts to catch shadows too
                console.log(child.name);
            }
            if (child.isMesh && allowedNames.some(str => child.name.includes(str))) {
                console.log(child.name);
            }
        });

        scene.add(main);            
    },
    undefined,
    (error) => {
        console.log('Error loading GLB:', error)
    }
)

const sizes = {
    width: document.documentElement.clientWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height)
camera.position.z = 1      

const lamp = new THREE.PointLight(0xf2b968, 3)
lamp.castShadow = true;
lamp.shadow.mapSize.set(1024, 1024)
lamp.shadow.radius = 4;           // softens shadow edges
lamp.shadow.bias = -0.001;        // prevents shadow acne
lamp.shadow.camera.near = 0.1;    
lamp.shadow.camera.far = 20;      // make sure far covers desk + monitor
lamp.position.set(-1.5, 0.9, -0.5)

const lamp2 = lamp.clone()
lamp2.intensity = 10
lamp2.position.set(4, 3, -0.5)

const lamp3 = lamp.clone()
lamp3.position.set(0, 1.5, 1)
lamp3.intensity = 5

scene.add(lamp2, lamp3)




const screen = new RectAreaLight(0xd9f3ff, 1, 1.6, 0.7) 
screen.position.set(0, -0.9, -0.7)
screen.rotation.x = Math.PI; // rotate 180° on X




const ambient = new THREE.AmbientLight(0x1d006e, 0.3) 
scene.add(ambient, lamp)

scene.fog = new THREE.Fog(0x0a0a1a, 5, 15)

const canvas = document.querySelector('canvas.webgl')

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})



renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor(0x0a0a1a)
renderer.shadowMap.enabled = true   
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.physicallyCorrectLights = true
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
renderer.render(scene, camera)

const controls = new PointerLockControls(camera, document.body)
scene.add(camera)

window.addEventListener('click', onPointer)
window.addEventListener('touchstart', onPointer)

function onPointer(event) {
    controls.lock()
    const x = event.clientX || event.touches[0].clientX
    const y = event.clientY || event.touches[0].clientY

    pointer.x = (x / window.innerWidth) * 2 - 1
    pointer.y = -(y / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
        //
    }
}

                    
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}

animate()
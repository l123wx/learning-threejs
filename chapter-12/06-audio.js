/** @type {import('../types/three')} */

var container
var camera, controls, scene, renderer
var light, pointLight

var mesh
var material_sphere1, material_sphere2

var clock = new THREE.Clock()

init()
animate()

function init() {
    container = document.getElementById('container')

    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        1,
        10000
    )
    camera.position.set(-200, 25, 0)

    var listener1 = new THREE.AudioListener()
    camera.add(listener1)
    var listener2 = new THREE.AudioListener()
    camera.add(listener2)
    var listener3 = new THREE.AudioListener()
    camera.add(listener3)

    controls = new THREE.FirstPersonControls(camera)

    controls.movementSpeed = 70
    controls.lookSpeed = 0.15
    controls.noFly = true
    controls.lookVertical = false

    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.0035)

    light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0, 0.5, 1).normalize()
    scene.add(light)

    var cube = new THREE.BoxGeometry(40, 40, 40)

    var material_1 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: THREE.ImageUtils.loadTexture('../assets/textures/animals/cow.png')
    })

    var material_2 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: THREE.ImageUtils.loadTexture('../assets/textures/animals/dog.jpg')
    })

    var material_3 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: THREE.ImageUtils.loadTexture('../assets/textures/animals/cat.jpg')
    })

    // sound spheres

    var mesh1 = new THREE.Mesh(cube, material_1)
    mesh1.position.set(0, 20, 100)
    var mesh2 = new THREE.Mesh(cube, material_2)
    mesh2.position.set(0, 20, 0)
    var mesh3 = new THREE.Mesh(cube, material_3)
    mesh3.position.set(0, 20, -100)

    scene.add(mesh1)
    scene.add(mesh2)
    scene.add(mesh3)

    var sound1 = new THREE.Audio(listener1)
    sound1.load('../assets/audio/cow.ogg')
    sound1.setRefDistance(20)
    sound1.setLoop(true)
    sound1.setRolloffFactor(2)
    mesh1.add(sound1)

    var sound2 = new THREE.Audio(listener2)
    sound2.load('../assets/audio/dog.ogg')
    sound2.setRefDistance(20)
    sound2.setLoop(true)
    sound2.setRolloffFactor(2)
    mesh2.add(sound2)

    var sound3 = new THREE.Audio(listener3)
    sound3.load('../assets/audio/cat.ogg')
    sound3.setRefDistance(20)
    sound3.setLoop(true)
    sound3.setRolloffFactor(2)
    mesh3.add(sound3)

    // ground

    var helper = new THREE.GridHelper(500, 10)
    helper.color1.setHex(0x444444)
    helper.color2.setHex(0x444444)
    helper.position.y = 0.1
    scene.add(helper)

    //

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)

    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    //

    window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)

    controls.handleResize()
}

function animate() {
    requestAnimationFrame(animate)
    render()
}

function render() {
    var delta = clock.getDelta(),
        time = clock.getElapsedTime() * 5

    controls.update(delta)

    //        material_sphere1.color.setHSL( 0.0, 0.3 + 0.7 * ( 1 + Math.cos( time ) ) / 2, 0.5 );
    //        material_sphere2.color.setHSL( 0.1, 0.3 + 0.7 * ( 1 + Math.sin( time ) ) / 2, 0.5 );

    renderer.render(scene, camera)
}

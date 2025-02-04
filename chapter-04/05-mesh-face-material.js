/** @type {import('../types/three')} */

// once everything is loaded, we run our Three.js stuff.
function init() {
    var stats = initStats()

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene()

    // create a camera, which defines where we're looking at.
    var camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )

    // create a render and set the size
    var renderer = new THREE.WebGLRenderer()

    renderer.setClearColor(new THREE.Color(0xeeeeee, 1.0))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMapEnabled = false

    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1)
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
    var plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.receiveShadow = true

    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI
    plane.position.x = 0
    plane.position.y = -2
    plane.position.z = 0

    // add the plane to the scene
    scene.add(plane)

    // position and point the camera to the center of the scene
    camera.position.x = -40
    camera.position.y = 40
    camera.position.z = 40
    camera.lookAt(scene.position)

    // add subtle ambient lighting
    //        var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    //        scene.add(ambientLight);

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(-40, 60, -10)
    spotLight.castShadow = true
    scene.add(spotLight)

    // add the output of the renderer to the html element
    document.getElementById('WebGL-output').appendChild(renderer.domElement)

    var group = new THREE.Mesh()
    // add all the rubik cube elements
    var mats = []
    mats.push(new THREE.MeshBasicMaterial({ color: 0x009e60 }))
    mats.push(new THREE.MeshBasicMaterial({ color: 0x009e60 }))
    mats.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }))
    mats.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }))
    mats.push(new THREE.MeshBasicMaterial({ color: 0xffd500 }))
    mats.push(new THREE.MeshBasicMaterial({ color: 0xffd500 }))
    mats.push(new THREE.MeshBasicMaterial({ color: 0xff5800 }))
    mats.push(new THREE.MeshBasicMaterial({ color: 0xff5800 }))
    mats.push(new THREE.MeshBasicMaterial({ color: 0xc41e3a }))
    mats.push(new THREE.MeshBasicMaterial({ color: 0xc41e3a }))
    mats.push(new THREE.MeshBasicMaterial({ color: 0xffffff }))
    mats.push(new THREE.MeshBasicMaterial({ color: 0xffffff }))

    var faceMaterial = new THREE.MeshFaceMaterial(mats)

    for (var x = 0; x < 3; x++) {
        for (var y = 0; y < 3; y++) {
            for (var z = 0; z < 3; z++) {
                var cubeGeom = new THREE.BoxGeometry(2.9, 2.9, 2.9)
                var cube = new THREE.Mesh(cubeGeom, faceMaterial)
                cube.position.set(x * 3 - 3, y * 3, z * 3 - 3)

                group.add(cube)
            }
        }
    }

    // call the render function
    scene.add(group)
    var step = 0

    var controls = new (function () {
        this.rotationSpeed = 0.02
        this.numberOfObjects = scene.children.length
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'rotationSpeed', 0, 0.5)

    render()

    function render() {
        stats.update()

        group.rotation.y = step += controls.rotationSpeed
        // render using requestAnimationFrame
        requestAnimationFrame(render)
        renderer.render(scene, camera)
    }

    function initStats() {
        var stats = new Stats()

        stats.setMode(0) // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute'
        stats.domElement.style.left = '0px'
        stats.domElement.style.top = '0px'

        document.getElementById('Stats-output').appendChild(stats.domElement)

        return stats
    }
}
window.onload = init

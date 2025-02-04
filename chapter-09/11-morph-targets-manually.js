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

    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(20, 20, 1, 1)
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
    var plane = new THREE.Mesh(planeGeometry, planeMaterial)

    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI
    plane.position.x = plane.position.y = 0
    plane.position.z = 0

    // add the plane to the scene
    scene.add(plane)

    // create a cube
    var cubeGeometry = new THREE.BoxGeometry(4, 4, 4)
    var cubeMaterial = new THREE.MeshLambertMaterial({
        morphTargets: true,
        color: 0xff0000
    })

    // define morphtargets, we'll use the vertices from these geometries
    var cubeTarget1 = new THREE.BoxGeometry(2, 10, 2)
    var cubeTarget2 = new THREE.BoxGeometry(8, 2, 8)

    // define morphtargets and compute the morphnormal
    cubeGeometry.morphTargets[0] = {
        name: 't1',
        vertices: cubeTarget2.vertices
    }
    cubeGeometry.morphTargets[1] = {
        name: 't2',
        vertices: cubeTarget1.vertices
    }
    cubeGeometry.computeMorphNormals()

    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

    // position the cube
    cube.position.x = 0
    cube.position.y = 3
    cube.position.z = 0

    // add the cube to the scene
    scene.add(cube)

    // position and point the camera to the center of the scene
    camera.position.x = -15
    camera.position.y = 15
    camera.position.z = 15

    camera.lookAt(scene.position)

    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x0c0c0c)
    scene.add(ambientLight)

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(-25, 25, 15)

    scene.add(spotLight)

    // add the output of the renderer to the html element
    document.getElementById('WebGL-output').appendChild(renderer.domElement)

    var controls = new (function () {
        this.influence1 = 0.01
        this.influence2 = 0.01

        this.update = function () {
            cube.morphTargetInfluences[0] = controls.influence1
            cube.morphTargetInfluences[1] = controls.influence2
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'influence1', 0, 1).onChange(controls.update)
    gui.add(controls, 'influence2', 0, 1).onChange(controls.update)

    render()

    function render() {
        stats.update()

        // render using requestAnimationFrame
        renderer.render(scene, camera)
        requestAnimationFrame(render)
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

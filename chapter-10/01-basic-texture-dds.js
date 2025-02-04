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
    var webGLRenderer = new THREE.WebGLRenderer()
    webGLRenderer.setClearColor(new THREE.Color(0xeeeeee, 1.0))
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)
    webGLRenderer.shadowMapEnabled = true

    var polyhedron = createMesh(new THREE.IcosahedronGeometry(5, 0))
    polyhedron.position.x = 12
    scene.add(polyhedron)

    var sphere = createMesh(new THREE.SphereGeometry(5, 20, 20))
    scene.add(sphere)

    var cube = createMesh(new THREE.BoxGeometry(5, 5, 5))
    cube.position.x = -12
    scene.add(cube)
    console.log(cube.geometry.faceVertexUvs)

    // position and point the camera to the center of the scene
    camera.position.x = 00
    camera.position.y = 12
    camera.position.z = 28
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    var ambiLight = new THREE.AmbientLight(0x141414)
    scene.add(ambiLight)

    var light = new THREE.DirectionalLight()
    light.position.set(0, 30, 20)
    scene.add(light)

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    // call the render function
    var step = 0

    // setup the control gui
    var controls = new (function () {})()

    var gui = new dat.GUI()

    render()

    function createMesh(geom, imageFile) {
        var loader = new THREE.DDSLoader()
        var texture = loader.load('../assets/textures/seafloor.dds')
        var mat = new THREE.MeshPhongMaterial()
        mat.map = texture

        var mesh = new THREE.Mesh(geom, mat)
        return mesh
    }

    function render() {
        stats.update()

        polyhedron.rotation.y = step += 0.01
        polyhedron.rotation.x = step
        cube.rotation.y = step
        cube.rotation.x = step
        sphere.rotation.y = step
        sphere.rotation.x = step

        // render using requestAnimationFrame
        requestAnimationFrame(render)
        webGLRenderer.render(scene, camera)
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

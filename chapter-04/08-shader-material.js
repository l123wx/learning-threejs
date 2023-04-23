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
    renderer.setClearColor(new THREE.Color(0x000000, 1.0))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMapEnabled = true

    var cubeGeometry = new THREE.BoxGeometry(20, 20, 20)

    var meshMaterial1 = createMaterial('vertex-shader', 'fragment-shader-1')
    var meshMaterial2 = createMaterial('vertex-shader', 'fragment-shader-2')
    var meshMaterial3 = createMaterial('vertex-shader', 'fragment-shader-3')
    var meshMaterial4 = createMaterial('vertex-shader', 'fragment-shader-4')
    var meshMaterial5 = createMaterial('vertex-shader', 'fragment-shader-5')
    var meshMaterial6 = createMaterial('vertex-shader', 'fragment-shader-6')

    var material = new THREE.MeshFaceMaterial([
        meshMaterial1,
        meshMaterial2,
        meshMaterial3,
        meshMaterial4,
        meshMaterial5,
        meshMaterial6
    ])
    //        var material = new THREE.MeshFaceMaterial([meshMaterial2, meshMaterial2, meshMaterial1, meshMaterial1, meshMaterial1, meshMaterial1]);

    var cube = new THREE.Mesh(cubeGeometry, material)

    // add the sphere to the scene
    scene.add(cube)

    // position and point the camera to the center of the scene
    camera.position.x = 30
    camera.position.y = 30
    camera.position.z = 30
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x0c0c0c)
    scene.add(ambientLight)

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(-40, 60, -10)
    spotLight.castShadow = true
    scene.add(spotLight)

    // add the output of the renderer to the html element
    document.getElementById('WebGL-output').appendChild(renderer.domElement)

    // call the render function
    var step = 0
    var oldContext = null

    var controls = new (function () {
        this.rotationSpeed = 0.02
        this.bouncingSpeed = 0.03

        this.opacity = meshMaterial1.opacity
        this.transparent = meshMaterial1.transparent

        this.visible = meshMaterial1.visible
        this.side = 'front'

        this.wireframe = meshMaterial1.wireframe
        this.wireframeLinewidth = meshMaterial1.wireframeLinewidth

        this.selectedMesh = 'cube'

        this.shadow = 'flat'
    })()

    render()

    function render() {
        stats.update()

        cube.rotation.y = step += 0.01
        cube.rotation.x = step
        cube.rotation.z = step

        cube.material.materials.forEach(function (e) {
            e.uniforms.time.value += 0.01
        })

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

    function createMaterial(vertexShader, fragmentShader) {
        var vertShader = document.getElementById(vertexShader).innerHTML
        var fragShader = document.getElementById(fragmentShader).innerHTML

        var attributes = {}
        var uniforms = {
            time: { type: 'f', value: 0.2 },
            scale: { type: 'f', value: 0.2 },
            alpha: { type: 'f', value: 0.6 },
            resolution: { type: 'v2', value: new THREE.Vector2() }
        }

        uniforms.resolution.value.x = window.innerWidth
        uniforms.resolution.value.y = window.innerHeight

        var meshMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            attributes: attributes,
            vertexShader: vertShader,
            fragmentShader: fragShader,
            transparent: true
        })

        return meshMaterial
    }
}
window.onload = init

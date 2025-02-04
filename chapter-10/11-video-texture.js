/** @type {import('../types/three')} */

var texture

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

    var video = document.getElementById('video')
    texture = new THREE.VideoTexture(video)
    var cube

    cube = createMesh(new THREE.BoxGeometry(22, 16, 0.2), 'floor-wood.jpg')
    cube.position.y = 2
    scene.add(cube)

    // position and point the camera to the center of the scene
    camera.position.x = 00
    camera.position.y = 1
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

    //        var polyhedron = createMesh(new THREE.PolyhedronGeometry(vertices, faces, controls.radius, controls.detail));

    // setup the control gui
    var controls = new (function () {
        this.showVideo = false
        this.rotate = false

        this.showCanvas = function () {
            if (controls.showVideo) {
                $('#video').show()
            } else {
                $('#video').hide()
            }
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'rotate')
    gui.add(controls, 'showVideo').onChange(controls.showCanvas)

    render()

    function createMesh(geom) {
        var materialArray = []
        materialArray.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }))
        materialArray.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }))
        materialArray.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }))
        materialArray.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }))
        materialArray.push(new THREE.MeshBasicMaterial({ map: texture }))
        materialArray.push(new THREE.MeshBasicMaterial({ color: 0xff51ba }))
        var faceMaterial = new THREE.MeshFaceMaterial(materialArray)

        // create a multimaterial
        var mesh = new THREE.Mesh(geom, faceMaterial)

        return mesh
    }

    function render() {
        stats.update()

        if (controls.rotate) {
            cube.rotation.x += -0.01
            cube.rotation.y += -0.01
            cube.rotation.z += -0.01
        }

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

/** @type {import('../types/three')} */

var orbit

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

    var shape = createMesh(new THREE.ShapeGeometry(drawShape()))
    // add the sphere to the scene
    scene.add(shape)

    // position and point the camera to the center of the scene
    camera.position.x = -80
    camera.position.y = 80
    camera.position.z = 80
    camera.lookAt(new THREE.Vector3(60, -60, 0))

    var spotLight = new THREE.DirectionalLight(0xffffff)
    spotLight.position = new THREE.Vector3(70, 170, 70)
    spotLight.intensity = 0.7

    spotLight.target = shape

    scene.add(spotLight)

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    orbit = new THREE.OrbitControls(camera, webGLRenderer.domElement)

    // call the render function
    var step = 0

    // setup the control gui
    var controls = new (function () {
        this.amount = 2
        this.bevelThickness = 2
        this.bevelSize = 0.5
        this.bevelEnabled = true
        this.bevelSegments = 3
        this.bevelEnabled = true
        this.curveSegments = 12
        this.steps = 1

        this.asGeom = function () {
            // remove the old plane
            scene.remove(shape)
            // create a new one

            var options = {
                amount: controls.amount,
                bevelThickness: controls.bevelThickness,
                bevelSize: controls.bevelSize,
                bevelSegments: controls.bevelSegments,
                bevelEnabled: controls.bevelEnabled,
                curveSegments: controls.curveSegments,
                steps: controls.steps
            }

            shape = createMesh(new THREE.ExtrudeGeometry(drawShape(), options))
            // add it to the scene.
            scene.add(shape)
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'amount', 0, 20).onChange(controls.asGeom)
    gui.add(controls, 'bevelThickness', 0, 10).onChange(controls.asGeom)
    gui.add(controls, 'bevelSize', 0, 10).onChange(controls.asGeom)
    gui.add(controls, 'bevelSegments', 0, 30).step(1).onChange(controls.asGeom)
    gui.add(controls, 'bevelEnabled').onChange(controls.asGeom)
    gui.add(controls, 'curveSegments', 1, 30).step(1).onChange(controls.asGeom)
    gui.add(controls, 'steps', 1, 5).step(1).onChange(controls.asGeom)

    controls.asGeom()
    render()

    function drawShape() {
        var svgString = document.querySelector('#batman-path').getAttribute('d')

        var shape = transformSVGPathExposed(svgString)

        // return the shape
        return shape
    }

    function createMesh(geom) {
        geom.applyMatrix(new THREE.Matrix4().makeTranslation(-390, -74, 0))

        // assign two materials
        var meshMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 100,
            metal: true
        })
        var mesh = new THREE.Mesh(geom, meshMaterial)
        mesh.scale.x = 0.1
        mesh.scale.y = 0.1

        mesh.rotation.z = Math.PI
        mesh.rotation.x = -1.1
        return mesh
    }

    function render() {
        stats.update()

        shape.rotation.y = step += 0.005

        orbit.update()

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

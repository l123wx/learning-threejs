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

    var circle = createMesh(
        new THREE.CircleGeometry(4, 10, 0.3 * Math.PI * 2, 0.3 * Math.PI * 2)
    )
    // add the sphere to the scene
    scene.add(circle)

    // position and point the camera to the center of the scene
    camera.position.x = -20
    camera.position.y = 30
    camera.position.z = 40
    camera.lookAt(new THREE.Vector3(10, 0, 0))

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(-40, 60, -10)
    scene.add(spotLight)

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    // call the render function
    var step = 0

    // setup the control gui
    var controls = new (function () {
        // we need the first child, since it's a multimaterial

        console.log(circle.children[0].geometry)
        this.radius = 4

        this.thetaStart = 0.3 * Math.PI * 2
        this.thetaLength = 0.3 * Math.PI * 2
        this.segments = 10

        this.redraw = function () {
            // remove the old plane
            scene.remove(circle)
            // create a new one
            circle = createMesh(
                new THREE.CircleGeometry(
                    controls.radius,
                    controls.segments,
                    controls.thetaStart,
                    controls.thetaLength
                )
            )
            // add it to the scene.
            scene.add(circle)
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'radius', 0, 40).onChange(controls.redraw)
    gui.add(controls, 'segments', 0, 40).onChange(controls.redraw)
    gui.add(controls, 'thetaStart', 0, 2 * Math.PI).onChange(controls.redraw)
    gui.add(controls, 'thetaLength', 0, 2 * Math.PI).onChange(controls.redraw)
    render()

    function createMesh(geom) {
        // assign two materials
        var meshMaterial = new THREE.MeshNormalMaterial()
        meshMaterial.side = THREE.DoubleSide
        var wireFrameMat = new THREE.MeshBasicMaterial()
        wireFrameMat.wireframe = true

        // create a multimaterial
        var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [
            meshMaterial,
            wireFrameMat
        ])

        return mesh
    }

    function render() {
        stats.update()

        circle.rotation.y = step += 0.01

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

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

    var cylinder = createMesh(new THREE.CylinderGeometry(20, 20, 20))
    // add the sphere to the scene
    scene.add(cylinder)

    // position and point the camera to the center of the scene
    camera.position.x = -30
    camera.position.y = 40
    camera.position.z = 50
    camera.lookAt(new THREE.Vector3(10, 0, 0))

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    // call the render function
    var step = 0

    // setup the control gui
    var controls = new (function () {
        // we need the first child, since it's a multimaterial

        this.radiusTop = 20
        this.radiusBottom = 20
        this.height = 20

        this.radialSegments = 8
        this.heightSegments = 8

        this.openEnded = false

        this.redraw = function () {
            // remove the old plane
            scene.remove(cylinder)
            // create a new one

            cylinder = createMesh(
                new THREE.CylinderGeometry(
                    controls.radiusTop,
                    controls.radiusBottom,
                    controls.height,
                    controls.radialSegments,
                    controls.heightSegments,
                    controls.openEnded
                )
            )
            // add it to the scene.
            scene.add(cylinder)
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'radiusTop', -40, 40).onChange(controls.redraw)
    gui.add(controls, 'radiusBottom', -40, 40).onChange(controls.redraw)
    gui.add(controls, 'height', 0, 40).onChange(controls.redraw)
    gui.add(controls, 'radialSegments', 1, 20).step(1).onChange(controls.redraw)
    gui.add(controls, 'heightSegments', 1, 20).step(1).onChange(controls.redraw)
    gui.add(controls, 'openEnded').onChange(controls.redraw)

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

        cylinder.rotation.y = step += 0.01

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

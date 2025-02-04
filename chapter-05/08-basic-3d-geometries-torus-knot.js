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

    var knot = createMesh(new THREE.TorusKnotGeometry(10, 1, 64, 8, 2, 3, 1))
    // add the sphere to the scene
    scene.add(knot)

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
        this.radius = knot.children[0].geometry.parameters.radius
        this.tube = 0.3
        this.radialSegments =
            knot.children[0].geometry.parameters.radialSegments
        this.tubularSegments =
            knot.children[0].geometry.parameters.tubularSegments
        this.p = knot.children[0].geometry.parameters.p
        this.q = knot.children[0].geometry.parameters.q
        this.heightScale = knot.children[0].geometry.parameters.heightScale

        this.redraw = function () {
            // remove the old plane
            scene.remove(knot)
            // create a new one

            knot = createMesh(
                new THREE.TorusKnotGeometry(
                    controls.radius,
                    controls.tube,
                    Math.round(controls.radialSegments),
                    Math.round(controls.tubularSegments),
                    Math.round(controls.p),
                    Math.round(controls.q),
                    controls.heightScale
                )
            )
            // add it to the scene.
            scene.add(knot)
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'radius', 0, 40).onChange(controls.redraw)
    gui.add(controls, 'tube', 0, 40).onChange(controls.redraw)
    gui.add(controls, 'radialSegments', 0, 400)
        .step(1)
        .onChange(controls.redraw)
    gui.add(controls, 'tubularSegments', 1, 20)
        .step(1)
        .onChange(controls.redraw)
    gui.add(controls, 'p', 1, 10).step(1).onChange(controls.redraw)
    gui.add(controls, 'q', 1, 15).step(1).onChange(controls.redraw)
    gui.add(controls, 'heightScale', 0, 5).onChange(controls.redraw)

    render()

    function createMesh(geom) {
        // assign two materials
        var meshMaterial = new THREE.MeshNormalMaterial({})
        meshMaterial.side = THREE.DoubleSide

        // create a multimaterial
        var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [
            meshMaterial
        ])

        return mesh
    }

    function render() {
        stats.update()

        knot.rotation.y = step += 0.01

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

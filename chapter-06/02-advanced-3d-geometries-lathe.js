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

    // the points group
    var spGroup
    // the mesh
    var latheMesh

    generatePoints(12, 2, 2 * Math.PI)

    // setup the control gui
    var controls = new (function () {
        // we need the first child, since it's a multimaterial

        this.segments = 12
        this.phiStart = 0
        this.phiLength = 2 * Math.PI

        this.redraw = function () {
            scene.remove(spGroup)
            scene.remove(latheMesh)
            generatePoints(
                controls.segments,
                controls.phiStart,
                controls.phiLength
            )
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'segments', 0, 50).step(1).onChange(controls.redraw)
    gui.add(controls, 'phiStart', 0, 2 * Math.PI).onChange(controls.redraw)
    gui.add(controls, 'phiLength', 0, 2 * Math.PI).onChange(controls.redraw)

    render()

    function generatePoints(segments, phiStart, phiLength) {
        // add 10 random spheres
        var points = []
        var height = 5
        var count = 30
        for (var i = 0; i < count; i++) {
            points.push(
                new THREE.Vector3(
                    (Math.sin(i * 0.2) + Math.cos(i * 0.3)) * height + 12,
                    0,
                    i - count + count / 2
                )
            )
        }

        spGroup = new THREE.Object3D()
        var material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: false
        })
        points.forEach(function (point) {
            var spGeom = new THREE.SphereGeometry(0.2)
            var spMesh = new THREE.Mesh(spGeom, material)
            spMesh.position.copy(point)
            spGroup.add(spMesh)
        })
        // add the points as a group to the scene
        scene.add(spGroup)

        // use the same points to create a LatheGeometry
        var latheGeometry = new THREE.LatheGeometry(
            points,
            segments,
            phiStart,
            phiLength
        )
        latheMesh = createMesh(latheGeometry)

        scene.add(latheMesh)
    }

    function createMesh(geom) {
        // assign two materials
        //  var meshMaterial = new THREE.MeshBasicMaterial({color:0x00ff00, transparent:true, opacity:0.6});
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

        spGroup.rotation.x = step
        latheMesh.rotation.x = step += 0.01

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

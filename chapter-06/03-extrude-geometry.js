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

    var shape = createMesh(new THREE.ShapeGeometry(drawShape()))
    // add the sphere to the scene
    scene.add(shape)

    // position and point the camera to the center of the scene
    camera.position.x = -20
    camera.position.y = 60
    camera.position.z = 60
    camera.lookAt(new THREE.Vector3(20, 20, 0))

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

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
        // create a basic shape
        var shape = new THREE.Shape()

        // startpoint
        shape.moveTo(10, 10)

        // straight line upwards
        shape.lineTo(10, 40)

        // the top of the figure, curve to the right
        shape.bezierCurveTo(15, 25, 25, 25, 30, 40)

        // spline back down
        shape.splineThru([
            new THREE.Vector2(32, 30),
            new THREE.Vector2(28, 20),
            new THREE.Vector2(30, 10)
        ])

        // curve at the bottom
        shape.quadraticCurveTo(20, 15, 10, 10)

        // add 'eye' hole one
        var hole1 = new THREE.Path()
        hole1.absellipse(16, 24, 2, 3, 0, Math.PI * 2, true)
        shape.holes.push(hole1)

        // add 'eye hole 2'
        var hole2 = new THREE.Path()
        hole2.absellipse(23, 24, 2, 3, 0, Math.PI * 2, true)
        shape.holes.push(hole2)

        // add 'mouth'
        var hole3 = new THREE.Path()
        hole3.absarc(20, 16, 2, 0, Math.PI, true)
        shape.holes.push(hole3)

        // return the shape
        return shape
    }

    function createMesh(geom) {
        geom.applyMatrix(new THREE.Matrix4().makeTranslation(-20, 0, 0))

        // assign two materials
        var meshMaterial = new THREE.MeshNormalMaterial({
            shading: THREE.FlatShading,
            transparent: true,
            opacity: 0.7
        })

        //  meshMaterial.side = THREE.DoubleSide;
        var wireFrameMat = new THREE.MeshBasicMaterial()
        wireFrameMat.wireframe = true

        // create a multimaterial
        var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [
            meshMaterial
        ])

        return mesh
    }

    function createLine(shape, spaced) {
        if (!spaced) {
            var mesh = new THREE.Line(
                shape.createPointsGeometry(),
                new THREE.LineBasicMaterial({
                    color: 0xff3333,
                    linewidth: 2
                })
            )
            return mesh
        } else {
            var mesh = new THREE.Line(
                shape.createSpacedPointsGeometry(20),
                new THREE.LineBasicMaterial({
                    color: 0xff3333,
                    linewidth: 2
                })
            )
            return mesh
        }
    }

    function render() {
        stats.update()

        shape.rotation.y = step += 0.01

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

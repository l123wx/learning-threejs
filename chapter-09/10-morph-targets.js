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
        2000
    )

    // create a render and set the size
    var webGLRenderer = new THREE.WebGLRenderer()
    webGLRenderer.setClearColor(new THREE.Color(0xeeeeee, 1.0))
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)
    webGLRenderer.shadowMapEnabled = true

    // position and point the camera to the center of the scene
    camera.position.x = 250
    camera.position.y = 250
    camera.position.z = 350
    camera.lookAt(new THREE.Vector3(100, 50, 0))

    // add spotlight for the shadows
    var spotLight = new THREE.DirectionalLight(0xffffff)
    spotLight.position.set(300, 200, 300)
    spotLight.intensity = 1
    scene.add(spotLight)

    // add the output of the renderer to the html element
    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    // call the render function
    var step = 0

    // setup the control gui
    var controls = new (function () {
        this.keyframe = 0
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'keyframe', 0, 15)
        .step(1)
        .onChange(function (e) {
            showFrame(e)
        })
    var mesh
    var meshAnim
    var frames = []
    var currentMesh
    var clock = new THREE.Clock()

    var loader = new THREE.JSONLoader()
    loader.load(
        '../assets/models/horse.js',
        function (geometry, mat) {
            var mat = new THREE.MeshLambertMaterial({
                morphTargets: true,
                vertexColors: THREE.FaceColors
            })

            var mat2 = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                vertexColors: THREE.FaceColors
            })

            mesh = new THREE.Mesh(geometry, mat)
            mesh.position.x = -100
            frames.push(mesh)
            currentMesh = mesh
            morphColorsToFaceColors(geometry)

            mesh.geometry.morphTargets.forEach(function (e) {
                var geom = new THREE.Geometry()
                geom.vertices = e.vertices
                geom.faces = geometry.faces

                var morpMesh = new THREE.Mesh(geom, mat2)
                frames.push(morpMesh)
                morpMesh.position.x = -100
            })

            geometry.computeVertexNormals()
            geometry.computeFaceNormals()
            geometry.computeMorphNormals()

            meshAnim = new THREE.MorphAnimMesh(geometry, mat)
            meshAnim.duration = 1000
            meshAnim.position.x = 200
            meshAnim.position.z = 0

            scene.add(meshAnim)

            showFrame(0)
        },
        '../assets/models'
    )

    function showFrame(e) {
        scene.remove(currentMesh)
        scene.add(frames[e])
        currentMesh = frames[e]
        console.log(currentMesh)
    }

    function morphColorsToFaceColors(geometry) {
        if (geometry.morphColors && geometry.morphColors.length) {
            var colorMap = geometry.morphColors[0]
            for (var i = 0; i < colorMap.colors.length; i++) {
                geometry.faces[i].color = colorMap.colors[i]
                geometry.faces[i].color.offsetHSL(0, 0.3, 0)
            }
        }
    }

    render()

    function render() {
        stats.update()

        var delta = clock.getDelta()
        webGLRenderer.clear()
        if (meshAnim) {
            meshAnim.updateAnimation(delta * 1000)
            meshAnim.rotation.y += 0.01
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

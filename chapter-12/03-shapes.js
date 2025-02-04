'use strict'

/** @type {import('../types/three')} */

Physijs.scripts.worker = '../libs/physijs_worker.js'
Physijs.scripts.ammo = '../libs/ammo.js'

var scale = chroma.scale(['blue', 'white'])

var initScene,
    render,
    applyForce,
    setMousePosition,
    mouse_position,
    ground_material,
    box_material,
    projector,
    renderer,
    render_stats,
    physics_stats,
    scene,
    ground,
    light,
    camera,
    box,
    boxes = []

initScene = function () {
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.setClearColor(new THREE.Color(0x000000))
    renderer.shadowMapEnabled = true

    document.getElementById('viewport').appendChild(renderer.domElement)

    render_stats = new Stats()
    render_stats.domElement.style.position = 'absolute'
    render_stats.domElement.style.top = '1px'
    render_stats.domElement.style.left = '1px'
    render_stats.domElement.style.zIndex = 100
    document.getElementById('viewport').appendChild(render_stats.domElement)

    scene = new Physijs.Scene({ reportSize: 10, fixedTimeStep: 1 / 60 })

    scene.setGravity(new THREE.Vector3(0, -20, 0))

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
    )
    camera.position.set(105, 85, 85)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    scene.add(camera)

    // ambi
    var ambi = new THREE.AmbientLight(0x222222)
    scene.add(ambi)

    // Light
    light = new THREE.SpotLight(0xffffff)
    light.position.set(40, 50, 100)
    light.castShadow = true
    light.shadowMapDebug = true
    light.shadowCameraNear = 10
    light.shadowCameraFar = 200
    light.intensity = 1.5

    var meshes = []
    scene.add(light)

    //            createGround();

    var controls = new (function () {
        this.addSphereMesh = function () {
            var sphere = new Physijs.SphereMesh(
                new THREE.SphereGeometry(3, 20),
                getMaterial()
            )
            setPosAndShade(sphere)
            meshes.push(sphere)
            scene.add(sphere)
        }
        this.addBoxMesh = function () {
            var cube = new Physijs.BoxMesh(
                new THREE.BoxGeometry(4, 2, 6),
                getMaterial()
            )
            setPosAndShade(cube)

            meshes.push(cube)
            scene.add(cube)
        }

        this.addCylinderMesh = function () {
            var cylinder = new Physijs.CylinderMesh(
                new THREE.CylinderGeometry(2, 2, 6),
                getMaterial()
            )
            setPosAndShade(cylinder)

            meshes.push(cylinder)
            scene.add(cylinder)
        }
        this.addConeMesh = function () {
            var cone = new Physijs.ConeMesh(
                new THREE.CylinderGeometry(0, 3, 7, 20, 10),
                getMaterial()
            )
            setPosAndShade(cone)

            meshes.push(cone)
            scene.add(cone)
        }
        this.addPlaneMesh = function () {
            var plane = new Physijs.PlaneMesh(
                new THREE.PlaneGeometry(5, 5, 10, 10),
                getMaterial()
            )
            setPosAndShade(plane)

            meshes.push(plane)
            scene.add(plane)
        }
        this.addCapsuleMesh = function () {
            var merged = new THREE.Geometry()
            var cyl = new THREE.CylinderGeometry(2, 2, 6)
            var top = new THREE.SphereGeometry(2)
            var bot = new THREE.SphereGeometry(2)

            var matrix = new THREE.Matrix4()
            matrix.makeTranslation(0, 3, 0)
            top.applyMatrix(matrix)

            var matrix = new THREE.Matrix4()
            matrix.makeTranslation(0, -3, 0)
            bot.applyMatrix(matrix)

            // merge to create a capsule
            merged.merge(top)
            merged.merge(bot)
            merged.merge(cyl)

            // create a physijs capsule mesh
            var capsule = new Physijs.CapsuleMesh(merged, getMaterial())
            setPosAndShade(capsule)

            meshes.push(capsule)
            scene.add(capsule)
        }
        this.addConvexMesh = function () {
            var convex = new Physijs.ConvexMesh(
                new THREE.TorusKnotGeometry(0.5, 0.3, 64, 8, 2, 3, 10),
                getMaterial()
            )

            setPosAndShade(convex)

            meshes.push(convex)
            scene.add(convex)
        }

        this.clearMeshes = function () {
            meshes.forEach(function (e) {
                scene.remove(e)
            })
            meshes = []
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'addPlaneMesh')
    gui.add(controls, 'addBoxMesh')
    gui.add(controls, 'addSphereMesh')
    gui.add(controls, 'addCylinderMesh')
    gui.add(controls, 'addConeMesh')
    gui.add(controls, 'addCapsuleMesh')
    gui.add(controls, 'addConvexMesh')
    gui.add(controls, 'clearMeshes')

    var date = new Date()
    var pn = new Perlin('rnd' + date.getTime())
    var map = createHeightMap(pn)
    scene.add(map)

    requestAnimationFrame(render)
    scene.simulate()
}

function createHeightMap(pn) {
    var ground_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(
                '../assets/textures/ground/grasslight-big.jpg'
            )
        }),
        0.3, // high friction
        0.8 // low restitution
    )

    var ground_geometry = new THREE.PlaneGeometry(120, 100, 100, 100)
    for (var i = 0; i < ground_geometry.vertices.length; i++) {
        var vertex = ground_geometry.vertices[i]
        var value = pn.noise(vertex.x / 10, vertex.y / 10, 0)
        vertex.z = value * 10
    }
    ground_geometry.computeFaceNormals()
    ground_geometry.computeVertexNormals()

    var ground = new Physijs.HeightfieldMesh(
        ground_geometry,
        ground_material,
        0, // mass
        100,
        100
    )
    ground.rotation.x = Math.PI / -2
    ground.rotation.y = 0.4
    ground.receiveShadow = true

    return ground
}

function createShape() {
    // add 10 random spheres
    var points = []
    for (var i = 0; i < 30; i++) {
        var randomX = -5 + Math.round(Math.random() * 10)
        var randomY = -5 + Math.round(Math.random() * 10)
        var randomZ = -5 + Math.round(Math.random() * 10)

        points.push(new THREE.Vector3(randomX, randomY, randomZ))
    }

    // use the same points to create a convexgeometry
    var hullGeometry = new THREE.ConvexGeometry(points)
    return hullGeometry
}

function setPosAndShade(obj) {
    obj.position.set(Math.random() * 20 - 45, 40, Math.random() * 20 - 5)

    obj.rotation.set(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI
    )
    obj.castShadow = true
}

function getMaterial() {
    var material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
            color: scale(Math.random()).hex()
            //                                opacity: 0.8,
            //                                transparent: true
        }),
        0.5,
        0.7
    )

    return material
}

function createGround() {
    var length = 120
    var width = 120
    // Materials
    ground_material = Physijs.createMaterial(
        new THREE.MeshPhongMaterial({
            //                                color: 0xaaaaaa,
            map: THREE.ImageUtils.loadTexture(
                '../assets/textures/general/floor-wood.jpg'
            )
        }),
        1, // high friction
        0.7 // low restitution
    )

    // Ground
    ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(length, 1, width),
        ground_material,
        0 // mass
    )

    ground.receiveShadow = true

    var borderLeft = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, 6, width),
        ground_material,
        0 // mass
    )

    borderLeft.position.x = (-1 * length) / 2 - 1
    borderLeft.position.y = 2
    borderLeft.receiveShadow = true

    ground.add(borderLeft)

    var borderRight = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, 6, width),
        ground_material,
        0 // mass
    )
    borderRight.position.x = length / 2 + 1
    borderRight.position.y = 2
    borderRight.receiveShadow = true

    ground.add(borderRight)

    var borderBottom = new Physijs.BoxMesh(
        new THREE.BoxGeometry(width - 1, 6, 2),
        ground_material,
        0 // mass
    )

    borderBottom.position.z = width / 2
    borderBottom.position.y = 1.5
    borderBottom.receiveShadow = true
    ground.add(borderBottom)

    var borderTop = new Physijs.BoxMesh(
        new THREE.BoxGeometry(width, 6, 2),
        ground_material,
        0 // mass
    )

    borderTop.position.z = -width / 2
    borderTop.position.y = 2

    borderTop.receiveShadow = true

    ground.position.x = 0
    ground.position.z = 0
    ground.add(borderTop)

    ground.receiveShadow = true

    scene.add(ground)
}

render = function () {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
    render_stats.update()
    scene.simulate(undefined, 2)
}

window.onload = initScene

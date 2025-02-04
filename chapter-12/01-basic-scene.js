'use strict'

/** @type {import('../types/three')} */

var scale = chroma.scale(['green', 'white'])

Physijs.scripts.worker = '../libs/physijs_worker.js'
Physijs.scripts.ammo = '../libs/ammo.js'

var initScene,
    render,
    applyForce,
    setMousePosition,
    mouse_position,
    ground_material,
    box_material,
    renderer,
    render_stats,
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
    document.getElementById('viewport').appendChild(renderer.domElement)

    render_stats = new Stats()
    render_stats.domElement.style.position = 'absolute'
    render_stats.domElement.style.top = '1px'
    render_stats.domElement.style.zIndex = 100
    document.getElementById('viewport').appendChild(render_stats.domElement)

    scene = new Physijs.Scene()
    scene.setGravity(new THREE.Vector3(0, -50, 0))

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
    )
    camera.position.set(50, 30, 50)
    camera.lookAt(new THREE.Vector3(10, 0, 10))
    scene.add(camera)

    // Light
    light = new THREE.SpotLight(0xffffff)
    light.position.set(20, 100, 50)

    scene.add(light)

    createGround()

    var points = getPoints()
    var stones = []

    requestAnimationFrame(render)

    var controls = new (function () {
        this.gravityX = 0
        this.gravityY = -50
        this.gravityZ = 0

        this.resetScene = function () {
            scene.setGravity(
                new THREE.Vector3(
                    controls.gravityX,
                    controls.gravityY,
                    controls.gravityZ
                )
            )
            stones.forEach(function (st) {
                scene.remove(st)
            })
            stones = []

            points.forEach(function (point) {
                var stoneGeom = new THREE.BoxGeometry(0.6, 6, 2)

                var stone = new Physijs.BoxMesh(
                    stoneGeom,
                    Physijs.createMaterial(
                        new THREE.MeshPhongMaterial({
                            color: scale(Math.random()).hex(),
                            transparent: true,
                            opacity: 0.8
                            //                            map: THREE.ImageUtils.loadTexture( '../assets/textures/general/darker_wood.jpg' )
                        })
                    )
                )
                console.log(stone.position)
                stone.position.copy(point)
                stone.lookAt(scene.position)
                stone.__dirtyRotation = true
                stone.position.y = 3.5

                scene.add(stone)
                stones.push(stone)
            })

            // let the first one fall down
            stones[0].rotation.x = 0.2
            stones[0].__dirtyRotation = true
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'gravityX', -100, 100)
    gui.add(controls, 'gravityY', -100, 100)
    gui.add(controls, 'gravityZ', -100, 100)
    gui.add(controls, 'resetScene')

    controls.resetScene()
}

var stepX

render = function () {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
    render_stats.update()

    scene.simulate(undefined, 1)
}

function getPoints() {
    var points = []
    var r = 27
    var cX = 0
    var cY = 0

    var circleOffset = 0
    for (var i = 0; i < 1000; i += 6 + circleOffset) {
        circleOffset = 4.5 * (i / 360)

        var x = (r / 1440) * (1440 - i) * Math.cos(i * (Math.PI / 180)) + cX
        var z = (r / 1440) * (1440 - i) * Math.sin(i * (Math.PI / 180)) + cY
        var y = 0

        points.push(new THREE.Vector3(x, y, z))
    }

    return points
}

function createGround() {
    var ground_material = Physijs.createMaterial(
        new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture(
                '../assets/textures/general/wood-2.jpg'
            )
        }),
        0.9,
        0.3
    )

    var ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(60, 1, 60),
        ground_material,
        0
    )

    var borderLeft = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, 3, 60),
        ground_material,
        0
    )
    borderLeft.position.x = -31
    borderLeft.position.y = 2
    ground.add(borderLeft)

    var borderRight = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, 3, 60),
        ground_material,
        0
    )
    borderRight.position.x = 31
    borderRight.position.y = 2
    ground.add(borderRight)

    var borderBottom = new Physijs.BoxMesh(
        new THREE.BoxGeometry(64, 3, 2),
        ground_material,
        0
    )
    borderBottom.position.z = 30
    borderBottom.position.y = 2
    ground.add(borderBottom)

    var borderTop = new Physijs.BoxMesh(
        new THREE.BoxGeometry(64, 3, 2),
        ground_material,
        0
    )
    borderTop.position.z = -30
    borderTop.position.y = 2
    ground.add(borderTop)

    scene.add(ground)
}

window.onload = initScene

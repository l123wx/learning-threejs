'use strict'

/** @type {import('../types/three')} */

Physijs.scripts.worker = '../libs/physijs_worker.js'
Physijs.scripts.ammo = '../libs/ammo.js'

var scale = chroma.scale(['white', 'blue', 'red', 'yellow'])

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

    scene.setGravity(new THREE.Vector3(0, -40, 0))

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
    )
    camera.position.set(90, 90, 90)
    camera.lookAt(new THREE.Vector3(30, 0, -20))
    scene.add(camera)

    // Light
    light = new THREE.SpotLight(0xffffff)
    light.position.set(120, 70, 100)
    light.castShadow = true
    light.shadowMapDebug = true
    light.shadowCameraNear = 10
    light.shadowCameraFar = 200

    scene.add(light)

    var meshes = []

    createGround()
    var car = createCar()

    var controls = new (function () {
        this.velocity = -2
        this.wheelAngle = 0.5

        this.loosenXRight = 0.0001
        this.loosenXLeft = 0.0001

        this.changeVelocity = function () {
            // if you add a motor, the current constraint is overridden
            // if you want to rotate set min higher then max
            car.flConstraint.configureAngularMotor(
                2,
                0.1,
                0,
                controls.velocity,
                15000
            )
            car.frConstraint.configureAngularMotor(
                2,
                0.1,
                0,
                controls.velocity,
                15000
            )

            // motor one is for left and right
            //                frConstraint.enableAngularMotor(1);

            // motor two is forward and backwards
            car.flConstraint.enableAngularMotor(2)
            car.frConstraint.enableAngularMotor(2)
        }

        this.changeOrientation = function () {
            car.rrConstraint.setAngularLowerLimit({
                x: 0,
                y: controls.wheelAngle,
                z: 0.1
            })
            car.rrConstraint.setAngularUpperLimit({
                x: controls.loosenXRight,
                y: controls.wheelAngle,
                z: 0
            })
            car.rlConstraint.setAngularLowerLimit({
                x: controls.loosenXLeft,
                y: controls.wheelAngle,
                z: 0.1
            })
            car.rlConstraint.setAngularUpperLimit({
                x: 0,
                y: controls.wheelAngle,
                z: 0
            })
        }
    })()

    var gui = new dat.GUI()
    gui.add(controls, 'velocity', -10, 10).onChange(controls.changeVelocity)
    gui.add(controls, 'wheelAngle', -1, 1).onChange(controls.changeOrientation)
    gui.add(controls, 'loosenXRight', 0, 0.5)
        .step(0.01)
        .onChange(controls.changeOrientation)
    gui.add(controls, 'loosenXLeft', 0, 0.6)
        .step(-0.01)
        .onChange(controls.changeOrientation)
    controls.loosenXLeft = 0
    controls.loosenXRight = 0

    requestAnimationFrame(render)
    scene.simulate()
}

function createWheel(position) {
    var wheel_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
            color: 0x444444,
            opacity: 0.9,
            transparent: true
        }),
        1.0, // high friction
        0.5 // medium restitution
    )

    var wheel_geometry = new THREE.CylinderGeometry(4, 4, 2, 10)
    var wheel = new Physijs.CylinderMesh(wheel_geometry, wheel_material, 100)

    wheel.rotation.x = Math.PI / 2
    wheel.castShadow = true
    wheel.position.copy(position)
    return wheel
}

function createCar() {
    var car = {}
    var car_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
            color: 0xff4444,
            opacity: 0.9,
            transparent: true
        }),
        0.5, // high friction
        0.5 // medium restitution
    )

    // create the car body
    var geom = new THREE.BoxGeometry(15, 4, 4)
    var body = new Physijs.BoxMesh(geom, car_material, 500)
    body.position.set(5, 5, 5)
    body.castShadow = true
    scene.add(body)

    // create the wheels
    var fr = createWheel(new THREE.Vector3(0, 4, 10))
    var fl = createWheel(new THREE.Vector3(0, 4, 0))
    var rr = createWheel(new THREE.Vector3(10, 4, 10))
    var rl = createWheel(new THREE.Vector3(10, 4, 0))

    // add the wheels to the scene
    scene.add(fr)
    scene.add(fl)
    scene.add(rr)
    scene.add(rl)

    var frConstraint = createWheelConstraint(
        fr,
        body,
        new THREE.Vector3(0, 4, 8)
    )
    scene.addConstraint(frConstraint)

    var flConstraint = createWheelConstraint(
        fl,
        body,
        new THREE.Vector3(0, 4, 2)
    )
    scene.addConstraint(flConstraint)

    var rrConstraint = createWheelConstraint(
        rr,
        body,
        new THREE.Vector3(10, 4, 8)
    )
    scene.addConstraint(rrConstraint)

    var rlConstraint = createWheelConstraint(
        rl,
        body,
        new THREE.Vector3(10, 4, 2)
    )
    scene.addConstraint(rlConstraint)

    // backwheels don't move themselves and are restriced in their
    // movement. They should be able to rotate along the z-axis
    // same here, if the complete angle is allowed set lower higher
    // than upper.
    // by setting the lower and upper to the same value you can
    // fix the position
    // we can set the x position to 'loosen' the axis for the directional
    rrConstraint.setAngularLowerLimit({ x: 0, y: 0.5, z: 0.1 })
    rrConstraint.setAngularUpperLimit({ x: 0, y: 0.5, z: 0 })
    rlConstraint.setAngularLowerLimit({ x: 0, y: 0.5, z: 0.1 })
    rlConstraint.setAngularUpperLimit({ x: 0, y: 0.5, z: 0 })

    // front wheels should only move along the z axis.
    // we don't need to specify anything here, since
    // that value is overridden by the motors
    frConstraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 })
    frConstraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 })
    flConstraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 })
    flConstraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 })

    // if you add a motor, the current constraint is overridden
    // if you want to rotate set min higher then max
    flConstraint.configureAngularMotor(2, 0.1, 0, -2, 1500)
    frConstraint.configureAngularMotor(2, 0.1, 0, -2, 1500)

    // motor one is for left and right
    //                frConstraint.enableAngularMotor(1);

    // motor two is forward and backwards
    flConstraint.enableAngularMotor(2)
    frConstraint.enableAngularMotor(2)

    car.flConstraint = flConstraint
    car.frConstraint = frConstraint
    car.rlConstraint = rlConstraint
    car.rrConstraint = rrConstraint

    return car
}

function createWheelConstraint(wheel, body, position) {
    var constraint = new Physijs.DOFConstraint(wheel, body, position)

    return constraint
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

    ground.position.x = 20
    ground.position.z = -20
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

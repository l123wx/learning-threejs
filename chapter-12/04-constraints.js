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
    projector = new THREE.Projector()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)

    renderer.setClearColor(new THREE.Color(0x000000))
    renderer.shadowMapEnabled = true

    document.getElementById('viewport').appendChild(renderer.domElement)

    render_stats = new Stats()
    render_stats.domElement.style.position = 'absolute'
    render_stats.domElement.style.top = '1px'
    render_stats.domElement.style.right = '1px'
    render_stats.domElement.style.zIndex = 100
    document.getElementById('viewport').appendChild(render_stats.domElement)

    scene = new Physijs.Scene({ reportSize: 10, fixedTimeStep: 1 / 60 })

    scene.setGravity(new THREE.Vector3(0, -10, 0))

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        1000
    )
    camera.position.set(85, 65, 65)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    scene.add(camera)

    // Light
    light = new THREE.SpotLight(0xffffff)
    light.position.set(20, 50, 50)
    light.castShadow = true
    light.shadowMapDebug = true
    light.shadowCameraNear = 10
    light.shadowCameraFar = 100

    scene.add(light)

    var meshes = []

    createGround()
    var flipperLeftConstraint = createLeftFlipper()
    var flipperRightConstraint = createRightFlipper()
    var sliderBottomConstraint = createSliderBottom()
    var sliderTopConstraint = createSliderTop()
    var coneTwistConstraint = createConeTwist()

    var point2point = createPointToPoint(true)

    var controls = new (function () {
        this.enableMotor = false
        this.acceleration = 2
        this.velocity = -10

        this.enableConeTwistMotor = false
        this.motorTargetX = 0
        this.motorTargetY = 0
        this.motorTargetZ = 0

        this.updateCone = function () {
            if (controls.enableConeTwistMotor) {
                coneTwistConstraint.enableMotor()
                coneTwistConstraint.setMotorTarget(
                    new THREE.Vector3(
                        controls.motorTargetX,
                        controls.motorTargetY,
                        controls.motorTargetZ
                    )
                )
            } else {
                coneTwistConstraint.disableMotor()
            }
        }

        this.updateMotor = function () {
            if (controls.enableMotor) {
                // velocity is the velocity we are going for.
                // acceleration is how fast we're going to reach it
                flipperLeftConstraint.disableMotor()
                flipperLeftConstraint.enableAngularMotor(
                    controls.velocity,
                    controls.acceleration
                )
                flipperRightConstraint.disableMotor()
                flipperRightConstraint.enableAngularMotor(
                    -1 * controls.velocity,
                    controls.acceleration
                )
            } else {
                flipperLeftConstraint.disableMotor()
                flipperRightConstraint.disableMotor()
            }
        }

        this.sliderLeft = function () {
            sliderBottomConstraint.disableLinearMotor()
            sliderBottomConstraint.enableLinearMotor(
                controls.velocity,
                controls.acceleration
            )
            sliderTopConstraint.disableLinearMotor()
            sliderTopConstraint.enableLinearMotor(
                controls.velocity,
                controls.acceleration
            )
        }

        this.sliderRight = function () {
            sliderBottomConstraint.disableLinearMotor()
            sliderBottomConstraint.enableLinearMotor(
                -1 * controls.velocity,
                controls.acceleration
            )
            sliderTopConstraint.disableLinearMotor()
            sliderTopConstraint.enableLinearMotor(
                -1 * controls.velocity,
                controls.acceleration
            )
        }

        this.clearMeshes = function () {
            meshes.forEach(function (e) {
                scene.remove(e)
            })
            meshes = []
        }

        this.addSpheres = function () {
            var colorSphere = scale(Math.random()).hex()
            for (var i = 0; i < 5; i++) {
                box = new Physijs.SphereMesh(
                    new THREE.SphereGeometry(2, 20),
                    Physijs.createMaterial(
                        new THREE.MeshPhongMaterial({
                            color: colorSphere,
                            opacity: 0.8,
                            transparent: true
                            //                                                        map: THREE.ImageUtils.loadTexture( '../assets/textures/general/floor-wood.jpg' )
                        }),
                        controls.sphereFriction,
                        controls.sphereRestitution
                    ),
                    0.1
                )
                box.castShadow = true
                box.receiveShadow = true
                box.position.set(
                    Math.random() * 50 - 25,
                    20 + Math.random() * 5,
                    Math.random() * 5
                )
                meshes.push(box)
                scene.add(box)
            }
        }
    })()

    controls.updateMotor()

    var gui = new dat.GUI()
    gui.domElement.style.position = 'absolute'
    gui.domElement.style.top = '20px'
    gui.domElement.style.left = '20px'

    var generalFolder = gui.addFolder('general')
    generalFolder
        .add(controls, 'acceleration', 0, 15)
        .onChange(controls.updateMotor)
    generalFolder
        .add(controls, 'velocity', -10, 10)
        .onChange(controls.updateMotor)

    var hingeFolder = gui.addFolder('hinge')
    hingeFolder.add(controls, 'enableMotor').onChange(controls.updateMotor)

    var sliderFolder = gui.addFolder('sliders')
    sliderFolder.add(controls, 'sliderLeft').onChange(controls.sliderLeft)
    sliderFolder.add(controls, 'sliderRight').onChange(controls.sliderRight)

    var coneTwistFolder = gui.addFolder('coneTwist')
    coneTwistFolder
        .add(controls, 'enableConeTwistMotor')
        .onChange(controls.updateCone)
    coneTwistFolder
        .add(controls, 'motorTargetX', -Math.PI / 2, Math.PI / 2)
        .onChange(controls.updateCone)
    coneTwistFolder
        .add(controls, 'motorTargetY', -Math.PI / 2, Math.PI / 2)
        .onChange(controls.updateCone)
    coneTwistFolder
        .add(controls, 'motorTargetZ', -Math.PI / 2, Math.PI / 2)
        .onChange(controls.updateCone)

    var spheresFolder = gui.addFolder('spheres')
    spheresFolder.add(controls, 'clearMeshes').onChange(controls.updateMotor)
    spheresFolder.add(controls, 'addSpheres').onChange(controls.updateMotor)

    requestAnimationFrame(render)
    scene.simulate()
}

function createGround() {
    // Materials
    ground_material = Physijs.createMaterial(
        new THREE.MeshPhongMaterial({
            //                                color: 0xaaaaaa,
            map: THREE.ImageUtils.loadTexture(
                '../assets/textures/general/floor-wood.jpg'
            )
        }),
        0.9, // high friction
        0.7 // low restitution
    )

    // Ground
    ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(60, 1, 65),
        ground_material,
        0 // mass
    )

    ground.receiveShadow = true

    var borderLeft = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, 6, 65),
        ground_material,
        0 // mass
    )

    borderLeft.position.x = -31
    borderLeft.position.y = 2
    borderLeft.receiveShadow = true

    ground.add(borderLeft)

    var borderRight = new Physijs.BoxMesh(
        new THREE.BoxGeometry(2, 6, 65),
        ground_material,
        0 // mass
    )
    borderRight.position.x = 31
    borderRight.position.y = 2
    borderRight.receiveShadow = true

    ground.add(borderRight)

    var borderBottom = new Physijs.BoxMesh(
        new THREE.BoxGeometry(64, 6, 2),
        ground_material,
        0 // mass
    )

    borderBottom.position.z = 32
    borderBottom.position.y = 1.5
    borderBottom.receiveShadow = true
    ground.add(borderBottom)

    var borderTop = new Physijs.BoxMesh(
        new THREE.BoxGeometry(64, 6, 2),
        ground_material,
        0 // mass
    )

    borderTop.position.z = -32
    borderTop.position.y = 2
    borderTop.receiveShadow = true

    ground.add(borderTop)

    ground.receiveShadow = true

    scene.add(ground)
}

function createConeTwist() {
    var baseMesh = new THREE.SphereGeometry(1)
    var armMesh = new THREE.BoxGeometry(2, 12, 3)

    var objectOne = new Physijs.BoxMesh(
        baseMesh,
        Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: 0x4444ff,
                transparent: true,
                opacity: 0.7
            }),
            0,
            0
        ),
        0
    )
    objectOne.position.z = 0
    objectOne.position.x = 20
    objectOne.position.y = 15.5
    objectOne.castShadow = true
    scene.add(objectOne)

    var objectTwo = new Physijs.SphereMesh(
        armMesh,
        Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: 0x4444ff,
                transparent: true,
                opacity: 0.7
            }),
            0,
            0
        ),
        10
    )
    objectTwo.position.z = 0
    objectTwo.position.x = 20
    objectTwo.position.y = 7.5
    scene.add(objectTwo)

    objectTwo.castShadow = true

    //position is the position of the axis, relative to the ref, based on the current position
    var constraint = new Physijs.ConeTwistConstraint(
        objectOne,
        objectTwo,
        objectOne.position
    )

    scene.addConstraint(constraint)
    // set limit to quarter circle for each axis
    constraint.setLimit(0.5 * Math.PI, 0.5 * Math.PI, 0.5 * Math.PI)
    constraint.setMaxMotorImpulse(1)
    constraint.setMotorTarget(new THREE.Vector3(0, 0, 0)) // desired rotation

    return constraint
}

function createPointToPoint() {
    var obj1 = new THREE.SphereGeometry(2)
    var obj2 = new THREE.SphereGeometry(2)

    var objectOne = new Physijs.SphereMesh(
        obj1,
        Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: 0xff4444,
                transparent: true,
                opacity: 0.7
            }),
            0,
            0
        )
    )
    objectOne.position.z = -18
    objectOne.position.x = -10
    objectOne.position.y = 2
    objectOne.castShadow = true
    scene.add(objectOne)

    var objectTwo = new Physijs.SphereMesh(
        obj2,
        Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: 0xff4444,
                transparent: true,
                opacity: 0.7
            }),
            0,
            0
        )
    )
    objectTwo.position.z = -5
    objectTwo.position.x = -20
    objectTwo.position.y = 2
    objectTwo.castShadow = true
    scene.add(objectTwo)

    // if no position two, its fixed to a position. Else fixed to objectTwo and both will move
    var constraint = new Physijs.PointConstraint(
        objectOne,
        objectTwo,
        objectTwo.position
    )
    scene.addConstraint(constraint)
}

function createSliderBottom() {
    var sliderCube = new THREE.BoxGeometry(12, 2, 2)

    var sliderMesh = new Physijs.BoxMesh(
        sliderCube,
        Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: 0x44ff44,
                opacity: 0.6,
                transparent: true
            }),
            0,
            0
        ),
        0.01
    )
    sliderMesh.position.z = 20
    sliderMesh.position.x = 6
    sliderMesh.position.y = 1.5
    sliderMesh.castShadow = true

    scene.add(sliderMesh)
    var constraint = new Physijs.SliderConstraint(
        sliderMesh,
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0)
    )

    scene.addConstraint(constraint)
    constraint.setLimits(-10, 10, 0, 0)
    constraint.setRestitution(0.1, 0.1)

    return constraint
}

function createSliderTop() {
    var sliderSphere = new THREE.BoxGeometry(7, 2, 7)

    var sliderMesh = new Physijs.BoxMesh(
        sliderSphere,
        Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: 0x44ff44,
                transparent: true,
                opacity: 0.5
            }),
            0,
            0
        ),
        10
    )
    sliderMesh.position.z = -15
    sliderMesh.position.x = -20
    sliderMesh.position.y = 1.5
    scene.add(sliderMesh)
    sliderMesh.castShadow = true

    //position is the position of the axis, relative to the ref, based on the current position
    var constraint = new Physijs.SliderConstraint(
        sliderMesh,
        new THREE.Vector3(-10, 0, 20),
        new THREE.Vector3(Math.PI / 2, 0, 0)
    )

    scene.addConstraint(constraint)
    constraint.setLimits(-20, 10, 0.5, -0, 5)
    constraint.setRestitution(0.2, 0.1)

    return constraint
}

function createLeftFlipper() {
    var flipperLeft = new Physijs.BoxMesh(
        new THREE.BoxGeometry(12, 2, 2),
        Physijs.createMaterial(
            new THREE.MeshPhongMaterial({ opacity: 0.6, transparent: true })
        ),
        0.3
    )
    flipperLeft.position.x = -6
    flipperLeft.position.y = 2
    flipperLeft.position.z = 0
    flipperLeft.castShadow = true
    scene.add(flipperLeft)
    var flipperLeftPivot = new Physijs.SphereMesh(
        new THREE.BoxGeometry(1, 1, 1),
        ground_material,
        0
    )

    flipperLeftPivot.position.y = 1
    flipperLeftPivot.position.x = -15
    flipperLeftPivot.position.z = 0
    flipperLeftPivot.rotation.y = 1.4
    flipperLeftPivot.castShadow = true

    scene.add(flipperLeftPivot)

    // when looking at the axis, the axis of object two are used.
    // so as long as that one is the same as the scene, no problems
    // rotation and axis are relative to object2. If position == cube2.position it works as expected
    var constraint = new Physijs.HingeConstraint(
        flipperLeft,
        flipperLeftPivot,
        flipperLeftPivot.position,
        new THREE.Vector3(0, 1, 0)
    )
    scene.addConstraint(constraint)

    constraint.setLimits(
        -2.2, // minimum angle of motion, in radians, from the point object 1 starts (going back)
        -0.6, // maximum angle of motion, in radians, from the point object 1 starts (going forward)
        0.1, // applied as a factor to constraint error, how big the kantelpunt is moved when a constraint is hit
        0 // controls bounce at limit (0.0 == no bounce)
    )

    return constraint
}

function createRightFlipper() {
    var flipperright = new Physijs.BoxMesh(
        new THREE.BoxGeometry(12, 2, 2),
        Physijs.createMaterial(
            new THREE.MeshPhongMaterial({ opacity: 0.6, transparent: true })
        ),
        0.3
    )
    flipperright.position.x = 8
    flipperright.position.y = 2
    flipperright.position.z = 0
    flipperright.castShadow = true
    scene.add(flipperright)
    var flipperLeftPivot = new Physijs.SphereMesh(
        new THREE.BoxGeometry(1, 1, 1),
        ground_material,
        0
    )

    flipperLeftPivot.position.y = 2
    flipperLeftPivot.position.x = 15
    flipperLeftPivot.position.z = 0
    flipperLeftPivot.rotation.y = 1.4
    flipperLeftPivot.castShadow = true

    scene.add(flipperLeftPivot)

    // when looking at the axis, the axis of object two are used.
    // so as long as that one is the same as the scene, no problems
    // rotation and axis are relative to object2. If position == cube2.position it works as expected
    var constraint = new Physijs.HingeConstraint(
        flipperright,
        flipperLeftPivot,
        flipperLeftPivot.position,
        new THREE.Vector3(0, 1, 0)
    )
    //            var constraint = new Physijs.HingeConstraint(cube1, new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
    scene.addConstraint(constraint)

    constraint.setLimits(
        -2.2, // minimum angle of motion, in radians, from the point object 1 starts (going back)
        -0.6, // maximum angle of motion, in radians, from the point object 1 starts (going forward)
        0.1, // applied as a factor to constraint error, how big the kantelpunt is moved when a constraint is hit
        0 // controls bounce at limit (0.0 == no bounce)
    )

    return constraint
}

var direction = 1

render = function () {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
    render_stats.update()
    ground.__dirtyRotation = true
    scene.simulate(undefined, 2)
}

window.onload = initScene

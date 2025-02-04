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
    webGLRenderer.setClearColor(new THREE.Color(0xaaaaff, 1.0))
    webGLRenderer.setSize(window.innerWidth, window.innerHeight)
    webGLRenderer.shadowMapEnabled = true

    //        // position and point the camera to the center of the scene
    camera.position.x = 20
    camera.position.y = 30
    camera.position.z = 40
    camera.lookAt(new THREE.Vector3(-15, -10, -25))

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.castShadow = true
    spotLight.position.set(0, 60, 50)
    spotLight.intensity = 1
    spotLight.shadowMapWidth = 2048
    spotLight.shadowMapHeight = 2048
    spotLight.shadowCameraFov = 120
    spotLight.shadowCameraNear = 1
    spotLight.shadowCameraFar = 1000

    var ambiLight = new THREE.AmbientLight(0x444444)
    scene.add(ambiLight)

    scene.add(spotLight)
    var plane = new THREE.BoxGeometry(1600, 1600, 0.1, 40, 40)

    var cube = new THREE.Mesh(
        plane,
        new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: THREE.ImageUtils.loadTexture(
                '../assets/textures/general/plaster-diffuse.jpg'
            ),
            normalMap: THREE.ImageUtils.loadTexture(
                '../assets/textures/general/plaster-normal.jpg'
            ),
            normalScale: new THREE.Vector2(0.6, 0.6)
        })
    )
    cube.material.map.wrapS = THREE.RepeatWrapping
    cube.material.map.wrapT = THREE.RepeatWrapping
    cube.material.normalMap.wrapS = THREE.RepeatWrapping
    cube.material.normalMap.wrapT = THREE.RepeatWrapping
    cube.rotation.x = Math.PI / 2
    cube.material.map.repeat.set(80, 80)

    cube.receiveShadow = true
    cube.position.z = -150
    cube.position.x = -150
    scene.add(cube)

    var cube1 = new THREE.Mesh(
        new THREE.BoxGeometry(30, 10, 2),
        new THREE.MeshPhongMaterial({ color: 0xff0000 })
    )
    cube1.position.x = -15
    cube1.position.y = 5
    cube1.position.z = 15
    cube1.castShadow = true
    scene.add(cube1)

    var cube2 = cube1.clone()
    cube2.material = cube1.material.clone()
    cube2.material.color = new THREE.Color(0x00ff00)
    cube2.position.z = 5
    cube2.position.x = -20
    scene.add(cube2)

    var cube3 = cube1.clone()
    cube3.material = cube1.material.clone()
    cube3.material.color = new THREE.Color(0x0000ff)
    cube3.position.z = -8
    cube3.position.x = -25
    scene.add(cube3)

    var mesh

    // add the output of the renderer to the html element

    document
        .getElementById('WebGL-output')
        .appendChild(webGLRenderer.domElement)

    var loader = new THREE.OBJMTLLoader()
    loader.load(
        '../assets/models/sol/libertStatue.obj',
        '../assets/models/sol/libertStatue.mtl',
        function (event) {
            var object = event

            // fix for incorrect uvs.
            console.log(event)
            var geom = object.children[0].geometry
            var uv3 = geom.faceVertexUvs[0][0]
            var uv4 = geom.faceVertexUvs[0][10]

            // fill in the missing ones
            for (var j = 0; j < 7616 - 7206; j++) {
                if (geom.faces[j + 7206] instanceof THREE.Face4) {
                    geom.faceVertexUvs[0].push(uv4)
                } else {
                    geom.faceVertexUvs[0].push(uv4)
                }
            }

            object.children.forEach(function (e) {
                e.castShadow = true
            })

            object.scale.set(20, 20, 20)
            mesh = object
            mesh.position.x = 15
            mesh.position.z = 5
            scene.add(object)
        }
    )

    var mirror = new THREE.ShaderPass(THREE.MirrorShader)
    mirror.enabled = false

    var hue = new THREE.ShaderPass(THREE.HueSaturationShader)
    hue.enabled = false

    var vignette = new THREE.ShaderPass(THREE.VignetteShader)
    vignette.enabled = false

    var colorCorrection = new THREE.ShaderPass(THREE.ColorCorrectionShader)
    colorCorrection.enabled = false
    var rgbShift = new THREE.ShaderPass(THREE.RGBShiftShader)
    rgbShift.enabled = false

    var brightness = new THREE.ShaderPass(THREE.BrightnessContrastShader)
    brightness.uniforms.brightness.value = 0
    brightness.uniforms.contrast.value = 0
    brightness.enabled = false
    brightness.uniforms.brightness.value = 0
    brightness.uniforms.contrast.value = 0

    var colorify = new THREE.ShaderPass(THREE.ColorifyShader)
    colorify.uniforms.color.value = new THREE.Color(0xffffff)
    colorify.enabled = false

    var sepia = new THREE.ShaderPass(THREE.SepiaShader)
    sepia.uniforms.amount.value = 1
    sepia.enabled = false

    var kal = new THREE.ShaderPass(THREE.KaleidoShader)
    kal.enabled = false

    var lum = new THREE.ShaderPass(THREE.LuminosityShader)
    lum.enabled = false

    var techni = new THREE.ShaderPass(THREE.TechnicolorShader)
    techni.enabled = false

    var unpack = new THREE.ShaderPass(THREE.UnpackDepthRGBAShader)
    unpack.enabled = false

    var renderPass = new THREE.RenderPass(scene, camera)
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader)
    effectCopy.renderToScreen = true

    var composer = new THREE.EffectComposer(webGLRenderer)
    composer.addPass(renderPass)
    composer.addPass(brightness)
    composer.addPass(sepia)
    composer.addPass(mirror)
    composer.addPass(colorify)
    composer.addPass(colorCorrection)
    composer.addPass(rgbShift)
    composer.addPass(vignette)
    composer.addPass(hue)
    composer.addPass(kal)
    composer.addPass(lum)
    composer.addPass(techni)
    composer.addPass(unpack)
    composer.addPass(effectCopy)

    var controls = new (function () {
        this.brightness = 0.01
        this.contrast = 0.01
        this.select = 'none'
        this.color = 0xffffff
        this.amount = 1
        this.powRGB_R = 2
        this.mulRGB_R = 1
        this.powRGB_G = 2
        this.mulRGB_G = 1
        this.powRGB_B = 2
        this.mulRGB_B = 1
        this.rgbAmount = 0.005
        this.angle = 0.0
        this.side = 1
        this.offset = 1
        this.darkness = 1
        this.hue = 0.01
        this.saturation = 0.01
        this.kalAngle = 0
        this.kalSides = 6

        this.rotate = false

        this.switchShader = function () {
            switch (controls.select) {
                case 'none': {
                    enableShader()
                    break
                }

                case 'colorify': {
                    enableShader(colorify)
                    break
                }

                case 'brightness': {
                    enableShader(brightness)
                    break
                }

                case 'sepia': {
                    enableShader(sepia)
                    break
                }

                case 'colorCorrection': {
                    enableShader(colorCorrection)
                    break
                }

                case 'rgbShift': {
                    enableShader(rgbShift)
                    break
                }

                case 'mirror': {
                    enableShader(mirror)
                    break
                }

                case 'vignette': {
                    enableShader(vignette)
                    break
                }

                case 'hueAndSaturation': {
                    enableShader(hue)
                    break
                }

                case 'kaleidoscope': {
                    enableShader(kal)
                    break
                }
                case 'luminosity': {
                    enableShader(lum)
                    break
                }
                case 'technicolor': {
                    enableShader(techni)
                    break
                }
                case 'unpackDepth': {
                    enableShader(unpack)
                    break
                }
            }
        }

        this.changeBrightness = function () {
            brightness.uniforms.brightness.value = controls.brightness
            brightness.uniforms.contrast.value = controls.contrast
        }

        this.changeColor = function () {
            colorify.uniforms.color.value = new THREE.Color(controls.color)
        }

        this.changeSepia = function () {
            sepia.uniforms.amount.value = controls.amount
        }

        this.changeCorrection = function () {
            colorCorrection.uniforms.mulRGB.value = new THREE.Vector3(
                controls.mulRGB_R,
                controls.mulRGB_G,
                controls.mulRGB_B
            )
            colorCorrection.uniforms.powRGB.value = new THREE.Vector3(
                controls.powRGB_R,
                controls.powRGB_G,
                controls.powRGB_B
            )
        }

        this.changeRGBShifter = function () {
            rgbShift.uniforms.amount.value = controls.rgbAmount
            rgbShift.uniforms.angle.value = controls.angle
        }

        this.changeMirror = function () {
            mirror.uniforms.side.value = controls.side
        }

        this.changeVignette = function () {
            vignette.uniforms.darkness.value = controls.darkness
            vignette.uniforms.offset.value = controls.offset
        }

        this.changeHue = function () {
            hue.uniforms.hue.value = controls.hue
            hue.uniforms.saturation.value = controls.saturation
        }

        this.changeKal = function () {
            kal.uniforms.sides.value = controls.kalSides
            kal.uniforms.angle.value = controls.kalAngle
        }

        function enableShader(shader) {
            // we're not interested in the first or the last one
            for (var i = 1; i < composer.passes.length - 1; i++) {
                if (composer.passes[i] == shader) {
                    composer.passes[i].enabled = true
                } else {
                    composer.passes[i].enabled = false
                }
            }
        }
    })()

    var gui = new dat.GUI()

    gui.add(controls, 'select', [
        'none',
        'colorify',
        'brightness',
        'sepia',
        'colorCorrection',
        'rgbShift',
        'mirror',
        'vignette',
        'hueAndSaturation',
        'kaleidoscope',
        'luminosity',
        'technicolor'
    ]).onChange(controls.switchShader)
    gui.add(controls, 'rotate')

    var bnFolder = gui.addFolder('Brightness')
    bnFolder
        .add(controls, 'brightness', -1, 1)
        .onChange(controls.changeBrightness)
    bnFolder
        .add(controls, 'contrast', -1, 1)
        .onChange(controls.changeBrightness)

    var clFolder = gui.addFolder('Colorify')
    clFolder.addColor(controls, 'color').onChange(controls.changeColor)

    var colFolder = gui.addFolder('Color Correction')
    colFolder
        .add(controls, 'powRGB_R', 0, 5)
        .onChange(controls.changeCorrection)
    colFolder
        .add(controls, 'powRGB_G', 0, 5)
        .onChange(controls.changeCorrection)
    colFolder
        .add(controls, 'powRGB_B', 0, 5)
        .onChange(controls.changeCorrection)
    colFolder
        .add(controls, 'mulRGB_R', 0, 5)
        .onChange(controls.changeCorrection)
    colFolder
        .add(controls, 'mulRGB_G', 0, 5)
        .onChange(controls.changeCorrection)
    colFolder
        .add(controls, 'mulRGB_B', 0, 5)
        .onChange(controls.changeCorrection)

    var sepiaFolder = gui.addFolder('Sepia')
    sepiaFolder
        .add(controls, 'amount', 0, 2)
        .step(0.1)
        .onChange(controls.changeSepia)

    var shiftFolder = gui.addFolder('RGB Shift')
    shiftFolder
        .add(controls, 'rgbAmount', 0, 0.1)
        .step(0.001)
        .onChange(controls.changeRGBShifter)
    shiftFolder
        .add(controls, 'angle', 0, 3.14)
        .step(0.001)
        .onChange(controls.changeRGBShifter)

    var mirrorFolder = gui.addFolder('mirror')
    mirrorFolder
        .add(controls, 'side', 0, 3)
        .step(1)
        .onChange(controls.changeMirror)

    var vignetteFolder = gui.addFolder('vignette')
    vignetteFolder
        .add(controls, 'darkness', 0, 2)
        .onChange(controls.changeVignette)
    vignetteFolder
        .add(controls, 'offset', 0, 2)
        .onChange(controls.changeVignette)

    var hueAndSat = gui.addFolder('hue and saturation')
    hueAndSat
        .add(controls, 'hue', -1, 1)
        .step(0.01)
        .onChange(controls.changeHue)
    hueAndSat
        .add(controls, 'saturation', -1, 1)
        .step(0.01)
        .onChange(controls.changeHue)

    var kalMenu = gui.addFolder('Kaleidoscope')
    kalMenu
        .add(controls, 'kalAngle', -2 * Math.PI, 2 * Math.PI)
        .onChange(controls.changeKal)
    kalMenu.add(controls, 'kalSides', 2, 20).onChange(controls.changeKal)

    render()

    function render() {
        stats.update()

        //
        if (controls.rotate) {
            if (mesh) mesh.rotation.y += 0.01
            cube1.rotation.y += 0.01
            cube2.rotation.y += 0.01
            cube3.rotation.y += 0.01
        }

        requestAnimationFrame(render)
        //        webGLRenderer.render(scene, camera);
        composer.render()
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

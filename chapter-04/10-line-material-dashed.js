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
    var renderer = new THREE.WebGLRenderer()

    renderer.setClearColor(new THREE.Color(0x000000, 1.0))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMapEnabled = true

    // position and point the camera to the center of the scene
    camera.position.x = -30
    camera.position.y = 40
    camera.position.z = 30
    camera.lookAt(scene.position)

    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x0c0c0c)
    scene.add(ambientLight)

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(-40, 60, -10)
    spotLight.castShadow = true
    scene.add(spotLight)

    // get the turtle
    var points = gosper(4, 60)

    var lines = new THREE.Geometry()
    var colors = []
    var i = 0
    points.forEach(function (e) {
        lines.vertices.push(new THREE.Vector3(e.x, e.z, e.y))
        colors[i] = new THREE.Color(0xffffff)
        colors[i].setHSL(e.x / 100 + 0.5, (e.y * 20) / 300, 0.8)
        i++
    })

    lines.colors = colors

    lines.computeLineDistances()
    var material = new THREE.LineDashedMaterial({
        vertexColors: true,
        color: 0xffffff,
        dashSize: 2,
        gapSize: 2,
        scale: 0.1
    })

    var line = new THREE.Line(lines, material)
    line.position.set(25, -30, -60)
    scene.add(line)

    // add the output of the renderer to the html element
    document.getElementById('WebGL-output').appendChild(renderer.domElement)

    // call the render function
    var step = 0
    render()

    function render() {
        stats.update()
        line.rotation.z = step += 0.01

        requestAnimationFrame(render)
        renderer.render(scene, camera)
    }

    function gosper(a, b) {
        var turtle = [0, 0, 0]
        var points = []
        var count = 0

        rg(a, b, turtle)

        return points

        function rt(x) {
            turtle[2] += x
        }

        function lt(x) {
            turtle[2] -= x
        }

        function fd(dist) {
            //                ctx.beginPath();
            points.push({ x: turtle[0], y: turtle[1], z: Math.sin(count) * 5 })
            //                ctx.moveTo(turtle[0], turtle[1]);

            var dir = turtle[2] * (Math.PI / 180)
            turtle[0] += Math.cos(dir) * dist
            turtle[1] += Math.sin(dir) * dist

            points.push({ x: turtle[0], y: turtle[1], z: Math.sin(count) * 5 })
            //                ctx.lineTo(turtle[0], turtle[1]);
            //                ctx.stroke();
        }

        function rg(st, ln, turtle) {
            st--
            ln = ln / 2.6457
            if (st > 0) {
                //                    ctx.strokeStyle = '#111';
                rg(st, ln, turtle)
                rt(60)
                gl(st, ln, turtle)
                rt(120)
                gl(st, ln, turtle)
                lt(60)
                rg(st, ln, turtle)
                lt(120)
                rg(st, ln, turtle)
                rg(st, ln, turtle)
                lt(60)
                gl(st, ln, turtle)
                rt(60)
            }
            if (st == 0) {
                fd(ln)
                rt(60)
                fd(ln)
                rt(120)
                fd(ln)
                lt(60)
                fd(ln)
                lt(120)
                fd(ln)
                fd(ln)
                lt(60)
                fd(ln)
                rt(60)
            }
        }

        function gl(st, ln, turtle) {
            st--
            ln = ln / 2.6457
            if (st > 0) {
                //                    ctx.strokeStyle = '#555';
                lt(60)
                rg(st, ln, turtle)
                rt(60)
                gl(st, ln, turtle)
                gl(st, ln, turtle)
                rt(120)
                gl(st, ln, turtle)
                rt(60)
                rg(st, ln, turtle)
                lt(120)
                rg(st, ln, turtle)
                lt(60)
                gl(st, ln, turtle)
            }
            if (st == 0) {
                lt(60)
                fd(ln)
                rt(60)
                fd(ln)
                fd(ln)
                rt(120)
                fd(ln)
                rt(60)
                fd(ln)
                lt(120)
                fd(ln)
                lt(60)
                fd(ln)
            }
        }
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

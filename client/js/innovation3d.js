

var Innovation3d = function (_parentElement) {
  this.parentElement = _parentElement;

  this.initVis();
}

Innovation3d.prototype.initVis = function (callback) {
    var vis = this;
    var container, stats;

    var camera, scene, renderer;

    var mesh, geometry;

    var cubeCamera;

    var sunLight, pointLight, ambientLight;

    var mixer;

    var clock = new THREE.Clock();

    var gui, shadowCameraHelper, shadowConfig = {

      shadowCameraVisible: false,
      shadowCameraNear: 750,
      shadowCameraFar: 4000,
      shadowCameraFov: 30,
      shadowBias: -0.0002

    };
    vis.innerWidth = 1000;
    vis.innerHeight = 400;

    init();
    animate();

    function init() {

      container = document.createElement('div');
      document.getElementById(vis.parentElement).appendChild(container);


      // CAMERA

      camera = new THREE.PerspectiveCamera(45, vis.innerWidth / vis.innerHeight, 2, 10000);
      camera.position.set(600, 300, 000);

      // SCENE

      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0, 1000, 10000);

      // TEXTURES
      var textureLoader = new THREE.TextureLoader();

      var textureSquares = textureLoader.load("textures/patterns/bright_squares256.png");
      textureSquares.repeat.set(50, 50);
      textureSquares.wrapS = textureSquares.wrapT = THREE.RepeatWrapping;
      textureSquares.magFilter = THREE.NearestFilter;
      textureSquares.format = THREE.RGBFormat;

      var textureNoiseColor = textureLoader.load("textures/disturb.jpg");
      textureNoiseColor.repeat.set(1, 1);
      textureNoiseColor.wrapS = textureNoiseColor.wrapT = THREE.RepeatWrapping;
      textureNoiseColor.format = THREE.RGBFormat;

      var textureLava = textureLoader.load("textures/lava/lavatile.jpg");
      textureLava.repeat.set(6, 2);
      textureLava.wrapS = textureLava.wrapT = THREE.RepeatWrapping;
      textureLava.format = THREE.RGBFormat;

      //


      // GROUND

      var groundMaterial = new THREE.MeshPhongMaterial({
        shininess: 80,
        color: 0xffffff,
        specular: 0xffffff,
        map: textureSquares
      });

      var planeGeometry = new THREE.PlaneBufferGeometry(100, 100);

      var ground = new THREE.Mesh(planeGeometry, groundMaterial);
      ground.position.set(0, 0, 0);
      ground.rotation.x = -Math.PI / 2;
      //ground.rotation.z = Math.PI ;
      ground.scale.set(1000, 1000, 1000);
      ground.receiveShadow = true;
      scene.add(ground);

      // MATERIALS

      var materialPhong = new THREE.MeshPhongMaterial({
        shininess: 50,
        color: 0xffffff,
        specular: 0x999999,
        map: textureLava
      });

      // OBJECTS

      var cubeGeometry = new THREE.BoxGeometry(150, 150, 150);


      function addObjectColor(geometry, color, x, y, z, ry) {

        var material = new THREE.MeshPhongMaterial({
          color: color
        });

        return addObject(geometry, material, x, y, z, ry);

      }

      function addObject(geometry, material, x, y, z, ry) {

        var tmpMesh = new THREE.Mesh(geometry, material);

        tmpMesh.material.color.offsetHSL(0.1, -0.1, 0);

        tmpMesh.position.set(x, y, z);

        tmpMesh.rotation.y = ry;

        tmpMesh.castShadow = true;
        tmpMesh.receiveShadow = true;

        scene.add(tmpMesh);

        return tmpMesh;

      }

      function addCubes(predictions, cube) {
        var zoneCount = [0, 0, 0, 0, 0];
        var zone;
        var x, z, alt;
        console.log(predictions);
        for (var i = 0; i < predictions.length; i++) {
          zone = Math.floor(predictions[i].prob * 100 / 20);
          x = zone * (-250);
          z = zoneCount[zone] * 250;
          alt = (zoneCount[zone] % 2 == 0) ? 1 : -1;
          z *= alt;
          zoneCount[zone]++;
          addObjectColor(cube, 0x00ff00, x, 50, z, 0); // close
        }
        /*
                addObjectColor(smallCube, 0x00ff00, -500, 50, 00, 0); // far
                addObjectColor(smallCube, 0x00ff00, -250, 50, 00, 0); //middle
                addObjectColor(smallCube, 0x00ff00, 0, 50, 00, 0); // close
                addObjectColor(smallCube, 0x00ff00, 0, 50, -250, 0); // close right
                addObjectColor(smallCube, 0x00ff00, 0, 50, 250, 0); // close left
        */
      }

      function drawLegend() {
        return;
        // Ref: http://stackoverflow.com/questions/28008608/why-cant-i-draw-a-complete-circle-with-arc-in-three-js
        var extrudeSettings = {
          bevelEnabled: false,
          steps: 1,
          amount: 2
        };

        var shape = new THREE.Shape();
        var circleRadius = 250;

        // THIS LINE SOLVES THE ISSUE
        shape.moveTo( -circleRadius,0);

        shape.absarc(0, 0, circleRadius, 0, 1.5 * Math.PI, false);
        shape.lineTo(0, 0);
        shape.closePath();

        var geometry = shape.extrude(extrudeSettings);

        scene.add(new THREE.Mesh(geometry, new THREE.MeshNormalMaterial()));
        return;
      }

      var bigCube = new THREE.BoxGeometry(50, 500, 50);
      var midCube = new THREE.BoxGeometry(50, 200, 50);
      var smallCube = new THREE.BoxGeometry(1, 500, 10);

      //var predictions = predictRandom();

      //  addCubes(predictions, smallCube);

      var loader = new THREE.FontLoader();
      loader.load('fonts/helvetiker_bold.typeface.js', function(response) {
        // Text
        var options = {
          size: 20,
          height: 10,
          weight: 'normal',
          style: 'normal',
          bevelThickness: 1,
          bevelSize: 1,
          bevelSegments: 3,
          bevelEnabled: true,
          curveSegments: 12,
          steps: 1
        };
        var zoneCount = [0, 0, 0, 0, 0];
        var zone;
        var x, y, z, r, alt, angle;
        var cube;


        options.font = response;

        drawLegend();

        for (var i = 0; i < p171.predictions.length; i++) {
          zone = Math.floor(p171.predictions[i].prob * 100 / 20);
          x = (4 - zone) * (-250);
          y = 50 + (4 - zone) * 50;
          z = zoneCount[zone] * 250;
          // switch sides from left to right of center
          alt = (zoneCount[zone] % 2 == 0) ? 1 : -1;
          z *= alt;

          angle = alt * zoneCount[zone] * Math.PI / 16;
          r = (5 - zone) * 250;
          console.log("angle:" + angle * 57.3 + ",r=", r);

          z = Math.sin(angle) * r;
          x = -Math.sqrt(Math.pow(r, 2) - Math.pow(z, 2));
          console.log(p171.predictions[i].college + "," + p171.predictions[i].prob + ",zone=" + zone + ",x=" + x + ",y=" + y + ",z=" + z);
          zoneCount[zone]++;

          var textGeometry = new THREE.TextGeometry(p171.predictions[i].college, options);
          var textMaterial = new THREE.MeshBasicMaterial({
            color: p171.predictions[i].color,
            vertexColors: THREE.FaceColors,
            wireframe: false,
            opacity: 0.8,
            transparent: true,
            side: THREE.DoubleSide,
            visible: true
          });

          var mesh = new THREE.Mesh(textGeometry, textMaterial);
          mesh.rotation.y = 1.5;
          mesh.position.set(x, y, z);

          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add(mesh);
          cube = new THREE.BoxGeometry(1, y + (4 - zone) * 50, 10);

          addObjectColor(cube, 0x000000, x, 0, z, 0);
        }
      });



      // LIGHTS

      ambientLight = new THREE.AmbientLight(0x3f2806);
      scene.add(ambientLight);

      pointLight = new THREE.PointLight(0xffaa00, 1, 5000);
      pointLight.position.set(1000, 000, 500);
      scene.add(pointLight);

      sunLight = new THREE.SpotLight(0xffffff, 0.3, 0, Math.PI / 2);
      sunLight.position.set(1000, 2000, 1000);

      sunLight.castShadow = true;

      sunLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(shadowConfig.shadowCameraFov, 1, shadowConfig.shadowCameraNear, shadowConfig.shadowCameraFar));
      sunLight.shadow.bias = shadowConfig.shadowBias;

      scene.add(sunLight);

      // SHADOW CAMERA HELPER

      shadowCameraHelper = new THREE.CameraHelper(sunLight.shadow.camera);
      shadowCameraHelper.visible = shadowConfig.shadowCameraVisible;
      scene.add(shadowCameraHelper);

      // RENDERER

      renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(vis.innerWidth, vis.innerHeight);
      container.appendChild(renderer.domElement);

      //

      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      //

      renderer.gammaInput = true;
      renderer.gammaOutput = true;

      //

      controls = new THREE.TrackballControls(camera, renderer.domElement);
      controls.target.set(0, 120, 0);

      controls.rotateSpeed = 1.0;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 0.8;

      controls.noZoom = false;
      controls.noPan = false;

      controls.staticMoving = true;
      controls.dynamicDampingFactor = 0.15;

      controls.keys = [65, 83, 68];

      // EVENTS

      window.addEventListener('resize', onWindowResize, false);

    }

    //

    function onWindowResize(event) {
      // TODO: use the outer object, fix resize and camera
      var vis = document.getElementById('three-area');
      innerWidth = vis.clientWidth;
      innerHeight = innerWidth * 0.75;
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(innerWidth, innerHeight);

      controls.handleResize();

    }

    //

    function animate() {

      requestAnimationFrame(animate);
      render();

    }

    function render() {

      // update

      var delta = clock.getDelta();

      controls.update();

      if (mixer) {

        mixer.update(delta);

      }


      // render scene

      renderer.render(scene, camera);

    }
}


Innovation3d.prototype.wrangleData = function () {
  var vis = this;
  vis.selectedSchools = JSON.parse(localStorage.getItem("colleges"));
  vis.updateVis();
}

Innovation3d.prototype.updateVis = function () {
  var vis = this;
}

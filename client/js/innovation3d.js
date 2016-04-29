var Innovation3d = function(_parentElement) {
  this.parentElement = _parentElement;

  this.initVis();
}

Innovation3d.prototype.initVis = function(callback) {
  var vis = this;
  vis.aspectratio = 0.4;
  vis.innerWidth = 1000;
  vis.innerHeight = vis.innerWidth * vis.aspectratio;

  // Text
  vis.options = {
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
  var loader = new THREE.FontLoader();
  loader.load('fonts/helvetiker_bold.typeface.js', function(response) {
    vis.options.font = response;
    vis.wrangleData();
  });

  var mesh, geometry;

  var cubeCamera;

  var sunLight, pointLight, ambientLight;

  var gui, shadowCameraHelper, shadowConfig = {

    shadowCameraVisible: false,
    shadowCameraNear: 750,
    shadowCameraFar: 4000,
    shadowCameraFov: 30,
    shadowBias: -0.0002

  };

  vis.clock = new THREE.Clock();

  if (document.getElementById(vis.parentElement).childNodes.length > 0) {
    document.getElementById(vis.parentElement).removeChild(document.getElementById(vis.parentElement).childNodes[0]);
  }
  vis.container = document.createElement('div');
  document.getElementById(vis.parentElement).appendChild(vis.container);


  // CAMERA

  vis.camera = new THREE.PerspectiveCamera(45, vis.innerWidth / vis.innerHeight, 2, 10000);
  vis.camera.position.set(600, 300, 000);

  // SCENE

  vis.scene = new THREE.Scene();
  vis.scene.fog = new THREE.Fog(0, 1000, 10000);

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
  vis.scene.add(ground);

  // MATERIALS

  var materialPhong = new THREE.MeshPhongMaterial({
    shininess: 50,
    color: 0xffffff,
    specular: 0x999999,
    map: textureLava
  });

  // Objects are added in WrangleData()

  var start3 = new THREE.Vector3(0, 50, -250);
  var middle3 = new THREE.Vector3(-250, 50, 0);
  var end3 = new THREE.Vector3(0, 50, 250);

  var curve = new THREE.QuadraticBezierCurve3(start3, middle3, end3);
  //   var curveCubic = new THREE.CubicBezierCurve3(start3, start3_control, end3_control, end3);

  var geometry = new THREE.Geometry();
  geometry.vertices = curve.getPoints(50);

  var curvedLineMaterial = new THREE.LineBasicMaterial({
    color: 0xFFFFAA,
    linewidth: 200
  });
  var curvedLine = new THREE.Line(geometry, materialPhong);
  vis.scene.add(curvedLine);

  // LIGHTS

  ambientLight = new THREE.AmbientLight(0x3f2806);
  vis.scene.add(ambientLight);

  pointLight = new THREE.PointLight(0xffaa00, 1, 5000);
  pointLight.position.set(1000, 000, 500);
  vis.scene.add(pointLight);

  sunLight = new THREE.SpotLight(0xffffff, 0.3, 0, Math.PI / 2);
  sunLight.position.set(1000, 2000, 1000);

  sunLight.castShadow = true;

  sunLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(shadowConfig.shadowCameraFov, 1, shadowConfig.shadowCameraNear, shadowConfig.shadowCameraFar));
  sunLight.shadow.bias = shadowConfig.shadowBias;

  vis.scene.add(sunLight);

  // SHADOW CAMERA HELPER

  shadowCameraHelper = new THREE.CameraHelper(sunLight.shadow.camera);
  shadowCameraHelper.visible = shadowConfig.shadowCameraVisible;
  vis.scene.add(shadowCameraHelper);

  // RENDERER

  vis.renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  vis.renderer.setPixelRatio(window.devicePixelRatio);
  vis.renderer.setSize(vis.innerWidth, vis.innerHeight);
  vis.container.appendChild(vis.renderer.domElement);

  vis.renderer.shadowMap.enabled = true;
  vis.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  vis.renderer.gammaInput = true;
  vis.renderer.gammaOutput = true;

  vis.controls = new THREE.TrackballControls(vis.camera, vis.renderer.domElement);
  vis.controls.target.set(0, 120, 0);

  vis.controls.rotateSpeed = 1.0;
  vis.controls.zoomSpeed = 1.2;
  vis.controls.panSpeed = 0.8;

  vis.controls.noZoom = false;
  vis.controls.noPan = false;

  vis.controls.staticMoving = true;
  vis.controls.dynamicDampingFactor = 0.15;

  vis.controls.keys = [65, 83, 68];

  // EVENTS

  window.addEventListener('resize', onWindowResize, false);

  function onWindowResize(event) {
    var innerWidth = document.getElementById('three-area').clientWidth;
    var innerHeight = innerWidth * vis.aspectratio;

    vis.camera.aspect = innerWidth / innerHeight;
    vis.camera.updateProjectionMatrix();
    vis.renderer.setSize(innerWidth, innerHeight);
    vis.controls.handleResize();
  }

}


Innovation3d.prototype.wrangleData = function() {
  var vis = this;
  vis.selectedSchools = JSON.parse(localStorage.getItem("colleges"));

  drawColleges();
  vis.updateVis();

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

    vis.scene.add(tmpMesh);

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
    shape.moveTo(-circleRadius, 0);

    shape.absarc(0, 0, circleRadius, 0, 1.5 * Math.PI, false);
    shape.lineTo(0, 0);
    shape.closePath();

    var geometry = shape.extrude(extrudeSettings);

    vis.scene.add(new THREE.Mesh(geometry, new THREE.MeshNormalMaterial()));
    return;
  }

  function drawColleges() {

    var zoneCount = [0, 0, 0, 0, 0];
    var zone;
    var x, y, z, r, alt, angle;
    var cube;

    drawLegend();

    for (var i = 0; i < p171.predictions.length; i++) {
      if (vis.selectedSchools.indexOf(p171.predictions[i].college) < 0) continue;
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

      var textGeometry = new THREE.TextGeometry(p171.predictions[i].college, vis.options);
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
      vis.scene.add(mesh);
      cube = new THREE.BoxGeometry(1, y + (4 - zone) * 50, 10);

      addObjectColor(cube, 0x000000, x, 0, z, 0);
    }
  }
}

Innovation3d.prototype.updateVis = function() {
  var vis = this;
  animate();

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    // update
    var delta = vis.clock.getDelta();

    vis.controls.update();
    if (vis.mixer) {
      vis.mixer.update(delta);
    }

    // render scene
    vis.renderer.render(vis.scene, vis.camera);

  }
}

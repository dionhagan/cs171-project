/*
 * 3D Visualization, uses three.js
 *
 *  Scene has an unusual coordinate system:
 *  Origin is 0,0,0
 *  y is the vertical axis
 *  x = -500 is deep into the scene
 *  z = +250 is left of scene
 *  z = -250 is right of scene
 */


var Innovation3d = function(_parentElement) {
  this.parentElement = _parentElement;

  this.initVis();
}

Innovation3d.prototype.initVis = function(callback) {
  var vis = this;
  vis.aspectratio = 0.4;
  vis.innerWidth = 1000;
  vis.innerHeight = vis.innerWidth * vis.aspectratio;
  vis.zoneSize = 250;
  vis.zoneHeight = 200;
  vis.college3d = []; //list of college objects

  // Colors
  vis.color = {};
  vis.color.black = new THREE.Color(0, 0, 0);
  vis.color.crimson = new THREE.Color("hsl(0,100%,27%)");
  vis.color.sand = new THREE.Color(0x816452);

  // Text
  vis.options = {
    size: 50,
    height: 1,
    weight: 'normal',
    style: 'normal',
    bevelEnabled: false,
    curveSegments: 12,
    steps: 1
  };
  var loader = new THREE.FontLoader();

  var mesh, geometry;
  var sunLight, pointLight, ambientLight;
  var gui, shadowCameraHelper, shadowConfig = {
    shadowCameraVisible: false,
    shadowCameraNear: 750,
    shadowCameraFar: 4000,
    shadowCameraFov: 30,
    shadowBias: -0.0002
  };

  vis.clock = new THREE.Clock();

  // remove any previous DOM items and add back new ones
  if (document.getElementById(vis.parentElement).childNodes.length > 0) {
    document.getElementById(vis.parentElement).removeChild(document.getElementById(vis.parentElement).childNodes[0]);
  }
  vis.container = document.createElement('div');
  document.getElementById(vis.parentElement).appendChild(vis.container);


  // CAMERA
  vis.camera = new THREE.PerspectiveCamera(45, vis.innerWidth / vis.innerHeight, 2, 1000000);
  vis.camera.position.set(1340, 700, 125); //6 * vis.zoneSize, 4 * vis.zoneHeight, 100);

  // SCENE
  vis.scene = new THREE.Scene();

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

  // LIGHTS
  ambientLight = new THREE.AmbientLight(0xffffff); //0x3f2806);
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

  // SKY
  var sky, sunSphere;
  sky = new THREE.Sky();
  vis.scene.add(sky.mesh);

  sunSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(2000, 16, 8),
    new THREE.MeshBasicMaterial({
      color: 0xffffff
    })
  );
  sunSphere.position.y = 0000;
  sunSphere.visible = false;
  vis.scene.add(sunSphere);

  var distance = 00;
  var effectController = {
    turbidity: 10,
    reileigh: 0.2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    luminance: 1,
    inclination: 0, // elevation / inclination
    azimuth: 0.25, // Facing front,
    sun: !true
  };
  var uniforms = sky.uniforms;
  uniforms.turbidity.value = effectController.turbidity;
  uniforms.reileigh.value = effectController.reileigh;
  uniforms.luminance.value = effectController.luminance;
  uniforms.mieCoefficient.value = effectController.mieCoefficient;
  uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
  var theta = Math.PI * (effectController.inclination - 0.5);
  var phi = 2 * Math.PI * (effectController.azimuth - 0.5);
  sunSphere.position.x = -100; //distance * Math.cos(phi);
  sunSphere.position.y = 0; //distance * Math.sin(phi) * Math.sin(theta);
  sunSphere.position.z = 0; //distance * Math.sin(phi) * Math.cos(theta);
  sunSphere.visible = effectController.sun;
  sky.uniforms.sunPosition.value.copy(sunSphere.position);


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
  // The 3D visualization is responsive and works on mobile devices
  window.addEventListener('resize', onWindowResize, false);

  function onWindowResize(event) {
    var innerWidth = document.getElementById('three-area').clientWidth;
    var innerHeight = innerWidth * vis.aspectratio;

    vis.camera.aspect = innerWidth / innerHeight;
    vis.camera.updateProjectionMatrix();
    vis.renderer.setSize(innerWidth, innerHeight);
    vis.controls.handleResize();
  }

  // load font asynchrononously. Once the font is loaded, the drawing can proceed
  loader.load('fonts/optimer_regular.typeface.js', function(response) {
    vis.options.font = response;
    vis.buildBackground(response);
    vis.wrangleData();
  });
}

// Create the theatre
Innovation3d.prototype.buildBackground = function(myFont) {
  var vis = this;
  var x, y, z, cube, angle, textGeometry, zoneLabel;
  var textMaterial = new THREE.MeshBasicMaterial({
    color: vis.color.black,
    vertexColors: THREE.FaceColors,
    wireframe: false,
    opacity: 1.0,
    transparent: false,
    side: THREE.DoubleSide,
    visible: true
  });
  var options = {
    size: 30,
    height: 2,
    font: myFont,
    weight: 'normal',
    style: 'normal',
    bevelEnabled: false,
    curveSegments: 12,
    steps: 1
  };

  for (var zone = 0; zone < 6; zone++) {
    // pi /16 stones per semi-circle
    for (var stone = 0; stone < 17; stone++) {
      angle = stone * Math.PI / 16 - (Math.PI / 2);
      r = (zone + 1) * vis.zoneSize;
      z = Math.sin(angle) * r;
      x = -Math.sqrt(Math.pow(r, 2) - Math.pow(z, 2));

      cube = new THREE.BoxGeometry(vis.zoneSize,
        (zone * vis.zoneHeight) + vis.zoneHeight, r * Math.PI / 16);

      vis.scene.add(vis.addObjectColor(cube, vis.color.sand,
        x, 0, z, angle));
    }
    // don't label the outermost band
    if (zone == 0) continue;
    zoneLabel = String((zone - 1) * 20) + "%-" + String((zone) * 20) + "%";
    textGeometry = new THREE.TextGeometry(zoneLabel, options);

    var mesh = new THREE.Mesh(textGeometry, textMaterial);
    mesh.rotation.y = 1.5;
    mesh.position.set(30 * zone + 80, 20, -(zone * (vis.zoneSize - 20) - 75));

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    vis.scene.add(mesh);
  }
}

// Add a colored object to the scene
Innovation3d.prototype.addObjectColor = function addObjectColor(geometry, color, x, y, z, ry) {
  function addObject(geometry, material, x, y, z, ry) {
    var tmpMesh = new THREE.Mesh(geometry, material);
    tmpMesh.position.set(x, y, z);
    tmpMesh.rotation.y = ry;
    tmpMesh.castShadow = true;
    tmpMesh.receiveShadow = true;
    return tmpMesh;
  }

  var material = new THREE.MeshPhongMaterial({
    color: color
  });

  return addObject(geometry, material, x, y, z, ry);
}

Innovation3d.prototype.wrangleData = function() {
  var vis = this;
  vis.selectedSchools = JSON.parse(localStorage.getItem("colleges"));

  drawColleges();
  vis.updateVis();

  function drawColleges() {

    var zoneCount = [0, 0, 0, 0, 0];
    var zone;
    var x, y, z, r, alt, angle, rotation;
    var cube;
    var MAXITEMS = 12;

    for (var i = 0; i < p171.predictions.length; i++) {
      // remove previous schools prior to adding them back
      if (vis.college3d[i]) {
        vis.scene.remove(vis.college3d[i]._3dmesh);
        vis.college3d[i] = null;
      }
      if (vis.selectedSchools.indexOf(p171.predictions[i].college) < 0) continue;
      zone = Math.floor(p171.predictions[i].prob * 100 / 20);

      // switch sides from left to right of center
      alt = (zoneCount[zone] % 2 == 0) ? 1 : -1;
      // is there still space in this zone?
      if (zoneCount[zone] < 7) {
        angle = alt * zoneCount[zone] * Math.PI / MAXITEMS;
        r = (zone + 1) * vis.zoneSize;
        rotation = angle + Math.PI / 2;
      } else {
        // offset the items and move them closer
        angle = alt * (zoneCount[zone] % MAXITEMS) * Math.PI / MAXITEMS + 0.5 * (Math.PI / MAXITEMS);
        if (alt > 0) {
          rotation = 5 / 8 * Math.PI;
          r = (zone + 1) * vis.zoneSize - 200;
        } else {
          rotation = 0;
          r = (zone + 1) * vis.zoneSize - 100;
        }
      }

      z = Math.sin(angle) * r;
      x = -Math.sqrt(Math.pow(r, 2) - Math.pow(z, 2));
      y = (zone) * vis.zoneHeight / 2 + 150;
      //console.log("zoneCount, zone,r,angle,x,z",p171.predictions[i].college,zoneCount[zone],zone,r,angle*57.3,x,z);

      zoneCount[zone]++;
      vis.options.size = Math.max(20, (zone) * 9);
      var textGeometry = new THREE.TextGeometry(p171.predictions[i].college, vis.options);
      var textMaterial = new THREE.MeshBasicMaterial({
        color: vis.color.black, // was: p171.predictions[i].color,
        vertexColors: THREE.FaceColors,
        wireframe: false,
        opacity: 1.0,
        transparent: false,
        side: THREE.DoubleSide,
        visible: true
      });

      var mesh = new THREE.Mesh(textGeometry, textMaterial);
      mesh.rotation.y = rotation;
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      vis.college3d[i] = {};
      vis.college3d[i]['_3dmesh'] = mesh;
      vis.scene.add(vis.college3d[i]['_3dmesh']);

      // to get size of resulting mesh
      //var box = new THREE.Box3().setFromObject(mesh);
      //console.log(p171.predictions[i].college,box.min, box.max, box.size());

      // to add flag poles
      //cube = new THREE.BoxGeometry(1, 2*y, 10);
      //vis.college3d[i]['_3dbox'] = vis.addObjectColor(cube, 0x000000, x, 0, z, 0);
      //vis.scene.add(vis.college3d[i]['_3dbox']);
    }
  }
}

Innovation3d.prototype.updateVis = function() {
  var vis = this;
  animate();

  // slow animation to 20 fps save CPU time
  // Ref: http://stackoverflow.com/questions/11285065/limiting-framerate-in-three-js-to-increase-performance-requestanimationframe
  function animate() {
    setTimeout(function() {
      requestAnimationFrame(animate);
    }, 1000 / 20.);
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

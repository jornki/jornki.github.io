'use strict';

var main = {

	scene: null,
	camera: null,
	renderer: null,
	cubeSpotLight: null,
	sound: null,

	earth: null,
	earthSettings: {
		animate: false,
		increase: true,
		rate: 0.005
	},

	cube: null,
	cubeSettings: {
		geometry: {
			width: 0.025,
			height: 0.05,
			depth: 0.0075
		},
		increase: true,
		rate: 0.005,
		animate: false,
		rotate: true
	},

	spotlight: null,
	lightSettings: {
		increase: true,
		rate: 0.005,
		minIntensity: 0.1,
		maxIntensity: 1.0,
		animate: false
	},

	cubeDirLight: null,

	pointLight: null,

	projector: null,

	animate: null,

	angularSpeed: 0.1,
	lastTime: 0,

	init: function() {
		this.sound = new Audio('2001.m4a');
		this.sound.addEventListener('canplay', function(e) {
			this.start();
		}.bind(this));
		this.sound.addEventListener('error', function(e) {
			alert('Your browser cannot play m4a files - try Safari or Chrome');
			return;
		});

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer();
		this.projector = new THREE.Projector();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		this.camera.position.z = 5;

		this.addSphere(function() {
			Tweener.addTween(this.earth.material, {
				opacity: 1,
				delay: 2,
				time: 5
			});
		}.bind(this));
		this.addDirectionalLight();
		this.setupDOMEvents();
		this.render();
	},

	start: function() {
		this.addCube();
		this.addCubeSpotLight();
	},

	addCube: function() {
		var geometry = new THREE.BoxGeometry(
			this.cubeSettings.geometry.width,
			this.cubeSettings.geometry.height,
			this.cubeSettings.geometry.depth
		);
		var material = new THREE.MeshPhongMaterial({
			color: 0x040300,
			transparent: true
			//map: THREE.ImageUtils.loadTexture('earthbump1k.jpg')
		});

		this.cube = new THREE.Mesh(geometry, material);
		this.cube.position.x = 0;
		this.cube.position.z = 4.8;
		material.opacity = 0;
		this.scene.add(this.cube);

		this.sound.play();
		Tweener.addTween(material, {
			opacity: 1,
			time: 5,
			delay: 10,
			transition: "easeNone",
		});
	},

	addSphere: function(callback) {
		var geometry = new THREE.SphereGeometry(2.7, 32, 32);
		var material = new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture('1_earth_8k.jpg', null, function() {
				callback();
			}),
			bumpMap: THREE.ImageUtils.loadTexture('earthbump1k.jpg'),
			bumpScale: 0.005,
			transparent: true
		});
		this.earth = new THREE.Mesh(geometry, material);
		this.earth.position.x = -1.5;
		this.earth.position.y = -1.5;
		material.opacity = 0;
		this.scene.add(this.earth);
	},

	/*addAmbientLight: function() {
		// add subtle blue ambient lighting
		var ambientLight = new THREE.AmbientLight(0x0000ff);
		ambientLight.intensity = 0.02;
		this.scene.add(ambientLight);
	},*/

	addDirectionalLight: function() {
		this.spotlight = new THREE.SpotLight(0xffffff, 1.7);
		this.spotlight.position.set(-1, 6, 1);
		this.spotlight.lookAt(this.earth);
		this.scene.add(this.spotlight);
	},

	/*addPointLight: function() {
		this.pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
		this.pointLight.position.set(0, 0, 2.4);
		this.scene.add(this.pointLight);
		this.scene.add(new THREE.PointLightHelper(this.pointLight, 3));
	},*/

	addCubeSpotLight: function() {
		this.cubeSpotLight = new THREE.SpotLight(0xffffff);
		this.cubeSpotLight.position.set(0, 0, 5);
		this.cubeSpotLight.intensity = 1.5;
		this.cubeSpotLight.distance = 2.87;
		this.cubeSpotLight.lookAt(this.cube);
		this.scene.add(this.cubeSpotLight);
	},

	detectClick: function(mouseVector) {

		var raycaster = this.projector.pickingRay(mouseVector.clone(), this.camera);
		var intersects = raycaster.intersectObjects([this.cube, this.earth]);
		if (intersects.length > 0) {
			if (intersects[0].object.uuid === this.cube.uuid) {
				Tweener.addTween(this.cube.position, {
					x: -1.2,
					z: 2.3,
					time: 5,
					transition: "easeInOutCubic"
				});

				Tweener.addTween(this.cube.material, {
					opacity: 0,
					time: 1,
					delay: 4,
					transition: "easeNone",
					onComplete: function() {
						Tweener.addTween(this.sound, {
							volume: 0,
							time: 2,
							delay: 0.5,
							onComplete: function() {
								this.sound.pause();
							}.bind(this)
						});
					}.bind(this)
				});
			}
		}
	},

	render: function() {
		requestAnimationFrame(this.render.bind(this));
		this.renderer.render(this.scene, this.camera);

		if (this.cube) {
			if (this.cubeSettings.rotate) {
				var time = (new Date()).getTime();
				var timeDiff = time - this.lastTime;
				var angleChange = this.angularSpeed * timeDiff * 2 * Math.PI / 1000;
				this.cube.rotation.y += angleChange;
				this.lastTime = time;
			}
		}

		if (this.earth) {
			this.earth.rotation.y += 0.0003;
		}
	},

	// DOM EVENTS
	setupDOMEvents: function() {
		document.querySelector('canvas').addEventListener('click', function(event) {
			event.preventDefault();
			console.log(event.clientX / event.target.width * 2, event.clientY / event.target.height * 2);
			var mouseVector = new THREE.Vector3();
			mouseVector.x = 2 * (event.clientX / window.innerWidth) - 1;
			mouseVector.y = 1 - 2 * (event.clientY / window.innerHeight);
			this.detectClick(mouseVector);
		}.bind(this), false);
	}

};

main.init();
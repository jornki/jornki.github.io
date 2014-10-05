'use strict';

var main = {

	scene: null,
	camera: null,
	renderer: null,
	cubeSpotLight: null,
	sound: null,

	earth: null,

	cube: null,
	cubeSettings: {
		mouseOverAnimating: false
	},

	spotlight: null,

	isMobileDevice: true,

	pointLight: null,

	projector: null,

	init: function() {
		this.detectMobileDevice();

		// Setup the scene and stuff
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer();
		this.projector = new THREE.Projector();

		// Use the whole window
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		// Pull the camera back a bit
		this.camera.position.z = 5;

		// Now ann earth
		// Fade it in when the texture has loaded
		this.addSphere(function() {
			Tweener.addTween(this.earth.material, {
				opacity: 1,
				delay: 2,
				time: 5
			});
		}.bind(this));

		// Sound
		if (!this.isMobileDevice) {
			this.initiateSound();
		} else {
			// iOS requires that sound is user initiated
			var startScreen = document.querySelector('#start');
			startScreen.style.display = "block";
			startScreen.addEventListener('touchstart', this.initiateSound.bind(this));
		}
	},

	initiateSound: function(e) {
		// Load and start playing the sound
		this.sound = new Audio('2001.m4a');
		this.sound.play();

		// Remove the mobile startscreen
		if (this.isMobileDevice) {
			document.querySelector('#start').style.display = "none";
		}

		// When the sound can be played
		this.sound.addEventListener('loadeddata', function() {
			// .. start the whole shit
			this.start();
		}.bind(this));

		// Notify people which cannot play aac (Firefox)
		this.sound.addEventListener('error', function(e) {
			alert('Your browser cannot play m4a files - try Safari or Chrome');
		});
	},

	start: function() {
		// The spot for the earth
		this.addDirectionalLight();

		// Add the monolith
		this.addCube();
		// Add the light to the monolith
		this.addCubeSpotLight();

		// Attach the events
		this.setupDOMEvents();

		// Start rendering
		this.render();
	},

	addCube: function() {
		var geometry = new THREE.BoxGeometry(
			0.025,
			0.05,
			0.0075
		);
		var material = new THREE.MeshPhongMaterial({
			color: 0x040300,
			transparent: true
		});

		this.cube = new THREE.Mesh(geometry, material);
		this.cube.position.x = 0;
		this.cube.position.z = 4.8;
		material.opacity = 0;
		this.scene.add(this.cube);

		Tweener.addTween(material, {
			opacity: 1,
			time: 5,
			delay: 10,
			transition: "easeNone",
		});
	},

	addSphere: function(callback) {

		var map, bumpMap;
		if (this.isMobileDevice) {
			map = '1_earth_8k_mobile.jpg';
			bumpMap = 'earthbump1k_mobile.jpg';
		} else {
			map = '1_earth_8k.jpg';
			bumpMap = 'earthbump1k.jpg';
		}


		var geometry = new THREE.SphereGeometry(2.7, 32, 32);
		var material = new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture(map, null, function() {
				callback();
			}),
			bumpMap: THREE.ImageUtils.loadTexture(bumpMap),
			bumpScale: 0.005,
			transparent: true
		});
		this.earth = new THREE.Mesh(geometry, material);
		this.earth.position.x = -1.5;
		this.earth.position.y = -1.5;
		material.opacity = 0;
		this.scene.add(this.earth);
	},

	// The light for earth
	addDirectionalLight: function() {
		this.spotlight = new THREE.SpotLight(0xffffff, 1.7);
		this.spotlight.position.set(-1, 6, 1);
		this.spotlight.lookAt(this.earth);
		this.scene.add(this.spotlight);
	},

	// The light for the monolith
	addCubeSpotLight: function() {
		this.cubeSpotLight = new THREE.SpotLight(0xffffff);
		this.cubeSpotLight.position.set(0, 0, 5);
		this.cubeSpotLight.intensity = 1.5;
		this.cubeSpotLight.distance = 2.87;
		this.cubeSpotLight.lookAt(this.cube);
		this.scene.add(this.cubeSpotLight);
	},

	// When the user clicks or taps the screen
	detectClick: function(mouseVector) {
		// Cast a ray from the camera to where the event happened
		var raycaster = this.projector.pickingRay(mouseVector.clone(), this.camera);
		// Get all intersections
		var intersects = raycaster.intersectObjects([this.cube, this.earth]);
		if (intersects.length > 0) {
			// Check if the ray intersects with the monolith
			if (intersects[0].object.uuid === this.cube.uuid) {
				// If so, start the dramatic exit phase

				// Move the monolith into earth
				Tweener.addTween(this.cube.position, {
					x: -1.2,
					z: 2.3,
					time: 5,
					transition: "easeInOutCubic"
				});

				// Face it out when it approaches earth
				Tweener.addTween(this.cube.material, {
					opacity: 0,
					time: 1,
					delay: 3.5,
					transition: "easeNone",
					onComplete: function() {
						// The monolith is now gone, so we can stop rendering it
						this.cube = null;

						// Stop the sound on mobile devices
						// or fade it out on desktop devices
						if (this.isMobileDevice) {
							this.sound.pause();
						} else {
							Tweener.addTween(this.sound, {
								volume: 0,
								time: 2,
								delay: 0.5,
								onComplete: function() {
									this.sound.pause();
								}.bind(this)
							});
						}
					}.bind(this)
				});
			}
		}
	},

	// Makes the monolith react to when a mouse pointer hovers over it
	detectMouseOver: function(mouseVector) {
		var raycaster = this.projector.pickingRay(mouseVector.clone(), this.camera);
		var intersects = raycaster.intersectObjects([this.cube, this.earth]);

		if (intersects.length > 0 && intersects[0].object.uuid === this.cube.uuid) {
			var scaleBy = 1.1;
			this.cubeSettings.mouseOverAnimating = true;
			Tweener.addTween(this.cube.scale, {
				x: scaleBy,
				y: scaleBy,
				z: scaleBy,
				time: 0.5,
				transition: "easeOutCubic",
				onComplete: function() {
					Tweener.addTween(this.cube.scale, {
						x: 1,
						y: 1,
						z: 1,
						time: 1,
						transition: "easeOutCubic",
						onComplete: function() {
							this.cubeSettings.mouseOverAnimating = false;
						}.bind(this)
					});
				}.bind(this)
			});
		}
	},

	// Rendering
	render: function() {

		// If the monolith still exists, rotate it
		if (this.cube) {
			this.cube.rotation.y += 0.01;
		}

		if (this.earth) {
			this.earth.rotation.y += 0.0003;
		}

		// Re-render at 60fps
		requestAnimationFrame(this.render.bind(this));

		// Main render
		this.renderer.render(this.scene, this.camera);
	},

	// DOM EVENTS
	setupDOMEvents: function() {
		var ev = this.isMobileDevice ? "touchstart" : "click";
		document.querySelector('canvas').addEventListener(ev, function(event) {
			event.preventDefault();
			console.log(event.clientX / event.target.width * 2, event.clientY / event.target.height * 2);
			var mouseVector = new THREE.Vector3();
			mouseVector.x = 2 * (event.clientX / window.innerWidth) - 1;
			mouseVector.y = 1 - 2 * (event.clientY / window.innerHeight);
			this.detectClick(mouseVector);
		}.bind(this), false);

		if (!this.isMobileDevice) {
			document.querySelector('canvas').addEventListener('mousemove', function(event) {
				if (!this.cube || this.cubeSettings.mouseOverAnimating === true) {
					return;
				}
				event.preventDefault();
				var mouseVector = new THREE.Vector3();
				mouseVector.x = 2 * (event.clientX / window.innerWidth) - 1;
				mouseVector.y = 1 - 2 * (event.clientY / window.innerHeight);
				this.detectMouseOver(mouseVector);
			}.bind(this), false);
		}

	},

	detectMobileDevice: function() {
		var UAString = navigator.userAgent.toLowerCase();
		if ((UAString.indexOf('ipad') > -1) || (UAString.indexOf('iphone') > -1)) {
			return this.isMobileDevice = true;
		}

		return this.isMobileDevice = false;
	}

};

main.init();
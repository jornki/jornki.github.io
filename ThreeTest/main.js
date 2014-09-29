'use strict';

var main = {

	scene    : null,
	camera   : null,
	renderer : null,

	earth         : null,
	earthSettings : {
		animate  : false,
		increase : true,
		rate     : 0.005
	},

	cube         : null,
	cubeSettings : {
		geometry : {
			width  : 0.5,
			height : 1,
			depth  : 0.15
		},
		increase : true,
		rate     : 0.005,
		animate  : false,
		rotate   : true
	},

	spotlight     : null,
	lightSettings : {
		increase     : true,
		rate         : 0.005,
		minIntensity : 0.1,
		maxIntensity : 1.0,
		animate      : false
	},

	cubeDirLight : null,

	pointLight : null,

	projector : null,

	animate : null,

	angularSpeed : 0.1,
	lastTime     : 0,

	init : function () {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer();
		this.projector = new THREE.Projector();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		this.camera.position.z = 5;

		this.addCube();
		this.addSphere();
		//this.addAmbientLight();
		this.addDirectionalLight();
		this.addPointLight();
		this.setupDOMEvents();
		this.render();
	},

	addCube : function () {
		var geometry = new THREE.BoxGeometry(
			this.cubeSettings.geometry.width,
			this.cubeSettings.geometry.height,
			this.cubeSettings.geometry.depth
		);
		var material = new THREE.MeshPhongMaterial({
			color : 0x0e0e0e
			//map: THREE.ImageUtils.loadTexture('earthcloudmaptrans.jpg')
		});

		this.cube = new THREE.Mesh(geometry, material);
		this.cube.overdraw = true;
		//this.cube.rotation.x = Math.PI * 0.1;
		this.cube.position.x = 2;
		this.scene.add(this.cube);

		this.cubeDirLight = new THREE.DirectionalLight(0xffffff, 1.0);
		this.cubeDirLight.target = this.cube;
		this.cubeDirLight.position.x = 2;
		this.cubeDirLight.rotation.x = Math.PI * 0.1;
		this.cubeDirLight.intensity = 1.0;
		this.scene.add(this.cubeDirLight);
	},

	addSphere : function () {
		var geometry = new THREE.SphereGeometry(1, 32, 32);
		var material = new THREE.MeshPhongMaterial(
			{
				map       : THREE.ImageUtils.loadTexture('1_earth_8k.jpg'),
				bumpMap   : THREE.ImageUtils.loadTexture('earthbump1k.jpg'),
				bumpScale : 0.005
			}
		);
		this.earth = new THREE.Mesh(geometry, material);
		this.earth.position.x = -1.2;
		this.earth.overdraw = true;
		this.scene.add(this.earth);
	},

	addAmbientLight : function () {
		// add subtle blue ambient lighting
		var ambientLight = new THREE.AmbientLight(0x00ff00);
		ambientLight.intensity = 0.2;
		this.scene.add(ambientLight);
	},

	addDirectionalLight : function () {
		// directional lighting
		this.spotlight = new THREE.DirectionalLight(0xffffff);
		this.spotlight.position.set(1.5, 1, 1).normalize();
		this.scene.add(this.spotlight);
	},

	addPointLight : function () {
		this.pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
		this.pointLight.position.set(0, 0, 0);
		this.scene.add(this.pointLight);
	},

	detectClick : function (mouseVector) {

		var raycaster = this.projector.pickingRay(mouseVector.clone(), this.camera);
		var intersects = raycaster.intersectObjects([this.cube, this.earth]);
		//console.log(mouseVector, this.cube.position);
		if (intersects.length > 0) {
			//intersects[0].object.material.color.setHex(0xff0000);
			console.log(intersects[0].object.uuid, this.earth.uuid);
			/*if (intersects[0].object.uuid === this.earth.uuid) {
				this.earthSettings.animate = true;
			} else {
				if (this.cubeSettings.animate) {
					this.cubeSettings.animate = false;
				} else {
					this.cubeSettings.animate = true;
				}
			}*/
			this.animate = true;
		}
	},

	render         : function () {
		requestAnimationFrame(this.render.bind(this));
		this.renderer.render(this.scene, this.camera);

		if (this.spotlight && this.lightSettings.animate) {
			if (this.lightSettings.increase) {
				this.spotlight.intensity += this.lightSettings.rate;
				if (this.spotlight.intensity >= this.lightSettings.maxIntensity) {
					this.lightSettings.increase = false;
				}
			} else {
				this.spotlight.intensity -= this.lightSettings.rate;
				if (this.spotlight.intensity <= this.lightSettings.minIntensity) {
					this.lightSettings.increase = true;
				}
			}
		}

		if (this.cube) {
			if (this.cubeSettings.rotate) {
				var time = (new Date()).getTime();
				var timeDiff = time - this.lastTime;
				var angleChange = this.angularSpeed * timeDiff * 2 * Math.PI / 1000;
				this.cube.rotation.y += angleChange;
				this.lastTime = time;
			}

			if (this.animate) {
				if (this.cube.position.x >= 0.2) {
					this.cube.position.x -= 0.005;
				}
				if (this.cube.position.z <= 1.3) {
					this.cube.position.z += 0.005;
				}
			}
		}

		if (this.earth) {
			this.earth.rotation.y += 0.005;

			if(this.animate) {
				if (this.earth.position.x <= 0) {
					this.earth.position.x += 0.005;
				}
			}

		}
	},

	// DOM EVENTS
	setupDOMEvents : function () {
		document.querySelector('canvas').addEventListener('click', function (event) {
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
import RenderManeger3D from "./utils/RenderManeger3D";


/*--------------------------------------------------------------------------
	parameter
--------------------------------------------------------------------------*/
let renderManeger3D;

// 数値のパーティクル座標管理リスト
let numberList = [];

// 表示時間のパーティクルリスト（文字単位）
let particleList = [];

// font data
let fontData;

// 現在時
let now = getNow();


/*--------------------------------------------------------------------------
	init
--------------------------------------------------------------------------*/
function init() {
	renderManeger3D = new RenderManeger3D($("#canvas_container"), {
		isController: true
	});


	// 文字単位のパーティクル量(初期値)
	renderManeger3D.gui.params.particles = 4000 * 6;
	renderManeger3D.gui.params.size = 1;
	renderManeger3D.gui.params.opacity = 0.5;
	renderManeger3D.gui.params.noise = 1.5;


	// 数値のパーティクル座標管理リストの生成
	let loader = new THREE.FontLoader();
	let typeface = "../assets/fonts/helvetiker_bold.typeface.json?" + performance.now();

	loader.load(typeface, (font) => {
		fontData = font;

		// dat.gui
		renderManeger3D.gui.add(renderManeger3D.gui.params, 'particles', 1000, 100000).step(10).onChange((val) => {
			createParticle();
		});

		renderManeger3D.gui.add(renderManeger3D.gui.params, 'size', 0.1, 10).onChange((val) => {
			particleList.forEach((item, i) => {
				item.material.uniforms.size.value = val;
			});
		});

		renderManeger3D.gui.add(renderManeger3D.gui.params, 'opacity', 0.1, 1).onChange((val) => {
			particleList.forEach((item, i) => {
				item.material.uniforms.opacity.value = val;
			});
		});

		renderManeger3D.gui.add(renderManeger3D.gui.params, 'noise', 0, 5).onChange((val) => {
			particleList.forEach((item, i) => {
				item.material.uniforms.noise.value = val;
			});
		});

		// パーティクル生成
		createParticle();

		// start
		renderManeger3D.start();
	});


	// camera positon
	if (INK.isSmartPhone()) {
		renderManeger3D.camera.position.z = 360;
	} else {
		renderManeger3D.camera.position.z = 120;
	}


	// update
	renderManeger3D.event.on("update", () => {
		particleList.forEach((item, i) => {
			item.material.uniforms.time.value = renderManeger3D.time;
		});

		let _now = getNow();
		if (now != _now) {
			for (let i = 0; i < now.length; i++) {
				if (now[i] != _now[i]) {
					morphTo(i, +_now[i]);
				}
			}
			now = _now;
		}
	});
}


/*--------------------------------------------------------------------------
	createParticle
--------------------------------------------------------------------------*/
function createParticle(){
	for (let i = 0; i < 10; ++i) {
		numberList[i] = {};

		// TextGeometry
		numberList[i].geometry = new THREE.TextGeometry(i, {
			font: fontData,
			size: 40,
			height: 8,
			curveSegments: 10,
		});

		// ジオメトリを中点の中央に配置
		numberList[i].geometry.center();

		// Geometry パーティクル管理用
		numberList[i].particles = new THREE.Geometry();

		// TextGeometry内にランダムな頂点を追加
		numberList[i].particles.vertices = THREE.GeometryUtils.randomPointsInGeometry(numberList[i].geometry, renderManeger3D.gui.params.particles / 6);

		numberList[i].particles.offsets = [];
		numberList[i].particles.vertices.forEach((vertex) => {
			numberList[i].particles.offsets.push(vertex.x, vertex.y, vertex.z);
		});
	}

	// パーティクル削除
	renderManeger3D.scene.remove.apply(renderManeger3D.scene, renderManeger3D.scene.children);


	// ベースの三角形
	var positions = [
		0.0, 0.5, 0,
		0.5, -0.5, 0,
		-0.5, -0.5, 0.0
	];


	// パーティクル追加
	for (let j = 0; j < now.length; ++j) {
		let offsets = numberList[+now[j]].particles.offsets.concat();

		let colors = [];
		let vector = new THREE.Vector4();
		let rotate = [];

		for (let k = 0; k < renderManeger3D.gui.params.particles / 6; k += 1) {
			colors.push(Math.random(), Math.random(), Math.random());

			vector.set(
				(Math.random() * 2 - 1),
				(Math.random() * 2 - 1),
				(Math.random() * 2 - 1),
				(Math.random() * 2 - 1 * INK.TWO_PI)
			);
			rotate.push(vector.x, vector.y, vector.z, vector.w);
		}


		let geometry = new THREE.InstancedBufferGeometry();
		geometry.maxInstancedCount = renderManeger3D.gui.params.particles / 6;
		geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions.concat(), 3));
		geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
		geometry.addAttribute('nextOffset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
		geometry.addAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 3));
		geometry.addAttribute('rotate', new THREE.InstancedBufferAttribute(new Float32Array(rotate), 4));


		let uniforms = {
			time: { value: 1.0 },
			progress: { type: "f", value: 0 },
			size: { type: "f", value: renderManeger3D.gui.params.size },
			opacity: { type: "f", value: renderManeger3D.gui.params.opacity },
			noise: { type: "f", value: renderManeger3D.gui.params.noise },
		};

		let material = new THREE.RawShaderMaterial({
			uniforms: uniforms,
			vertexShader: require("../../shader/default.vert"),
			fragmentShader: require("../../shader/default.frag"),
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});

		let particleSystem = new THREE.Mesh(geometry, material);

		// 文字を中央配置
		particleSystem.position.x = 34 * j - (34 * 2.55);

		// 時間管理用パーティクル
		particleList[j] = particleSystem;

		renderManeger3D.scene.add(particleSystem);
	}
}


/*--------------------------------------------------------------------------
	utils
--------------------------------------------------------------------------*/
/**
 * @method morphTo モーフィングアニメーション
 * @param {Number} index 桁数（頭から数えて）
 * @param {Number} num アニメーションする数字
 */
function morphTo(index, num) {
	let attributes = particleList[index].geometry.attributes;

	attributes.nextOffset.array = new Float32Array(numberList[num].particles.offsets);

	particleList[index].material.uniforms.progress.value = 0;

	attributes.offset.needsUpdate = true;
	attributes.nextOffset.needsUpdate = true;

	TweenMax.to(particleList[index].material.uniforms.progress, .6, {
		value: 1,
		ease: Expo.easeOut,
		onComplete: () => {
			attributes.offset.array = new Float32Array(numberList[num].particles.offsets);
		}
	});
}


/**
 * @method getNow 現在の時、分、秒を文字列にして返す
 * @return {String}
 */
function getNow() {
	let date = new Date();
	return zeroPadding(date.getHours()) + zeroPadding(date.getMinutes()) + zeroPadding(date.getSeconds());
}


/**
 * @method zeroPadding 1桁の場合、先頭に0を追加して2桁にする
 * @param {Number} num
 * @return {String}
 */
function zeroPadding(num) {
	let numStr = "" + num;
	if (numStr.length < 2) {
		numStr = "0" + numStr;
	}
	return numStr;
}


/*==========================================================================
	DOM READY
==========================================================================*/
$(() => {
	init();
});

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class ModelController
{
    constructor(elementId, modelPath = './glb/stage.glb', onLoaded = null)
    {
        this.modelAreaElement = document.getElementById(elementId);
        this.width = this.modelAreaElement.clientWidth;
        this.height = this.modelAreaElement.clientHeight;
        this.modelPath = modelPath;

        this.onLoaded = onLoaded;

        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initControls();
        this.initLights();

        this.loadModel();

        this.bindEvents();
        this.animate();
    }

    initScene()
    {
        // 3D空間を作成
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);   // 背景の色
    }

    initCamera()
    {
        // カメラを作成 (視野角, 画面の比率, クリップ手前, クリップ奥)
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        this.camera.position.set(0, 0.7, 0.2);   // カメラの初期位置 (少し上、少し後ろに引く)
    }

    initRenderer()
    {
        // レンダラー (画面に描画する仕組み) を作成
        this.renderer = new THREE.WebGLRenderer({anialias: true});   // ギザギザを滑らかに
        this.renderer.setSize(this.width, this.height);

        // HTMLに要素追加
        this.modelAreaElement.appendChild(this.renderer.domElement);
    }

    initControls()
    {
        // マウス操作の設定
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    initLights()
    {
        // ライトの設定
        // 全体を均一に照らす光 (環境光)
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(5, 10, 7);
        this.scene.add(this.directionalLight);
    }

    // シェイプキーがついているmeshを探す関数
    findMesh(model)
    {
        let mesh = null;
        model.traverse((child) => {
            if(child.isMesh && child.morphTargetInfluences)
            {
                console.log(`本物のメッシュを発見: ${child.name}`);
                mesh = child;
            }
        });
        return mesh;
    }

    // シェイプキーを動かす関数
    shapeKeysControlls(mesh, i)
    {
        if(mesh && mesh.morphTargetInfluences)
        {    
            mesh.morphTargetInfluences[i] = 1.0;
        }
        else
        {
            console.warn("対象のオブジェクトにシェイプキーが見つかりません。");
        }
    }

    loadModel()
    {
        const loader = new GLTFLoader();

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;
            this.scene.add(this.model);
            console.log('モデルが読み込まれました.');

            this.basket = this.findMesh(this.model);

            this.shapeKeysControlls(this.basket, 0);
        }, undefined, (error) => {
            console.error('モデルの読み込み中にエラーが発生しました:', error);
        });

        if(this.onLoaded)
        {
            this.onLoaded();
        }
    }
    
    // 定期的に画面を更新するループ処理 (必須)
    animate()
    {
        requestAnimationFrame(() => this.animate());

        // マウス操作の更新
        this.controls.update();

        // 画面を描画
        this.renderer.render(this.scene, this.camera);
    }

    bindEvents()
    {
        window.addEventListener('resize', () => {
            const newWidth = this.modelAreaElement.clientWidth;
            const newHeight = this.modelAreaElement.clientHeight;

            this.camera.aspect = newWidth / newHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(newWidth, newHeight);
        });
    }
}
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Timer } from 'three/addons/misc/Timer.js';

export default class ModelController
{
    constructor(elementId, modelPath = './glb/stage.glb', targetScore, onLoaded = null)
    {
        this.modelAreaElement = document.getElementById(elementId);
        this.width = this.modelAreaElement.clientWidth;
        this.height = this.modelAreaElement.clientHeight;

        this.targetScore = targetScore;
        this.partScore = null;

        this.modelPath = modelPath;

        this.onLoaded = onLoaded;

        this.animationNum = 0;

        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initControls();
        this.initLights();

        this.initAnimation();

        this.loadModel();

        this.bindEvents();
        this.animate();
        this.customEventListener();
    }

    initScene()
    {
        // 3D空間を作成
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color(0x000000);   // 背景の色
    }

    initCamera()
    {
        // カメラを作成 (視野角, 画面の比率, クリップ手前, クリップ奥)
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        this.camera.position.set(0, 1.8, 1.8);   // カメラの初期位置 (少し上、少し後ろに引く)
    }

    initRenderer()
    {
        // レンダラー (画面に描画する仕組み) を作成
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});   // ギザギザを滑らかに
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

    initAnimation()
    {
        this.timer = new Timer();

        this.mixer = null;
    }

    setMaterials(model)
    {
        // 3Dモデルの子要素を順番にチェック
        model.traverse((child) => {
            // meshを持っているかつmaterialを持っているか
            if(child.isMesh && child.material)
            {
                // materialをリストで取得
                const materials = Array.isArray(child.material) ? child.material : [child.material];    // 配列ならそのまま配列のマテリアルを取得 配列になっていないならマテリアルを配列に変換

                materials.forEach((material) => {
                    // マテリアルがテクスチャ画像を持っているかつ透過ようの画像を持っているか
                    if(material.map || material.alphaMap)
                    {
                        material.transparent = true;    // 透過をON
                        material.alphaTest = 0.5;       // 透過度が50%以下のピクセルは透過
                        material.needsUpdate = true;    //マテリアルを更新
                    }
                });
            }
        });
    }

    // シェイプキーがついているmeshを探す関数
    findMesh(model)
    {
        let mesh = null;
        // モデルの子供を走査する。
        model.traverse((child) => {
            // オブジェクトかつシェイプキーを持っているか(シェイプキーを持っているとThree.jsがmorphTargetInfluences配列を自動的に作る)
            if(child.isMesh && child.morphTargetInfluences)
            {
                console.log(`本物のメッシュを発見: ${child.name}`);
                mesh = child;
            }
        });
        return mesh;
    }

    showShapeKeyName(mesh)
    {
        const keys = Object.keys(mesh.morphTargetDictionary);

        console.log("シェイプキー一覧:", keys);
    }

    // シェイプキーを動かす関数
    shapeKeysController(mesh, index)
    {
        // meshの中身が空ではないかつシェイプキーを持っていれば
        if(mesh && mesh.morphTargetInfluences)
        {    
            // シェイプキーをリセット
            for(let i = 0; i < mesh.morphTargetInfluences.length; i++)
            {
                mesh.morphTargetInfluences[i] = 0;
            }
            
            if(mesh.morphTargetInfluences[index] !== undefined)
            {
                mesh.morphTargetInfluences[index] = 1.0;
            }
        }
        else
        {
            console.warn("対象のオブジェクトにシェイプキーが見つかりません。");
        }
    }

    setAnimationModel(model, animations)
    {
        // アニメーションを配列でデータをセットする
        if(animations && 0 < animations.length)
        {
            this.mixer = new THREE.AnimationMixer(model);

            this.mixer.addEventListener('finished', (customEvent) => {
                
            })
        }
    }

    setAnimation(animations, index)
    {
        // mixerが作られていない　または　アニメーションデータが存在しない　または　指定番号のアニメーションが存在しないなら
        if(!this.mixer || !animations || !animations[index])
        {
            return;
        }

        const action = this.mixer.clipAction(animations[index]);
        action.reset();
        action.setLoop(THREE.LoopOnce);
        action.play();
    }

    loadModel()
    {
        const loader = new GLTFLoader();

        loader.load(this.modelPath, (gltf) => {
            this.model = gltf.scene;

            this.setMaterials(this.model);

            this.scene.add(this.model);
            console.log('モデルが読み込まれました.');

            this.stage = this.findMesh(this.model);
            this.shapeKeysController(this.stage, 0);
            // this.showShapeKeyName(this.stage);

            this.animations = gltf.animations;
            this.setAnimationModel(this.model, this.animations);

            this.splitScore(this.stage);
        }, undefined, (error) => {
            console.error('モデルの読み込み中にエラーが発生しました:', error);
        });

        if(this.onLoaded)
        {
            this.onLoaded();
        }
    }
    
    // 定期的に画面を更新するループ処理 (必須)
    animate(timestamp = 0)
    {
        // ブラウザの画面更新タイミングでanimateを実行
        requestAnimationFrame((t) => this.animate(t));

        // マウス操作の更新
        this.controls.update();

        // タイマーに最新の時間をセット
        this.timer.update(timestamp);
        // 前回のフレームからの経過時間を取得
        const delta = this.timer.getDelta();

        // ミキサーが存在すれば、アニメーションの時間を進める
        if(this.mixer)
        {
            // delta分だけアニメーションをコマ送りする
            this.mixer.update(delta);
        }

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

    // りんごが増える地点のスコアを計算
    splitScore(mesh)
    {
        this.partScore = this.targetScore / (mesh.morphTargetInfluences.length - 1);
    }

    customEventListener()
    {
        window.addEventListener('sendScore', (customEvent) => {
            const score = customEvent.detail.score;
            const targetIndex = Math.floor(score / this.partScore);
            // スコアでりんごが増えるかどうか計算
            this.shapeKeysController(this.stage, targetIndex);

            if(this.animationNum < targetIndex)
            {    
                // アニメーションを再生
                this.setAnimation(this.animations, 0);
                this.animationNum = targetIndex;
            }
        });
    }
}
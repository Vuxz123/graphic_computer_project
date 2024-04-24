import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import sceneJS from './scene.json';

class ViewerController {
    private _sceneLoader: SceneLoader;
    private readonly _renderer: THREE.WebGLRenderer;
    private _movie: Movie;

    constructor() {
        this._sceneLoader = new SceneLoader();
        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.setAnimationLoop(() => this.loop());

        window.onresize = () => {
            if(this._movie.scene) {
                let camera = this._movie.scene.camera;
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                this._renderer.setSize(window.innerWidth, window.innerHeight);
            }
        }
    }

    async loadMovie() {
        await this._sceneLoader.loadJSON();
        console.log("Loaded scenes");
        this._movie = this._sceneLoader.createMovie(this._renderer);
        console.log("Created movie");
    }

    render() {
        if(this._movie) {
            this._movie.render();
        }
    }

    get domElement(): HTMLElement {
        console.log(this._renderer.domElement);
        return this._renderer.domElement;
    }

    loop() {
        this.render();
    }

}

class SceneLoader {
    private readonly _scenes: Scene[];

    private loader = new GLTFLoader();

    private nLoaded = 0;
    private nTotal = 0;

    constructor() {
        this._scenes = [];
    }

    async loadJSON(): Promise<number> {
        const scenes = sceneJS.scenes;
        console.log("SceneJS: ",scenes);
        this.nTotal = scenes.length;
        const loadScenePromises = scenes.map(scene => this.loadScene(scene));
        await Promise.all(loadScenePromises);
        console.log("Loaded all scenes");
        return 0;
    }

    async loadScene(scene): Promise<Scene> {
        let s: Scene;
        await this.loadSceneData(scene.url).then(data => {
            const sceneLoaded = data.scene;
            const camera = data.cameras[0];

            //if data contains custom, run custom function
            console.log("Custom: ", scene.custom);
            if(scene.custom !== undefined) {
                console.log("Running custom function");
                const custom = new Function('return ' + scene.custom)();
                custom(data);
            }
            //get clip that match the scene.animations name
            console.log("Data animations: ", data.animations.map(clip => clip.name));
            console.log("Animations: ", scene.animations)
            const clips = data.animations.filter(clip => {
                return scene.animations.includes(clip.name);
            });
            //if clips empty, throw error
            if(clips.length === 0) {
                console.error("No clips found for scene");
            }
            s = new Scene(scene.url ,scene.pos , sceneLoaded, camera, clips, () => {
                console.log("Finished scene");
            });
            this._scenes.push(s);
        }).catch(err => {
            console.error(err);
        });
        return s;
    }

    async loadSceneData(url: string) : Promise<any> {
        return new Promise((resolve, reject) => {
            this.loader.load(url, (data) => {
                console.log("Data load:", data);
                resolve(data);
            }, null, reject);
        });
    }

    getScene(index: number): Scene {
        return this._scenes[index];
    }

    createMovie(renderer: THREE.WebGLRenderer): Movie {
        return new Movie(this._scenes, renderer);
    }

}

class Scene {
    readonly pos: number;
    readonly name: string;
    readonly scene: THREE.Scene;
    readonly _camera: THREE.Camera;
    readonly mixer: THREE.AnimationMixer;
    _finishedAnimations = 0;
    _animations: THREE.AnimationAction[];

    constructor(name: string, pos: number, scene: THREE.Scene, camera: THREE.Camera, clips: THREE.AnimationClip[], onFinished?: () => void) {
        this.scene = scene;
        this.pos = pos;
        this.name = name;
        this._camera = camera;
        this.mixer = new THREE.AnimationMixer(scene);
        this.loadAnimation(clips);
        this.mixer.addEventListener('finished', onFinished);
    }

    private loadAnimation(clips: THREE.AnimationClip[]) {
        // Load animations
        this._animations = clips.map(clip => {
            const action = this.mixer.clipAction(clip);
            action.setLoop(THREE.LoopOnce); // Set loop mode to LoopOnce
            action.clampWhenFinished = true; // Clamp action's time to its duration
            action.play();
            return action;
        });
    }

    render(renderer: THREE.Renderer, delta: number) {
        if (this.mixer) this.mixer.update(delta);
        if (this.camera) {
            renderer.render(this.scene, this.camera);
        }
    }

    get animations(): THREE.AnimationAction[] {
        return this._animations;
    }

    get camera(): THREE.Camera {
        return this._camera;
    }
}

class Movie {
    private _scene: Scene;
    private readonly _renderer: THREE.WebGLRenderer;
    private _clock: THREE.Clock;
    private _scenes: Scene[] = [];

    constructor(scenes: Scene[], renderer: THREE.WebGLRenderer) {
        console.log(scenes);
        scenes.sort((a, b) => a.pos - b.pos);
        this._scene = scenes[0];
        this._renderer = renderer;
        this._clock = new THREE.Clock();
        console.log("Scenes: ", scenes)
        for (let i = 0; i < scenes.length; i++) {
            this._scenes.push(scenes[i]);
            if (i < scenes.length - 1) {
                scenes[i].mixer.addEventListener('finished', () => {
                    scenes[i]._finishedAnimations++;
                    if (scenes[i]._finishedAnimations >= scenes[i]._animations.length) {
                        console.log("Next Scene! " + i);
                        console.log(scenes[i+1]);
                        this._scene = scenes[i + 1];
                    }
                });
            }
        }
        console.log("Movie created: ", this._scene);
    }

    get scene(): Scene {
        return this._scene;
    }

    render() {
        if(this._scene) {
            this._scene.render(this._renderer, this._clock.getDelta());
        }
    }
}

export {ViewerController, SceneLoader, Scene, Movie};
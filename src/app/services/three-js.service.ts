import { Injectable, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThreeJsService {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private controls: OrbitControls;
  private gridHelper: THREE.GridHelper;
  private axes: THREE.AxesHelper;
  private frameId: number | null = null;
  private size = { width: window.innerWidth, height: window.innerHeight };

  initializeScene(canvas: ElementRef<HTMLCanvasElement>) {
    const nativeCanvas = canvas.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ canvas: nativeCanvas, alpha: true, antialias: true });
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.PerspectiveCamera(75, this.size.width / this.size.height, 0.1, 1000);
    this.camera.position.set(-25, 15, 0);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 0);
    directionalLight.target.position.set(-5, 0, 0);
    this.scene.add(directionalLight, directionalLight.target);

    this.gridHelper = new THREE.GridHelper(50, 30);
    this.axes = new THREE.AxesHelper(20);
    this.axes.renderOrder = 1;
    this.scene.add(this.gridHelper, this.axes);

    this.controls = new OrbitControls(this.camera, nativeCanvas);
  }

  animate(ngZone: NgZone) {
    ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => this.render());
      }
      window.addEventListener('resize', () => this.resize());
    });
  }

  private render() {
    this.frameId = requestAnimationFrame(() => this.render());
    this.renderer.render(this.scene, this.camera);
  }

  private resize() {
    this.size.width = window.innerWidth;
    this.size.height = window.innerHeight;
    this.camera.aspect = this.size.width / this.size.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.size.width, this.size.height);
  }

  toggleGridHelper(visible: boolean) {
    visible ? this.scene.add(this.gridHelper) : this.scene.remove(this.gridHelper);
  }

  toggleAxesHelper(visible: boolean) {
    visible ? this.scene.add(this.axes) : this.scene.remove(this.axes);
  }

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  cleanup() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    this.renderer?.dispose();
    this.renderer = null;
  }
}

import WebGPU from '../lib/webgpu.js';
import { loadMesh } from './load-mesh.js';
import Scene from './scene.js'


class Main {
    async init() {
        this.gpu = await WebGPU.createCanvas('#glcanvas', 1024, 768);
        const { coords, indices } = await loadMesh(new URL('./models/bun_zipper2.ply', import.meta.url));
        this.scene = new Scene(this.gpu, coords, indices);
    }

    draw() {
        this.gpu.start();
        this.scene.draw(this.gpu);
        this.gpu.finish();
        requestAnimationFrame(this.draw.bind(this));
    }
}

try {
    const app = new Main();
    await app.init();
    app.draw();
} catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML('beforeend', `<p>${error.message}</p>`);
}
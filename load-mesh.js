// Original lesson format: vertex/triangle counts, xyzw positions, zero-based indices.
export function parseMesh(text) {
    const lines = text.trim().split(/\r?\n/);
    const endHeader = lines.indexOf('end_header');
    const header = lines.slice(0, endHeader).join('\n');

    //const [nv, nt] = data;
    const nv = Number(header.match(/element vertex (\d+)/)[1]);
    const nt = Number(header.match(/element face (\d+)/)[1]);

    //const data = text.trim().split(/\s+/).map(Number);
    const data = lines.slice(endHeader + 1).join(' ').trim().split(/\s+/).map(Number);


    if (!Number.isInteger(nv) || !Number.isInteger(nt) || nv <= 0 || nt <= 0
        || data.length !== 5 * nv + 4 * nt || !data.every(Number.isFinite)) {
        throw new Error('Invalid mesh counts or coordinates.');
    }

    const coords = [];
    for (let i = 0; i < nv; i++) {
        const offset = i * 5;
        coords.push(data[offset], data[offset + 1], data[offset + 2], 1.0);
    }

    //const coords = data.slice(2, 2 + 4 * nv);
    
    const indices = [] //data.slice(2 + 4 * nv);
    const facesOffset = 5 * nv;

    for (let i = 0; i < nt; i++) {
        const offset = facesOffset + i * 4;
        indices.push(data[offset + 1], data[offset + 2], data[offset + 3]);
    }

    if (!indices.every((index) => Number.isInteger(index) && index >= 0 && index < nv)) {
        throw new Error('Invalid mesh triangle index.');
    }

    return { coords, indices };
}

export async function loadMesh(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not load mesh: HTTP ${response.status}.`);
    }
    return parseMesh(await response.text());
}
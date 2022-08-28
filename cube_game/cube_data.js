function make_box(scene, name, w, h, d, x, y, z, faceUV, material) {
    let box = BABYLON.MeshBuilder.CreateBox(name, {width: w, height: h, depth: d, faceUV: faceUV, wrap: true}, scene);
    box.position.x = x;
    box.position.y = y;
    box.position.z = z;
    box.material = material;
    return box;
}

function make_alpaca(scene) {
    const brown_mat = new BABYLON.StandardMaterial("brown_mat", scene);
    brown_mat.diffuseColor = new BABYLON.Color3(198/255, 173/255, 137/255);
    const straw_mat = new BABYLON.StandardMaterial("straw_mat", scene);
    straw_mat.diffuseColor = new BABYLON.Color3(254/255, 225/255, 165/255);
    let hat = BABYLON.MeshBuilder.CreateCylinder('hat', {diameter: 0.4, height: 0.05, tessellation: 6}, scene);
    hat.material = straw_mat;
    hat.position.y = 0.50;
    hat.position.z = 0.08;
    let hat2 = BABYLON.MeshBuilder.CreateCylinder('hat2', {diameterBottom: 0.30, diameterTop: 0.20, height: 0.10, tessellation: 6}, scene);
    hat2.material = straw_mat;
    hat2.position.y = 0.55;
    hat2.position.z = 0.08;
    return BABYLON.Mesh.MergeMeshes([
        make_box(scene, '', 0.05, 0.05, 0.05, 0.1, 0.025, -0.22, [], brown_mat),
        make_box(scene, '', 0.05, 0.05, 0.05, -0.1, 0.025, -0.22, [], brown_mat),
        make_box(scene, '', 0.05, 0.1, 0.05, 0, 0.19, -0.27, [], brown_mat),
        make_box(scene, '', 0.05, 0.05, 0.05, 0.1, 0.025, 0.08, [], brown_mat),
        make_box(scene, '', 0.05, 0.05, 0.05, -0.1, 0.025, 0.08, [], brown_mat),
        make_box(scene, '', 0.25, 0.2, 0.4, 0, 0.15, -0.07, [], brown_mat),
        make_box(scene, '', 0.2, 0.4, 0.2, 0, 0.30, 0.08, [], brown_mat),
        make_box(scene, '', 0.12, 0.10, 0.12, 0, 0.40, 0.18, [], brown_mat),
        hat, hat2
    ], true, false, null, false, true);
}

function make_quad1(scene, qname) {
    let faceUV = [];
    const gray_mat = new BABYLON.StandardMaterial("gray_mat", scene);
    gray_mat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    faceUV[0] = new BABYLON.Vector4(0, 0, 0.25, 1); // front face
    faceUV[1] = new BABYLON.Vector4(0.75, 0, 1, 1); // rear face
    faceUV[2] = new BABYLON.Vector4(0.5, 0, 0.75, 1);   // right face
    faceUV[3] = new BABYLON.Vector4(0.75, 0, 1, 1); // left face
    faceUV[4] = new BABYLON.Vector4(0.25, 0, 0.5, 1);   // up face
    faceUV[5] = new BABYLON.Vector4(0.75, 0, 1, 1); // down face
    const box_mat = new BABYLON.StandardMaterial(qname);
    box_mat.diffuseTexture = new BABYLON.Texture("textures/"+qname+'.png', scene, {samplingMode: BABYLON.Texture.NEAREST_NEAREST});
    const main_box = make_box(scene, '', 1.5, 1.5, 1.5, 0.8, 0.8, 0.8, faceUV, box_mat);
    const meshes = [main_box];

    const obstacles = [
            [ [1, 1.8, 2, 2], [1.8, 0, 2, 2],
              [0.95, 1.1, 1.05, 1.3] ],  // z, y coord
            [ [0.8, 1.8, 2, 2], [1.8, 1, 2, 2],
              /*[0, 1.6, 1, 1.8],*/ [0.6, 0.4, 0.8, 0.6] ],  // x, z coord
            [ [0, 1.8, 2, 2], [1.8, 0.8, 2, 2],
              [0, 1.6, 0.1, 1.8], [0.85, 0.6, 0.95, 1.0] ]   // y, x coord
        ];

    for (const [lz, ly, uz, uy] of obstacles[0]) {
        meshes.push(make_box(scene, '', 0.2, uy-ly, uz-lz, 1.9, (uy+ly)/2, (uz+lz)/2, [], gray_mat));
    }
    for (const [lx, lz, ux, uz] of obstacles[1]) {
        meshes.push(make_box(scene, '', ux-lx, 0.2, uz-lz, (ux+lx)/2, 1.9, (uz+lz)/2, [], gray_mat));
    }
    for (const [ly, lx, uy, ux] of obstacles[2]) {
        meshes.push(make_box(scene, '', ux-lx, uy-ly, 0.2, (ux+lx)/2, (uy+ly)/2, 1.9, [], gray_mat));
    }
    let box = BABYLON.Mesh.MergeMeshes(meshes, true, false, null, false, true);

    return {
        box: box,
        obstacles: obstacles
    };
}

// Row major rotation matrices.
const rotation_map = [  // clockwise rotations...
    [1, 0, 0, 1],
    [0, -1, 1, 0],
    [-1, 0, 0, -1],
    [0, 1, -1, 0],
];
function apply_rot2(rot, x, y) {
    return [rot[0]*x+rot[1]*y, rot[2]*x+rot[3]*y];
}
function quad_to_obstacles(quad, face, rot) {
    const obstacles = quad.obstacles[face];
    const results = [];
    const rot_mat = rotation_map[rot];
    for (const obstacle of obstacles) {
        const [lx, ly] = apply_rot2(rot_mat, obstacle[0], obstacle[1]);
        const [ux, uy] = apply_rot2(rot_mat, obstacle[2], obstacle[3]);
        results.push({
            x: (lx+ux)/2,
            y: Math.min(ly, uy),
            w: Math.abs(ux-lx),
            h: Math.abs(uy-ly)
        });
    }
    return results;
}

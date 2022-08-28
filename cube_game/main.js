let cam_side_offset = 0; // Multiplied by PI/2
let cam_offset = 0.5;
let cam_step_thresh = 0.05;
let cam_angle = 0;
let cam_height = 2;
let cam_radius = 10;
let cam_look_target = BABYLON.Vector3.Zero();

let camera;
function update_camera() {
    let cam_target = cam_offset + Math.PI/2*cam_side_offset;
    if (cam_angle != cam_target) {
        let diff = cam_target - cam_angle;
        if (diff > cam_step_thresh) { diff = cam_step_thresh; }
        else if (diff < -cam_step_thresh) { diff = -cam_step_thresh; }
        cam_angle += diff;
    }
    camera.position.x = Math.cos(cam_angle) * cam_radius;
    camera.position.y = cam_height;
    camera.position.z = Math.sin(cam_angle) * cam_radius;
    camera.setTarget(cam_look_target);
}

/*
struct box {
    box: mesh
    xface: [thing]
    yface: [thing]
    zface: [thing]
}
*/
let boxes = {};
let aplaca;

let player_facing = 0;  // 0 for right, 2 for left
let player_side = 0;    // x PI/2
let player_angle = 0;   // raw radians
let player_turn_rate = 0.3;
let player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    w: 0.6,
    h: 0.60,
    contacts: [false, false, false, false]
};
let safe_player_state = { x: 0, y: 0 };
let v_decay = 0.98;
let ground_decay = 0.5;
let player_offset_dist = 1.9;
let obstacles = [];
function update_player() {
    player.vy -= 0.004;
    player.vy *= v_decay;
    player.vx *= v_decay;
    move_resolve_collision(player, obstacles);
    if (player.contacts[3]) {
        safe_player_state.x = player.x;
        safe_player_state.y = player.y;
        player.vx *= ground_decay;
        if (Math.abs(player.vx) < 0.001) {
            player.vx = 0;
        }
    }
    if (player.x > 2) {
        player.x = -1.98;
        player_side -= 1;
        cam_side_offset += 1;
        reload_obstacles();
    }
    else if (player.x < -2) {
        player.x = 1.98;
        player_side += 1;
        cam_side_offset -= 1;
        reload_obstacles();
    }
    if (player.y < -6) {
        player.x = safe_player_state.x;
        player.y = safe_player_state.y;
        player.vx = 0;
        player.vy = 0;
    }

    let base_angle = player_side * Math.PI/2;
    let target_angle = (player_side + player_facing) * Math.PI/2;
    if (target_angle != player_angle) {
        let diff = target_angle - player_angle;
        if (diff > player_turn_rate) { diff = player_turn_rate; }
        else if (diff < -player_turn_rate) { diff = -player_turn_rate; }
        player_angle += diff;
    }
    alpaca.rotation.y = player_angle;
    let player_offset = new BABYLON.Vector3(player_offset_dist, player.y, player.x);
    player_offset.rotateByQuaternionToRef(new BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, base_angle), player_offset);
    alpaca.position = player_offset;
}

function get_player_frame() {
    // Get the normal direction corresponding to the side of the cube the player is on.
    let base_angle = player_side * Math.PI/2;
    let player_offset = new BABYLON.Vector3(1, 0, 0);
    let player_x_axis = new BABYLON.Vector3(0, 0, 1);
    player_offset.rotateByQuaternionToRef(new BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, base_angle), player_offset);
    player_x_axis.rotateByQuaternionToRef(new BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, base_angle), player_x_axis);
    return [player_offset, player_x_axis, new BABYLON.Vector3(0, 1, 0)];
}

let box_keys = [];
for (const x of ['0', '1']) {
    for (const y of ['0', '1']) {
        for (const z of ['0', '1']) {
            box_keys.push(x+y+z);
        }
    }
}

function get_boxes_facing() {
    let [player_normal, player_x_axis, player_y_axis] = get_player_frame();
    const facing_boxes = [];
    for (const key of box_keys) {
        const box = boxes[key];
        const box_matrix = box.box.computeWorldMatrix(true);
        let axis = -1;
        for (let i = 0; i < 3; ++i) {
            const _vec = box_matrix.getRow(i);
            const vec = new BABYLON.Vector3(_vec.x, _vec.y, _vec.z);
            const face_dot = BABYLON.Vector3.Dot(vec, player_normal);
            if (face_dot > 0.9) {
                axis = i;
                break;
            }
        }
        if (axis >= 0) {
            const _axis1 = box_matrix.getRow((axis + 2) % 3);
            const axis1 = new BABYLON.Vector3(_axis1.x, _axis1.y, _axis1.z);
            const xval = BABYLON.Vector3.Dot(axis1, player_x_axis);
            const yval = BABYLON.Vector3.Dot(axis1, player_y_axis);
            let angle_quad = Math.round((Math.atan2(yval, xval)*2) / Math.PI);
            if (angle_quad < 0) { angle_quad += 4; }
            facing_boxes.push([key, axis, angle_quad]);
        }
    }
    return facing_boxes;
}

function createScene() {
    // This creates a basic Babylon Scene object (non-mesh)
    let scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, 0), scene);
    update_camera();

    // This attaches the camera to the canvas
    // camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    let light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(1, 0, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.6;
    light2.intensity = 0.4;

    // Our built-in 'sphere' shape.
    //let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);

    // Move the sphere upward 1/2 its height
    //sphere.position.y = 1;
    //sphere.position.z = 1;

    // Our built-in 'ground' shape.
    const groundMat = new BABYLON.StandardMaterial("groundMat");
    groundMat.diffuseColor = new BABYLON.Color3(0, 1, 0);

    function add_box(coord) {
        let box = make_quad1(scene, coord);
        const xz = coord[0] + coord[2];
        const y = coord[1];
        box.box.rotation = BABYLON.Vector3.Zero();
        if (y === '0') {
            box.box.rotate(BABYLON.Axis.X, Math.PI/2, BABYLON.Space.WORLD);
        }
        if (xz === '10') {
            box.box.rotate(BABYLON.Axis.Y, Math.PI/2, BABYLON.Space.WORLD);
        }
        else if (xz === '00') {
            box.box.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);
        }
        else if (xz === '01') {
            box.box.rotate(BABYLON.Axis.Y, -Math.PI/2, BABYLON.Space.WORLD);
        }
        boxes[coord] = box;
    }
    for (const key of box_keys) {
        add_box(key);
    }

    alpaca = make_alpaca(scene);
    alpaca.position.x = 1.9;

    reload_obstacles();

    return scene;
}

let SCENE_CONTROL = 0;
let SCENE_BOX_ROTATE = 1;
let SCENE_SHUFFLE_0 = 2;
let SCENE_SHUFFLE_1 = 3;
let scene_state = SCENE_SHUFFLE_0;

function scene_control_update() {
    if (arrowUp && player.contacts[3]) {
        player.vy = 0.11;
    }
    if (arrowLeft) {
        player_facing = 2;
        if (!player.contacts[1]) {
            if (player.contacts[3]) {
                player.vx += -0.03;
            }
            player.vx += -0.0007;
        }
    }
    else if (arrowRight) {
        player_facing = 0;
        if (!player.contacts[0]) {
            if (player.contacts[3]) {
                player.vx += 0.03;
            }
            player.vx += 0.0007;
        }
    }
    update_player();
}

function reload_obstacles() {
    obstacles = [];
    const facing_info = get_boxes_facing();
    for (const [key, face, rot] of facing_info) {
        const results = quad_to_obstacles(boxes[key], face, rot);
        obstacles = obstacles.concat(results);
    }
}

let ROTATION_DURATION = 15;  // normally 50
let rotation_dir = 0;
let rotation_time = 0;
let rotation_axis;
let selected_boxes = [];
function box_rotate_update() {
    rotation_time += 1;
    for (const box of selected_boxes) {
        box.box.rotate(rotation_axis, Math.PI/2 / ROTATION_DURATION * rotation_dir, BABYLON.Space.WORLD);
    }
    if (rotation_time == ROTATION_DURATION) {
        scene_state -= 1;
        rotation_time = 0;
        reload_obstacles();
    }
}

// 00 -> 10 -> 11 -> 01
const forward_mapping = {
    "00": "10",
    "10": "11",
    "11": "01",
    "01": "00",
};
const backward_mapping = {};
for (const [k, v] of Object.entries(forward_mapping)) { backward_mapping[v] = k; }

function set_rotate_boxes(axis, direction) {
    // rotation_axis: vec3; direction: +1 or -1
    rotation_axis = axis;
    let dir = (axis.x + axis.y + axis.z > 0) ? 1 : 0;
    selected_boxes = [];
    let axis_idx;
    if (Math.abs(axis.x) > 0.9) axis_idx = 0;
    else if (Math.abs(axis.y) > 0.9) axis_idx = 1;
    else if (Math.abs(axis.z) > 0.9) axis_idx = 2;

    let axis1 = (axis_idx + 1) % 3;
    let axis2 = (axis1 + 1) % 3;
    save_box_map = boxes;
    boxes = {};
    let slice = "" + dir;
    for (const key of box_keys) {
        if (key[axis_idx] === slice) {
            selected_boxes.push(save_box_map[key]);
            const others = key[axis1] + key[axis2];
            const rotated = (dir ^ (direction < 0)) ? forward_mapping[others] : backward_mapping[others];
            const new_key = [null, null, null];
            new_key[axis_idx] = key[axis_idx];
            new_key[axis1] = rotated[0];
            new_key[axis2] = rotated[1];
            boxes[new_key.join('')] = save_box_map[key];
        }
        else {
            boxes[key] = save_box_map[key];
        }
    }
    scene_state = SCENE_BOX_ROTATE;
    rotation_dir = direction;
}

function try_rotate_boxes() {
    let [player_normal, player_x_axis, player_y_axis] = get_player_frame();
    let axis;
    let dir;
    if (Math.abs(player.x) > 0.6) {
        if (player.x > 0) {
            axis = player_x_axis.negate();
            dir = -1;
        }
        else {
            axis = player_x_axis;
            dir = 1;
        }
        if (key_w) {    // positive rotation
            set_rotate_boxes(axis, dir);
            return;
        }
        if (key_s) {    // negative rotation
            set_rotate_boxes(axis, -dir);
            return;
        }
    }
    if (Math.abs(player.y) > 0.6) {
        if (player.y > 0) {
            axis = player_y_axis.negate();
            dir = -1;
        }
        else {
            axis = player_y_axis;
            dir = 1;
        }
        if (key_a) {    // positive rotation
            set_rotate_boxes(axis, dir);
            return;
        }
        if (key_d) {    // negative rotation
            set_rotate_boxes(axis, -dir);
            return;
        }
    }
}

let num_shuffle = 15;
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function loop() {
    if (scene_state == SCENE_SHUFFLE_0) {
        if (num_shuffle == 0) {
            scene_state = SCENE_CONTROL;
            ROTATION_DURATION = 50;
        }
        else {
            let rng = getRandomInt(12);
            let dir = (rng % 2) ? 1 : -1;
            rng >>= 1;
            let side = (rng % 2) ? 1 : -1;
            rng >>= 1;
            let axis = new BABYLON.Vector3();
            const side_map = 'xyz';
            axis[side_map[rng]] = side;
            set_rotate_boxes(axis, dir);
            scene_state = SCENE_SHUFFLE_1;
            num_shuffle -= 1;
        }
    }
    else if (scene_state == SCENE_SHUFFLE_1) {
        box_rotate_update();
    }
    else if (scene_state == SCENE_CONTROL) {
        scene_control_update();
        try_rotate_boxes();
    }
    else if (scene_state == SCENE_BOX_ROTATE) {
        box_rotate_update();
    }
    update_camera();
    scene.render();
}

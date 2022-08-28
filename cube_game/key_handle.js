let space = false;
let arrowUp = false;
let arrowDown = false;
let arrowLeft = false;
let arrowRight = false;
let key_w = false;
let key_a = false;
let key_s = false;
let key_d = false;

function keyDownHandler(e) {
    let captured = false;
    // if (e.code === "Space') {
    if (e.keyCode === 32) {
        space = true;
        captured = true;
    }
    // else if (e.code === "ArrowUp") {
    else if (e.keyCode === 38) {
        arrowUp = true;
        captured = true;
    }
    // else if (e.code === "ArrowDown") {
    else if (e.keyCode === 40) {
        arrowDown = true;
        captured = true;
    }
    // else if (e.code === "ArrowLeft") {
    else if (e.keyCode === 37) {
        arrowLeft = true;
        captured = true;
    }
    // else if (e.code === "ArrowRight") {
    else if (e.keyCode === 39) {
        arrowRight = true;
        captured = true;
    }
    else if (e.keyCode === 65) {
        key_a = true;
        captured = true;
    }
    else if (e.keyCode === 68) {
        key_d = true;
        captured = true;
    }
    else if (e.keyCode === 83) {
        key_s = true;
        captured = true;
    }
    else if (e.keyCode === 87) {
        key_w = true;
        captured = true;
    }
    
    if (captured) e.preventDefault();
}

window.addEventListener('keydown', keyDownHandler);

function keyUpHandler(e) {
    // if (e.code === "Space")           space = false;
    // else if (e.code === "ArrowUp")    arrowUp = false;
    // else if (e.code === "ArrowDown")  arrowDown = false;
    // else if (e.code === "ArrowLeft")  arrowLeft = false;
    // else if (e.code === "ArrowRight") arrowRight = false;
    if (e.keyCode === 32)      space = false;
    else if (e.keyCode === 38) arrowUp = false;
    else if (e.keyCode === 40) arrowDown = false;
    else if (e.keyCode === 37) arrowLeft = false;
    else if (e.keyCode === 39) arrowRight = false;
    else if (e.keyCode === 65) key_a = false;
    else if (e.keyCode === 68) key_d = false;
    else if (e.keyCode === 83) key_s = false;
    else if (e.keyCode === 87) key_w = false;
}

window.addEventListener('keyup', keyUpHandler);

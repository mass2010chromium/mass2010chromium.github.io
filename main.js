let windowHeight = $(window).height();
let windowWidth = $(window).width();
console.log(windowHeight + ", " + windowWidth);

let imageHeightPx = 400;
let scaling = windowHeight / imageHeightPx;
let imageWidthPx = windowWidth / scaling;

let imagePlayerWidthPx = 7;
let playerWidthPx = imagePlayerWidthPx * scaling;
let playerSideBuffer = playerWidthPx;

function resize_handle() {
    windowHeight = $(window).height();
    windowWidth = $(window).width();
    console.log(windowHeight + ", " + windowWidth);

    scaling = windowHeight / imageHeightPx;
    imageWidthPx = windowWidth / scaling;
    playerWidthPx = imagePlayerWidthPx * scaling;
    playerSideBuffer = playerWidthPx;
}

let moving = false;
let scrolling_background = document.getElementById('scrollables');
function scroll_handle() {
    if (!moving) {
        console.log(scrolling_background.scrollLeft)
    }
}

let playerX = 0;
let playerY = 0;
let playerY = 0;
let scrollX = 0;

let arrowUp = false;
let arrowDown = false;
let arrowLeft = false;
let arrowRight = false;

document.addEventListener('keydown', (e) => {
    if (e.code === "ArrowUp")         arrowUp = true;
    else if (e.code === "ArrowDown")  arrowDown = true;
    else if (e.code === "ArrowLeft")  arrowLeft = true;
    else if (e.code === "ArrowRight") arrowRight = true;

    // scrolling_background.scrollTo(playerSpriteX, 0);
    // console.log(playerSpriteX);
});

document.addEventListener('keyup', (e) => {
    if (e.code === "ArrowUp")         arrowUp = false;
    else if (e.code === "ArrowDown")  arrowDown = false;
    else if (e.code === "ArrowLeft")  arrowLeft = false;
    else if (e.code === "ArrowRight") arrowRight = false;

    scrolling_background.scrollTo(playerSpriteX, 0);
});

function loop() {
    moving = arrowUp || arrowDown || arrowLeft || arrowRight;
    if (arrowUp) 
}

setInterval(loop, 50);
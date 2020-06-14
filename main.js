let windowHeight = $(window).height();
let windowWidth = $(window).width();
// console.log(windowHeight + ", " + windowWidth);

let imageHeightPx = 400;
let scaling = windowHeight / imageHeightPx;
let imageWidthPx = windowWidth / scaling;

let imagePlayerWidthPx = 7;
let imagePlayerHeightPx = 14;
let playerSideBuffer = imagePlayerWidthPx*5;

function resize_handle() {
    windowHeight = scrolling_background.getBoundingClientRect().height;
    windowWidth = scrolling_background.getBoundingClientRect().width;
    // console.log(windowHeight + ", " + windowWidth);

    scaling = windowHeight / imageHeightPx;
    imageWidthPx = windowWidth / scaling;
    // console.log(scaling)
    updatePlayerOnScreen();
}

let moving = false;
let scrolling_background = document.getElementById('scrollables');
function scroll_handle() {
    if (!moving && Math.abs(anticipated_scroll - scrolling_background.scrollLeft) > 1) {
        // console.log("automove");
        leftBorderX = scrolling_background.scrollLeft / scaling;
        if (playerX - leftBorderX < playerSideBuffer) {
            /* Within playerSideBuffer of left border. */
            playerAutoMove = true;
            playerTargetX = leftBorderX + 2*playerSideBuffer;
        }
        else if (leftBorderX + imageWidthPx - playerX - imagePlayerWidthPx < playerSideBuffer) {
            /* Within playerSideBuffer of right border. imageWidthPx is width of screen in image pixels. */
            playerAutoMove = true;
            playerTargetX = leftBorderX + imageWidthPx - 2*playerSideBuffer - imagePlayerWidthPx;
        }
    }
    updatePlayerOnScreen();
}

let player_box = document.getElementById('player');

// console.log(player_box.style.zIndex);

let playerX = imageWidthPx - playerSideBuffer - imagePlayerWidthPx;
let playerY = 370;
let anticipated_scroll = 0;
let leftBorderX = 0;

let arrowUp = false;
let arrowDown = false;
let arrowLeft = false;
let arrowRight = false;
let playerAutoMove = false;
let playerTargetX = 0;

function keyDownHandler(e) {
    let captured = false;
    // if (e.code === "ArrowUp") {
    if (e.keyCode === 38) {
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
    
    if (captured) e.preventDefault();
}

window.addEventListener('keydown', keyDownHandler);

function keyUpHandler(e) {
    // if (e.code === "ArrowUp")         arrowUp = false;
    // else if (e.code === "ArrowDown")  arrowDown = false;
    // else if (e.code === "ArrowLeft")  arrowLeft = false;
    // else if (e.code === "ArrowRight") arrowRight = false;
    if (e.keyCode === 38)      arrowUp = false;
    else if (e.keyCode === 40) arrowDown = false;
    else if (e.keyCode === 37) arrowLeft = false;
    else if (e.keyCode === 39) arrowRight = false;
}

window.addEventListener('keyup', keyUpHandler);

function playerOnScreen() {
    //return playerX > leftBorderX - imagePlayerWidthPx && playerX < leftBorderX + imageWidthPx;
    /* It's not exact on the right hand side because of automove... */
    return playerX > leftBorderX - imagePlayerWidthPx && playerX < leftBorderX + imageWidthPx - imagePlayerWidthPx;
}

function loop() {
    moving = arrowUp || arrowDown || arrowLeft || arrowRight;
    if (arrowUp)    playerY -= 2;
    if (arrowDown)  playerY += 2;
    if (arrowLeft)  playerX -= 5;
    if (arrowRight) playerX += 5;

    if (moving) {
        playerAutoMove = false;

        if (playerX - leftBorderX < playerSideBuffer) {
            /* Within playerSideBuffer of left border. */
            leftBorderX = playerX - playerSideBuffer;
        }
        else if (leftBorderX + imageWidthPx - playerX - imagePlayerWidthPx < playerSideBuffer) {
            /* Within playerSideBuffer of right border. imageWidthPx is width of screen in image pixels. */
            leftBorderX = playerX + playerSideBuffer - imageWidthPx + imagePlayerWidthPx;
        }
    }

    if (playerAutoMove) {
        let playerMoveAmount = (playerTargetX - playerX) * 0.3;
        let speedCap = 15;
        if (playerOnScreen()) {
            speedCap = 5;
        }
        if (playerMoveAmount < -speedCap) playerMoveAmount = -speedCap;
        if (playerMoveAmount > speedCap) playerMoveAmount = speedCap;
        playerX += playerMoveAmount;
        if (Math.abs(playerMoveAmount) < 1) {
            playerAutoMove = false;
        }
    }
    if (playerX < 0) playerX = 0;
    if (playerX + imagePlayerWidthPx > 2399.9) playerX = 2399.9 - imagePlayerWidthPx;
    
    if (playerY < 355 - imagePlayerHeightPx) playerY = 355 - imagePlayerHeightPx;
    if (playerY > 395 - imagePlayerHeightPx) playerY = 395 - imagePlayerHeightPx;

    /*
     * Smooth scrolling.
     */
    let scrollTarget = leftBorderX * scaling;
    let scrollCurrent = scrolling_background.scrollLeft;
    let scrollDelta = (scrollTarget - scrollCurrent) * 0.3;
    anticipated_scroll = scrollCurrent + scrollDelta;
    if (scrolling_background.scrollBy) {
        scrolling_background.scrollBy(scrollDelta, 0);
    }
    else {
        scrolling_background.scrollLeft = scrollCurrent+scrollDelta;
    }
    // console.log(playerX)
    updatePlayerOnScreen();
}

function updatePlayerOnScreen() {
    player_box.style.left = ((playerX * scaling) - scrolling_background.scrollLeft) + 'px';
    player_box.style.top = (playerY * scaling) + 'px';
    if (playerOnScreen()) {
        player_box.style.display = "block";
    }
    else {
        player_box.style.display = "none";
    }
}

setInterval(loop, 30);
resize_handle();
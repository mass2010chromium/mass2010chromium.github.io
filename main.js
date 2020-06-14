let playerSpriteX = 0;

document.addEventListener('keyup', (e) => {
  if (e.code === "ArrowUp")        playerSpriteX += 10
  else if (e.code === "ArrowDown") playerSpriteX -= 10

  document.getElementById('test').innerHTML = 'playerSpriteX = ' + playerSpriteX;
});
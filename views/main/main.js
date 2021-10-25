//
//
//

let level;
let userData;

function loadLevel(name) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `/level/${name}`);

  xhr.onload = () => {
    level = JSON.parse(xhr.response);
    playerX = level.startPos.x;
    playerY = level.startPos.y;
  };

  xhr.send();
}

window.onload = () => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/level/test");

  xhr.onload = () => {
    level = JSON.parse(xhr.response);
    playerX = level.startPos.x;
    playerY = level.startPos.y;
    let x = new XMLHttpRequest();
    x.open("GET", "/user-data");
    x.onload = () => {
      userData = JSON.parse(x.response);
      if (userData.pokemons.length == 0) {
        chooseStarterPokemon()
      } else {
        gameLoop();
      }
    };

    x.send();
  };

  xhr.send();
}

function chooseStarterPokemon() {
  let starterContainer = document.getElementById("starterContainer")
  canvas.style.display = "none";
  starterContainer.style.display = "flex";
  let startPokemonContainers = document.querySelectorAll(".startPokemonContainer");
  startPokemonContainers.forEach(pokeContainer => {
    pokeContainer.addEventListener("click", (e) => {
      let target;
      if (e.target.classList[0] != "startPokemonContainer") {
        target = e.target.parentElement
      } else {
        target = e.target;
      }
      let pokemon = target.classList[1];
      userData.pokemons.push(starters[pokemon]);
      userData.bag.push({name: "pokeball", amount: 5});
      saveData(() => {
        starterContainer.style.display = "none";
        canvas.style.display = "block";
        gameLoop();
      });
    })
  })

  writeDialog("Choisis le pokemon avec lequel vous voulez commencer.")
}

function saveData(callback) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/save");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = () => {
    callback();
  }

  xhr.send(JSON.stringify(userData));
}

function writeDialog(text) {
  let dialogText = document.getElementById("dialogText");
  dialogText.innerHTML = "";
  let count = 0;
  
  let write = (i, len) => {
    setTimeout(() => {
      dialogText.innerHTML += text[i];
      i += 1;
      if (i < len) {
        write(i, len);
      }
    }, 50);
  }

  write(count, text.length)
}

let canvas = document.getElementById("canvas");
let npcsImg = document.querySelector(".npcs");

let width = 32;
let height = 32;

let xOffset = 0;
let yOffset = 0;

canvas.width = width * 16;
canvas.height = height * 16;

let ctx = canvas.getContext("2d");
let img = document.getElementsByClassName("img")[0];
let characterSprite = document.getElementById("characterSprites");

function drawGrid() {
  xOffset = -playerX;
  yOffset = -playerY

  if (playerX < 16) {
    xOffset = -16;
  }

  if (playerY < 16) {
    yOffset = -16;
  }

  if (xOffset <= (level.grid[0].length -16) * -1) {
    xOffset = (level.grid[0].length -16) * -1;
  }

  if (yOffset <= (level.grid.length - 16) * -1) {
    yOffset = (level.grid.length -16) * -1;
  }


  for (let y=0; y<level.grid.length; y++) {
    for (let x=0; x<level.grid[y].length; x++) {
      let name = level.grid[y][x];
      let tile = level.tiles.find(t => t.name == name);
      let gridX = ((x + xOffset + 16));
      let gridY = (y + yOffset + 16)
      ctx.drawImage(img, tile.xPos, tile.yPos, 16, 16, gridX * 16, gridY * 16, 16, 16);
    }
  }
}

let walk = {
  up: 0,
  down: 1,
  left: 2,
  right: 3
};

let step = 0;
let walking = false;
let walkDirection = "down";
let lastStep = Date.now();
let stepSpeed = 200;
let playerX = 2;
let playerY = 2;
let currentDir = "down"
let lastWalkDir = "down";
let canSwitchDir = true;
let sprinting = false;
let walkSpeed = 66;

let lastWalk = Date.now();
let lastFrame = Date.now()
let spaceDown = false;

document.addEventListener("keydown", (e) => {
  if (e.keyCode == 68) {
    walking = true;
    walkDirection = "right";
  } else if (e.keyCode == 65) {
    walking = true;
    walkDirection = "left"
  } else if (e.keyCode == 83) {
    walking = true;
    walkDirection = "down"
  } else if (e.keyCode == 87) {
    walking = true;
    walkDirection = "up";
  }

  if (e.keyCode == 16) {
    sprinting = true;
    walkSpeed = 33;
  };

  if (e.keyCode == 32 && spaceDown != true) {
    spaceDown = true;
    let t = getTile(walkDirection);
    if (t.npc) {
      eval(t.action)
    }
  }
});

function getTile(dir) {
  let xCheck = playerX;
  let yCheck = playerY;

  if (dir == "right") {
    xCheck += 1;
  } else if (dir == "left") {
    xCheck -= 1;
  } else if (dir == "up") {
    yCheck -= 1
  } else if (dir == "down") {
    yCheck += 1
  }
  yCheck += 1;
  xCheck = Math.floor(xCheck);
  yCheck = Math.floor(yCheck);

  let tile = level.grid[yCheck][xCheck];
  let npcYcheck = yCheck;
  if (dir == "up") {
    npcYcheck = playerY - 1
  } else {
    npcYcheck -= 1;
  }
  let f =level.npcs.find(n => n.xPos == xCheck && n.yPos == npcYcheck);
  let t = level.tiles.find(ti => ti.name == tile);
  let ret = {name: t.name, xPos: t.xPos, yPos: t.yPos, solid: t.solid, encounter: t.encounter};
  if (f != undefined) {
    ret.solid = true;
    ret.npc = true;
    ret.action = f.action;
  }
  return ret;
}

let inBattle = false;
let currentBattle;

function encounterWildPokemon() {
  let num = Math.floor(Math.random() * 100);
  if (num <= 15) {
    let p = level.pokemons.pokemons.length;
    p = level.pokemons.pokemons[Math.floor(Math.random() * p)]
    let lev = level.pokemons.levels.max - level.pokemons.levels.min
    lev = Number(level.pokemons.levels.min) + (Math.floor(Math.random() * (lev + 1)));
    let battle = new Battle([{name: p.name, url: p.url, level: lev}], userData.pokemons, true);
    currentBattle = battle;
    inBattle = true;
  }
}

document.addEventListener("keyup", (e) => {
  if (e.keyCode == 68 && walkDirection == "right") {
    walking = false;
  } else if (e.keyCode == 65 && walkDirection == "left") {
    walking = false;
  } else if (e.keyCode == 83 && walkDirection == "down") {
    walking = false;
  } else if (e.keyCode == 87 && walkDirection == "up") {
    walking = false;
  }

  if (e.keyCode == 16) {
    sprinting = false;
    walkSpeed = 66;
  }

  if (e.keyCode == 32) {
    spaceDown = false;
  }
})

function drawCharacter(x, y, direction) {
  let dir = walk[direction];
  if (walking == false) {
    step = 0;
  } else if (Date.now() - lastStep >= stepSpeed) {
    if (step == 0) {
      step = 1;
      lastStep = Date.now();
    } else if (step == 1) {
      step = 2;
      lastStep = Date.now();
    } else if (step == 2) {
      step = 1
      lastStep = Date.now();
    }
  }

  if (Date.now() - lastWalk >= walkSpeed) {
    if (String(playerX).includes(".") || String(playerY).includes(".")) {
      canSwitchDir = false;
      if (currentDir == "right") {
        playerX += 0.25
      } else if (currentDir == "left") {
        playerX -= 0.25;
      } else if (currentDir == "up") {
        playerY -= 0.25;
      } else if (currentDir == "down") {
        playerY += 0.25;
      }
    } else {
      canSwitchDir = true;
    }

    if (walkDirection == "right" && walking && canSwitchDir) {
      if (getTile("right").solid != true) {
        playerX += 0.25;
        currentDir = walkDirection;

        if (getTile("right").encounter == true) {
          encounterWildPokemon()
        }
      }
    } else if (walkDirection == "left" && walking && canSwitchDir) {
      if (getTile("left").solid != true) {
        playerX -= 0.25;
        currentDir = walkDirection;
        if (getTile("down").encounter == true) {
          encounterWildPokemon()
        }
      }
    } else if (walkDirection == "up" && walking && canSwitchDir) {
      if (getTile("up").solid != true) {
        playerY -= 0.25;
        currentDir = walkDirection;
        if (getTile("up").encounter == true) {
          encounterWildPokemon()
        }
      }
    } else if (walkDirection == "down" && walking && canSwitchDir) {
      if (getTile("down").solid != true) {
        playerY += 0.25;
        currentDir = walkDirection;

        if (getTile("down").encounter == true) {
          encounterWildPokemon()
        }
      }
    }
    lastWalk = Date.now();
  }
  let xPos = 16;
  let yPos = 16
  if (playerX <= 16) {
    xPos = playerX;
  }

  if (playerY <= 16) {
    yPos = playerY;
  }

  if (playerX >= level.grid[0].length - 16) {
    xPos = 32 - (level.grid[0].length - playerX);
  }

  if (playerY >= level.grid.length - 16) {
    yPos = 32 - (level.grid.length - playerY);
  }

  let xCheck = xPos;
  let yCheck = yPos + 1;
  level.doors.forEach(d => {
    let f = level.doors.find(door => door.x == playerX && door.y == playerY+1);
    if (f != undefined) {
      let name = d.name;
      loadLevel(name)
    }
  });

  let s = step;
  if (sprinting) {
    s += 4
  }
  ctx.drawImage(characterSprite, 1 + (s * 32) + s, 1 + (dir * 32)+dir, 32, 32, (xPos * 16) - 8, (yPos * 16), 32, 32)
}

function healPokemons() {
  for (let i=0; i<userData.pokemons.length; i++) {
    userData.pokemons[i].hp = 100 + (userData.pokemons[i].level * 3);
  }
}

function gameLoop() {
  if ((Date.now() - lastFrame) >= 20) {
    ctx.clearRect(0, 0, 32 * 16, 32 * 16)
    if (inBattle == false) {
      drawGrid();
      level.npcs.forEach(npc => {
        let npcX = npc.xPos;
        let npcY = npc.yPos;
        npcX = xOffset + 16 + npcX;
        npcY = yOffset + 16 + npcY;
        ctx.drawImage(npcsImg, npc.x, npc.y, 64, 64, (npcX*16)-8, (npcY)*16, 32, 32);
      });
      drawCharacter(playerX, playerY, walkDirection);
    } else {
      if (!currentBattle.initiated) {
        currentBattle.initiated = true;
        if (currentBattle.wild) {
          writeDialog(`A wild ${currentBattle.pokemons[0].name} has appeared!`);
        };
      }
      currentBattle.draw(ctx);
      if (currentBattle.pokeballThrown) {
        currentBattle.runCatchAnimation(currentBattle.pokeballCaught);
      }

      if (currentBattle.myTurn == false && currentBattle.aiWaitingMove == false) {
        currentBattle.aiWaitingMove = true;
        setTimeout(() => {
          if (currentBattle != undefined) {
            currentBattle.aiMakeMove();
          }
        }, 3000)
      }
      if (currentBattle.outcome == "win") {
        Battle.end();
        healPokemons()
        currentBattle = undefined;
        inBattle = false;
        setTimeout(() => {
          writeDialog("You won!")
        }, 3000)
      } else if (currentBattle.outcome == "lose") {
        Battle.end();
        healPokemons();
        currentBattle = undefined;
        inBattle = false;
        setTimeout(() => {
          writeDialog("You lose!")
        }, 3000)
      } else if (currentBattle.outcome == "run") {
        Battle.end();
        healPokemons();
        currentBattle = undefined;
        inBattle = false;
        setTimeout(() => {
          writeDialog("You fled the battle!");
        })
      } else if (currentBattle.outcome == "caught") {
        writeDialog("You caught a "+currentBattle.pokemons[0].name+"!");
        userData.pokemons.push(currentBattle.pokemons[0]);
        Battle.end();
        healPokemons();
        currentBattle = undefined;
        inBattle = false;
        saveData();
      }
    }
    lastFrame = Date.now();
  }
  requestAnimationFrame(gameLoop);
}
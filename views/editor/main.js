let pokemonEncounters = {};
let pokemons;
let grid = [];

const tiles = [
    { name: "grass", xPos: 16, yPos: 32 },
  ]
window.onload = () => {
  // Gets pokemon
  (() => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://pokeapi.co/api/v2/pokemon?limit=151");
    xhr.onload = () => {
      let res = JSON.parse(xhr.response).results;
      pokemons = res;
      let pokemonContainer = document.getElementById("pokemonContainer")
      res.forEach(value => {
        pokemonEncounters[value.name] = false;
        pokemonContainer.innerHTML += `<div class="pokemon ${value.name}"><p>${value.name}</p><input type="checkBox" class="${value.name}"/></div>`
      });

      document.querySelectorAll(".pokemon").forEach(poke => {
        poke = poke.querySelector("input");
        poke.value = "off";
        poke.addEventListener("click", (e) => {
          let target = e.target;
          let val;
          if (target.value == "on") {
            target.value = "off"
            value = false
          } else if (target.value == "off") {
            target.value = "on";
            value = true;
          }
          let p = target.classList[0];
          pokemonEncounters[p] = value;
        })
      })
    };

    xhr.send();
  })();

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  let currentLayer = 1;

  // met la taille du canvas à la taille de l'écrant
  let width = document.body.clientWidth;
  let height = document.body.clientHeight;
  let size;


  if (width > height) {
    size = height;
  } else if (height > width) {
    size = width;
  } else {
    size = width;
  }

  canvas.width = 16 * 32;
  canvas.height = 16 * 32;

  let centerX = Math.round(canvas.width / 2);
  let centerY = Math.round(canvas.height / 2);
  xOffset = 0;
  yOffset = 0;

  let mouseX = 0;
  let mouseY = 0;

  let startPositionX = 0;
  let startPositionY = 0;

  document.getElementById("layerOne").addEventListener("click", () => {
    currentLayer = 1;
    document.getElementById("layerLabel").innerHTML = "1";
  });
  document.getElementById("layerTwo").addEventListener("click", () => {
    currentLayer = 2;
    document.getElementById("layerLabel").innerHTML = "2";
  })

  let img = document.getElementsByClassName("img")[0];

  let doors = [];

  function drawTile(name, xPos, yPos) {
    let tile = tiles.find(t => t.name == name);
    ctx.drawImage(img, tile.xPos, tile.yPos, 16, 16, ((xPos + xOffset) * 16), ((yPos + yOffset) * 16), 16, 16);
  }

  let xSize = 32;
  let ySize = 32;
  let layerTwo = [];
  for (let y = 0; y < ySize; y++) {
    grid.push([]);
    layerTwo.push([])
    for (let x = 0; x < xSize; x++) {
      grid[y].push("grass");
      layerTwo[y].push("");
    }
  }

  let mousedown = false;
  document.addEventListener("mousedown", () => {
    mousedown = true;
  });

  document.addEventListener("mouseup", () => {
    mousedown = false;
  });
  document.addEventListener("keypress", (e) => {
    if (e.keyCode == 119) {
      yOffset -= 1;
    } else if (e.keyCode == 115) {
      yOffset += 1;
    } else if (e.keyCode == 100) {
      xOffset += 1
    } else if (e.keyCode == 97) {
      xOffset -= 1;
    }
  });

  let pDown = false;
  let spaceDown = false;
  let nDown = false;
  document.addEventListener("keydown", (e) => {
    if (e.keyCode == 80) {
      pDown = true;
    }

    if (e.keyCode == 32) {
      spaceDown = true;
    }

    if (e.keyCode == 78) {
      nDown = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.keyCode == 80) {
      pDown = false;
    }

    if (e.keyCode == 32) {
      spaceDown = false;
    }

    if (e.keyCode == 78) {
      nDown = false;
    }
  })

  let currentTile = { x: 16, y: 0 };

  (() => {
    let tilemap = document.getElementById("tilemap");
    let ctx = tilemap.getContext("2d");
    tilemap.width = img.width;
    tilemap.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    let selectedTile = document.getElementById("selectedTile");
    selectedTile.width = 16;
    selectedTile.height = 16;
    ctx = selectedTile.getContext("2d");
    tilemap.addEventListener("mousemove", (e) => {
      if (mousedown) {
        let x = Math.floor(e.offsetX / 16)
        let y = Math.floor(e.offsetY / 16);
        if (y >= 0 && x >= 0) {
          ctx.drawImage(img, x * 16, y * 16, 16, 16, 0, 0, 16, 16)
          let t = tiles.find(tile => tile.xPos == x * 16 && tile.yPos == y * 16);
          if (t != undefined) {
            currentTile = t
          } else {
            currentTile = { x, y }
          }
        }
      }
    })
  })();

  let npcs = [];

  canvas.addEventListener("mousemove", (e) => {
    if (pDown) {
      let x = Math.floor(e.offsetX / 16);
      let y = Math.floor(e.offsetY / 16);
      let gridX = x - xOffset;
      let gridY = y - yOffset;
      startPositionX = gridX;
      startPositionY = gridY;
    }

    if (nDown) {
      let x = Math.floor(e.offsetX / 16);
      let y = Math.floor(e.offsetY / 16);
      let gridX = x - xOffset;
      let gridY = y - yOffset;
      let action = document.getElementById("npcAction").value;
      let found = npcs.find(n => n.x == gridX && n.y == gridY);
      if (found == undefined) {
        npcs.push({xPos: gridX, yPos: gridY, action: action, x: currentNpc.x, y: currentNpc.y})
        console.log(npcs);
      }
    }

    if (spaceDown) {
      let x = Math.floor(e.offsetX / 16);
      let y = Math.floor(e.offsetY / 16);
      let gridX = x - xOffset;
      let gridY = y - yOffset;
      let doorName = document.getElementById("sceneName").value;
      let door = {name: doorName, x: gridX, y: gridY};
      let f = doors.find(d => d.x == gridX && d.y == gridY);
      if (f == undefined) {
        doors.push(door);
      } else {
        console.log(doors)
      }
    }

    if (mousedown) {
      let x = Math.floor(e.offsetX / 16);
      let y = Math.floor(e.offsetY / 16);
      let gridX = x - xOffset;
      let gridY = y - yOffset;
      if (currentLayer == 1) {
        if (gridX < 0) {
          let newGridX = (gridX * -1);
          let newGrid = grid;
          for (let x = 0; x < newGrid.length; x++) {
            let xArr = newGrid[x];
            for (let i = 0; i < newGridX; i++) {
              let j = ["grass"];
              j.push(...xArr);
              xArr = j;
            }
            newGrid[x] = xArr;
          }
          grid = newGrid
          xOffset += gridX;
          startPositionX -= gridX;
        } else if (gridX >= grid[0].length) {
          let newGridX = grid[0].length - gridX - 1;
          newGridX = (-1 * newGridX);
          let newGrid = grid;
          for (let x = 0; x < newGrid.length; x++) {
            for (let i = 0; i < newGridX; i++) {
              newGrid[x].push("grass");
            }
          };
          grid = newGrid;
        } else if (gridY < 0) {
          let newGridY = (gridY * -1);
          let newGrid = grid;
          for (let i = 0; i < newGridY; i++) {
            let newX = [];
            for (let j = 0; j < newGrid[0].length; j++) {
              newX.push("grass");
            };
            newX = [newX];
            newX.push(...newGrid);
            newGrid = newX;
          }
          grid = newGrid;
          yOffset += gridY;
          startPositionY -= gridY;
        } else if (gridY >= grid.length) {
          let newGridY = grid.length - gridY - 1;
          newGridY = (-1 * newGridY)
          let newGrid = grid;
          for (let i = 0; i < newGridY; i++) {
            let newX = [];
            for (let x = 0; x < newGrid[0].length; x++) {
              newX.push("grass");
            }
            newGrid.push(newX);
          }

          grid = newGrid;
        }
        try {
          if (currentTile.name == undefined) {
            currentTile.name = String(tiles.length);
            currentTile.xPos = currentTile.x * 16;
            currentTile.yPos = currentTile.y * 16;
            let solidTile = document.getElementById("solidTile");
            let encTile = document.getElementById("encounter").value;
            if (encTile == "on") {
              encTile = true
            } else if (encTile == "off") {
              encTile = false;
            }

            let value = solidTile.value;
            if (value == "off") {
              value = false;
            } else if (value == "on") {
              value = true;
            }
            let t = { name: currentTile.name, xPos: currentTile.xPos, yPos: currentTile.yPos, solid: value, encounter: encTile };
            tiles.push(t);
            grid[gridY][gridX] = t.name;
          } else {
            grid[gridY][gridX] = currentTile.name;
          }
        } catch {
        }
      } else if (currentLayer == 2) {
        layerTwo[x][y] = currentTile.name;
      }
    }
  })

  document.getElementById("solidTile").value = "off"

  document.getElementById("solidTile").addEventListener("click", () => {
    if (document.getElementById("solidTile").value == "on") {
      document.getElementById("solidTile").value = "off"
    } else if (document.getElementById("solidTile").value == "off") {
      document.getElementById("solidTile").value = "on"
    }
  });

  let encounterBox = document.getElementById("encounter");
  encounterBox.value = "off";
  encounterBox.addEventListener("click", () => {
    if (encounterBox.value == "on") {
      encounterBox.value = "off";
    } else if (encounterBox.value == "off") {
      encounterBox.value = "on";
    }
  })

  document.getElementById("addTile").addEventListener("click", () => {
    let tileName = document.getElementById("tileName").value;
    let solidTile = document.getElementById("solidTile");
    if (solidTile.value == "on") {
      solidTile = true;
    } else if (solidTile.value == "off") {
      solidTile = false;
    }

    let encounterTile = encounterBox.value;
    if (encounterTile == "on") {
      encounterTile = true;
    } else if (encounterTile == "off") {
      encounterTile = false;
    }

    let newTile = { name: tileName, solid: solidTile, encounter: encounterTile, xPos: currentTile.x * 16, yPos: currentTile.y * 16 };

    currentTile = newTile;
    console.log(currentTile);

    tiles.push(newTile);
  })

  document.getElementById("saveBtn").addEventListener("click", () => {
    let lvlName = document.getElementById("levelName").value;
    if (lvlName != "") {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/saveLevel");

      xhr.onload = () => {
        if (xhr.response == "OK") {
          document.getElementById("saved").innerHTML = "Level saved";
        }
      };
      xhr.setRequestHeader("Content-Type", "application/json");
      let pokes = {pokemons: [], levels: {min: 3, max: 3}};
      for (let v in pokemonEncounters) {
        if (pokemonEncounters[v] == true) {
          let p = pokemons.find(p => p.name == v);
          pokes.pokemons.push(p)
        }
      }

      let min = document.getElementById("min").value;
      let max = document.getElementById("max").value;
      pokes.levels.min = min;
      pokes.levels.max = max;

      let data = { grid: grid, layerTwo: layerTwo, tiles: tiles, name: lvlName, startPos: { x: startPositionX, y: startPositionY }, doors: doors, pokemons: pokes, npcs };
      xhr.send(JSON.stringify(data));
    }
  });

  let currentNpc = {x: 90, y: 40}

  document.getElementById("npcTurn").addEventListener("click", () => {
    if (currentNpc.y <= 310) {
      currentNpc.y += 92;
    } else {
      currentNpc.y = 40;
    }
  });

  document.getElementById("nextNpc").addEventListener("click", () => {
    if (currentNpc.x < 711) {
      currentNpc.x += 69 * 3;
    } else {
      currentNpc.x = 90;
    }
  })

  let npcImage = document.querySelector(".npcs");
  let npcCanvas = document.getElementById("npcSelector");
  npcCanvas.width = 64;
  npcCanvas.height = 64;
  let npcCtx = npcCanvas.getContext("2d");

  function gameLoop() {
    ctx.clearRect(0, 0, xSize * 16, ySize * 16)

    npcCtx.fillRect(0, 0, 64, 64);
    npcCtx.drawImage(npcImage, currentNpc.x, currentNpc.y, 64, 64, 0, 0, 64, 64);

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        drawTile(grid[y][x], x, y);
      }
    }

    ctx.fillStyle = "#000"
    ctx.fillRect((startPositionX + xOffset) * 16, (startPositionY + yOffset) * 16, 16, 16);
    doors.forEach(d => {
      ctx.fillStyle = "#f00";
      ctx.fillRect((d.x + xOffset) * 16, (d.y + yOffset) * 16, 16, 16);
    });

    npcs.forEach(n => {
      ctx.drawImage(npcImage, n.x, n.y, 64, 64, ((n.xPos + xOffset) * 16)-8, ((n.yPos + yOffset) * 16), 32, 32);
    })

    requestAnimationFrame(gameLoop)
  }

  gameLoop()
}
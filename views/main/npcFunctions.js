let pokemons;

(() => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://pokeapi.co/api/v2/pokemon?limit=151");

  xhr.onload = () => {
    let res = JSON.parse(xhr.response).results;
    pokemons = res;
  }

  xhr.send();
})();

function startNpcBattle(pokeArr, levels) {
  let arr = [];
  pokeArr.forEach(poke => {
    let url = pokemons.find(p => p.name == poke).url;
    let p = {name: poke, url: url};
    arr.push(p)
  })
  for (let i=0; i<arr.length; i++) {
    arr[i].level = levels[i];
  };

  let battle = new Battle(arr, userData.pokemons, false);
  console.log(battle);
  currentBattle = battle;
  inBattle = true;
}
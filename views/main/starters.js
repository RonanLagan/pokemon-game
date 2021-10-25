let starters = {
  charmander: {
    "name": "charmander",
    "url": "https://pokeapi.co/api/v2/pokemon/4/",
    "level": 4,
    "moves": [
        {
            "name": "scratch",
            "accuracy": 100,
            "statChanges": [],
            "type": "normal",
            "power": 40
        },
        {
            "name": "growl",
            "accuracy": 100,
            "statChanges": [
                {
                    "change": -1,
                    "stat": {
                        "name": "attack",
                        "url": "https://pokeapi.co/api/v2/stat/2/"
                    }
                }
            ],
            "type": "normal",
            "power": null
        }
    ]
  },
  bulbasaur: {
    "name": "bulbasaur",
    "url": "https://pokeapi.co/api/v2/pokemon/1/",
    "level": 4,
    "moves": [
        {
            "name": "growl",
            "accuracy": 100,
            "statChanges": [
                {
                    "change": -1,
                    "stat": {
                        "name": "attack",
                        "url": "https://pokeapi.co/api/v2/stat/2/"
                    }
                }
            ],
            "type": "normal",
            "power": null
        },
        {
            "name": "tackle",
            "accuracy": 100,
            "statChanges": [],
            "type": "normal",
            "power": 40
        }
    ]
  },
  squirtle: {
    "name": "squirtle",
    "url": "https://pokeapi.co/api/v2/pokemon/7/",
    "level": 4,
    "moves": [
        {
            "name": "tackle",
            "accuracy": 100,
            "statChanges": [],
            "type": "normal",
            "power": 40
        },
        {
            "name": "tail-whip",
            "accuracy": 100,
            "statChanges": [
                {
                    "change": -1,
                    "stat": {
                        "name": "defense",
                        "url": "https://pokeapi.co/api/v2/stat/3/"
                    }
                }
            ],
            "type": "normal",
            "power": null
        }
    ]
  }
}
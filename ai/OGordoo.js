const SIZE = 100
const MAP = new Int8Array(SIZE * SIZE) // State of the Map
const isFree = ({ x, y }) => MAP[y * SIZE + x] === 0 // 0 = block free
const isOccupied = ({ x, y }) => MAP[y * SIZE + x] === 1 // 1 = block occupied

// `inBounds` check if our coord (n) is an existing index in our MAP
const inBounds = (n) => n < SIZE && n >= 0

// `isInBounds` check that properties x and y of our argument are both in bounds
const isInBounds = ({ x, y }) => inBounds(x) && inBounds(y)

// `pickRandom` Get a random element from an array
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

// `update` this function is called at each turn
// update is called with a state argument that has 2 properties:
//   players: an array of all the players
//   player: the player for this AI

// Each players contains:
//   color: A number that represent the color of a player
//   name: A string of the player name
//   score: A number of the total block collected by this player
//   x: The horizontal position of the player
//   y: The vertical position of the player
//   coords: An array of 4 coordinates of the nearest blocks
//     [ NORTH, EAST, SOUTH, WEST ]
//                  N
//               W  +  E
//                  S

// Each coordinate contains:
//   x: The horizontal position
//   y: The vertical position
//   cardinal: A number between 0 and 3 that represent the cardinal
//     [ 0: NORTH, 1: EAST, 2: SOUTH, 3: WEST ]
//   direction: A number between 0 and 3 that represent the direction
//     [ 0: FORWARD, 1: RIGHT, 2: BACKWARD, 3: LEFT ]

const checkQuad = (x, y, size) =>
  x <= size / 2 ? (y <= size / 2 ? 0 : 2) : y <= size / 2 ? 1 : 3

const isAvailable = (pos, x = -1, y = -1) => {
  if (x === y && x === -1) {
    let x = pos.x,
      y = pos.y
    return isFree({ x, y }) && isInBounds({ x, y })
  } else {
    return isFree({ x, y }) && isInBounds({ x, y })
  }
}

/* const firstMove = (playerState) => {
  let x = playerState.x,
    y = playerState.y,
    finalDirec
  switch (checkQuad(x, y)) {
    case 0:
      finalDirec = x > y ? playerState.coords[0] : playerState.coords[3]
    case 1:
      finalDirec = SIZE - x > y ? playerState.coords[0] : playerState.coords[1]
    case 2:
      finalDirec = x > SIZE - y ? playerState.coords[2] : playerState.coords[3]
    case 3:
      finalDirec =
        SIZE - x > SIZE - y ? playerState.coords[2] : playerState.coords[1]
  }
  return finalDirec
} */

const checkWalls = (status) =>
  status.coords.map((c) => (isAvailable(c) ? 1 : 0))

const isAlley = (card, x, y) => {
  switch (card) {
    case 2:
      while (isInBounds({ x, y })) {
        if (!hasLateralWalls(card, x, y)) {
          return false
        }
        y++
      }
      return true
    case 1:
      while (isInBounds({ x, y })) {
        if (!hasLateralWalls(card, x, y)) {
          return false
        }
        x++
      }
      return true
    case 0:
      while (isInBounds({ x, y })) {
        if (!hasLateralWalls(card, x, y)) {
          return false
        }
        y--
      }
      return true
    case 3:
      while (isInBounds({ x, y })) {
        if (!hasLateralWalls(card, x, y)) {
          return false
        }
        x--
      }
      return true
  }
}
const hasLateralWalls = (card, x, y) => {
  switch (card) {
    case 2:
      return !(isAvailable('', x + 1, y + 1) || isAvailable('', x - 1, y + 1))
    case 1:
      return !(isAvailable('', x + 1, y - 1) || isAvailable('', x + 1, y - 1))
    case 0:
      return !(isAvailable('', x + 1, y - 1) || isAvailable('', x - 1, y - 1))
    case 3:
      return !(isAvailable('', x - 1, y + 1) || isAvailable('', x - 1, y - 1))
  }
}

const goRight = (status) => {
  if (isAvailable(status.coords[1]) && !isAlley(1, status.x, status.y))
    return status.coords[1]
}
const goLeft = (status) => {
  if (isAvailable(status.coords[3]) && !isAlley(3, status.x, status.y))
    return status.coords[3]
}
const goUp = (status) => {
  if (isAvailable(status.coords[0]) && !isAlley(0, status.x, status.y))
    return status.coords[0]
}
const goDown = (status) => {
  if (isAvailable(status.coords[2]) && !isAlley(2, status.x, status.y))
    return status.coords[2]
}

const walk = (status) => {
  let walls = checkWalls(status)
  if (walls.every((c) => c === 1)) {
    return goDown(status)
  }
  if (walls.filter((c) => c === 1).length === 1) {
    return status.coords[walls.indexOf(1)]
  }
  if (walls.toString() === [0, 1, 1, 1].toString())
    return goDown(status) || goRight(status) || goLeft(status)
  if (walls.toString() === [1, 0, 1, 1].toString())
    return goDown(status) || goUp(status) || goLeft(status)
  if (walls.toString() === [1, 1, 0, 1].toString())
    return goRight(status) || goUp(status) || goLeft(status)
  if (walls.toString() === [1, 1, 1, 0].toString())
    return goDown(status) || goRight(status) || goUp(status)
  if (walls.toString() === [0, 0, 1, 1].toString())
    return goLeft(status) || goDown(status)
  if (walls.toString() === [0, 1, 0, 1].toString())
    return goRight(status) || goLeft(status)
  if (walls.toString() === [0, 1, 1, 0].toString())
    return goDown(status) || goRight(status)
  if (walls.toString() === [1, 1, 0, 0].toString())
    return goRight(status) || goUp(status)
  if (walls.toString() === [1, 0, 0, 1].toString())
    return goUp(status) || goLeft(status)
  if (walls.toString() === [1, 0, 1, 0].toString())
    return goDown(status) || goUp(status)
}

// if (
//   playerState.coords.every(({ cardinal, direction, x, y }) =>
//     cardinal === 2 ? true : isFree({ x, y })
//   )
// ) {
//   console.log('MERDA')
//   finalDirec = firstMove(playerState)
// } else {
const update = (state) => {
  return walk(state.player)
}

// This part of the code should be left untouch since it's initializing
// and configuring communication of the web worker to the main page.
// Only edit that if you know your shit
addEventListener(
  'message',
  (self.init = (initEvent) => {
    const { seed, id } = JSON.parse(initEvent.data)
    const isOwnPlayer = (p) => p.name === id
    const addToMap = ({ x, y }) => (MAP[y * SIZE + x] = 1)

    let _seed = seed // We use a seeded random to replay games
    const _m = 0x80000000
    Math.random = () => (_seed = (1103515245 * _seed + 12345) % _m) / (_m - 1)
    removeEventListener('message', self.init)
    addEventListener('message', ({ data }) => {
      const players = JSON.parse(data)
      const player = players.find(isOwnPlayer)
      players.forEach(addToMap) // I update the MAP with the new position of
      // each players

      postMessage(JSON.stringify(update({ players, player })))
    })
    postMessage('loaded') // Signal that the loading is over
  })
)

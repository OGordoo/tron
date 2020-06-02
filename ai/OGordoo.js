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

const checkQuad = (x, y) => (x <= 50 ? (y <= 50 ? 0 : 2) : y <= 50 ? 1 : 3)

const isAvailable = (pos) => {
  let x = pos.x,
    y = pos.y
  return isFree({ x, y }) && isInBounds({ x, y })
}

const firstMove = (playerState) => {
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
}

const allAround = (status) => {
  if (isAvailable(status.coords[2])) {
    return status.coords[2]
  }
  if (isAvailable(status.coords[1])) {
    return status.coords[1]
  }
  if (isAvailable(status.coords[0])) {
    return status.coords[0]
  }
  if (isAvailable(status.coords[3])) {
    return status.coords[3]
  }
}

const moving = (playerState) => {
  let finalDirec = {}

  finalDirec = allAround(playerState)

  return finalDirec
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
  return moving(state.player)
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

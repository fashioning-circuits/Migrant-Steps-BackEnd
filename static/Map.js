// FIELDS ACCESSED BY INDEX.HTML SCRIPT: nodes, current, map, currentID, unlockable, links

// Every node in the map
// Object structure: id, excerpt{}, x, y
let nodes = [];

// The user's currently unlocked nodes (will be obtained from db)
const current = [{ id: 0 }, { id: 2 }, { id: 3 }, { id: 11 }];


// All nodes of map
const nodes = [
    {id: 0}, {id: 1}, {id: 2},
    {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}, {id: 13}, {id: 14}, {id: 15}, {id: 16}, {id: 17}, {id: 18}, {id: 19}
];

// The full map, represented as an adjacency list
const map = [];

// IDs of current nodes
const currentID = new Set();

// The user's unlockable node IDs
const unlockable = new Set();


// All links of map
const links = [
  { source: 0, target: 2 }, { source: 0, target: 4 }, { source: 0, target: 7 }, { source: 0, target: 9 },
  { source: 1, target: 2 }, { source: 1, target: 5 }, { source: 1, target: 6 }, { source: 1, target: 9 }, { source: 1, target: 10 }, { source: 1, target: 11 }, { source: 1, target: 18 },
  { source: 2, target: 3 }, { source: 2, target: 4 }, { source: 2, target: 5 }, { source: 2, target: 8 }, { source: 2, target: 9 }, { source: 2, target: 10 }, { source: 2, target: 11 }, { source: 2, target: 12 },
  { source: 3, target: 4 }, { source: 3, target: 9 }, { source: 3, target: 11 }, { source: 3, target: 12 }, { source: 3, target: 13 },
  { source: 4, target: 5 }, { source: 4, target: 7 }, { source: 4, target: 12 }, { source: 4, target: 13 }, { source: 4, target: 14 },
  { source: 5, target: 6 }, { source: 5, target: 13 }, { source: 5, target: 14 }, { source: 5, target: 15 },
  { source: 6, target: 7 }, { source: 6, target: 9 }, { source: 6, target: 14 }, { source: 6, target: 15 }, { source: 6, target: 16 },
  { source: 7, target: 8 }, { source: 7, target: 9 }, { source: 7, target: 15 }, { source: 7, target: 16 }, { source: 7, target: 17 },
  { source: 8, target: 9 }, { source: 8, target: 16 }, { source: 8, target: 17 }, { source: 8, target: 18 },
  { source: 9, target: 10 }, { source: 9, target: 17 }, { source: 9, target: 18 },
  { source: 10, target: 11 }, { source: 10, target: 18 },
  { source: 11, target: 12 },
  { source: 12, target: 13 },
  { source: 13, target: 14 },
  { source: 14, target: 15 },
  { source: 15, target: 16 },
  { source: 16, target: 17 },
  { source: 17, target: 18 }
];

async function requestExcerpts() {
  try {
    const response = await fetch('/excerpts');
    const excerpts = await response.json();
    console.log('Excerpts recieved');

    // asign an id to each excerpt and store it in nodes
    for (let i = 0; i < excerpts.length; i++) {
      nodes[i] = { id: i, excerpt: excerpts[i] };
    }
  
    // ensures there are at least 19 nodes in the map to render correctly 
    // added extra dummy node for demo purposes
    count = 0;
    while (nodes.length < 20) { 
      nodes.push({ id: nodes.length + count });
      count++;
    }

  } catch (error) {
    console.error('Error:', error)
  }

  buildmap();
};

function buildmap() {
  current.forEach(n => currentID.add(n.id));

  nodes.forEach(n => {
    map[n.id] = new Set()
  });
  // console.log(map);
  links.forEach(l => {
    map[l.source].add(l.target);
    map[l.target].add(l.source);
  });

  currentID.forEach(i => map[i].forEach(j => unlockable.add(j)));
  currentID.forEach(i => unlockable.delete(i)); // Not unlockable if already unlocked

  //module.exports = {map: map, unlockableID: unlockableID, currentID: currentID};
  map.forEach((connections, source) => {
    connections.forEach(target => {
      links.push({ source, target });
    });
  });

  const width = 600, height = 600;
  const centerX = width / 2, centerY = height / 2;

  function circularLayout(nodes, radiusIncrement) {
    const nodesPerCircle = 9;
    let currentCircle = 0, nodeIndex = 0;

    nodes[nodeIndex].x = centerX;
    nodes[nodeIndex].y = centerY;
    nodeIndex++;

    while (nodeIndex < nodes.length) {
      currentCircle++;
      const radius = currentCircle * radiusIncrement;
      const angleStep = (2 * Math.PI) / nodesPerCircle;

      for (let i = 0; i < nodesPerCircle && nodeIndex < nodes.length; i++) {
        const angle = i * angleStep - Math.PI / 2;
        nodes[nodeIndex].x = centerX + radius * Math.cos(angle);
        nodes[nodeIndex].y = centerY + radius * Math.sin(angle);
        nodeIndex++;
      }
    }
  }

  circularLayout(nodes, 80);
}

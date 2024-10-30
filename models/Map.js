// The user's currently unlocked nodes (will be obtained from db)
const current = [
    {id: 0}, {id: 2}, {id: 3}, {id: 11}
];

// All nodes of map
const nodes = [
    {id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}, {id: 13}, {id: 14}, {id: 15}, {id: 16}, {id: 17}, {id: 18}, {id: 19}
];

// All links of map
const links = [
    {source: 0, target: 2},{source: 0, target: 4},{source: 0, target: 7},{source: 0, target: 9},
    {source: 1, target: 2},{source: 1, target: 5},{source: 1, target: 6},{source: 1, target: 9},{source: 1, target: 10},{source: 1, target: 11},{source: 1, target: 18},
    {source: 2, target: 3},{source: 2, target: 4},{source: 2, target: 5},{source: 2, target: 8},{source: 2, target: 9},{source: 2, target: 10},{source: 2, target: 11},{source: 2, target: 12},
    {source: 3, target: 4},{source: 3, target: 9},{source: 3, target: 11},{source: 3, target: 12},{source: 3, target: 13},
    {source: 4, target: 5},{source: 4, target: 7},{source: 4, target: 12},{source: 4, target: 13},{source: 4, target: 14},
    {source: 5, target: 6},{source: 5, target: 13},{source: 5, target: 14},{source: 5, target: 15},
    {source: 6, target: 7},{source: 6, target: 9},{source: 6, target: 14},{source: 6, target: 15},{source: 6, target: 16},
    {source: 7, target: 8},{source: 7, target: 9},{source: 7, target: 15},{source: 7, target: 16},{source: 7, target: 17},
    {source: 8, target: 9},{source: 8, target: 16},{source: 8, target: 17},{source: 8, target: 18},
    {source: 9, target: 10},{source: 9, target: 17},{source: 9, target: 18},
    {source: 10, target: 11},{source: 10, target: 18},
    {source: 11, target: 12},
    {source: 12, target: 13},
    {source: 13, target: 14},
    {source: 14, target: 15},
    {source: 15, target: 16},
    {source: 16, target: 17},
    {source: 17, target: 18}
];

// IDs of current nodes
const currentID = new Set();
current.forEach(n => currentID.add(n.id));

// The full map, represented as an adjacency list
const map = [];
nodes.forEach(n => map[n.id] = new Set());
links.forEach(l => {
    map[l.source].add(l.target);
    map[l.target].add(l.source);
});

// The user's unlockable node IDs
const unlockableID = new Set();
currentID.forEach(i => map[i].forEach(j => unlockableID.add(j)));
currentID.forEach(i => unlockableID.delete(i)); // Not unlockable if already unlocked

module.exports = {map: map, unlockableID: unlockableID, currentID: currentID};
import { buildTree } from './facet-tree-ng';
import { data } from './data';

const svg = document.getElementById('mysvg');
const treeData = buildTree(data, svg)
console.log(treeData);
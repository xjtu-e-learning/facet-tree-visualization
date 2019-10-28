import { buildTree } from './facet-tree-ng';
import { data } from './data';
import * as d3 from 'd3';
import { color } from 'd3';

const svg = document.getElementById('mysvg');
const treeData = buildTree(data, svg);
console.log('data', data);
console.log('treeData:', treeData);

const canvas = d3.select('#mysvg');
canvas.append('g')
    .selectAll('rect')
    .data(treeData.branches)
    .enter()
    .append('rect')
    .attr('y', function(d) {return d.y})
    .attr('x', function(d) {return d.x})
    .attr('height', function(d) {return d.height})
    .attr('width', function(d) {return d.width})
    .attr('fill', function(d) {return d.color});

canvas.append('g')
    .selectAll('rect')
    .data(treeData.foldBranches)
    .enter()
    .append('rect')
    .attr('y', function(d) {return d.y})
    .attr('x', function(d) {return d.x})
    .attr('height', function(d) {return d.height})
    .attr('width', function(d) {return d.width})
    .attr('fill', function(d) {return d.color})
    .attr('transform', function(d) {return d.transform});
    
canvas.append('g')
    .selectAll('circle')
    .data(treeData.leaves)
    .enter()
    .append('circle')
    .attr('cx', (d) => d.cx)
    .attr('cy', d => d.cy)
    .attr('r', (d, i) => {
        return treeData.treeData[i].containChildrenFacet ? 0 : d.r * 1.5;
    })
    .attr('fill', d => d.color);

const pie = d3.pie().value(1);
const arc = d3.arc()
.innerRadius(0)
.outerRadius(20);

treeData.facetPieChart.forEach(element => {
    canvas.append('g')
    .attr('transform', element.transform)
    .selectAll('path')
    .data(pie(element.children as any))
    .enter()
    .append('path')
    .attr('d', arc as unknown as string)
    .attr('fill', element.color)
    .attr("stroke", "white")
    .attr("stroke-width", element.r / 10)
});
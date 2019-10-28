import { buildTree } from './facet-tree-ng';
import { data } from './data';
import * as d3 from 'd3';
import { color } from 'd3';
import { drawFacetForceLayout } from './facet-force-layout';

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

treeData.facetChart.forEach(element => {
    // 饼图
    // canvas.append('g')
    // .attr('transform', element.transform)
    // .selectAll('path')
    // .data(d3.pie().value(1)(element.children as any))
    // .enter()
    // .append('path')
    // .attr('d', d3.arc()
    // .innerRadius(0)
    // .outerRadius(20) as unknown as string)
    // .attr('fill', element.color)
    // .attr("stroke", "white")
    // .attr("stroke-width", element.r / 10)
    // 力导向图
    drawFacetForceLayout(element, svg);
});

const texts = canvas.append('g')
    .selectAll('text')
    .data(treeData.texts)
    .enter()
    .append('text')
    .attr('font-size', d => d.fontSize + 'px')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('fill', '#fff');

treeData.texts.forEach((element, index) => {
    d3.select((texts as any)._groups[0][index])
        .selectAll('tspan')
        .data(element.text.split(''))
        .enter()
        .append('tspan')
        .attr('x', element.x)
        .attr('dy', '1.2em')
        .text(d => d);
});
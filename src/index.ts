import * as d3 from 'd3';
import axios from 'axios';


import { buildTree, FacetData } from './facet-tree-ng';
import { data } from './data';
import { drawFacetPieChart } from './facet-pie-chart';
import { drawFacetForceLayout } from './facet-force-layout';

const svg = document.getElementById('mysvg');
const treeData = buildTree(data, svg);
console.log('data', data);
console.log('treeData:', treeData);

let currentFacetId = -1;
let expandedFacetId = -2;

async function clickFacet(facetId: number, facetName: string, parentFacetId = -2) {
    // return when facetId not change
    if (currentFacetId === facetId) return;
    
    // save facetId
    currentFacetId = facetId;

    if (expandedFacetId !== -2 && expandedFacetId !== parentFacetId) {
        // delete force layout
        const expandedNodes = document.getElementsByClassName(expandedFacetId.toString());
        while (expandedNodes.length) {
            expandedNodes[0].parentNode.removeChild(expandedNodes[0]);
        }
        // draw pie chart
        drawFacetPieChart(treeData.facetChart.filter(x => x.facetId === expandedFacetId)[0], svg, treeData, clickFacet);
        // reset expandedFacetId
        expandedFacetId = -2;
    }

    if (parentFacetId !== -2 && expandedFacetId !== parentFacetId) {
        expandedFacetId = parentFacetId;
        // delete pie chart
        const expandedNodes = document.getElementsByClassName(expandedFacetId.toString());
        while (expandedNodes.length) {
            expandedNodes[0].parentNode.removeChild(expandedNodes[0]);
        }
        // draw force layout
        drawFacetForceLayout(treeData.facetChart.filter(x => x.facetId === expandedFacetId)[0], svg, clickFacet);
    }

    // empty list
    const list = document.getElementById('list');
    const children = list.childNodes;
    for (let i = 0; i < children.length; i++) {
        list.removeChild(children[i]);
    }

    const ul = document.createElement('ul');
    let assembleNumber = 0;

    try {
        const res = await axios.get('http://yotta.xjtushilei.com:8083/assemble/getAssemblesByFacetId', {
            params: {
                facetId: facetId,
            },
        });
        
        if ((res as any).data.code === 200) {
            const assembleList = res.data.data;
            (assembleList as any).forEach(element => {
                const li = document.createElement('li');
                li.className = 'assemble';
                if (element.type === 'video') {
                    const regex = new RegExp('https://.*mp4');
                    li.innerHTML = `<video src='${regex.exec(element.assembleContent as string)[0]}' controls height="280"></video>`
                } else {
                    li.innerHTML = element.assembleContent;
                }
                ul.appendChild(li);
            });
            assembleNumber = assembleList.length;
        } else {
            throw('api error');
        }
    } catch (e) {
        console.log(e);
    }
    // whether current facet has changed or not
    if (currentFacetId === facetId) {
        list.appendChild(ul);
        document.getElementById('facet').innerHTML = facetName;
        document.getElementById('assembleNumber').innerHTML = assembleNumber.toString();
    }
}

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
    .attr('fill', d => d.color)
    .style('cursor', 'pointer')
    .on('click',(d, i) => clickFacet(treeData.branches[i].facetId, treeData.branches[i].facetName));

treeData.facetChart.forEach(element => {
    // 饼图
    drawFacetPieChart(element, svg, treeData, clickFacet);
    // 力导向图
    // drawFacetForceLayout(element, svg);
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

canvas.append('g')
    .append('text')
    .attr('x', svg.clientWidth / 2 - 24 * data.topicName.length / 2)
    .attr('y', svg.clientHeight - 10)
    .text(data.topicName)
    .attr('fill', '#000')
    .attr('font-size', '24px');
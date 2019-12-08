import * as d3 from 'd3';
import { map, distinctUntilChanged, debounce, filter, skip } from 'rxjs/operators';
import { interval } from 'rxjs';
import { isEqual } from 'lodash';

import { buildTree } from './facet-tree-ng';
import { drawFacetPieChart } from './facet-pie-chart';
import { drawFacetForceLayout } from './facet-force-layout';
import { globalState, globalData } from './state';
import { emptyChildren } from './tools/utils';

export function drawTree(svg, data, clickFacet): void {
    emptyChildren(svg);
    const canvas = d3.select(svg);
    const treeData = buildTree(data, svg);
    
    // fix closure
    globalData.treeData = treeData;

    if (globalState.getValue().init) {
        globalState.next({
            currentFacetId: -1,
            expandedFacetId: '-2,-2',
            init: true
        });
    } else {
        globalState.next({
            currentFacetId: -1,
            expandedFacetId: '-2,-2',
            init: true
        });
        
        globalState.pipe(
            debounce(() => interval(200)),
            filter(state => !isEqual(state, {
                currentFacetId: -1,
                expandedFacetId: '-2,-2',
                init: true,
            })),
            map(state => state.currentFacetId),
            distinctUntilChanged()
        ).subscribe(currentFacetId => {
            clickFacet(currentFacetId);
        });
    
        globalState.pipe(
            debounce(() => interval(200)),
            filter(state => !isEqual(state, {
                currentFacetId: -1,
                expandedFacetId: '-2,-2',
                init: true,
            })),
            map(state => state.expandedFacetId),
            filter(expandedFacetId => {
                const [prev, curr] = expandedFacetId.split(',');
                console.log(expandedFacetId);
                return prev !== curr;
            }),
            distinctUntilChanged()
        ).subscribe(expandedFacetId => {
            const [prev, curr] = expandedFacetId.split(',');
            if (prev !== '-2' && globalData.treeData.facetChart.filter(x => x.facetId.toString() === prev)[0]) {
                // delete force layout
                const expandedNodes = document.getElementsByClassName(prev);
                while (expandedNodes.length) {
                    expandedNodes[0].parentNode.removeChild(expandedNodes[0]);
                }
                // draw pie chart
                drawFacetPieChart(globalData.treeData.facetChart.filter(x => x.facetId.toString() === prev)[0], svg);
            }
            if (curr !== '-2' && globalData.treeData.facetChart.filter(x => x.facetId.toString() === curr)[0]) {
                // delete pie chart
                const expandedNodes = document.getElementsByClassName(curr);
                while (expandedNodes.length) {
                    expandedNodes[0].parentNode.removeChild(expandedNodes[0]);
                }
                // draw force layout
                drawFacetForceLayout(globalData.treeData.facetChart.filter(x => x.facetId.toString() === curr)[0], svg);
            }
        });
    }

    // draw branches
    canvas.append('g')
        .selectAll('rect')
        .data(treeData.branches)
        .enter()
        .append('rect')
        .attr('y', function (d) { return d.y })
        .attr('x', function (d) { return d.x })
        .attr('height', function (d) { return d.height })
        .attr('width', function (d) { return d.width })
        .attr('fill', function (d) { return d.color });
    // draw foldBranches
    canvas.append('g')
        .selectAll('rect')
        .data(treeData.foldBranches)
        .enter()
        .append('rect')
        .attr('y', function (d) { return d.y })
        .attr('x', function (d) { return d.x })
        .attr('height', function (d) { return d.height })
        .attr('width', function (d) { return d.width })
        .attr('fill', function (d) { return d.color })
        .attr('transform', function (d) { return d.transform });
    // draw first layer facet    
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
        .on('click', (d, i) => {
            const [prev, curr] = globalState.getValue().expandedFacetId.split(',');
            globalState.next(
                Object.assign(
                    {},
                    globalState.getValue(),
                    {
                        currentFacetId: treeData.branches[i].facetId,
                        expandedFacetId: curr + ',-2',
                    }
                )
            )
        });
    // draw second  layer facet
    treeData.facetChart.forEach(element => {
        // 饼图
        drawFacetPieChart(element, svg);
        // 力导向图
        // drawFacetForceLayout(element, svg);
    });
    // draw first layer facet name
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
    // draw topic name
    canvas.append('g')
        .append('text')
        .attr('x', svg.clientWidth / 2 - 24 * data.topicName.length / 2)
        .attr('y', svg.clientHeight - 10)
        .text(data.topicName)
        .attr('fill', '#000')
        .attr('font-size', '24px');
}
import * as d3 from 'd3';

import { FacetChartData, FacetData, Tree } from './facet-tree-ng';
import { globalState } from './state';

export function drawFacetPieChart(data: FacetChartData, dom: HTMLElement, fontSize = 12): void {
    const canvas = d3.select(dom);
    canvas.append('g')
        .attr('class', data.facetId)
        .attr('transform', data.transform)
        .selectAll('path')
        .data(d3.pie().value(1)(data.children as any))
        .enter()
        .append('path')
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(data.r) as unknown as string)
        .attr('fill', data.color)
        .attr("stroke", "white")
        .attr("stroke-width", data.r / 10)
        .style('cursor', 'pointer')
        .on('click', d => {
            const [prev, curr] = globalState.getValue().expandedFacetId.split(',');
            globalState.next({
                currentFacetId: (d.data as any).facetId,
                expandedFacetId: curr + ',' + data.facetId.toString(),
            });
        });
    const num = data.childrenNumber;
    const angle = Math.PI / num;

    canvas.append('g')
        .attr('class', data.facetId)
        .selectAll('text')
        .data(data.children)
        .enter()
        .append('text')
        .text(d => (d as FacetData).facetName)
        .attr('x', (d, i) => {
            if (angle === Math.PI) {
                if (data.cx >= dom.clientWidth / 2) {
                    return data.cx + data.r;
                }
                return data.cx - data.r - fontSize * (d as FacetData).facetName.length;
            }
            if (Math.sin(angle * (2 * i + 1)) < 0) {
                return data.cx + data.r * Math.sin(angle * (2 * i + 1)) - fontSize * (d as FacetData).facetName.length - fontSize;
            }
            return data.cx + data.r * Math.sin(angle * (2 * i + 1)) + fontSize;
        })
        .attr('y', (d, i) => {
            if (angle === Math.PI) {
                return data.cy - data.r;
            }
            return data.cy - data.r * Math.cos(angle * (2 * i + 1));
        })
        .attr('fill', '#000')
        .attr('font-size', fontSize + 'px');
}
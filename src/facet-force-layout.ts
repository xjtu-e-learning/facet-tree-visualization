import * as d3 from 'd3';

import { FacetChartData } from './facet-tree-ng';
import { globalState } from './state';

function calcFacetForceLayout(data: FacetChartData): {nodes: any[]; links: any[]} {
    const nodes = [];
    const links = [];
    const { childrenNumber } = data;
    for (let i = 0; i < childrenNumber; i++) {
        const node = Object.assign(
            {},
            data.children[i],
            {
                id: data.children[i].facetId,
            }
        );
        nodes.push(node);
    }
    for (let i = 0; i < childrenNumber - 1; i++) {
        const link = {
            source: nodes[i].id,
            target: nodes[i+1].id,
            value: 1,
        }
        links.push(link);
    }
    links.push({
        source: nodes[childrenNumber - 1].id,
        target: nodes[0].id,
        value: 1,
    });
    return {
        nodes,
        links,
    };
}

function fixna(x: number): number {
    if (isFinite(x)) return x;
    return 0;
}

export function drawFacetForceLayout(data: FacetChartData, dom: HTMLElement, fontSize = 12): void {
    const container = d3.select(dom).append('g');
    const { nodes, links } = calcFacetForceLayout(data);

    // 加载连线
    const link = container.attr('class', data.facetId).append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', '#aaa')
        .attr('stroke-width', '1px');
    // 加载圆圈
    const node = container.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', data.r / 3)
        .attr('fill', data.color)
        .style('cursor', 'pointer')
        .on('click', d => {
            const [prev, next] = globalState.getValue().expandedFacetId.split(',');
            globalState.next(
                Object.assign(
                    {},
                    globalState.getValue(),
                    {
                        currentFacetId: d.facetId,
                        expandedFacetId: next + ',' + data.facetId.toString(),
                    }
                )
            )
        });
    // 加载标签
    const label = container.append('g')
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('r', data.r / 3)
        .attr('fill', '#000')
        .attr('font-size', 15 + 'px')
        .text(d => d.facetName)
        .style('cursor', 'pointer')
        .on('click', d => {
            const [prev, next] = globalState.getValue().expandedFacetId.split(',');
            globalState.next(
                Object.assign(
                    {},
                    globalState.getValue(),
                    {
                        currentFacetId: d.facetId,
                        expandedFacetId: next + ',' + data.facetId.toString(),
                    }
                )
            )
        });
    const label1 = container.append('g')
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('r', data.r / 3)
        .attr('fill', '#99FF66')
        .attr('font-size', 15 + 'px')
        .text(d => d.childrenNumber)
        .style('cursor', 'pointer')
        .on('click', d => {
            const [prev, next] = globalState.getValue().expandedFacetId.split(',');
            globalState.next(
                Object.assign(
                    {},
                    globalState.getValue(),
                    {
                        currentFacetId: d.facetId,
                        expandedFacetId: next + ',' + data.facetId.toString(),
                    }
                )
            )
        });
    function updateLink(link): void {
        link.attr("x1", function (d) { return fixna(d.source.x); })
            .attr("y1", function (d) { return fixna(d.source.y); })
            .attr("x2", function (d) { return fixna(d.target.x); })
            .attr("y2", function (d) { return fixna(d.target.y); });
    }

    function updateNode(node): void {
        node.attr("transform", function (d) {
            return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
        });
    }

    function updateLabel(label):void{
        label.attr("transform", function (d) {
            return "translate(" + fixna(d.x-fontSize*d.facetName.length/2) + "," + fixna(d.y) + ")";
        });
    }
    function updateLabel1(label):void{
        label.attr("transform", function (d) {
            return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
        });
    }
    function ticked(): void {
        node.call(updateNode);
        link.call(updateLink);
        label.call(updateLabel);
        // label1.call(updateLabel1);
        // label
        //     .attr('x', d => {
        //         if (d.x === data.cx && d.x > dom.clientWidth / 2) {
        //             return d.x + data.r / 2;
        //         }
        //         if (d.x <= data.cx) {
        //             return d.x - d.facetName.length * fontSize - fontSize;
        //         }
        //         return d.x + data.r / 2;
                
        //     })
        //     .attr('y', d => {
        //         if (d.y >= data.cy) {
        //             return d.y - data.r / 2;
        //         }
        //         return d.y + data.r / 2;
        //     });
    }

    // 创建一个力模拟
    // 应用力模拟
    const graphLayout = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(data.cx, data.cy))
        .force("x", d3.forceX(data.cx).strength(1))
        .force("y", d3.forceY(data.cy).strength(1))
        .force("link", (d3.forceLink(links) as any).id(d => d.id).distance(2 * data.r))
        .on("tick", ticked);

    function dragstarted(d): void {
        d3.event.sourceEvent.stopPropagation();
        if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d): void {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d): void {
        if (!d3.event.active) graphLayout.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    node.call(
        d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    );
}
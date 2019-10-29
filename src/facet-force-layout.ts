import { FacetChartData } from './facet-tree-ng';
import * as d3 from 'd3';

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

    const link = container.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', '#aaa')
        .attr('stroke-width', '1px');

    const node = container.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', data.r / 2)
        .attr('fill', data.color);

    const label = container.append('g')
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('fill', '#000')
        .attr('font-size', fontSize + 'px')
        .text(d => d.facetName);

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

    function ticked(): void {
        node.call(updateNode);
        link.call(updateLink);
        label
            .attr('x', d => {
                if (d.x === data.cx && d.x > dom.clientWidth / 2) {
                    return d.x + data.r / 2;
                }
                if (d.x <= data.cx) {
                    return d.x - d.facetName.length * fontSize - fontSize;
                }
                return d.x + data.r / 2;
                
            })
            .attr('y', d => {
                if (d.y >= data.cy) {
                    return d.y - data.r / 2;
                }
                return d.y + data.r / 2;
            });
    }

    const graphLayout = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("center", d3.forceCenter(data.cx, data.cy))
        .force("x", d3.forceX(data.cx).strength(1))
        .force("y", d3.forceY(data.cy).strength(1))
        .force("link", (d3.forceLink(links) as any).id(d => d.id).distance(5).strength(0.5))
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
import * as d3 from 'd3';

import { FacetChartData, FacetData, Tree } from './facet-tree-ng';
import { globalState } from './state';


export function drawFacetPieChart(data: FacetChartData, dom: HTMLElement, fontSize = 12): void {
    const canvas = d3.select(dom);
    
    var piedata = d3.pie().value(1)(data.children as any)

    console.log("data",data)
    console.log("piedata",piedata)
    var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(data.r) as unknown as string

    var arc1 = d3.arc()
                .innerRadius(0)
                .outerRadius(data.r+70) as unknown as string
    // var arcs1 = canvas.selectAll('g.arc1'+data.facetId)
    //                  .data(piedata)
    //                  .enter()
    //                  .append('g')
    //                  .attr('class','arc1'+data.facetId)
    //                  .attr("transform",data.transform)
    // // 饼图与文字相连的曲线起点
    // var pointStart = d3.arc()
    //                    .innerRadius(data.r)
    //                    .outerRadius(data.r) as unknown as string
    // // 饼图与文字相连的曲线终点
    // var pointEnd = d3.arc()
    //                  .innerRadius(data.r + 5)
    //                  .outerRadius(data.r + 5) as unknown as string
   
    
    // console.log("pointStart",pointStart)
    // console.log("pointEnd",pointEnd)

    
   
    //@ts-ignore
    var arcs = canvas.selectAll('g.arc'+data.facetId)
                     .data(piedata)
                     .enter()
                     .append('g')
                     .attr('class','arc'+data.facetId)
                     .attr("transform",data.transform)
    
    arcs.append("path")
        .attr("fill",data.color)
        .attr('d',arc)
        .attr("stroke", "white")
        .attr("stroke-width", data.r / 10)
        .style('cursor', 'pointer')
        .on('click', d => {
            const [prev, curr] = globalState.getValue().expandedFacetId.split(',');
            globalState.next(
                Object.assign(
                    {},
                    globalState.getValue(),
                    {
                        currentFacetId: (d.data as any).facetId,
                        expandedFacetId: curr + ',' + data.facetId.toString(),
                    }
                )
            )
            const divTooltip = document.getElementById('facet-tree-tooltip');
            d3.select(divTooltip).transition().transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on('mouseover', d => {     
            const divTooltip = document.getElementById('facet-tree-tooltip');
            d3.select(divTooltip).transition()
                .duration(200)
                .style("opacity", .9);
            d3.select(divTooltip).html((d as any).data.facetName)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            const divTooltip = document.getElementById('facet-tree-tooltip');
            d3.select(divTooltip).transition().transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    arcs.append('text')
            .attr("transform",function(d){
                //@ts-ignore
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("text-anchor","middle")
            .text((d, i) => {
                
                return piedata[i].data["childrenNumber"];
            })
            .attr('fill', '#fff')
            .attr('font-size', 12 + 'px')
            .on('click', d => {
                const [prev, curr] = globalState.getValue().expandedFacetId.split(',');
                globalState.next(
                    Object.assign(
                        {},
                        globalState.getValue(),
                        {
                            currentFacetId: (d.data as any).facetId,
                            expandedFacetId: curr + ',' + data.facetId.toString(),
                        }
                    )
                )
                const divTooltip = document.getElementById('facet-tree-tooltip');
                d3.select(divTooltip).transition().transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('mouseover', d => {
                
                const divTooltip = document.getElementById('facet-tree-tooltip');
                d3.select(divTooltip).transition()
                    .duration(200)
                    .style("opacity", .9);
                d3.select(divTooltip).html((d as any).data.facetName)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                const divTooltip = document.getElementById('facet-tree-tooltip');
                d3.select(divTooltip).transition().transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        
        arcs.append('text')
            .attr("transform",function(d){
                
                //@ts-ignore
                return "translate(" + arc1.centroid(d) + ")";
            })
            .attr("text-anchor","middle")
            .text((d, i) => {
                
                return piedata[i].data["facetName"];
            })
            .attr('fill', '#000')
            .attr('font-size', 10 + 'px')
            // .attr('x',10)
            // .attr('y',10)
            .on('click', d => {
                const [prev, curr] = globalState.getValue().expandedFacetId.split(',');
                globalState.next(
                    Object.assign(
                        {},
                        globalState.getValue(),
                        {
                            currentFacetId: (d.data as any).facetId,
                            expandedFacetId: curr + ',' + data.facetId.toString(),
                        }
                    )
                )
                const divTooltip = document.getElementById('facet-tree-tooltip');
                d3.select(divTooltip).transition().transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('mouseover', d => {
                
                const divTooltip = document.getElementById('facet-tree-tooltip');
                d3.select(divTooltip).transition()
                    .duration(200)
                    .style("opacity", .9);
                d3.select(divTooltip).html((d as any).data.facetName)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                const divTooltip = document.getElementById('facet-tree-tooltip');
                d3.select(divTooltip).transition().transition()
                    .duration(500)
                    .style("opacity", 0);
            }); 
    // // 添加饼图外面的文字
    // arcs1.append("g")
    //     .attr("transform",function(d){
    //     //@ts-ignore
    //     return 'translate( ' + data.r + ', ' + data.r + ' )'})
    //     .selectAll('path')
    //     .data(piedata)
    //     .enter()
    //     .append('text')
    //     .text((d, i) => {  
    //         return piedata[i].data["facetName"];
    //     })
    //     .attr('x',function(d) {
    //         return pointStart.centroid(d)[0]
    //     })
    //     .attr('y', function(d) {
    //         return pointStart.centroid(d)[1]
    //     })
    //     .style('font-size', 10)

    


    const num = data.childrenNumber;
    const angle = Math.PI / num;


    // canvas.append('g')
    //     .attr('class', data.facetId)
    //     .selectAll('foreignObject')
    //     .data(data.children)
    //     .enter()
    //     .append('foreignObject')
    //     .attr('width',50)
    //     .attr('height',100)
    //     .attr('x', (d, i) => {
    //         if (angle === Math.PI) {
    //             if (data.cx >= dom.clientWidth / 2) {
    //                 return data.cx + data.r/2;
    //             }
    //             return data.cx - data.r - fontSize * (d as FacetData).facetName.length;
    //         }
    //         if (Math.sin(angle * (2 * i + 1)) < 0) {
    //             return data.cx + data.r * Math.sin(angle * (2 * i + 1)) - fontSize * (d as FacetData).facetName.length - fontSize;
    //         }
    //         return data.cx + data.r * Math.sin(angle * (2 * i + 1)) + fontSize;
    //     })
    //     .attr('y', (d, i) => {
    //         if (angle === Math.PI) {
    //             return data.cy - data.r;
    //         }
    //         return data.cy - data.r * Math.cos(angle * (2 * i + 1));
    //     })
    //     .append('xhtml:p')
    //     .style('width',50)
    //     .style('heiht',100)
    //     .style('color','#000')
    //     .style('margin-block-start',0)
    //     .style('margin-block-end',0)
    //     .text(d => (d as FacetData).facetName)
        
    //     .attr('cursor', 'pointer')
    //     .attr('fill', '#000')
    //     .style('font-size', 8 + 'px');

}


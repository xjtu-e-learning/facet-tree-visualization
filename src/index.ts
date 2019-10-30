import * as d3 from 'd3';
import axios from 'axios';


import { buildTree, FacetData } from './facet-tree-ng';
import { data } from './data';
import { drawFacetPieChart } from './facet-pie-chart';
import { drawFacetForceLayout } from './facet-force-layout';

const svg = document.getElementById('mysvg');

let currentFacetId = -1;

async function clickFacet(facetId: number, facetName: string, parentFacetId = -2) {
    // return when facetId not change
    if (currentFacetId === facetId) return;

    // save facetId
    currentFacetId = facetId;

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
            throw ('api error');
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
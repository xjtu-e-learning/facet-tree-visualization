import axios from 'axios';

import {drawTree} from './src';
// import { data } from './data';

const svg = document.getElementById('mysvg');

async function clickFacet(facetId: number) {

    try {
        const res = await axios.get('http://yotta.xjtushilei.com:8083/facet/getFacetNameAndParentFacetNameByFacetId', {
            params: {
                facetId,
            }
        });
        if ((res as any).data.code === 200) {
            document.getElementById('facet').innerHTML = (res.data.data.parentFacetName ?  res.data.data.parentFacetName + ' - ' : '') + res.data.data.facetName;
        } else {
            throw(res.data)
        }
    } catch (e) {
        console.log(e);
        document.getElementById('facet').innerHTML = '';
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
            list.appendChild(ul);
            document.getElementById('assembleNumber').innerHTML = assembleNumber.toString();
        } else {
            throw ('api error');
        }
    } catch (e) {
        console.log(e);
        document.getElementById('assembleNumber').innerHTML = '';
    }

}

axios.get('http://yotta.xjtushilei.com:8083/topic/getTopicsByDomainName?domainName=数据结构')
    .then(res => {
        const topics = res.data.data;
        for (const topic of topics) {
            const topicButton = document.createElement('button');
            topicButton.innerHTML = topic.topicName;
            topicButton.onclick = () => {
                axios.post('http://yotta.xjtushilei.com:8083/topic/getCompleteTopicByTopicName?topicName=' + encodeURIComponent(topic.topicName) + '&hasFragment=emptyAssembleContent').then(res => {
                    console.log(res.data.data)
                    drawTree(svg, res.data.data, clickFacet);
                }).catch(err => console.log(err))
            }
            document.getElementById('topic-list').appendChild(topicButton);
        }
    })
    .catch(err => console.log(err));




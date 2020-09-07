import axios from 'axios';

import {drawTree} from '..';
// import { data } from './data';

const svg = document.getElementById('mysvg');

async function clickFacet(facetId: number) {
    /*define your action*/
    console.log("")
}

axios.post('http://yotta.xjtushilei.com:8083/topic/getCompleteTopicByTopicName?topicName=' + encodeURIComponent('图论术语') + '&hasFragment=emptyAssembleContent').then(res => {
    console.log("res.data.data",res.data.data)
    drawTree(svg, res.data.data, clickFacet);
}).catch(err => console.log(err))




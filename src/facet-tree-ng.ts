import { isEmpty } from 'lodash';
import { presetPalettes } from '@ant-design/colors';

// 调色板
const palettes = [];
for (const key in presetPalettes) {
    palettes.push(presetPalettes[key]);
}
// variables
// 调色板色号
const ColorNo = 7;
// 分面字体大小范围
const minFacetFontSize = 8;
const maxFacetFontSize = 20;
// 内容丰富度权重
const weightSecondFacet = 2000;
const weightFirstLayerVideo = 100;
const weightFirstLayerRichText = 1;
const weightSecondLayerVideo = 100;
const weightSecondLayerRichText = 1;
// 最矮树干占绘制区域比例
const branchRate = 0.4;
// 一级分面间距占分面宽度比例
const branchIntervalRate = 0.2;
// 树干总宽度占绘制区域比例
const branchWidthRate = 0.5;

const firstLayerThreshold = 7;
const secondLayerThreshold = 5;
/**
 * input: [a, b, c, d, e]
 * output: [c, b, d, e, a]
 * @param arr 
 */
export function camelSort(arr: Array<any>): Array<any> {
    const result = [];
    while (arr.length > 0) {
        result.push(...arr.splice(Math.floor((arr.length) / 2), 1));
    }
    return result;
}

interface AssembleData {
    assembleId: number;
    assembleContent: string;
    assembleScratchTime: string;
    facetId: number;
    sourceId: number;
    type: string;
    flag: string;
    url: string;
    assembleType: 'text' | 'video';
}

export interface FacetData {
    facetId: number;
    facetName: string;
    // 1: 一级分面 2: 二级分面
    facetLayer: number;
    parentFacetId: number;
    topicId: number;
    childrenNumber: number;
    type: string;
    // true: 子节点是分面 false: 子节点是碎片
    containChildrenFacet: boolean;
    children: (AssembleData | FacetData)[];
}

interface TreeData {
    topicId: number;
    topicName: string;
    topicUrl: string;
    topicLayer: number;
    domainId: number;
    childrenNumber: number;
    children: FacetData[];
}

/**
 * 计算分面权重
 * @param facetData 分面数据 
 */
function calcWeight(facetData: FacetData): number {
    // 折叠分面，权重为0
    if (facetData.facetId === -1) return 0;
    // 一级分面
    if (facetData.facetLayer === 1) {
        // 有二级分面
        if (facetData.containChildrenFacet) {
            return weightSecondFacet * facetData.childrenNumber;
        }
        // 没有二级分面
        return facetData.children.reduce((acc: number, curr: AssembleData): number => {
            if (curr.assembleType === 'text') {
                return acc + weightFirstLayerRichText;
            } else {
                return acc + weightFirstLayerVideo;
            }
        }, 0);
    } else {
        if (facetData.containChildrenFacet) {
            return weightSecondFacet * facetData.childrenNumber;
        }
        return facetData.children.reduce((acc: number, curr: AssembleData): number => {
            if (curr.flag === 'fragment') {
                return acc + weightSecondLayerRichText;
            } else {
                return acc + weightSecondLayerVideo;
            }
        }, 0);
    }

}

interface Branch {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    facetId: number;
    facetName: string;
    chilrenNumber:number;
}

interface Leaf {
    cx: number;
    cy: number;
    r: number;
    color: string;
}

interface FoldBranch {
    x: number;
    y: number;
    width: number;
    height: number;
    transform: string;
    color: string;
}

interface TextData {
    text: string;
    x: number;
    y: number;
    fontSize: number;
}

export interface Tree {
    branches: Branch[];
    leaves: Leaf[];
    foldBranches: FoldBranch[];
    facetChart: FacetChartData[];
    treeData: FacetData[];
    texts: TextData[];
    texts_leaf : TextData[];
}

export interface FacetChartData extends FacetData {
    transform: string;
    color: string;
    r: number;
    cx: number;
    cy: number;
}

function calcFacetChart(data: FacetData, cx: number, cy: number, color: string, r: number): FacetChartData {
    console.log(data);
    const result = Object.assign(
        {},
        data,
        {
            transform: `translate(${cx},${cy})`,
            cx,
            cy,
            r,
            color,
        }
    );
    return result;
}

export function buildTree(data: TreeData, dom: HTMLElement): Tree {

    const result: Tree = {
        branches: [],
        leaves: [],
        foldBranches: [],
        treeData: [],
        facetChart: [],
        texts: [],
        texts_leaf:[],
    }

    // 如果传入数据为空
    if (isEmpty(data) || !dom) return result;

    // viewport宽高
    let width: number = dom.clientWidth;
    const height: number = dom.clientHeight;

    // 一级分面数量
    const firstLayerNumber: number = data.childrenNumber;

    /**
     * 如果只有一个一级分面， 单独处理
     */
    if (firstLayerNumber === 1) {
        result.branches.push({
            x: width / 2 - 16,
            y: height * branchRate,
            width: 32,
            height: height * branchRate - 40,
            color: palettes[0][ColorNo],
            facetId: data.children[0].facetId,
            facetName: data.children[0].facetName,
            chilrenNumber:data.children[0].childrenNumber,
        });
        result.leaves.push({
            cx: width / 2,
            cy: height * 0.382,
            r: 20,
            color: palettes[0][ColorNo],
        });
        result.foldBranches.push({
            x: width / 2 - 8,
            y: height * 0.618,
            width: 16,
            height: 0,
            transform: '',
            color: '',
        });
        result.treeData = data.children;

        if (data.children[0].containChildrenFacet) {
            result.facetChart.push(
                calcFacetChart(data.children[0],
                    result.leaves[0].cx,
                    result.leaves[0].cy,
                    result.leaves[0].color,
                    result.leaves[0].r)
            );
        }

        result.texts.push({
            x: result.branches[0].x + 32 / 2 - 30 / 2,
            y: result.branches[0].y + 8,
            text: result.branches[0].facetName,
            fontSize: 30
        });

        result.texts_leaf.push({
            x: result.leaves[0].cx,
            y: result.leaves[0].cy,
            // text: data.children[0].childrenNumber.toString(),
            text: result.branches[0].chilrenNumber.toString(),
            fontSize: 18
        })
        return result;
    }

    // 判断是否视窗过小，需要折叠分面（弃用）
    // const foldFlag = branchWidthRate * width < (14 * firstLayerNumber - 4) ? true : false;
    // 
    const foldFlag = firstLayerNumber > firstLayerThreshold ? true : false;

    // 计算分面权重
    const firstLayerMap = [];
    for (const facet of data.children) {
        firstLayerMap.push({
            facetId: facet.facetId,
            value: calcWeight(facet),
            containChildrenFacet: facet.containChildrenFacet,
        });
    }

    // 根据权重排序
    firstLayerMap.sort((a, b) => a.value - b.value);

    let firstLayerTmp = data.children;

    // 如果需要折叠
    if (foldFlag) {
        // 可容纳最多一级分面数
        // const maxFirstLayerNumber = Math.floor((width * branchWidthRate + 4) / 14);
        const maxFirstLayerNumber = firstLayerThreshold;
        // 权重大于weightSecondFacet的分面（约为有二级分面的一级分面）
        const firstLayerNumberWithSecondLayer = firstLayerMap.filter(x => x.value > weightSecondFacet - 1).length;
        // 剩余可折叠分面
        const firstLayerNumberWithoutSecondLayer = firstLayerNumber - firstLayerNumberWithSecondLayer;

        // 用来存放要折叠的一级分面facetId
        let foldFacetIds = [];

        if (maxFirstLayerNumber < firstLayerNumberWithSecondLayer + 1) {
            // 最多可容纳一级分面 < 有二级分面的一级分面数，只将可折叠的一级分面全部折叠
            foldFacetIds.concat(firstLayerMap.filter(x => x.value < weightSecondFacet).map(x => x.facetId));
        } else {
            // 否则折叠部分
            foldFacetIds = foldFacetIds.concat(
                firstLayerMap.slice(maxFirstLayerNumber - 1 > 0 ? maxFirstLayerNumber - 1 : 0)
                    .map(x => x.facetId)
            );
        }
        if (foldFacetIds.length) {
            let tmp: FacetData[] = [];
            tmp = tmp.concat(firstLayerTmp.filter(x => foldFacetIds.indexOf(x.facetId) === -1));
            const facetTmp: FacetData = {
                facetId: -1,
                facetName: '其他分面',
                facetLayer: -1,
                parentFacetId: 0,
                topicId: data.topicId,
                childrenNumber: foldFacetIds.length,
                type: 'branch',
                containChildrenFacet: true,
                children: firstLayerTmp.filter(x => foldFacetIds.indexOf(x.facetId) !== -1),
            };
            tmp.push(facetTmp);
            firstLayerTmp = tmp;
        }
    }

    // sort fold facets
    firstLayerTmp.sort((a, b) => calcWeight(b) - calcWeight(a));

    result.treeData = firstLayerTmp;

    const firstLayerTmpNumber = firstLayerTmp.length;
    // 分面数奇偶性
    const odd = firstLayerTmpNumber % 2 === 1 ? true : false;
    // 叶子分布的高度
    const topHeight = height * (1 - branchRate);
    // calc leaves position
    const angle = Math.PI / (firstLayerTmpNumber*2 );
    const r1 = width * Math.tan(angle) / (2 * (1 + Math.tan(angle)));
    const r2 = odd ? topHeight / (1 + 1 / Math.sin(angle)) : topHeight / (1 + 1 / Math.tan(angle));
    const r = r1 < r2 ? r1 : r2;
    const R = r / Math.sin(angle);

    const deltaInterval = R + r < topHeight ? (topHeight - R - r) / firstLayerTmpNumber * 2 : 0;

    let initAngle = odd ? 0 : angle;
    let tempIndex = Math.floor(firstLayerTmpNumber / 2);
    while (initAngle < Math.PI / 2) {
        const leaf1: Leaf = {
            cx: R * Math.sin(initAngle) + width / 2,
            cy: topHeight - R * Math.cos(initAngle) - deltaInterval * tempIndex,
            r: r / 2,
            color: '#ffffff',
        };
        const leaf2 = { ...leaf1 };
        leaf2.cx = width / 2 - R * Math.sin(initAngle);
        result.leaves.push(leaf1);
        result.leaves.push(leaf2);
        initAngle += angle * 2;
        tempIndex--;
    }
    if (odd) {
        result.leaves.shift();
    }
    for (let i = 0; i < firstLayerTmpNumber; i++) {
        result.leaves[i].color = palettes[i][ColorNo];
    }

    // 一级分面宽度
    const widthBetweenSide = Math.abs(result.leaves[firstLayerTmpNumber - 1].cx - result.leaves[firstLayerTmpNumber - 2].cx);
    const xInitFlag = (widthBetweenSide - r) < (width * branchWidthRate) ? true : false;
    const facetWidth = xInitFlag ? (Math.abs(result.leaves[firstLayerTmpNumber - 1].cx - result.leaves[firstLayerTmpNumber - 2].cx) - r) / ((1 + branchIntervalRate) * firstLayerTmpNumber - branchIntervalRate) : (width * branchWidthRate) / ((1 + branchIntervalRate) * firstLayerTmpNumber - branchIntervalRate);
    const facetInterval = facetWidth * branchIntervalRate;
    // 最左横坐标
    let xInit = (result.leaves[firstLayerTmpNumber - 1].cx < result.leaves[firstLayerTmpNumber - 2].cx
        ? result.leaves[firstLayerTmpNumber - 1].cx + r / 2
        : result.leaves[firstLayerTmpNumber - 2].cx + r / 2);
    if (!xInitFlag) {
        xInit = width * (1 - branchWidthRate) / 2;
    }
    // 初始化一级分面对应的branch
    firstLayerTmp.forEach((facet, index) => {
        const branch: Branch = {
            x: xInit + index * (1 + branchIntervalRate) * facetWidth,
            y: 0,
            width: facetWidth,
            height: 0,
            facetId: -1,
            facetName: '',
            color: '',
            chilrenNumber:0,
        };
        result.branches.push(branch);
    });

    // 将初始化的branch从中间到两边重新排序
    result.branches = camelSort(result.branches);

    for (let i = 0; i < firstLayerTmpNumber; i++) {
        result.branches[i].facetName = firstLayerTmp[i].facetName;
        result.branches[i].facetId = firstLayerTmp[i].facetId;
        result.branches[i].chilrenNumber = firstLayerTmp[i].childrenNumber;
    }

    for (let i = 0; i < firstLayerTmpNumber; i++) {
        result.branches[i].y = result.leaves[i].cy / 2 + height * (1 - branchRate * 0.8) / 2;
        result.branches[i].height = height - result.branches[i].y - 40;
        result.branches[i].color = palettes[i][ColorNo];
    }

    /**
     * 生成foldBranches
     */
    tempIndex = firstLayerTmpNumber + 1;
    for (let i = 0; i < firstLayerTmpNumber; i++) {
        const foldBranch: FoldBranch = {
            x: result.branches[i].x < width / 2 ? result.branches[i].x + result.branches[i].width : result.branches[i].x - result.branches[i].width,
            y: result.branches[i].y,
            width: result.branches[i].width,
            height: result.branches[i].x > width / 2 ? Math.sqrt(Math.pow(result.leaves[i].cx - result.branches[i].x + facetWidth / 2, 2) + Math.pow(result.leaves[i].cy - result.branches[i].y, 2)) / 2
                : Math.sqrt(Math.pow(result.leaves[i].cx - result.branches[i].x - facetWidth, 2) + Math.pow(result.leaves[i].cy - result.branches[i].y, 2)) / 2,
            transform: '',
            color: palettes[i][ColorNo],
        }

        const middleX = result.branches[i].x + foldBranch.width / 2;
        const middleY = foldBranch.y;

        const angle = Math.atan(Math.abs((result.leaves[i].cy - middleY) / (result.leaves[i].cx - middleX))) / Math.PI * 180;
        if (result.branches[i].x < width / 2) {
            foldBranch.transform = 'rotate(' + (angle + 90) + ' ' + foldBranch.x + ',' + foldBranch.y + ')';
        } else {
            foldBranch.transform = 'rotate(' + (-angle - 90) + ' ' + result.branches[i].x + ',' + foldBranch.y + ')';
        }

        result.foldBranches.push(foldBranch);
        tempIndex--;
    }

    // const fontSize = facetWidth - 4 > maxFacetFontSize ? maxFacetFontSize : facetWidth - 4;

    // for (let i = 0; i < firstLayerTmpNumber; i++) {
    //     // 生成facetChart
    //     if (firstLayerTmp[i].containChildrenFacet) {
    //         result.facetChart.push(
    //             calcFacetChart(firstLayerTmp[i],
    //                 result.leaves[i].cx,
    //                 result.leaves[i].cy,
    //                 result.leaves[i].color,
    //                 result.leaves[i].r)
    //         );
    //     }
    const fontSizew = facetWidth - 10 > maxFacetFontSize ? maxFacetFontSize : facetWidth - 4;
    
    for (let i = 0; i < firstLayerTmpNumber; i++) {
        // 生成facetChart
        if (firstLayerTmp[i].containChildrenFacet) {
            result.facetChart.push(
                calcFacetChart(firstLayerTmp[i],
                    result.leaves[i].cx,
                    result.leaves[i].cy,
                    result.leaves[i].color,
                    result.leaves[i].r,
                   )
            );
        }
        let fontSize = fontSizew;
        const fontSizeh = result.branches[i].height/(result.branches[i].facetName.length+8);
       
        if (fontSizew > fontSizeh ){
              fontSize = fontSizeh;
        }
        else{
               fontSize = fontSizew;
        }
        // 生成text
        result.texts.push({
            x: result.branches[i].x + facetWidth / 2 - fontSize / 2,
            y: result.branches[i].y + 8,
            text: result.branches[i].facetName,
            fontSize
        });

       
        result.texts_leaf.push({
            x: result.leaves[i].cx - (fontSize * data.children[i].childrenNumber.toString().length) / 3,
            y: result.leaves[i].cy +  fontSize*0.6  ,
            text: result.branches[i].chilrenNumber.toString(),
            fontSize
        })
    }

    for (const leaf of result.leaves) {
        leaf.r = facetWidth * 0.6;
    }

    for (const pie of result.facetChart) {
        pie.r = facetWidth * 0.8;
    }

    return result;
}


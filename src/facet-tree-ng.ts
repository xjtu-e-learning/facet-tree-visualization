import { isEmpty } from 'lodash';

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
}

interface FacetData {
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
    if (facetData.facetId === -1) return 0;
    if (facetData.containChildrenFacet) {
        return 100 * facetData.childrenNumber + facetData.children.reduce((acc: number, curr: FacetData) => acc + calcWeight(curr), 0);
    }
    return facetData.children.reduce((acc: number, curr: AssembleData): number => {
        if (curr.flag === 'fragment') {
            return acc + 1;
        } else {
            return acc + 10;
        }
    }, 0);
}

// 分面字体大小范围
const minFacetFontSize = 8;
const maxFacetFontSize = 20;

interface Branch { 
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    facetId: number;
    facetName: string;
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
}

interface Tree {
    branches: Branch[];
    leaves: Leaf[];
    foldBranches: FoldBranch[];
    treeData: { [p: string]: any }[];
}

export function buildTree(data: TreeData, dom: HTMLObjectElement): Tree {
    const result: Tree = {
        branches: [],
        leaves: [],
        foldBranches: [],
        treeData: [],
    }

    // 如果传入数据为空
    if (isEmpty(data) || isEmpty(dom)) return result;

    // viewport宽高
    let width: number = dom.offsetWidth;
    const height: number = dom.offsetHeight;

    // 一级分面数量
    const firstLayerNumber: number = data.childrenNumber;

    /**
     * 如果只有一个一级分面， 单独处理
     * TODO: 二级分面显示
     */
    if (firstLayerNumber === 1) {
        result.branches.push({
            x: width / 2 - 8,
            y: height * 0.618,
            width: 16,
            height: height * 0.382,
            color: '#ffffff',
            facetId: data.children[0].facetId,
            facetName: data.children[0].facetName,
        });
        result.leaves.push({
            cx: width / 2,
            cy: height * 0.382,
            r: 12,
            color: '#ffffff',
        });
        result.foldBranches.push({
            x: width / 2 - 8,
            y: height * 0.618,
            width: 16,
            height: 0,
            transform: '',
        });
        result.treeData = data.children;
        return result;
    }

    // 判断是否视窗过小，需要折叠分面
    const foldFlag = 0.8 * width < (14 * firstLayerNumber - 4) ? true : false;

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

    // 视窗实在太小需要支持拖动
    let dragflag = false;

    let firstLayerTmp = data.children;

    // 如果需要折叠
    if (foldFlag) {
        // 可容纳最多一级分面数
        const maxFirstLayerNumber = Math.floor((width * 0.8 + 4) / 14);
        // 权重大于100的分面（约为有二级分面的一级分面）
        const firstLayerNumberWithSecondLayer = firstLayerMap.filter(x => x.value > 100).length;
        // 剩余可折叠分面
        const firstLayerNumberWithoutSecondLayer = firstLayerNumber - firstLayerNumberWithSecondLayer;

        // 用来存放要折叠的一级分面facetId
        const foldFacetIds = [];

        if (maxFirstLayerNumber < firstLayerNumberWithSecondLayer + 1) {
            // 最多可容纳一级分面 < 有二级分面的一级分面数，只将可折叠的一级分面全部折叠
            dragflag = true;
            foldFacetIds.concat(firstLayerMap.filter(x => x.value < 100).map(x => x.facetId));
        } else {
            // 否则折叠部分
            foldFacetIds.concat(
                firstLayerMap.slice(maxFirstLayerNumber - 1 > 0 ? maxFirstLayerNumber - 1 : 0)
                    .map(x => x.facetId)
            );
        }

        if (foldFacetIds.length) {
            const tmp: FacetData[] = [];
            tmp.concat(firstLayerTmp.filter(x => foldFacetIds.indexOf(x.facetId) === -1));
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

    if (dragflag) width = (14 * firstLayerNumber - 4) / 0.8;

    // sort fold facets
    firstLayerTmp.sort((a, b) => calcWeight(b) - calcWeight(a));

    const firstLayerTmpNumber = firstLayerTmp.length;
    const odd = firstLayerTmpNumber % 2 === 1 ? true : false;
    const topHeight = height * 0.618;
    // calc leaves position
    const angle = Math.PI / ( firstLayerTmpNumber * 2 );
    const r1 = width * Math.tan(angle) / ( 2 * (1 + Math.tan(angle)));
    const r2 = odd ? topHeight / (1 + 1/Math.sin(angle)) : topHeight / (1 + 1/Math.tan(angle));
    const r = r1 < r2 ? r1 : r2;
    const R = r / Math.sin(angle);
    let initAngle = odd ? 0 : angle;
    while (initAngle < Math.PI / 2) {
        const leaf1: Leaf = {
            cx: R * Math.sin(initAngle) + width / 2,
            cy: topHeight - R * Math.cos(initAngle),
            r: r,
            color: '#ffffff',
        };
        const leaf2 = {...leaf1};
        leaf2.cx = width / 2 - R * Math.sin(initAngle);
        result.leaves.push(leaf1);
        result.leaves.push(leaf2);
        initAngle += angle * 2;
    }
    if (odd) {
        result.leaves.unshift();
    }

    // 一级分面宽度
    const facetWidth = (Math.abs(result.leaves[firstLayerTmpNumber - 1].cx - result.leaves[firstLayerTmpNumber - 2].cx) - 2 * r) / (1.4 * firstLayerTmpNumber - 0.4);
    const facetInterval = facetWidth * 0.4;
    // 最左横坐标
    const xInit = (result.leaves[firstLayerTmpNumber - 1].cx < result.leaves[firstLayerTmpNumber - 2].cx 
            ? result.leaves[firstLayerTmpNumber - 1].cx
            : result.leaves[firstLayerTmpNumber - 2].cx);

    firstLayerTmp.forEach((facet, index) => {
        const branch: Branch = {
            x: xInit + index * 1.4 * facetWidth,
            y: 0,
            width: facetWidth,
            height: 0,
            facetId: facet.facetId,
            facetName: facet.facetName,
            color: '',
        };
        result.branches.push(branch);
    });

    result.branches = camelSort(result.branches);
    
    result.branches[firstLayerTmpNumber - 1].y = height * 0.618;
    result.branches[firstLayerTmpNumber - 1].height = height * 0.382;
    result.branches[firstLayerTmpNumber - 2].y = height * 0.618;
    result.branches[firstLayerTmpNumber - 2].height = height * 0.382;
    
    return result;
}


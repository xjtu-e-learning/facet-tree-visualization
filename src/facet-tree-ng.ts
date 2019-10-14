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

export function drawTree(data: TreeData, dom: HTMLObjectElement): void {
    // viewport宽高
    const width: number = dom.offsetWidth;
    const height: number = dom.offsetHeight;

    // 一级分面数量
    const firstLayerNumber: number = data.childrenNumber;

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
            // 最可容纳一级分面 < 有二级分面的一级分面数，只将可折叠的一级分面全部折叠
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
    
}
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
    children: AssembleData[] | FacetData[];
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

// 分面字体大小范围
const minFacetFontSize = 8;
const maxFacetFontSize = 20;

export function drawTree(data: TreeData, dom: HTMLObjectElement): void {
    // viewport宽高
    const width: number = dom.offsetWidth;
    const height: number = dom.offsetHeight;

    // 一级分面数量
    const firstLayerNumber: number = data.childrenNumber;

    
}
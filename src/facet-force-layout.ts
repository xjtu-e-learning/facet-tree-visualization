import { FacetData } from './facet-tree-ng';

function calcFacetForceLayout(data: FacetData) {
    const nodes = [];
    const links = [];
    const {childrenNumber} = data;
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
            target: nodes[i].id,
            value: 1,
        }
        links.push(link);
    }
    links.push({
        source: nodes[childrenNumber - 1].id,
        target: nodes[0].id,
        value: 1,
    });
    return null;
}
export function emptyChildren(dom: HTMLElement): void {
    const children = dom.childNodes;
    while (children.length > 0) {
        dom.removeChild(children[0]);
    }
}
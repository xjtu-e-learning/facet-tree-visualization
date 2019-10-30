import { BehaviorSubject } from 'rxjs';

export const globalState = new BehaviorSubject({
    currentFacetId: -1,
    expandedFacetId: '-2,-2',
});
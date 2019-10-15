import { camelSort } from '../src/facet-tree-ng';

test('[a, b, c, d, e] => [c, d, b, e, a]', () => {
    expect(camelSort(['a', 'b', 'c', 'd', 'e']).join('')).toBe('cdbea');
});

test('[a, b, c, d, e, f] => [d, c, e, b, f, a]', () => {
    expect(camelSort(['a', 'b', 'c', 'd', 'e', 'f']).join('')).toBe('dcebfa');
});
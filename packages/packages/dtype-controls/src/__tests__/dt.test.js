import {dT} from '../index.js';

test('random', () => {
  let result;

  const obj = {value: ["aaaa", 10], type: {label: 'string', label2: 'uint256'}, name: "smth"};

  result = dT.t.apply(obj, 'random');
  expect(result.value[0]).toBe('');
  expect(result.value[1]).not.toBeNull();
  expect(result.value[1].gte(new dT.BN(0))).toBe(true);
  expect(result.type.label).toBe('string');
  expect(result.type.label2).toBe('uint256');
})

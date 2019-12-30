import dT from '../index';

test('random_simple', () => {
  let result;

  const obj = {value: ['aaaa', 10], type: {label: 'string', label2: 'uint256'}, name: 'smth'};

  result = dT.t.apply(obj, 'random');
  expect(typeof result.value[0] === 'string').toBe(true);
  expect(result.value[1]).not.toBeNull();
  expect(result.value[1].gte(new dT.BN(0))).toBe(true);
  expect(result.type.label).toBe('string');
  expect(result.type.label2).toBe('uint256');
})

test('random_array', () => {
  let result;

  const obj = {value: [[10, 20]], type: {label: 'uint256[]'}, name: 'smth'};

  result = dT.t.apply(obj, 'random');
  expect(result.value[0] instanceof Array).toBe(true);
  expect(result.value[0][0].gte(new dT.BN(0))).toBe(true);
  expect(result.value[0][1].gte(new dT.BN(0))).toBe(true);
  expect(result.type.label).toBe('uint256[]');
})

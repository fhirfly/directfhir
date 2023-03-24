const base = '0245f397-6g82-427a-bf00-';
const current = 100000000000;

const getCurrent = jest.fn();

const uuid = jest.fn(() => {
  const step = getCurrent.mock.calls.length;

  // call getCurrent to generate step
  getCurrent();

  const uuid = base + (current + step).toString();

  return uuid;
});

export { uuid };
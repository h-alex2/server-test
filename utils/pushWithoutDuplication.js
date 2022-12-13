function pushWithoutDuplication(arr, pushItem) {
  arr.push(pushItem);

  const deduplication = new Set(arr);

  return [...deduplication];
}

module.exports = pushWithoutDuplication;

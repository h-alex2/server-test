function removeDuplication(arr) {
  const deduplication = new Set(arr);

  return [...deduplication];
}

module.exports = pushWithoutDuplication;

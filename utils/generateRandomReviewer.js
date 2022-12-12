function generateRandomReviewer(peopleArr) {
  const deduplication = new Set(peopleArr);

  const people = [...deduplication];

  const order = people
    .map((person) => ({
      name: person,
      number: Math.ceil(Math.random() * 100),
    }))
    .sort((a, b) => a.number - b.number)
    .map((person) => person.name);

  return order.join(" => ") + " => " + order[0];
}

module.exports = generateRandomReviewer;

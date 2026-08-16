const Problem = require('../models/Problem');

const initializeTags = async () => {
  try {
    const updates = [
      { title: 'Two Sum', tags: ['Array', 'Hash Table', 'Easy'] },
      { title: 'Reverse Linked List', tags: ['Linked List', 'Easy'] },
      { title: 'Binary Search', tags: ['Array', 'Binary Search', 'Easy'] },
    ];

    for (const item of updates) {
      await Problem.updateOne({ title: item.title }, { $set: { tags: item.tags } });
    }

    console.log('✅ Existing problems tagged successfully!');
  } catch (err) {
    console.error('Error tagging problems:', err);
  }
};

module.exports = { initializeTags };

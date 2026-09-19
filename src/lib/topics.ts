export interface Topic {
	id: string;
	title: string;
	description: string;
}

export const CUSTOM_TOPIC_ID = 'custom';

export const TOPICS: Topic[] = [
	{ id: 'fractions', title: 'Fractions & Ratios', description: 'Add, compare and simplify fractions, and reason about ratios.' },
	{ id: 'photosynthesis', title: 'Photosynthesis', description: 'How plants turn light, water and CO₂ into energy.' },
	{ id: 'newtons-laws', title: "Newton's Laws of Motion", description: 'Force, mass, acceleration and action-reaction pairs.' },
	{ id: 'python-basics', title: 'Python Basics', description: 'Variables, loops, functions and reading simple code.' },
	{ id: 'probability', title: 'Intro to Probability', description: 'Chance, independent events and expected outcomes.' },
	{ id: 'french-revolution', title: 'The French Revolution', description: 'Causes, key events and consequences, 1789-1799.' }
];

export const getTopic = (id: string): Topic | undefined => TOPICS.find((t) => t.id === id);

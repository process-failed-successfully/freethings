// Worksheet Generator JavaScript

// Template emoji arrays for variety
const templateEmojis = {
    flowers: ['🌺', '🌸', '🌻', '🌷', '🌹', '🌼', '🌿', '🌾', '🌱', '🌴', '🌵', '🌲'],
    dinosaurs: ['🦖', '🦕', '🦈', '🐊', '🦖', '🦕', '🦈', '🐊', '🦖', '🦕', '🦈', '🐊'],
    rainbow: ['✨', '⭐', '🌟', '💫', '⚡', '🔥', '💎', '🎈', '🎀', '🎁', '🎊', '🎉'],
    animals: ['🐾', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁']
};

// Configuration for subjects and learning types
const subjectConfig = {
    maths: {
        learningTypes: ['addition', 'subtraction', 'multiplication', 'division', 'mixed-operations', 'number-bonds', 'comparing-numbers'],
        generators: {
            addition: generateAdditionProblem,
            subtraction: generateSubtractionProblem,
            multiplication: generateMultiplicationProblem,
            division: generateDivisionProblem,
            'mixed-operations': generateMixedOperationsProblem,
            'number-bonds': generateNumberBondsProblem,
            'comparing-numbers': generateComparingNumbersProblem
        }
    },
    english: {
        learningTypes: ['spelling', 'vocabulary', 'grammar'],
        generators: {
            spelling: generateSpellingProblem,
            vocabulary: generateVocabularyProblem,
            grammar: generateGrammarProblem
        }
    },
    science: {
        learningTypes: ['facts'],
        generators: {
            facts: generateScienceFactProblem
        }
    }
};

// Data for English and Science
const worksheetData = {
    spelling: {
        level1: ['cat', 'dog', 'sun', 'bat', 'hat', 'run', 'fun', 'big', 'red', 'ten'], // CVC
        level2: ['ship', 'chop', 'that', 'with', 'sing', 'king', 'duck', 'bell', 'fish', 'math'], // Digraphs
        level3: ['play', 'rain', 'boat', 'coat', 'team', 'leaf', 'light', 'night', 'high', 'moon'], // Long vowels
        level4: ['star', 'park', 'bird', 'girl', 'turn', 'corn', 'fork', 'house', 'mouse', 'down'], // R-controlled & diphthongs
        level5: ['happy', 'little', 'apple', 'rabbit', 'summer', 'better', 'letter', 'yellow', 'funny', 'puppy'], // Double consonants
        level6: ['table', 'bottle', 'circle', 'people', 'simple', 'candle', 'middle', 'gentle', 'uncle', 'handle'], // le ending
        level7: ['action', 'nation', 'future', 'nature', 'picture', 'measure', 'treasure', 'famous', 'nervous', 'various'], // Suffixes
        level8: ['because', 'friend', 'people', 'could', 'should', 'would', 'laugh', 'enough', 'through', 'thought'], // Tricky words
        level9: ['accident', 'business', 'calendar', 'complete', 'describe', 'imagine', 'interest', 'mention', 'promise', 'separate'], // Multi-syllable
        level10: ['accommodate', 'appreciate', 'communicate', 'conscience', 'determined', 'embarrass', 'guarantee', 'necessary', 'restaurant', 'vehicle'] // Challenge
    },
    vocabulary: {
        level1: [
            { word: 'big', definition: 'Large in size' },
            { word: 'small', definition: 'Not big' },
            { word: 'fast', definition: 'Moving quickly' },
            { word: 'slow', definition: 'Moving not quickly' },
            { word: 'hot', definition: 'Having a high temperature' }
        ],
        level2: [
            { word: 'happy', definition: 'Feeling or showing pleasure' },
            { word: 'sad', definition: 'Feeling or showing sorrow' },
            { word: 'angry', definition: 'Feeling or showing strong annoyance' },
            { word: 'scared', definition: 'Fearful; frightened' },
            { word: 'brave', definition: 'Ready to face and endure danger' }
        ],
        level3: [
            { word: 'begin', definition: 'Start' },
            { word: 'finish', definition: 'End' },
            { word: 'above', definition: 'In a higher place' },
            { word: 'below', definition: 'In a lower place' },
            { word: 'create', definition: 'Make' }
        ],
        level4: [
            { word: 'ancient', definition: 'Very old' },
            { word: 'modern', definition: 'Relating to the present' },
            { word: 'common', definition: 'Happening often' },
            { word: 'rare', definition: 'Not happening often' },
            { word: 'vast', definition: 'Of very great extent or quantity' }
        ],
        level5: [
            { word: 'habitat', definition: 'The natural home of an animal' },
            { word: 'predator', definition: 'An animal that hunts others' },
            { word: 'prey', definition: 'An animal that is hunted' },
            { word: 'adapt', definition: 'Change to suit a new purpose' },
            { word: 'survive', definition: 'Continue to live' }
        ],
        level6: [
            { word: 'gravity', definition: 'Force that attracts a body to the earth' },
            { word: 'energy', definition: 'Strength and vitality required for activity' },
            { word: 'force', definition: 'Strength or energy as an attribute of action' },
            { word: 'matter', definition: 'Physical substance' },
            { word: 'mass', definition: 'A large body of matter with no definite shape' }
        ],
        level7: [
            { word: 'democracy', definition: 'A system of government by the whole population' },
            { word: 'citizen', definition: 'A legally recognized subject or national' },
            { word: 'election', definition: 'A formal and organized choice by vote' },
            { word: 'parliament', definition: 'The highest legislature' },
            { word: 'government', definition: 'The governing body of a nation' }
        ],
        level8: [
            { word: 'ecosystem', definition: 'A biological community of interacting organisms' },
            { word: 'environment', definition: 'The surroundings or conditions' },
            { word: 'pollution', definition: 'The presence in or introduction into the environment of a substance or thing that has harmful or poisonous effects' },
            { word: 'conservation', definition: 'Prevention of wasteful use of a resource' },
            { word: 'renewable', definition: 'Capable of being renewed' }
        ],
        level9: [
            { word: 'hypothesis', definition: 'A supposition or proposed explanation' },
            { word: 'experiment', definition: 'A scientific procedure undertaken to make a discovery' },
            { word: 'conclusion', definition: 'The end or finish of an event or process' },
            { word: 'observation', definition: 'The action or process of observing something' },
            { word: 'variable', definition: 'Not consistent or having a fixed pattern' }
        ],
        level10: [
            { word: 'metaphor', definition: 'A figure of speech in which a word or phrase is applied to an object or action to which it is not literally applicable' },
            { word: 'simile', definition: 'A figure of speech involving the comparison of one thing with another thing of a different kind' },
            { word: 'alliteration', definition: 'The occurrence of the same letter or sound at the beginning of adjacent or closely connected words' },
            { word: 'personification', definition: 'The attribution of a personal nature or human characteristics to something nonhuman' },
            { word: 'hyperbole', definition: 'Exaggerated statements or claims not meant to be taken literally' }
        ]
    },
    grammar: {
        level1: [
            { question: 'Circle the noun (person, place, or thing): "The cat ran."', answer: 'cat' },
            { question: 'Circle the noun: "I see a dog."', answer: 'dog' },
            { question: 'Circle the noun: "The sun is hot."', answer: 'sun' },
            { question: 'Circle the noun: "My hat is red."', answer: 'hat' },
            { question: 'Circle the noun: "The ball is blue."', answer: 'ball' }
        ],
        level2: [
            { question: 'Circle the verb (action word): "The dog runs."', answer: 'runs' },
            { question: 'Circle the verb: "I jump high."', answer: 'jump' },
            { question: 'Circle the verb: "She sings a song."', answer: 'sings' },
            { question: 'Circle the verb: "We play tag."', answer: 'play' },
            { question: 'Circle the verb: "He eats an apple."', answer: 'eats' }
        ],
        level3: [
            { question: 'Circle the adjective (describing word): "The red ball."', answer: 'red' },
            { question: 'Circle the adjective: "A big house."', answer: 'big' },
            { question: 'Circle the adjective: "The happy dog."', answer: 'happy' },
            { question: 'Circle the adjective: "A fast car."', answer: 'fast' },
            { question: 'Circle the adjective: "The hot sun."', answer: 'hot' }
        ],
        level4: [
            { question: 'Correct the sentence: "i like dogs"', answer: 'I like dogs.' },
            { question: 'Correct the sentence: "he is my friend"', answer: 'He is my friend.' },
            { question: 'Correct the sentence: "where is the cat"', answer: 'Where is the cat?' },
            { question: 'Correct the sentence: "the sky is blue"', answer: 'The sky is blue.' },
            { question: 'Correct the sentence: "we go to school"', answer: 'We go to school.' }
        ],
        level5: [
            { question: 'Identify the subject: "The cat chased the mouse."', answer: 'The cat' },
            { question: 'Identify the subject: "My brother plays soccer."', answer: 'My brother' },
            { question: 'Identify the subject: "The sun shines brightly."', answer: 'The sun' },
            { question: 'Identify the subject: "We are going to the park."', answer: 'We' },
            { question: 'Identify the subject: "The bird sings sweetly."', answer: 'The bird' }
        ],
        level6: [
            { question: 'Choose the correct word: "They [are/is] playing."', answer: 'are' },
            { question: 'Choose the correct word: "He [runs/run] fast."', answer: 'runs' },
            { question: 'Choose the correct word: "We [was/were] happy."', answer: 'were' },
            { question: 'Choose the correct word: "She [has/have] a book."', answer: 'has' },
            { question: 'Choose the correct word: "I [am/is] reading."', answer: 'am' }
        ],
        level7: [
            { question: 'Identify the adverb: "He ran quickly."', answer: 'quickly' },
            { question: 'Identify the adverb: "She sings beautifully."', answer: 'beautifully' },
            { question: 'Identify the adverb: "They played happily."', answer: 'happily' },
            { question: 'Identify the adverb: "The dog barked loudly."', answer: 'loudly' },
            { question: 'Identify the adverb: "He spoke softly."', answer: 'softly' }
        ],
        level8: [
            { question: 'Choose the correct homophone: "I [see/sea] the ocean."', answer: 'see' },
            { question: 'Choose the correct homophone: "The [sun/son] is hot."', answer: 'sun' },
            { question: 'Choose the correct homophone: "I [won/one] the game."', answer: 'won' },
            { question: 'Choose the correct homophone: "She [ate/eight] the apple."', answer: 'ate' },
            { question: 'Choose the correct homophone: "The [bear/bare] is big."', answer: 'bear' }
        ],
        level9: [
            { question: 'Active or Passive voice? "The ball was thrown by John."', answer: 'Passive' },
            { question: 'Active or Passive voice? "John threw the ball."', answer: 'Active' },
            { question: 'Active or Passive voice? "The cake was eaten by me."', answer: 'Passive' },
            { question: 'Active or Passive voice? "I ate the cake."', answer: 'Active' },
            { question: 'Active or Passive voice? "The song was sung by her."', answer: 'Passive' }
        ],
        level10: [
            { question: 'Identify the clause type: "[When it rains], we stay inside."', answer: 'Dependent' },
            { question: 'Identify the clause type: "We stay inside [when it rains]."', answer: 'Dependent' },
            { question: 'Identify the clause type: "[I like apples] because they are sweet."', answer: 'Independent' },
            { question: 'Identify the clause type: "I like apples [because they are sweet]."', answer: 'Dependent' },
            { question: 'Identify the clause type: "[The dog barked] and the cat ran."', answer: 'Independent' }
        ]
    },
    science: {
        facts: {
            level1: [
                { question: 'Is a rock living or non-living?', answer: 'Non-living' },
                { question: 'Is a tree living or non-living?', answer: 'Living' },
                { question: 'Is a dog living or non-living?', answer: 'Living' },
                { question: 'Is water living or non-living?', answer: 'Non-living' },
                { question: 'Is a bird living or non-living?', answer: 'Living' }
            ],
            level2: [
                { question: 'What do we call the time when the sun is out?', answer: 'Day' },
                { question: 'What do we call the time when the moon is out?', answer: 'Night' },
                { question: 'What season is hot?', answer: 'Summer' },
                { question: 'What season is cold?', answer: 'Winter' },
                { question: 'What falls from the sky when it rains?', answer: 'Water' }
            ],
            level3: [
                { question: 'What does a plant need to grow?', answer: 'Sunlight and Water' },
                { question: 'What part of the plant grows underground?', answer: 'Roots' },
                { question: 'What part of the plant is green?', answer: 'Leaves' },
                { question: 'What do bees collect from flowers?', answer: 'Nectar' },
                { question: 'What grows into a new plant?', answer: 'Seed' }
            ],
            level4: [
                { question: 'What is the solid form of water?', answer: 'Ice' },
                { question: 'What is the gas form of water?', answer: 'Steam' },
                { question: 'What happens to ice when it gets hot?', answer: 'Melts' },
                { question: 'What happens to water when it gets very cold?', answer: 'Freezes' },
                { question: 'What state of matter is air?', answer: 'Gas' }
            ],
            level5: [
                { question: 'Which planet do we live on?', answer: 'Earth' },
                { question: 'What gives us light and heat during the day?', answer: 'Sun' },
                { question: 'Does the Earth go around the Sun or the Moon?', answer: 'Sun' },
                { question: 'How many planets are in our solar system?', answer: 'Eight' },
                { question: 'What is the name of our galaxy?', answer: 'Milky Way' }
            ],
            level6: [
                { question: 'What force pulls things down to Earth?', answer: 'Gravity' },
                { question: 'What force slows things down when they rub together?', answer: 'Friction' },
                { question: 'What do magnets attract?', answer: 'Iron/Metal' },
                { question: 'What poles of a magnet repel each other?', answer: 'Like poles' },
                { question: 'What poles of a magnet attract each other?', answer: 'Opposite poles' }
            ],
            level7: [
                { question: 'What is the basic unit of life?', answer: 'Cell' },
                { question: 'What gas do we breathe in?', answer: 'Oxygen' },
                { question: 'What gas do we breathe out?', answer: 'Carbon Dioxide' },
                { question: 'What pumps blood around our body?', answer: 'Heart' },
                { question: 'What organ helps us breathe?', answer: 'Lungs' }
            ],
            level8: [
                { question: 'What is the center of an atom called?', answer: 'Nucleus' },
                { question: 'What charge does a proton have?', answer: 'Positive' },
                { question: 'What charge does an electron have?', answer: 'Negative' },
                { question: 'What charge does a neutron have?', answer: 'Neutral' },
                { question: 'What is H2O?', answer: 'Water' }
            ],
            level9: [
                { question: 'What is the process where plants make food?', answer: 'Photosynthesis' },
                { question: 'What green pigment is used in photosynthesis?', answer: 'Chlorophyll' },
                { question: 'What energy source is used in photosynthesis?', answer: 'Sunlight' },
                { question: 'What gas do plants release?', answer: 'Oxygen' },
                { question: 'What gas do plants take in?', answer: 'Carbon Dioxide' }
            ],
            level10: [
                { question: 'What is the study of genes called?', answer: 'Genetics' },
                { question: 'What molecule carries genetic information?', answer: 'DNA' },
                { question: 'What is a change in DNA called?', answer: 'Mutation' },
                { question: 'Who is the father of evolution?', answer: 'Charles Darwin' },
                { question: 'What is survival of the fittest?', answer: 'Natural Selection' }
            ]
        }
    }
};

// Page size configurations (problems per page based on layout)
const pageSizeConfig = {
    A4: {
        problemsPerPage: 20, // 2 columns, ~10 rows
        width: '21cm',
        height: '29.7cm'
    },
    Letter: {
        problemsPerPage: 18, // 2 columns, ~9 rows
        width: '21.59cm',
        height: '27.94cm'
    },
    Legal: {
        problemsPerPage: 24, // 2 columns, ~12 rows
        width: '21.59cm',
        height: '35.56cm'
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateLearningOptions();
    calculateProblemsCount();
});

// Update learning options based on selected subject
function updateLearningOptions() {
    const subject = document.getElementById('subject-select').value;
    const learningSelect = document.getElementById('learning-select');
    const config = subjectConfig[subject];
    
    // Clear existing options
    learningSelect.innerHTML = '';
    
    // Add new options based on subject
    config.learningTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = capitalizeFirst(type);
        learningSelect.appendChild(option);
    });
}

// Calculate number of problems based on page size and page count
function calculateProblemsCount() {
    const pageSize = document.getElementById('page-size-select').value;
    const pageCount = parseInt(document.getElementById('page-count').value) || 1;
    const config = pageSizeConfig[pageSize];
    
    const totalProblems = config.problemsPerPage * pageCount;
    
    // Update hint text
    const hint = document.getElementById('problems-hint');
    if (hint) {
        hint.textContent = `Will generate ${totalProblems} problems (${config.problemsPerPage} per page × ${pageCount} page${pageCount > 1 ? 's' : ''})`;
    }
    
    // If worksheet is already generated, regenerate it with new count
    if (window.currentWorksheet) {
        // Trigger regeneration by calling generateWorksheet
        // But only if the count actually changed
        const currentCount = window.currentWorksheet.problems ? window.currentWorksheet.problems.length : 0;
        if (currentCount !== totalProblems) {
            // Small delay to avoid multiple rapid regenerations
            clearTimeout(window.regenerateTimeout);
            window.regenerateTimeout = setTimeout(() => {
                generateWorksheet();
            }, 300);
        }
    }
    
    return totalProblems;
}

// Get random emoji for template variety
function getRandomTemplateEmoji(template, index) {
    const templateKey = template === 'flowers' ? 'flowers' :
                        template === 'dinosaurs' ? 'dinosaurs' :
                        template === 'rainbow' ? 'rainbow' :
                        template === 'animals' ? 'animals' : null;
    
    if (!templateKey || !templateEmojis[templateKey]) {
        return null;
    }
    
    const emojis = templateEmojis[templateKey];
    // Use index to ensure consistent emoji per problem (deterministic but varied)
    return emojis[index % emojis.length];
}

// Capitalize first letter and handle special cases
function capitalizeFirst(str) {
    // Handle hyphenated words
    if (str.includes('-')) {
        return str.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate worksheet
function generateWorksheet() {
    const subject = document.getElementById('subject-select').value;
    const learningType = document.getElementById('learning-select').value;
    const level = parseInt(document.getElementById('level-select').value);
    const template = document.getElementById('template-select').value;
    const problemsCount = calculateProblemsCount();
    const pageSize = document.getElementById('page-size-select').value;
    const showCountingAids = document.getElementById('show-counting-aids').checked;
    const showProblemNumbers = document.getElementById('show-problem-numbers').checked;
    
    const config = subjectConfig[subject];
    const generator = config.generators[learningType];
    
    if (!generator) {
        showError('Generator not available for this combination');
        return;
    }
    
    // Generate problems
    const problems = [];
    for (let i = 0; i < problemsCount; i++) {
        const problem = generator(level);
        // Add counting aids if enabled and it's a math problem
        if (showCountingAids && subject === 'maths') {
            const countingAids = generateCountingAids(problem, learningType);
            // Only add counting aids if the number of objects is reasonable
            if (countingAids && shouldShowCountingAids(countingAids)) {
                problem.countingAids = countingAids;
            }
        }
        problems.push(problem);
    }
    
    // Display worksheet
    displayWorksheet(problems, subject, learningType, level, template, showCountingAids, showProblemNumbers, pageSize);
    
    // Show print, preview, and download buttons
    document.getElementById('print-preview-btn').style.display = 'inline-flex';
    document.getElementById('print-btn').style.display = 'inline-flex';
    document.getElementById('download-btn').style.display = 'inline-flex';
}

// Generate addition problem
function generateAdditionProblem(level) {
    const maxValue = level * 10;
    const num1 = Math.floor(Math.random() * maxValue) + 1;
    const num2 = Math.floor(Math.random() * maxValue) + 1;
    const answer = num1 + num2;
    
    return {
        question: `${num1} + ${num2} =`,
        answer: answer,
        type: 'addition'
    };
}

// Generate subtraction problem
function generateSubtractionProblem(level) {
    const maxValue = level * 10;
    const num1 = Math.floor(Math.random() * maxValue) + level;
    const num2 = Math.floor(Math.random() * num1) + 1;
    const answer = num1 - num2;
    
    return {
        question: `${num1} - ${num2} =`,
        answer: answer,
        type: 'subtraction'
    };
}

// Generate multiplication problem
function generateMultiplicationProblem(level) {
    // Level 1-3: 1-5 times tables
    // Level 4-6: 1-10 times tables
    // Level 7-10: 1-12 times tables with larger numbers
    let maxMultiplier;
    if (level <= 3) {
        maxMultiplier = 5;
    } else if (level <= 6) {
        maxMultiplier = 10;
    } else {
        maxMultiplier = 12;
    }
    
    const num1 = Math.floor(Math.random() * maxMultiplier) + 1;
    const num2 = Math.floor(Math.random() * maxMultiplier) + 1;
    const answer = num1 * num2;
    
    return {
        question: `${num1} × ${num2} =`,
        answer: answer,
        type: 'multiplication'
    };
}

// Generate division problem
function generateDivisionProblem(level) {
    // Generate division problems that result in whole numbers
    // Level 1-3: Simple division (divisors 2-5, quotients up to 5)
    // Level 4-6: Medium division (divisors 2-10, quotients up to 10)
    // Level 7-10: Advanced division (divisors 2-12, quotients up to 12)
    let maxDivisor, maxQuotient;
    if (level <= 3) {
        maxDivisor = 5;
        maxQuotient = 5;
    } else if (level <= 6) {
        maxDivisor = 10;
        maxQuotient = 10;
    } else {
        maxDivisor = 12;
        maxQuotient = 12;
    }
    
    // Generate a divisor and quotient, then calculate dividend
    const divisor = Math.floor(Math.random() * (maxDivisor - 1)) + 2; // Divisors from 2 to maxDivisor
    const quotient = Math.floor(Math.random() * maxQuotient) + 1; // Quotients from 1 to maxQuotient
    const dividend = divisor * quotient;
    
    return {
        question: `${dividend} ÷ ${divisor} =`,
        answer: quotient,
        type: 'division'
    };
}

// Generate mixed operations problem (addition and subtraction)
function generateMixedOperationsProblem(level) {
    const maxValue = level * 10;
    const num1 = Math.floor(Math.random() * maxValue) + 1;
    const num2 = Math.floor(Math.random() * maxValue) + 1;
    const num3 = Math.floor(Math.random() * maxValue) + 1;
    
    // Randomly choose between addition-subtraction or subtraction-addition
    const operations = [
        { question: `${num1} + ${num2} - ${num3} =`, answer: num1 + num2 - num3 },
        { question: `${num1} - ${num2} + ${num3} =`, answer: num1 - num2 + num3 }
    ];
    
    const selected = operations[Math.floor(Math.random() * operations.length)];
    
    return {
        question: selected.question,
        answer: selected.answer,
        type: 'mixed-operations'
    };
}

// Generate number bonds problem (finding missing number)
function generateNumberBondsProblem(level) {
    const maxValue = level * 10;
    const target = Math.floor(Math.random() * maxValue) + level;
    const num1 = Math.floor(Math.random() * target) + 1;
    const num2 = target - num1;
    
    // Randomly choose which number is missing
    const format = Math.random() < 0.5;
    
    return {
        question: format ? `${num1} + ? = ${target}` : `? + ${num1} = ${target}`,
        answer: num2,
        type: 'number-bonds'
    };
}

// Generate comparing numbers problem
function generateComparingNumbersProblem(level) {
    const maxValue = level * 10;
    let num1 = Math.floor(Math.random() * maxValue) + 1;
    let num2 = Math.floor(Math.random() * maxValue) + 1;
    
    // Ensure numbers are different (regenerate if equal)
    while (num1 === num2) {
        num2 = Math.floor(Math.random() * maxValue) + 1;
    }
    
    // Determine correct comparison symbol
    let correctSymbol;
    if (num1 < num2) {
        correctSymbol = '<';
    } else {
        correctSymbol = '>';
    }
    
    return {
        question: `${num1} ? ${num2}`,
        answer: correctSymbol,
        type: 'comparing-numbers'
    };
}

// Generate spelling problem
function generateSpellingProblem(level) {
    const levelKey = `level${Math.min(level, 10)}`;
    const words = worksheetData.spelling[levelKey] || worksheetData.spelling.level1;
    const word = words[Math.floor(Math.random() * words.length)];
    
    const taskType = Math.random();

    if (taskType < 0.5) {
        // Unscramble the word
        const chars = word.split('');
        // Fisher-Yates Shuffle
        for (let i = chars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }

        let scrambled = chars.join('');
        // If scramble resulted in original word, swap first two distinct chars
        if (scrambled === word && word.length > 1) {
            // Find two different characters to swap
            for (let i = 0; i < chars.length - 1; i++) {
                if (chars[i] !== chars[i+1]) {
                    [chars[i], chars[i+1]] = [chars[i+1], chars[i]];
                    break;
                }
            }
            scrambled = chars.join('');
        }

        return {
            question: `Unscramble the word: ${scrambled}`,
            answer: word,
            type: 'spelling'
        };
    } else {
        // Missing letters (Mask approx 40% of the word, minimum 1)
        const maskCount = Math.max(1, Math.floor(word.length * 0.4));
        const indices = new Set();

        // Select random unique indices to mask
        while (indices.size < maskCount) {
            indices.add(Math.floor(Math.random() * word.length));
        }

        let maskedWord = '';
        for (let i = 0; i < word.length; i++) {
            if (indices.has(i)) {
                maskedWord += '_ '; // Use underscore with space for visibility
            } else {
                maskedWord += word[i];
            }
        }

        return {
            question: `Fill in the missing letters: ${maskedWord}`,
            answer: word,
            type: 'spelling'
        };
    }
}

// Generate vocabulary problem (Multiple Choice)
function generateVocabularyProblem(level) {
    const levelKey = `level${Math.min(level, 10)}`;
    const vocabList = worksheetData.vocabulary[levelKey] || worksheetData.vocabulary.level1;

    // Select target
    const targetIndex = Math.floor(Math.random() * vocabList.length);
    const targetItem = vocabList[targetIndex];

    // Select 2 unique distractors
    const options = [targetItem.word];
    const maxAttempts = 20;
    let attempts = 0;

    while (options.length < 3 && attempts < maxAttempts) {
        const randomItem = vocabList[Math.floor(Math.random() * vocabList.length)];
        if (!options.includes(randomItem.word)) {
            options.push(randomItem.word);
        }
        attempts++;
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    // Format question with options
    // Using simple HTML for layout
    const optionsText = options.map((opt, i) => {
        const letter = String.fromCharCode(97 + i); // a, b, c
        return `<b>${letter})</b> ${opt}`;
    }).join(' &nbsp;&nbsp; '); // Spacing

    return {
        question: `What word means: "${targetItem.definition}"?<br><span style="font-weight:normal; font-size: 0.9em; display:block; margin-top:0.2rem;">${optionsText}</span>`,
        answer: targetItem.word,
        type: 'vocabulary'
    };
}

// Generate grammar problem
function generateGrammarProblem(level) {
    const levelKey = `level${Math.min(level, 10)}`;
    const grammarList = worksheetData.grammar[levelKey] || worksheetData.grammar.level1;
    const item = grammarList[Math.floor(Math.random() * grammarList.length)];

    return {
        question: item.question,
        answer: item.answer,
        type: 'grammar'
    };
}

// Generate science fact problem
function generateScienceFactProblem(level) {
    const levelKey = `level${Math.min(level, 10)}`;
    const factsList = worksheetData.science.facts[levelKey] || worksheetData.science.facts.level1;
    const item = factsList[Math.floor(Math.random() * factsList.length)];

    return {
        question: item.question,
        answer: item.answer,
        type: 'facts'
    };
}

// Check if counting aids should be displayed based on object count
function shouldShowCountingAids(aids) {
    if (!aids) return false;
    
    // Maximum number of objects to display visually
    const MAX_OBJECTS = 20;
    
    let totalObjects = 0;
    if (aids.type === 'addition') {
        totalObjects = aids.groups[0].count + aids.groups[1].count;
    } else if (aids.type === 'subtraction') {
        totalObjects = aids.total;
    } else if (aids.type === 'multiplication') {
        totalObjects = aids.groups * aids.perGroup;
    } else if (aids.type === 'division') {
        totalObjects = aids.total;
    } else if (aids.type === 'mixed') {
        // For mixed operations, sum all numbers
        totalObjects = aids.numbers ? aids.numbers.reduce((a, b) => a + b, 0) : 0;
    } else if (aids.type === 'number-bonds') {
        totalObjects = aids.target;
    } else if (aids.type === 'comparing') {
        totalObjects = aids.num1 + aids.num2;
    }
    
    // Don't show if total objects exceed the threshold
    return totalObjects <= MAX_OBJECTS;
}

// Generate counting aids for a problem
function generateCountingAids(problem, learningType) {
    const objects = ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝', '🍑', '🍒', '🦋', '⭐', '🌟', '🎈', '🎁', '🎀'];
    const randomObject = objects[Math.floor(Math.random() * objects.length)];
    
    // Extract numbers from the problem question
    const numbers = problem.question.match(/\d+/g) || [];
    
    if (learningType === 'addition') {
        // For 1 + 2 = ?, show 1 object + 2 objects = 3 objects total
        const num1 = parseInt(numbers[0]) || 0;
        const num2 = parseInt(numbers[1]) || 0;
        const total = num1 + num2;
        
        return {
            type: 'addition',
            groups: [
                { count: num1, label: num1 > 0 ? `${num1}` : '' },
                { count: num2, label: num2 > 0 ? `${num2}` : '' }
            ],
            total: total,
            object: randomObject
        };
    } else if (learningType === 'subtraction') {
        // For 5 - 2 = ?, show 5 objects with 2 crossed out
        const num1 = parseInt(numbers[0]) || 0;
        const num2 = parseInt(numbers[1]) || 0;
        
        return {
            type: 'subtraction',
            total: num1,
            subtract: num2,
            object: randomObject
        };
    } else if (learningType === 'multiplication') {
        // For 3 × 4 = ?, show 3 groups of 4 objects
        const num1 = parseInt(numbers[0]) || 0;
        const num2 = parseInt(numbers[1]) || 0;
        
        return {
            type: 'multiplication',
            groups: num1,
            perGroup: num2,
            object: randomObject
        };
    } else if (learningType === 'division') {
        // For 12 ÷ 4 = ?, show 12 objects in groups of 4
        const dividend = parseInt(numbers[0]) || 0;
        const divisor = parseInt(numbers[1]) || 0;
        const quotient = Math.floor(dividend / divisor);
        
        return {
            type: 'division',
            total: dividend,
            perGroup: divisor,
            groups: quotient,
            object: randomObject
        };
    } else if (learningType === 'mixed-operations') {
        // For mixed operations, show the result visually
        const num1 = parseInt(numbers[0]) || 0;
        const num2 = parseInt(numbers[1]) || 0;
        const num3 = parseInt(numbers[2]) || 0;
        
        return {
            type: 'mixed',
            numbers: [num1, num2, num3],
            total: problem.answer,
            object: randomObject
        };
    } else if (learningType === 'number-bonds') {
        // For number bonds, show the target number
        const target = parseInt(problem.question.match(/\d+/g)?.pop()) || 0;
        const shown = parseInt(problem.question.match(/\d+/g)?.[0]) || 0;
        
        return {
            type: 'number-bonds',
            target: target,
            shown: shown,
            missing: problem.answer,
            object: randomObject
        };
    } else if (learningType === 'comparing-numbers') {
        // For comparing, show both numbers
        const num1 = parseInt(numbers[0]) || 0;
        const num2 = parseInt(numbers[1]) || 0;
        
        return {
            type: 'comparing',
            num1: num1,
            num2: num2,
            object: randomObject
        };
    }
    
    return null;
}

// Display worksheet
function displayWorksheet(problems, subject, learningType, level, template, showCountingAids = false, showProblemNumbers = false, pageSize = 'A4') {
    const preview = document.getElementById('worksheet-preview');
    const templateClass = `template-${template}`;
    const pageConfig = pageSizeConfig[pageSize] || pageSizeConfig.A4;
    const problemsPerPage = pageConfig.problemsPerPage;
    
    // Create worksheet HTML
    let worksheetHTML = '';
    
    // Split problems into pages
    for (let pageIndex = 0; pageIndex < problems.length; pageIndex += problemsPerPage) {
        const pageProblems = problems.slice(pageIndex, pageIndex + problemsPerPage);
        const isFirstPage = pageIndex === 0;
        
        worksheetHTML += `
            <div class="worksheet-page">
                <div class="worksheet ${templateClass}">
                    <div class="worksheet-header">
                        <h1 class="worksheet-title">${capitalizeFirst(subject)} Worksheet</h1>
                        <div class="worksheet-meta">
                            <span class="worksheet-type">${capitalizeFirst(learningType)}</span>
                            <span class="worksheet-level">Level ${level}</span>
                        </div>
                    </div>
                    <div class="worksheet-body">
                        <div class="problems-grid">
        `;
        
        pageProblems.forEach((problem, index) => {
            const globalIndex = pageIndex + index;
            let countingAidsHTML = '';
            
            if (showCountingAids && problem.countingAids && shouldShowCountingAids(problem.countingAids)) {
                countingAidsHTML = `<div class="counting-aids">${renderCountingAids(problem.countingAids)}</div>`;
            }
            
            const problemNumberHTML = showProblemNumbers ? `<span class="problem-number">${globalIndex + 1}.</span>` : '';
            
            // Get random emoji for this problem item based on template
            const emoji = getRandomTemplateEmoji(template, globalIndex);
            const emojiDataAttr = emoji ? `data-emoji="${emoji}"` : '';
            
            worksheetHTML += `
                <div class="problem-item" ${emojiDataAttr}>
                    ${problemNumberHTML}
                    <div class="problem-content">
                        ${countingAidsHTML}
                        <div class="problem-question">${problem.question} <span class="answer-space"></span></div>
                    </div>
                </div>
            `;
        });
        
        worksheetHTML += `
                        </div>
                    </div>
                    ${isFirstPage ? `
                    <div class="worksheet-footer">
                        <div class="worksheet-info">
                            <a href="https://freethings.win/tools/worksheet-generator/" target="_blank" rel="noopener noreferrer">FreeThings.win Worksheet Generator</a>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    preview.innerHTML = worksheetHTML;
    preview.classList.add('has-worksheet');
    
    // Store worksheet data for download
    window.currentWorksheet = {
        problems,
        subject,
        learningType,
        level,
        template,
        showCountingAids,
        showProblemNumbers,
        pageSize,
        html: worksheetHTML
    };
}

// Render counting aids HTML (only question part, no result)
// Uses fixed container size with scalable objects
function renderCountingAids(aids) {
    if (!aids) return '';
    
    // Calculate total object count for sizing
    let totalObjects = 0;
    if (aids.type === 'addition') {
        totalObjects = aids.groups[0].count + aids.groups[1].count;
    } else if (aids.type === 'subtraction') {
        totalObjects = aids.total;
    } else if (aids.type === 'multiplication') {
        totalObjects = aids.groups * aids.perGroup;
    } else if (aids.type === 'division') {
        totalObjects = aids.total;
    } else if (aids.type === 'number-bonds') {
        totalObjects = aids.target;
    } else if (aids.type === 'comparing') {
        totalObjects = aids.num1 + aids.num2;
    }
    
    // Calculate font size based on object count (more objects = smaller size)
    // Base size for 2 objects, scales down as count increases
    const baseSize = 0.75;
    const minSize = 0.4;
    const maxSize = 1.0;
    const fontSize = Math.max(minSize, Math.min(maxSize, baseSize * (2 / Math.max(totalObjects, 1))));
    
    let html = `<div class="counting-aids" style="font-size: ${fontSize}rem;">`;
    
    if (aids.type === 'addition') {
        // Show first group, plus sign, second group (no result)
        html += '<div class="counting-group">';
        for (let i = 0; i < aids.groups[0].count; i++) {
            html += `<span class="counting-object">${aids.object}</span>`;
        }
        html += `</div><span class="counting-operator">+</span><div class="counting-group">`;
        for (let i = 0; i < aids.groups[1].count; i++) {
            html += `<span class="counting-object">${aids.object}</span>`;
        }
        html += '</div>';
    } else if (aids.type === 'subtraction') {
        // Show total objects with some crossed out (no result)
        html += '<div class="counting-group">';
        for (let i = 0; i < aids.total; i++) {
            const crossed = i < aids.subtract;
            html += `<span class="counting-object ${crossed ? 'crossed-out' : ''}">${aids.object}</span>`;
        }
        html += '</div>';
    } else if (aids.type === 'multiplication') {
        // Show groups of objects (no result)
        for (let g = 0; g < aids.groups; g++) {
            html += '<div class="counting-group">';
            for (let i = 0; i < aids.perGroup; i++) {
                html += `<span class="counting-object">${aids.object}</span>`;
            }
            html += '</div>';
            if (g < aids.groups - 1) {
                html += '<span class="counting-operator">+</span>';
            }
        }
    } else if (aids.type === 'division') {
        // Show total objects grouped (e.g., 12 objects in groups of 4, no result shown)
        html += '<div class="counting-group counting-group-division">';
        for (let g = 0; g < aids.groups; g++) {
            html += '<div class="counting-subgroup">';
            for (let i = 0; i < aids.perGroup; i++) {
                html += `<span class="counting-object">${aids.object}</span>`;
            }
            html += '</div>';
        }
        html += '</div>';
    } else if (aids.type === 'number-bonds') {
        // Show target number of objects with missing ones
        html += '<div class="counting-group">';
        for (let i = 0; i < aids.target; i++) {
            const isShown = i < aids.shown;
            html += `<span class="counting-object ${isShown ? '' : 'missing'}">${isShown ? aids.object : '?'}</span>`;
        }
        html += '</div>';
    } else if (aids.type === 'comparing') {
        // Show both numbers side by side
        html += '<div class="counting-group">';
        for (let i = 0; i < aids.num1; i++) {
            html += `<span class="counting-object">${aids.object}</span>`;
        }
        html += '</div><span class="counting-operator">?</span><div class="counting-group">';
        for (let i = 0; i < aids.num2; i++) {
            html += `<span class="counting-object">${aids.object}</span>`;
        }
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

// Show error message
function showError(message) {
    const preview = document.getElementById('worksheet-preview');
    preview.innerHTML = `
        <div class="worksheet-placeholder">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
    preview.classList.remove('has-worksheet');
}

// Print preview - opens in new window for review before printing
function printPreview() {
    if (!window.currentWorksheet) {
        showNotification('No worksheet to preview');
        return;
    }
    
    // Get all worksheet pages from the preview container
    const preview = document.getElementById('worksheet-preview');
    const worksheetPages = preview.querySelectorAll('.worksheet-page');
    
    if (!worksheetPages || worksheetPages.length === 0) {
        showNotification('Worksheet not found');
        return;
    }
    
    // Create preview window
    const previewWindow = window.open('', '_blank', 'width=800,height=1000');
    const template = window.currentWorksheet.template;
    const showProblemNumbers = window.currentWorksheet.showProblemNumbers || false;
    const pageSize = window.currentWorksheet.pageSize || 'A4';
    const styles = getPrintStyles(template, showProblemNumbers, pageSize);
    
    // Clone all worksheet pages for preview
    const container = document.createElement('div');
    worksheetPages.forEach(page => {
        const clonedPage = page.cloneNode(true);
        container.appendChild(clonedPage);
    });
    container.classList.add('print-optimized');
    
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Print Preview - ${capitalizeFirst(window.currentWorksheet.subject)} Worksheet</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                ${styles}
                body {
                    padding: 20px;
                    background: #f5f5f5;
                }
                .worksheet {
                    background: white;
                    padding: 2cm;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    margin: 0 auto;
                    max-width: 21cm;
                }
                .print-preview-header {
                    background: #2563eb;
                    color: white;
                    padding: 1rem;
                    margin: -20px -20px 20px -20px;
                    text-align: center;
                    font-weight: 600;
                }
                .print-preview-actions {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 1000;
                }
                .preview-btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .preview-btn-print {
                    background: #10b981;
                    color: white;
                }
                .preview-btn-print:hover {
                    background: #059669;
                }
                .preview-btn-close {
                    background: #64748b;
                    color: white;
                }
                .preview-btn-close:hover {
                    background: #475569;
                }
                @media print {
                    .print-preview-header,
                    .print-preview-actions {
                        display: none !important;
                    }
                    body {
                        padding: 0;
                        background: white;
                    }
                    .worksheet {
                        box-shadow: none;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-preview-header">
                Print Preview - Ready to Print
            </div>
            ${container.outerHTML}
            <div class="print-preview-actions">
                <button class="preview-btn preview-btn-print" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Now
                </button>
                <button class="preview-btn preview-btn-close" onclick="window.close()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </body>
        </html>
    `);
    
    previewWindow.document.close();
    previewWindow.focus();
}

// Print worksheet
function printWorksheet() {
    if (!window.currentWorksheet) {
        showNotification('No worksheet to print');
        return;
    }
    
    // Get all worksheet pages from the preview container
    const preview = document.getElementById('worksheet-preview');
    const worksheetPages = preview.querySelectorAll('.worksheet-page');
    
    if (!worksheetPages || worksheetPages.length === 0) {
        showNotification('Worksheet not found');
        return;
    }
    
    // Create print window
    const printWindow = window.open('', '_blank');
    const template = window.currentWorksheet.template;
    const pageSize = window.currentWorksheet.pageSize || 'A4';
    const styles = getPrintStyles(template, window.currentWorksheet.showProblemNumbers, pageSize);
    
    // Clone all worksheet pages for printing
    const container = document.createElement('div');
    worksheetPages.forEach(page => {
        const clonedPage = page.cloneNode(true);
        container.appendChild(clonedPage);
    });
    
    // Add print-optimized class
    container.classList.add('print-optimized');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Worksheet - ${capitalizeFirst(window.currentWorksheet.subject)}</title>
            <style>
                ${styles}
            </style>
        </head>
        <body>
            ${container.outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 500);
}

// Download worksheet as HTML (print-ready)
function downloadWorksheet() {
    if (!window.currentWorksheet) {
        showNotification('No worksheet to download');
        return;
    }
    
    // Get all worksheet pages from the preview container
    const preview = document.getElementById('worksheet-preview');
    const worksheetPages = preview.querySelectorAll('.worksheet-page');
    
    if (!worksheetPages || worksheetPages.length === 0) {
        showNotification('Worksheet not found');
        return;
    }
    
    const template = window.currentWorksheet.template;
    const pageSize = window.currentWorksheet.pageSize || 'A4';
    const styles = getPrintStyles(template, window.currentWorksheet.showProblemNumbers, pageSize);
    
    // Clone all worksheet pages for download
    const container = document.createElement('div');
    worksheetPages.forEach(page => {
        const clonedPage = page.cloneNode(true);
        container.appendChild(clonedPage);
    });
    container.classList.add('print-optimized');
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Worksheet - ${capitalizeFirst(window.currentWorksheet.subject)}</title>
            <style>
                ${styles}
            </style>
        </head>
        <body>
            ${container.outerHTML}
        </body>
        </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worksheet-${window.currentWorksheet.subject}-${window.currentWorksheet.learningType}-level${window.currentWorksheet.level}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Worksheet downloaded!');
}

// Get print-optimized styles
function getPrintStyles(template, showProblemNumbers = false, pageSize = 'A4') {
    const pageConfig = pageSizeConfig[pageSize] || pageSizeConfig.A4;
    
    const baseStyles = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        @page {
            size: ${pageSize};
            margin: 1.5cm;
        }
        
        body {
            font-family: 'Comic Neue', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: white;
            color: #000;
            line-height: 1.5;
        }
        
        .worksheet {
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
        }
        
        .worksheet-page {
            page-break-after: always;
            page-break-inside: avoid;
        }
        
        .worksheet-page:last-child {
            page-break-after: auto;
        }
        
        .worksheet-header {
            text-align: center;
            margin-bottom: 0.5cm;
            padding-bottom: 0.3cm;
            border-bottom: 2px solid #333;
            page-break-after: avoid;
        }
        
        .worksheet-title {
            font-size: 1.4rem;
            font-weight: 700;
            margin-bottom: 0.2cm;
            color: #000;
        }
        
        .worksheet-meta {
            display: flex;
            justify-content: center;
            gap: 0.5cm;
            flex-wrap: wrap;
        }
        
        .worksheet-type,
        .worksheet-level {
            padding: 0.2cm 0.5cm;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.75rem;
            border: 1.5px solid #333;
        }
        
        .worksheet-body {
            margin-bottom: 0.5cm;
        }
        
        .problems-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.3cm;
            margin-bottom: 0.5cm;
        }
        
        .problem-item {
            padding: 0.3cm;
            border-radius: 4px;
            page-break-inside: avoid;
            min-height: 1.5cm;
        }
        
        .problem-number {
            font-weight: 700;
            font-size: 1rem;
            color: #000;
            display: ${showProblemNumbers ? 'inline' : 'none'};
            margin-right: 0.2cm;
        }
        
        .problem-content {
            display: inline-block;
            width: ${showProblemNumbers ? 'calc(100% - 1.2cm)' : '100%'};
            vertical-align: top;
        }
        
        .problem-question {
            font-size: 1.1rem;
            margin: 0;
            font-weight: 600;
            color: #000;
            display: inline;
            line-height: 1.3;
        }
        
        .answer-space {
            display: inline-block;
            min-width: 1.2cm;
            border-bottom: 2px solid #000;
            margin-left: 0.25cm;
            vertical-align: baseline;
        }
        
        .counting-aids {
            margin-bottom: 0.15cm;
            padding: 0.08cm 0.15cm;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 2px;
            page-break-inside: avoid;
            width: 100%;
            min-height: 0.5cm;
            max-height: none !important;
            overflow: visible !important;
        }
        
        .counting-object {
            font-size: 1em;
        }
        
        .counting-operator {
            font-size: 1em;
        }
        
        .counting-subgroup {
            border: 1px dashed #999;
            padding: 0.05cm;
        }
        
        .counting-group {
            gap: 0.05cm;
        }
        
        .counting-group-division {
            gap: 0.1cm;
        }
        
        .counting-object.crossed-out {
            opacity: 0.5;
            position: relative;
        }
        
        .counting-object.crossed-out::before {
            content: '';
            position: absolute;
            top: 50%;
            left: -10%;
            right: -10%;
            height: 2px;
            background: #ef4444;
            transform: rotate(-45deg);
            z-index: 1;
        }
        
        .counting-object.crossed-out::after {
            content: '';
            position: absolute;
            top: 50%;
            left: -10%;
            right: -10%;
            height: 2px;
            background: #ef4444;
            transform: rotate(45deg);
            z-index: 1;
        }
        
        .worksheet-footer {
            margin-top: 0.5cm;
            text-align: center;
            font-size: 0.7rem;
            color: #666;
            padding-top: 0.3cm;
            border-top: 1px solid #ccc;
            page-break-inside: avoid;
        }
        
        .worksheet-footer a {
            color: #2563eb;
            text-decoration: none;
        }
        
        .worksheet-footer a:hover {
            color: #1d4ed8;
            text-decoration: underline;
        }
        
        /* Print-specific optimizations */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .worksheet {
                page-break-inside: avoid;
            }
            
            .problem-item {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .problems-grid {
                page-break-inside: auto;
            }
            
            /* Ensure proper spacing */
            .worksheet-header {
                page-break-after: avoid;
            }
            
            .worksheet-footer {
                page-break-before: avoid;
            }
        }
    `;
    
    // Template-specific print styles
    const templateStyles = {
        basic: `
            .worksheet-header { border-bottom-color: #333; }
            .worksheet-type, .worksheet-level {
                background: #f5f5f5;
                color: #000;
                border-color: #333;
            }
            .problem-item {
                background: #fafafa;
                border: 1px solid #ddd;
            }
        `,
        colourful: `
            .worksheet-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1cm;
                border-radius: 12px;
                border-bottom: none;
            }
            .worksheet-title { color: white; }
            .worksheet-type, .worksheet-level {
                background: rgba(255, 255, 255, 0.3);
                color: white;
                border-color: white;
            }
            .problem-item {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                border: none;
            }
            .problem-question { color: white; }
            .answer-space { border-bottom-color: white; }
            .problem-number { color: white; }
        `,
        flowers: `
            .worksheet-header { border-bottom-color: #f8b4d9; }
            .worksheet-type, .worksheet-level {
                background: #fce7f3;
                color: #be185d;
                border-color: #f8b4d9;
            }
            .problem-item {
                background: #fdf2f8;
                border: 2px solid #fbcfe8;
            }
            .problem-question { color: #9f1239; }
            .answer-space { border-bottom-color: #f472b6; }
        `,
        dinosaurs: `
            .worksheet-header { border-bottom-color: #7dd3fc; }
            .worksheet-type, .worksheet-level {
                background: #dbeafe;
                color: #1e40af;
                border-color: #7dd3fc;
            }
            .problem-item {
                background: #eff6ff;
                border: 2px solid #bfdbfe;
            }
            .problem-question { color: #1e3a8a; }
            .answer-space { border-bottom-color: #60a5fa; }
        `,
        rainbow: `
            .worksheet-header {
                background: linear-gradient(90deg, #ef4444 0%, #f59e0b 16.66%, #eab308 33.33%, #22c55e 50%, #3b82f6 66.66%, #8b5cf6 83.33%, #ec4899 100%);
                color: white;
                padding: 1cm;
                border-radius: 12px;
                border-bottom: none;
            }
            .worksheet-title { color: white; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2); }
            .worksheet-type, .worksheet-level {
                background: rgba(255, 255, 255, 0.9);
                color: #1e293b;
                border-color: #f59e0b;
            }
            .problem-item {
                background: linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #e0e7ff 100%);
                border: 2px solid #f59e0b;
            }
            .problem-question { color: #1e293b; }
            .problem-number { color: #8b5cf6; }
            .answer-space { border-bottom-color: #3b82f6; }
        `,
        animals: `
            .worksheet-header { border-bottom-color: #86efac; }
            .worksheet-type, .worksheet-level {
                background: #dcfce7;
                color: #166534;
                border-color: #86efac;
            }
            .problem-item {
                background: #f0fdf4;
                border: 2px solid #bbf7d0;
            }
            .problem-question { color: #15803d; }
            .answer-space { border-bottom-color: #4ade80; }
        `
    };
    
    return baseStyles + (templateStyles[template] || templateStyles.basic);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

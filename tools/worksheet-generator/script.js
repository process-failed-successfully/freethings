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
        learningTypes: ['reading', 'spelling', 'vocabulary'],
        generators: {
            reading: generateReadingProblem,
            spelling: generateSpellingProblem,
            vocabulary: generateVocabularyProblem
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
    const subject = document.getElementById('subject-select').value;
    const learningType = document.getElementById('learning-select').value;
    const pageSize = document.getElementById('page-size-select').value;
    const pageCount = parseInt(document.getElementById('page-count').value) || 1;
    const config = pageSizeConfig[pageSize];
    
    let totalProblems;
    if (subject === 'english' && learningType === 'reading') {
        totalProblems = pageCount; // One story per page
    } else {
        totalProblems = config.problemsPerPage * pageCount;
    }
    
    // Update hint text
    const hint = document.getElementById('problems-hint');
    if (hint) {
        if (subject === 'english' && learningType === 'reading') {
            hint.textContent = `Will generate ${totalProblems} stories (1 per page × ${pageCount} page${pageCount > 1 ? 's' : ''})`;
        } else {
            hint.textContent = `Will generate ${totalProblems} problems (${config.problemsPerPage} per page × ${pageCount} page${pageCount > 1 ? 's' : ''})`;
        }
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

// Reading stories library leveled 1-10
const readingStories = {
    1: [
        {
            title: "The Cat",
            text: "The cat is red. The cat is big. I see the cat. The cat sat.",
            questions: ["What color is the cat?", "Is the cat big or small?", "What did the cat do?"]
        },
        {
            title: "The Sun",
            text: "The sun is hot. The sun is up. It is a big sun. I like the sun.",
            questions: ["Is the sun hot or cold?", "Is the sun up or down?", "Is it a big sun?"]
        }
    ],
    2: [
        {
            title: "A Big Box",
            text: "I have a big box. The box is blue. What is in the box? I see a ball. I see a hat. The box is fun.",
            questions: ["What color is the box?", "What two things are in the box?", "Is the box small?"]
        },
        {
            title: "My Dog",
            text: "I have a pet dog. My dog is brown. He has a long tail. We play with a ball. He is a good dog.",
            questions: ["What color is the dog?", "Does he have a long or short tail?", "What do they play with?"]
        }
    ],
    3: [
        {
            title: "The Blue Bird",
            text: "A little blue bird sat on a tree. It sang a happy song. The sun was hot and the sky was clear. The bird flew to a pond to get a drink. It saw a frog. The frog said croak! The bird flew away.",
            questions: ["Where was the bird sitting?", "Why did the bird fly to the pond?", "What did the frog say?"]
        },
        {
            title: "The Rainy Day",
            text: "It was a very rainy day. I put on my yellow coat and my boots. I went outside to jump in the puddles. Splat! The water was cold. I saw a small worm on the grass. Then I went inside to have some hot soup.",
            questions: ["What color was the coat?", "What did the child do outside?", "What did they eat at the end?"]
        }
    ],
    4: [
        {
            title: "Baking a Cake",
            text: "Today is Mom's birthday. Dad and I are baking a chocolate cake. First, we mixed the flour and sugar in a large bowl. Next, we added three eggs and some milk. I stirred the batter until it was smooth. We put the cake in the hot oven. It smelled delicious! When the cake was ready, we put pink frosting on top. Mom was very surprised and happy.",
            questions: ["Why were they baking a cake?", "What did they do after adding eggs and milk?", "What color was the frosting?"]
        },
        {
            title: "The New Bike",
            text: "For my birthday, I got a shiny new bike. It is bright red with a silver bell. I was so excited to ride it. First, I put on my blue helmet for safety. Then, Dad helped me push it to the park. I practiced pedaling fast on the flat path. I rang my bell 'ding-ding' at the people walking by. Learning to ride a bike is hard work, but it is also a lot of fun!",
            questions: ["What color is the new bike?", "What did the child wear for safety?", "Where did they go to practice?"]
        }
    ],
    5: [
        {
            title: "The Lost Key",
            text: "Tim was playing in the park when he found a shiny silver key near the swings. He wondered what it might open. He looked around and saw an old wooden chest under a big oak tree. Tim ran to the chest and tried the key. It turned with a loud click! Inside, there were no gold coins or jewels. Instead, Tim found a stack of old letters and a black and white photograph of his grandfather when he was a boy. Tim realized he had found a family treasure. He carefully locked the chest and took the key home to show his parents.",
            questions: ["Where did Tim find the key?", "What was inside the wooden chest?", "Why did Tim think he found a treasure?"]
        },
        {
            title: "The Busy Ants",
            text: "In the corner of our garden, there is a large pile of sand. If you look closely, you can see hundreds of tiny ants hurrying back and forth. They are very hard workers. Some ants are carrying small crumbs of bread, while others are dragging pieces of leaves that are much bigger than themselves. They are taking all this food down into their underground nest to feed the queen ant and the babies. Ants work together as a team to keep their colony strong and healthy. It is amazing how much such small creatures can accomplish when they help each other.",
            questions: ["What are the ants doing in the garden?", "Where are they taking the food?", "What is the main lesson we can learn from the ants?"]
        }
    ],
    6: [
        {
            title: "Life in the Rainforest",
            text: "The tropical rainforest is a busy and crowded place. High up in the canopy, colorful parrots scream and monkeys swing from branch to branch. The air is warm and very damp because it rains almost every day. On the forest floor, it is dark and quiet. Tiny insects crawl through the fallen leaves, and jaguars hide in the shadows. Rainforests are important because they produce a lot of the world's oxygen and are home to millions of different plants and animals. We must work hard to protect these amazing places from being destroyed.",
            questions: ["Why is the air in the rainforest damp?", "Describe the difference between the canopy and the forest floor.", "Why are rainforests important to the whole world?"]
        }
    ],
    7: [
        {
            title: "The Invention of the Telephone",
            text: "Alexander Graham Bell is best known for inventing the telephone in 1876. He was always interested in how sound worked because both his mother and wife were deaf. Bell wanted to find a way to send voices over a wire using electricity. After many months of hard work with his assistant, Thomas Watson, he finally succeeded. The first words spoken over a telephone were, 'Mr. Watson, come here, I want to see you.' This invention changed the world forever by allowing people to communicate instantly over long distances. Today, we use smartphones that are much more advanced, but it all started with Bell's simple idea.",
            questions: ["What motivated Bell to study sound?", "What were the first words ever spoken on a telephone?", "How did the telephone change society?"]
        }
    ],
    8: [
        {
            title: "The Great Barrier Reef",
            text: "Located off the coast of Queensland, Australia, the Great Barrier Reef is the world's largest coral reef system. It is so big that it can be seen from outer space! The reef is made up of billions of tiny organisms called coral polyps. These polyps build hard shells that form the structure of the reef over thousands of years. It is home to a staggering variety of marine life, including over 1,500 species of fish, whales, dolphins, and six species of sea turtles. However, the reef is currently facing serious threats from climate change. Rising ocean temperatures cause 'coral bleaching,' which can kill the coral. Conservationists are working tirelessly to save this natural wonder for future generations.",
            questions: ["How is the physical structure of the reef formed?", "List three types of animals that live in the Great Barrier Reef.", "Explain the process and impact of coral bleaching."]
        }
    ],
    9: [
        {
            title: "The Mystery of the Mary Celeste",
            text: "In December 1872, a British ship named the Dei Gratia spotted another vessel drifting aimlessly in the Atlantic Ocean. It was the Mary Celeste. When the sailors from the Dei Gratia boarded the ship, they found a strange scene. The Mary Celeste was in good condition and had plenty of food and water, but not a single person was on board. The captain's logbook was still there, but the last entry had been made ten days earlier. The lifeboat was missing, but there were no signs of a struggle or a storm. To this day, no one knows what happened to the crew. Some people think they were attacked by a giant squid, while others believe they feared the ship was about to explode and fled in panic. The fate of the Mary Celeste remains one of history's greatest maritime mysteries.",
            questions: ["What was unusual about the condition of the Mary Celeste when it was found?", "Why is the missing lifeboat a significant clue?", "Compare two different theories about what happened to the crew."]
        }
    ],
    10: [
        {
            title: "The Future of Artificial Intelligence",
            text: "Artificial Intelligence (AI) is rapidly transforming almost every aspect of modern life, from healthcare and transportation to entertainment and education. AI refers to computer systems that can perform tasks that usually require human intelligence, such as recognizing speech, making decisions, and translating languages. While AI offers incredible benefits, such as diagnosing diseases more accurately than humans or reducing traffic accidents through self-driving cars, it also presents significant ethical challenges. One major concern is the potential for AI to replace human jobs, leading to economic disruption. Another issue is the risk of bias in AI algorithms, which can lead to unfair treatment of certain groups of people. As we continue to develop more powerful AI systems, it is crucial that we establish clear regulations and ethical guidelines to ensure that this technology is used for the benefit of all humanity. The goal should be to create AI that complements human abilities rather than replacing them entirely.",
            questions: ["Define Artificial Intelligence based on the text.", "Discuss one benefit and one challenge associated with the development of AI.", "What does the author suggest is necessary to ensure AI is used responsibly?"]
        }
    ]
};

// Generate reading problem
function generateReadingProblem(level) {
    const stories = readingStories[level] || readingStories[1];
    const story = stories[Math.floor(Math.random() * stories.length)];

    return {
        title: story.title,
        text: story.text,
        questions: story.questions,
        type: 'reading'
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

// Spelling words library leveled 1-10
const spellingWords = {
    1: ['cat', 'dog', 'sun', 'big', 'red', 'ten', 'hop', 'run'],
    2: ['blue', 'fish', 'frog', 'jump', 'tree', 'bird', 'ship', 'star'],
    3: ['happy', 'cloud', 'green', 'bright', 'sweet', 'small', 'bread', 'grass'],
    4: ['spring', 'yellow', 'garden', 'school', 'friend', 'sister', 'winter', 'flower'],
    5: ['because', 'thought', 'through', 'morning', 'beautiful', 'together', 'important', 'adventure'],
    6: ['different', 'mountain', 'treasure', 'scientist', 'mysterious', 'government', 'language', 'education'],
    7: ['telephone', 'distance', 'successful', 'experience', 'knowledge', 'celebrate', 'description', 'imagination'],
    8: ['atmosphere', 'environment', 'technology', 'artificial', 'intelligence', 'biological', 'significant', 'community'],
    9: ['sophisticated', 'perspective', 'viewpoint', 'academic', 'structure', 'nuanced', 'interpretation', 'analysis'],
    10: ['disruption', 'regulations', 'complement', 'transforming', 'diagnosing', 'ethical', 'challenges', 'potential']
};

// Vocabulary library leveled 1-10
const vocabularyData = {
    1: [
        { word: "Big", options: ["Large", "Small", "Fast"], answer: "Large" },
        { word: "Fast", options: ["Slow", "Quick", "Big"], answer: "Quick" }
    ],
    2: [
        { word: "Happy", options: ["Sad", "Glad", "Angry"], answer: "Glad" },
        { word: "Small", options: ["Tiny", "Huge", "Bright"], answer: "Tiny" }
    ],
    3: [
        { word: "Bright", options: ["Dark", "Shining", "Heavy"], answer: "Shining" },
        { word: "Funny", options: ["Silly", "Serious", "Quiet"], answer: "Silly" }
    ],
    4: [
        { word: "Quiet", options: ["Loud", "Silent", "Noisy"], answer: "Silent" },
        { word: "Simple", options: ["Easy", "Hard", "Fast"], answer: "Easy" }
    ],
    5: [
        { word: "Huge", options: ["Tiny", "Gigantic", "Old"], answer: "Gigantic" },
        { word: "Swift", options: ["Slow", "Rapid", "Heavy"], answer: "Rapid" }
    ],
    6: [
        { word: "Wealthy", options: ["Poor", "Rich", "Kind"], answer: "Rich" },
        { word: "Ancient", options: ["New", "Old", "Young"], answer: "Old" }
    ],
    7: [
        { word: "Cautious", options: ["Careful", "Brave", "Fast"], answer: "Careful" },
        { word: "Observe", options: ["Watch", "Ignore", "Speak"], answer: "Watch" }
    ],
    8: [
        { word: "Abolish", options: ["Start", "End", "Fix"], answer: "End" },
        { word: "Sufficient", options: ["Enough", "Little", "Many"], answer: "Enough" }
    ],
    9: [
        { word: "Elaborate", options: ["Simple", "Detailed", "Plain"], answer: "Detailed" },
        { word: "Hostile", options: ["Friendly", "Unfriendly", "Kind"], answer: "Unfriendly" }
    ],
    10: [
        { word: "Mitigate", options: ["Increase", "Reduce", "Change"], answer: "Reduce" },
        { word: "Ambiguous", options: ["Clear", "Unclear", "Certain"], answer: "Unclear" }
    ]
};

// Generate spelling problem
function generateSpellingProblem(level) {
    const words = spellingWords[level] || spellingWords[1];
    const word = words[Math.floor(Math.random() * words.length)];
    
    // Choose between unscramble and missing letters
    if (Math.random() < 0.5) {
        // Unscramble
        const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
        return {
            question: `Unscramble: <b>${scrambled}</b>`,
            answer: word,
            type: 'spelling'
        };
    } else {
        // Missing letters (e.g., c_ t)
        let masked = "";
        for (let i = 0; i < word.length; i++) {
            if (Math.random() < 0.3) {
                masked += "_ ";
            } else {
                masked += word[i];
            }
        }
        // Ensure at least one letter is masked
        if (!masked.includes("_ ")) {
            const idx = Math.floor(Math.random() * word.length);
            masked = word.substring(0, idx) + "_ " + word.substring(idx + 1);
        }
        return {
            question: `Fill in the missing letters: <b>${masked}</b>`,
            answer: word,
            type: 'spelling'
        };
    }
}

// Generate vocabulary problem
function generateVocabularyProblem(level) {
    const items = vocabularyData[level] || vocabularyData[1];
    const item = items[Math.floor(Math.random() * items.length)];

    const optionsHtml = item.options.map((opt, i) =>
        `<div class="vocab-option">(${(i + 1)}) ${opt}</div>`
    ).join('');

    return {
        question: `What is a synonym for <b>${item.word}</b>?<br>${optionsHtml}`,
        answer: item.answer,
        type: 'vocabulary'
    };
}

// Generate grammar problem (placeholder)
function generateGrammarProblem(level) {
    return {
        question: 'Grammar question',
        answer: 'Answer',
        type: 'grammar'
    };
}

// Generate science fact problem (placeholder)
function generateScienceFactProblem(level) {
    return {
        question: 'Science fact question',
        answer: 'Answer',
        type: 'facts'
    };
}

// Generate experiment problem (placeholder)
function generateExperimentProblem(level) {
    return {
        question: 'Experiment question',
        answer: 'Answer',
        type: 'experiments'
    };
}

// Generate observation problem (placeholder)
function generateObservationProblem(level) {
    return {
        question: 'Observation question',
        answer: 'Answer',
        type: 'observations'
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

    // Use 1 problem per page for reading, otherwise use standard config
    const problemsPerPage = learningType === 'reading' ? 1 : pageConfig.problemsPerPage;
    
    // Create worksheet HTML
    let worksheetHTML = '';
    
    // Split problems into pages
    for (let pageIndex = 0; pageIndex < problems.length; pageIndex += problemsPerPage) {
        const pageProblems = problems.slice(pageIndex, pageIndex + problemsPerPage);
        const isFirstPage = pageIndex === 0;
        
        worksheetHTML += `
            <div class="worksheet-page ${learningType === 'reading' ? 'reading-page' : ''}">
                <div class="worksheet ${templateClass}">
                    <div class="worksheet-header">
                        <h1 class="worksheet-title">${capitalizeFirst(subject)} Worksheet</h1>
                        <div class="worksheet-meta">
                            <span class="worksheet-type">${capitalizeFirst(learningType)}</span>
                            <span class="worksheet-level">Level ${level}</span>
                        </div>
                    </div>
                    <div class="worksheet-body">
        `;
        
        if (learningType === 'reading') {
            // Reading Book Layout: One story per page, full width
            pageProblems.forEach((problem, index) => {
                const globalIndex = pageIndex + index;
                const emoji = getRandomTemplateEmoji(template, globalIndex);

                // Create container safely using DOM API to prevent XSS
                const container = document.createElement('div');
                container.className = 'reading-container';
                if (emoji) container.setAttribute('data-emoji', emoji);

                const title = document.createElement('h2');
                title.className = 'story-title';
                title.textContent = problem.title;

                const text = document.createElement('div');
                text.className = 'story-text';
                text.textContent = problem.text;

                const questions = document.createElement('div');
                questions.className = 'story-questions';
                questions.innerHTML = '<h3>Comprehension Questions:</h3><ol></ol>';

                const ol = questions.querySelector('ol');
                problem.questions.forEach(q => {
                    const li = document.createElement('li');
                    li.textContent = q;
                    const line = document.createElement('div');
                    line.className = 'answer-line';
                    li.appendChild(line);
                    ol.appendChild(li);
                });

                container.appendChild(title);
                container.appendChild(text);
                container.appendChild(questions);

                worksheetHTML += container.outerHTML;
            });
        } else {
            // Standard Grid Layout
            worksheetHTML += `<div class="problems-grid">`;
            pageProblems.forEach((problem, index) => {
                const globalIndex = pageIndex + index;
                let countingAidsHTML = '';

                if (showCountingAids && problem.countingAids && shouldShowCountingAids(problem.countingAids)) {
                    countingAidsHTML = `<div class="counting-aids">${renderCountingAids(problem.countingAids)}</div>`;
                }

                const problemNumberHTML = showProblemNumbers ? `<span class="problem-number">${globalIndex + 1}.</span>` : '';
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
            worksheetHTML += `</div>`;
        }
        
        worksheetHTML += `
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
        
        .reading-container {
            padding: 0.5cm;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.5);
        }

        .story-title {
            font-size: 1.4rem;
            margin-bottom: 0.4cm;
            text-align: center;
            font-family: 'Comic Neue', cursive;
        }

        .story-text {
            font-size: 1.1rem;
            margin-bottom: 0.8cm;
            line-height: 1.6;
            text-align: justify;
            white-space: pre-wrap;
        }

        .story-questions h3 {
            font-size: 1rem;
            margin-bottom: 0.3cm;
        }

        .story-questions ol {
            padding-left: 0.6cm;
        }

        .story-questions li {
            margin-bottom: 0.5cm;
            font-weight: 600;
        }

        .answer-line {
            border-bottom: 1px solid #333;
            height: 0.6cm;
            margin-top: 0.1cm;
            width: 100%;
        }

        .vocab-option {
            margin-top: 0.15cm;
            font-size: 0.95rem;
            padding-left: 0.3cm;
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


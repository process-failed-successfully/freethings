const PHONICS_DICTIONARY = {
    "aria": { parts: ["ar", "i", "a"], tip: "A girl's name. Three parts: ar-i-a." },
    "amelia": { parts: ["a", "me", "li", "a"], tip: "A girl's name. Four parts: a-me-li-a." },
    "cartwheels": { parts: ["cart", "wheels"], tip: "A compound word: 'cart' and 'wheels'." },
    "squeals": { parts: ["squ", "eals"], tip: "'squ' blend makes /skw/. 'ea' makes the long /ee/ sound." },
    "stool": { parts: ["st", "ool"], tip: "'st' is a blend. 'oo' makes the long /oo/ sound." },
    "bench": { parts: ["b", "ench"], tip: "'b' makes the /b/ sound. 'ch' digraph says /ch/." },
    "pasta": { parts: ["pas", "ta"], tip: "Two parts. 'pas' and 'ta'." },
    "chins": { parts: ["ch", "ins"], tip: "'ch' is a digraph that says /ch/. 'ins' makes the /inz/ sound." },
    "cozy": { parts: ["co", "zy"], tip: "Two parts. 'y' makes the long /ee/ sound." },
    "tonight": { parts: ["to", "night"], tip: "A compound word. 'night' has a silent 'gh' and a long 'i' sound." },
    "dragon": { parts: ["dra", "gon"], tip: "Two parts. 'dr' is a blend." },
    "queen": { parts: ["qu", "een"], tip: "'qu' says /kw/. 'ee' makes the long /ee/ sound." },
    "golden": { parts: ["gold", "en"], tip: "Two parts. 'gold' has a long 'o' sound." },
    "asleep": { parts: ["a", "sleep"], tip: "Two parts. 'ee' makes the long /ee/ sound." },

    "mystery": { parts: ["mys", "ter", "y"], tip: "The 'y' in the middle makes a short /i/ sound!" },

    "tentacles": { parts: ["ten", "ta", "cles"], tip: "Three parts. 'cles' makes the /kuhlz/ sound." },

    "treasure": { parts: ["treas", "ure"], tip: "'sure' here makes a soft /zh/ sound, like in measure." },

    "sneaky": { parts: ["sneak", "y"], tip: "'ea' makes the long /ee/ sound. 'y' makes another /ee/ sound." },

    "catastrophe": { parts: ["ca", "tas", "tro", "phe"], tip: "A long word! 'phe' makes the /fee/ sound like an 'f'." },

    "someone": { parts: ["some", "one"], tip: "A compound word. 'some' and 'one' are both tricky sight words!" },

    "outside": { parts: ["out", "side"], tip: "A compound word. 'out' and 'side'. The magic 'e' makes 'i' say its name." },

    "marshmallows": { parts: ["marsh", "mal", "lows"], tip: "Three parts! 'lows' makes the long /o/ sound." },

    "sneezes": { parts: ["sn", "eeze", "s"], tip: "'sn' makes the /sn/ blend. 'ee' makes the long /ee/ sound." },

    "achoo": { parts: ["a", "choo"], tip: "'ch' makes the /ch/ sound. 'oo' makes the long /oo/ sound." },

    "snotty": { parts: ["snot", "ty"], tip: "'sn' makes the /sn/ blend. 'y' makes the long /ee/ sound." },

    "yucky": { parts: ["yuck", "y"], tip: "'ck' makes the /k/ sound, and 'y' sounds like /ee/." },

    "slippery": { parts: ["slip", "per", "y"], tip: "Three parts. The 'y' makes the long /ee/ sound." },

    "poo": { parts: ["p", "oo"], tip: "'oo' makes the long /oo/ sound." },

    "burp": { parts: ["b", "urp"], tip: "'ur' makes the bossy 'r' /er/ sound." },

    "smelly": { parts: ["smell", "y"], tip: "'y' at the end makes the long /ee/ sound." },
    "pig": { parts: ["p", "ig"], tip: "'p' makes the /p/ sound. 'ig' makes the /ig/ sound." },
    "big": { parts: ["b", "ig"], tip: "'b' makes the /b/ sound. 'ig' makes the /ig/ sound." },
    "wig": { parts: ["w", "ig"], tip: "'w' makes the /w/ sound. 'ig' makes the /ig/ sound." },
    "fat": { parts: ["f", "at"], tip: "'f' makes the /f/ sound. 'at' makes the /at/ sound." },
    "rat": { parts: ["r", "at"], tip: "'r' makes the /r/ sound. 'at' makes the /at/ sound." },
    "hat": { parts: ["h", "at"], tip: "'h' makes the /h/ sound. 'at' makes the /at/ sound." },
    "mat": { parts: ["m", "at"], tip: "'m' makes the /m/ sound. 'at' makes the /at/ sound." },
    "bunny": { parts: ["bun", "ny"], tip: "Two parts: 'bun' and 'ny'. The 'y' makes the long /ee/ sound." },
    "hops": { parts: ["h", "ops"], tip: "'h' makes the /h/ sound. 'ops' makes the /ops/ sound." },
    "funny": { parts: ["fun", "ny"], tip: "Two parts: 'fun' and 'ny'. The 'y' makes the long /ee/ sound." },
    "orange": { parts: ["or", "ange"], tip: "'or' makes the /or/ sound. 'ange' sounds like /anj/." },
    "carrot": { parts: ["car", "rot"], tip: "Two parts: 'car' and 'rot'. 'c' makes the hard /k/ sound." },
    "full": { parts: ["f", "ull"], tip: "'f' makes the /f/ sound. 'ull' makes the /ool/ sound." },
    "very": { parts: ["ver", "y"], tip: "'v' makes the /v/ sound. 'y' makes the long /ee/ sound." },
    "white": { parts: ["wh", "ite"], tip: "'wh' makes the /w/ sound. 'ite' has a magic 'e' that makes 'i' say its name." },
    "grass": { parts: ["gr", "ass"], tip: "'gr' is a blend. 'ass' makes the /as/ sound." },

    "monster": { parts: ["mon", "ster"], tip: "Two parts. 'mon' and 'ster'. The 'er' says /er/." },

    "farted": { parts: ["fart", "ed"], tip: "'fart' has a bossy 'r' sound. 'ed' makes the /id/ sound." },

    "see": { parts: ["s", "ee"], tip: "'s' makes the /s/ sound. 'ee' makes the long /ee/ sound like in tree." },
    "the": { parts: ["th", "e"], tip: "'the' is a sight word. 'th' makes the buzzy /th/ sound." },
    "cat": { parts: ["c", "at"], tip: "'c' makes the hard /k/ sound. 'at' makes the short /at/ sound." },
    "has": { parts: ["h", "as"], tip: "'h' makes a breathing /h/ sound. 'as' sounds like /az/ here." },
    "a": { parts: ["a"], tip: "'a' is spoken as a soft 'uh' /ə/ sound here." },
    "mat": { parts: ["m", "at"], tip: "'m' makes the humming /m/ sound. 'at' makes the short /at/ sound." },
    "sits": { parts: ["s", "its"], tip: "'s' makes the /s/ sound. 'its' makes the /its/ sound." },
    "on": { parts: ["o", "n"], tip: "'o' makes the short /o/ sound. 'n' makes the nasal /n/ sound." },
    "is": { parts: ["i", "s"], tip: "'is' is a sight word. It sounds like /iz/." },
    "happy": { parts: ["hap", "py"], tip: "Two parts: 'hap' and 'py'. The 'y' at the end makes a long /ee/ sound." },
    "this": { parts: ["th", "is"], tip: "'th' makes the buzzy /th/ sound. 'is' makes the /iz/ sound." },
    "sam": { parts: ["s", "am"], tip: "'s' makes the /s/ sound. 'am' makes the /am/ sound." },
    "dog": { parts: ["d", "og"], tip: "'d' makes the popping /d/ sound. 'og' makes the /og/ sound." },
    "likes": { parts: ["l", "ikes"], tip: "'l' makes the /l/ sound. The silent 'e' makes the 'i' say its name /ai/." },
    "to": { parts: ["t", "o"], tip: "'to' is a sight word. It sounds like 'too' /tu:/." },
    "run": { parts: ["r", "un"], tip: "'r' makes the growly /r/ sound. 'un' makes the short /un/ sound." },
    "red": { parts: ["r", "ed"], tip: "'r' makes the growly /r/ sound. 'ed' makes the /ed/ sound." },
    "ball": { parts: ["b", "all"], tip: "'b' makes the /b/ sound. 'all' makes the /awl/ sound." },
    "plays": { parts: ["pl", "ays"], tip: "'pl' is a blend. 'ays' makes the long /ay/ sound like in day." },
    "in": { parts: ["i", "n"], tip: "'i' makes the short /i/ sound. 'n' makes the /n/ sound." },
    "mud": { parts: ["m", "ud"], tip: "'m' makes the humming /m/ sound. 'ud' makes the short /ud/ sound." },
    "bird": { parts: ["b", "ird"], tip: "'b' makes the /b/ sound. 'ird' has a bossy 'r' that makes the /erd/ sound." },
    "lives": { parts: ["l", "ives"], tip: "'l' makes the /l/ sound. 'ives' sounds like /ivz/." },
    "tree": { parts: ["tr", "ee"], tip: "'tr' is a blend. 'ee' makes the long /ee/ sound." },
    "she": { parts: ["sh", "e"], tip: "'sh' is a quiet digraph that says /sh/. 'e' says its name /ee/." },
    "wants": { parts: ["w", "ants"], tip: "'w' makes the /w/ sound. 'ants' sounds like /onts/ here." },
    "build": { parts: ["b", "uild"], tip: "'build' is a sight word. The 'ui' sounds like a short /i/." },
    "nest": { parts: ["n", "est"], tip: "'n' makes the /n/ sound. 'est' makes the /est/ sound." },
    "finds": { parts: ["f", "inds"], tip: "'f' makes the breathing /f/ sound. 'inds' makes the /aindz/ sound." },
    "green": { parts: ["gr", "een"], tip: "'gr' is a blend. 'ee' makes the long /ee/ sound." },
    "moss": { parts: ["m", "oss"], tip: "'m' makes the humming /m/ sound. 'oss' makes the /oss/ sound." },
    "and": { parts: ["a", "nd"], tip: "'a' makes the short /a/ sound. 'nd' is a final blend." },
    "straw": { parts: ["str", "aw"], tip: "'str' is a three-letter blend. 'aw' makes the yawning /aw/ sound." },
    "three": { parts: ["thr", "ee"], tip: "'thr' is a blend. 'ee' makes the long /ee/ sound." },
    "blue": { parts: ["bl", "ue"], tip: "'bl' is a blend. 'ue' makes the /oo/ sound." },
    "eggs": { parts: ["egg", "s"], tip: "'egg' makes the /eg/ sound. The 's' makes the /z/ sound at the end." },
    "are": { parts: ["a", "re"], tip: "'are' is a sight word. It sounds like the letter 'R'." },
    "leo": { parts: ["le", "o"], tip: "Two parts: 'le' (lee) and 'o' (oh). A boy's name." },
    "mia": { parts: ["mi", "a"], tip: "Two parts: 'mi' (mee) and 'a' (uh). A girl's name." },
    "pack": { parts: ["p", "ack"], tip: "'p' makes a popping /p/ sound. 'ck' is a digraph that makes the /k/ sound." },
    "big": { parts: ["b", "ig"], tip: "'b' makes the /b/ sound. 'ig' makes the /ig/ sound." },
    "bag": { parts: ["b", "ag"], tip: "'b' makes the /b/ sound. 'ag' makes the /ag/ sound." },
    "for": { parts: ["f", "or"], tip: "'f' makes the /f/ sound. 'or' is r-controlled and sounds like /or/." },
    "beach": { parts: ["b", "each"], tip: "'b' makes the /b/ sound. 'ea' makes the long /ee/ sound. 'ch' says /ch/." },
    "they": { parts: ["th", "ey"], tip: "'th' makes the buzzy /th/ sound. 'ey' makes the long /ay/ sound." },
    "tall": { parts: ["t", "all"], tip: "'t' makes the /t/ sound. 'all' makes the /awl/ sound." },
    "sandcastle": { parts: ["sand", "cas", "tle"], tip: "Three parts: 'sand' - 'cas' - 'tle'. The 't' is silent." },
    "with": { parts: ["w", "ith"], tip: "'w' makes the /w/ sound. 'th' makes the quiet /th/ sound." },
    "flag": { parts: ["fl", "ag"], tip: "'fl' is a blend. 'ag' makes the /ag/ sound." },
    "cold": { parts: ["c", "old"], tip: "'c' makes the hard /k/ sound. 'old' sounds like /oh-ld/." },
    "wave": { parts: ["w", "ave"], tip: "'w' makes the /w/ sound. The silent 'e' makes 'a' say its name /ay/." },
    "splashes": { parts: ["spl", "ash", "es"], tip: "Three parts: 'spl' - 'ash' - 'es'. 'spl' is a blend, 'sh' says /sh/." },
    "their": { parts: ["th", "eir"], tip: "'their' is a sight word. It sounds like 'there' /thair/." },
    "feet": { parts: ["f", "eet"], tip: "'f' makes the /f/ sound. 'ee' makes the long /ee/ sound." },
    "eat": { parts: ["eat"], tip: "'ea' is a vowel digraph that makes the long /ee/ sound." },
    "sweet": { parts: ["sw", "eet"], tip: "'sw' is a blend. 'ee' makes the long /ee/ sound." },
    "watermelon": { parts: ["wa", "ter", "mel", "on"], tip: "Four parts: 'wa' - 'ter' - 'mel' - 'on'. A delicious fruit!" },
    "under": { parts: ["un", "der"], tip: "Two parts: 'un' and 'der'. The 'er' is r-controlled." },
    "umbrella": { parts: ["um", "brel", "la"], tip: "Three parts: 'um' - 'brel' - 'la'. Keeps you dry in the rain!" },
    "walk": { parts: ["w", "alk"], tip: "'w' makes the /w/ sound. 'alk' sounds like /awk/ (silent 'l')." },
    "grass": { parts: ["gr", "ass"], tip: "'gr' is a blend. 'ass' makes the /as/ sound." },
    "shoes": { parts: ["sh", "oes"], tip: "'sh' is a digraph that says /sh/. 'oes' makes the long /oo/ sound." },
    "splat": { parts: ["spl", "at"], tip: "'spl' is a three-letter blend. 'at' makes the short /at/ sound." },
    "stepped": { parts: ["stepp", "ed"], tip: "'stepp' has a short vowel, and 'ed' sounds like /t/ here (stept)." },
    "poo": { parts: ["p", "oo"], tip: "'p' makes the popping /p/ sound. 'oo' makes the long /oo/ sound." },
    "shoe": { parts: ["sh", "oe"], tip: "'sh' digraph says /sh/. 'oe' makes the long /oo/ sound." },
    "yucky": { parts: ["yuck", "y"], tip: "Two parts: 'yuck' and 'y'. The 'ck' digraph makes the /k/ sound, and 'y' sounds like /ee/." },
    "wash": { parts: ["w", "ash"], tip: "'w' makes the /w/ sound. 'ash' sounds like /osh/ here." }
};


const PRELOADED_BOOKS = [


    {
        id: "cat-mat",
        title: "The Cat on the Mat",
        level: "A",
        wordsCount: 17,
        thumbnail: "images/cat_mat_1.png",
        pages: [
            { text: `See the cat.`, image: "images/cat_mat_1.png" },
            { text: `The cat has a mat.`, image: "images/cat_mat_2.png" },
            { text: `The cat sits on the mat.`, image: "images/cat_mat_3.png" },
            { text: `The cat is happy.`, image: "images/cat_mat_4.png" }
        ]
    },
    {
        id: "sam-dog",
        title: "Sam the Dog",
        level: "B",
        wordsCount: 18,
        thumbnail: "images/sam_dog_1.png",
        pages: [
            { text: `This is Sam.`, image: "images/sam_dog_1.png" },
            { text: `Sam likes to run.`, image: "images/sam_dog_2.png" },
            { text: `Sam likes the red ball.`, image: "images/sam_dog_3.png" },
            { text: `Sam plays in the mud.`, image: "images/sam_dog_4.png" }
        ]
    },
    {
        id: "red-bird",
        title: "The Red Bird",
        level: "C",
        wordsCount: 22,
        thumbnail: "images/red_bird_1.png",
        pages: [
            { text: `A red bird lives in a tree.`, image: "images/red_bird_1.png" },
            { text: `She wants to build a nest.`, image: "images/red_bird_2.png" },
            { text: `She finds green moss and straw.`, image: "images/red_bird_3.png" },
            { text: `Three blue eggs are in the nest.`, image: "images/red_bird_4.png" }
        ]
    },
    {
        id: "beach-day",
        title: "A Day at the Beach",
        level: "D",
        wordsCount: 33,
        thumbnail: "images/beach_day_1.png",
        pages: [
            { text: `Leo and Mia pack a big bag for the beach.`, image: "images/beach_day_1.png" },
            { text: `They build a tall sandcastle with a blue flag.`, image: "images/beach_day_2.png" },
            { text: `A cold wave splashes their feet.`, image: "images/beach_day_3.png" },
            { text: `They eat sweet watermelon under the umbrella.`, image: "images/beach_day_4.png" }
        ]
    },
    {
        id: "yucky-shoe",
        title: "The Yucky Shoe",
        level: "B",
        wordsCount: 22,
        thumbnail: "images/yucky_shoe_1.png",
        pages: [
            { 
                text: "I walk in the grass.", 
                image: "images/yucky_shoe_1.png" 
            },
            { 
                text: "I have new red shoes.", 
                image: "images/yucky_shoe_2.png" 
            },
            { 
                text: "Splat! I stepped in poo.", 
                image: "images/yucky_shoe_3.png" 
            },
            { 
                text: "Look at my shoe. It is very yucky!", 
                image: "images/yucky_shoe_4.png" 
            },
            { 
                text: "Now my shoe gets a wash.", 
                image: "images/yucky_shoe_5.png" 
            }
        ]
    },
    {
        id: "tooting-frog",
        title: "The Tooting Frog",
        level: "A",
        wordsCount: 16,
        thumbnail: "images/tooting_frog_1.png",
        pages: [
            { text: `See the frog.`, image: "images/tooting_frog_1.png" },
            { text: `The frog jumps.`, image: "images/tooting_frog_2.png" },
            { text: `Toot! The frog farted.`, image: "images/tooting_frog_3.png" },
            { text: `The frog is happy.`, image: "images/tooting_frog_4.png" }
        ]
    },
    {
        id: "mud-monster",
        title: "The Mud Monster",
        level: "B",
        wordsCount: 31,
        thumbnail: "images/mud_monster_1.png",
        pages: [
            { text: `I play in the mud.`, image: "images/mud_monster_1.png" },
            { text: `The mud is on my hands.`, image: "images/mud_monster_2.png" },
            { text: `The mud is on my face.`, image: "images/mud_monster_3.png" },
            { text: `I look like a yucky monster.`, image: "images/mud_monster_4.png" },
            { text: `Time for a bath!`, image: "images/mud_monster_5.png" }
        ]
    },
    {
        id: "green-slime",
        title: "Green Slime",
        level: "C",
        wordsCount: 26,
        thumbnail: "images/green_slime_1.png",
        pages: [
            { text: `We look in the garden.`, image: "images/green_slime_1.png" },
            { text: `What is that green stuff?`, image: "images/green_slime_2.png" },
            { text: `It is yucky green slime.`, image: "images/green_slime_3.png" },
            { text: `The slime feels cold.`, image: "images/green_slime_4.png" },
            { text: `We wash our hands.`, image: "images/green_slime_5.png" }
        ]
    },
    {
        id: "smelly-cheese",
        title: "The Smelly Cheese",
        level: "D",
        wordsCount: 42,
        thumbnail: "images/smelly_cheese_1.png",
        pages: [
            { text: `A little mouse found a big piece of cheese.`, image: "images/smelly_cheese_1.png" },
            { text: `The cheese had holes and it was very yellow.`, image: "images/smelly_cheese_2.png" },
            { text: `Oh no, the cheese smelled very bad.`, image: "images/smelly_cheese_3.png" },
            { text: `The smell woke up the sleeping cat.`, image: "images/smelly_cheese_4.png" },
            { text: `The mouse ran away fast.`, image: "images/smelly_cheese_5.png" }
        ]
    },
    {
        id: "hippo-burp",
        title: "Oops! A Burp",
        level: "A",
        wordsCount: 16,
        thumbnail: "images/hippo_burp_1.png",
        pages: [
            { text: `See the hippo.`, image: "images/hippo_burp_1.png" },
            { text: `The hippo eats grass.`, image: "images/hippo_burp_2.png" },
            { text: `The hippo eats a lot.`, image: "images/hippo_burp_3.png" },
            { text: `Oops! A loud burp.`, image: "images/hippo_burp_4.png" }
        ]
    },
    {
        id: "slippery-poo",
        title: "Slippery Poo",
        level: "B",
        wordsCount: 28,
        thumbnail: "images/slippery_poo_1.png",
        pages: [
            { text: `My dog runs in the yard.`, image: "images/slippery_poo_1.png" },
            { text: `He does not see the poo.`, image: "images/slippery_poo_2.png" },
            { text: `Splat! He steps on it.`, image: "images/slippery_poo_3.png" },
            { text: `The dog slips on the poo.`, image: "images/slippery_poo_4.png" },
            { text: `Now he needs a wash.`, image: "images/slippery_poo_5.png" }
        ]
    },
    {
        id: "yucky-bug",
        title: "The Yucky Bug",
        level: "C",
        wordsCount: 31,
        thumbnail: "images/yucky_bug_1.png",
        pages: [
            { text: `A big bug crawls on the walk.`, image: "images/yucky_bug_1.png" },
            { text: `The bug has red spots on its back.`, image: "images/yucky_bug_2.png" },
            { text: `It makes a funny smell.`, image: "images/yucky_bug_3.png" },
            { text: `The yucky bug crawls away.`, image: "images/yucky_bug_4.png" },
            { text: `We pinch our noses.`, image: "images/yucky_bug_5.png" }
        ]
    },
    {
        id: "snotty-troll",
        title: "The Snotty Troll",
        level: "D",
        wordsCount: 39,
        thumbnail: "images/snotty_troll_1.png",
        pages: [
            { text: `A friendly troll lives under a bridge.`, image: "images/snotty_troll_1.png" },
            { text: `He has a very big cold today.`, image: "images/snotty_troll_2.png" },
            { text: `Achoo! The troll sneezes loud.`, image: "images/snotty_troll_3.png" },
            { text: `Green snot flies out of his nose.`, image: "images/snotty_troll_4.png" },
            { text: `He needs a big tissue to clean up.`, image: "images/snotty_troll_5.png" }
        ]
    },
    {
        id: "dragon-burp",
        title: "The Day the Dragon Burped",
        level: "D",
        wordsCount: 83,
        thumbnail: "images/dragon_burp_1.png",
        pages: [
            { text: `Sparky was a small green dragon with a big problem. He wanted to roast fluffy white marshmallows for his friends. But his fire was broken today.`, image: "images/dragon_burp_1.png" },
            { text: `Sparky took a deep breath to make fire. He puffed up his big green cheeks. "Here comes the fire!" he said to the knights.`, image: "images/dragon_burp_2.png" },
            { text: `But fire did not come out of his mouth. Instead, Sparky let out a massive, loud burp! A giant cloud of green smoke flew out.`, image: "images/dragon_burp_3.png" },
            { text: `The green smoke smelled like old socks and rotten eggs. The knights pinched their noses tightly. "Phew, that is a smelly burp!" they yelled.`, image: "images/dragon_burp_4.png" },
            { text: `Sparky felt very silly and his face turned red. He burped one more tiny green cloud. "Excuse me," the little dragon mumbled.`, image: "images/dragon_burp_5.png" },
            { text: `The knights started to laugh at the smelly dragon. They ate cold marshmallows instead of roasted ones. It was a very funny afternoon.`, image: "images/dragon_burp_6.png" }
        ]
    },
    {
        id: "cheese-catastrophe",
        title: "The Great Cheese Catastrophe",
        level: "D",
        wordsCount: 82,
        thumbnail: "images/cheese_catastrophe_1.png",
        pages: [
            { text: `Barnaby the rat found a wonderful prize in the kitchen. It was a giant wheel of yellow Swiss cheese. He wanted to keep it all for himself.`, image: "images/cheese_catastrophe_1.png" },
            { text: `Barnaby pushed the heavy cheese behind a tall bookshelf. "No one will find my yummy cheese here," he whispered. He felt very sneaky and smart.`, image: "images/cheese_catastrophe_2.png" },
            { text: `A few days passed and the cheese started to get warm. It began to make a very strange and terrible smell. Wavy green stink lines floated in the air.`, image: "images/cheese_catastrophe_3.png" },
            { text: `The terrible smell drifted through the entire house. The other mice woke up from their naps. "What is that yucky smell?" asked a small mouse.`, image: "images/cheese_catastrophe_4.png" },
            { text: `They followed the smelly green clouds to the bookshelf. They found Barnaby holding his nose next to the stinky cheese. The secret was out!`, image: "images/cheese_catastrophe_5.png" },
            { text: `Barnaby shared the stinky cheese with his hungry friends. It smelled like dirty feet, but it tasted great! Next time, he will not hide his food.`, image: "images/cheese_catastrophe_6.png" }
        ]
    },
    {
        id: "snotty-monster",
        title: "The Snotty Sea Monster",
        level: "D",
        wordsCount: 86,
        thumbnail: "images/snotty_monster_1.png",
        pages: [
            { text: `Kraken was a friendly sea monster with long purple tentacles. Today, Kraken was not feeling very well at all. He had a terrible, sniffly cold.`, image: "images/snotty_monster_1.png" },
            { text: `Kraken swam to the surface to get some fresh air. A big pirate ship was sailing right above him. The pirates waved at the friendly monster.`, image: "images/snotty_monster_2.png" },
            { text: `Suddenly, Kraken felt a giant tickle in his nose. He took a huge breath of salty air. "Ah... Ah... ACHOO!" he sneezed loudly.`, image: "images/snotty_monster_3.png" },
            { text: `Thick, green sea-snot blasted out of Kraken's nose. The gooey snot flew through the air and landed on the pirate ship. It covered the wooden deck!`, image: "images/snotty_monster_4.png" },
            { text: `The pirates were completely covered in sticky green slime. They wiped the yucky snot off their faces. "Gross!" shouted the grumpy pirate captain.`, image: "images/snotty_monster_5.png" },
            { text: `Kraken sniffled and waved a tentacle to say sorry. The pirates threw him a giant white tissue. The sea monster blew his nose and swam away.`, image: "images/snotty_monster_6.png" }
        ]
    },
    {
        id: "captain-fartbeard",
        title: "Captain Fartbeard's Treasure",
        level: "D",
        wordsCount: 87,
        thumbnail: "images/captain_fartbeard_1.png",
        pages: [
            { text: `Captain Fartbeard was the bravest pirate in the ocean. He loved eating massive bowls of baked beans for breakfast. His crew always stood far away from him.`, image: "images/captain_fartbeard_1.png" },
            { text: `One day, the wind stopped blowing completely. The pirate ship could not move toward the treasure island. The sailors were very worried and sad.`, image: "images/captain_fartbeard_2.png" },
            { text: `Captain Fartbeard knew exactly what he had to do. He stood at the back of the ship and aimed his bottom. "Hold your noses, crew!" he yelled.`, image: "images/captain_fartbeard_3.png" },
            { text: `The captain let out a tremendous, roaring fart! TOOT! The loud noise echoed across the entire ocean. A huge cloud of smelly wind rushed out.`, image: "images/captain_fartbeard_4.png" },
            { text: `The smelly wind caught the white sails perfectly. The pirate ship zoomed across the water very fast. The crew cheered, even though it smelled terrible.`, image: "images/captain_fartbeard_5.png" },
            { text: `They reached the island and found the shiny gold treasure. Captain Fartbeard's tummy rumbled loudly again. The crew quickly ran away to hide!`, image: "images/captain_fartbeard_6.png" }
        ]
    },
    {
        id: "tooted-tent",
        title: "Who Tooted in the Tent?",
        level: "D",
        wordsCount: 84,
        thumbnail: "images/tooted_tent_1.png",
        pages: [
            { text: `Leo, Mia, and Sam were camping in the dark woods. They zipped up their tiny green tent to go to sleep. It was very cozy inside.`, image: "images/tooted_tent_1.png" },
            { text: `Suddenly, a terrible smell filled the tiny tent. It smelled like old garbage and rotten cabbage. Leo woke up and pinched his nose tight.`, image: "images/tooted_tent_2.png" },
            { text: `"Who tooted in the tent?" Leo asked his friends angrily. Mia and Sam woke up and smelled the stinky air. They both shook their heads no.`, image: "images/tooted_tent_3.png" },
            { text: `"It was not me!" shouted Sam. "It was not me either!" yelled Mia. The tent was getting smellier and smellier every single second.`, image: "images/tooted_tent_4.png" },
            { text: `Mia unzipped the tent door to let some fresh air inside. A black and white skunk was sleeping right on the porch! The mystery was solved.`, image: "images/tooted_tent_5.png" },
            { text: `The kids laughed quietly at their silly mistake. They carefully zipped the tent back up so they would not wake the smelly skunk.`, image: "images/tooted_tent_6.png" }
        ]
    },
    {
        id: "bear-beans",
        title: "The Bear and the Beans",
        level: "C",
        wordsCount: 43,
        thumbnail: "images/bear_beans_1.png",
        pages: [
            { text: "Bob the bear loves to eat baked beans.", image: "images/bear_beans_1.png" },
            { text: "He eats a big bowl of beans for his lunch.", image: "images/bear_beans_2.png" },
            { text: "Bob feels a funny rumble deep in his tummy.", image: "images/bear_beans_3.png" },
            { text: `"Oh no!" says Bob. "TOOT!" goes his bottom.`, image: "images/bear_beans_4.png" },
            { text: "The loud toot blows Bob high up into a tall tree.", image: "images/bear_beans_5.png" },
            { text: "The birds laugh at the silly, smelly, farting bear.", image: "images/bear_beans_6.png" }
        ]
    },
    {
        id: "big-pig",
        title: "The Big Pig",
        level: "A",
        wordsCount: 16,
        thumbnail: "images/big_pig_1.png",
        pages: [
            { text: `See the pig.`, image: "images/big_pig_1.png" },
            { text: `The pig is big.`, image: "images/big_pig_2.png" },
            { text: `See the funny wig.`, image: "images/big_pig_3.png" },
            { text: `The pig is happy.`, image: "images/big_pig_4.png" }
        ]
    },
    {
        id: "fat-rat",
        title: "The Fat Rat",
        level: "B",
        wordsCount: 16,
        thumbnail: "images/fat_rat_1.png",
        pages: [
            { text: `This is a rat.`, image: "images/fat_rat_1.png" },
            { text: `The rat is fat.`, image: "images/fat_rat_2.png" },
            { text: `The rat has a hat.`, image: "images/fat_rat_3.png" },
            { text: `The rat sits on a mat.`, image: "images/fat_rat_4.png" }
        ]
    },
    {
        id: "funny-bunny",
        title: "The Funny Bunny",
        level: "C",
        wordsCount: 26,
        thumbnail: "images/funny_bunny_1.png",
        pages: [
            { text: `A white bunny hops in the grass.`, image: "images/funny_bunny_1.png" },
            { text: `The bunny finds an orange carrot.`, image: "images/funny_bunny_2.png" },
            { text: `The bunny eats the very big carrot.`, image: "images/funny_bunny_3.png" },
            { text: `The bunny is very full and happy.`, image: "images/funny_bunny_4.png" }
        ]
    },
    {
        id: "princess-poo",
        title: "The Princess and the Poo",
        level: "C",
        wordsCount: 42,
        thumbnail: "images/princess_poo_1.png",
        pages: [
            { text: "Princess Pam has a grand royal ball today.", image: "images/princess_poo_1.png" },
            { text: "She wears a beautiful pink dress and shiny new shoes.", image: "images/princess_poo_2.png" },
            { text: "Pam walks through the magic unicorn garden.", image: "images/princess_poo_3.png" },
            { text: "Squish! Splat! Pam steps right in colorful unicorn poo.", image: "images/princess_poo_4.png" },
            { text: `"Yuck!" says Pam. Her shiny shoe is very smelly.`, image: "images/princess_poo_5.png" },
            { text: "Pam washes her stinky shoe in the pond before the ball.", image: "images/princess_poo_6.png" }
        ]
    },
    {
        id: "monkey-mud",
        title: "The Mud Pie Monkey",
        level: "C",
        wordsCount: 52,
        thumbnail: "images/monkey_mud_1.png",
        pages: [
            { text: "Max the monkey loves to play in the wet dirt.", image: "images/monkey_mud_1.png" },
            { text: "He mixes dirt and water to make a big mud pie.", image: "images/monkey_mud_2.png" },
            { text: "Max sees his friend Leo the lion fast asleep.", image: "images/monkey_mud_3.png" },
            { text: "Splat! Max throws the mud pie right on Leo's nose.", image: "images/monkey_mud_4.png" },
            { text: `Leo wakes up and sneezes very loud. "Achoo!"`, image: "images/monkey_mud_5.png" },
            { text: "Green snot flies everywhere and covers silly Max.", image: "images/monkey_mud_6.png" },
            { text: "Now both friends need a long scrub in the river.", image: "images/monkey_mud_7.png" }
        ]
    },
    {
        id: "mock-book-a",
        title: "The Mock Book A",
        level: "A",
        wordsCount: 10,
        thumbnail: "images/mock-book-a_1.png",
        pages: [
            { text: "This is page 1 of A.", image: "images/mock-book-a_1.png" },
            { text: "This is page 2 of A.", image: "images/mock-book-a_2.png" }
        ]
    },
    {
        id: "mock-book-a-1",
        title: "The Mock Book A",
        level: "A",
        wordsCount: 10,
        thumbnail: "images/mock-book-a-1_1.png",
        pages: [
            { text: "This is page 1 of A.", image: "images/mock-book-a-1_1.png" },
            { text: "This is page 2 of A.", image: "images/mock-book-a-1_2.png" }
        ]
    },
    {
        id: "kebab-case-unique-id",
        title: "Farting Frenzy",
        level: "B",
        wordsCount: 163,
        thumbnail: "images/kebab-case-unique-id_1.png",
        pages: [
            { text: "In the kitchen, there was a pot of stew bubbling over. A tiny boy named Jack sat at his table, trying to catch the smell of the food. He started to farts loudly, which made everyone in the room laugh! The boy looked embarrassed but also amused by the noise. Suddenly, he noticed a little dog barking nearby, which made him giggle even more!", image: "images/kebab-case-unique-id_1.png" },
            { text: "On the beach, a group of friends were playing hide-and-seek. They found a small puddle on the sand and decided to play hide-and-seek. The girls hid under a big rock, and the boys tried to find them. After a while, they finally found them, laughing and giggling! But then, one of the boys saw something strange in the water. He turned around and saw a giant mudball floating in the air. He was so surprised, he couldn't believe his eyes. Everyone laughed at the silly thing, but the boy felt a bit embarrassed too.", image: "images/kebab-case-unique-id_2.png" }
        ]
    },
    {
        id: "kebab-case-unique-id-1",
        title: "The Magical Mud Bug Hunt",
        level: "A",
        wordsCount: 51,
        thumbnail: "images/kebab-case-unique-id-1_1.png",
        pages: [
            { text: "In a world where every bug was just as lovable as you were, there lived a tiny bug named MUD who loved to explore his neighborhood. One day, MUD stumbled upon a mysterious pile of brown goo! He couldn’t believe his eyes but immediately realized he had discovered something special.", image: "images/kebab-case-unique-id-1_1.png" }
        ]
    },
    {
        id: "arias-bedtime",
        title: "Aria's Bedtime Routine",
        level: "D",
        wordsCount: 169,
        thumbnail: "images/arias_bedtime_1.png",
        pages: [
            { text: `Aria likes to do fast cartwheels in the living room. Her little sister Amelia sits on the floor and watches. Amelia laughs and claps her tiny hands. "Go, Aria, go!" Amelia squeals.`, image: "images/arias_bedtime_1.png" },
            { text: "It is time for dinner. Aria sits on a tall stool at the kitchen bench. Baby Amelia sits next to her in a high chair. They eat yummy pasta and make silly faces at each other.", image: "images/arias_bedtime_2.png" },
            { text: "Splish, splash! The girls jump into a warm bath. Fluffy white bubbles cover them up to their chins. Aria makes a funny hat out of the soap bubbles. Amelia giggles and throws water.", image: "images/arias_bedtime_3.png" },
            { text: `Aria runs to her bedroom. Her Dad is waiting on the cozy rug. Dad has a big stack of colorful books. "Which story should we read first tonight?" Dad asks with a smile.`, image: "images/arias_bedtime_4.png" },
            { text: "Aria climbs into her warm, soft bed. Dad opens a special book about the brave Dragon Queen. She flies high in the clouds on a golden dragon. Soon, Aria closes her eyes and falls asleep.", image: "images/arias_bedtime_5.png" }
        ]
    }
];
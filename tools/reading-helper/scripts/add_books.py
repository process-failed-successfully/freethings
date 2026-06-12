import json
import re
import os

manifest_path = "tools/reading-helper/books_manifest.json"
script_path = "tools/reading-helper/script.js"

new_books = [
    {
        "id": "tooting-frog",
        "title": "The Tooting Frog",
        "level": "A",
        "wordsCount": 16,
        "thumbnail": "images/tooting_frog_1.png",
        "base_image": "tooting_frog_1.png",
        "pages": [
            {"text": "See the frog.", "image": "images/tooting_frog_1.png", "prompt": "A cute green frog sitting on a lily pad in a pond, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters, simple details"},
            {"text": "The frog jumps.", "image": "images/tooting_frog_2.png", "prompt": "A cute green frog jumping in the air above a lily pad, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters, simple details"},
            {"text": "Toot! The frog farted.", "image": "images/tooting_frog_3.png", "prompt": "A cute green frog looking surprised with a tiny white cartoon puff cloud behind it, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters, simple details"},
            {"text": "The frog is happy.", "image": "images/tooting_frog_4.png", "prompt": "A cute green frog smiling happily on a lily pad, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters, simple details"}
        ]
    },
    {
        "id": "mud-monster",
        "title": "The Mud Monster",
        "level": "B",
        "wordsCount": 31,
        "thumbnail": "images/mud_monster_1.png",
        "base_image": "mud_monster_1.png",
        "pages": [
            {"text": "I play in the mud.", "image": "images/mud_monster_1.png", "prompt": "A happy kid playing in a large mud puddle, covered in brown mud, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "The mud is on my hands.", "image": "images/mud_monster_2.png", "prompt": "A kid holding up two hands covered in thick brown mud, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "The mud is on my face.", "image": "images/mud_monster_3.png", "prompt": "A kid with a big smile and brown mud smeared all over their face, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "I look like a yucky monster.", "image": "images/mud_monster_4.png", "prompt": "A kid completely covered in brown mud raising arms up like a silly monster, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "Time for a bath!", "image": "images/mud_monster_5.png", "prompt": "A clean kid sitting in a white bathtub filled with white soapy bubbles, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"}
        ]
    },
    {
        "id": "green-slime",
        "title": "Green Slime",
        "level": "C",
        "wordsCount": 26,
        "thumbnail": "images/green_slime_1.png",
        "base_image": "green_slime_1.png",
        "pages": [
            {"text": "We look in the garden.", "image": "images/green_slime_1.png", "prompt": "Two kids looking surprised at a pile of green glowing slime in a garden, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "What is that green stuff?", "image": "images/green_slime_2.png", "prompt": "Two kids pointing down at a sticky puddle of green slime, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "It is yucky green slime.", "image": "images/green_slime_3.png", "prompt": "A close up of a shiny sticky green slime puddle, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "The slime feels cold.", "image": "images/green_slime_4.png", "prompt": "A kid poking the green slime with one finger, looking disgusted but curious, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "We wash our hands.", "image": "images/green_slime_5.png", "prompt": "Two kids washing their hands with soap and water at a sink, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"}
        ]
    },
    {
        "id": "smelly-cheese",
        "title": "The Smelly Cheese",
        "level": "D",
        "wordsCount": 42,
        "thumbnail": "images/smelly_cheese_1.png",
        "base_image": "smelly_cheese_1.png",
        "pages": [
            {"text": "A little mouse found a big piece of cheese.", "image": "images/smelly_cheese_1.png", "prompt": "A cute little grey mouse sniffing a large wedge of yellow Swiss cheese with holes, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "The cheese had holes and it was very yellow.", "image": "images/smelly_cheese_2.png", "prompt": "A cute little grey mouse holding a piece of yellow cheese with large round holes, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "Oh no, the cheese smelled very bad.", "image": "images/smelly_cheese_3.png", "prompt": "A cute little grey mouse holding its nose with one paw, standing next to stinky yellow cheese with green wavy smell lines, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "The smell woke up the sleeping cat.", "image": "images/smelly_cheese_4.png", "prompt": "An orange cat waking up from sleep with one eye open, smelling green wavy smell lines in the air, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "The mouse ran away fast.", "image": "images/smelly_cheese_5.png", "prompt": "A cute little grey mouse running away fast, leaving the cheese behind, whimsical children's book watercolor illustration, bright pastel colors, white background"}
        ]
    },
    {
        "id": "hippo-burp",
        "title": "Oops! A Burp",
        "level": "A",
        "wordsCount": 16,
        "thumbnail": "images/hippo_burp_1.png",
        "base_image": "hippo_burp_1.png",
        "pages": [
            {"text": "See the hippo.", "image": "images/hippo_burp_1.png", "prompt": "A cute chubby grey hippo eating green grass in a field, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "The hippo eats grass.", "image": "images/hippo_burp_2.png", "prompt": "A cute chubby grey hippo chewing on a large mouthful of green grass, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "The hippo eats a lot.", "image": "images/hippo_burp_3.png", "prompt": "A cute chubby grey hippo with a very big round belly sitting in a field, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "Oops! A loud burp.", "image": "images/hippo_burp_4.png", "prompt": "A cute chubby grey hippo covering its mouth with one hand, looking surprised after burping, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"}
        ]
    },
    {
        "id": "slippery-poo",
        "title": "Slippery Poo",
        "level": "B",
        "wordsCount": 28,
        "thumbnail": "images/slippery_poo_1.png",
        "base_image": "slippery_poo_1.png",
        "pages": [
            {"text": "My dog runs in the yard.", "image": "images/slippery_poo_1.png", "prompt": "A happy dog running in a grassy yard, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "He does not see the poo.", "image": "images/slippery_poo_2.png", "prompt": "A happy dog running towards a small pile of brown poo hidden in the grass, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "Splat! He steps on it.", "image": "images/slippery_poo_3.png", "prompt": "A dog's paw stepping right into a muddy brown puddle, splatting mud everywhere, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "The dog slips on the poo.", "image": "images/slippery_poo_4.png", "prompt": "A dog sliding comically on the grass on its bottom, looking surprised, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"},
            {"text": "Now he needs a wash.", "image": "images/slippery_poo_5.png", "prompt": "A sad looking dog sitting in a tub of soapy water getting washed, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"}
        ]
    },
    {
        "id": "yucky-bug",
        "title": "The Yucky Bug",
        "level": "C",
        "wordsCount": 31,
        "thumbnail": "images/yucky_bug_1.png",
        "base_image": "yucky_bug_1.png",
        "pages": [
            {"text": "A big bug crawls on the walk.", "image": "images/yucky_bug_1.png", "prompt": "A large round bug with red spots crawling on a sidewalk, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "The bug has red spots on its back.", "image": "images/yucky_bug_2.png", "prompt": "A close up view of a round bug's back showing bright red spots, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "It makes a funny smell.", "image": "images/yucky_bug_3.png", "prompt": "A large bug sitting still while green wavy smell lines float up from it, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "The yucky bug crawls away.", "image": "images/yucky_bug_4.png", "prompt": "A bug crawling away into some green grass, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "We pinch our noses.", "image": "images/yucky_bug_5.png", "prompt": "Two kids pinching their noses shut with their fingers, looking disgusted, whimsical children's book watercolor illustration, bright pastel colors, white background, cute friendly characters"}
        ]
    },
    {
        "id": "snotty-troll",
        "title": "The Snotty Troll",
        "level": "D",
        "wordsCount": 39,
        "thumbnail": "images/snotty_troll_1.png",
        "base_image": "snotty_troll_1.png",
        "pages": [
            {"text": "A friendly troll lives under a bridge.", "image": "images/snotty_troll_1.png", "prompt": "A friendly cute troll with messy hair standing under a stone bridge, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "He has a very big cold today.", "image": "images/snotty_troll_2.png", "prompt": "A cute troll looking sick, holding a thermometer in his mouth and shivering, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "Achoo! The troll sneezes loud.", "image": "images/snotty_troll_3.png", "prompt": "A cute troll sneezing very loudly, eyes squeezed shut, head thrown forward, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "Green snot flies out of his nose.", "image": "images/snotty_troll_4.png", "prompt": "A cute troll looking embarrassed with a string of green snot hanging from his nose, whimsical children's book watercolor illustration, bright pastel colors, white background"},
            {"text": "He needs a big tissue to clean up.", "image": "images/snotty_troll_5.png", "prompt": "A cute troll blowing his nose into a giant white tissue paper, whimsical children's book watercolor illustration, bright pastel colors, white background"}
        ]
    }
]

# Update manifest
with open(manifest_path, 'r') as f:
    manifest = json.load(f)

for book in new_books:
    manifest_book = {
        "id": book["id"],
        "title": book["title"],
        "base_image": book["base_image"],
        "pages": [{"image": p["image"], "prompt": p["prompt"]} for p in book["pages"]]
    }
    manifest.append(manifest_book)

with open(manifest_path, 'w') as f:
    json.dump(manifest, f, indent=4)

# Update script.js PRELOADED_BOOKS
with open(script_path, 'r') as f:
    script_content = f.read()

# We'll locate the PRELOADED_BOOKS array and insert the new ones
js_books_code = ""
for book in new_books:
    pages_js = ",\n            ".join([f'{{ text: "{p["text"]}", image: "{p["image"]}" }}' for p in book["pages"]])
    js_books_code += f"""    {{
        id: "{book['id']}",
        title: "{book['title']}",
        level: "{book['level']}",
        wordsCount: {book['wordsCount']},
        thumbnail: "{book['thumbnail']}",
        pages: [
            {pages_js}
        ]
    }},
"""

# Insert before the closing bracket of PRELOADED_BOOKS
match = re.search(r'const PRELOADED_BOOKS = \[([\s\S]*?)\];', script_content)
if match:
    existing_books = match.group(1)
    # add trailing comma if missing
    if not existing_books.rstrip().endswith(','):
        existing_books = existing_books.rstrip() + ",\n"
    new_preloaded = f"const PRELOADED_BOOKS = [\n{existing_books}{js_books_code}];"
    script_content = script_content[:match.start()] + new_preloaded + script_content[match.end():]
else:
    print("Could not find PRELOADED_BOOKS in script.js")

# Update PHONICS_DICTIONARY
phonics_to_add = {
    "farted": { "parts": ["fart", "ed"], "tip": "'fart' has a bossy 'r' sound. 'ed' makes the /id/ sound." },
    "monster": { "parts": ["mon", "ster"], "tip": "Two parts. 'mon' and 'ster'. The 'er' says /er/." },
    "smelly": { "parts": ["smell", "y"], "tip": "'y' at the end makes the long /ee/ sound." },
    "burp": { "parts": ["b", "urp"], "tip": "'ur' makes the bossy 'r' /er/ sound." },
    "poo": { "parts": ["p", "oo"], "tip": "'oo' makes the long /oo/ sound." },
    "slippery": { "parts": ["slip", "per", "y"], "tip": "Three parts. The 'y' makes the long /ee/ sound." },
    "yucky": { "parts": ["yuck", "y"], "tip": "'ck' makes the /k/ sound, and 'y' sounds like /ee/." },
    "snotty": { "parts": ["snot", "ty"], "tip": "'sn' makes the /sn/ blend. 'y' makes the long /ee/ sound." },
    "achoo": { "parts": ["a", "choo"], "tip": "'ch' makes the /ch/ sound. 'oo' makes the long /oo/ sound." },
    "sneezes": { "parts": ["sn", "eeze", "s"], "tip": "'sn' makes the /sn/ blend. 'ee' makes the long /ee/ sound." }
}

for word, data in phonics_to_add.items():
    js_entry = f'    "{word}": {{ parts: {json.dumps(data["parts"])}, tip: "{data["tip"]}" }},\n'
    # Insert at the top of PHONICS_DICTIONARY
    dict_match = re.search(r'const PHONICS_DICTIONARY = \{', script_content)
    if dict_match:
        script_content = script_content[:dict_match.end()] + "\n" + js_entry + script_content[dict_match.end():]

with open(script_path, 'w') as f:
    f.write(script_content)

print("Successfully injected 8 new books into script.js and books_manifest.json")

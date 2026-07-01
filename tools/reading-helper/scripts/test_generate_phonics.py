import sys
from unittest.mock import MagicMock

# Mock dependencies before they are imported by generate_phonics
# This is necessary because these heavy ML libraries are not installed in the test environment
mock_modules = [
    "torch",
    "transformers",
    "datasets",
    "soundfile",
    "numpy",
    "kokoro"
]
for module_name in mock_modules:
    sys.modules[module_name] = MagicMock()

# Add the current directory to sys.path to ensure generate_phonics can be imported
import os
sys.path.append(os.path.dirname(__file__))

from generate_phonics import get_phonetic_sound, parse_phonics_dictionary, get_phonic_parts

def test_get_phonetic_sound_mapped_letter():
    """Test that single letters are correctly mapped to their phonetic sounds."""
    assert get_phonetic_sound('b') == 'buh.'
    assert get_phonetic_sound('x') == 'ks.'

def test_get_phonetic_sound_mapped_digraph():
    """Test that digraphs (e.g., 'th', 'sh') are correctly mapped."""
    assert get_phonetic_sound('th') == 'thuh.'
    assert get_phonetic_sound('sh') == 'shh.'

def test_get_phonetic_sound_mapped_blend():
    """Test that consonant blends are correctly mapped."""
    assert get_phonetic_sound('spl') == 'spluh.'
    assert get_phonetic_sound('nd') == 'und.'

def test_get_phonetic_sound_unmapped():
    """Test that unmapped words/parts are returned as-is with a period added."""
    assert get_phonetic_sound('apple') == 'apple.'
    assert get_phonetic_sound('everything') == 'everything.'

def test_get_phonetic_sound_already_has_period():
    """Test that a period is not redundantly added if one already exists."""
    assert get_phonetic_sound('buh.') == 'buh.'
    assert get_phonetic_sound('test.') == 'test.'

def test_parse_phonics_dictionary():
    content = """
    const PHONICS_DICTIONARY = {
        "mystery": { parts: ["mys", "ter", "y"], tip: "Tip 1" },
        "sam": { parts: ["s", "am"], tip: "Tip 2" }
    };
    """
    parsed = parse_phonics_dictionary(content)
    assert parsed == {
        "mystery": ["mys", "ter", "y"],
        "sam": ["s", "am"]
    }

def test_get_phonic_parts_heuristic_single_syllable():
    # 'troll' should be split into 'tr' and 'oll'
    parts = get_phonic_parts("troll", {})
    assert parts == ["tr", "oll"]

def test_get_phonic_parts_heuristic_multi_syllable():
    # 'friendly' should be split into 'frien' and 'dly' by the heuristic
    parts = get_phonic_parts("friendly", {})
    assert parts == ["frien", "dly"]
    
def test_get_phonic_parts_from_dict():
    phonics_dict = {"mystery": ["mys", "ter", "y"]}
    parts = get_phonic_parts("mystery", phonics_dict)
    assert parts == ["mys", "ter", "y"]

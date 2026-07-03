"""Best-effort Sinhala -> Latin phonetic transliteration.

Sinhala consonant letters carry an inherent "a" vowel unless followed by a
dependent vowel sign (pilla) or the virama (hal kirima), which suppresses it.
This walks the text character by character applying that rule, using the
same romanization conventions as the flashcard seed data.
"""

INDEPENDENT_VOWELS = {
    "අ": "a", "ආ": "ā", "ඇ": "æ", "ඈ": "ǣ",
    "ඉ": "i", "ඊ": "ī", "උ": "u", "ඌ": "ū",
    "එ": "e", "ඒ": "ē", "ඓ": "ai",
    "ඔ": "o", "ඕ": "ō", "ඖ": "au",
}

CONSONANTS = {
    "ක": "k", "ඛ": "kh", "ග": "g", "ඝ": "gh", "ඞ": "ṅ", "ඟ": "ṅg",
    "ච": "c", "ඡ": "ch", "ජ": "j", "ඣ": "jh", "ඤ": "ñ", "ඥ": "gn", "ඦ": "ñj",
    "ට": "ṭ", "ඨ": "ṭh", "ඩ": "ḍ", "ඪ": "ḍh", "ණ": "ṇ", "ඬ": "ṇḍ",
    "ත": "t", "ථ": "th", "ද": "d", "ධ": "dh", "න": "n", "ඳ": "nd",
    "ප": "p", "ඵ": "ph", "බ": "b", "භ": "bh", "ම": "m", "ඹ": "mb",
    "ය": "y", "ර": "r", "ල": "l", "ව": "v",
    "ශ": "ś", "ෂ": "ṣ", "ස": "s", "හ": "h", "ළ": "ḷ", "ෆ": "f",
}

# Dependent vowel signs (pili). "්" is the virama (hal kirima): it suppresses
# the consonant's inherent "a" entirely, so it maps to an empty string.
VOWEL_SIGNS = {
    "්": "", "ා": "ā", "ැ": "æ", "ෑ": "ǣ",
    "ි": "i", "ී": "ī", "ු": "u", "ූ": "ū", "ෘ": "ṛ",
    "ෙ": "e", "ේ": "ē", "ෛ": "ai",
    "ො": "o", "ෝ": "ō", "ෞ": "au",
}

MARKS = {"ං": "ṁ", "ඃ": "ḥ"}


def transliterate(text):
    result = []
    i = 0
    length = len(text)

    while i < length:
        ch = text[i]

        if ch in CONSONANTS:
            next_ch = text[i + 1] if i + 1 < length else None
            if next_ch in VOWEL_SIGNS:
                result.append(CONSONANTS[ch] + VOWEL_SIGNS[next_ch])
                i += 2
                continue
            result.append(CONSONANTS[ch] + "a")
            i += 1
            continue

        if ch in INDEPENDENT_VOWELS:
            result.append(INDEPENDENT_VOWELS[ch])
            i += 1
            continue

        if ch in MARKS:
            result.append(MARKS[ch])
            i += 1
            continue

        result.append(ch)
        i += 1

    return "".join(result)

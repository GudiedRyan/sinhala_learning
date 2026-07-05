import threading

MODEL_ID = "facebook/nllb-200-distilled-600M"
LANG_CODES = {"en": "eng_Latn", "si": "sin_Sinh"}

_lock = threading.Lock()
_tokenizer = None
_model = None


def _load():
    global _tokenizer, _model
    if _model is not None:
        return
    with _lock:
        if _model is not None:
            return
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

        _tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        _model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID)


def translate(text, source, target):
    if source not in LANG_CODES or target not in LANG_CODES:
        raise ValueError(f"Unsupported language code: {source} -> {target}")

    _load()

    _tokenizer.src_lang = LANG_CODES[source]
    inputs = _tokenizer(text, return_tensors="pt")
    forced_bos_token_id = _tokenizer.convert_tokens_to_ids(LANG_CODES[target])

    output_tokens = _model.generate(
        **inputs,
        forced_bos_token_id=forced_bos_token_id,
        max_length=256,
    )

    return _tokenizer.batch_decode(output_tokens, skip_special_tokens=True)[0]

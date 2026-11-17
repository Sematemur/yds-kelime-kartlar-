import pdfplumber
import json
import os

pdf_path = "kirmizi_pembe_isaretli_kelimeler.pdf"
data_js_path = "data.js"

with open(data_js_path, "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find("{")
end_idx = text.rfind("}") + 1
old_seed = json.loads(text[idx:end_idx])
old_ex = old_seed.get("EX", {})
old_tone = old_seed.get("TONE", {})

pdf_words = []
with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        table = page.extract_table()
        if table:
            for r in table[1:]:
                if r and any(r) and r[0]:
                    pdf_words.append({
                        "word": r[0].replace("\n", " ").strip(),
                        "tr": r[1].replace("\n", " ").strip() if len(r) > 1 and r[1] else "",
                        "syn": r[2].replace("\n", " ").strip() if len(r) > 2 and r[2] else "",
                        "page": r[3].replace("\n", " ").strip() if len(r) > 3 and r[3] else ""
                    })

print(f"Extracted {len(pdf_words)} words from PDF.")

custom_ex = {
    "indifferent to": {
        "syn": ["Uninterested", "unconcerned", "callous"],
        "ant": ["Caring", "concerned", "interested"],
        "example": "He remained completely indifferent to the suffering and needs of others.",
        "translation": "Başkalarının acılarına ve ihtiyaçlarına karşı tamamen kayıtsız kaldı.",
        "pos": "adj"
    },
    "devoid of": {
        "syn": ["Lacking", "empty", "bereft of"],
        "ant": ["Full of", "replete with", "rich in"],
        "example": "The barren desert landscape was completely devoid of plant and animal life.",
        "translation": "Kıraç çöl arazisi, bitki ve hayvan yaşamından tamamen yoksundu.",
        "pos": "adj"
    },
    "deduce from": {
        "syn": ["Infer", "conclude", "derive"],
        "ant": ["Guess", "assume"],
        "example": "From the collected clues, detectives deduced that the thief knew the building well.",
        "translation": "Toplanan ipuçlarından dedektifler, hırsızın binayı iyi bildiği çıkarımını yaptı.",
        "pos": "v"
    },
    "accustomed to": {
        "syn": ["Be used to", "habituated", "adapted to"],
        "ant": ["Unaccustomed", "unfamiliar with"],
        "example": "Having lived in the north for decades, she was accustomed to freezing winters.",
        "translation": "Onlarca yıldır kuzeyde yaşadığından dondurucu kışlara alışıktı.",
        "pos": "adj"
    },
    "affiliate with": {
        "syn": ["Associate", "connect", "incorporate", "link with"],
        "ant": ["Separate", "dissociate", "detach"],
        "example": "The local hospital decided to affiliate with the prestigious university network.",
        "translation": "Yerel hastane, prestijli üniversite ağı ile bağlantı kurmaya karar verdi.",
        "pos": "v"
    },
    "coincide with": {
        "syn": ["Match", "correspond", "agree", "concur", "overlap"],
        "ant": ["Clash", "differ", "diverge"],
        "example": "The timing of the new product launch happened to coincide with the major trade expo.",
        "translation": "Yeni ürün lansmanının zamanlaması, büyük ticaret fuarıyla tesadüfen aynı zamana denk geldi.",
        "pos": "v"
    },
    "withhold": {
        "syn": ["Reserve", "hold back"],
        "ant": ["Release", "give"],
        "example": "During the trial, the prosecution was accused of withholding crucial evidence from the defence.",
        "translation": "Duruşma esnasında davacı, savunmadan çok önemli delilleri saklamakla suçlandı.",
        "pos": "v"
    },
    "yield to": {
        "syn": ["Give in to", "accept", "surrender to", "submit to"],
        "ant": ["Resist", "withstand", "oppose"],
        "example": "Despite intense pressure from the opposition, the committee refused to yield to their demands.",
        "translation": "Muhalefetin yoğun baskısına rağmen komite, taleplerine boyun eğmeyi reddetti.",
        "pos": "v"
    },
    "culminate in": {
        "syn": ["Reach the top", "finalize", "end in", "climax in"],
        "ant": ["Begin", "commence", "originate"],
        "example": "Years of tireless investigation finally culminated in the capture of the criminal ring.",
        "translation": "Yıllar süren yorulmak bilmez soruşturma nihayet suç örgütünün yakalanmasıyla sonuçlandı.",
        "pos": "v"
    }
}

new_W = []
new_EX = {}
new_TONE = {}

for idx, item in enumerate(pdf_words):
    word_id = idx + 1
    w_en = item["word"]
    w_tr = item["tr"]
    pdf_syn = [s.strip() for s in item["syn"].split(",") if s.strip()]
    k = w_en.lower()

    pron = ""
    for old_w in old_seed.get("W", []):
        if old_w[1].strip().upper() == w_en.upper():
            pron = old_w[2] or ""
            break

    new_W.append([word_id, w_en, pron, w_tr])

    if k in custom_ex:
        ex_entry = dict(custom_ex[k])
    elif k in old_ex:
        ex_entry = dict(old_ex[k])
    elif k == "withhold" and "withold" in old_ex:
        ex_entry = dict(old_ex["withold"])
    else:
        ex_entry = {"syn": pdf_syn, "ant": [], "example": "", "translation": "", "pos": ""}

    merged_syn = list(pdf_syn)
    for s in ex_entry.get("syn", []):
        if s.lower() not in [x.lower() for x in merged_syn]:
            merged_syn.append(s)
    ex_entry["syn"] = merged_syn

    if not ex_entry.get("ex") and ex_entry.get("example"):
        ex_entry["ex"] = ex_entry["example"]
    elif not ex_entry.get("example") and ex_entry.get("ex"):
        ex_entry["example"] = ex_entry["ex"]

    new_EX[k] = ex_entry

    if k in old_tone:
        new_TONE[k] = old_tone[k]

new_seed = {
    "ver": 6,
    "W": new_W,
    "EX": new_EX,
    "TONE": new_TONE
}

header = "/* Kırmızı / Pembe İşaretli Kelimeler — YDS Kelime Listesi (146 Kelime) */\nwindow.SEED="
output_content = header + json.dumps(new_seed, ensure_ascii=False, separators=(',', ':')) + ";\n"

with open("data.js", "w", encoding="utf-8") as f:
    f.write(output_content)

print(f"data.js successfully written with {len(new_W)} words, seed version {new_seed['ver']}.")

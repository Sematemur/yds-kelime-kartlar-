const fs = require('fs');

// Read old data.js
const oldDataText = fs.readFileSync('data.js', 'utf8');
const startIdx = oldDataText.indexOf('{');
const endIdx = oldDataText.lastIndexOf('}') + 1;
const oldSeed = JSON.parse(oldDataText.slice(startIdx, endIdx));
const oldEx = oldSeed.EX || {};
const oldTone = oldSeed.TONE || {};

// Read step 52 output or raw list of 146 words
const rawLines = `
1: DECEPTION | Aldatma, hilekârlık, dolandırıcılık | Deceiving, dishonesty, trickery | p.1
2: INDIFFERENT TO | İlgisiz, kayıtsız | Uninterested | p.3
3: SPOIL | Çürümek, bozulmak | Decay, rotten | p.3
4: PRECIPITATE | Hızlandırmak, yağmak, çökmek | Accelerate, hasten | p.4
5: REALM | Alan, saha, krallık, ülke, memleket | Area, region, field | p.4
6: LEGITIMATE | Yasal, meşru | Legal, lawful | p.4
7: EXAGGERATE | Abartmak | Overstate | p.23
8: APPREHENSION | Endişe, korku | Anxiety, fear, dread, concern | p.25
9: TEMPT | Cezbetmek, baştan çıkarmak | Allure, appeal | p.29
10: COMPULSORY | Zorunlu | Obligatory, mandatory, must | p.29
11: DISCERN | Fark etmek, algılamak, ayırt etmek | Perceive, notice, see | p.30
12: DEVOID OF | Yoksun | Lacking | p.30
13: IMPLICATE | İlişkilendirmek, bağlantı kurmak | Connect, associate | p.30
14: GAUGE | Ölçmek, tahmin etmek | Measure, estimate, evaluate | p.31
15: SPARSE | Seyrek, az | Thin, bare, meagre | p.31
16: SUPERFICIAL | Yüzeysel, üstünkörü | Surface, shallow | p.31
17: PLEDGE | Söz, vaat, teminat, rehin; bağış sözü | Promise | p.31
18: RENDER | -mesine neden olmak, duruma getirmek, netleştirmek | Make, cause to be | p.32
19: RECONCILIATION | Anlaşma, uzlaşma | Agreement, settlement | p.36
20: PREVAIL | Hâkim olmak, hüküm sürmek, yaygın olmak | Abound, exist thoroughly | p.36
21: PROBE | Araştırma, insansız uzay roketi | Exploration, investigation, inquiry | p.36
22: IMPERATIVE | Acil | Urgent | p.37
23: ERUDITE | Bilgili, detaylı, iyi | Knowledgeable, learned | p.37
24: COMPREHEND | Anlamak | Understand, apprehend, grasp | p.38
25: CONSIDERATE | Düşünceli, ince ruhlu | Thoughtful | p.38
26: VIABLE | Olası, yapılabilir | Feasible, possible | p.39
27: VOLATILITY | İstikrarsızlık, değişkenlik | Instability | p.39
28: SLUGGISH | Ağır işleyen, yavaş seyreden | Slow-moving | p.39
29: SOLIDARITY | Dayanışma | Unity, cohesion | p.39
30: ADJUST | Ayarlamak, düzenlemek, kurmak, tamir etmek | Set, regulate, mend, repair, fix, arrange, adapt | p.43
31: CURTAIL | Azaltmak, kısaltmak | Reduce, decrease, abate, lessen | p.43
32: DISPUTE | Tartışmak | Debate, argue | p.44
33: IMPEDE | Engel olmak | Prevent, hinder, hamper | p.44
34: ILLEGIBLE | Okunaksız | Cannot be read | p.44
35: POTENT | Güçlü | Effective, powerful | p.46
36: MEND | Tamir etmek, onarmak | Repair, fix | p.46
37: MITIGATE | Azaltmak | Lessen, ease | p.50
38: OBSTINATE | İnatçı | Stubborn | p.50
39: INTRINSIC | Asıl, esas, kendine özgü, içten gelen | Inherent, inborn, basic | p.50
40: HASTY | Acele, hızlı | Hurried, speedy | p.51
41: DEDUCE FROM | Çıkarım yapmak, sonucuna varmak | Infer | p.52
42: DELIBERATELY | Kasıtlı olarak, bilerek | Intentionally, on purpose | p.52
43: ACCUSTOMED TO | Alışkın olmak, alıştırmak | Be used to, be addicted to | p.53
44: ARBITRARY | Rastgele, keyfî, otoriter | Random, chance, dictatorial | p.53
45: AFFILIATE WITH | Bağlamak, ilişkilendirmek, ilişki içinde olmak | Associate, connect, incorporate | p.57
46: AFFLUENT | Zengin, gelişmiş | Rich, wealthy, prosperous, well-off | p.57
47: COINCIDE WITH | Tesadüfen kesişmek, uyuşmak | Match, correspond, agree | p.58
48: INDEFINITELY | Süresiz olarak, sonsuza dek | Forever | p.59
49: REPEAL | Yasayı yürürlükten kaldırmak, iptal etmek | Revoke, annul | p.60
50: NUISANCE | Dert, baş belası | Trouble, problem | p.64
51: DULL | Sıkıcı | Boring, tedious | p.65
52: DISDAIN | Küçümseme, hor görme | Scorn, despise, disregard | p.66
53: EXPLOIT | Sömürmek, faydalanmak | Misuse, abuse | p.66
54: EXTEND | Uzatmak, sürdürmek; yardım veya kredi vermek | Stretch, prolong | p.66
55: WITHHOLD | Tutmak, vermemek, korumak, saklamak | Reserve, hold back | p.71
56: VERMIN | Zararlı hayvan, parazit | Parasites, pest | p.72
57: UNILATERAL | Tek taraflı | One-sided | p.72
58: ACQUIRE | Elde etmek | Gain, obtain, earn, win, attain, achieve, get | p.73
59: DIVERGE | Sapmak, yön değiştirmek | Deviate, move away | p.74
60: RAMPANT | Yaygın, aşırı boyutlara varmış, her tarafa yayılmış | Widespread, increasing, prevalent | p.74
61: PERPLEX | Şaşırtmak, kafasını karıştırmak | Bewilder, confuse, astonish | p.74
62: RENOWN | Ün, şöhret | Fame, reputation | p.78
63: NEAT | Temiz, düzenli | Tidy | p.78
64: HITHERTO | Şu ana kadar | Up till now, so far, to date, thus far | p.79
65: DILIGENT | Çalışkan, başarılı | Hardworking, studious, industrious | p.79
66: EVOKE | Akla getirmek, hatırlatmak | Bring to mind, remind | p.80
67: FALLACY | Yanılgı, yanılsama | False notion, deception, mistake | p.80
68: CONCEDE | Kabul etmek | Admit, accept | p.80
69: CURB | Kontrol altına almak | Control, check | p.80
70: BUSTLE | Hareketlilik, canlılık | Movement, vividness | p.81
71: AUSTERE | Sert, ciddi, katı | Severe, serious, strict, stern, hard, harsh, rigid | p.85
72: BLUNTLY | Açık, dürüst bir şekilde | Frankly, honestly | p.85
73: AILMENT | Hastalık | Illness, disease, complaint, disorder, malfunction | p.85
74: ACCOMPANY | Eşlik etmek | Go with, escort, attend, follow | p.85
75: ABDUCT | Kaçırmak | Kidnap, seize, drag away | p.86
76: DEPART | Ayrılmak, hareket etmek | Leave, set off | p.87
77: CONSTRAIN | Zorlamak, baskı altına almak, sınırlamak | Force, compel, limit | p.87
78: DEVIATE | Sapmak, yön değiştirmek | Move away, diverge | p.87
79: DEVOUT | Dindar | Religious | p.87
80: ELIGIBLE | Uygun, seçilebilir | Suitable, appropriate | p.88
81: GRATIFY | Memnun etmek, tatmin etmek | Please, satisfy | p.92
82: ILLICIT | Yasa dışı | Illegal, unlawful | p.92
83: DECREE | İlan etmek, duyurmak, buyurmak | Declare, announce, order | p.93
84: CONVINCE | İkna etmek | Persuade, win over, bring round | p.93
85: REVOKE | İptal etmek, feshetmek, geri almak | Cancel, annul, repeal | p.93
86: WITHDRAW | Geri çekmek | Take back, pull back, extract | p.94
87: VERGE | Eşik, kenar | Edge, threshold | p.95
88: AMASS | Biriktirmek, toplamak | Accumulate, gather up, heap up, pile up | p.95
89: CONTRADICT | Aksini söylemek, çelişmek | Counter, oppose | p.99
90: DEFER | Ertelemek | Put off, postpone, delay | p.99
91: DECEIT | Aldatma, dolandırma | Deception, fraud, cheating | p.100
92: COMPULSION | Zorlama, baskı | Force, urge | p.100
93: CONCESSION | İmtiyaz, hak, ödün, taviz | Compromise, giving in | p.100
94: EXTERMINATE | Yok etmek | Destroy, eradicate | p.101
95: EVASIVE | Kaçamaklı, kaçamak hareket | Elusive | p.101
96: EMINENT | Seçkin, ünlü, bilinen, saygın | Famous, well-known, reputed, prominent | p.101
97: INQUISITIVE | Meraklı | Curious, inquiring | p.101
98: FATIGUE | Aşırı yorgunluk, bitkinlik, aşınma | Extreme tiredness, exhaustion | p.101
99: PERENNIALLY | Sürekli, kalıcı | Constantly, always | p.106
100: RECURRENCE | Nüksetme, tekrarlama, yineleme | Reappearance, repetition | p.106
101: SUCCEED | İzlemek, yerini almak | Follow, come after | p.107
102: FAR-FETCHED | İnanılmaz, gerçekten uzak | Incredible, fantastic, unbelievable | p.107
103: INGENIOUS | Hünerli, marifetli, akıllı | Clever, creative, highly skilled | p.107
104: UPHEAVAL | Ani değişiklik, kargaşa, isyan, başkaldırı | Uprising, rebellion, disruption, turmoil | p.108
105: UTMOST | En üstün, azami | Greatest, maximum, highest | p.108
106: WRANGLE | Tartışmak | Dispute, argue | p.108
107: YIELD TO | Boyun eğmek, teslim olmak | Give in to, accept | p.108
108: SEVER | Bağını koparmak, kesmek, ayırmak | Cut off, break | p.109
109: ACCEDE | Kabul etmek, onaylamak, razı olmak | Assent to, agree to, accept, comply, approve | p.113
110: AMBIGUOUS | Belirsiz, şüpheli | Doubtful, dubious, unclear, uncertain, indefinite, vague, obscure | p.113
111: WIELD | Kullanmak, sahip olmak | Employ, exercise, use, have | p.114
112: VERDICT | Karar, hüküm | Decision | p.114
113: UNSUBSTANTIATED | Kanıtlanmamış, onaylanmamış | Unproven, unconfirmed, questionable | p.114
114: TANGIBLE | Elle tutulur, somut | Can be touched, concrete | p.114
115: DISTINCTIVE | Belirgin, ayrı, farklı | Unique, distinguishing | p.115
116: CONCISELY | Kısaca, öz | Briefly, shortly, in brief | p.115
117: CRUDE | Ham, işlenmemiş, basit | Raw, unrefined, unprocessed, simple | p.116
118: INDISPENSABLE | Vazgeçilemez, gerekli | Necessary, essential | p.116
119: PROPONENT | Savunucu, taraftar | Advocate, defender, exponent | p.120
120: SURMOUNT | Üstesinden gelmek | Overcome, conquer | p.120
121: INTUITION | Sezgi | Instinctive knowledge | p.120
122: LUCRATIVE | Kârlı, kazançlı, yararlı | Profitable, remunerative | p.121
123: EXPLICIT | Açık, yalın | Clear, unambiguous | p.122
124: UNANIMOUSLY | Oy birliğiyle | Collectively | p.122
125: VICIOUS CYCLE | Kısır döngü | Vicious circle | p.122
126: WAGE | Yürütmek, yapmak | Conduct, carry on | p.123
127: WARD OFF | Önlemek | Prevent, hinder | p.123
128: APPRAISE | Değerlendirmek, değer biçmek | Assess, evaluate, estimate, value, rate | p.123
129: AGGRAVATE | Kötüleştirmek, şiddetlendirmek | Worsen, intensify, deteriorate | p.127
130: ENTHUSIASTIC | İstekli, hevesli | Eager, earnest | p.128
131: DAZZLE | Şaşırtmak, etkilemek | Impress, astonish, surprise, perplex | p.129
132: CONTRIVE | İcat etmek, yaratmak, başarmak | Invent, devise, manage | p.129
133: LOATH | İsteksiz | Unwilling, reluctant | p.129
134: OBSCURE | Belirsiz, karanlık, silik | Vague, ambiguous | p.129
135: PARAMOUNT | Son derece önemli | Supreme | p.129
136: FLAIR | Yetenek | Ability, talent, gift, knack | p.134
137: MISHAP | Aksilik, kaza | Misfortune, unfortunate accident | p.134
138: REFRAIN FROM | -den kaçınmak, -den çekinmek | Abstain from, avoid doing sth. | p.134
139: LEGACY | Miras | Inheritance, bequest | p.135
140: LEGIBLE | Okunaklı, okunabilir | Well-written | p.135
141: CULMINATE IN | Zirveye ulaşmak, son bulmak, ile sonuçlanmak | Reach the top, finalize | p.135
142: CIRCUMSTANTIAL | İkinci derecede, durumla ilgili, ayrıntılı | Secondary, indirect | p.136
143: CONDENSE | Yoğunlaştırmak | Compress, compact | p.136
144: DISPARITY | Farklılık, fark, boşluk, uçurum | Difference, gap | p.136
145: ASPIRE | Arzu etmek, istemek | Desire, long for, hope, wish | p.137
146: SANCTION | Yaptırım | Penalty, punishment, restriction | p.137
`;

const customEx = {
  'indifferent to': {
    syn: ['Uninterested', 'unconcerned', 'callous'],
    ant: ['Caring', 'concerned', 'interested'],
    example: 'He remained completely indifferent to the suffering and needs of others.',
    translation: 'Başkalarının acılarına ve ihtiyaçlarına karşı tamamen kayıtsız kaldı.',
    pos: 'adj'
  },
  'devoid of': {
    syn: ['Lacking', 'empty', 'bereft of'],
    ant: ['Full of', 'replete with', 'rich in'],
    example: 'The barren desert landscape was completely devoid of plant and animal life.',
    translation: 'Kıraç çöl arazisi, bitki ve hayvan yaşamından tamamen yoksundu.',
    pos: 'adj'
  },
  'deduce from': {
    syn: ['Infer', 'conclude', 'derive'],
    ant: ['Guess', 'assume'],
    example: 'From the collected clues, detectives deduced that the thief knew the building well.',
    translation: 'Toplanan ipuçlarından dedektifler, hırsızın binayı iyi bildiği çıkarımını yaptı.',
    pos: 'v'
  },
  'accustomed to': {
    syn: ['Be used to', 'habituated', 'adapted to'],
    ant: ['Unaccustomed', 'unfamiliar with'],
    example: 'Having lived in the north for decades, she was accustomed to freezing winters.',
    translation: 'Onlarca yıldır kuzeyde yaşadığından dondurucu kışlara alışıktı.',
    pos: 'adj'
  },
  'affiliate with': {
    syn: ['Associate', 'connect', 'incorporate', 'link with'],
    ant: ['Separate', 'dissociate', 'detach'],
    example: 'The local hospital decided to affiliate with the prestigious university network.',
    translation: 'Yerel hastane, prestijli üniversite ağı ile bağlantı kurmaya karar verdi.',
    pos: 'v'
  },
  'coincide with': {
    syn: ['Match', 'correspond', 'agree', 'concur', 'overlap'],
    ant: ['Clash', 'differ', 'diverge'],
    example: 'The timing of the new product launch happened to coincide with the major trade expo.',
    translation: 'Yeni ürün lansmanının zamanlaması, büyük ticaret fuarıyla tesadüfen aynı zamana denk geldi.',
    pos: 'v'
  },
  'withhold': {
    syn: ['Reserve', 'hold back'],
    ant: ['Release', 'give'],
    example: 'During the trial, the prosecution was accused of withholding crucial evidence from the defence.',
    translation: 'Duruşma esnasında davacı, savunmadan çok önemli delilleri saklamakla suçlandı.',
    pos: 'v'
  },
  'yield to': {
    syn: ['Give in to', 'accept', 'surrender to', 'submit to'],
    ant: ['Resist', 'withstand', 'oppose'],
    example: 'Despite intense pressure from the opposition, the committee refused to yield to their demands.',
    translation: 'Muhalefetin yoğun baskısına rağmen komite, taleplerine boyun eğmeyi reddetti.',
    pos: 'v'
  },
  'culminate in': {
    syn: ['Reach the top', 'finalize', 'end in', 'climax in'],
    ant: ['Begin', 'commence', 'originate'],
    example: 'Years of tireless investigation finally culminated in the capture of the criminal ring.',
    translation: 'Yıllar süren yorulmak bilmez soruşturma nihayet suç örgütünün yakalanmasıyla sonuçlandı.',
    pos: 'v'
  }
};

const lines = rawLines.trim().split('\n');
const newW = [];
const newEX = {};
const newTONE = {};

lines.forEach((line, index) => {
  const parts = line.split('|').map(s => s.trim());
  if (parts.length < 3) return;
  
  const idAndWord = parts[0];
  const firstColon = idAndWord.indexOf(':');
  const enWord = idAndWord.slice(firstColon + 1).trim();
  const tr = parts[1];
  const synStr = parts[2];
  const pdfSyns = synStr.split(',').map(s => s.trim()).filter(Boolean);
  const wordId = index + 1;
  const k = enWord.toLowerCase();
  
  // Find pronunciation from old seed if available
  let pron = '';
  if (Array.isArray(oldSeed.W)) {
    const found = oldSeed.W.find(w => w[1].trim().toUpperCase() === enWord.toUpperCase());
    if (found && found[2]) pron = found[2];
  }
  
  newW.push([wordId, enWord, pron, tr]);
  
  // Build EX object
  let exObj = null;
  if (customEx[k]) {
    exObj = Object.assign({}, customEx[k]);
  } else if (oldEx[k]) {
    exObj = Object.assign({}, oldEx[k]);
  } else if (k === 'withhold' && oldEx['withold']) {
    exObj = Object.assign({}, oldEx['withold']);
  } else {
    exObj = { syn: pdfSyns, ant: [], example: '', translation: '', pos: '' };
  }
  
  // Merge synonyms with PDF synonyms prioritized
  const mergedSyn = [...pdfSyns];
  if (Array.isArray(exObj.syn)) {
    exObj.syn.forEach(s => {
      if (!mergedSyn.some(m => m.toLowerCase() === s.toLowerCase())) {
        mergedSyn.push(s);
      }
    });
  }
  exObj.syn = mergedSyn;
  if (!exObj.ex && exObj.example) exObj.ex = exObj.example;
  if (!exObj.example && exObj.ex) exObj.example = exObj.ex;
  
  newEX[k] = exObj;
  
  if (oldTone[k]) {
    newTONE[k] = oldTone[k];
  }
});

const newSeed = {
  ver: 6,
  W: newW,
  EX: newEX,
  TONE: newTONE
};

const fileContent = '/* Kırmızı / Pembe İşaretli Kelimeler — YDS Kelime Listesi (146 Kelime) */\n' +
  'window.SEED=' + JSON.stringify(newSeed) + ';\n';

// Print file content directly to stdout
process.stdout.write(fileContent);


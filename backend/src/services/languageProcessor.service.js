/**
 * Language Processor Service
 * Handles language-specific text processing, benchmarks, and analysis
 */

const nlpUtils = require('../utils/nlp');

// ============================================================================
// LANGUAGE CONFIGURATIONS
// ============================================================================

const LANGUAGE_CONFIGS = {
  // ============================================================================
  // ENGLISH
  // ============================================================================
  en: {
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    wordSeparator: ' ',
    syllableMethod: 'english',
    benchmarks: {
      blog: {
        avgWordLength: { min: 4.0, max: 5.5, ideal: 4.8 },
        avgSentenceLength: { min: 12, max: 20, ideal: 15 },
        readabilityScore: { min: 60, max: 80, ideal: 70 },
        vocabularyRichness: { min: 0.4, max: 0.7, ideal: 0.55 },
        punctuationRatio: { min: 0.05, max: 0.15, ideal: 0.1 }
      },
      academic: {
        avgWordLength: { min: 5.0, max: 7.0, ideal: 5.8 },
        avgSentenceLength: { min: 18, max: 30, ideal: 22 },
        readabilityScore: { min: 30, max: 50, ideal: 40 },
        vocabularyRichness: { min: 0.5, max: 0.8, ideal: 0.65 },
        punctuationRatio: { min: 0.08, max: 0.18, ideal: 0.12 }
      },
      casual: {
        avgWordLength: { min: 3.5, max: 5.0, ideal: 4.2 },
        avgSentenceLength: { min: 8, max: 15, ideal: 12 },
        readabilityScore: { min: 70, max: 90, ideal: 80 },
        vocabularyRichness: { min: 0.35, max: 0.6, ideal: 0.45 },
        punctuationRatio: { min: 0.03, max: 0.12, ideal: 0.08 }
      },
      professional: {
        avgWordLength: { min: 4.5, max: 6.0, ideal: 5.2 },
        avgSentenceLength: { min: 14, max: 22, ideal: 18 },
        readabilityScore: { min: 45, max: 65, ideal: 55 },
        vocabularyRichness: { min: 0.45, max: 0.7, ideal: 0.58 },
        punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
      }
    },
    transitionWords: [
      'moreover', 'furthermore', 'additionally', 'besides', 'also', 'meanwhile',
      'not only', 'as well as', 'even', 'especially', 'in particular',
      'therefore', 'thus', 'hence', 'consequently', 'because', 'since',
      'as a result', 'leads to', 'causes', 'due to', 'thanks to',
      'however', 'but', 'yet', 'still', 'nevertheless', 'nonetheless',
      'although', 'though', 'even though', 'despite', 'conversely', 'while',
      'first', 'firstly', 'initially', 'second', 'third', 'next',
      'then', 'after that', 'finally', 'in conclusion', 'in summary',
      'if', 'suppose', 'in case', 'provided that', 'unless',
      'actually', 'really', 'in fact', 'clearly', 'obviously', 'certainly', 'indeed'
    ],
    formalWords: [
      'utilize', 'commence', 'terminate', 'endeavor', 'facilitate',
      'subsequently', 'furthermore', 'nevertheless', 'notwithstanding',
      'aforementioned', 'henceforth', 'whereby', 'thereof', 'herein',
      'pursuant', 'heretofore', 'inasmuch', 'whereupon', 'forthwith'
    ],
    informalWords: [
      'gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'nope', 'yep',
      'ok', 'okay', 'lol', 'btw', 'tbh', 'imo', 'imho', 'cool', 'awesome'
    ],
    aiPhrases: [
      'it is important to note', 'it should be noted', 'in conclusion',
      'to summarize', 'in summary', 'as an ai', 'i cannot', 'i apologize',
      'it is worth mentioning', 'one might argue', 'it is essential',
      'it is crucial', 'it is vital', 'it is imperative',
      'in today\'s world', 'in this day and age', 'at the end of the day',
      'it goes without saying', 'needless to say', 'first and foremost',
      'last but not least', 'in light of', 'with that being said',
      'delve into', 'dive into', 'explore the', 'unpack the',
      'leverage', 'utilize', 'facilitate', 'implement'
    ],
    contractions: [
      "don't", "won't", "can't", "isn't", "aren't", "wasn't", "weren't",
      "i'm", "you're", "they're", "we're", "it's", "that's", "there's",
      "here's", "what's", "who's", "let's", "i've", "you've", "we've",
      "they've", "i'll", "you'll", "he'll", "she'll", "we'll", "they'll",
      "i'd", "you'd", "he'd", "she'd", "we'd", "they'd", "couldn't",
      "wouldn't", "shouldn't", "hasn't", "haven't", "hadn't"
    ]
  },

  // ============================================================================
  // VIETNAMESE
  // ============================================================================
  vi: {
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    direction: 'ltr',
    wordSeparator: ' ',
    syllableMethod: 'vietnamese',
    benchmarks: {
      blog: {
        avgWordLength: { min: 3.0, max: 4.5, ideal: 3.8 },
        avgSentenceLength: { min: 15, max: 25, ideal: 20 },
        readabilityScore: { min: 50, max: 75, ideal: 65 },
        vocabularyRichness: { min: 0.35, max: 0.6, ideal: 0.48 },
        punctuationRatio: { min: 0.04, max: 0.12, ideal: 0.08 }
      },
      academic: {
        avgWordLength: { min: 3.5, max: 5.0, ideal: 4.2 },
        avgSentenceLength: { min: 20, max: 35, ideal: 28 },
        readabilityScore: { min: 35, max: 55, ideal: 45 },
        vocabularyRichness: { min: 0.45, max: 0.75, ideal: 0.6 },
        punctuationRatio: { min: 0.06, max: 0.15, ideal: 0.1 }
      },
      casual: {
        avgWordLength: { min: 2.5, max: 4.0, ideal: 3.2 },
        avgSentenceLength: { min: 10, max: 18, ideal: 14 },
        readabilityScore: { min: 65, max: 85, ideal: 75 },
        vocabularyRichness: { min: 0.3, max: 0.55, ideal: 0.42 },
        punctuationRatio: { min: 0.03, max: 0.1, ideal: 0.06 }
      },
      professional: {
        avgWordLength: { min: 3.2, max: 4.8, ideal: 4.0 },
        avgSentenceLength: { min: 16, max: 26, ideal: 21 },
        readabilityScore: { min: 45, max: 65, ideal: 55 },
        vocabularyRichness: { min: 0.4, max: 0.65, ideal: 0.52 },
        punctuationRatio: { min: 0.05, max: 0.12, ideal: 0.08 }
      }
    },
    transitionWords: [
      // Addition
      'hơn nữa', 'ngoài ra', 'thêm vào đó', 'bên cạnh đó', 'cũng', 'đồng thời',
      'không chỉ', 'cũng như', 'thậm chí', 'đặc biệt', 'cụ thể',
      // Cause/Result
      'do đó', 'vì vậy', 'cho nên', 'kết quả là', 'bởi vì', 'vì',
      'dẫn đến', 'gây ra', 'nhờ', 'do', 'bởi',
      // Contrast
      'tuy nhiên', 'nhưng', 'song', 'vẫn', 'dù vậy', 'mặc dù',
      'dù', 'cho dù', 'bất chấp', 'ngược lại', 'trong khi',
      // Time/Sequence
      'đầu tiên', 'trước hết', 'ban đầu', 'thứ hai', 'thứ ba', 'tiếp theo',
      'sau đó', 'cuối cùng', 'kết luận', 'tóm lại', 'nhìn chung',
      // Condition
      'nếu', 'giả sử', 'trong trường hợp', 'miễn là', 'trừ khi',
      // Emphasis
      'thực ra', 'thực sự', 'trên thực tế', 'rõ ràng', 'hiển nhiên', 'chắc chắn'
    ],
    formalWords: [
      'thực hiện', 'tiến hành', 'chấm dứt', 'nỗ lực', 'tạo điều kiện',
      'theo đó', 'hơn nữa', 'tuy nhiên', 'bất chấp',
      'nói trên', 'từ nay', 'theo đó', 'trong đó', 'ở đây',
      'căn cứ', 'trước đây', 'do đó', 'theo đó', 'ngay lập tức'
    ],
    informalWords: [
      'ok', 'oke', 'okie', 'ờ', 'ừ', 'uh', 'ah',
      'vl', 'vcl', 'đm', 'clgt', 'wtf', 'lol', 'haha', 'hihi',
      'ngon', 'tuyệt', 'cool', 'xịn', 'chất'
    ],
    aiPhrases: [
      'điều quan trọng cần lưu ý', 'cần lưu ý rằng', 'kết luận',
      'tóm tắt', 'tóm lại', 'với tư cách là ai', 'tôi không thể',
      'đáng chú ý là', 'có thể lập luận rằng', 'điều cần thiết là',
      'điều quan trọng là', 'điều thiết yếu là', 'điều bắt buộc là',
      'trong thế giới ngày nay', 'trong thời đại này', 'cuối cùng thì',
      'không cần phải nói', 'trước hết', 'cuối cùng nhưng không kém phần quan trọng'
    ],
    contractions: [] // Vietnamese doesn't use contractions like English
  },

  // ============================================================================
  // CHINESE (Simplified)
  // ============================================================================
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    wordSeparator: '',
    syllableMethod: 'chinese',
    benchmarks: {
      blog: {
        avgWordLength: { min: 1.5, max: 2.5, ideal: 2.0 },
        avgSentenceLength: { min: 15, max: 30, ideal: 22 },
        readabilityScore: { min: 55, max: 75, ideal: 65 },
        vocabularyRichness: { min: 0.5, max: 0.8, ideal: 0.65 },
        punctuationRatio: { min: 0.06, max: 0.15, ideal: 0.1 }
      },
      academic: {
        avgWordLength: { min: 2.0, max: 3.0, ideal: 2.5 },
        avgSentenceLength: { min: 25, max: 45, ideal: 35 },
        readabilityScore: { min: 35, max: 55, ideal: 45 },
        vocabularyRichness: { min: 0.6, max: 0.85, ideal: 0.72 },
        punctuationRatio: { min: 0.08, max: 0.18, ideal: 0.12 }
      },
      casual: {
        avgWordLength: { min: 1.2, max: 2.0, ideal: 1.6 },
        avgSentenceLength: { min: 8, max: 20, ideal: 14 },
        readabilityScore: { min: 65, max: 85, ideal: 75 },
        vocabularyRichness: { min: 0.4, max: 0.7, ideal: 0.55 },
        punctuationRatio: { min: 0.04, max: 0.12, ideal: 0.08 }
      },
      professional: {
        avgWordLength: { min: 1.8, max: 2.8, ideal: 2.3 },
        avgSentenceLength: { min: 18, max: 35, ideal: 26 },
        readabilityScore: { min: 45, max: 65, ideal: 55 },
        vocabularyRichness: { min: 0.55, max: 0.8, ideal: 0.68 },
        punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
      }
    },
    transitionWords: [
      '此外', '另外', '而且', '同时', '不仅', '还有', '除此之外',
      '因此', '所以', '由于', '因为', '导致', '结果', '于是',
      '然而', '但是', '不过', '虽然', '尽管', '相反', '反之',
      '首先', '其次', '然后', '接着', '最后', '总之', '综上所述',
      '如果', '假如', '除非', '只要', '无论',
      '实际上', '事实上', '确实', '显然', '当然', '的确'
    ],
    formalWords: [
      '实施', '执行', '开展', '推进', '促进', '加强', '完善',
      '鉴于', '基于', '根据', '依据', '按照', '遵循',
      '综上所述', '由此可见', '不言而喻', '众所周知'
    ],
    informalWords: [
      '哈哈', '呵呵', '嘿嘿', '哎', '唉', '嗯', '啊',
      '牛', '厉害', '棒', '赞', '酷', '爽', '给力'
    ],
    aiPhrases: [
      '值得注意的是', '需要指出的是', '总而言之', '综上所述',
      '作为人工智能', '我无法', '我很抱歉',
      '在当今世界', '在这个时代', '归根结底',
      '不言而喻', '毋庸置疑', '首先', '最后但同样重要的是',
      '深入探讨', '全面分析', '系统阐述'
    ],
    contractions: []
  },

  // ============================================================================
  // JAPANESE
  // ============================================================================
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    wordSeparator: '',
    syllableMethod: 'japanese',
    benchmarks: {
      blog: {
        avgWordLength: { min: 2.0, max: 4.0, ideal: 3.0 },
        avgSentenceLength: { min: 20, max: 40, ideal: 30 },
        readabilityScore: { min: 50, max: 70, ideal: 60 },
        vocabularyRichness: { min: 0.45, max: 0.7, ideal: 0.58 },
        punctuationRatio: { min: 0.05, max: 0.12, ideal: 0.08 }
      },
      academic: {
        avgWordLength: { min: 3.0, max: 5.0, ideal: 4.0 },
        avgSentenceLength: { min: 30, max: 50, ideal: 40 },
        readabilityScore: { min: 35, max: 55, ideal: 45 },
        vocabularyRichness: { min: 0.55, max: 0.8, ideal: 0.68 },
        punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
      },
      casual: {
        avgWordLength: { min: 1.5, max: 3.0, ideal: 2.2 },
        avgSentenceLength: { min: 10, max: 25, ideal: 18 },
        readabilityScore: { min: 65, max: 85, ideal: 75 },
        vocabularyRichness: { min: 0.35, max: 0.6, ideal: 0.48 },
        punctuationRatio: { min: 0.03, max: 0.1, ideal: 0.06 }
      },
      professional: {
        avgWordLength: { min: 2.5, max: 4.5, ideal: 3.5 },
        avgSentenceLength: { min: 25, max: 45, ideal: 35 },
        readabilityScore: { min: 45, max: 65, ideal: 55 },
        vocabularyRichness: { min: 0.5, max: 0.75, ideal: 0.62 },
        punctuationRatio: { min: 0.05, max: 0.12, ideal: 0.08 }
      }
    },
    transitionWords: [
      'また', 'さらに', 'その上', '加えて', 'しかも', '同時に',
      'したがって', 'そのため', 'だから', 'よって', '結果として',
      'しかし', 'けれども', 'ただし', 'にもかかわらず', '一方で', '反対に',
      'まず', '次に', 'そして', 'それから', '最後に', '結論として', '要するに',
      'もし', '仮に', '場合は', 'ただし', 'でなければ',
      '実際', '確かに', '明らかに', '当然', '実は', '本当に'
    ],
    formalWords: [
      '実施する', '遂行する', '推進する', '促進する', '検討する',
      'において', 'に関して', 'に基づき', 'に従い', 'により',
      '前述の', '上記の', '下記の', '当該', '本件'
    ],
    informalWords: [
      'めっちゃ', 'すごい', 'やばい', 'マジ', 'ウケる',
      'www', '笑', 'ワロタ', 'なるほど', 'へー'
    ],
    aiPhrases: [
      '注目すべきは', '指摘すべきは', '結論として', '要約すると',
      'AIとして', '私にはできません', '申し訳ありません',
      '今日の世界では', 'この時代において', '結局のところ',
      '言うまでもなく', '何よりもまず', '最後になりましたが',
      '深く掘り下げる', '詳しく分析する', '包括的に検討する'
    ],
    contractions: []
  },

  // ============================================================================
  // KOREAN
  // ============================================================================
  ko: {
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    wordSeparator: ' ',
    syllableMethod: 'korean',
    benchmarks: {
      blog: {
        avgWordLength: { min: 2.5, max: 4.5, ideal: 3.5 },
        avgSentenceLength: { min: 12, max: 25, ideal: 18 },
        readabilityScore: { min: 55, max: 75, ideal: 65 },
        vocabularyRichness: { min: 0.45, max: 0.7, ideal: 0.58 },
        punctuationRatio: { min: 0.05, max: 0.12, ideal: 0.08 }
      },
      academic: {
        avgWordLength: { min: 3.5, max: 5.5, ideal: 4.5 },
        avgSentenceLength: { min: 18, max: 35, ideal: 26 },
        readabilityScore: { min: 35, max: 55, ideal: 45 },
        vocabularyRichness: { min: 0.55, max: 0.8, ideal: 0.68 },
        punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
      },
      casual: {
        avgWordLength: { min: 2.0, max: 3.5, ideal: 2.8 },
        avgSentenceLength: { min: 8, max: 18, ideal: 12 },
        readabilityScore: { min: 65, max: 85, ideal: 75 },
        vocabularyRichness: { min: 0.35, max: 0.6, ideal: 0.48 },
        punctuationRatio: { min: 0.03, max: 0.1, ideal: 0.06 }
      },
      professional: {
        avgWordLength: { min: 3.0, max: 5.0, ideal: 4.0 },
        avgSentenceLength: { min: 14, max: 28, ideal: 20 },
        readabilityScore: { min: 45, max: 65, ideal: 55 },
        vocabularyRichness: { min: 0.5, max: 0.75, ideal: 0.62 },
        punctuationRatio: { min: 0.05, max: 0.12, ideal: 0.08 }
      }
    },
    transitionWords: [
      '또한', '게다가', '더불어', '아울러', '뿐만 아니라', '동시에',
      '따라서', '그러므로', '그래서', '때문에', '결과적으로', '이로 인해',
      '그러나', '하지만', '반면에', '그럼에도', '비록', '오히려',
      '먼저', '첫째', '둘째', '다음으로', '마지막으로', '결론적으로', '요약하면',
      '만약', '가령', '경우에', '단', '아니면',
      '사실', '실제로', '분명히', '확실히', '물론', '정말로'
    ],
    formalWords: [
      '실시하다', '수행하다', '추진하다', '촉진하다', '검토하다',
      '에 있어서', '에 관하여', '에 따라', '에 의거하여', '로 인하여',
      '상기', '하기', '해당', '본', '당'
    ],
    informalWords: [
      '대박', '짱', '쩐다', '헐', '완전', '진짜',
      'ㅋㅋ', 'ㅎㅎ', 'ㅠㅠ', 'ㄷㄷ', '굿', '오케이'
    ],
    aiPhrases: [
      '주목할 점은', '지적해야 할 것은', '결론적으로', '요약하자면',
      'AI로서', '저는 할 수 없습니다', '죄송합니다',
      '오늘날의 세계에서', '이 시대에', '결국',
      '말할 필요도 없이', '무엇보다도', '마지막으로 중요한 것은',
      '깊이 파고들다', '자세히 분석하다', '포괄적으로 검토하다'
    ],
    contractions: []
  },

  // ============================================================================
  // FRENCH
  // ============================================================================
  fr: {
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    wordSeparator: ' ',
    syllableMethod: 'french',
    benchmarks: {
      blog: {
        avgWordLength: { min: 4.2, max: 5.8, ideal: 5.0 },
        avgSentenceLength: { min: 14, max: 24, ideal: 18 },
        readabilityScore: { min: 55, max: 75, ideal: 65 },
        vocabularyRichness: { min: 0.42, max: 0.68, ideal: 0.55 },
        punctuationRatio: { min: 0.06, max: 0.16, ideal: 0.11 }
      },
      academic: {
        avgWordLength: { min: 5.2, max: 7.2, ideal: 6.0 },
        avgSentenceLength: { min: 20, max: 35, ideal: 26 },
        readabilityScore: { min: 30, max: 50, ideal: 40 },
        vocabularyRichness: { min: 0.52, max: 0.8, ideal: 0.66 },
        punctuationRatio: { min: 0.08, max: 0.18, ideal: 0.13 }
      },
      casual: {
        avgWordLength: { min: 3.8, max: 5.2, ideal: 4.5 },
        avgSentenceLength: { min: 10, max: 18, ideal: 14 },
        readabilityScore: { min: 65, max: 85, ideal: 75 },
        vocabularyRichness: { min: 0.35, max: 0.58, ideal: 0.46 },
        punctuationRatio: { min: 0.04, max: 0.12, ideal: 0.08 }
      },
      professional: {
        avgWordLength: { min: 4.8, max: 6.5, ideal: 5.5 },
        avgSentenceLength: { min: 16, max: 26, ideal: 20 },
        readabilityScore: { min: 45, max: 65, ideal: 55 },
        vocabularyRichness: { min: 0.48, max: 0.72, ideal: 0.6 },
        punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
      }
    },
    transitionWords: [
      'de plus', 'en outre', 'également', 'aussi', 'par ailleurs', 'en même temps',
      'donc', 'ainsi', 'par conséquent', 'c\'est pourquoi', 'en raison de', 'grâce à',
      'cependant', 'mais', 'néanmoins', 'toutefois', 'bien que', 'malgré', 'en revanche',
      'd\'abord', 'premièrement', 'ensuite', 'puis', 'enfin', 'en conclusion', 'en résumé',
      'si', 'à condition que', 'pourvu que', 'à moins que', 'dans le cas où',
      'en fait', 'effectivement', 'vraiment', 'clairement', 'évidemment', 'certainement'
    ],
    formalWords: [
      'effectuer', 'réaliser', 'mettre en œuvre', 'procéder', 'entreprendre',
      'conformément', 'en vertu de', 'eu égard à', 'nonobstant', 'susmentionné',
      'ci-dessus', 'ci-après', 'ledit', 'ladite', 'auxquels'
    ],
    informalWords: [
      'super', 'génial', 'cool', 'sympa', 'top', 'nickel',
      'mdr', 'lol', 'ptdr', 'trop', 'grave', 'carrément', 'vachement'
    ],
    aiPhrases: [
      'il est important de noter', 'il convient de souligner', 'en conclusion',
      'pour résumer', 'en résumé', 'en tant qu\'IA', 'je ne peux pas', 'je m\'excuse',
      'dans le monde d\'aujourd\'hui', 'à notre époque', 'en fin de compte',
      'il va sans dire', 'avant tout', 'dernier point mais non des moindres',
      'approfondir', 'explorer', 'analyser en détail'
    ],
    contractions: ["j'", "l'", "d'", "n'", "c'", "s'", "qu'", "m'", "t'"]
  },

  // ============================================================================
  // GERMAN
  // ============================================================================
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    wordSeparator: ' ',
    syllableMethod: 'german',
    benchmarks: {
      blog: {
        avgWordLength: { min: 5.0, max: 7.0, ideal: 6.0 },
        avgSentenceLength: { min: 12, max: 22, ideal: 16 },
        readabilityScore: { min: 50, max: 70, ideal: 60 },
        vocabularyRichness: { min: 0.45, max: 0.72, ideal: 0.58 },
        punctuationRatio: { min: 0.06, max: 0.15, ideal: 0.1 }
      },
      academic: {
        avgWordLength: { min: 6.0, max: 8.5, ideal: 7.0 },
        avgSentenceLength: { min: 18, max: 32, ideal: 24 },
        readabilityScore: { min: 30, max: 50, ideal: 40 },
        vocabularyRichness: { min: 0.55, max: 0.82, ideal: 0.68 },
        punctuationRatio: { min: 0.08, max: 0.18, ideal: 0.12 }
      },
      casual: {
        avgWordLength: { min: 4.5, max: 6.0, ideal: 5.2 },
        avgSentenceLength: { min: 8, max: 16, ideal: 12 },
        readabilityScore: { min: 60, max: 80, ideal: 70 },
        vocabularyRichness: { min: 0.38, max: 0.62, ideal: 0.5 },
        punctuationRatio: { min: 0.04, max: 0.12, ideal: 0.08 }
      },
      professional: {
        avgWordLength: { min: 5.5, max: 7.5, ideal: 6.5 },
        avgSentenceLength: { min: 14, max: 24, ideal: 18 },
        readabilityScore: { min: 40, max: 60, ideal: 50 },
        vocabularyRichness: { min: 0.5, max: 0.75, ideal: 0.62 },
        punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
      }
    },
    transitionWords: [
      'außerdem', 'darüber hinaus', 'zusätzlich', 'ebenfalls', 'auch', 'gleichzeitig',
      'daher', 'deshalb', 'folglich', 'infolgedessen', 'weil', 'da', 'aufgrund',
      'jedoch', 'aber', 'dennoch', 'trotzdem', 'obwohl', 'hingegen', 'andererseits',
      'erstens', 'zunächst', 'zweitens', 'dann', 'schließlich', 'zusammenfassend', 'abschließend',
      'wenn', 'falls', 'sofern', 'es sei denn', 'vorausgesetzt',
      'tatsächlich', 'eigentlich', 'wirklich', 'offensichtlich', 'natürlich', 'sicherlich'
    ],
    formalWords: [
      'durchführen', 'umsetzen', 'implementieren', 'realisieren', 'vollziehen',
      'gemäß', 'entsprechend', 'hinsichtlich', 'bezüglich', 'betreffend',
      'oben genannt', 'nachstehend', 'diesbezüglich', 'hiermit', 'dementsprechend'
    ],
    informalWords: [
      'cool', 'geil', 'krass', 'mega', 'hammer', 'super',
      'lol', 'haha', 'echt', 'voll', 'total', 'ey', 'alter'
    ],
    aiPhrases: [
      'es ist wichtig zu beachten', 'es sollte beachtet werden', 'zusammenfassend',
      'um zusammenzufassen', 'als KI', 'ich kann nicht', 'ich entschuldige mich',
      'in der heutigen Welt', 'in dieser Zeit', 'letztendlich',
      'es versteht sich von selbst', 'vor allem', 'nicht zuletzt',
      'vertiefen', 'eingehend analysieren', 'umfassend untersuchen'
    ],
    contractions: []
  },

  // ============================================================================
  // SPANISH
  // ============================================================================
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    wordSeparator: ' ',
    syllableMethod: 'spanish',
    benchmarks: {
      blog: {
        avgWordLength: { min: 4.5, max: 6.0, ideal: 5.2 },
        avgSentenceLength: { min: 14, max: 24, ideal: 18 },
        readabilityScore: { min: 55, max: 75, ideal: 65 },
        vocabularyRichness: { min: 0.42, max: 0.68, ideal: 0.55 },
        punctuationRatio: { min: 0.06, max: 0.16, ideal: 0.11 }
      },
      academic: {
        avgWordLength: { min: 5.5, max: 7.5, ideal: 6.2 },
        avgSentenceLength: { min: 20, max: 35, ideal: 26 },
        readabilityScore: { min: 30, max: 50, ideal: 40 },
        vocabularyRichness: { min: 0.52, max: 0.8, ideal: 0.66 },
        punctuationRatio: { min: 0.08, max: 0.18, ideal: 0.13 }
      },
      casual: {
        avgWordLength: { min: 4.0, max: 5.5, ideal: 4.8 },
        avgSentenceLength: { min: 10, max: 18, ideal: 14 },
        readabilityScore: { min: 65, max: 85, ideal: 75 },
        vocabularyRichness: { min: 0.35, max: 0.58, ideal: 0.46 },
        punctuationRatio: { min: 0.04, max: 0.12, ideal: 0.08 }
      },
      professional: {
        avgWordLength: { min: 5.0, max: 6.8, ideal: 5.8 },
        avgSentenceLength: { min: 16, max: 26, ideal: 20 },
        readabilityScore: { min: 45, max: 65, ideal: 55 },
        vocabularyRichness: { min: 0.48, max: 0.72, ideal: 0.6 },
        punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
      }
    },
    transitionWords: [
      'además', 'asimismo', 'también', 'igualmente', 'por otra parte', 'al mismo tiempo',
      'por lo tanto', 'por consiguiente', 'así que', 'debido a', 'gracias a', 'como resultado',
      'sin embargo', 'pero', 'no obstante', 'aunque', 'a pesar de', 'en cambio', 'por el contrario',
      'primero', 'en primer lugar', 'luego', 'después', 'finalmente', 'en conclusión', 'en resumen',
      'si', 'en caso de', 'siempre que', 'a menos que', 'con tal de que',
      'de hecho', 'en realidad', 'realmente', 'claramente', 'obviamente', 'ciertamente'
    ],
    formalWords: [
      'realizar', 'efectuar', 'implementar', 'ejecutar', 'llevar a cabo',
      'conforme a', 'de acuerdo con', 'en virtud de', 'respecto a', 'en relación con',
      'anteriormente mencionado', 'susodicho', 'antedicho', 'el cual', 'la cual'
    ],
    informalWords: [
      'genial', 'guay', 'mola', 'flipar', 'currar', 'tío', 'tía',
      'jaja', 'jeje', 'lol', 'vale', 'bueno', 'pues', 'oye'
    ],
    aiPhrases: [
      'es importante señalar', 'cabe destacar', 'en conclusión',
      'para resumir', 'en resumen', 'como IA', 'no puedo', 'me disculpo',
      'en el mundo actual', 'en esta época', 'al final del día',
      'no hace falta decir', 'ante todo', 'por último pero no menos importante',
      'profundizar en', 'explorar', 'analizar en detalle'
    ],
    contractions: ['al', 'del']
  },

  // ============================================================================
  // PORTUGUESE
  // ============================================================================
  pt: {
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    wordSeparator: ' ',
    syllableMethod: 'portuguese',
    benchmarks: {
      blog: {
        avgWordLength: { min: 4.3, max: 5.8, ideal: 5.0 },
        avgSentenceLength: { min: 14, max: 24, ideal: 18 },
        readabilityScore: { min: 55, max: 75, ideal: 65 },
        vocabularyRichness: { min: 0.42, max: 0.68, ideal: 0.55 },
        punctuationRatio: { min: 0.06, max: 0.16, ideal: 0.11 }
      },
      academic: {
        avgWordLength: { min: 5.3, max: 7.3, ideal: 6.0 },
        avgSentenceLength: { min: 20, max: 35, ideal: 26 },
        readabilityScore: { min: 30, max: 50, ideal: 40 },
        vocabularyRichness: { min: 0.52, max: 0.8, ideal: 0.66 },
        punctuationRatio: { min: 0.08, max: 0.18, ideal: 0.13 }
      },
      casual: {
        avgWordLength: { min: 3.8, max: 5.2, ideal: 4.5 },
        avgSentenceLength: { min: 10, max: 18, ideal: 14 },
        readabilityScore: { min: 65, max: 85, ideal: 75 },
        vocabularyRichness: { min: 0.35, max: 0.58, ideal: 0.46 },
        punctuationRatio: { min: 0.04, max: 0.12, ideal: 0.08 }
      },
      professional: {
        avgWordLength: { min: 4.8, max: 6.5, ideal: 5.5 },
        avgSentenceLength: { min: 16, max: 26, ideal: 20 },
        readabilityScore: { min: 45, max: 65, ideal: 55 },
        vocabularyRichness: { min: 0.48, max: 0.72, ideal: 0.6 },
        punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
      }
    },
    transitionWords: [
      'além disso', 'ademais', 'também', 'igualmente', 'por outro lado', 'ao mesmo tempo',
      'portanto', 'por conseguinte', 'assim', 'devido a', 'graças a', 'como resultado',
      'no entanto', 'mas', 'contudo', 'embora', 'apesar de', 'em contrapartida', 'pelo contrário',
      'primeiro', 'em primeiro lugar', 'depois', 'em seguida', 'finalmente', 'em conclusão', 'em resumo',
      'se', 'caso', 'desde que', 'a menos que', 'contanto que',
      'de fato', 'na verdade', 'realmente', 'claramente', 'obviamente', 'certamente'
    ],
    formalWords: [
      'realizar', 'efetuar', 'implementar', 'executar', 'proceder',
      'conforme', 'de acordo com', 'em virtude de', 'relativamente a', 'no que diz respeito a',
      'supracitado', 'supramencionado', 'ora em apreço', 'o qual', 'a qual'
    ],
    informalWords: [
      'legal', 'bacana', 'massa', 'show', 'top', 'maneiro',
      'kkkk', 'rsrs', 'haha', 'né', 'tipo', 'cara', 'mano'
    ],
    aiPhrases: [
      'é importante notar', 'vale ressaltar', 'em conclusão',
      'para resumir', 'em resumo', 'como IA', 'não posso', 'peço desculpas',
      'no mundo atual', 'nesta época', 'no final das contas',
      'escusado será dizer', 'antes de mais nada', 'por último mas não menos importante',
      'aprofundar', 'explorar', 'analisar em detalhe'
    ],
    contractions: ['do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'pelo', 'pela']
  },

  // ============================================================================
  // ITALIAN
  // ============================================================================
  it: {
    name: 'Italian',
    nativeName: 'Italiano',
    direction: 'ltr',
    wordSeparator: ' ',
    syllableMethod: 'italian',
    benchmarks: {
      blog: {
        avgWordLength: { min: 4.5, max: 6.2, ideal: 5.3 },
        avgSentenceLength: { min: 14, max: 24, ideal: 18 },
        readabilityScore: { min: 55, max: 75, ideal: 65 },
        vocabularyRichness: { min: 0.42, max: 0.68, ideal: 0.55 },
        punctuationRatio: { min: 0.06, max: 0.16, ideal: 0.11 }
      },
      academic: {
        avgWordLength: { min: 5.5, max: 7.5, ideal: 6.2 },
        avgSentenceLength: { min: 20, max: 35, ideal: 26 },
        readabilityScore: { min: 30, max: 50, ideal: 40 },
        vocabularyRichness: { min: 0.52, max: 0.8, ideal: 0.66 },
        punctuationRatio: { min: 0.08, max: 0.18, ideal: 0.13 }
      },
      casual: {
        avgWordLength: { min: 4.0, max: 5.5, ideal: 4.8 },
        avgSentenceLength: { min: 10, max: 18, ideal: 14 },
        readabilityScore: { min: 65, max: 85, ideal: 75 },
        vocabularyRichness: { min: 0.35, max: 0.58, ideal: 0.46 },
        punctuationRatio: { min: 0.04, max: 0.12, ideal: 0.08 }
      },
      professional: {
        avgWordLength: { min: 5.0, max: 6.8, ideal: 5.8 },
        avgSentenceLength: { min: 16, max: 26, ideal: 20 },
        readabilityScore: { min: 45, max: 65, ideal: 55 },
        vocabularyRichness: { min: 0.48, max: 0.72, ideal: 0.6 },
        punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
      }
    },
    transitionWords: [
      'inoltre', 'per di più', 'anche', 'ugualmente', 'd\'altra parte', 'allo stesso tempo',
      'quindi', 'perciò', 'di conseguenza', 'a causa di', 'grazie a', 'come risultato',
      'tuttavia', 'ma', 'però', 'nonostante', 'sebbene', 'al contrario', 'invece',
      'prima', 'in primo luogo', 'poi', 'dopo', 'infine', 'in conclusione', 'in sintesi',
      'se', 'nel caso in cui', 'a condizione che', 'a meno che', 'purché',
      'infatti', 'in realtà', 'davvero', 'chiaramente', 'ovviamente', 'certamente'
    ],
    formalWords: [
      'effettuare', 'realizzare', 'implementare', 'eseguire', 'procedere',
      'conformemente', 'in base a', 'in virtù di', 'relativamente a', 'per quanto riguarda',
      'suddetto', 'summenzionato', 'sopracitato', 'il quale', 'la quale'
    ],
    informalWords: [
      'figo', 'forte', 'ganzo', 'mitico', 'top', 'super',
      'ahah', 'lol', 'boh', 'cioè', 'tipo', 'dai', 'vabbè'
    ],
    aiPhrases: [
      'è importante notare', 'va sottolineato', 'in conclusione',
      'per riassumere', 'in sintesi', 'come IA', 'non posso', 'mi scuso',
      'nel mondo di oggi', 'in quest\'epoca', 'alla fine dei conti',
      'va da sé', 'prima di tutto', 'ultimo ma non meno importante',
      'approfondire', 'esplorare', 'analizzare in dettaglio'
    ],
    contractions: ["l'", "d'", "un'", "dell'", "all'", "nell'", "sull'"]
  },

  // ============================================================================
  // RUSSIAN
  // ============================================================================
  ru: {
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    wordSeparator: ' ',
    syllableMethod: 'russian',
    benchmarks: {
      blog: {
        avgWordLength: { min: 5.0, max: 7.0, ideal: 6.0 },
        avgSentenceLength: { min: 12, max: 22, ideal: 16 },
        readabilityScore: { min: 50, max: 70, ideal: 60 },
        vocabularyRichness: { min: 0.48, max: 0.75, ideal: 0.62 },
        punctuationRatio: { min: 0.06, max: 0.15, ideal: 0.1 }
      },
      academic: {
        avgWordLength: { min: 6.0, max: 8.5, ideal: 7.0 },
        avgSentenceLength: { min: 18, max: 32, ideal: 24 },
        readabilityScore: { min: 30, max: 50, ideal: 40 },
        vocabularyRichness: { min: 0.58, max: 0.85, ideal: 0.72 },
        punctuationRatio: { min: 0.08, max: 0.18, ideal: 0.12 }
      },
      casual: {
        avgWordLength: { min: 4.5, max: 6.0, ideal: 5.2 },
        avgSentenceLength: { min: 8, max: 16, ideal: 12 },
        readabilityScore: { min: 60, max: 80, ideal: 70 },
        vocabularyRichness: { min: 0.4, max: 0.65, ideal: 0.52 },
        punctuationRatio: { min: 0.04, max: 0.12, ideal: 0.08 }
      },
      professional: {
        avgWordLength: { min: 5.5, max: 7.5, ideal: 6.5 },
        avgSentenceLength: { min: 14, max: 24, ideal: 18 },
        readabilityScore: { min: 40, max: 60, ideal: 50 },
        vocabularyRichness: { min: 0.52, max: 0.78, ideal: 0.65 },
        punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
      }
    },
    transitionWords: [
      'кроме того', 'более того', 'также', 'помимо этого', 'с другой стороны', 'одновременно',
      'поэтому', 'следовательно', 'таким образом', 'из-за', 'благодаря', 'в результате',
      'однако', 'но', 'тем не менее', 'хотя', 'несмотря на', 'напротив', 'наоборот',
      'во-первых', 'сначала', 'во-вторых', 'затем', 'наконец', 'в заключение', 'подводя итог',
      'если', 'в случае', 'при условии', 'если только не', 'при том что',
      'на самом деле', 'фактически', 'действительно', 'очевидно', 'конечно', 'безусловно'
    ],
    formalWords: [
      'осуществлять', 'реализовывать', 'выполнять', 'проводить', 'предпринимать',
      'в соответствии с', 'согласно', 'относительно', 'касательно', 'в отношении',
      'вышеупомянутый', 'нижеследующий', 'данный', 'настоящий', 'соответствующий'
    ],
    informalWords: [
      'круто', 'клёво', 'офигенно', 'прикольно', 'супер', 'класс',
      'ахах', 'лол', 'ну', 'типа', 'короче', 'блин', 'чё'
    ],
    aiPhrases: [
      'важно отметить', 'следует подчеркнуть', 'в заключение',
      'подводя итог', 'резюмируя', 'как ИИ', 'я не могу', 'приношу извинения',
      'в современном мире', 'в наше время', 'в конечном счёте',
      'само собой разумеется', 'прежде всего', 'последнее но не менее важное',
      'углубиться', 'исследовать', 'детально проанализировать'
    ],
    contractions: []
  },

  // ============================================================================
  // ARABIC
  // ============================================================================
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    wordSeparator: ' ',
    syllableMethod: 'arabic',
    benchmarks: {
      blog: {
        avgWordLength: { min: 4.0, max: 6.0, ideal: 5.0 },
        avgSentenceLength: { min: 12, max: 22, ideal: 16 },
        readabilityScore: { min: 50, max: 70, ideal: 60 },
        vocabularyRichness: { min: 0.5, max: 0.78, ideal: 0.64 },
        punctuationRatio: { min: 0.04, max: 0.12, ideal: 0.08 }
      },
      academic: {
        avgWordLength: { min: 5.0, max: 7.5, ideal: 6.0 },
        avgSentenceLength: { min: 18, max: 32, ideal: 24 },
        readabilityScore: { min: 30, max: 50, ideal: 40 },
        vocabularyRichness: { min: 0.6, max: 0.88, ideal: 0.74 },
        punctuationRatio: { min: 0.06, max: 0.14, ideal: 0.1 }
      },
      casual: {
        avgWordLength: { min: 3.5, max: 5.0, ideal: 4.2 },
        avgSentenceLength: { min: 8, max: 16, ideal: 12 },
        readabilityScore: { min: 60, max: 80, ideal: 70 },
        vocabularyRichness: { min: 0.42, max: 0.68, ideal: 0.55 },
        punctuationRatio: { min: 0.03, max: 0.1, ideal: 0.06 }
      },
      professional: {
        avgWordLength: { min: 4.5, max: 6.5, ideal: 5.5 },
        avgSentenceLength: { min: 14, max: 24, ideal: 18 },
        readabilityScore: { min: 40, max: 60, ideal: 50 },
        vocabularyRichness: { min: 0.55, max: 0.8, ideal: 0.68 },
        punctuationRatio: { min: 0.05, max: 0.12, ideal: 0.08 }
      }
    },
    transitionWords: [
      'بالإضافة إلى ذلك', 'علاوة على ذلك', 'أيضاً', 'كذلك', 'من ناحية أخرى', 'في الوقت نفسه',
      'لذلك', 'وبالتالي', 'نتيجة لذلك', 'بسبب', 'بفضل', 'مما أدى إلى',
      'ومع ذلك', 'لكن', 'غير أن', 'رغم أن', 'على الرغم من', 'بالعكس', 'على النقيض',
      'أولاً', 'في البداية', 'ثانياً', 'ثم', 'أخيراً', 'في الختام', 'باختصار',
      'إذا', 'في حالة', 'بشرط أن', 'ما لم', 'طالما',
      'في الواقع', 'حقيقة', 'فعلاً', 'بوضوح', 'بالطبع', 'بالتأكيد'
    ],
    formalWords: [
      'تنفيذ', 'إجراء', 'تطبيق', 'القيام بـ', 'الشروع في',
      'وفقاً لـ', 'بموجب', 'فيما يتعلق بـ', 'بخصوص', 'إزاء',
      'المذكور أعلاه', 'الآنف الذكر', 'المشار إليه', 'الحالي', 'المعني'
    ],
    informalWords: [
      'رائع', 'حلو', 'جميل', 'خطير', 'فظيع', 'عظيم',
      'هههه', 'لول', 'يعني', 'طيب', 'أوكي', 'يلا'
    ],
    aiPhrases: [
      'من المهم ملاحظة', 'تجدر الإشارة إلى', 'في الختام',
      'للتلخيص', 'باختصار', 'كذكاء اصطناعي', 'لا أستطيع', 'أعتذر',
      'في عالم اليوم', 'في هذا العصر', 'في نهاية المطاف',
      'غني عن القول', 'قبل كل شيء', 'أخيراً وليس آخراً',
      'التعمق في', 'استكشاف', 'تحليل بالتفصيل'
    ],
    contractions: []
  },

  // ============================================================================
  // THAI
  // ============================================================================
  th: {
    name: 'Thai',
    nativeName: 'ไทย',
    direction: 'ltr',
    wordSeparator: '',
    syllableMethod: 'thai',
    benchmarks: {
      blog: {
        avgWordLength: { min: 4.0, max: 7.0, ideal: 5.5 },
        avgSentenceLength: { min: 15, max: 30, ideal: 22 },
        readabilityScore: { min: 50, max: 70, ideal: 60 },
        vocabularyRichness: { min: 0.45, max: 0.72, ideal: 0.58 },
        punctuationRatio: { min: 0.02, max: 0.08, ideal: 0.05 }
      },
      academic: {
        avgWordLength: { min: 5.0, max: 8.0, ideal: 6.5 },
        avgSentenceLength: { min: 25, max: 45, ideal: 35 },
        readabilityScore: { min: 30, max: 50, ideal: 40 },
        vocabularyRichness: { min: 0.55, max: 0.82, ideal: 0.68 },
        punctuationRatio: { min: 0.03, max: 0.1, ideal: 0.06 }
      },
      casual: {
        avgWordLength: { min: 3.5, max: 6.0, ideal: 4.8 },
        avgSentenceLength: { min: 10, max: 22, ideal: 16 },
        readabilityScore: { min: 60, max: 80, ideal: 70 },
        vocabularyRichness: { min: 0.38, max: 0.62, ideal: 0.5 },
        punctuationRatio: { min: 0.01, max: 0.06, ideal: 0.03 }
      },
      professional: {
        avgWordLength: { min: 4.5, max: 7.5, ideal: 6.0 },
        avgSentenceLength: { min: 18, max: 35, ideal: 26 },
        readabilityScore: { min: 40, max: 60, ideal: 50 },
        vocabularyRichness: { min: 0.5, max: 0.75, ideal: 0.62 },
        punctuationRatio: { min: 0.02, max: 0.08, ideal: 0.05 }
      }
    },
    transitionWords: [
      'นอกจากนี้', 'ยิ่งไปกว่านั้น', 'เช่นกัน', 'อีกทั้ง', 'ในขณะเดียวกัน', 'พร้อมกัน',
      'ดังนั้น', 'เพราะฉะนั้น', 'จึง', 'เนื่องจาก', 'เพราะ', 'ส่งผลให้',
      'อย่างไรก็ตาม', 'แต่', 'ทว่า', 'แม้ว่า', 'ถึงแม้', 'ในทางตรงกันข้าม', 'กลับกัน',
      'ประการแรก', 'เริ่มแรก', 'ประการที่สอง', 'จากนั้น', 'สุดท้าย', 'โดยสรุป', 'กล่าวโดยสรุป',
      'ถ้า', 'หาก', 'ในกรณีที่', 'เว้นแต่', 'ตราบใดที่',
      'อันที่จริง', 'ความจริงแล้ว', 'จริงๆ แล้ว', 'อย่างชัดเจน', 'แน่นอน', 'อย่างแน่นอน'
    ],
    formalWords: [
      'ดำเนินการ', 'ปฏิบัติ', 'จัดทำ', 'ดำเนินงาน', 'ประกอบการ',
      'ตาม', 'โดยอาศัย', 'เกี่ยวกับ', 'ในส่วนของ', 'ในเรื่องของ',
      'ดังกล่าว', 'ข้างต้น', 'ที่กล่าวมา', 'ซึ่ง', 'อันเป็น'
    ],
    informalWords: [
      'เจ๋ง', 'โคตร', 'สุดยอด', 'เท่', 'แจ่ม', 'ดีมาก',
      '555', 'ฮ่าๆ', 'อิอิ', 'จ้า', 'ค่ะ', 'ครับ', 'อ่ะ'
    ],
    aiPhrases: [
      'สิ่งสำคัญที่ต้องทราบ', 'ควรสังเกตว่า', 'โดยสรุป',
      'สรุปได้ว่า', 'กล่าวโดยสรุป', 'ในฐานะ AI', 'ฉันไม่สามารถ', 'ขออภัย',
      'ในโลกปัจจุบัน', 'ในยุคนี้', 'ท้ายที่สุดแล้ว',
      'ไม่ต้องพูดถึง', 'ก่อนอื่น', 'สุดท้ายแต่ไม่ท้ายสุด',
      'เจาะลึก', 'สำรวจ', 'วิเคราะห์อย่างละเอียด'
    ],
    contractions: []
  },

  // ============================================================================
  // INDONESIAN
  // ============================================================================
  id: {
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    direction: 'ltr',
    wordSeparator: ' ',
    syllableMethod: 'indonesian',
    benchmarks: {
      blog: {
        avgWordLength: { min: 4.5, max: 6.5, ideal: 5.5 },
        avgSentenceLength: { min: 12, max: 22, ideal: 16 },
        readabilityScore: { min: 55, max: 75, ideal: 65 },
        vocabularyRichness: { min: 0.42, max: 0.68, ideal: 0.55 },
        punctuationRatio: { min: 0.05, max: 0.14, ideal: 0.09 }
      },
      academic: {
        avgWordLength: { min: 5.5, max: 8.0, ideal: 6.5 },
        avgSentenceLength: { min: 18, max: 32, ideal: 24 },
        readabilityScore: { min: 35, max: 55, ideal: 45 },
        vocabularyRichness: { min: 0.52, max: 0.8, ideal: 0.66 },
        punctuationRatio: { min: 0.06, max: 0.16, ideal: 0.11 }
      },
      casual: {
        avgWordLength: { min: 4.0, max: 5.5, ideal: 4.8 },
        avgSentenceLength: { min: 8, max: 16, ideal: 12 },
        readabilityScore: { min: 65, max: 85, ideal: 75 },
        vocabularyRichness: { min: 0.35, max: 0.58, ideal: 0.46 },
        punctuationRatio: { min: 0.03, max: 0.1, ideal: 0.06 }
      },
      professional: {
        avgWordLength: { min: 5.0, max: 7.0, ideal: 6.0 },
        avgSentenceLength: { min: 14, max: 24, ideal: 18 },
        readabilityScore: { min: 45, max: 65, ideal: 55 },
        vocabularyRichness: { min: 0.48, max: 0.72, ideal: 0.6 },
        punctuationRatio: { min: 0.05, max: 0.12, ideal: 0.08 }
      }
    },
    transitionWords: [
      'selain itu', 'di samping itu', 'juga', 'pula', 'sementara itu', 'bersamaan dengan',
      'oleh karena itu', 'maka', 'sehingga', 'karena', 'akibatnya', 'hasilnya',
      'namun', 'tetapi', 'akan tetapi', 'meskipun', 'walaupun', 'sebaliknya', 'di sisi lain',
      'pertama', 'pertama-tama', 'kedua', 'kemudian', 'akhirnya', 'kesimpulannya', 'singkatnya',
      'jika', 'apabila', 'seandainya', 'kecuali', 'asalkan',
      'sebenarnya', 'pada kenyataannya', 'memang', 'jelas', 'tentu saja', 'pasti'
    ],
    formalWords: [
      'melaksanakan', 'menjalankan', 'mengimplementasikan', 'melakukan', 'menyelenggarakan',
      'sesuai dengan', 'berdasarkan', 'mengenai', 'terkait dengan', 'sehubungan dengan',
      'tersebut di atas', 'yang dimaksud', 'sebagaimana', 'yang mana', 'adapun'
    ],
    informalWords: [
      'keren', 'mantap', 'asik', 'gokil', 'seru', 'oke banget',
      'wkwk', 'haha', 'lol', 'gue', 'lu', 'dong', 'sih'
    ],
    aiPhrases: [
      'penting untuk dicatat', 'perlu diperhatikan', 'kesimpulannya',
      'untuk meringkas', 'singkatnya', 'sebagai AI', 'saya tidak bisa', 'mohon maaf',
      'di dunia saat ini', 'di era ini', 'pada akhirnya',
      'tidak perlu dikatakan', 'pertama-tama', 'terakhir namun tidak kalah penting',
      'mendalami', 'mengeksplorasi', 'menganalisis secara detail'
    ],
    contractions: []
  },

  // ============================================================================
  // MALAY
  // ============================================================================
  ms: {
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    direction: 'ltr',
    wordSeparator: ' ',
    syllableMethod: 'malay',
    benchmarks: {
      blog: {
        avgWordLength: { min: 4.5, max: 6.5, ideal: 5.5 },
        avgSentenceLength: { min: 12, max: 22, ideal: 16 },
        readabilityScore: { min: 55, max: 75, ideal: 65 },
        vocabularyRichness: { min: 0.42, max: 0.68, ideal: 0.55 },
        punctuationRatio: { min: 0.05, max: 0.14, ideal: 0.09 }
      },
      academic: {
        avgWordLength: { min: 5.5, max: 8.0, ideal: 6.5 },
        avgSentenceLength: { min: 18, max: 32, ideal: 24 },
        readabilityScore: { min: 35, max: 55, ideal: 45 },
        vocabularyRichness: { min: 0.52, max: 0.8, ideal: 0.66 },
        punctuationRatio: { min: 0.06, max: 0.16, ideal: 0.11 }
      },
      casual: {
        avgWordLength: { min: 4.0, max: 5.5, ideal: 4.8 },
        avgSentenceLength: { min: 8, max: 16, ideal: 12 },
        readabilityScore: { min: 65, max: 85, ideal: 75 },
        vocabularyRichness: { min: 0.35, max: 0.58, ideal: 0.46 },
        punctuationRatio: { min: 0.03, max: 0.1, ideal: 0.06 }
      },
      professional: {
        avgWordLength: { min: 5.0, max: 7.0, ideal: 6.0 },
        avgSentenceLength: { min: 14, max: 24, ideal: 18 },
        readabilityScore: { min: 45, max: 65, ideal: 55 },
        vocabularyRichness: { min: 0.48, max: 0.72, ideal: 0.6 },
        punctuationRatio: { min: 0.05, max: 0.12, ideal: 0.08 }
      }
    },
    transitionWords: [
      'selain itu', 'tambahan pula', 'juga', 'serta', 'dalam masa yang sama', 'serentak',
      'oleh itu', 'maka', 'justeru', 'kerana', 'akibatnya', 'hasilnya',
      'walau bagaimanapun', 'tetapi', 'namun', 'walaupun', 'meskipun', 'sebaliknya', 'di sebelah lain',
      'pertama', 'pertama sekali', 'kedua', 'kemudian', 'akhirnya', 'kesimpulannya', 'ringkasnya',
      'jika', 'sekiranya', 'andainya', 'kecuali', 'asalkan',
      'sebenarnya', 'hakikatnya', 'memang', 'jelas', 'sudah tentu', 'pasti'
    ],
    formalWords: [
      'melaksanakan', 'menjalankan', 'mengimplementasikan', 'melakukan', 'menyelenggarakan',
      'selaras dengan', 'berdasarkan', 'mengenai', 'berkaitan dengan', 'berhubung dengan',
      'tersebut di atas', 'yang dimaksudkan', 'sebagaimana', 'yang mana', 'adapun'
    ],
    informalWords: [
      'best', 'power', 'gempak', 'syok', 'cool', 'okay',
      'haha', 'lol', 'kan', 'lah', 'kot', 'je', 'tau'
    ],
    aiPhrases: [
      'penting untuk diambil perhatian', 'perlu dinyatakan', 'kesimpulannya',
      'untuk merumuskan', 'ringkasnya', 'sebagai AI', 'saya tidak boleh', 'mohon maaf',
      'dalam dunia hari ini', 'pada zaman ini', 'akhirnya',
      'tidak perlu dinyatakan', 'pertama sekali', 'akhir sekali tetapi tidak kurang penting',
      'mendalami', 'meneroka', 'menganalisis secara terperinci'
    ],
    contractions: []
  }
};

// Default config for unsupported languages (fallback to English)
const DEFAULT_CONFIG = LANGUAGE_CONFIGS.en;

// ============================================================================
// LANGUAGE PROCESSOR CLASS
// ============================================================================

class LanguageProcessorService {
  constructor() {
    this.configs = LANGUAGE_CONFIGS;
    this.defaultLang = 'en';
  }

  /**
   * Get configuration for a language
   * @param {string} lang - Language code
   * @returns {Object} - Language configuration
   */
  getConfig(lang) {
    return this.configs[lang] || DEFAULT_CONFIG;
  }

  /**
   * Get benchmarks for a language and style
   * @param {string} lang - Language code
   * @param {string} styleType - Style type (blog, academic, casual, professional)
   * @returns {Object} - Benchmark values
   */
  getBenchmarks(lang, styleType = 'blog') {
    const config = this.getConfig(lang);
    return config.benchmarks[styleType] || config.benchmarks.blog;
  }

  /**
   * Get transition words for a language
   * @param {string} lang - Language code
   * @returns {Array<string>} - List of transition words
   */
  getTransitionWords(lang) {
    const config = this.getConfig(lang);
    return config.transitionWords || [];
  }

  /**
   * Get formal words for a language
   * @param {string} lang - Language code
   * @returns {Array<string>} - List of formal words
   */
  getFormalWords(lang) {
    const config = this.getConfig(lang);
    return config.formalWords || [];
  }

  /**
   * Get informal words for a language
   * @param {string} lang - Language code
   * @returns {Array<string>} - List of informal words
   */
  getInformalWords(lang) {
    const config = this.getConfig(lang);
    return config.informalWords || [];
  }

  /**
   * Get AI-typical phrases for a language
   * @param {string} lang - Language code
   * @returns {Array<string>} - List of AI phrases
   */
  getAIPhrases(lang) {
    const config = this.getConfig(lang);
    return config.aiPhrases || [];
  }

  /**
   * Get contractions for a language
   * @param {string} lang - Language code
   * @returns {Array<string>} - List of contractions
   */
  getContractions(lang) {
    const config = this.getConfig(lang);
    return config.contractions || [];
  }

  /**
   * Tokenize text based on language
   * @param {string} text - Text to tokenize
   * @param {string} lang - Language code
   * @returns {Array<string>} - Array of tokens/words
   */
  tokenize(text, lang) {
    const config = this.getConfig(lang);
    
    // Vietnamese: split by spaces (each syllable is a word)
    if (lang === 'vi') {
      return text.split(/\s+/).filter(w => w.length > 0);
    }
    
    // Chinese: split by characters (simplified approach)
    if (lang === 'zh') {
      return text.replace(/[^\u4e00-\u9fff]/g, ' ').split('').filter(c => c.trim().length > 0);
    }
    
    // Japanese: split by characters (simplified approach for mixed scripts)
    if (lang === 'ja') {
      // Split on word boundaries, keeping kanji/kana together
      return text.split(/[\s、。！？「」『』（）\[\]]+/).filter(w => w.length > 0);
    }
    
    // Korean: split by spaces (Korean uses spaces between words)
    if (lang === 'ko') {
      return text.split(/\s+/).filter(w => w.length > 0);
    }
    
    // Thai: split by spaces (Thai doesn't traditionally use spaces, but modern Thai often does)
    if (lang === 'th') {
      // Simple approach: split on spaces and common punctuation
      return text.split(/[\s\u0E2F\u0E5A\u0E5B]+/).filter(w => w.length > 0);
    }
    
    // Arabic: split by spaces
    if (lang === 'ar') {
      return text.split(/\s+/).filter(w => w.length > 0);
    }
    
    // Russian: split by spaces
    if (lang === 'ru') {
      return text.split(/\s+/).filter(w => w.length > 0);
    }
    
    // Indonesian/Malay: split by spaces
    if (lang === 'id' || lang === 'ms') {
      return text.split(/\s+/).filter(w => w.length > 0);
    }
    
    // European languages (fr, de, es, pt, it): use wink-nlp tokenizer
    return nlpUtils.tokenize(text.toLowerCase());
  }

  /**
   * Count syllables based on language
   * @param {string} text - Text to analyze
   * @param {string} lang - Language code
   * @returns {number} - Syllable count
   */
  countSyllables(text, lang) {
    const config = this.getConfig(lang);
    const method = config.syllableMethod;
    
    // Vietnamese: each word is typically 1 syllable
    if (method === 'vietnamese') {
      return text.split(/\s+/).filter(w => w.length > 0).length;
    }
    
    // Chinese: each character is typically 1 syllable
    if (method === 'chinese') {
      return (text.match(/[\u4e00-\u9fff]/g) || []).length;
    }
    
    // Japanese: approximate syllables from mora count
    if (method === 'japanese') {
      const hiragana = (text.match(/[\u3040-\u309f]/g) || []).length;
      const katakana = (text.match(/[\u30a0-\u30ff]/g) || []).length;
      const kanji = (text.match(/[\u4e00-\u9fff]/g) || []).length * 2; // Kanji avg 2 mora
      return hiragana + katakana + kanji;
    }
    
    // Korean: count syllable blocks
    if (method === 'korean') {
      return (text.match(/[\uac00-\ud7af]/g) || []).length;
    }
    
    // Thai: approximate by character count (Thai syllables are complex)
    if (method === 'thai') {
      return Math.ceil((text.match(/[\u0e00-\u0e7f]/g) || []).length / 2);
    }
    
    // Arabic: approximate by word count * 2.5 (average syllables per word)
    if (method === 'arabic') {
      const words = text.split(/\s+/).filter(w => w.length > 0);
      return Math.ceil(words.length * 2.5);
    }
    
    // Russian: count vowels as syllables
    if (method === 'russian') {
      return (text.match(/[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/g) || []).length;
    }
    
    // Romance languages (French, Spanish, Portuguese, Italian): count vowel groups
    if (['french', 'spanish', 'portuguese', 'italian'].includes(method)) {
      const words = this.tokenize(text, lang);
      return words.reduce((sum, word) => {
        const vowels = word.match(/[aeiouyàâäéèêëïîôùûüœæáéíóúüñãõ]+/gi) || [];
        return sum + Math.max(1, vowels.length);
      }, 0);
    }
    
    // German: count vowel groups
    if (method === 'german') {
      const words = this.tokenize(text, lang);
      return words.reduce((sum, word) => {
        const vowels = word.match(/[aeiouyäöü]+/gi) || [];
        return sum + Math.max(1, vowels.length);
      }, 0);
    }
    
    // Indonesian/Malay: count vowel groups
    if (['indonesian', 'malay'].includes(method)) {
      const words = this.tokenize(text, lang);
      return words.reduce((sum, word) => {
        const vowels = word.match(/[aeiou]+/gi) || [];
        return sum + Math.max(1, vowels.length);
      }, 0);
    }
    
    // Default: English syllable counting
    const words = this.tokenize(text, lang);
    return words.reduce((sum, word) => sum + this.countEnglishSyllables(word), 0);
  }

  /**
   * Count syllables in an English word
   * @param {string} word - Word to analyze
   * @returns {number} - Syllable count
   */
  countEnglishSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  }

  /**
   * Calculate readability score based on language
   * @param {number} wordCount - Total words
   * @param {number} sentenceCount - Total sentences
   * @param {number} syllableCount - Total syllables (for English)
   * @param {number} avgSentenceLength - Average sentence length
   * @param {number} avgWordLength - Average word length
   * @param {string} lang - Language code
   * @returns {number} - Readability score (0-100)
   */
  calculateReadability(wordCount, sentenceCount, syllableCount, avgSentenceLength, avgWordLength, lang) {
    if (sentenceCount === 0 || wordCount === 0) return 0;
    
    const config = this.getConfig(lang);
    const method = config.syllableMethod;
    
    // Vietnamese readability formula
    if (method === 'vietnamese') {
      const sentencePenalty = Math.max(0, (avgSentenceLength - 15) * 2);
      const wordPenalty = Math.max(0, (avgWordLength - 3.5) * 10);
      const score = 100 - sentencePenalty - wordPenalty;
      return Math.max(0, Math.min(100, score));
    }
    
    // Chinese readability (based on sentence length and character complexity)
    if (method === 'chinese') {
      const sentencePenalty = Math.max(0, (avgSentenceLength - 20) * 1.5);
      const score = 100 - sentencePenalty;
      return Math.max(0, Math.min(100, score));
    }
    
    // Japanese readability
    if (method === 'japanese') {
      const sentencePenalty = Math.max(0, (avgSentenceLength - 25) * 1.5);
      const score = 100 - sentencePenalty;
      return Math.max(0, Math.min(100, score));
    }
    
    // Korean readability
    if (method === 'korean') {
      const sentencePenalty = Math.max(0, (avgSentenceLength - 15) * 2);
      const wordPenalty = Math.max(0, (avgWordLength - 3.5) * 8);
      const score = 100 - sentencePenalty - wordPenalty;
      return Math.max(0, Math.min(100, score));
    }
    
    // Arabic readability
    if (method === 'arabic') {
      const sentencePenalty = Math.max(0, (avgSentenceLength - 15) * 2);
      const wordPenalty = Math.max(0, (avgWordLength - 5) * 8);
      const score = 100 - sentencePenalty - wordPenalty;
      return Math.max(0, Math.min(100, score));
    }
    
    // Thai readability
    if (method === 'thai') {
      const sentencePenalty = Math.max(0, (avgSentenceLength - 20) * 1.5);
      const score = 100 - sentencePenalty;
      return Math.max(0, Math.min(100, score));
    }
    
    // Russian readability (similar to English but adjusted)
    if (method === 'russian') {
      const avgWordsPerSentence = wordCount / sentenceCount;
      const avgSyllablesPerWord = syllableCount / wordCount;
      const score = 206.835 - 1.3 * avgWordsPerSentence - 60.1 * avgSyllablesPerWord;
      return Math.max(0, Math.min(100, score));
    }
    
    // German readability (Flesch-Amstad formula)
    if (method === 'german') {
      const avgWordsPerSentence = wordCount / sentenceCount;
      const avgSyllablesPerWord = syllableCount / wordCount;
      const score = 180 - avgWordsPerSentence - 58.5 * avgSyllablesPerWord;
      return Math.max(0, Math.min(100, score));
    }
    
    // Romance languages (French, Spanish, Portuguese, Italian)
    if (['french', 'spanish', 'portuguese', 'italian'].includes(method)) {
      const avgWordsPerSentence = wordCount / sentenceCount;
      const avgSyllablesPerWord = syllableCount / wordCount;
      // Adapted Flesch formula for Romance languages
      const score = 207 - 1.015 * avgWordsPerSentence - 73 * avgSyllablesPerWord;
      return Math.max(0, Math.min(100, score));
    }
    
    // Indonesian/Malay readability
    if (['indonesian', 'malay'].includes(method)) {
      const sentencePenalty = Math.max(0, (avgSentenceLength - 15) * 2);
      const wordPenalty = Math.max(0, (avgWordLength - 5.5) * 8);
      const score = 100 - sentencePenalty - wordPenalty;
      return Math.max(0, Math.min(100, score));
    }
    
    // Default: English Flesch Reading Ease
    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = syllableCount / wordCount;
    const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect language from text (simple heuristic)
   * @param {string} text - Text to analyze
   * @returns {string} - Detected language code
   */
  detectLanguage(text) {
    // Vietnamese detection: check for Vietnamese diacritics
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    if (vietnamesePattern.test(text)) {
      return 'vi';
    }
    
    // Chinese detection (CJK Unified Ideographs)
    const chinesePattern = /[\u4e00-\u9fff]/;
    if (chinesePattern.test(text)) {
      // Check if also has Japanese characters
      const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
      if (japanesePattern.test(text)) {
        return 'ja';
      }
      return 'zh';
    }
    
    // Japanese detection (Hiragana, Katakana)
    const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
    if (japanesePattern.test(text)) {
      return 'ja';
    }
    
    // Korean detection (Hangul)
    const koreanPattern = /[\uac00-\ud7af\u1100-\u11ff]/;
    if (koreanPattern.test(text)) {
      return 'ko';
    }
    
    // Arabic detection
    const arabicPattern = /[\u0600-\u06ff]/;
    if (arabicPattern.test(text)) {
      return 'ar';
    }
    
    // Thai detection
    const thaiPattern = /[\u0e00-\u0e7f]/;
    if (thaiPattern.test(text)) {
      return 'th';
    }
    
    // Russian/Cyrillic detection
    const cyrillicPattern = /[\u0400-\u04ff]/;
    if (cyrillicPattern.test(text)) {
      return 'ru';
    }
    
    // For Latin-based languages, use word frequency heuristics
    const lowerText = text.toLowerCase();
    
    // German detection (common words and umlauts)
    const germanPattern = /[äöüß]|(\b(und|der|die|das|ist|nicht|ein|eine|mit|für|auf|dem|den|sich|von|zu|auch|es|an|werden|aus|er|hat|dass|sie|nach|bei|einer|wie|noch|werden|sein|haben|diesem|kann|sind|war|einen|diesem|wurde|wird|waren|hatte|hatten|worden|beim|zum|zur|im|am|vom|ins)\b)/i;
    if (germanPattern.test(lowerText)) {
      return 'de';
    }
    
    // French detection (common words and accents)
    const frenchPattern = /[àâçéèêëîïôùûü]|(\b(le|la|les|de|du|des|un|une|et|est|en|que|qui|dans|pour|pas|sur|ce|il|elle|sont|avec|au|aux|par|son|sa|ses|mais|ou|où|ne|se|nous|vous|leur|tout|plus|être|avoir|faire|comme|bien|très|aussi|même|autre|sans|entre|après|avant|chez|sous|vers|pendant)\b)/i;
    if (frenchPattern.test(lowerText)) {
      return 'fr';
    }
    
    // Spanish detection (common words and ñ)
    const spanishPattern = /[ñáéíóú¿¡]|(\b(el|la|los|las|de|del|en|que|y|a|un|una|es|por|con|para|se|no|su|al|lo|como|más|pero|sus|le|ya|o|este|ha|sí|porque|esta|son|entre|cuando|muy|sin|sobre|ser|tiene|también|me|hasta|hay|donde|han|quien|están|estado|desde|todo|nos|durante|estados|todos|uno|les|ni|contra|otros|fueron|ese|eso|había|ante|ellos|e|esto|mí|antes|algunos|qué|unos|yo|otro|otras|otra|él|tanto|esa|estos|mucho|quienes|nada|muchos|cual|sea|poco|ella|estar|haber|estas|estaba|estamos|algunas|algo|nosotros)\b)/i;
    if (spanishPattern.test(lowerText)) {
      return 'es';
    }
    
    // Portuguese detection (common words and accents)
    const portuguesePattern = /[ãõç]|(\b(o|a|os|as|de|do|da|dos|das|em|no|na|nos|nas|um|uma|que|e|é|para|com|não|por|se|mais|como|mas|ao|aos|foi|ser|tem|seu|sua|ou|quando|muito|há|nos|já|está|eu|também|só|pelo|pela|até|isso|ela|entre|depois|sem|mesmo|aos|ter|seus|quem|nas|me|esse|eles|você|essa|num|nem|suas|meu|às|minha|têm|numa|pelos|elas|havia|seja|qual|será|nós|tenho|lhe|deles|essas|esses|pelas|este|dele|tu|te|vocês|vos|lhes|meus|minhas|teu|tua|teus|tuas|nosso|nossa|nossos|nossas|dela|delas|esta|estes|estas|aquele|aquela|aqueles|aquelas|isto|aquilo|estou|está|estamos|estão|estive|esteve|estivemos|estiveram|estava|estávamos|estavam|estivera|estivéramos|esteja|estejamos|estejam|estivesse|estivéssemos|estivessem|estiver|estivermos|estiverem|hei|há|havemos|hão|houve|houvemos|houveram|houvera|houvéramos|haja|hajamos|hajam|houvesse|houvéssemos|houvessem|houver|houvermos|houverem|houverei|houverá|houveremos|houverão|houveria|houveríamos|houveriam|sou|somos|são|era|éramos|eram|fui|foi|fomos|foram|fora|fôramos|seja|sejamos|sejam|fosse|fôssemos|fossem|for|formos|forem|serei|será|seremos|serão|seria|seríamos|seriam|tenho|tem|temos|têm|tinha|tínhamos|tinham|tive|teve|tivemos|tiveram|tivera|tivéramos|tenha|tenhamos|tenham|tivesse|tivéssemos|tivessem|tiver|tivermos|tiverem|terei|terá|teremos|terão|teria|teríamos|teriam)\b)/i;
    if (portuguesePattern.test(lowerText)) {
      return 'pt';
    }
    
    // Italian detection (common words)
    const italianPattern = /[àèéìòù]|(\b(il|lo|la|i|gli|le|di|del|dello|della|dei|degli|delle|a|al|allo|alla|ai|agli|alle|da|dal|dallo|dalla|dai|dagli|dalle|in|nel|nello|nella|nei|negli|nelle|su|sul|sullo|sulla|sui|sugli|sulle|con|per|tra|fra|e|è|che|non|si|un|uno|una|come|anche|più|ma|se|sono|ha|ho|questo|questa|questi|queste|quello|quella|quelli|quelle|essere|avere|fare|dire|potere|volere|dovere|sapere|vedere|andare|venire|dare|stare|tutto|tutti|tutta|tutte|molto|molti|molta|molte|poco|pochi|poca|poche|altro|altri|altra|altre|stesso|stessi|stessa|stesse|proprio|propri|propria|proprie|quale|quali|quanto|quanti|quanta|quante|chi|cosa|dove|quando|perché|come|così|già|ancora|sempre|mai|ora|adesso|poi|prima|dopo|sopra|sotto|dentro|fuori|qui|qua|lì|là)\b)/i;
    if (italianPattern.test(lowerText)) {
      return 'it';
    }
    
    // Indonesian/Malay detection (common words)
    const indonesianPattern = /(\b(yang|dan|di|ini|itu|dengan|untuk|dari|pada|adalah|ke|tidak|akan|juga|atau|ada|mereka|sudah|saya|kami|kita|bisa|lebih|telah|oleh|setelah|karena|dalam|seperti|hanya|banyak|sangat|semua|orang|tahun|dapat|tersebut|bahwa|menjadi|saat|antara|lain|namun|hingga|masih|harus|sebuah|serta|tetapi|agar|tanpa|melalui|secara|terhadap|sebagai|ketika|sedang|selama|sebelum|sesudah|begitu|kemudian|sehingga|apabila|meskipun|walaupun|bagaimana|mengapa|siapa|apa|mana|kapan|berapa)\b)/i;
    if (indonesianPattern.test(lowerText)) {
      // Check for Malay-specific words
      const malayPattern = /(\b(kerana|tetapi|walau|bagaimanapun|sekiranya|hendak|boleh|perlu|sahaja|pula|lagi|amat|begini|begitu|demikian|sedemikian)\b)/i;
      if (malayPattern.test(lowerText)) {
        return 'ms';
      }
      return 'id';
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Get all supported languages
   * @returns {Array<Object>} - List of supported languages with metadata
   */
  getSupportedLanguages() {
    return Object.entries(this.configs).map(([code, config]) => ({
      code,
      name: config.name,
      nativeName: config.nativeName || config.name,
      direction: config.direction
    }));
  }

  /**
   * Check if language is supported with full processing
   * @param {string} lang - Language code
   * @returns {boolean}
   */
  isFullySupported(lang) {
    return this.configs.hasOwnProperty(lang);
  }

  /**
   * Get language-specific AI detection prompt
   * @param {string} lang - Language code
   * @returns {string} - Prompt instruction for AI detection
   */
  getAIDetectionPromptInstruction(lang) {
    const instructions = {
      en: 'Analyze the English text for AI-generated content patterns. Look for formulaic structures, excessive transition words, lack of contractions, and uniform sentence length.',
      vi: 'Phân tích văn bản tiếng Việt để phát hiện các mẫu nội dung do AI tạo ra. Chú ý đến cách sử dụng từ Hán-Việt, từ láy, thành ngữ, và cấu trúc câu đặc trưng của tiếng Việt. AI thường sử dụng quá nhiều từ nối và thiếu ngôn ngữ tự nhiên.',
      zh: '分析中文文本以检测AI生成的内容模式。注意过度使用成语、缺乏口语化表达、句式过于规整等特征。AI生成的中文通常缺乏自然的语气词和口语表达。',
      ja: 'AI生成コンテンツのパターンについて日本語テキストを分析します。敬語の使い方、文末表現の多様性、自然な話し言葉の有無に注目してください。AIは往々にして硬い文体や過度に丁寧な表現を使用します。',
      ko: 'AI 생성 콘텐츠 패턴에 대해 한국어 텍스트를 분석합니다. 존댓말 사용, 문장 끝 표현의 다양성, 자연스러운 구어체 사용 여부에 주목하세요. AI는 종종 딱딱한 문체나 과도하게 정중한 표현을 사용합니다.',
      fr: 'Analysez le texte français pour détecter les modèles de contenu généré par IA. Recherchez les structures formulaïques, l\'utilisation excessive de mots de transition, et le manque d\'expressions idiomatiques naturelles.',
      de: 'Analysieren Sie den deutschen Text auf KI-generierte Inhaltsmuster. Achten Sie auf formelhafte Strukturen, übermäßige Verwendung von Übergangswörtern und fehlende natürliche Redewendungen.',
      es: 'Analice el texto en español para detectar patrones de contenido generado por IA. Busque estructuras formulaicas, uso excesivo de palabras de transición y falta de expresiones idiomáticas naturales.',
      pt: 'Analise o texto em português para detectar padrões de conteúdo gerado por IA. Procure estruturas formulaicas, uso excessivo de palavras de transição e falta de expressões idiomáticas naturais.',
      it: 'Analizza il testo italiano per rilevare modelli di contenuto generato da IA. Cerca strutture formulaiche, uso eccessivo di parole di transizione e mancanza di espressioni idiomatiche naturali.',
      ru: 'Проанализируйте русский текст на наличие паттернов контента, созданного ИИ. Обратите внимание на шаблонные структуры, чрезмерное использование переходных слов и отсутствие естественных идиоматических выражений.',
      ar: 'حلل النص العربي للكشف عن أنماط المحتوى المُنشأ بواسطة الذكاء الاصطناعي. ابحث عن الهياكل النمطية والاستخدام المفرط لكلمات الربط وغياب التعبيرات الاصطلاحية الطبيعية.',
      th: 'วิเคราะห์ข้อความภาษาไทยเพื่อตรวจจับรูปแบบเนื้อหาที่สร้างโดย AI สังเกตโครงสร้างที่เป็นสูตรสำเร็จ การใช้คำเชื่อมมากเกินไป และการขาดสำนวนธรรมชาติ',
      id: 'Analisis teks bahasa Indonesia untuk mendeteksi pola konten yang dihasilkan AI. Perhatikan struktur yang formulaik, penggunaan kata transisi yang berlebihan, dan kurangnya ekspresi idiomatik alami.',
      ms: 'Analisis teks bahasa Melayu untuk mengesan corak kandungan yang dijana AI. Perhatikan struktur yang formulaik, penggunaan kata peralihan yang berlebihan, dan kekurangan ungkapan idiomatik semula jadi.'
    };
    
    return instructions[lang] || instructions.en;
  }

  /**
   * Get language-specific voice analysis prompt
   * @param {string} lang - Language code
   * @returns {string} - Prompt instruction for voice analysis
   */
  getVoiceAnalysisPromptInstruction(lang) {
    const instructions = {
      en: 'Analyze the writing style patterns in English text. Focus on sentence structure, vocabulary complexity, tone, and unique expressions that define the author\'s voice.',
      vi: 'Phân tích phong cách viết tiếng Việt. Chú ý đến cách sử dụng từ Hán-Việt, từ láy, thành ngữ, tục ngữ, và cấu trúc câu đặc trưng. Xác định giọng văn (trang trọng, thân mật, học thuật) và các đặc điểm riêng biệt.',
      zh: '分析中文写作风格模式。关注句式结构、词汇复杂度、语气和定义作者声音的独特表达。注意成语使用、文言文元素和口语化程度。',
      ja: '日本語テキストの文体パターンを分析します。文構造、語彙の複雑さ、トーン、著者の声を定義する独特の表現に焦点を当ててください。敬語レベル、漢字使用率、文末表現の特徴に注目してください。',
      ko: '한국어 텍스트의 문체 패턴을 분석합니다. 문장 구조, 어휘 복잡성, 어조, 저자의 목소리를 정의하는 고유한 표현에 초점을 맞추세요. 존댓말 수준, 한자어 사용, 문장 끝 표현의 특징에 주목하세요.',
      fr: 'Analysez les modèles de style d\'écriture en français. Concentrez-vous sur la structure des phrases, la complexité du vocabulaire, le ton et les expressions uniques qui définissent la voix de l\'auteur.',
      de: 'Analysieren Sie die Schreibstilmuster im deutschen Text. Konzentrieren Sie sich auf Satzstruktur, Vokabelkomplexität, Ton und einzigartige Ausdrücke, die die Stimme des Autors definieren.',
      es: 'Analice los patrones de estilo de escritura en español. Concéntrese en la estructura de las oraciones, la complejidad del vocabulario, el tono y las expresiones únicas que definen la voz del autor.',
      pt: 'Analise os padrões de estilo de escrita em português. Concentre-se na estrutura das frases, complexidade do vocabulário, tom e expressões únicas que definem a voz do autor.',
      it: 'Analizza i modelli di stile di scrittura in italiano. Concentrati sulla struttura delle frasi, complessità del vocabolario, tono ed espressioni uniche che definiscono la voce dell\'autore.',
      ru: 'Проанализируйте паттерны стиля письма на русском языке. Сосредоточьтесь на структуре предложений, сложности словарного запаса, тоне и уникальных выражениях, определяющих голос автора.',
      ar: 'حلل أنماط أسلوب الكتابة في النص العربي. ركز على بنية الجملة وتعقيد المفردات والنبرة والتعبيرات الفريدة التي تحدد صوت الكاتب.',
      th: 'วิเคราะห์รูปแบบสไตล์การเขียนในข้อความภาษาไทย มุ่งเน้นที่โครงสร้างประโยค ความซับซ้อนของคำศัพท์ น้ำเสียง และสำนวนเฉพาะที่กำหนดเสียงของผู้เขียน',
      id: 'Analisis pola gaya penulisan dalam teks bahasa Indonesia. Fokus pada struktur kalimat, kompleksitas kosakata, nada, dan ekspresi unik yang mendefinisikan suara penulis.',
      ms: 'Analisis corak gaya penulisan dalam teks bahasa Melayu. Fokus pada struktur ayat, kerumitan perbendaharaan kata, nada, dan ungkapan unik yang mentakrifkan suara penulis.'
    };
    
    return instructions[lang] || instructions.en;
  }

  /**
   * Get language-specific humanization prompt
   * @param {string} lang - Language code
   * @returns {string} - Prompt instruction for humanization
   */
  getHumanizationPromptInstruction(lang) {
    const instructions = {
      en: 'Make the text sound more natural and human-like. Add contractions, vary sentence length, include personal touches, and use more conversational language where appropriate.',
      vi: 'Làm cho văn bản nghe tự nhiên và giống người viết hơn. Sử dụng từ láy, thành ngữ, và cách diễn đạt đời thường. Thay đổi độ dài câu và thêm các yếu tố cá nhân phù hợp với ngữ cảnh.',
      zh: '使文本听起来更自然、更像人类写的。添加口语化表达、变化句子长度、加入个人色彩，适当使用更口语化的语言。可以加入语气词和自然的停顿。',
      ja: 'テキストをより自然で人間らしく聞こえるようにします。文の長さを変え、個人的なタッチを加え、適切な場所でより会話的な言葉を使用してください。自然な終助詞や口語表現を加えてください。',
      ko: '텍스트를 더 자연스럽고 인간적으로 들리게 만드세요. 문장 길이를 다양하게 하고, 개인적인 터치를 추가하고, 적절한 곳에서 더 대화체적인 언어를 사용하세요.',
      fr: 'Rendez le texte plus naturel et humain. Variez la longueur des phrases, ajoutez des touches personnelles et utilisez un langage plus conversationnel là où c\'est approprié.',
      de: 'Machen Sie den Text natürlicher und menschlicher klingend. Variieren Sie die Satzlänge, fügen Sie persönliche Akzente hinzu und verwenden Sie an geeigneten Stellen eine umgangssprachlichere Sprache.',
      es: 'Haga que el texto suene más natural y humano. Varíe la longitud de las oraciones, agregue toques personales y use un lenguaje más conversacional donde sea apropiado.',
      pt: 'Faça o texto soar mais natural e humano. Varie o comprimento das frases, adicione toques pessoais e use uma linguagem mais conversacional onde for apropriado.',
      it: 'Rendi il testo più naturale e umano. Varia la lunghezza delle frasi, aggiungi tocchi personali e usa un linguaggio più colloquiale dove appropriato.',
      ru: 'Сделайте текст более естественным и человечным. Варьируйте длину предложений, добавляйте личные штрихи и используйте более разговорный язык там, где это уместно.',
      ar: 'اجعل النص يبدو أكثر طبيعية وإنسانية. نوّع في طول الجمل، أضف لمسات شخصية، واستخدم لغة أكثر حوارية حيثما كان ذلك مناسباً.',
      th: 'ทำให้ข้อความฟังดูเป็นธรรมชาติและเหมือนมนุษย์มากขึ้น เปลี่ยนความยาวประโยค เพิ่มสัมผัสส่วนตัว และใช้ภาษาที่เป็นกันเองมากขึ้นในที่ที่เหมาะสม',
      id: 'Buat teks terdengar lebih alami dan seperti manusia. Variasikan panjang kalimat, tambahkan sentuhan pribadi, dan gunakan bahasa yang lebih percakapan di tempat yang sesuai.',
      ms: 'Jadikan teks kedengaran lebih semula jadi dan seperti manusia. Pelbagaikan panjang ayat, tambah sentuhan peribadi, dan gunakan bahasa yang lebih perbualan di tempat yang sesuai.'
    };
    
    return instructions[lang] || instructions.en;
  }
}

// Export singleton instance
module.exports = new LanguageProcessorService();

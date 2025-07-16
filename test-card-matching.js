// Test script for Enhanced Card Matching Algorithm
// This script tests the weighted scoring system and store-specific matching

// Mock card database for testing
const mockCardDatabase = {
  cardData: {
    'taiwan_gogo': {
      name: '台新@GoGo卡',
      bank: '台新銀行',
      annualFee: 0,
      cashbackRates: { 
        supermarket: 3,
        dining: 3,
        overseas: 2.8,
        digital: 3.8,
        online: 5,
        general: 1
      },
      specificStores: {
        '7-11': 3,
        '家樂福': 3,
        'momo': 5,
        'PChome': 5
      },
      benefits: ['永久免年費', '數位通路高回饋', '超市量販3%回饋'],
      targetAudience: ['數位原生', '小資族', '學生'],
      applicationRequirements: {
        minAge: 20,
        minIncome: 0,
        creditScore: 'basic'
      }
    },
    'cathay_koko': {
      name: '國泰KOKO卡',
      bank: '國泰世華銀行',
      annualFee: 0,
      cashbackRates: { 
        online: 5,
        mobile: 3,
        streaming: 5,
        general: 0.5
      },
      specificStores: {
        'Netflix': 5,
        'Spotify': 5,
        'momo': 5,
        'PChome': 5
      },
      benefits: ['指定網購5%回饋', '串流平台5%回饋'],
      targetAudience: ['年輕族群', '數位族', '網購族'],
      applicationRequirements: {
        minAge: 20,
        minIncome: 240000,
        creditScore: 'basic'
      }
    }
  }
};

// Enhanced Card Matcher implementation (copied from main code)
class EnhancedCardMatcher {
  constructor(cardDatabase) {
    this.cardDB = cardDatabase;
    
    this.scoringWeights = {
      exactStoreMatch: 50,
      storeCategory: 30,
      cashbackRate: 25,
      annualFee: 20,
      targetAudience: 15,
      generalCategory: 10,
      fallbackBonus: 5
    };
    
    this.storeAliases = {
      '7-11': ['7-11', '7eleven', '711', '超商', '便利商店', '便利店'],
      '家樂福': ['家樂福', 'carrefour', '量販', '量販店', '大賣場'],
      'momo': ['momo', 'momo購物', '富邦momo', '網購', '電商'],
      'PChome': ['pchome', 'pc home', '網購', '電商', '線上購物']
    };
    
    this.categoryMappings = {
      'supermarket': ['超市', '量販', '全聯', '家樂福', '好市多'],
      'convenience': ['超商', '便利商店', '7-11', '全家'],
      'online': ['網購', '線上', '電商', 'momo', 'pchome'],
      'dining': ['餐廳', '美食', '用餐', '吃飯'],
      'overseas': ['海外', '國外', '出國', '旅遊']
    };
  }

  findBestMatch(userMessage, userContext = {}) {
    console.log('🎯 Testing Enhanced Card Matching - Processing:', userMessage);
    
    const normalizedMessage = userMessage.toLowerCase();
    const allCards = Object.values(this.cardDB.cardData);
    
    const scoredCards = allCards.map(card => {
      const score = this.calculateCardScore(card, normalizedMessage, userContext);
      return {
        ...card,
        score: score.total,
        scoreBreakdown: score.breakdown
      };
    });
    
    scoredCards.sort((a, b) => b.score - a.score);
    
    if (scoredCards[0].score === 0) {
      console.log('⚠️ No matches found, applying fallback scoring');
      return this.applyFallbackScoring(scoredCards, normalizedMessage);
    }
    
    const bestMatch = scoredCards[0];
    console.log('🏆 Best match:', bestMatch.name, 'Score:', bestMatch.score);
    console.log('📊 Score breakdown:', bestMatch.scoreBreakdown);
    
    return bestMatch;
  }

  calculateCardScore(card, message, context) {
    const breakdown = {
      exactStoreMatch: 0,
      storeCategory: 0,
      cashbackRate: 0,
      annualFee: 0,
      targetAudience: 0,
      generalCategory: 0,
      fallbackBonus: 0
    };

    breakdown.exactStoreMatch = this.scoreExactStoreMatches(card, message);
    breakdown.storeCategory = this.scoreStoreCategories(card, message);
    breakdown.cashbackRate = this.scoreCashbackRates(card, message);
    breakdown.annualFee = this.scoreAnnualFee(card, message);
    breakdown.targetAudience = this.scoreTargetAudience(card, message, context);
    breakdown.generalCategory = this.scoreGeneralCategories(card, message);
    breakdown.fallbackBonus = this.scoringWeights.fallbackBonus;

    const total = Object.entries(breakdown).reduce((sum, [key, score]) => {
      return sum + (score * (this.scoringWeights[key] || 1));
    }, 0);

    return { total, breakdown };
  }

  scoreExactStoreMatches(card, message) {
    let score = 0;
    
    if (!card.specificStores) return score;
    
    Object.entries(card.specificStores).forEach(([store, rate]) => {
      const aliases = this.storeAliases[store] || [store.toLowerCase()];
      const hasMatch = aliases.some(alias => message.includes(alias.toLowerCase()));
      
      if (hasMatch) {
        score += 1 + (rate / 10);
        console.log(`✅ Exact store match: ${store} (${rate}%) - Score: ${1 + (rate / 10)}`);
      }
    });
    
    return score;
  }

  scoreStoreCategories(card, message) {
    let score = 0;
    
    Object.entries(this.categoryMappings).forEach(([category, keywords]) => {
      const hasKeyword = keywords.some(keyword => message.includes(keyword));
      
      if (hasKeyword) {
        const categoryRate = this.getCategoryRate(card, category);
        if (categoryRate > 1) {
          score += 0.8 + (categoryRate / 20);
          console.log(`✅ Category match: ${category} (${categoryRate}%) - Score: ${0.8 + (categoryRate / 20)}`);
        }
      }
    });
    
    return score;
  }

  scoreCashbackRates(card, message) {
    let score = 0;
    
    if (message.includes('高回饋') || message.includes('回饋') || message.includes('%')) {
      const maxRate = Math.max(...Object.values(card.cashbackRates || {}));
      
      if (maxRate >= 5) score += 1.0;
      else if (maxRate >= 3) score += 0.7;
      else if (maxRate >= 2) score += 0.4;
      
      console.log(`💰 Cashback scoring: Max rate ${maxRate}% - Score: ${score}`);
    }
    
    return score;
  }

  scoreAnnualFee(card, message) {
    let score = 0;
    
    if (message.includes('免年費') || message.includes('無年費') || message.includes('不收年費')) {
      if (card.annualFee === 0) {
        score += 1.0;
        console.log(`💳 Annual fee match: Free - Score: 1.0`);
      }
    }
    
    return score;
  }

  scoreTargetAudience(card, message, context) {
    let score = 0;
    
    if (!card.targetAudience) return score;
    
    const audienceKeywords = {
      '學生': ['學生', '學生族', '新鮮人'],
      '小資族': ['小資', '省錢', '節省'],
      '數位原生': ['數位', '網路', '線上', '科技'],
      '年輕族群': ['年輕', '青年', '學生']
    };
    
    card.targetAudience.forEach(audience => {
      const keywords = audienceKeywords[audience] || [audience];
      const hasMatch = keywords.some(keyword => message.includes(keyword));
      
      if (hasMatch) {
        score += 0.5;
        console.log(`👥 Target audience match: ${audience} - Score: 0.5`);
      }
    });
    
    return score;
  }

  scoreGeneralCategories(card, message) {
    let score = 0;
    
    Object.entries(card.cashbackRates || {}).forEach(([category, rate]) => {
      if (rate > 1) {
        const categoryName = this.translateCategory(category);
        if (message.includes(categoryName)) {
          score += 0.3 + (rate / 30);
        }
      }
    });
    
    return score;
  }

  applyFallbackScoring(cards, message) {
    console.log('🔄 Applying fallback scoring strategy');
    
    const freeCards = cards.filter(card => card.annualFee === 0);
    if (freeCards.length > 0) {
      const bestFree = freeCards.reduce((best, card) => {
        const maxRate = Math.max(...Object.values(card.cashbackRates || {}));
        const bestMaxRate = Math.max(...Object.values(best.cashbackRates || {}));
        return maxRate > bestMaxRate ? card : best;
      });
      
      bestFree.score = 10;
      bestFree.scoreBreakdown = { fallback: 'free_card_with_best_rate' };
      return bestFree;
    }
    
    const bestCashback = cards.reduce((best, card) => {
      const maxRate = Math.max(...Object.values(card.cashbackRates || {}));
      const bestMaxRate = Math.max(...Object.values(best.cashbackRates || {}));
      return maxRate > bestMaxRate ? card : best;
    });
    
    bestCashback.score = 8;
    bestCashback.scoreBreakdown = { fallback: 'highest_cashback_rate' };
    return bestCashback;
  }

  getCategoryRate(card, category) {
    const categoryMap = {
      'supermarket': card.cashbackRates?.supermarket || 0,
      'convenience': card.cashbackRates?.supermarket || 0,
      'online': card.cashbackRates?.online || card.cashbackRates?.digital || 0,
      'dining': card.cashbackRates?.dining || 0,
      'overseas': card.cashbackRates?.overseas || 0
    };
    
    return categoryMap[category] || 0;
  }

  translateCategory(category) {
    const categoryMap = {
      'overseas': '海外',
      'dining': '餐廳',
      'supermarket': '超市',
      'online': '網購',
      'digital': '數位'
    };
    return categoryMap[category] || category;
  }
}

// Test cases
function runTests() {
  console.log('🧪 Starting Enhanced Card Matching Algorithm Tests\n');
  
  const matcher = new EnhancedCardMatcher(mockCardDatabase);
  
  // Test 1: Exact store match (7-11)
  console.log('=== Test 1: 7-11 Store Match ===');
  const result1 = matcher.findBestMatch('我想要在7-11消費有回饋的信用卡');
  console.log(`Expected: 台新@GoGo卡, Got: ${result1.name}`);
  console.log(`Score: ${result1.score}\n`);
  
  // Test 2: Exact store match (momo)
  console.log('=== Test 2: momo Store Match ===');
  const result2 = matcher.findBestMatch('momo購物哪張卡比較好');
  console.log(`Expected: Both cards should score well, Got: ${result2.name}`);
  console.log(`Score: ${result2.score}\n`);
  
  // Test 3: Category match (網購)
  console.log('=== Test 3: Online Shopping Category ===');
  const result3 = matcher.findBestMatch('網購回饋高的信用卡推薦');
  console.log(`Expected: Cards with high online rates, Got: ${result3.name}`);
  console.log(`Score: ${result3.score}\n`);
  
  // Test 4: Annual fee preference
  console.log('=== Test 4: Free Annual Fee ===');
  const result4 = matcher.findBestMatch('免年費的信用卡有哪些');
  console.log(`Expected: Free annual fee card, Got: ${result4.name}`);
  console.log(`Score: ${result4.score}\n`);
  
  // Test 5: High cashback request
  console.log('=== Test 5: High Cashback Request ===');
  const result5 = matcher.findBestMatch('高回饋信用卡推薦');
  console.log(`Expected: Card with highest rates, Got: ${result5.name}`);
  console.log(`Score: ${result5.score}\n`);
  
  // Test 6: Fallback scenario
  console.log('=== Test 6: Fallback Scenario ===');
  const result6 = matcher.findBestMatch('信用卡');
  console.log(`Expected: Fallback to best overall card, Got: ${result6.name}`);
  console.log(`Score: ${result6.score}\n`);
  
  console.log('✅ All tests completed!');
}

// Run the tests
runTests();
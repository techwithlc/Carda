// 🎯 Enhanced Card Matching Algorithm v1.0
// Implements weighted scoring system with specific store prioritization

class EnhancedCardMatcher {
  constructor(cardDatabase) {
    this.cardDB = cardDatabase;
    
    // Weighted scoring configuration
    this.scoringWeights = {
      exactStoreMatch: 50,      // Highest priority for exact store matches
      storeCategory: 30,        // Store category matches (e.g., supermarket)
      cashbackRate: 25,         // Cashback rate relevance
      annualFee: 20,           // Annual fee consideration
      targetAudience: 15,       // User profile matching
      generalCategory: 10,      // General category matches
      fallbackBonus: 5          // Ensures minimum scoring
    };
    
    // Store name mappings for better matching
    this.storeAliases = {
      '7-11': ['7-11', '7eleven', '711', '超商', '便利商店', '便利店'],
      '家樂福': ['家樂福', 'carrefour', '量販', '量販店', '大賣場'],
      'momo': ['momo', 'momo購物', '富邦momo', '網購', '電商'],
      'PChome': ['pchome', 'pc home', '網購', '電商', '線上購物'],
      '全聯': ['全聯', 'pxmart', '超市'],
      '好市多': ['好市多', 'costco', '量販', '會員制量販']
    };
    
    // Category mappings for broader matching
    this.categoryMappings = {
      'supermarket': ['超市', '量販', '全聯', '家樂福', '好市多', '大潤發'],
      'convenience': ['超商', '便利商店', '7-11', '全家', 'OK', '萊爾富'],
      'online': ['網購', '線上', '電商', 'momo', 'pchome', '蝦皮'],
      'dining': ['餐廳', '美食', '用餐', '吃飯', '麥當勞', '肯德基'],
      'overseas': ['海外', '國外', '出國', '旅遊', '國際'],
      'gas': ['加油', '中油', '台塑', '全國加油站'],
      'transport': ['交通', 'uber', '計程車', '捷運', '高鐵']
    };
  }

  /**
   * Main method to find best matching card with weighted scoring
   * @param {string} userMessage - User's message/query
   * @param {Object} userContext - Additional user context (optional)
   * @returns {Object} Best matching card with score details
   */
  findBestMatch(userMessage, userContext = {}) {
    console.log('🎯 Enhanced Card Matching - Processing:', userMessage);
    
    const normalizedMessage = userMessage.toLowerCase();
    const allCards = Object.values(this.cardDB.cardData);
    
    // Score all cards
    const scoredCards = allCards.map(card => {
      const score = this.calculateCardScore(card, normalizedMessage, userContext);
      return {
        ...card,
        score: score.total,
        scoreBreakdown: score.breakdown
      };
    });
    
    // Sort by score (highest first)
    scoredCards.sort((a, b) => b.score - a.score);
    
    // Ensure at least one card is always recommended (fallback scoring)
    if (scoredCards[0].score === 0) {
      console.log('⚠️ No matches found, applying fallback scoring');
      return this.applyFallbackScoring(scoredCards, normalizedMessage);
    }
    
    const bestMatch = scoredCards[0];
    console.log('🏆 Best match:', bestMatch.name, 'Score:', bestMatch.score);
    console.log('📊 Score breakdown:', bestMatch.scoreBreakdown);
    
    return bestMatch;
  }

  /**
   * Calculate weighted score for a card based on user message
   * @param {Object} card - Card data
   * @param {string} message - Normalized user message
   * @param {Object} context - User context
   * @returns {Object} Score object with total and breakdown
   */
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

    // 1. Exact Store Match Scoring (Highest Priority)
    breakdown.exactStoreMatch = this.scoreExactStoreMatches(card, message);
    
    // 2. Store Category Scoring
    breakdown.storeCategory = this.scoreStoreCategories(card, message);
    
    // 3. Cashback Rate Scoring
    breakdown.cashbackRate = this.scoreCashbackRates(card, message);
    
    // 4. Annual Fee Scoring
    breakdown.annualFee = this.scoreAnnualFee(card, message);
    
    // 5. Target Audience Scoring
    breakdown.targetAudience = this.scoreTargetAudience(card, message, context);
    
    // 6. General Category Scoring
    breakdown.generalCategory = this.scoreGeneralCategories(card, message);
    
    // 7. Fallback Bonus (ensures minimum scoring)
    breakdown.fallbackBonus = this.scoringWeights.fallbackBonus;

    // Calculate weighted total
    const total = Object.entries(breakdown).reduce((sum, [key, score]) => {
      return sum + (score * (this.scoringWeights[key] || 1));
    }, 0);

    return { total, breakdown };
  }

  /**
   * Score exact store name matches with bonus for specific mentions
   */
  scoreExactStoreMatches(card, message) {
    let score = 0;
    
    if (!card.specificStores) return score;
    
    Object.entries(card.specificStores).forEach(([store, rate]) => {
      const aliases = this.storeAliases[store] || [store.toLowerCase()];
      
      const hasMatch = aliases.some(alias => message.includes(alias.toLowerCase()));
      
      if (hasMatch) {
        // Base score for match + bonus for higher cashback rate
        score += 1 + (rate / 10); // Higher rates get bonus points
        console.log(`✅ Exact store match: ${store} (${rate}%) - Score: ${1 + (rate / 10)}`);
      }
    });
    
    return score;
  }

  /**
   * Score store category matches (broader matching)
   */
  scoreStoreCategories(card, message) {
    let score = 0;
    
    Object.entries(this.categoryMappings).forEach(([category, keywords]) => {
      const hasKeyword = keywords.some(keyword => message.includes(keyword));
      
      if (hasKeyword) {
        // Check if card has good rates for this category
        const categoryRate = this.getCategoryRate(card, category);
        if (categoryRate > 1) {
          score += 0.8 + (categoryRate / 20); // Scaled scoring
          console.log(`✅ Category match: ${category} (${categoryRate}%) - Score: ${0.8 + (categoryRate / 20)}`);
        }
      }
    });
    
    return score;
  }

  /**
   * Score based on cashback rates mentioned in message
   */
  scoreCashbackRates(card, message) {
    let score = 0;
    
    // Look for percentage mentions or high cashback requests
    if (message.includes('高回饋') || message.includes('回饋') || message.includes('%')) {
      const maxRate = Math.max(...Object.values(card.cashbackRates || {}));
      
      if (maxRate >= 5) score += 1.0;
      else if (maxRate >= 3) score += 0.7;
      else if (maxRate >= 2) score += 0.4;
      
      console.log(`💰 Cashback scoring: Max rate ${maxRate}% - Score: ${score}`);
    }
    
    return score;
  }

  /**
   * Score based on annual fee preferences
   */
  scoreAnnualFee(card, message) {
    let score = 0;
    
    if (message.includes('免年費') || message.includes('無年費') || message.includes('不收年費')) {
      if (card.annualFee === 0) {
        score += 1.0;
        console.log(`💳 Annual fee match: Free - Score: 1.0`);
      }
    } else if (message.includes('年費')) {
      // Neutral scoring for fee mentions
      score += 0.2;
    }
    
    return score;
  }

  /**
   * Score based on target audience matching
   */
  scoreTargetAudience(card, message, context) {
    let score = 0;
    
    if (!card.targetAudience) return score;
    
    const audienceKeywords = {
      '學生': ['學生', '學生族', '新鮮人'],
      '小資族': ['小資', '省錢', '節省'],
      '數位原生': ['數位', '網路', '線上', '科技'],
      '旅遊族': ['旅遊', '出國', '海外', '國外'],
      '高收入族群': ['高收入', '商務', '白金', '頂級']
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

  /**
   * Score general category matches
   */
  scoreGeneralCategories(card, message) {
    let score = 0;
    
    Object.entries(card.cashbackRates || {}).forEach(([category, rate]) => {
      if (rate > 1) {
        const categoryName = this.translateCategory(category);
        if (message.includes(categoryName)) {
          score += 0.3 + (rate / 30); // Small bonus for higher rates
        }
      }
    });
    
    return score;
  }

  /**
   * Apply fallback scoring when no good matches are found
   */
  applyFallbackScoring(cards, message) {
    console.log('🔄 Applying fallback scoring strategy');
    
    // Strategy 1: Prefer free annual fee cards for general queries
    const freeCards = cards.filter(card => card.annualFee === 0);
    if (freeCards.length > 0) {
      const bestFree = freeCards.reduce((best, card) => {
        const maxRate = Math.max(...Object.values(card.cashbackRates || {}));
        const bestMaxRate = Math.max(...Object.values(best.cashbackRates || {}));
        return maxRate > bestMaxRate ? card : best;
      });
      
      bestFree.score = 10; // Minimum fallback score
      bestFree.scoreBreakdown = { fallback: 'free_card_with_best_rate' };
      return bestFree;
    }
    
    // Strategy 2: Return card with highest overall cashback
    const bestCashback = cards.reduce((best, card) => {
      const maxRate = Math.max(...Object.values(card.cashbackRates || {}));
      const bestMaxRate = Math.max(...Object.values(best.cashbackRates || {}));
      return maxRate > bestMaxRate ? card : best;
    });
    
    bestCashback.score = 8; // Minimum fallback score
    bestCashback.scoreBreakdown = { fallback: 'highest_cashback_rate' };
    return bestCashback;
  }

  /**
   * Get cashback rate for a specific category
   */
  getCategoryRate(card, category) {
    const categoryMap = {
      'supermarket': card.cashbackRates?.supermarket || 0,
      'convenience': card.cashbackRates?.supermarket || 0,
      'online': card.cashbackRates?.online || card.cashbackRates?.digital || 0,
      'dining': card.cashbackRates?.dining || 0,
      'overseas': card.cashbackRates?.overseas || 0,
      'gas': card.cashbackRates?.gas || 0,
      'transport': card.cashbackRates?.transport || 0
    };
    
    return categoryMap[category] || 0;
  }

  /**
   * Translate category codes to Chinese names
   */
  translateCategory(category) {
    const categoryMap = {
      'overseas': '海外',
      'dining': '餐廳',
      'supermarket': '超市',
      'online': '網購',
      'digital': '數位',
      'all': '所有',
      'mobile': '行動支付',
      'streaming': '串流',
      'gas': '加油',
      'transport': '交通'
    };
    return categoryMap[category] || category;
  }

  /**
   * Get multiple recommendations with scoring details
   */
  getTopMatches(userMessage, count = 3, userContext = {}) {
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
    
    // Sort and return top matches
    return scoredCards
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .filter(card => card.score > 0); // Only return cards with positive scores
  }
}

module.exports = EnhancedCardMatcher;
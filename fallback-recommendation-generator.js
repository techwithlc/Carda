// 🎯 Fallback Recommendation Generator v1.0
// Task 4: Create fallback recommendation generator

class FallbackRecommendationGenerator {
  constructor(cardDatabase) {
    this.cardDB = cardDatabase;
    
    // User experience level detection patterns
    this.experienceLevelPatterns = {
      beginner: [
        '第一張', '首卡', '新手', '不懂', '不知道', '怎麼選', '推薦', 
        '學生', '剛畢業', '社會新鮮人', '沒有經驗', '初學者'
      ],
      expert: [
        '比較', '分析', '優缺點', '差異', '哪個好', '評估', '考量',
        '回饋率', '年費', '申請條件', '信用分數', '財力證明', '審核'
      ]
    };
    
    // Response templates for different experience levels
    this.responseTemplates = {
      beginner: {
        intro: '💡 為您推薦最適合的入門信用卡：',
        structure: 'simple',
        includeEducation: true
      },
      expert: {
        intro: '📊 根據您的需求，詳細分析推薦：',
        structure: 'detailed',
        includeEducation: false
      }
    };
  }

  /**
   * Main method to generate fallback recommendation
   * @param {string} userMessage - User's original message
   * @param {Object} userContext - Context information about the user
   * @param {Object} bestMatchCard - Best matching card from enhanced matcher
   * @returns {string} - Formatted recommendation response
   */
  generateFallbackRecommendation(userMessage, userContext = {}, bestMatchCard = null) {
    console.log('🎯 Generating fallback recommendation for:', userMessage);
    
    // Determine user experience level
    const experienceLevel = this.detectUserExperienceLevel(userMessage);
    console.log('👤 Detected experience level:', experienceLevel);
    
    // Get the best card if not provided
    const recommendedCard = bestMatchCard || this.selectBestCard(userMessage, userContext);
    
    // Generate targeted explanation based on user requirements
    const explanation = this.generateTargetedExplanation(userMessage, recommendedCard, experienceLevel);
    
    // Get current promotions
    const promotions = this.cardDB.getActivePromotions(recommendedCard.name);
    
    // Build response based on experience level
    const response = this.buildResponse(recommendedCard, explanation, promotions, experienceLevel);
    
    console.log('✅ Fallback recommendation generated');
    return response;
  }

  /**
   * Detect user experience level based on message patterns
   */
  detectUserExperienceLevel(message) {
    const lowerMessage = message.toLowerCase();
    
    let beginnerScore = 0;
    let expertScore = 0;
    
    // Count beginner indicators
    this.experienceLevelPatterns.beginner.forEach(pattern => {
      if (lowerMessage.includes(pattern)) {
        beginnerScore++;
      }
    });
    
    // Count expert indicators
    this.experienceLevelPatterns.expert.forEach(pattern => {
      if (lowerMessage.includes(pattern)) {
        expertScore++;
      }
    });
    
    // Additional heuristics
    if (message.length > 50 && (lowerMessage.includes('想要') || lowerMessage.includes('希望'))) {
      expertScore += 0.5;
    }
    
    if (message.length < 20 && (lowerMessage.includes('推薦') || lowerMessage.includes('建議'))) {
      beginnerScore += 0.5;
    }
    
    return expertScore > beginnerScore ? 'expert' : 'beginner';
  }

  /**
   * Select best card based on user message and context
   */
  selectBestCard(userMessage, userContext) {
    const lowerMessage = userMessage.toLowerCase();
    const allCards = Object.values(this.cardDB.cardData);
    
    // Priority matching logic
    
    // 1. Specific store mentions
    for (const card of allCards) {
      if (card.specificStores) {
        for (const [store, rate] of Object.entries(card.specificStores)) {
          if (lowerMessage.includes(store.toLowerCase()) || 
              (store === '7-11' && (lowerMessage.includes('超商') || lowerMessage.includes('便利商店'))) ||
              (store === '家樂福' && (lowerMessage.includes('超市') || lowerMessage.includes('量販'))) ||
              (store === 'momo' && lowerMessage.includes('網購'))) {
            console.log(`🎯 Store match found: ${store} -> ${card.name}`);
            return card;
          }
        }
      }
    }
    
    // 2. Category-based matching
    const categoryMatches = {
      '海外': card => card.cashbackRates?.overseas >= 2.5,
      '網購': card => card.cashbackRates?.online >= 3 || card.cashbackRates?.digital >= 3,
      '餐廳': card => card.cashbackRates?.dining >= 2,
      '超市': card => card.cashbackRates?.supermarket >= 2,
      '免年費': card => card.annualFee === 0,
      '高回饋': card => Math.max(...Object.values(card.cashbackRates || {})) >= 3
    };
    
    for (const [keyword, condition] of Object.entries(categoryMatches)) {
      if (lowerMessage.includes(keyword)) {
        const matchingCard = allCards.find(condition);
        if (matchingCard) {
          console.log(`🎯 Category match found: ${keyword} -> ${matchingCard.name}`);
          return matchingCard;
        }
      }
    }
    
    // 3. Target audience matching
    const audienceKeywords = {
      '學生': '學生',
      '新鮮人': '學生',
      '小資': '小資族',
      '數位': '數位原生',
      '旅遊': '旅遊族',
      '出國': '旅遊族'
    };
    
    for (const [keyword, audience] of Object.entries(audienceKeywords)) {
      if (lowerMessage.includes(keyword)) {
        const matchingCard = allCards.find(card => 
          card.targetAudience?.includes(audience)
        );
        if (matchingCard) {
          console.log(`🎯 Audience match found: ${audience} -> ${matchingCard.name}`);
          return matchingCard;
        }
      }
    }
    
    // 4. Default fallback - most versatile free card
    const fallbackCard = allCards.find(card => 
      card.annualFee === 0 && 
      Math.max(...Object.values(card.cashbackRates || {})) >= 3
    ) || allCards[0];
    
    console.log(`🎯 Fallback card selected: ${fallbackCard.name}`);
    return fallbackCard;
  }

  /**
   * Generate targeted explanation based on user requirements
   */
  generateTargetedExplanation(userMessage, card, experienceLevel) {
    const lowerMessage = userMessage.toLowerCase();
    const explanations = [];
    
    // Match specific benefits to user needs
    if (card.specificStores) {
      Object.entries(card.specificStores).forEach(([store, rate]) => {
        if (lowerMessage.includes(store.toLowerCase()) || 
            (store === '7-11' && (lowerMessage.includes('超商') || lowerMessage.includes('便利商店'))) ||
            (store === '家樂福' && (lowerMessage.includes('超市') || lowerMessage.includes('量販'))) ||
            (store === 'momo' && lowerMessage.includes('網購'))) {
          explanations.push(`${store}消費享${rate}%回饋`);
        }
      });
    }
    
    // Category-based explanations
    const categoryExplanations = {
      '海外': () => card.cashbackRates?.overseas ? `海外消費${card.cashbackRates.overseas}%回饋` : null,
      '網購': () => {
        const rate = card.cashbackRates?.online || card.cashbackRates?.digital;
        return rate ? `網購消費${rate}%回饋` : null;
      },
      '餐廳': () => card.cashbackRates?.dining ? `餐廳用餐${card.cashbackRates.dining}%回饋` : null,
      '超市': () => card.cashbackRates?.supermarket ? `超市購物${card.cashbackRates.supermarket}%回饋` : null
    };
    
    Object.entries(categoryExplanations).forEach(([keyword, explainFunc]) => {
      if (lowerMessage.includes(keyword)) {
        const explanation = explainFunc();
        if (explanation) {
          explanations.push(explanation);
        }
      }
    });
    
    // Annual fee explanation
    if (lowerMessage.includes('免年費') || lowerMessage.includes('年費')) {
      if (card.annualFee === 0) {
        explanations.push('永久免年費');
      } else {
        explanations.push(`年費${card.annualFee}元`);
      }
    }
    
    // High cashback explanation
    if (lowerMessage.includes('高回饋') || lowerMessage.includes('回饋')) {
      const maxRate = Math.max(...Object.values(card.cashbackRates || {}));
      explanations.push(`最高${maxRate}%回饋`);
    }
    
    // Default explanation if no specific match
    if (explanations.length === 0) {
      explanations.push(...card.benefits.slice(0, 2));
    }
    
    return explanations;
  }

  /**
   * Build response based on experience level and card information
   */
  buildResponse(card, explanations, promotions, experienceLevel) {
    const template = this.responseTemplates[experienceLevel];
    let response = '';
    
    // Header
    response += `${template.intro}\n\n`;
    
    // Card name and main benefits
    response += `💳 **${card.name}**\n`;
    
    if (template.structure === 'detailed') {
      // Detailed response for experts
      response += `🏦 ${card.bank}\n`;
      response += `💰 年費：${card.annualFee === 0 ? '免年費' : card.annualFee + '元'}\n\n`;
      
      response += `🎯 **主要優勢：**\n`;
      explanations.forEach(explanation => {
        response += `• ${explanation}\n`;
      });
      
      // Add specific rates if available
      if (card.cashbackRates) {
        response += `\n📊 **回饋率詳情：**\n`;
        Object.entries(card.cashbackRates).forEach(([category, rate]) => {
          if (rate > 1) {
            const categoryName = this.translateCategory(category);
            response += `• ${categoryName}：${rate}%\n`;
          }
        });
      }
      
      // Application requirements for experts
      if (card.applicationRequirements) {
        response += `\n📋 **申請條件：**\n`;
        response += `• 年齡：${card.applicationRequirements.minAge}歲以上\n`;
        if (card.applicationRequirements.minIncome > 0) {
          response += `• 年收入：${card.applicationRequirements.minIncome.toLocaleString()}元以上\n`;
        }
      }
      
    } else {
      // Simple response for beginners
      response += `✨ ${explanations.slice(0, 2).join('、')}\n`;
      
      if (card.annualFee === 0) {
        response += `💝 永久免年費\n`;
      }
      
      if (template.includeEducation) {
        response += `\n💡 **為什麼推薦：**\n`;
        response += `這張卡特別適合${card.targetAudience?.[0] || '一般用戶'}，`;
        response += `使用簡單且${card.annualFee === 0 ? '無年費負擔' : '回饋豐富'}。\n`;
      }
    }
    
    // Add current promotions
    if (promotions && promotions.length > 0) {
      response += `\n🎁 **限時優惠：**\n`;
      promotions.slice(0, 2).forEach(promo => {
        response += `• ${promo.description}\n`;
        if (promo.terms) {
          response += `  ${promo.terms}\n`;
        }
      });
    }
    
    // Call to action based on experience level
    if (experienceLevel === 'beginner') {
      response += `\n💬 想了解更多申請流程或有其他問題嗎？`;
    } else {
      response += `\n💬 需要與其他卡片比較或了解詳細申請條件嗎？`;
    }
    
    return response.trim();
  }

  /**
   * Translate category codes to Chinese names
   */
  translateCategory(category) {
    const categoryMap = {
      'overseas': '海外消費',
      'dining': '餐廳用餐',
      'supermarket': '超市購物',
      'online': '網路購物',
      'digital': '數位通路',
      'all': '所有消費',
      'mobile': '行動支付',
      'streaming': '串流平台',
      'gas': '加油站',
      'transport': '交通運輸',
      'general': '一般消費'
    };
    return categoryMap[category] || category;
  }

  /**
   * Match user requirements to card features for scoring
   */
  matchUserRequirementsToCard(userMessage, card) {
    const lowerMessage = userMessage.toLowerCase();
    const matches = [];
    
    // Store-specific matching
    if (card.specificStores) {
      Object.entries(card.specificStores).forEach(([store, rate]) => {
        if (lowerMessage.includes(store.toLowerCase())) {
          matches.push({
            type: 'store',
            feature: store,
            value: rate,
            relevance: 'high'
          });
        }
      });
    }
    
    // Category matching
    const categoryKeywords = {
      '海外': 'overseas',
      '網購': 'online',
      '餐廳': 'dining',
      '超市': 'supermarket',
      '數位': 'digital'
    };
    
    Object.entries(categoryKeywords).forEach(([keyword, category]) => {
      if (lowerMessage.includes(keyword) && card.cashbackRates?.[category]) {
        matches.push({
          type: 'category',
          feature: keyword,
          value: card.cashbackRates[category],
          relevance: 'medium'
        });
      }
    });
    
    // Annual fee matching
    if (lowerMessage.includes('免年費') && card.annualFee === 0) {
      matches.push({
        type: 'fee',
        feature: '免年費',
        value: 0,
        relevance: 'high'
      });
    }
    
    return matches;
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FallbackRecommendationGenerator;
}
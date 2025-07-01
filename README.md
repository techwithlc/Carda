# Carda - AI Credit Card Recommendation Chatbot

An intelligent LINE chatbot that provides personalized credit card recommendations for users in Taiwan and other regions. Built with n8n, integrated with Perplexity AI for real-time credit card information, and uses Supabase for conversation history management.

## 🌟 Features

- **Multi-Region Support**: Supports Taiwan, Malaysia, Singapore, USA, and Hong Kong
- **Intelligent Conversation**: Context-aware responses with conversation memory
- **Real-time Information**: Uses Perplexity AI for up-to-date credit card data
- **LINE Integration**: Seamless communication through LINE Bot
- **Conversation History**: Persistent chat history with Supabase
- **Smart Region Detection**: Automatically detects user region from message content
- **Loading Indicators**: Shows typing indicators during processing

## 🏗️ System Architecture

Built with n8n automation platform integrating:
- **LINE Bot API**: User messaging interface  
- **Perplexity AI**: Real-time credit card search
- **Supabase**: Conversation history storage

## 🤖 Supported Conversation Types

### Greetings
- "嗨", "你好", "Hello"
- Responds with welcome message

### Credit Card Inquiries
- **7-11 Specific**: "7-11信用卡推薦"
- **Best Rewards**: "哪張卡回饋最高"
- **Bank Specific**: "國泰信用卡怎麼樣"
- **Comparisons**: "比較這些信用卡"

### Region Detection
The system automatically detects user region based on keywords:
- **Taiwan**: Default region
- **Malaysia**: "馬來西亞", "CIMB", "Maybank"
- **Singapore**: "新加坡", "DBS", "OCBC", "UOB"
- **USA**: "美國", "Chase", "Citi", "American Express"
- **Hong Kong**: "香港", "恒生", "HSBC"

## 📊 How It Works

1. User sends message via LINE
2. System detects user's region automatically  
3. Retrieves conversation history for context
4. Searches for real-time credit card information
5. Generates intelligent, personalized response
6. Saves conversation and sends reply back to user

## 📱 How to Use

### Find the Bot on LINE
Add the bot on LINE: **@952ohxih**

### Usage Examples

**User**: "7-11回饋最高的信用卡是哪張？"
**Bot**: *Searches for 7-11 credit card rewards and provides current recommendations*

**User**: "比較國泰和中信的信用卡"
**Bot**: *Provides detailed comparison of specified bank credit cards*

**User**: "我是馬來西亞人，推薦信用卡"
**Bot**: *Automatically detects Malaysia region and provides local credit card recommendations*

## 🐛 回報問題 / Report Issues

如果您在使用過程中遇到任何問題，歡迎在此 GitHub Repository 建立 Issue 回報！

If you encounter any issues while using the bot, please create an Issue in this GitHub Repository!

- 🔗 回報問題 / Report Issue: [Create New Issue](https://github.com/lawrencechen0921/Carda/issues/new)
- 📧 聯絡 / Contact: 透過 LINE Bot @952ohxih

## 🤝 意見回饋 / Feedback

我們歡迎任何改善建議！請透過 GitHub Issues 分享您的想法。

We welcome any suggestions for improvement! Please share your ideas via GitHub Issues.

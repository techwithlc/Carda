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

## 🏗️ Architecture

The system is built using n8n automation platform with the following components:

### Core Services
- **LINE Bot**: Receives and sends messages
- **Perplexity AI**: Provides real-time credit card search capabilities
- **Supabase**: Database for conversation history and user data
- **n8n**: Workflow automation platform

### Key Features
- Region-specific credit card recommendations
- Intelligent response handling for greetings, questions, and comparisons
- Conversation context awareness
- Error handling and fallback responses

## 🔧 Setup

### Environment Variables
```env
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_API_KEY=your_supabase_api_key
```

### Supabase Database Schema
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

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

## 📊 Workflow Components

1. **LINE Webhook**: Receives incoming messages
2. **Environment Setup**: Validates required API keys
3. **User Info Extraction**: Parses LINE webhook data
4. **Region Detection**: Identifies user's geographic region
5. **Chat History Retrieval**: Fetches recent conversation context
6. **Perplexity Search**: Queries for credit card information
7. **Response Generation**: Creates intelligent, context-aware responses
8. **Database Logging**: Saves conversation to Supabase
9. **LINE Response**: Sends formatted message back to user

## 🚀 Deployment

1. Import the n8n workflow from `cardsavepropropro.json`
2. Configure environment variables in n8n
3. Set up LINE Bot webhook endpoint
4. Configure Supabase database
5. Activate the workflow

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

## 🔍 Technical Details

- **Response Time**: ~3-5 seconds (includes search and processing)
- **Message Length**: Limited to 1000 characters for optimal performance
- **Chat History**: Stores last 5 conversations per user
- **Error Handling**: Graceful fallbacks with user-friendly error messages
- **Rate Limiting**: Built-in protections against API abuse

## 🛠️ Troubleshooting

### Common Issues
1. **No Response**: Check environment variables and API keys
2. **Search Errors**: Verify Perplexity AI API connectivity
3. **Database Issues**: Confirm Supabase configuration and permissions
4. **LINE Integration**: Validate webhook URL and channel access token

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for improvements.

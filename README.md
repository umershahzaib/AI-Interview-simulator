# InterviewAI - AI-Powered Interview Simulator

Practice job interviews with AI and build confidence. InterviewAI is a production-quality application that conducts realistic interviews using Google's Gemini AI.

![InterviewAI](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-blue)

## Features

- 🤖 **AI-Powered Interviews** - Dynamic questions that adapt to your answers
- 📄 **Resume-Aware** - Upload your resume for personalized questions
- 💬 **Dynamic Follow-ups** - Natural conversation flow based on your responses
- 📊 **Detailed Feedback** - Performance evaluation with actionable insights
- 🎯 **Multiple Interview Types** - HR, Technical, Behavioral, Mixed, or Custom
- 🤖 **Google Gemini AI** - Powered by Google's advanced Gemini AI model
- 📈 **Track Progress** - Review past interviews and identify weak areas

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **AI Engine:** Google Gemini AI
- **Validation:** Zod
- **Icons:** Lucide React

## Prerequisites

Before you begin, ensure you have the following:

1. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```

2. **npm** or **yarn**
   ```bash
   npm --version
   ```

3. **Google Gemini API Key** - Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Visit the link above
   - Sign in with your Google account
   - Click "Get API Key" or "Create API Key"
   - Copy your API key for the next step

## Installation

### 1. Clone or Download this Project

If you received this as a directory, navigate to it:
```bash
cd "AI Interview simulator"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Google Gemini API

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Replace `your_actual_api_key_here` with the API key you got from Google AI Studio.

### 4. Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Usage

### Creating Your First Interview

1. Navigate to **Start Interview** from the homepage
2. Enter the **Job Title** (e.g., "Senior Software Engineer")
3. Paste the **Job Description**
4. (Optional) Upload your **Resume PDF** for personalized questions
5. Select **Interview Type**:
   - **HR Interview** - Culture fit, motivation, soft skills
   - **Technical Interview** - Technical knowledge, problem-solving
   - **Behavioral Interview** - Past experiences using STAR method
   - **Mixed Interview** - Combination of all types
   - **Custom Interview** - General questions
6. Choose **Difficulty Level** (Beginner, Intermediate, Advanced)
7. Set **Number of Questions** (5, 10, 15, or 20)
8. Click **Start Interview**

### During the Interview

- The AI will ask questions one at a time
- Type your answer in the text area
- Press **Enter** to submit (Shift+Enter for new line)
- The AI generates follow-up questions based on your responses
- Answer all questions to receive your evaluation

### After the Interview

- View your **Overall Score** and performance breakdown
- Review your **Strengths** and **Weaknesses**
- Read **Improvement Suggestions**
- See **Better Answer Examples** for specific questions
- Practice again with **New Interview**

### Viewing History

- Navigate to **History** to see all past interviews
- Filter by type, difficulty, or status
- Click any interview to view results or continue

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── interview/
│   │   │   ├── evaluate/route.ts    # Evaluation API
│   │   │   ├── question/route.ts    # Question generation
│   │   │   └── start/route.ts       # Opening message
│   │   └── ollama/
│   │       └── health/route.ts      # Health check
│   ├── dashboard/page.tsx           # Dashboard
│   ├── history/page.tsx             # Interview history
│   ├── interview/
│   │   ├── new/page.tsx             # Create interview
│   │   └── [id]/
│   │       ├── page.tsx             # Interview chat
│   │       └── results/page.tsx     # Results & evaluation
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
├── components/
│   └── ui/                          # shadcn/ui components
├── lib/
│   ├── ai/
│   │   ├── ollama.ts               # Ollama client
│   │   ├── interviewer.ts          # Interview agent
│   │   ├── evaluator.ts            # Evaluation agent
│   │   └── resume-analyzer.ts      # Resume parsing
│   ├── types/
│   │   └── interview.ts            # TypeScript types & Zod schemas
│   └── utils/
       ├── storage.ts              # LocalStorage utilities
│       └── cn.ts                   # Class name utilities
├── .env.local                      # Environment variables
├── package.json
└── README.md
```

## Troubleshooting

### Gemini API Issues

**Problem:** "Gemini API key not configured" or "Cannot connect to Gemini"

**Solutions:**
1. Verify your API key is set in `.env.local`:
   ```bash
   cat .env.local
   ```

2. Make sure the API key is valid:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Verify your key hasn't expired
   - Generate a new key if needed

3. Check your `.env.local` format:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```

### API Quota Exceeded

**Problem:** "Gemini API quota exceeded"

**Solution:** 
- Google Gemini has free tier limits
- Wait for quota to reset (usually daily)
- Or upgrade your Google Cloud account for higher limits

### Slow Response Times

**Problem:** Interview generation is slow

**Solutions:**
1. Check your internet connection
2. Gemini API response times depend on Google's servers
3. Try using a different model in `.env.local`:
   ```env
   GEMINI_MODEL=gemini-1.5-flash  # Faster, lighter model
   ```

### Port Already in Use

**Problem:** Port 3000 is already in use

**Solution:** Run on a different port:
```bash
npm run dev -- -p 3001
```

## Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Features Roadmap

### Current Version (MVP)
- ✅ Text-based interview
- ✅ Dynamic question generation
- ✅ Resume upload and analysis
- ✅ Performance evaluation
- ✅ Interview history
- ✅ Google Gemini AI integration

### Future Enhancements
- 🔲 Voice interview mode (Speech-to-Text & Text-to-Speech)
- 🔲 Database persistence (PostgreSQL + Prisma)
- 🔲 User authentication
- 🔲 Advanced analytics and progress tracking
- 🔲 Custom interview templates
- 🔲 Export interview transcripts
- 🔲 Multiple language support

## Architecture

### AI Agent System

The application uses a modular AI agent architecture:

- **Interviewer Agent** (`interviewer.ts`) - Generates contextual questions
- **Evaluator Agent** (`evaluator.ts`) - Analyzes performance and provides feedback
- **Resume Analyzer** (`resume-analyzer.ts`) - Extracts structured data from PDFs

This design makes it easy to:
- Add new agent types
- Improve individual agents independently
- Support multi-agent orchestration in the future

### Data Flow

1. User creates interview → Stored in localStorage
2. User answers question → Sent to API route
3. API calls Ollama → Generates next question
4. Question displayed → User answers
5. Interview completes → Evaluation generated
6. Results displayed → Stored for history

## Performance Considerations

- **API Calls:** Each question and evaluation makes API calls to Google Gemini
- **Response Speed:** Typically 2-5 seconds per question depending on complexity
- **Storage:** Interviews stored in browser localStorage (no database required for MVP)
- **Cost:** Google Gemini has a generous free tier suitable for practice

## Security & Privacy

- ✅ API calls made securely to Google Gemini
- ✅ Resume data processed through Gemini API (covered by Google's privacy policy)
- ✅ Interview history stored locally in browser
- ✅ No data stored on external servers except Google's API processing
- ⚠️  Make sure to keep your Gemini API key secure and never commit it to version control

## Contributing

This is a portfolio project. Feel free to fork and customize for your own use.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for interview practice**

For issues or questions, please check the troubleshooting section above.

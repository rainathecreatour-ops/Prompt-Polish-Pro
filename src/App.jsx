import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, Zap, BookOpen, Copy, Check, RotateCcw, Image, User, Briefcase, Lightbulb, Code, Palette, TrendingUp, MessageSquare, Film, Lock } from 'lucide-react';

const PromptPolishPro = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showInactivityPrompt, setShowInactivityPrompt] = useState(false);
  const [currentMode, setCurrentMode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [conversationMemory, setConversationMemory] = useState({
    preferredTool: null,
    preferredStyle: null,
    preferredLength: null,
    mode: null
  });
  const messagesEndRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  // CHANGE THIS TO YOUR DESIRED ACCESS CODE
  const VALID_ACCESS_CODE = "PROMPT2025";

  const handleAccessSubmit = (e) => {
    e.preventDefault();
    if (accessCode.toUpperCase() === VALID_ACCESS_CODE) {
      setIsAuthenticated(true);
      setAccessError('');
      localStorage.setItem('promptPolishAccess', 'true');
    } else {
      setAccessError('Invalid access code. Please try again.');
    }
  };

  useEffect(() => {
    const savedAccess = localStorage.getItem('promptPolishAccess');
    if (savedAccess === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (messages.length > 0 && !isLoading && !showQuickActions) {
      inactivityTimerRef.current = setTimeout(() => {
        setShowInactivityPrompt(true);
      }, 30000);
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [messages, isLoading, showQuickActions]);

  useEffect(() => {
    if (input.trim()) {
      setShowInactivityPrompt(false);
    }
  }, [input]);

  const systemPrompt = `You are Prompt Polish Pro, a friendly expert assistant designed to help users write better prompts — not to perform tasks unless explicitly asked.

Your core purpose is to:
- Upgrade simple prompts into polished, detailed, professional prompts
- Rewrite prompts with new wording while preserving the original meaning
- Build full image, character, or avatar prompts using minimal questions
- Train users to improve their own prompt-writing skills

Your tone must ALWAYS be: Warm, Calm, Clear, Encouraging, Non-judgmental, Professional.

SECTION 1 — INPUT MODE LOGIC

1. Clarify Intent When Needed
If the user's request could mean more than one thing (upgrade, rewrite, or execute), ask:
"Do you want me to upgrade this prompt, rewrite it, or generate the actual final output?"

2. Mandatory Upgrade Rule
If the user gives a simple command like "write 10 business names" or "make a logo prompt", you MUST NOT execute the task. You MUST first create a polished, upgraded prompt.
Only generate final results if the user explicitly says: "do it for me", "generate it", "give me the names", "write the script", "create the actual output"

3. If a request sounds like execution but could be a prompt request, assume the user wants a prompt upgrade.

SECTION 2 — UPGRADE & REWRITE MODES

A) Prompt Upgrade Mode
Format exactly:
Here's your upgraded prompt:
"[final polished prompt]"

B) Prompt Rewrite Mode
Format exactly:
Here's your rewritten version:
"[rewritten prompt]"

C) Ask about length if not specified: "Do you want the upgraded prompt to be short, medium, or detailed?"

D) Ask when appropriate: "Do you want Speed mode (quick, short prompts) or Deep mode (high-detail prompts)?"

SECTION 3 — IMAGE PROMPT LOGIC

1. Ask the Tool First: "Which image tool do you want to use? (Canva, Google ImageFX, Microsoft Designer, Adobe Express, Midjourney, Leonardo, or another?)"

2. Ask the Style: "What style do you want — realistic, cartoonish, anime, 3D, watercolor, digital painting, or another?"

3. Adapt formatting based on the tool selected.

SECTION 4 — CHARACTER / AVATAR CREATION
STRICT 3-QUESTION RULE

Ask exactly three questions:
1. "Which image tool do you want to use?"
2. "What style do you want — realistic, cartoonish, anime, 3D, watercolor, or another?"
3. "To create a precise character, can you give me their age, gender, ethnicity, height/build, hairstyle, clothing style, accessories, personality or mood, profession or role, unique features (tattoos, piercings, scars, magic details, makeup), and whether they should have a name?"

Mood/personality is mandatory.

SECTION 5 — PET / ANIMAL CREATION
Ask exactly:
1. Tool
2. Style
3. "What breed, color, age (young/adult/senior), markings, personality or mood, and action or behavior should the animal have?"

SECTION 6 — TRAINING MODE
Triggered when user says: "train me," "teach me," or "I want to improve."

Step 1: Ask "What level are you: beginner, intermediate, or advanced?" and "Do you want to practice text prompts, image prompts, or both?"
Step 2: Provide exercises (Rewrite Challenge, Fill-the-Gaps, Transformation Task)
Step 3: Give encouraging feedback with improved versions
Step 4: Progress from beginner → intermediate → advanced

SECTION 7 — CONVERSATION MEMORY
Remember within conversation: preferred tool, style, output length, speed vs deep mode.

SECTION 8 — AFTER EVERY UPGRADED PROMPT
Ask once: "Want me to make a shorter version, a more advanced version, or adapt it for a specific AI tool?"

Keep responses concise and supportive. Never overwhelm the user.`;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickActions(false);
    setShowInactivityPrompt(false);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

 const response = await fetch("/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    system: systemPrompt,
    messages: [...conversationHistory, userMessage],
  })
});

      const data = await response.json();

// Check if response is OK
if (!response.ok) {
  console.error('API Error:', data);
  setMessages(prev => [...prev, { 
    role: 'assistant', 
    content: "I apologize, but I encountered an error. Please try again." 
  }]);
  setShowQuickActions(true);
  return;
}

// Parse the response
let assistantResponse = '';
if (data.content && Array.isArray(data.content)) {
  assistantResponse = data.content
    .map(item => (item.type === "text" ? item.text : ""))
    .filter(Boolean)
    .join("\n");
} else if (data.error) {
  console.error('API Error:', data.error);
  setMessages(prev => [...prev, { 
    role: 'assistant', 
    content: "I apologize, but I encountered an error: " + data.error.message 
  }]);
  setShowQuickActions(true);
  return;
}

if (!assistantResponse) {
  setMessages(prev => [...prev, { 
    role: 'assistant', 
    content: "I received an empty response. Please try again." 
  }]);
  setShowQuickActions(true);
  return;
}

setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
      fet
      if (assistantResponse.toLowerCase().includes('training') || assistantResponse.toLowerCase().includes('exercise')) {
        setCurrentMode('training');
      } else if (assistantResponse.toLowerCase().includes('image tool') || assistantResponse.toLowerCase().includes('character')) {
        setCurrentMode('image');
      } else if (assistantResponse.includes('upgraded prompt:')) {
        setCurrentMode('upgrade');
      } else if (assistantResponse.includes('rewritten version:')) {
        setCurrentMode('rewrite');
      }

      const isAskingQuestion = assistantResponse.includes('?') && 
        (assistantResponse.toLowerCase().includes('do you want') ||
         assistantResponse.toLowerCase().includes('would you like') ||
         assistantResponse.toLowerCase().includes('which') ||
         assistantResponse.toLowerCase().includes('what') ||
         assistantResponse.toLowerCase().includes('can you') ||
         assistantResponse.toLowerCase().includes('should'));
      
      if (!isAskingQuestion) {
        setTimeout(() => {
          setShowQuickActions(true);
        }, 300);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I encountered an error. Please try again." 
      }]);
      setShowQuickActions(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text, index) => {
    const match = text.match(/"([^"]*)"/);
    const textToCopy = match ? match[1] : text;
    
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReset = () => {
    setMessages([]);
    setShowQuickActions(false);
    setShowInactivityPrompt(false);
    setCurrentMode(null);
    setSelectedCategory(null);
    setConversationMemory({
      preferredTool: null,
      preferredStyle: null,
      preferredLength: null,
      mode: null
    });
  };

  const quickActions = [
    { label: "Upgrade my prompt", icon: Sparkles, color: "from-purple-500 to-pink-500" },
    { label: "Rewrite this prompt", icon: RefreshCw, color: "from-blue-500 to-cyan-500" },
    { label: "Train me to write better prompts", icon: BookOpen, color: "from-green-500 to-emerald-500" },
    { label: "Create an image prompt", icon: Image, color: "from-orange-500 to-red-500" }
  ];

  const categories = [
    {
      name: "Business Owners",
      icon: Briefcase,
      color: "from-blue-600 to-blue-400",
      prompts: [
        { text: "Create a business plan outline", desc: "Strategic planning" },
        { text: "Write a pitch deck for investors", desc: "Fundraising" },
        { text: "Generate customer persona profiles", desc: "Marketing" },
        { text: "Create a competitive analysis report", desc: "Market research" }
      ]
    },
    {
      name: "Entrepreneurs",
      icon: Lightbulb,
      color: "from-yellow-600 to-orange-400",
      prompts: [
        { text: "Generate startup name ideas", desc: "Branding" },
        { text: "Create a product launch strategy", desc: "Go-to-market" },
        { text: "Write an elevator pitch", desc: "Networking" },
        { text: "Design a lean canvas model", desc: "Business model" }
      ]
    },
    {
      name: "Content Creators",
      icon: Film,
      color: "from-purple-600 to-pink-400",
      prompts: [
        { text: "Create viral social media hooks", desc: "Social media" },
        { text: "Write YouTube video scripts", desc: "Video content" },
        { text: "Generate blog post outlines", desc: "Blogging" },
        { text: "Create content calendar ideas", desc: "Planning" }
      ]
    },
    {
      name: "Marketers",
      icon: TrendingUp,
      color: "from-green-600 to-emerald-400",
      prompts: [
        { text: "Write ad copy variations", desc: "Advertising" },
        { text: "Create email marketing campaigns", desc: "Email marketing" },
        { text: "Generate SEO meta descriptions", desc: "SEO" },
        { text: "Design landing page copy", desc: "Conversion" }
      ]
    },
    {
      name: "Developers",
      icon: Code,
      color: "from-indigo-600 to-blue-400",
      prompts: [
        { text: "Write technical documentation", desc: "Documentation" },
        { text: "Create API endpoint descriptions", desc: "API design" },
        { text: "Generate code review prompts", desc: "Code quality" },
        { text: "Design database schema outlines", desc: "Database" }
      ]
    },
    {
      name: "Designers",
      icon: Palette,
      color: "from-pink-600 to-rose-400",
      prompts: [
        { text: "Create design brief templates", desc: "Project planning" },
        { text: "Generate color palette concepts", desc: "Color theory" },
        { text: "Write user interface descriptions", desc: "UI design" },
        { text: "Design mood board prompts", desc: "Visual direction" }
      ]
    },
    {
      name: "Copywriters",
      icon: MessageSquare,
      color: "from-cyan-600 to-teal-400",
      prompts: [
        { text: "Create compelling headlines", desc: "Headlines" },
        { text: "Write product descriptions", desc: "E-commerce" },
        { text: "Generate call-to-action phrases", desc: "CTAs" },
        { text: "Create brand voice guidelines", desc: "Brand identity" }
      ]
    },
    {
      name: "Character Artists",
      icon: User,
      color: "from-violet-600 to-purple-400",
      prompts: [
        { text: "Design fantasy character concepts", desc: "Fantasy" },
        { text: "Create realistic portrait prompts", desc: "Portraits" },
        { text: "Generate game character designs", desc: "Gaming" },
        { text: "Build avatar creation guides", desc: "Avatars" }
      ]
    }
  ];

  const QuickActionButtons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {quickActions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <button
            key={idx}
            onClick={() => {
              setInput(action.label);
              setShowInactivityPrompt(false);
            }}
            className="group relative overflow-hidden flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-lg transition-all border-2 border-gray-200 hover:border-transparent"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <div className={`bg-gradient-to-r ${action.color} p-2 rounded-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-700 font-medium relative z-10">{action.label}</span>
          </button>
        );
      })}
    </div>
  );

  const handleContinue = () => {
    setShowInactivityPrompt(false);
  };

  const handleMainMenu = () => {
    setShowInactivityPrompt(false);
    setShowQuickActions(true);
    setSelectedCategory(null);
  };

  const getModeInfo = () => {
    const modes = {
      upgrade: { icon: Sparkles, label: "Upgrade Mode", color: "purple" },
      rewrite: { icon: RefreshCw, label: "Rewrite Mode", color: "blue" },
      training: { icon: BookOpen, label: "Training Mode", color: "green" },
      image: { icon: Image, label: "Image Prompt Mode", color: "orange" }
    };
    return modes[currentMode];
  };

  // Access Code Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-indigo-100">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl inline-flex mb-4">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Prompt Polish Pro
            </h1>
            <p className="text-gray-600">Enter your access code to continue</p>
          </div>

          <form onSubmit={handleAccessSubmit} className="space-y-4">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setAccessError('');
                }}
                placeholder="Enter your access code"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all text-center text-lg tracking-wider uppercase"
                autoFocus
              />
              {accessError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {accessError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all hover:shadow-lg"
            >
              Access App
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Don't have an access code?<br />
              Contact support or check your purchase email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
          }
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl pulse-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Prompt Polish Pro
                </h1>
                <p className="text-sm text-gray-600">Transform simple ideas into powerful prompts</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden md:inline">Start Fresh</span>
              </button>
            )}
          </div>
          {currentMode && (
            <div className="mt-3 flex items-center gap-2">
              {(() => {
                const modeInfo = getModeInfo();
                const Icon = modeInfo.icon;
                return (
                  <div className={`flex items-center gap-2 px-3 py-1.5 bg-${modeInfo.color}-50 border border-${modeInfo.color}-200 rounded-full`}>
                    <Icon className={`w-4 h-4 text-${modeInfo.color}-600`} />
                    <span className={`text-sm font-medium text-${modeInfo.color}-700`}>{modeInfo.label}</span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Message */}
        {messages.length === 0 && !selectedCategory && (
          <div className="mb-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to Prompt Polish Pro! 👋
              </h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Choose your category to get started with tailored prompt templates, or use the quick actions below.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {categories.map((category, idx) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedCategory(category)}
                      className="group p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all"
                    >
                      <div className={`bg-gradient-to-r ${category.color} p-3 rounded-lg inline-flex mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">{category.name}</h4>
                      <p className="text-sm text-gray-500">{category.prompts.length} prompts</p>
                    </button>
                  );
                })}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <QuickActionButtons />
            </div>
          </div>
        )}

        {/* Category View */}
        {selectedCategory && messages.length === 0 && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = selectedCategory.icon;
                    return (
                      <div className={`bg-gradient-to-r ${selectedCategory.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedCategory.name}</h2>
                    <p className="text-gray-600">Select a prompt template to get started</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCategory.prompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt.text)}
                    className="text-left p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-indigo-50 hover:to-purple-50 transition-all border-2 border-gray-200 hover:border-indigo-300 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                          {prompt.text}
                        </p>
                        <p className="text-sm text-gray-500">{prompt.desc}</p>
                      </div>
                      <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white shadow-md border border-indigo-100'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="space-y-2">
                    {msg.content.split('\n').map((line, i) => {
                      if (line.startsWith('"') && line.endsWith('"')) {
                        const isUpgrade = msg.content.includes('upgraded prompt:');
                        const isRewrite = msg.content.includes('rewritten version:');
                        return (
                          <div key={i} className="relative">
                            <div className={`border-l-4 p-4 my-3 rounded-r-lg ${
                              isUpgrade ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-500' :
                              isRewrite ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500' :
                              'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-500'
                            }`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2 flex-1">
                                  {isUpgrade && <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />}
                                  {isRewrite && <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />}
                                  <p className="text-gray-800 font-medium italic flex-1">{line}</p>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(line, idx)}
                                  className="flex-shrink-0 p-2 hover:bg-white/50 rounded-lg transition-all"
                                  title="Copy to clipboard"
                                >
                                  {copiedIndex === idx ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>
                              </div>
                            </div>
                            </div>
                        );
                      }
                      return line ? <p key={i} className="text-gray-700 mb-2">{line}</p> : null;
                    })}
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Inactivity Prompt */}
        {showInactivityPrompt && !showQuickActions && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <p className="text-gray-700 font-medium mb-4">
                Still working on this, or would you like to try something else?
              </p>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleContinue}
                  className="flex-1 bg-white text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 font-medium"
                >
                  Continue this task
                </button>
                <button
                  onClick={handleMainMenu}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium"
                >
                  Back to main menu
                </button>
              </div>
              <div className="pt-4 border-t border-amber-200">
                <p className="text-sm text-gray-600 mb-3">Or choose a new action:</p>
                <QuickActionButtons />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {messages.length > 0 && showQuickActions && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">What's next?</h3>
              <QuickActionButtons />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="sticky bottom-6">
          <div className="bg-white rounded-2xl shadow-xl border border-indigo-200 p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your prompt or idea here..."
                className="flex-1 resize-none border-0 focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400"
                rows="3"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PromptPolishPro;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Zap,
  TrendingUp,
  Target,
  DollarSign,
  Lightbulb,
  BarChart3,
  Shield
} from "lucide-react";
import { useState } from "react";

const AIAssistant = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Welcome to GOD MODE: VOID ∞ HYPERCORE Financial Assistant. I am your AI-powered financial advisor, equipped with quantum-level insights to optimize your financial strategy. How can I assist you today?',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'user',
      content: 'How can I optimize my savings strategy?',
      timestamp: new Date().toISOString()
    },
    {
      id: 3,
      type: 'assistant', 
      content: 'Based on your financial profile, I recommend implementing a three-tier savings approach: 1) Emergency fund with 6 months expenses, 2) High-yield savings for short-term goals, 3) Investment portfolio for long-term wealth building. Your current savings rate of 15% is excellent - consider increasing to 20% if possible.',
      timestamp: new Date().toISOString()
    }
  ]);

  const quickPrompts = [
    { icon: TrendingUp, text: "Analyze my spending patterns", category: "Analysis" },
    { icon: Target, text: "Optimize my savings goals", category: "Goals" },
    { icon: DollarSign, text: "Investment recommendations", category: "Investing" },
    { icon: Shield, text: "Budget planning assistance", category: "Planning" },
    { icon: BarChart3, text: "Financial health checkup", category: "Health" },
    { icon: Lightbulb, text: "Money-saving tips", category: "Tips" }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newUserMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    };

    const aiResponse = {
      id: messages.length + 2,
      type: 'assistant' as const,
      content: `I understand you're asking about "${message}". As your HYPERCORE AI assistant, I'm analyzing your financial data through quantum algorithms. However, for real-time AI responses, you'll need to connect this platform to an AI service backend. In the meantime, I can provide pre-programmed financial insights and guidance.`,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, newUserMessage, aiResponse]);
    setMessage("");
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="min-h-screen void-gradient">
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      <Navigation className="relative z-10" />

      <main className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            
            {/* Sidebar - AI Info & Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* AI Assistant Info */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Bot className="h-16 w-16 text-primary hypercore-glow" />
                      <div className="absolute inset-0 animate-pulse">
                        <Bot className="h-16 w-16 text-accent opacity-50" />
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-primary text-glow">GOD MODE</CardTitle>
                  <CardDescription>VOID ∞ HYPERCORE AI</CardDescription>
                  <Badge variant="secondary" className="hypercore-glow mt-2">
                    ONLINE
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-accent" />
                      <span>Quantum Financial Analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-success" />
                      <span>Real-time Risk Assessment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span>Predictive Modeling</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-warning" />
                      <span>Goal Optimization</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Prompts */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common financial queries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quickPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => handleQuickPrompt(prompt.text)}
                      >
                        <prompt.icon className="h-4 w-4 mr-3 shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{prompt.text}</div>
                          <div className="text-xs text-muted-foreground">{prompt.category}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3 flex flex-col">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm flex-1 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>HYPERCORE AI Assistant</CardTitle>
                      <CardDescription>Your personal financial strategist</CardDescription>
                    </div>
                    <Badge variant="secondary" className="hypercore-glow">
                      ACTIVE SESSION
                    </Badge>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              msg.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 text-foreground border border-border/30'
                            }`}
                          >
                            {msg.type === 'assistant' && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Bot className="h-4 w-4 text-accent" />
                                <span className="text-xs font-medium text-accent">HYPERCORE AI</span>
                              </div>
                            )}
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className="text-xs opacity-60 mt-2">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask me about your finances..."
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        className="hypercore-glow"
                        disabled={!message.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: For real AI responses, connect to an AI service provider
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIAssistant;
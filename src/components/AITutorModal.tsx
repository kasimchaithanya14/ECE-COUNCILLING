import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Send, X, User } from 'lucide-react';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AITutorModal: React.FC = () => {
  const { isAITutorOpen, setIsAITutorOpen } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Greetings! I am your CUTM ECE AI Tutor & Assistant. Supporting Group A (Verilog/MATLAB scripting) & Group B (Step-by-step concept explanations, formulas & hints). How can I assist you?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const presetPrompts = [
    'Explain Op-Amp Non-Inverting Feedback (Group B)',
    'Generate Verilog HDL for 4-bit Binary Counter (Group A)',
    'Micro Teaching 15-min breakdown of FIR vs IIR (Group B)',
    'MATLAB Simulink BPSK Modulation setup (Group A)',
  ];

  if (!isAITutorOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');

    setTimeout(() => {
      let responseText = '';

      if (text.toLowerCase().includes('op-amp') || text.toLowerCase().includes('group b')) {
        responseText = `🤖 **Group B Foundation AI Explanation:**\n\nThink of an Op-Amp in non-inverting feedback like a microphone amplifier:\n- Input enters non-inverting (+) terminal.\n- Feedback gain formula: Gain = 1 + (Rf / R1).\n- Step 1: Identify Rf & R1 resistors.\n- Step 2: Calculate gain. High input impedance is maintained!`;
      } else if (text.toLowerCase().includes('verilog') || text.toLowerCase().includes('counter')) {
        responseText = `💻 **Group A Advanced AI Verilog Script:**\n\`\`\`verilog\nmodule binary_counter_4bit (\n    input wire clk,\n    input wire reset,\n    output reg [3:0] count\n);\n    always @(posedge clk or posedge reset) begin\n        if (reset)\n            count <= 4'b0000;\n        else\n            count <= count + 1'b1;\n    end\nendmodule\n\`\`\n*Implementation Tip:* Test using ModelSim/Vivado testbench with 10ns clock period.`;
      } else if (text.toLowerCase().includes('matlab') || text.toLowerCase().includes('bpsk')) {
        responseText = `🔬 **Group A Simulation Guide:**\nFor BPSK modulation in MATLAB Simulink:\n1. Use Bernoulli Binary Generator.\n2. Connect to BPSK Modulator Baseband block.\n3. Pass through AWGN Channel block.\n4. Observe constellation diagram on Scope.`;
      } else {
        responseText = `💡 **CUTM AI Tutor Response:**\n\nGreat courseware query! Based on your cohort:\n- For concept mastery, break into 3 micro-steps (Chunk Learning).\n- Would you like a numerical worked example or simulation file?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-obsidian-900 rounded-3xl shadow-neon-red-lg border border-cyberRed-800/60 overflow-hidden flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-cyberRed-950 via-cyberRed-900 to-obsidian-950 text-white flex items-center justify-between shrink-0 border-b border-cyberRed-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyberRed-950 rounded-2xl border border-cyberRed-800 shadow-neon-red">
              <Bot className="h-6 w-6 text-cyberRed-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">CUTM AI Tutor Studio</h3>
              <p className="text-xs text-cyberRed-400">Supporting Group A & Group B Differentiated Learning</p>
            </div>
          </div>

          <button
            onClick={() => setIsAITutorOpen(false)}
            className="p-1.5 rounded-full bg-obsidian-950 hover:bg-obsidian-800 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preset Prompt Pills */}
        <div className="p-3 bg-obsidian-950 border-b border-slate-800 flex gap-2 overflow-x-auto shrink-0">
          {presetPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-2xl bg-obsidian-900 border border-slate-800 text-[11px] font-bold text-slate-300 whitespace-nowrap hover:border-cyberRed-800 hover:text-white transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-cyberRed-600 text-white shadow-neon-red'
                    : 'bg-obsidian-950 text-cyberRed-400 border border-cyberRed-800'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyberRed-600 text-white font-bold rounded-tr-none shadow-neon-red'
                    : 'bg-obsidian-950 text-slate-200 rounded-tl-none border border-slate-800'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <span className="block text-[10px] opacity-60 text-right mt-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-obsidian-950 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask AI Tutor for step-by-step hints, Verilog code, or concept breakdown..."
              className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-cyberRed-900 bg-obsidian-900 text-white focus:outline-none focus:ring-2 focus:ring-cyberRed-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-2xl bg-cyberRed-600 hover:bg-cyberRed-500 text-white shadow-neon-red shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

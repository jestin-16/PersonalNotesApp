import React from 'react';
import { Sparkles, HelpCircle, BookOpen, ListChecks } from 'lucide-react';
import { motion } from 'motion/react';
import { Note } from '../types';

interface NotebookGuideProps {
  selectedNotes: Note[];
}

export const NotebookGuide: React.FC<NotebookGuideProps> = ({ selectedNotes }) => {
  if (selectedNotes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Notebook Guide</h3>
        <p className="text-slate-500 max-w-xs">
          Select sources on the left to generate a guide and start asking questions.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notebook Guide</h2>
          <p className="text-sm text-slate-500">{selectedNotes.length} sources selected</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> Summary
        </h3>
        <p className="text-blue-50 text-sm leading-relaxed">
          Based on your selected sources, this notebook focuses on {selectedNotes[0]?.title || 'your topics'}. 
          It contains information about key concepts, project requirements, and personal insights. 
          Use the chat below to dive deeper into specific details or generate a study guide.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: <HelpCircle className="h-5 w-5" />, title: 'FAQ', desc: 'Common questions answered' },
          { icon: <ListChecks className="h-5 w-5" />, title: 'Study Guide', desc: 'Key terms and summaries' },
          { icon: <BookOpen className="h-5 w-5" />, title: 'Table of Contents', desc: 'Structure of your sources' },
          { icon: <Sparkles className="h-5 w-5" />, title: 'Briefing Doc', desc: 'Executive summary' },
        ].map((item, i) => (
          <motion.button
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-start p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg mb-2">
              {item.icon}
            </div>
            <h4 className="font-medium text-slate-800 text-sm">{item.title}</h4>
            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
          </motion.button>
        ))}
      </div>

      <div className="pt-4">
        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          Suggested Questions
        </h4>
        <div className="space-y-2">
          {[
            "What are the main takeaways from these notes?",
            "Can you find the key dates mentioned?",
            "Summarize the technical requirements section.",
          ].map((q, i) => (
            <button 
              key={i}
              className="w-full text-left p-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

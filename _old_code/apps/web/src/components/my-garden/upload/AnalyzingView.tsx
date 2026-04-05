import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';

interface AnalyzingViewProps {
  analyzingText: string;
}

export function AnalyzingView({ analyzingText }: AnalyzingViewProps) {
  return (
    <motion.div 
      key="analyzing"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-24 px-4 text-center"
    >
      <div className="relative w-56 h-56 mx-auto mb-10">
        {/* Outer glowing rings */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-emerald-400 rounded-3xl blur-2xl"
        ></motion.div>
        
        {/* Scanner Box */}
        <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Leaf size={80} className="text-emerald-100" />
          </motion.div>
          
          {/* Laser Line */}
          <motion.div 
            animate={{ top: ['-10%', '110%', '-10%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1.5 bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,1)] z-10"
          />
          
          {/* Scanning Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"></div>
        </div>
      </div>
      
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4">AI đang phân tích...</h2>
      <div className="h-8">
        <AnimatePresence mode="wait">
          <motion.p 
            key={analyzingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-emerald-600 font-medium text-lg"
          >
            {analyzingText}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

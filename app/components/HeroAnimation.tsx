'use client';
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function HeroAnimation() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) return <div className="w-full h-[400px]" />
  
  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-xl z-5">
      <motion.div 
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full filter blur-xl opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div 
        className="absolute w-full max-w-md p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg z-10"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <div className="font-medium text-xl">Promptora</div>
          </div>
          <div className="text-sm font-medium text-green-500">Active</div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Total Prompts</div>
            <div className="text-2xl font-bold">1,234</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-xs text-muted-foreground">Active Creators</div>
              <div className="text-lg font-bold">321</div>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-xs text-muted-foreground">Tips This Month</div>
              <div className="text-lg font-bold">+2.5 ETH</div>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="text-xs text-muted-foreground mb-1">Recent Transactions</div>
            <motion.div 
              className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center justify-between mb-1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-xs">Tip</div>
              <div className="text-xs font-medium">+0.01 ETH</div>
            </motion.div>
            <motion.div 
              className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center justify-between mb-1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-xs">Vote</div>
              <div className="text-xs font-medium">+0.025 ETH</div>
            </motion.div>
            <motion.div 
              className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center justify-between"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="text-xs">Premium Prompt</div>
              <div className="text-xs font-medium">+1.50 ETH</div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
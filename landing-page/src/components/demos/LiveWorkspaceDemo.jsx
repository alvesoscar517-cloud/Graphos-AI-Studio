/**
 * LiveWorkspaceDemo - Interactive AI Workspace demo
 * User can type anything, press Enter to see demo response
 */
import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { AppFrame } from './DemoWrapper'
import Icon from '@components/common/Icon'

// Demo AI response
const DEMO_RESPONSE = `Hey there,

Thanks so much for reaching out! I really appreciate you taking the time.

Here's my take on this: I think the key is to keep things simple and authentic. Don't overthink it – just be yourself and let your personality shine through.

A few quick tips:
• Start with something personal or relatable
• Keep your sentences conversational, not robotic
• End with a clear call-to-action or next step

Would you like me to help you refine this further? I'm happy to adjust the tone or add more details!`

const LiveWorkspaceDemo = () => {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const textareaRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [])

  const handleSend = async () => {
    const userMessage = inputValue.trim()
    if (!userMessage || isTyping) return

    // Clear input and start
    setInputValue('')
    setIsTyping(true)
    setStreamedText('')

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', content: userMessage }
    setMessages((prev) => [...prev, userMsg])
    
    // Scroll after user message
    setTimeout(scrollToBottom, 100)

    // Wait a bit then start streaming AI response
    await new Promise((r) => setTimeout(r, 600))

    // Stream the demo response character by character for smoother effect
    let currentText = ''
    const chars = DEMO_RESPONSE.split('')
    
    for (let i = 0; i < chars.length; i++) {
      currentText += chars[i]
      setStreamedText(currentText)
      
      // Variable speed: faster for spaces, slower for punctuation
      const char = chars[i]
      let delay = 15 // base speed
      if (char === ' ') delay = 8
      else if (char === '\n') delay = 50
      else if (['.', '!', '?'].includes(char)) delay = 80
      else if ([',', ':'].includes(char)) delay = 40
      
      await new Promise((r) => setTimeout(r, delay))
      
      // Scroll periodically during streaming
      if (i % 50 === 0) scrollToBottom()
    }

    // Finalize - add AI message
    const aiMsg = { id: Date.now() + 1, role: 'assistant', content: DEMO_RESPONSE }
    setMessages((prev) => [...prev, aiMsg])
    setStreamedText('')
    setIsTyping(false)
    scrollToBottom()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const resetDemo = () => {
    setMessages([])
    setStreamedText('')
    setInputValue('')
    setIsTyping(false)
  }

  const hasContent = inputValue.trim().length > 0

  return (
    <AppFrame
      title="Graphos AI Studio - AI Workspace"
      className="max-w-6xl mx-auto"
    >
      <div className="flex flex-col h-[600px]">
        {/* Chat Area - Fixed height container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 lg:p-8 min-h-0"
        >
          <AnimatePresence mode="wait">
            {messages.length === 0 && !streamedText ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Icon name="message-square" size="xl" className="text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {t('demo.startConversation', 'Start a Conversation')}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  {t(
                    'demo.workspaceDescriptionNew',
                    'Type anything and press Enter to see how AI responds in your unique voice.'
                  )}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Messages */}
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'user' ? (
                      <div className="max-w-[70%] py-3 px-4 bg-gray-100 border border-gray-200 rounded-2xl">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                        {/* Action buttons */}
                        {!isTyping && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-1 mt-3"
                          >
                            <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                              <Icon name="copy" size="sm" />
                            </button>
                            <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                              <Icon name="refresh-cw" size="sm" />
                            </button>
                            <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                              <Icon name="volume-2" size="sm" />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Streaming text */}
                {streamedText && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full"
                  >
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {streamedText}
                      <span className="inline-block w-0.5 h-4 bg-cyan-500 ml-0.5 align-middle animate-pulse" />
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-5 lg:p-6">
          <div className="relative flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('workspace.askAnything', 'Ask anything...')}
              rows={1}
              disabled={isTyping}
              className="w-full border-none bg-transparent resize-none text-gray-700 text-sm px-4 pt-3 pb-2 outline-none min-h-[44px] max-h-[100px] placeholder:text-gray-400 disabled:opacity-60"
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 pb-3">
              {/* Left Tools */}
              <div className="flex items-center gap-0.5">
                {/* Plus button */}
                <button
                  disabled
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>

                {/* Model selector */}
                <button
                  disabled
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <span>Graphos Hyper</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>

              {/* Right - Send/Reset button */}
              <div className="flex items-center gap-2">
                {messages.length > 0 && !isTyping && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={resetDemo}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Icon name="rotate-ccw" size="xs" className="text-gray-500" />
                    Reset
                  </motion.button>
                )}
                <button
                  onClick={handleSend}
                  disabled={!hasContent || isTyping}
                  className={`inline-flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                    hasContent && !isTyping
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isTyping ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-spin"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  )
}

export default LiveWorkspaceDemo

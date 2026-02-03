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

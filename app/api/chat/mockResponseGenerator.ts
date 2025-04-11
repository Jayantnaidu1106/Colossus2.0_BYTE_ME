// Mock response generator for AI chat functionality

// Function to generate a mock response based on the user's message and weak topics
export function generateMockResponse(message: string, weakTopics: string[]): string {
  console.log('Generating mock response for:', message.substring(0, 50) + '...');

  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();

  // Extract keywords from the message
  const keywords = lowerMessage.split(/\s+/).filter(word => word.length > 3);
  console.log('Extracted keywords:', keywords);

  // Check if the message contains math-related keywords
  if (lowerMessage.includes('math') ||
      lowerMessage.includes('algebra') ||
      lowerMessage.includes('equation') ||
      lowerMessage.includes('calculus') ||
      lowerMessage.includes('solve')) {
    if (weakTopics.includes('Algebra') || weakTopics.includes('Math')) {
      return `I notice you're asking about math, which is one of the areas you're working to improve. Let me help you with that!

To solve math problems effectively, remember to break them down into smaller steps. ${getRandomMathTip()}

Does this help with your question? Feel free to ask for more specific examples if needed.`;
    } else {
      return `That's a great math question! ${getRandomMathTip()}

I hope this helps! Let me know if you need more clarification.`;
    }
  }

  // Check if the message contains science-related keywords
  else if (lowerMessage.includes('science') ||
           lowerMessage.includes('chemistry') ||
           lowerMessage.includes('physics') ||
           lowerMessage.includes('biology')) {
    if (weakTopics.includes('Chemistry') || weakTopics.includes('Physics')) {
      return `I see you're asking about science, which is one of the areas you're working to strengthen. Let me help you with that!

${getRandomScienceTip()}

Does this explanation make sense? I'm happy to provide more examples if needed.`;
    } else {
      return `Excellent science question! ${getRandomScienceTip()}

I hope this helps with your understanding! Let me know if you'd like to explore this topic further.`;
    }
  }

  // Default response for other types of questions
  else {
    // Create a more personalized response based on the message
    let responseIntro = `Thank you for your question about "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"! I'd be happy to help you with that.`;

    // Include some of the keywords in the response
    if (keywords.length > 0) {
      const topKeywords = keywords.slice(0, 3);
      responseIntro += `\n\nI see you're interested in ${topKeywords.join(', ')}. That's a fascinating topic!`;
    }

    return `${responseIntro}\n\n${message.trim().endsWith('?') ? 'To answer your question: ' : 'Here\'s what I can tell you: '}\n${getRandomGeneralResponse()}\n\nIs there anything specific about this topic you'd like me to explain in more detail?`;
  }
}

// Helper functions for generating random tips
function getRandomMathTip(): string {
  const tips = [
    "When solving equations, always make sure to perform the same operation on both sides to maintain equality.",
    "For word problems, try to identify the variables first, then translate the problem into mathematical expressions.",
    "Graphs can be powerful visual tools to understand relationships between variables. Try sketching them when possible.",
    "Practice is key in mathematics. Try solving similar problems with different values to reinforce your understanding.",
    "Remember that multiplication and division take precedence over addition and subtraction in the order of operations."
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function getRandomScienceTip(): string {
  const tips = [
    "In chemistry, the periodic table is organized by atomic number, which is the number of protons in an atom's nucleus.",
    "Newton's three laws of motion form the foundation of classical mechanics in physics.",
    "The cell is the basic structural and functional unit of all living organisms.",
    "Energy cannot be created or destroyed, only transformed from one form to another - this is the law of conservation of energy.",
    "Scientific theories are explanations supported by multiple lines of evidence, not just guesses or hypotheses."
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function getRandomGeneralResponse(): string {
  const responses = [
    "This is a fascinating topic with many different aspects to explore. Let's break it down step by step.",
    "I think the key to understanding this is to consider the fundamental principles involved.",
    "There are several important factors to consider when addressing this question.",
    "This is something many students find challenging at first, but with practice, it becomes much clearer.",
    "Let me provide you with a comprehensive explanation that should help clarify this concept."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

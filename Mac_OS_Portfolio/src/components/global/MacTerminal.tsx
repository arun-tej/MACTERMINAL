import { useState, useEffect, useRef } from 'react';
import { FaRegFolderClosed } from 'react-icons/fa6';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ChatHistory = {
  messages: Message[];
  input: string;
};

const PLACEHOLDER_MESSAGES = [
  'Type your question...',
  'How old are you?',
  'What are your skills?',
  'Where are you located?',
  'What projects have you worked on?',
];

export default function MacTerminal() {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({
    messages: [],
    input: '',
  });
  const [isTyping, setIsTyping] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentMessage = PLACEHOLDER_MESSAGES[currentPlaceholderIndex];

    const animatePlaceholder = () => {
      if (isDeleting) {
        if (placeholder.length === 0) {
          setIsDeleting(false);
          setCurrentPlaceholderIndex(
            (prev) => (prev + 1) % PLACEHOLDER_MESSAGES.length
          );
          timeout = setTimeout(animatePlaceholder, 400);
        } else {
          setPlaceholder((prev) => prev.slice(0, -1));
          timeout = setTimeout(animatePlaceholder, 80);
        }
      } else {
        if (placeholder.length === currentMessage.length) {
          timeout = setTimeout(() => setIsDeleting(true), 1500);
        } else {
          setPlaceholder(currentMessage.slice(0, placeholder.length + 1));
          timeout = setTimeout(animatePlaceholder, 120);
        }
      }
    };

    timeout = setTimeout(animatePlaceholder, 100);

    return () => clearTimeout(timeout);
  }, [placeholder, isDeleting, currentPlaceholderIndex]);

  const welcomeMessage = `Welcome to My Portfolio

Name: Arun Tej
Age: 26
Role: Backend Developer
Location: TEMPE, AZ

Contact: agnolas1@asu.edu
GitHub: github.com/arun-tej
LinkedIn: linkedin.com/in/chowdaryarun

Ask me anything!
`;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const systemPrompt = `IMPORTANT: You ARE Arun Tej himself. You must always speak in first-person ("I", "my", "me"). Never refer to "Arun" in third-person.
CURRENT DATE: ${formattedDate} - Always use this exact date when discussing the current date/year.

Example responses:
Q: "Where do you live?"
A: "I live in Tempe, AZ"

Q: "What's your background?"
A: "I'm a Backend Developer with experience in JAVA, Python, and spring boot"

Q: "How old are you?"
A: "I'm 26 years old"

Core details about me:
- I'm 26 years old
- I live in Tempe, AZ
- I'm a Backend Developer
- My email is agnolas1@asu.edu
- I was born in 1999
- I was born in India
- I have a Bachelor's degree in Computer Science

My technical expertise:
- Backend Development
- Java, Python, Kotlin, C++
- PostgreSQL, MySQL, MongoDB
- Spring Boot, Express.js
- REST APIs, GraphQL
- AWS, Docker, Kubernetes
- CI/CD, Git
- Agile/Scrum methodologies
- Problem-solving
- Data Structures and Algorithms
- System Design
- Cloud Computing
- Microservices Architecture
- Software Development Life Cycle (SDLC)
- Object-Oriented Programming (OOP)
- Test-Driven Development (TDD)
- Version Control (Git)
- Continuous Integration/Continuous Deployment (CI/CD)
- Agile Methodologies
- Web Development (HTML, CSS, JavaScript)

Response rules:
1. ALWAYS use first-person (I, me, my)
2. Never say "Arun" or refer to myself in third-person
3. Keep responses concise and professional
4. Use markdown formatting when appropriate
5. Maintain a friendly, conversational tone

If a question is unrelated to my work or portfolio, say: "That's outside my area of expertise. Feel free to email me at agnolas1@asu.edu and we can discuss further!"`;

  // Add welcome message on initial render
  useEffect(() => {
    setChatHistory((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        { role: 'assistant', content: welcomeMessage },
      ],
    }));
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatHistory((prev) => ({ ...prev, input: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = chatHistory.input.trim();

    if (!userInput) return;

    // Create a new messages array that includes the user input
    const newMessages: Message[] = [
      ...chatHistory.messages,
      { role: 'user', content: userInput },
    ];

    // Update state with the new messages array and clear the input field
    setChatHistory({ messages: newMessages, input: '' });
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Use newMessages so the API call gets the most recent chat history
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMessages,
          ],
        }),
      });

      const data = await response.json();

      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: 'assistant', content: data.message },
        ],
      }));
    } catch (error) {
      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: 'assistant',
            content:
              "I'm having trouble processing that. Please email me at agnolas1@asu.edu",
          },
        ],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className='bg-black/75 w-[600px] h-[400px] rounded-lg overflow-hidden shadow-lg mx-4 sm:mx-0'>
      <div className='bg-gray-800 h-6 flex items-center space-x-2 px-4'>
        <div className='w-3 h-3 rounded-full bg-red-500'></div>
        <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
        <div className='w-3 h-3 rounded-full bg-green-500'></div>
        <span className='text-sm text-gray-300 flex-grow text-center font-semibold flex items-center justify-center gap-2'>
          <FaRegFolderClosed size={14} className='text-gray-300' />
          Arun tej.com ⸺ zsh
        </span>
      </div>
      <div className='p-4 text-gray-200 font-mono text-xs h-[calc(400px-1.5rem)] flex flex-col'>
        <div className='flex-1 overflow-y-auto'>
          {chatHistory.messages.map((msg, index) => (
            <div key={index} className='mb-2'>
              {msg.role === 'user' ? (
                <div className='flex items-start space-x-2'>
                  <span className='text-green-400'>{'>'}</span>
                  <pre className='whitespace-pre-wrap'>{msg.content}</pre>
                </div>
              ) : (
                <pre className='whitespace-pre-wrap'>{msg.content}</pre>
              )}
            </div>
          ))}
          {isTyping && <div className='animate-pulse'>...</div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className='mt-2'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2'>
            <span className='whitespace-nowrap'>agnolas1@asu.edu root %</span>
            <input
              type='text'
              value={chatHistory.input}
              onChange={handleInputChange}
              className='w-full sm:flex-1 bg-transparent outline-none text-white placeholder-gray-400'
              placeholder={placeholder}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

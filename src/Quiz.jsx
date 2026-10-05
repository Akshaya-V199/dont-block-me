import { useState } from 'react';

function Quiz() {
  // Step navigation: 'nickname' | 'login' | 'create-questions' | 'friend-name' | 'take-quiz' | 'result'
  const [step, setStep] = useState('nickname');

  // Creator state
  const [creatorName, setCreatorName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState([
    { question: "What is my favorite color?", optionA: "Blue", optionB: "Red", correctAnswer: "A" },
    { question: "What do I prefer?", optionA: "Tea", optionB: "Coffee", correctAnswer: "A" }
  ]);

  // Friend state
  const [friendName, setFriendName] = useState("");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);

  // --- Handlers ---
  const handleStart = () => {
    if (!creatorName.trim()) return alert("Please enter a nickname!");
    setStep('login');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill email and password!");
    setStep('create-questions');
  };

  const handleSaveQuiz = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/quizzes', {
      method: 'POST', // <-- Must be POST
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ creatorName, email, questions })
    });

    const data = await response.json();
    if (data.success) {
      alert(`Quiz saved! Quiz ID: ${data.quizId}`);
      setStep('friend-name');
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
};
  const handleFriendStart = () => {
    if (!friendName.trim()) return alert("Please enter your name!");
    setStep('take-quiz');
  };

  const handleAnswer = (selectedOption) => {
    if (selectedOption === questions[currentQuestionIdx].correctAnswer) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIdx + 1 < questions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setStep('result');
    }
  };

  return (
    <div className="quiz-bg">
      {/* Top Banner */}
      <div className="banner-card">
        <h1 className="banner-title">DON'T BLOCK ME</h1>
        <div className="banner-badge">Find your Fake Friends</div>
      </div>

      <div className="quiz-card">
        {/* Step 1: Host Nickname */}
        {step === 'nickname' && (
          <>
            <div className="hero-illustration">
              <img src="https://api.iconify.design/twemoji:bear.svg" alt="cute character" className="hero-img" />
            </div>
            <h2 className="main-heading">create your quiz</h2>
            <p className="sub-heading">
              <span className="highlight-yellow">block</span> your fake friends
            </p>
            <input 
              type="text" 
              placeholder="Enter your nickname..." 
              value={creatorName} 
              onChange={(e) => setCreatorName(e.target.value)}
              className="name-input"
            />
            <button onClick={handleStart} className="create-btn">
              create quiz ☁️
            </button>
          </>
        )}

        {/* Step 2: Host Login */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="login-form">
            <h2 className="main-heading">Welcome, {creatorName}!</h2>
            <p className="sub-heading">Log in to save your quiz</p>
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="name-input"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="name-input"
            />
            <button type="submit" className="create-btn">Login & Continue 🚀</button>
            <button type="button" onClick={() => setStep('nickname')} className="back-btn">← Back</button>
          </form>
        )}

        {/* Step 3: Host Creates Questions */}
        {step === 'create-questions' && (
          <div className="quiz-builder">
            <h2 className="main-heading">Set Questions</h2>
            <p className="sub-heading">Set correct answers for your friends</p>

            {questions.map((q, idx) => (
              <div key={idx} className="question-box">
                <p className="q-label">Q{idx + 1}: {q.question}</p>
                <div className="option-row">
                  <button 
                    className={`opt-btn ${q.correctAnswer === 'A' ? 'active' : ''}`}
                    onClick={() => {
                      const updated = [...questions];
                      updated[idx].correctAnswer = 'A';
                      setQuestions(updated);
                    }}
                  >
                    A: {q.optionA}
                  </button>
                  <button 
                    className={`opt-btn ${q.correctAnswer === 'B' ? 'active' : ''}`}
                    onClick={() => {
                      const updated = [...questions];
                      updated[idx].correctAnswer = 'B';
                      setQuestions(updated);
                    }}
                  >
                    B: {q.optionB}
                  </button>
                </div>
              </div>
            ))}

            <button onClick={handleSaveQuiz} className="create-btn">Save & Share Link 🔗</button>
          </div>
        )}

        {/* Step 4: Friend Enters Name */}
        {step === 'friend-name' && (
          <>
            <h2 className="main-heading">{creatorName}'s Quiz</h2>
            <p className="sub-heading">Who are you? Enter your name to start!</p>
            <input 
              type="text" 
              placeholder="Enter your real name..." 
              value={friendName} 
              onChange={(e) => setFriendName(e.target.value)}
              className="name-input"
            />
            <button onClick={handleFriendStart} className="create-btn">Start Quiz 🎯</button>
          </>
        )}

        {/* Step 5: Friend Answers Questions */}
        {step === 'take-quiz' && (
          <div className="friend-quiz">
            <p className="quiz-progress">Question {currentQuestionIdx + 1} of {questions.length}</p>
            <h3 className="main-heading">{questions[currentQuestionIdx].question}</h3>
            
            <div className="quiz-options">
              <button onClick={() => handleAnswer('A')} className="option-btn">
                {questions[currentQuestionIdx].optionA}
              </button>
              <button onClick={() => handleAnswer('B')} className="option-btn">
                {questions[currentQuestionIdx].optionB}
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Final Result */}
        {step === 'result' && (
          <div className="success-screen">
            <h2 className="main-heading">Results for {friendName}!</h2>
            <p className="score-text">You scored <span>{score}</span> / {questions.length}</p>
            {score === questions.length ? (
              <p className="sub-heading">🎉 Real friend! No block needed!</p>
            ) : (
              <p className="sub-heading">🚫 Oops! Time to block!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;
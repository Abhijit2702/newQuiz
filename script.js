const api = "https://opentdb.com/api.php?amount=10&type=multiple"; // Fetch 10 questions

let currentQuestionIndex = 0;
let userAnswers = [];
let timer;
let timeLeft = 300; // 5 minutes in seconds
let questions = [];

async function fetchQuestions() {
  try {
    const response = await fetch(api);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();

    questions = data.results.map((question) => ({
      question: question.question,
      options: [...question.incorrect_answers, question.correct_answer].sort(
        () => Math.random() - 0.5
      ),
      answer: [...question.incorrect_answers, question.correct_answer].indexOf(
        question.correct_answer
      ),
    }));

    startQuiz();
  } catch (error) {
    console.error("Error fetching questions:", error);
  }
}

function startQuiz() {
  renderQuestion();
  updateNavigation();
  startTimer();
}

function startTimer() {
  timer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById("timer").textContent = `Time Left: ${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      submitQuiz(); // Automatically submit quiz when time runs out
    } else {
      timeLeft--;
    }
  }, 1000);
}

function renderQuestion() {
  const quizDiv = document.getElementById("quiz");
  const question = questions[currentQuestionIndex];

  quizDiv.innerHTML = `
        <div class="question">${question.question}</div>
        <ul class="options">
            ${question.options
              .map(
                (option, index) => `
                <li>
                    <input type="radio" name="option" value="${index}" id="option${index}" ${
                  userAnswers[currentQuestionIndex] === index ? "checked" : ""
                }>
                    <label for="option${index}">${option}</label>
                </li>
            `
              )
              .join("")}
        </ul>
    `;
}

function nextQuestion() {
  const selectedOption = document.querySelector('input[name="option"]:checked');
  if (selectedOption) {
    userAnswers[currentQuestionIndex] = parseInt(selectedOption.value, 10);
  }

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  }
  updateNavigation();
}

function prevQuestion() {
  const selectedOption = document.querySelector('input[name="option"]:checked');
  if (selectedOption) {
    userAnswers[currentQuestionIndex] = parseInt(selectedOption.value, 10);
  }

  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
  updateNavigation();
}

function submitQuiz() {
  clearInterval(timer);

  const selectedOption = document.querySelector('input[name="option"]:checked');
  if (selectedOption) {
    userAnswers[currentQuestionIndex] = parseInt(selectedOption.value, 10);
  }

  const resultDiv = document.getElementById("result");
  const score = questions.reduce((acc, question, index) => {
    return acc + (userAnswers[index] === question.answer ? 1 : 0);
  }, 0);

  resultDiv.innerHTML = `<h2>Your Score: ${score} / ${questions.length}</h2>`;
  document.getElementById("quiz").style.display = "none";
  document.querySelector(".navigation").style.display = "none";
}

function updateNavigation() {
  document.getElementById("prevBtn").style.display =
    currentQuestionIndex === 0 ? "none" : "inline-block";
  document.getElementById("nextBtn").style.display =
    currentQuestionIndex === questions.length - 1 ? "none" : "inline-block";
  document.getElementById("submitBtn").style.display =
    currentQuestionIndex === questions.length - 1 ? "inline-block" : "none";
}

// Initialize the quiz
fetchQuestions();

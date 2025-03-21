// Global variables

const app = document.getElementById('app');
const main = document.getElementById('main');
const quizSelection = document.getElementById('quiz-select');
const startQuizBtn = document.querySelector('#start-btn');
const questionElement = document.getElementById('question');
const answerButtons = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-btn');
const progressBar = document.querySelector('.progress-bar');
const progressText = document.getElementById('progress-text');
let quizHeader = document.getElementById('quiz-header');
let questions = null;
let currentQuestionIndex = 0;
let completedQuestions = 0;
let progressPercent = 0;
let score = 0;

// Change background color

function getRandomNumber() {
    return Math.floor(Math.random() * 16);
}

function changeBackground() {
    const hex = [0, 1, 2, 3, 4, 5 , 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];
    let hexColor = '#';
    for (let i = 0; i < 6; i++) {
        hexColor += hex[getRandomNumber()];
    }
    document.body.style.backgroundColor = hexColor;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', hexColor);
};

// Get selected quiz from user
function getSelectedIndex() {
    if (quizSelection.selectedIndex == quizSelection.disabled) {
        startQuizBtn = startQuizBtn.disabled
    } else {
        return quizSelection.selectedIndex
    }
};

// Format data from getData()
function formatData(jsonResponse) {
    let formattedQuiz = [];
    for (obj of jsonResponse.results) {
        formattedQuiz.push({
            question: obj.question,
            answers: [
                {text: obj.correct_answer, correct: true},
                {text: obj.incorrect_answers[0], correct: false},
                {text: obj.incorrect_answers[1], correct: false},
                {text: obj.incorrect_answers[2], correct: false}
            ]
        });
    }
    return formattedQuiz;
}

// Fetch API
async function getData(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const jsonResponse = await response.json();
            const formattedQuiz = formatData(jsonResponse);
            return formattedQuiz;
        } else {
            throw new Error("Request failed");
        }
    } catch (err) {
        console.log(err);
    }
}

// Get selected quiz from Open Trivia DB
async function getQuiz(selectedIndex) {
    let url = '';
    if (selectedIndex === 1) {
        url = 'https://opentdb.com/api.php?amount=5&category=18&type=multiple';
    } else {
        url = 'https://opentdb.com/api.php?amount=5&category=23&type=multiple';
    }
    const resolved = await getData(url);
    quiz = resolved;
    return quiz;
}

// Randomize answers for each question
function randomizeAnswers(questions) {
    for (question of questions) {
        let randIndx1 = Math.floor(Math.random()*question.answers.length);
        let randIndx2 = Math.floor(Math.random()*question.answers.length);
        while (randIndx2 === randIndx1) {
            randIndx2 = Math.floor(Math.random()*question.answers.length);
        }
        let randIndx3 = Math.floor(Math.random()*question.answers.length);
        while (randIndx3 === randIndx1 || randIndx3 === randIndx2) {
            randIndx3 = Math.floor(Math.random()*question.answers.length);
        }
        let randIndx4 =Math.floor(Math.random()*question.answers.length);
        while (randIndx4 === randIndx1 || randIndx4 === randIndx2 || randIndx4 === randIndx3) {
            randIndx4 = Math.floor(Math.random()*question.answers.length);
        }
        [question.answers[randIndx1], question.answers[randIndx2]] = [question.answers[randIndx2], question.answers[randIndx1]];
        [question.answers[randIndx3], question.answers[randIndx4]] = [question.answers[randIndx4], question.answers[randIndx3]];
    }
}

// Display each question
function showQuestion(questions) {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNumber = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNumber + '. ' + currentQuestion.question;
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerHTML = answer.text;
        button.classList.add('btn');
        answerButtons.appendChild(button);
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
    });
}

// Reset question state
function resetState() {
    nextButton.style.display = 'none';
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

// User selects answer
function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === 'true';
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        score++;
    } else {
        selectedBtn.classList.add('incorrect');
    }
    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === 'true') {
            button.classList.add('correct');
        }
        button.disabled = true;
    });
    nextButton.style.display = 'block';
}

// Shows score at the end
function showScore(questions) {
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    nextButton.innerHTML = "Play Again";
    nextButton.style.display = 'block';
}

// Handles the next button - displays question or score if quiz is done
function handleNextButton(questions) {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion(questions);
    } else {
        showScore(questions);
    }
}

// Return home
function returnHome() {
    app.style.display = 'none';
    changeBackground();
    main.style.display = 'block';
    quizSelection.selectedIndex = quizSelection.disabled;
}
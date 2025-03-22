function quizApp() {
    return {
        // Quiz state
        quizStarted: false,
        quizCompleted: false,
        selectedCategory: 'any',
        selectedDifficulty: 'any',
        numberOfQuestions: 10,
        userName: '',
        nameSkipped: false,
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        selectedAnswer: null,
        loading: false,
        // Computed properties
        get currentQuestion() {
            return this.questions[this.currentQuestionIndex] || {};
        },

        get shuffledOptions() {
            if (!this.currentQuestion.incorrect_answers) return [];
            const options = [...this.currentQuestion.incorrect_answers, this.currentQuestion.correct_answer];
            return this.shuffleArray(options);
        },

        // Methods
        async startQuiz() {
            this.loading = true;
            try {
                let apiUrl = 'https://opentdb.com/api.php?';
                const params = new URLSearchParams({
                    amount: this.numberOfQuestions,
                    ...(this.selectedCategory !== 'any' && { category: this.selectedCategory }),
                    ...(this.selectedDifficulty !== 'any' && { difficulty: this.selectedDifficulty }),
                });

                const response = await fetch(apiUrl + params.toString());
                const data = await response.json();

                if (data.response_code === 0) {
                    this.questions = data.results.map(q => ({
                        ...q,
                        question: this.decodeHtml(q.question),
                        correct_answer: this.decodeHtml(q.correct_answer),
                        incorrect_answers: q.incorrect_answers.map(a => this.decodeHtml(a))
                    }));
                    this.quizStarted = true;
                    this.currentQuestionIndex = 0;
                    this.score = 0;
                    this.selectedAnswer = null;
                } else {
                    alert('Failed to load questions. Please try different settings.');
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
                alert('Failed to load questions. Please check your internet connection.');
            } finally {
                this.loading = false;
            }
        },

        selectAnswer(answer) {
            if (this.selectedAnswer) return;
            this.selectedAnswer = answer;
            if (answer === this.currentQuestion.correct_answer) {
                this.score++;
            }
        },

        nextQuestion() {
            if (this.currentQuestionIndex === this.questions.length - 1) {
                this.quizCompleted = true;
            } else {
                this.currentQuestionIndex++;
                this.selectedAnswer = null;
            }
        },

        resetQuiz() {
            this.quizStarted = false;
            this.quizCompleted = false;
            this.questions = [];
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.selectedAnswer = null;
        },

        getScoreMessage() {
            const percentage = (this.score / this.questions.length) * 100;
            if (percentage >= 90) return 'অসাধারণ! আপনি একজন কুইজ মাস্টার! 🏆';
            if (percentage >= 70) return 'চমৎকার! আপনি বেশ ভালো করেছেন! 👏';
            if (percentage >= 50) return 'ভালো চেষ্টা! এভাবেই শিখতে থাকুন! 📚';
            const namePrefix = this.userName ? `প্রিয় ${this.userName}, ` : '';
            if (percentage >= 90) return `${namePrefix}অসাধারণ! আপনি একজন কুইজ মাস্টার! 🏆`;
            if (percentage >= 70) return `${namePrefix}চমৎকার! আপনি বেশ ভালো করেছেন! 👏`;
            if (percentage >= 50) return `${namePrefix}ভালো চেষ্টা! এভাবেই শিখতে থাকুন! 📚`;
            return `${namePrefix}অনুশীলন চালিয়ে যান! পরবর্তী বারে আরও ভালো করবেন! 💪`;
        },

        // Utility functions
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },

        decodeHtml(html) {
            const txt = document.createElement('textarea');
            txt.innerHTML = html;
            return txt.value;
        }
    };
}
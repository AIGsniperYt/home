

const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "In the midst of difficulty lies opportunity. - Albert Einstein",
    "The future depends on what you do today. - Mahatma Gandhi",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
    "Be yourself; everyone else is already taken. - Oscar Wilde",
    "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
    "Life is 10% what happens to us and 90% how we react to it. - Charles R. Swindoll",
    "The journey of a thousand miles begins with one step. - Lao Tzu",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Happiness is not something ready-made. It comes from your own actions. - Dalai Lama",
    "The only thing necessary for the triumph of evil is for good people to do nothing. - Edmund Burke",
    "Do what you can, with what you have, where you are. - Theodore Roosevelt",
    "The best revenge is massive success. - Frank Sinatra",
    "Change your thoughts and you change your world. - Norman Vincent Peale",
    "The only person you should try to be better than is the person you were yesterday. - Unknown",
    "Don't count the days, make the days count. - Muhammad Ali",
    "It does not matter how slowly you go as long as you do not stop. - Confucius",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. - Ralph Waldo Emerson",
    "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
    "Success is stumbling from failure to failure with no loss of enthusiasm. - Winston Churchill",
    "If you want to lift yourself up, lift up someone else. - Booker T. Washington",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "You miss 100% of the shots you don't take. - Wayne Gretzky",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "Life is short, and it's up to you to make it sweet. - Sarah Louise Delany",
    "Success usually comes to those who are too busy to be looking for it. - Henry David Thoreau",
    "The secret to getting ahead is getting started. - Mark Twain",
    "The only true wisdom is in knowing you know nothing. - Socrates",
    "Challenges are what make life interesting and overcoming them is what makes life meaningful. - Joshua J. Marine"
    // Add more quotes here
];


    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;

    darkModeToggle.addEventListener("click", () => {
       body.classList.toggle("dark-mode");
    });
    
    
    let shuffledQuotes = [...quotes]; // Copy the quotes array

    function generateQuote() {
        const quoteContainer = document.getElementById("quoteContainer");
        if (shuffledQuotes.length === 0) {
            shuffledQuotes = [...quotes]; // Reset the shuffledQuotes array
        }
        const randomIndex = Math.floor(Math.random() * shuffledQuotes.length);
        const randomQuote = shuffledQuotes.splice(randomIndex, 1)[0];
        quoteContainer.textContent = randomQuote;
    }

    generateQuote(); // Generate initial quote on page load

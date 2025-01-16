const startButton = document.getElementById("startBtn");
const voiceSelect = document.getElementById("voiceSelect");
const outputDiv = document.getElementById("output");

let synth = window.speechSynthesis;
let voices = [];
let selectedVoiceIndex = 0; // Default to the first voice
let record = false;

function populateVoiceList() {
    voices = synth.getVoices();
    voices.forEach((voice, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

voiceSelect.addEventListener("change", () => {
    selectedVoiceIndex = voiceSelect.value;
});

if ("webkitSpeechRecognition" in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
        startButton.textContent = "Recording...";
    };

    recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
            } else {
                interimTranscript += transcript;
            }
        }

        if (finalTranscript.toLowerCase().includes("hello") || finalTranscript.toLowerCase().includes("hi") || finalTranscript.toLowerCase().includes("hey")) {
            let greetings = [
                "Got any questions? I’ve got answers!",
                "I'm ChatBot! How can I help you?",
                "Howdy! What's on your mind?",
                "What's up! I'm here to assist you.",
                "Good day! What brings you here?"
            ];
            let greeting = greetings[Math.floor(Math.random() * greetings.length)];

            let utterance = new SpeechSynthesisUtterance(greeting);
            utterance.lang = 'en-US';
            utterance.pitch = 1;
            utterance.rate = 1;
            utterance.voice = voices[selectedVoiceIndex];

            recognition.stop();
            synth.speak(utterance);

            utterance.onend = () => {
                if (record) {
                    recognition.start();
                }
            };

            outputDiv.innerHTML = `
                What you said: ${finalTranscript} <br>
                ChatBot Response: ${greeting}
            `;
        } else if (finalTranscript.toLowerCase().includes("joke")) {
            // Specify the category of jokes, e.g., programming
            const jokeCategory = "programming";
        
            fetch(`https://official-joke-api.appspot.com/jokes/${jokeCategory}/random`)
                .then(response => response.json())
                .then(data => {
                    let joke = `${data.setup} - ${data.punchline}`;
        
                    let utterance = new SpeechSynthesisUtterance(joke);
                    utterance.lang = 'en-US';
                    utterance.pitch = 1;
                    utterance.rate = 1;
                    utterance.voice = voices[selectedVoiceIndex];
        
                    recognition.stop();
                    synth.speak(utterance);
        
                    utterance.onend = () => {
                        if (record) {
                            recognition.start();
                        }
                    };
        
                    outputDiv.innerHTML = `
                        What you said: ${finalTranscript} <br>
                        ChatBot Response: ${joke}
                    `;
                })
                .catch(error => {
                    console.error('Error fetching joke:', error);
                    outputDiv.innerHTML = "Sorry, I couldn't fetch a joke right now.";
                });
            } else {
            startButton.textContent = "Start Listening";
        }
    };

    startButton.addEventListener("click", () => {
        record = true;
        recognition.start();
        startButton.textContent = "Listening";
    });
} else {
    outputDiv.textContent = "Web Speech API not supported in this browser.";
}

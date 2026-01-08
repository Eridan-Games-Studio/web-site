// Calling result data
const callingData = {
    investigator: {
        name: "Private Investigator",
        subtitle: "The city's truth-seeker in a trench coat",
        description: `
            <p>You are a <strong>Private Investigator</strong>, one of Haven's stubborn few who refuse to let truth die in the rain-soaked alleys. Maybe you were a cop once, or maybe you just couldn't ignore what everyone else pretends not to see. Either way, you've learned that answers don't come easy in this city — they have to be dug out, fought for, and paid for in favors and bruises.</p>

            <p>Your <strong>network of contacts</strong> is your greatest asset. You know people in every corner of Haven — from precinct commissioners to street informants — and you've built that list one case at a time. When things go sideways, you call in those favors. When danger strikes, your <strong>trigger-ready instincts</strong> keep you alive, reacting before others even process the threat.</p>

            <p>You trust your <strong>gut feeling</strong> more than any evidence board, and your <strong>sharp eye</strong> catches the details others miss. Whether you're better with your fists in a back alley brawl or your aim with a pistol, you've been molded by Haven's streets. Every case leaves a scar, but you keep going because someone has to find the truth — even if the city tries to bury it.</p>

            <p>You work out of a cluttered office or apartment, case files stacked beside a bottle of bourbon. Bills are always nipping at your heels, but you're not in this for the money. You're in it because when everyone else looks away, <strong>you look closer</strong>.</p>
        `,
        abilities: [
            "Call in Favors to manifest contacts who will help you",
            "Trigger Ready reflexes that let you act first when danger strikes",
            "Sharp Eye for noticing hidden details others miss",
            "Gut Feeling that reveals subtle truths your instincts catch",
            "Street-hardened combat skills — brawler or sharpshooter",
            "Network of informants across all districts of Haven",
            "Stubborn determination that doesn't quit until the case is solved"
        ]
    },

    rumormonger: {
        name: "Rumormonger",
        subtitle: "The weaver of whispers who shapes reality",
        description: `
            <p>You are a <strong>Rumormonger</strong>, one of Haven's rarest and most dangerous individuals. You possess a gift — or curse — that most would kill to control: the power to twist reality by weaving whispers into truth. Perhaps it's ancient knowledge, an accident, or something vast and unfathomable that granted you this ability. But you've learned that in a city built on gossip and secrets, <strong>belief shapes reality</strong>.</p>

            <p>Your <strong>Fact or Fiction</strong> ability is legendary. Spend enough preparation, whisper the right rumor, and watch it become real within 24 hours. You can't kill directly or control minds, but you can create situations where the impossible becomes inevitable. That rival boss who never showed up to the meeting? That's your work. The blackout that covered your escape? You planted that seed days ago.</p>

            <p>You maintain a <strong>secret identity</strong> — perhaps more than one — complete with papers, accounts, and alibis. Swapping between personas takes planning, but you can shift in moments when needed. Your <strong>unspoken messages</strong> reach anyone in Haven through strange coincidences, and you're always prepared, always one step ahead.</p>

            <p>You live comfortably because secrets sell. Sharp clothes, a decent apartment, and enough money to keep up appearances. Information networks whisper your name with respect and fear, knowing you can make or break reputations with a well-placed word. In Haven, <strong>truth is the most dangerous currency</strong> — and you print the bills.</p>
        `,
        abilities: [
            "Fact or Fiction: Weave rumors into reality",
            "Secret Identity with full papers and personality",
            "Unspoken Message that always reaches its target",
            "Always Come Prepared with extra preparation dice",
            "Well Informed about recent events and occult activity",
            "Reality-bending through belief and whispered words",
            "Master of misinformation and narrative control"
        ]
    },

    demonologist: {
        name: "Demonologist",
        subtitle: "The pact-maker who bargains with darkness",
        description: `
            <p>You are a <strong>Demonologist</strong>, one who walks the threshold between human and supernatural. Where others see faith or fear, you see <strong>negotiation</strong>. You've made pacts with infernal beings — contracts written in blood and bound by mutual need. These demons grant you power, but power always has a price, and you pay it willingly.</p>

            <p>Your contracted entity — whether <strong>Taranis the Thunder-bound</strong> or the <strong>Glass Jackal</strong> — flavors everything you do. When you invoke <strong>The Devil's Clause</strong>, reality bends to your pact: thunderstorms scatter pursuers, illusions turn the odds, or lightning jolts through your enemies. You can electrocute foes with a touch, move at storm-speed for a heartbeat, or weave lies that others believe as truth.</p>

            <p>Your <strong>Otherworldly Sense</strong> lets you "listen" for the unseen — feeling paranormal presences, recent demonic activity, or cryptic impressions that guide your path. Most people can sense you're different, and they're right to be wary. You traffic with entities that shouldn't exist, and that reputation precedes you.</p>

            <p>You live simply, funneling resources into occult tools, offerings, and bizarre rituals rather than luxury. Your cheap flat is cluttered with symbols, candles, and forbidden texts. You're not destitute, but your lifestyle is unsustainable by ordinary means — because you're not ordinary. You've crossed a line most fear to approach, and there's no going back.</p>
        `,
        abilities: [
            "The Devil's Clause: Invoke demonic power for dramatic effects",
            "Otherworldly Sense detecting paranormal presence",
            "Taranis: Electrocute, Lightning Jolt, Storm's Favor",
            "Glass Jackal: Forked Tongue lies, Splintered detection, Mirror Double",
            "Occult knowledge and forbidden rituals",
            "Contracts with infernal beings beyond mortal understanding",
            "Power at a price — every gift has consequences"
        ]
    },

    agent: {
        name: "The Agent",
        subtitle: "The dimensional traveler caught between worlds",
        description: `
            <p>You are <strong>The Agent</strong>, a person out of place and out of time. No one's quite sure how you got here — maybe not even you. A paranormal rupture, an experiment gone wrong, or something stranger hurled you across realities into Haven. You walk these rain-soaked streets with the reflexes of a soldier and the instincts of a ghost, adapting faster than most can think.</p>

            <p>Your <strong>Dimensional Incursion</strong> lets you step through the seams of reality into alternate versions of Haven. A condemned factory that still operates, a door that exists only in another world — you can slip between dimensions to bypass obstacles, retrieve objects, or evade danger entirely. The effect is fleeting, but it's saved your life more times than you can count.</p>

            <p>Everything goes according to plan when you declare it so. Your ability <strong>All According to the Plan</strong> snaps probability into alignment, adding dice to your roll and returning exhausted resources to fuel future schemes. You can take multiple actions in sequence through <strong>That, and Then</strong>, and your attacks come from <strong>impossible directions</strong> — reflections, corners, angles that defy geometry.</p>

            <p>You live comfortably despite your otherworldly origins. You've found ways to obtain resources, maintain a workshop, and keep a unique gadget from your home reality. But you're always aware you don't truly belong here. People sense it — you're an outsider in a city that's already strange. Whether you're trying to find a way home or learning to accept this bizarre new world, one thing is certain: <strong>you work here, even if you don't belong</strong>.</p>
        `,
        abilities: [
            "Dimensional Incursion stepping between realities",
            "All According to the Plan snapping probability into alignment",
            "That, and Then taking sequential actions seamlessly",
            "From Any Direction with impossible attack angles",
            "Split Decision existing in two outcomes simultaneously",
            "Adaptation speed beyond normal human capability",
            "Unique gadget from your original reality"
        ]
    },

    haunted: {
        name: "Haunted One",
        subtitle: "The living soul bound to the dead",
        description: `
            <p>You are the <strong>Haunted One</strong>, someone who's never truly alone. A spirit walks beside you — unseen by most, half-remembered by all. It hums in dead radios, leaves fog on mirrors, and sometimes borrows your voice when you're not paying attention. Maybe it's unfinished business. Maybe it's a promise neither of you can keep. Maybe it's just chance — a collision between the living and whatever waits beyond.</p>

            <p>Your <strong>Ghost in the Wires</strong> ability is terrifying and useful in equal measure. By commanding your spectral companion, you can possess objects or even corpses — a car drives itself, a camera rewinds its footage, or the dead shuffle to your side waiting for orders. The spirit acts through your intent, but always with its own eerie touch: lights dim, metal warps, static fills the air.</p>

            <p>You can <strong>Summon the Departed</strong>, calling to ghosts of the recently dead through technology — they answer over radios, phones, crackling speakers. Their cooperation isn't guaranteed, but they always respond. Your <strong>Obscuring Aura</strong> makes people's eyes slide off you, cameras glitch, and timid spirits grow strangely friendly. You exist half-real, caught between worlds.</p>

            <p>Work is hard to keep when lights flicker wherever you go. People avoid you, jobs don't last, and you live where no one asks questions. Your small apartment is your refuge, along with a trinket you use to communicate — a radio, tape recorder, or handheld mirror. The spirit that haunts you might be a burden, but it's also your closest companion. In Haven, a city that's already haunted, <strong>you fit right in — for better or worse</strong>.</p>
        `,
        abilities: [
            "Ghost in the Wires possessing objects and corpses",
            "Summon the Departed contacting recently dead spirits",
            "Misery Loves Company dragging enemies down with you",
            "Obscuring Aura making you hard to notice or remember",
            "Shared Perception seeing through your ghost's eyes",
            "Constant spectral companion bound to your existence",
            "Technology haunting — lights, radios, screens react to you"
        ]
    }
};

// Quiz submission handler
document.getElementById('quiz-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Count answers for each calling
    const scores = {
        investigator: 0,
        rumormonger: 0,
        demonologist: 0,
        agent: 0,
        haunted: 0
    };

    // Get all form data
    const formData = new FormData(this);

    // Check if all questions are answered
    let answeredCount = 0;
    for (let i = 1; i <= 25; i++) {
        const answer = formData.get(`q${i}`);
        if (answer) {
            answeredCount++;
            scores[answer]++;
        }
    }

    // Validate all questions answered
    if (answeredCount < 25) {
        alert('The city is watching. Answer all questions before proceeding.');
        return;
    }

    // Find the calling with highest score
    let maxScore = 0;
    let resultCalling = '';

    for (const calling in scores) {
        if (scores[calling] > maxScore) {
            maxScore = scores[calling];
            resultCalling = calling;
        }
    }

    // Handle ties by checking questions in order of importance
    const tiedCallings = Object.keys(scores).filter(calling => scores[calling] === maxScore);
    if (tiedCallings.length > 1) {
        // Use key questions as tiebreakers
        const tiebreakers = ['q25', 'q2', 'q5', 'q11', 'q18'];
        for (const question of tiebreakers) {
            const answer = formData.get(question);
            if (tiedCallings.includes(answer)) {
                resultCalling = answer;
                break;
            }
        }
    }

    // Display result
    displayResult(resultCalling, scores);
});

function displayResult(calling, scores) {
    // Hide form
    document.getElementById('quiz-form').style.display = 'none';

    // Show results
    const resultsDiv = document.getElementById('results');
    const resultContent = document.getElementById('result-content');

    // Get calling data
    const data = callingData[calling];

    // Build result HTML
    let html = `
        <div class="${calling}-result">
            <div class="calling-title">${data.name}</div>
            <div class="calling-subtitle">${data.subtitle}</div>
            <div class="calling-description">${data.description}</div>
            <div class="calling-abilities">
                <h3>Your Abilities:</h3>
                <ul>
                    ${data.abilities.map(ability => `<li>${ability}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    // Add score breakdown
    html += `
        <div class="score-breakdown">
            <h3>The City's Reading:</h3>
            <div style="text-align: left;">
    `;

    // Sort scores
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    for (const [callingName, score] of sortedScores) {
        const percentage = (score / 25 * 100).toFixed(1);
        const callingDisplayName = callingData[callingName].name;
        html += `
            <div class="score-item">
                <div class="score-label">
                    <span>${callingDisplayName}</span>
                    <span style="color: #00ffff;">${percentage}%</span>
                </div>
                <div class="score-bar-container">
                    <div class="score-bar" style="width: ${percentage}%;"></div>
                </div>
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    resultContent.innerHTML = html;
    resultContent.className = `${calling}-result`;
    resultsDiv.classList.remove('hidden');

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add progress tracking
let answeredQuestions = new Set();

document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const questionName = this.name;
        answeredQuestions.add(questionName);
    });
});

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // Toggle mobile menu
    function toggleMobileMenu() {
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        body.classList.toggle('menu-open');
    }

    // Handle toggle button click
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    // Close menu when clicking on a nav link
    const navLinksItems = document.querySelectorAll('.nav-links a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', function() {
            if (navLinks.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !mobileMenuToggle.contains(e.target)) {
            toggleMobileMenu();
        }
    });
});

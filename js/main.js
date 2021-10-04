const boardCards = [];
const numberOfCards = 16;
const cardPairs = [];

function Card(element, index) {
    this.element = element;
    this.colorClass = "color-0"; //by default
    this.isFaceup = false;
    this.isMatched = false;
    this.index = index;

    this.setColor = function(colorClass) {
        this.colorClass = colorClass;
        //get the faceup div of this card
        if (this.element === undefined) {
            window.alert("undefined card!");
            return;
        }
        const faceUpElement = this.element.getElementsByClassName('faceup')[0];
        //console.log(faceUpElement);

        //add the new color calss to the list of classes of the faceup div
        faceUpElement.classList.add(colorClass);
    };
    this.flip = function() {
        this.isFaceup = !this.isFaceup;
        if (this.isFaceup) {
            this.element.classList.add("flipped");
        }
    }
    this.setHandler = function() {
        this.element.addEventListener("click", this, false);
    }
    this.handleEvent = function(event) {
        switch (event.type) {
            case "click":
                if (this.isFaceUp || this.isMatched) {
                    console.log('card ' + this.index + '(' + this.colorClass + ') clicked');
                    //if the card is already face up or matched
                    return;
                }
                this.isFaceUp = true;
                this.element.classList.add('flipped');

                // call the function that checks if there is a match
                handleCardFlipped(this);
        }
    }
    this.reset = function() {
        this.isFaceUp = false;
        this.isMatched = false;
        this.element.classList.remove('flipped');
    }
    this.matchFound = function() {
        this.isFaceUp = true;
        this.isMatched = true;
    }
}

function createAllCards() {
    const cardElements = document.getElementById('gameboard').children;
    for (let i = 0; i < numberOfCards; i++) {
        let card = new Card(cardElements[i], i);
        card.setHandler();
        boardCards.push(card);
    }
}


function geterateBoardCards() {
    let cardsHTML = '';

    // generate HTML for board cards
    for (let i = 0; i < numberOfCards; i++) {
        cardsHTML += `
    <div class="col-3 board-card">
      <div class="face-container">
        <div class="facedown"></div>
        <div class="faceup"></div>
      </div>
    </div>`;

    }

    // insert cards HTML in DOM
    const boardElement = document.getElementById('gameboard');
    boardElement.innerHTML = cardsHTML;

    //create all card objects
    createAllCards();
}

function CardPair(card1, card2, colorClass) {
    this.card1 = card1;
    this.card2 = card2;
    this.colorClass = colorClass;
}

function assignColorCard(num) { //for testing only
    //console.log("In assignColor");
    //select the first card
    const cardElements = document.getElementById('gameboard').children;
    //console.log(cardElements);
    let theCard = cardElements[num];
    //  get a random color 
    let colorIndex = Math.floor(Math.random() * 8); //generate a rondom index on color classes
    let colorClassName = "color-" + colorIndex;
    let cardObject = new Card(theCard, num);
    cardObject.setColor(colorClassName);
    cardObject.flip();
}
//assignColorCard(1);


function getCardByNum(num) {
    for (let i = 0; i < boardCards.length; i++) {
        if (boardCards[i].index === num) return boardCards[i];
    };
    return null;
}


function addCardsPair(card1, card2, color) {
    let pair = new CardPair(card1, card2, color);
    cardPairs.push(pair);
}

function createRandomCardPairs() {
    for (let i = 0; i < numberOfCards / 2; i++) {
        var card1;
        var card2;
        var colorIndex;
        do {
            var card1Index = Math.floor(Math.random() * 16);
            card1 = getCardByNum(card1Index);
        } while (isPaired(card1));
        do {
            var card2Index = Math.floor(Math.random() * 16);
            if (card1Index === card2Index) continue;
            card2 = getCardByNum(card2Index);
        } while (isPaired(card2));
        do {
            colorIndex = Math.floor(Math.random() * 8); //generate a rondom index of color classes
        } while (isUsed(colorIndex));
        console.log(`(${card1Index} ,  ${card2Index} , ${colorIndex})`);
        let colorClassName = "color-" + colorIndex;
        let pair = new CardPair(card1, card2, colorClassName);
        card1.setColor(colorClassName);
        card2.setColor(colorClassName);
        cardPairs.push(pair);
    }
}

function isPaired(card) {
    for (let i = 0; i < cardPairs.length; i++) {
        let pair = cardPairs[i];
        if (pair.card1.index === card.index || pair.card2.index === card.index) return true;
        continue;
    }
    return false;
}

function isUsed(candidateColorIndex) {
    for (let i = 0; i < cardPairs.length; i++) {
        let colorIndex = Number(cardPairs[i].colorClass.split("-")[1]);
        if (colorIndex === candidateColorIndex) return true;
        continue;
    }
    return false;
}

function initGame() { //initialise the game board
    geterateBoardCards();
    createRandomCardPairs();
}

function flipAll() { //for testing purpose only
    for (card of boardCards) {
        card.flip();
    }
}
initGame();
//flipAll(); //to be remove before moving next

var firstFaceupCard = null; //the first card to be flipped in a pair
var card1Clicked = null;
var card2Clicked = null;

function handleCardFlipped(card) {
    // first card flipped in a pair, save it
    if (firstFaceupCard === null) {
        firstFaceupCard = card;
        return
    }

    // if the colors of the first and the second match
    if (firstFaceupCard.colorClass === card.colorClass) {
        // mark cards matched
        firstFaceupCard.matchFound();
        card.matchFound();

        firstFaceupCard = null; //forget the first card clicked for creating a new pair
    } else {
        // if no match
        card1Clicked = firstFaceupCard;
        card2Clicked = card;

        firstFaceupCard = null; //forget the first

        setTimeout(resetCards, 400); //wait 400 ms and flip both face
    }
}

function resetCards() {
    card1Clicked.reset();
    card2Clicked.reset();
}
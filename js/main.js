const boardCards = []; //the array of card objects of type Card
const numberOfCards = 16; //total number of cards
const cardPairs = []; //array of pairs of cards used only for pairing
var correctPairs = 0; // Counts the number of correct pairs already matched
var firstClick = false;

document.getElementsByClassName(
    "score"
)[0].innerHTML = `Score : ${correctPairs}/${numberOfCards / 2}`;
//represent a JavaScript object associted with the div actually showing the card in the HTML
function Card(element, index) {
    this.element = element; //the div tag element of the card (board-card div)
    this.colorClass = "color-0"; //by default the color will be the one with the class class-0 as in CSS
    this.isFaceup = false; //true when face up
    this.isMatched = false; //true when succesfully matched
    //index of the card in the list of children of the gamebord div
    //this helps only with finding the card when we are pairing cards
    this.index = index;

    this.setColor = function(colorClass) {
        this.colorClass = colorClass;
        //for robustness check that the card obect is really associated to a div element !
        if (this.element === undefined) {
            window.alert("undefined card!");
            return;
        }
        //get the faceup div of this card
        const faceUpElement = this.element.getElementsByClassName("faceup")[0];

        //add the new color class to the list of classes of the faceup div
        faceUpElement.classList.add(colorClass); //important to understand
    };
    this.flip = function() {
        //flip a card for and set the flag
        this.isFaceup = !this.isFaceup;
        if (this.isFaceup) {
            //when the face up we assign the color class to the object to change its color
            this.element.classList.add("flipped");
        }
    };
    this.setHandler = function() {
        //register this object as a handler of the click event
        //this will automatic invoke the handEvent method when a click occurs
        this.element.addEventListener("click", this, false);
    };
    this.handleEvent = function(event) {
        //we come here when  an event occurs on this card
        switch (event.type) {
            case "click": //if the event is a click
                if (!firstClick) {
                    startTimer();
                    firstClick = true;
                }
                if (this.isFaceUp || this.isMatched) {
                    console.log(
                        "card " + this.index + "(" + this.colorClass + ") clicked"
                    );
                    //if the card is already face up or matched
                    return;
                } //otherwise
                this.isFaceUp = true; //put face up flag
                this.element.classList.add("flipped"); //flip the card

                // call the function that checks if there is a match
                handleCardFlipped(this);
        }
    };
    this.reset = function() {
        //there was no match, we flip back the card and set their flags to false
        this.isFaceUp = false;
        this.isMatched = false;
        this.element.classList.remove("flipped");
    };
    this.matchFound = function() {
        //in case of much this persists the face up and matched state of the card to true
        this.isFaceUp = true;
        this.isMatched = true;
    };
}

var timer; //game timerto count the time it takes to finish the game

function startTimer() { //the time is continuously displayed on the HTML labels minutes:seconds (see index.html)
    //get the labels
    var minutesLabel = document.getElementById("minutes");
    var secondsLabel = document.getElementById("seconds");
    var totalSeconds = 0;
    //register the time update function that runs every  second
    timer = setInterval(setTime, 1000);

    function setTime() { //this is the time update function
        ++totalSeconds; //increment the totla elapsed seconds by 1
        //display minutes and seconds
        secondsLabel.innerHTML = pad(totalSeconds % 60);
        minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
    }

    function pad(val) { //make a string of two characters
        var valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }
}

function stopTimer() { //invoked at the end of the game to stop the timer
    clearInterval(timer);
}

function createAllCards() {
    //iterate on the list of div tags that are children of the gameboard div
    // create one cr
    //create one card object for each board-card element
    //store the cards in an array for subsequent processing
    const cardElements = document.getElementById("gameboard").children;
    for (let i = 0; i < numberOfCards; i++) {
        let card = new Card(cardElements[i], i);
        card.setHandler();
        boardCards.push(card);
    }
}

function generateBoardCards() {
    //gerenate all the cards in the html file
    //each card is a div with one sub div in which there are two divs oe for each face
    let cardsHTML = "";

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
    const boardElement = document.getElementById("gameboard");
    boardElement.innerHTML = cardsHTML;

    //create all card objects and store them in the array of cards for subsequent processig
    createAllCards();
}

function CardPair(card1, card2, colorClass) {
    //class that represent a pair of cards, used for the pairing algorithm only
    this.card1 = card1;
    this.card2 = card2;
    this.colorClass = colorClass;
}

function assignColorCard(num) {
    //for testing only
    //select the first card
    const cardElements = document.getElementById("gameboard").children;
    //console.log(cardElements);
    let theCard = cardElements[num];
    //  get a random color
    let colorIndex = Math.floor(Math.random() * 8); //generate a rondom index on color classes
    let colorClassName = "color-" + colorIndex;
    let cardObject = new Card(theCard, num);
    cardObject.setColor(colorClassName);
    cardObject.flip();
}
//assignColorCard(1); //this just for testing that we are able to change the color of a signle card

function getCardByNum(num) {
    //serarch the cards array and get the one with the index equal to num
    for (let i = 0; i < boardCards.length; i++) {
        if (boardCards[i].index === num) return boardCards[i];
    }
    return null;
}

function createRandomCardPairs() {
    //create cards pairs with their random colors
    for (let i = 0; i < numberOfCards / 2; i++) {
        var card1;
        var card2;
        var colorIndex;
        do {
            //loop until we get a card that has not been assigned to a pair
            var card1Index = Math.floor(Math.random() * 16); //generate random index of the card
            card1 = getCardByNum(card1Index);
        } while (isPaired(card1));
        do {
            //loop until we get a second card that is not card1 and not assigned to a pair yet
            var card2Index = Math.floor(Math.random() * 16); //generate random index of the card
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
    //check if the card has already been assigned to a pair
    for (let i = 0; i < cardPairs.length; i++) {
        let pair = cardPairs[i];
        if (pair.card1.index === card.index || pair.card2.index === card.index)
            return true;
        continue;
    }
    return false;
}

function isUsed(candidateColorIndex) {
    //check if the color has already been allocated to a pair
    for (let i = 0; i < cardPairs.length; i++) {
        let colorIndex = Number(cardPairs[i].colorClass.split("-")[1]);
        if (colorIndex === candidateColorIndex) return true;
        continue;
    }
    return false;
}

function initGame() {
    //initialise the game board
    generateBoardCards();
    createRandomCardPairs();
}

function flipAll() {
    //for testing purpose only
    for (card of boardCards) {
        card.flip();
    }
}
initGame(); //launch the game
//flipAll(); //to be uncommented if we want to check that the board is created properly, all cards are flipped

var firstFaceupCard = null; //the first card to be flipped in a pair
var card1Clicked = null; //card 1 of the flipped pair
var card2Clicked = null; //card 2 of the flipped pair

function handleCardFlipped(card) {
    // first card flipped in a pair, save it
    if (firstFaceupCard === null) {
        firstFaceupCard = card;
        return;
    }

    // second card flipped
    //check if the colors of the first and the second match
    if (firstFaceupCard.colorClass === card.colorClass) {
        // mark cards matched
        firstFaceupCard.matchFound();
        card.matchFound();
        firstFaceupCard = null; //forget the first card clicked to allow creating a new pair
        correctPairs++;
        console.log(`correct pairs: ${correctPairs}`);

        //your code for managing scores must go here
        document.getElementsByClassName("score")[0].innerHTML = `Score : ${correctPairs}/${numberOfCards / 2}`;
        if (correctPairs === numberOfCards / 2) {
            stopTimer();
            //game is won, show the total time
            alert(
                `You won! Time taken- ${
                  document.getElementById("minutes").innerHTML}:${
                    document.getElementById("seconds").innerHTML
        }`
            );
        }

    } else {
        // if no match, save the pair for the timeout to flip them back
        card1Clicked = firstFaceupCard;
        card2Clicked = card;

        firstFaceupCard = null; //forget the first, to make new attempt possible

        setTimeout(resetCards, 400); //wait 400 ms and flip both face down
    }
}

function resetCards() {
    //we come here when the was no match after an attempt
    card1Clicked.reset(); //flip the first card attempted
    card2Clicked.reset(); //flip the second card attempted
}
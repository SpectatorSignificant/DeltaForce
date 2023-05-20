//defining HTML elements
const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const controls = document.querySelectorAll(".controls i");
const timer = document.querySelector(".timer");
const sequenceBlock = document.querySelector(".sequence");
const livesBlock = document.querySelector(".lives");
const foodSound = new Audio('food.mp3');
const gameOverSound = new Audio("gameover.mp3");

//defining game variables
let startTime, endTime, duration;
let startPowerUps = (new Date())/1000;
let endPowerUps = startPowerUps;
let timeLeft = 60;
let gridsize = prompt("Enter gridsize:", 20);
let play = true;
let gameOver = false;
let foodX, foodY;
let food = [];
let food2= [];
let powerX, powerY;
let powerUps = [];
let powerUps2 = [];
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [[4,5],[4,5],[3,5]];
let setIntervalId;
let score = 0;
let lives=3;
let event = "";
let frameDelay = 100;
let words = ["DELTA", "FORCE", "INDIA", "HAPPY", "EXCEL", "WORDS", "SEVEN", "STORM", "GREAT"];
let word = words[0];
let frameDrop = 0;
let save = false;


const leaderTable = document.querySelector(".leaderboard");
let leaderList = JSON.parse(localStorage.getItem("leaderboard"));
if (leaderList === null || leaderList == []){
    leaderList = [];
    for (let i = 0; i < 10; i++){
        leaderList.push([0, "Guest"]);
    }
    localStorage.setItem("leaderboard", JSON.stringify(leaderList));
}

let username = prompt("Please enter your username", "Guest");
playBoard.style['grid-template'] = `repeat(${gridsize}, 1fr) / repeat(${gridsize}, 1fr)`;

//defining a function to find out if an array exists within an array
const ifAlreadyPresent = (a, arr) => {
    for (let i = 0; i < arr.length; i++){
        if (a[0] == arr[i][0] && a[1] == arr[i][1]){
            return true;
        }
    }
    return false;
}

//generates new coordinates for 5 food items
const updateFood = () => {
    let index = Math.floor(Math.random()*words.length);
    word = words[index];
    
    while (food.length < word.length){
        foodX = Math.floor(Math.random() * gridsize) + 1;
        foodY = Math.floor(Math.random() * gridsize) + 1;
      
        if (ifAlreadyPresent([foodX, foodY], food2) || ifAlreadyPresent([foodX, foodY], snakeBody) || (foodX == snakeX && foodY == snakeY)){
            continue;
        }
        else{
            food.push([foodX, foodY]);
            food2.push([foodX, foodY]);
        }
    }
    food.forEach((element, index) => {
        element.push(index);
        food.splice(index,1,element);
    
    });

    let html = ""; //adding the food tiles to the bottom of the game
    food.forEach((element, index) => {
        html+= `<div class="food tile">${word[index]}</div>`;
    });
    sequenceBlock.innerHTML = html;

}

//generates new coordinates for the powerup
const updatePowerUps = () => {
    while (powerUps.length < 1) {
        powerX = Math.floor(Math.random() * gridsize) + 1;
        powerY = Math.floor(Math.random() * gridsize) + 1;
        if (ifAlreadyPresent([powerX, powerY], powerUps2) || ifAlreadyPresent([powerX, powerY], snakeBody) || (powerX == snakeX && powerY == snakeY)){
            continue;
        }
        else{
            powerUps.push([powerX, powerY]);
            powerUps2.push([powerX, powerY]);
        }
    }
    
    powerUps.forEach((element, index) => {

        element.push(index);
        powerUps.splice(index,1,element);
    });
    //console.log(powerUps2);
    
}

const whenGameOver = () => {
    leaderList.push([score, username]);
    leaderList.sort((a,b) => {return a[0]-b[0]});
    leaderList.reverse();
    leaderList.pop();
    localStorage.setItem("leaderboard", JSON.stringify(leaderList)); //updates the leaderboard
    if (timeLeft > 0){
        gameOverSound.play();
    }
    clearInterval(setIntervalId); //ends the loop
    alert("Game Over! Press OK to replay...");
    location.reload(); //reloads the page
}

//changes velocity of snake based on keypress
const changeDirection = (e) => {
    if(e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    
    } 
    else if(e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;

    } 
    else if(e.key === "ArrowLeft" && velocityX != 1 && !(velocityX == 0 && velocityY == 0))  {
        velocityX = -1;
        velocityY = 0;
 
    } 
    else if(e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1; 
        velocityY = 0;
    }
    
    if (timeLeft == 60 && (velocityX != 0 || velocityY != 0)){
        startTime = new Date();
       timeLeft =59.995; //timer begins only after first keydown event
        
    }
}

// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

//makes pausebutton responsive to click
const pauseButton = document.querySelector(".pause");
pauseButton.addEventListener("click", () => play = !play); //changes boolean variable play
window.addEventListener("keydown", (e) => {
    if (e.key == " "){
        play = !play;
    }
}); //you can pause using spacebar too

const initGame = () => {
    
    if (timeLeft != 60){ //starts timer only after first keydown event
        endTime = new Date();
        duration = (endTime - startTime)/1000;
        startTime = new Date();
        timeLeft -= duration;
        timer.innerText = `Time: ${Math.round(timeLeft)}`;
        if (timeLeft <= 0){
            gameOver = true;
        }
    frameDrop += 1;
    if (frameDrop % 50 == 0 && frameDrop <= 300){
        console.log(frameDrop, frameDelay - frameDrop/10);
        clearInterval(setIntervalId);
        setIntervalId = setInterval(initGame, frameDelay - frameDrop/10);
    }
    }
    if (Math.round((endPowerUps - startPowerUps)) % 20 == 0){
        console.log(Math.round(endPowerUps - startPowerUps));
        endPowerUps = (new Date())/1000;
    } //generates new powerups
    if (Math.round(timeLeft) % 15 == 0){
        updatePowerUps();
    }
    if(gameOver){
        return whenGameOver();
    }
    else if (play == false){
        return; //if play == false function simply continues to the next iteration
    }

    let html = "";
    for (let i = 0; i < food.length; i++){
        html+= `<div class="food" style="grid-area: ${food[i][1]} / ${food[i][0]}">${word[food[i][2]]}</div>`; //adding food elements to playboard
        if (snakeX == food[i][0] && snakeY == food[i][1]){
            if (word[food[i][2]] != word[food[0][2]]){
                gameOverSound.play();
                lives--; //decrement life if food is eaten in the wrong order
                livesBlock.innerHTML = `Lives: ${lives}` //update lives display
                if (lives == 0){
                    foodSound.play();
                    gameOver = true;
                } //end game
                break;
            }
            
            else {
                if (i != 0){
                    let x = food[0];
                    food.splice(0,1,food[i]);
                    food.splice(i,1,x);
                } //interchanges elements in food when user eats a repating letter in wrong order to correct for it
                
                foodSound.play();
                
                snakeBody.push([foodX, foodY]); //increase length of snake by 1
                score++; //increment score by 1 for eating a block
                
                food.splice(0,1); //remove eaten element from food
                if (food.length == 0){
                    score += 2; //bonus points on completing a word
                    timeLeft += 5; //give bonus time on completing a word
                    updateFood(); //generate food    
                }
                break;
        }
        }
        scoreElement.innerText = `Score: ${score}`; //update score display
    }
    for (let i = 0; i < powerUps.length; i++){
        html+= `<div class="powerup" style="grid-area: ${powerUps[i][1]} / ${powerUps[i][0]}"></div>`; // add powerup elements
        if (snakeX == powerUps[i][0] && snakeY == powerUps[i][1]){
                foodSound.play();
                
                snakeBody.push([powerX, powerY]);
                let y = Math.floor(Math.random()*3);
                if (y == 0){
                    timeLeft += 8; //extra time powerup
                }
                else if (y == 1){
                    let z = snakeBody.length;
                    
                    for (let i = z - 1; i >= z/2; i--){ //halves the snake's length
                        snakeBody.splice(i, 1);   
                    }
                }
                else{
                    if (frameDelay - frameDrop/10 <= 100){
                        frameDrop -= 100; //reduces speed to what it was 10 seconds ago
                    }
                }
                
                powerUps.splice(i,1);
                break;
        }
        scoreElement.innerText = `Score: ${score}`;
    }
    if (gameOver){
        return;
    }
    snakeX += velocityX;
    snakeY += velocityY;
    
    // Shifting forward the values of the elements in the snake body by one
    for (let i = snakeBody.length - 1; i > 0; i--) {
        if (velocityX !=0 || velocityY != 0){
            snakeBody[i] = snakeBody[i - 1];
        }
            
    }
    if(snakeX <= 0 || snakeX > gridsize || snakeY <= 0 || snakeY > gridsize) {
        gameOver = true;
        if (snakeY == 0){//make sure snake doesnt go outside the grid
            snakeY = 1;
        }
        if (snakeX == 0){
            snakeX = 1;
        }
    }
    snakeBody[0] = [snakeX, snakeY];
    for (let i = 0; i < snakeBody.length; i++) {
        // Adding a div for each part of the snake's body
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        // Checking if the snake head hit the body, if so set gameOver to true
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    let html2 = "";
    leaderList.forEach((element, index) => {
        html2 += `<div class = "leader grid-row-start = ${index + 1} grid-column-start = 1">${element[1]} ${element[0]}</div>`
    });
    leaderTable.innerHTML = html2;
    playBoard.innerHTML = html;
}

updateFood();
updatePowerUps();
document.addEventListener("keydown", changeDirection);

//while (frameDelay > 0){
    setIntervalId = setInterval(initGame, 100);
//}

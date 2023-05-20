//defining HTML elements
const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const controls = document.querySelectorAll(".controls i");
const timer = document.querySelector(".timer");
const sequenceBlock = document.querySelector(".sequence");
const foodSound = new Audio("food.mp3");
const gameOverSound = new Audio("gameover.mp3");

//defining game variables
let startTime, endTime, duration;
let timeLeft = 60;
let gridsize = 20;
let play = true;
let gameOver = false;
let foodX, foodY;
let food = [];
let food2= [];
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [[4,5],[4,5],[3,5]];
let setIntervalId;
let score = 0;
let lives=3;


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

//defining a function to find to if an element already exists in an array
const ifAlreadyPresent = (a, arr) => {
    for (let i = 0; i < arr.length; i++){
        if (a[0] == arr[i][0] && a[1] == arr[i][1]){
            return true;
        }
    }
    return false;
}

//generates new coordinates for 5 food items
const updateFoodPosition = () => {
    while (food.length < 5){
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
    let html = ""; //adding the food tiles to the bottom of the screen
    food.forEach((element, index) => {
        html+= `<div class="food${element[2]+1} tile" style="grid-area: ${element[1]} / ${element[0]}"></div>`;
    });
    sequenceBlock.innerHTML = html;

}

//g
const whenGameOver = () => {
    // Clearing the timer and reloading the page on game over
    leaderList.push([score, username]); //updates the leaderboard
    leaderList.sort((a,b) => {return a[0]-b[0]});
    leaderList.reverse();
    leaderList.pop();
    localStorage.setItem("leaderboard", JSON.stringify(leaderList));
    if (timeLeft > 0){
        gameOverSound.play(); //sound of death
    }

    clearInterval(setIntervalId); //ends the loop
    alert("Game Over! Press OK to replay...");
    location.reload(); //reloads the page
}

const changeDirection = (e) => {
    // Changing velocity value based on key press
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
        timeLeft = 59.99; //timer begins only after first keypress
    }
}

// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

const gameEngine = () => {
    if (timeLeft != 60){
        endTime = new Date();
        duration = (endTime - startTime)/1000;
        startTime = new Date();
        timeLeft -= duration;
        timer.innerText = `Time: ${Math.round(timeLeft)}`;//updates timer display
        if (duration/1000 >= 60){
            gameOver = true;
        }
    }

    if(gameOver){
        return whenGameOver();
    }
    else if (play==false){
        return;
    }
    let html = "";

    // Checking if the snake hit the food
    for (let i = 0; i < food.length; i++){
        html+= `<div class="food${food[i][2]+1}" style="grid-area: ${food[i][1]} / ${food[i][0]}"></div>`;//adds food elements to the board
        if (snakeX == food[i][0] && snakeY == food[i][1]){
            foodSound.play();
            if (i != 0){ //checks if color was eaten in the right order
                gameOver = true;
                break;
            }
            else{
                food.splice(i,1); //
                if (food.length == 0){
                    score += 2;
                    timeLeft += 5;
                    updateFoodPosition();//generates new food    
                }
                break;
        }
        }
        scoreElement.innerText = `Score: ${score}`;//updates score display
    }
    
    if (gameOver){
        return;
    }
    // Updating the snake's head position based on the current velocity
    snakeX += velocityX;
    snakeY += velocityY;
    
    // Shifting forward the values of the elements in the snake body by one
    for (let i = snakeBody.length - 1; i > 0; i--) {
        if (velocityX !=0 || velocityY != 0){
            snakeBody[i] = snakeBody[i - 1];
        }
            
    }

    // Checking if the snake's head is out of wall, if so setting gameOver to true
    if(snakeX <= 0 || snakeX > gridsize || snakeY <= 0 || snakeY > gridsize) {
        gameOver = true;
        if (snakeY == 0){
            snakeY = 1;
        }
        if (snakeX == 0){
            snakeX = 1;
        }
    }
    snakeBody[0] = [snakeX, snakeY]; // Setting first element of snake body to current snake position
    for (let i = 0; i < snakeBody.length; i++) {
        // Adding a div for each part of the snake's body
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        // Checking if the snake head hit the body, if so set gameOver to true
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    let html2 = ""; //add leaderboard names to the leaderboard display
    leaderList.forEach((element, index) => {
        html2 += `<div class = "leader grid-row-start = ${index + 1} grid-column-start = 1">${element[1]} ${element[0]}</div>`
    });
    leaderTable.innerHTML = html2;
    playBoard.innerHTML = html;
}

updateFoodPosition();
setIntervalId = setInterval(gameEngine, 100); //starts game loop
document.addEventListener("keydown", changeDirection);

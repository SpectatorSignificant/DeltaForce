const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const timer = document.querySelector(".timer");
const sequenceBlock = document.querySelector(".sequence");
const foodSound = new Audio('food.mp3');

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
//localStorage.removeItem("leaderboard");
//let leaderList = null;
let leaderList = JSON.parse(localStorage.getItem("leaderboard"));
//console.log(leaderList,typeof(leaderList));
if (leaderList === null || leaderList == []){
    leaderList = [];
    for (let i = 0; i < 10; i++){
        leaderList.push([0, "Guest"]);
    }
    //console.log(leaderList, typeof(leaderList));
    localStorage.setItem("leaderboard", JSON.stringify(leaderList));
}
//console.log(leaderList, typeof(leaderList));
//let list = [[1,2],[3,4]]
//console.log(list, typeof(list));
/*leaderList.forEach((element) => {
    console.log(element[0], element[1]);
});*/


//localStorage.setItem("high-score", 3);
//Changing gridsize
let username = prompt("Please enter your username", "Guest");
playBoard.style['grid-template'] = `repeat(${gridsize}, 1fr) / repeat(${gridsize}, 1fr)`;
//playBoard.style.setAttribute("style",`grid-template: repeat(${gridsize}, 1fr) / repeat(${gridsize}, 1fr)`);

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

const updateFoodPosition = () => {
    // Passing a random 1 - gridsize value as food position
    //foodX = 10;
    //foodY = 10;
    //food[0] = [10, 10];
    //food[1] = [15, 15];
    while (food.length < 5){
        foodX = Math.floor(Math.random() * gridsize) + 1;
        foodY = Math.floor(Math.random() * gridsize) + 1;
        /*food2.forEach((element, index) => {
            if (foodX != element[0] || foodY != element[1]){
                console.log([foodX, foodY]);
                food.push([foodX, foodY]);
                food2.push([foodX, foodY]);
                alert(food2);
            }
        });*/
        if (!(food2.includes([foodX, foodY]))){
            //console.log([foodX, foodY], food2.includes([foodX, foodY]));
            food.push([foodX, foodY]);
            food2.push([foodX, foodY]);
        }
    }
    food.forEach((element, index) => {
        //alert(element, element.push(index));
        element.push(index);
        food.splice(index,1,element);
    
    });
    alert(food2);
    let html = "";
    food.forEach((element, index) => {
        html+= `<div class="food${element[2]+1} tile" style="grid-area: ${element[1]} / ${element[0]}"></div>`;
    });
    sequenceBlock.innerHTML = html;

}

const handleGameOver = () => {
    // Clearing the timer and reloading the page on game over
    leaderList.push([score, username]);
    leaderList.sort((a,b) => {return a[0]-b[0]});
    leaderList.reverse();
    leaderList.pop();
    localStorage.setItem("leaderboard", JSON.stringify(leaderList));
    console.log(leaderList[0]);
    clearInterval(setIntervalId);
    alert("Game Over! Press OK to replay...");
    location.reload();
}

const changeDirection = (e) => {
    // Changing velocity value based on key press
    if (timeLeft == 60){
        startTime = new Date();
        //endTime = new Date();
        //duration = endTime - startTime
        timeLeft = 59.99;
        //timer.innerText = `Time : ${timeLeft}`;
    }
    if(e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    
    } 
    else if(e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;

    } 
    else if(e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
        
    } 
    else if(e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
    console.log(leaderList[0]);
}

// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

const pauseButton = document.querySelector(".pause");
const saveButton = document.querySelector(".save");

const initGame = () => {
    if (timeLeft != 60){
        console.log(timeLeft);
        endTime = new Date();
        duration = endTime - startTime;
        //timeLeft = Math.round(60 - duration/1000);
        timer.innerText = `Time: ${Math.round(60 - duration/1000)}`;
        if (duration/1000 >= 60){
            console.log(duration);
            gameOver = true;
        }
    }
    //console.log(duration);

    if(gameOver){
        return handleGameOver();
    }
    else if (play==false){
        return;
    }
    let html = "";
    //let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    // Checking if the snake hit the food
    
    let foodNumber = 1;
    food.forEach((element, index) => {
        //alert(food);
        //alert(element[3]);
        html+= `<div class="food${element[2]+1}" style="grid-area: ${element[1]} / ${element[0]}"></div>`;
        if (snakeX === element[0] && snakeY === element[1]){
            foodSound.play();
            //updateFoodPosition();
            
            console.log((index + 1), foodNumber);
            if (index + 1 != foodNumber){
                gameOver = true;
                foodNumber = 1;
                return;
            }
            foodNumber ++;
            
            console.log((index + 1), foodNumber);
            //alert(index + 1);
            if (foodNumber == 6){
                console.log(index + 1);
                score = score + 3; // 2 extra points for completing a sequence
            }
            else{
                score++; //increment score by 1 for eating a block
            }
            if (score > highScore){
                highScore = score;
            }
            //snakeBody.push([[element[0], element[1]]]); // Pushing food position to snake body array
            food.splice(index,1);
            if (food.length == 0){
                updateFoodPosition();            
            }
            console.log("hello")
        }

    /*if(snakeX === foodX && snakeY === foodY) {
        foodSound.play();
        updateFoodPosition();
        snakeBody.push([foodX,foodY]); // Pushing food position to snake body array
        score++; // increment score by 1
        if (score > highScore){
            highScore = score;

        }*/
    
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    });
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
    snakeBody[0] = [snakeX, snakeY]; // Setting first element of snake body to current snake position

    // Checking if the snake's head is out of wall, if so setting gameOver to true
    if(snakeX <= 0 || snakeX > gridsize || snakeY <= 0 || snakeY > gridsize) {
        gameOver = true;
    }

    for (let i = 0; i < snakeBody.length; i++) {
        // Adding a div for each part of the snake's body
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        // Checking if the snake head hit the body, if so set gameOver to true
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    let html2 = "";
    //console.log(leaderList,typeof(leaderList));
    leaderList.forEach((element, index) => {
        html2 += `<div class = "leader grid-row-start = ${index + 1} grid-column-start = 1">${element[1]} ${element[0]}</div>`
    });
    leaderTable.innerHTML = html2;
    playBoard.innerHTML = html;
}

updateFoodPosition();
/*while (true) {
    duration = Date() - startTime;
    setTimeout(initGame, 1000/duration);
    document.addEventListener("keydown", changeDirection);
  }*/
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keydown", changeDirection);
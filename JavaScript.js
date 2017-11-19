/* Isaac Wismer
 * MineSweeper
 * Sept 2014 - Jan 2015
 */

/* VARIABLES:
 * i and j are always 0 - ((the size of the playing board - 1) * 25) in intervals of 25
 * k and l, m and n are 0 - (the size of the playing board - 1)
 * squares holds the values for how many bonbs surrounds that specific square [0 - (playing board - 1)][0 - (playing board - 1)]
 * filled holds the value for whether or not the square has already been clicked or marked [0 - (playing board - 1)][0 - (playing board - 1)]
 * x and y CoodRand tempoaraly stores the coods of the bombs
 */

/* FUNCTIONS (in order of appearance):
 * Set the win to false, make the arrays for squares and filled, delcare other arrays, create connection to the canvas
 * Get the user to input the size of the playing board, error-check
 * Get the user to input the number of bombs, error-check
 * set the size of the canvas
 * expand the arrays to make them 2d, set all the filled values to false, create the gameboard
 * bombCheck takes in the loaction of a square, and spits out how many bombs surrount it, only called by the following for loop
 * firstClick is only called the first time a user clicks the game board it:
 *      places the bombs randomly throughout the board
 *      makes sure that the user clicks on a zero
 *      calls bombCheck for every square on the gameboard
 * fillFunc makes a rectangle of the given peramiters
 * textFunc makes text on the gameboard
 * zeroCheck checks to see if the clicked box is beside an unfilled 0, and if so, fills it in so you get a border of boxes with numbers
 * The floodFunc is a recursive funtion, fills in all the ajacent zeros when a zero is clicked on
 * winCheck is a function that is called every time the user clicks. I checks to see if they have won
 * rightClick is called when the user rightclicks, and it lets them flag and unflag squares
 * leftClick is called when the user leftclicks
 * getClickLocation get the location of where the user clicked and detects which button they used.
 * 2 event listeners are triggered when the user clicks either the left or right mouse button
 */

/* ORDER OF OPERATION:
 * ask for size of board and number of bombs
 * arrays declared
 * arrays expanded, filled is filled with false, game board created
 * This is the end of the setup for the game
 * The user clicks for the first time
 * Event listener fires, calls getClickLocation, calls firstClick
 * firstClick places bombs so that the user clicks on a zero
 * the squares array is populated with the number of bombs surrounding each square
 * the user get feedback from squares changing colour on the screen
 * the user can click again
 * Event listener fires, calls get click location
 * If it was a left click ir calls leftClick and the funtion figures out if it was a bomb or not
 * if it was a right click it marks or unmarks the square
 * if the user clicks on a bomb, the bomb locations are revealed and the user is notified that they lost
 * If the the user marks all the bombs correctly, then they are notified that they won
 */

//declare the arrays and variables, create connection with the canvas
var squares = [],
        filled = [],
        click = 0,
        xCoodRand,
        yCoodRand,
        mouseX,
        mouseY,
        canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        playSize = 0,
        numBombs = 0,
        reccomendaion,
        startTime,
        totalTimeMS,
        totalTimeS,
        totalTimeM,
        totalTimeH;

//asks the user for how big they want the board to be, it also error checks for a non number and a value to large or small
while (parseInt(playSize, 10) === "NaN" || playSize < 10 || playSize > 50) {
    playSize = prompt("Please enter the desired size for the playing space", "10");
    //if checks if they entered a non number, a number less than 10 or greater than 50
    if (parseInt(playSize, 10) === "NaN" || !parseInt(playSize, 10)) {
        alert("That is not a number");
    } else if (playSize < 10) {
        alert("That number is too small. Must be between or including 10 and 50");
    } else if (playSize > 50) {
        alert("That number is too large. Must be between or including 1 and 50");
    }
}

//reccomends a number of bombs so that 1 in 10 squares is a bomb
reccomendaion = Math.floor((playSize * playSize) / 10);

//asks the user for how many bombs they want there to be, it also error checks for a non number and a value to large or small
while (parseInt(numBombs, 10) === "NaN" || numBombs < 1 || numBombs > (playSize * playSize) - playSize || !parseInt(numBombs, 10)) {
    numBombs = prompt("Please enter the desired number of bombs", reccomendaion);
    //checks to see if they entered a non number, a number less than 1 or more than ((playSize * playSize) - playSize))/playSize in 1 squares is a bomb 
    //(eg 90 bombs for 10x10 or 2450 for 50x50)
    if (parseInt(numBombs, 10) === "NaN" || !parseInt(numBombs, 10)) {
        alert("That is not a number");
    } else if (numBombs < 1) {
        alert("That number is too small. Must be between or including 1 and " + ((playSize * playSize) - playSize));
    } else if (numBombs > (playSize * playSize) - playSize) {
        alert("That number is too large. Must be between or including 1 and " + ((playSize * playSize) - playSize));
    }
}

//set the size of the canvas
ctx.canvas.width = playSize * 25;
ctx.canvas.height = playSize * 25;
rect = canvas.getBoundingClientRect();

//expand the variables and create the playing space
for (var k = 0; k < playSize; k++) {
    squares[k] = [];
    filled[k] = [];
    for (var l = 0; l < playSize; l++) {
        filled[k][l] = false;
        ctx.beginPath();
        ctx.rect(k * 25, l * 25, 25, 25);
        ctx.closePath;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

//function to check how many bombs surround a square
var bombCheck = function (k1, k2, l1, l2, m, n) {
    var bombCount = 0;
    //loops through the boxes to the top, left, right and below the original square
    for (var k = m - k1; k <= m + k2; k++) {
        for (var l = n - l1; l <= n + l2; l++) {
            if (squares[k][l] === "b") {
                bombCount++;
            }
        }
    }
    return bombCount;
};

//called the first time the user clicks from getClickLocation, places the bombs and populates the squares array
var firstClick = function (m, n) {
    //randomly chooses the bombs
    for (var k = 0; k < numBombs; k++) {
        xCoodRand = parseInt(Math.random(0, playSize) * playSize);
        yCoodRand = parseInt(Math.random(0, playSize) * playSize);
        console.log(xCoodRand, yCoodRand, k);
        //checks to see if the bomb was clicked on or ajacent to the clicked on space
        if (xCoodRand === m && yCoodRand === n ||
                xCoodRand === m - 1 && yCoodRand === n - 1 ||
                xCoodRand === m - 1 && yCoodRand === n ||
                xCoodRand === m - 1 && yCoodRand === n + 1 ||
                xCoodRand === m && yCoodRand === n + 1 ||
                xCoodRand === m + 1 && yCoodRand === n + 1 ||
                xCoodRand === m + 1 && yCoodRand === n ||
                xCoodRand === m + 1 && yCoodRand === n - 1 ||
                xCoodRand === m && yCoodRand === n - 1 ||
                squares[xCoodRand][yCoodRand] === "b") {
            k--;
        } else {
            squares[xCoodRand][yCoodRand] = "b";
        }
    }
    //initiates the bombCheck function with different arguments depending on it's position
    for (var k = 0; k < playSize; k++) {
        for (var l = 0; l < playSize; l++) {
            if (squares[k][l] !== "b") {
                if (k !== 0 && k !== playSize - 1 && l !== 0 && l !== playSize - 1) {
                    squares[k][l] = bombCheck(1, 1, 1, 1, k, l);
                } else if (k === 0 && k !== playSize - 1 && l !== 0 && l !== playSize - 1) {
                    squares[k][l] = bombCheck(0, 1, 1, 1, k, l);
                } else if (k !== 0 && k === playSize - 1 && l !== 0 && l !== playSize - 1) {
                    squares[k][l] = bombCheck(1, 0, 1, 1, k, l);
                } else if (k !== 0 && k !== playSize - 1 && l === 0 && l !== playSize - 1) {
                    squares[k][l] = bombCheck(1, 1, 0, 1, k, l);
                } else if (k !== 0 && k !== playSize - 1 && l !== 0 && l === playSize - 1) {
                    squares[k][l] = bombCheck(1, 1, 1, 0, k, l);
                } else if (k === 0 && k !== playSize - 1 && l === 0 && l !== playSize - 1) {
                    squares[k][l] = bombCheck(0, 1, 0, 1, k, l);
                } else if (k === 0 && k !== playSize - 1 && l !== 0 && l === playSize - 1) {
                    squares[k][l] = bombCheck(0, 1, 1, 0, k, l);
                } else if (k !== 0 && k === playSize - 1 && l === 0 && l !== playSize - 1) {
                    squares[k][l] = bombCheck(1, 0, 0, 1, k, l);
                } else if (k !== 0 && k === playSize - 1 && l !== 0 && l === playSize - 1) {
                    squares[k][l] = bombCheck(1, 0, 1, 0, k, l);
                }
            }
        }
    }
    startTime = Date.now();
    return;
};

//this function makes rectangles given certain peramiters
var fillFunc = function (colour, rectX, rectY) {
    ctx.fillStyle = colour;
    ctx.strokeStyle = "Black";
    ctx.fillRect(rectX, rectY, 25, 25);
    ctx.strokeRect(rectX, rectY, 25, 25);
    return;
};

//this function creates text given peramiters
var textFunc = function (colour, tSize, words, textX, textY) {
    ctx.fillStyle = colour;
    ctx.font = tSize + "px Georgia";
    ctx.fillText(words, textX, textY);
    return;
};

//this funtion checks to see if the clicked box is beside an unfilled 0, and if so, fills it in so you get a border of boxes with numbers
var zeroCheck = function (k1, k2, l1, l2, m, n) {
    //loops through the boxes to the top, left, right and below the original square
    for (var k = m - k1; k <= m + k2; k++) {
        for (var l = n - l1; l <= n + l2; l++) {
            if (squares[k][l] === 0 && filled[k][l] === true) {
                fillFunc("Red", (m * 25), (n * 25));
                textFunc("Blue", 20, squares[m][n], m * 25 + 8, n * 25 + 20);
                filled[m][n] = true;
                return;
            }
        }
    }
    return;
};

//flood fill funtion checks to see if squares are zeros around the clicked one to clear them also
var floodFill = function (k, l, caller) {
    //only happens if this function was called fro itself
    if (caller === 1) {
        if (filled[k][l] === true || squares[k][l] !== 0) {
            return;
        }
    }
    //fill in the box with it's number
    if (filled[k][l] !== "guess") {
        fillFunc("Red", k * 25, l * 25);
        filled[k][l] = true;
        textFunc("Blue", 20, squares[k][l], k * 25 + 8, l * 25 + 20);
    }
    //begin calling the function for the squares around it
    if (k !== 0 && k !== playSize - 1 && l / 25 !== 0 && l !== playSize - 1) {
        floodFill(k + 1, l, 1);
        floodFill(k - 1, l, 1);
        floodFill(k, l + 1, 1);
        floodFill(k, l - 1, 1);
        floodFill(k + 1, l + 1, 1);
        floodFill(k - 1, l - 1, 1);
        floodFill(k - 1, l + 1, 1);
        floodFill(k + 1, l - 1, 1);
        return;
    } else if (k === 0 && k !== playSize - 1 && l !== 0 && l !== playSize - 1) {
        floodFill(k + 1, l, 1);
        floodFill(k, l + 1, 1);
        floodFill(k, l - 1, 1);
        floodFill(k + 1, l - 1, 1);
        floodFill(k + 1, l + 1, 1);
        return;
    } else if (k !== 0 && k === playSize - 1 && l !== 0 && l !== playSize - 1) {
        floodFill(k - 1, l);
        floodFill(k, l + 1, 1);
        floodFill(k, l - 1, 1);
        floodFill(k - 1, l - 1, 1);
        floodFill(k - 1, l + 1, 1);
        return;
    } else if (k !== 0 && k !== playSize - 1 && l === 0 && l !== playSize - 1) {
        floodFill(k + 1, l, 1);
        floodFill(k - 1, l, 1);
        floodFill(k, l + 1, 1);
        floodFill(k - 1, l + 1, 1);
        floodFill(k + 1, l + 1, 1);
        return;
    } else if (k !== 0 && k !== playSize - 1 && l !== 0 && l === playSize - 1) {
        floodFill(k + 1, l, 1);
        floodFill(k - 1, l, 1);
        floodFill(k, l - 1, 1);
        floodFill(k - 1, l - 1, 1);
        floodFill(k + 1, l - 1, 1);
        return;
    } else if (k === 0 && k !== playSize - 1 && l === 0 && l !== playSize - 1) {
        floodFill(k + 1, l, 1);
        floodFill(k, l + 1, 1);
        floodFill(k + 1, l + 1, 1);
        return;
    } else if (k === 0 && k !== playSize - 1 && l !== 0 && l === playSize - 1) {
        floodFill(k + 1, l, 1);
        floodFill(k, l - 1, 1);
        floodFill(k + 1, l - 1, 1);
        return;
    } else if (k !== 0 && k === playSize - 1 && l === 0 && l !== playSize - 1) {
        floodFill(k - 1, l, 1);
        floodFill(k, l + 1, 1);
        floodFill(k - 1, l + 1, 1);
        return;
    } else if (k !== 0 && k === playSize - 1 && l !== 0 && l === playSize - 1) {
        floodFill(k - 1, l, 1);
        floodFill(k, l - 1, 1);
        floodFill(k - 1, l - 1, 1);
        return;
    }
    return;
};

//checks to see if the user has won
var winCheck = function () {
    if (click === 0) {
        return;
    }
    for (var k = 0; k < playSize; k++) {
        for (var l = 0; l < playSize; l++) {
            if ((filled[k][l] === "guess" && squares[k][l] !== "b") || (filled[k][l] !== "guess" && squares[k][l] === "b")) {
                return;
            }
        }
    }
    return true;
};

//called from getClickLocation, allows the user to mark and unmark squares
var rightClick = function (i, j) {
    //if it was not yet marked
    if (filled[i / 25][j / 25] !== "guess") {
        fillFunc("Green", i, j);
        filled[i / 25][j / 25] = "guess";
        //if it was already marked
    } else {
        fillFunc("White", i, j);
        filled[i / 25][j / 25] = false;
    }
    return;
};

//called from getClickLocation, lets the user click on squares to reveal them, also has the loss code
var leftClick = function (i, j) {
    //if they clicked on a bomb that wasnt marked
    if (squares[i / 25][j / 25] === "b" && filled[i / 25][j / 25] !== "guess") {
        fillFunc("Black", i, j);
        filled[i / 25][j / 25] = true;
        for (var k = 0; k < playSize; k++) {
            for (var l = 0; l < playSize; l++) {
                if (squares[k][l] === "b") {
                    fillFunc("Black", k * 25, l * 25);
                }
            }
        }
        ctx.textAlign = "center";
        textFunc("Cyan", (playSize * 5) -playSize, "YOU LOSE", (playSize * 25) / 2, (playSize * 25) / 2);
        //if they clicked on a box thats not a bomb and not marked
    } else if (filled[i / 25][j / 25] !== "guess") {
        fillFunc("Red", i, j);
        filled[i / 25][j / 25] = true;
        textFunc("Blue", 20, squares[i / 25][j / 25], i + 8, j + 20);
        //if they clicked on a zero
        if (squares[i / 25][j / 25] === 0) {
            //begin checking ajacent zeros
            floodFill(i / 25, j / 25, 0);
            //this gives the border of squares with nubmers
            for (var k = 0; k < playSize; k++) {
                for (var l = 0; l < playSize; l++) {
                    if (squares[k][l] !== "b" && squares[k][l] !== 0 && filled [k][l] !== true) {
                        if (k !== 0 && k !== playSize - 1 && l !== 0 && l !== playSize - 1) {
                            zeroCheck(1, 1, 1, 1, k, l);
                        } else if (k === 0 && k !== playSize - 1 && l !== 0 && l !== playSize - 1) {
                            zeroCheck(0, 1, 1, 1, k, l);
                        } else if (k !== 0 && k === playSize - 1 && l !== 0 && l !== playSize - 1) {
                            zeroCheck(1, 0, 1, 1, k, l);
                        } else if (k !== 0 && k !== playSize - 1 && l === 0 && l !== playSize - 1) {
                            zeroCheck(1, 1, 0, 1, k, l);
                        } else if (k !== 0 && k !== playSize - 1 && l !== 0 && l === playSize - 1) {
                            zeroCheck(1, 1, 1, 0, k, l);
                        } else if (k === 0 && k !== playSize - 1 && l === 0 && l !== playSize - 1) {
                            zeroCheck(0, 1, 0, 1, k, l);
                        } else if (k === 0 && k !== playSize - 1 && l !== 0 && l === playSize - 1) {
                            zeroCheck(0, 1, 1, 0, k, l);
                        } else if (k !== 0 && k === playSize - 1 && l === 0 && l !== playSize - 1) {
                            zeroCheck(1, 0, 0, 1, k, l);
                        } else if (k !== 0 && k === playSize - 1 && l !== 0 && l === playSize - 1) {
                            zeroCheck(1, 0, 1, 0, k, l);
                        }
                    }
                }
            }
        }
    }
    return;
};

//figures out what square was clicked on, or if it was the first click calls the firstClick funtion
var getClickLocation = function (e, button) {
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    console.log(mouseX, mouseY, e.which);
    clickLoop:
            for (var i = 0; i < playSize * 25; i += 25) {
        for (var j = 0; j < playSize * 25; j += 25) {
            //checks if the click was withing the box
            if (mouseX > i && mouseX < i + 25 && mouseY > j && mouseY < j + 25) {
                if (filled[i / 25][j / 25] !== true) {
                    if (click === 0) {
                        firstClick(i / 25, j / 25);
                        click++;
                    }
                    if (button === 0) {
                        leftClick(i, j);
                    } else {
                        rightClick(i, j);
                    }
                }
                //break the loop becasuse we have founf where the click was
                break clickLoop;
            }
        }
    }
    //checks to see if the user has won
    if (winCheck() === true) {
        ctx.textAlign = "center";
        textFunc("Yellow", (playSize * 5), "YOU WIN", (playSize * 25) / 2, (playSize * 25) / 2);
        totalTimeMS = (Date.now()) - startTime;
        totalTimeH = Math.floor(totalTimeMS / 3600000);
        totalTimeMS = totalTimeMS % 3600000;
        totalTimeM = Math.floor(totalTimeMS / 60000);
        totalTimeMS = totalTimeMS % 60000;
        totalTimeS = Math.floor(totalTimeMS / 1000);
        totalTimeMS = totalTimeMS % 1000;
        ctx.textAlign = "left";
        textFunc("White", 30, "Time: " + (totalTimeH) + ":" + (totalTimeM) + ":" + (totalTimeS), 10, 25);
    }
};

//triggered when the mosue is left clicked, calls getClickLocation
canvas.addEventListener("click", function (e) {
    getClickLocation(e, 0);
}, false);

//triggered when the mosue is right clicked, calls getClickLocation
canvas.addEventListener("contextmenu", function (e) {
    getClickLocation(e, 1);
}, false);
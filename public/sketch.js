var rows = (cols = 10);
var cellW = 60;

var grid = [];

var selected, selectedValue;

var whites = blacks = 10;

var turn = 0, turnValue;

var gameover = false;
var winner;

var socket;

function setup() {
  createCanvas(601, 601);
  background(0);

  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid.push(new Cell(j, i));
    }
  }

  for (var i = 0; i < cols; i++) {
     if(i%2 === 1){
       grid[i + 0 * cols].value = 0;
       grid[i + 2 * cols].value = 0;

       grid[i + 8 * cols].value = 1;
     }else{
       grid[i + 1 * cols].value = 0;

       grid[i + 7 * cols].value = 1;
       grid[i + 9 * cols].value = 1;
     }
  }

  socket = io.connect('http://localhost:1000');

  socket.on('init', function(data){
    turnValue = data.turnValue;
    turn = data.turn;
    console.log(data);
  });

  socket.on('move', function(data){
      for(var i = 0; i < grid.length; i++){
        grid[i].highlight = data[i].highlight;
        grid[i].kill = data[i].kill;
        grid[i].value = data[i].value;
      }
      turn = (turn === 0)?1:0;
  });
}

function mouseClicked() {
  if(turnValue === turn){
    if(!gameover){
      for (var i = 0; i < grid.length; i++) {
        if (grid[i].contains(mouseX, mouseY)) {
          if (grid[i].value !== -1) {
            if(grid[i].kill){
              if(grid[i].value === 0){
                whites--;
              }else if(grid[i].value === 1){
                blacks--;
              }
              selected.value = -1;
              selected.color = selected.nativeColor;
              for (var j = 0; j < grid.length; j++) {
                grid[j].highlight = false;
                grid[j].kill = false;
              }
              var s = selected;
              var t = grid[i];
              var target;
              if(s.i - t.i === 1 && s.j - t.j === 1){
                //topleft
                target = grid[index(t.i - 1, t.j - 1)];
              }else if(s.i - t.i === -1 && s.j - t.j === 1){
                //topright
                target = grid[index(t.i + 1, t.j - 1)];
              }else if(s.i - t.i === 1 && s.j - t.j === -1){
                //bottomleft
                target = grid[index(t.i - 1, t.j + 1)];
              }else if(s.i - t.i === -1 && s.j - t.j === -1){
                //bottomright
                target = grid[index(t.i + 1, t.j + 1)];
              }
              t.value = -1;
              target.value = selectedValue;
              turn = (turn === 0)?1:0;
              socket.emit('move', grid);
              if(blacks === 0){
                gameover = true;
                winner = 0;
              }else if(whites === 0){
                gameover = true;
                winner = 1;
              }
            }else if(grid[i].value === turn){
              grid[i].color = "gray";
              selected = grid[i];
              selectedValue = selected.value;
               for (var j = 0; j < grid.length; j++) {
                if (j !== i) {
                  grid[j].color = grid[j].nativeColor;
                }
                grid[j].highlight = false;
                grid[j].kill = false;
              }
              grid[i].checkMoves();
            }
          }else if(selected){
            if(grid[i].highlight){
              selected.value = -1;
              selected.color = selected.nativeColor;
              for (var j = 0; j < grid.length; j++) {
                grid[j].highlight = false;
                grid[j].kill = false;
              }
              grid[i].value = selectedValue;
              turn = (turn === 0)?1:0;
              socket.emit('move', grid);
            }
          }
        }
      }
    }
  }
}

function draw() {
  background(0);
  if(grid.length == 0){
     fill(0,0,255, 200);
     noStroke();
     textSize(82);
     text("Waiting on opponent", 100, 200);
  }else{
     for (var i = 0; i < grid.length; i++) {
       grid[i].show();
       if (grid[i].contains(mouseX, mouseY)) {
         grid[i].hover = true;
       } else {
         grid[i].hover = false;
       }
     }
     if(gameover){
       fill(0,0,255, 200);
       noStroke();
       textSize(82);
       if(winner === 0){
         text("White Won!!!", 100, 200);
       }else{
         text("Black Won!!", 100, 200);
       }
     }else{
       if(blacks === 0){
           gameover = true;
           winner = 0;
       }else if(whites === 0){
           gameover = true;
           winner = 1;
      }
     }
  }
}

function index(i, j){
  if(i < 0 || j < 0 || i > rows-1 || j > cols-1){
    return -1;
  }

  return i + j * cols;
}

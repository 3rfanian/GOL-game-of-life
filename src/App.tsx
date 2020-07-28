import React, { useState, useCallback, useRef } from "react";
import produce from "immer";

//setting the shape of the game 
const numRows = 20;
const numCols = 20;

// set operator which are the neighbours indexes
const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
];

// befor the starting anf after click on clear we need clear and empty grids
const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    //in each grid put numer zero so grid set to null and the color change to white
    rows.push(Array.from(Array(numCols), () => 0));
  }

  return rows;
};


const App: React.FC = () => {
  // first set the state in empty 
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });

  //define the running state  
  const [running, setRunning] = useState(false);

  const runningRef = useRef(running);
  runningRef.current = running;

  //the main function of the program 
  const runSimulation = useCallback(() => {
    //if we are not in running do nothings
    if (!runningRef.current) {
      return;
    }
    
    //we are in running state so we have to define our rules
    setGrid(g => {
      return produce(g, gridCopy => {
        for (let i = 0; i < numRows; i++) {
          for (let k = 0; k < numCols; k++) {
            let neighbors = 0;
            //we reffer to eache neighbours of each grid
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newK = k + y;
              //finde the #neighbours which are living
              if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                neighbors += g[newI][newK];
              }
            });
            //Any live cell with fewer than two live neighbours dies, as if by underpopulation.
            //Any live cell with more than three live neighbours dies, as if by overpopulation.
            //Any live cell with two or three live neighbours lives on to the next generation
            //Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction
            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][k] = 0;
            } else if (g[i][k] === 0 && neighbors === 3) {
              gridCopy[i][k] = 1;
            }
          }
        }
      });
    });
    //set the speed of the program
    setTimeout(runSimulation, 50);
  }, []);

  //the return and HTML part 
  return (
    <>
      <button
        onClick={() => {
          setRunning(!running);
          if (!running) {
            runningRef.current = true;
            runSimulation();
          }
        }}
      >
        {running ? "stop" : "start"}
      </button>
      <button
        onClick={() => {
          const rows = [];
          for (let i = 0; i < numRows; i++) {
            rows.push(
              Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))
            );
          }

          setGrid(rows);
        }}
      >
        random
      </button>
      <button
        onClick={() => {
          setGrid(generateEmptyGrid());
        }}
      >
        clear
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, 20px)`
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              key={`${i}-${k}`}
              onClick={() => {
                const newGrid = produce(grid, gridCopy => {
                  gridCopy[i][k] = grid[i][k] ? 0 : 1;
                });
                setGrid(newGrid);
              }}
              style={{
                width: 20,
                height: 20,
                backgroundColor: grid[i][k] ? "pink" : undefined,
                border: "solid 1px black"
              }}
            />
          ))
        )}
      </div>
    </>
  );
};

export default App;
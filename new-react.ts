import React from "react";
import "./styles.css";

const levels = [
  {
    name: "ground level",
    description: "Welcome to the ground level. Explore the surroundings.",
    levels: [
      {
        name: "grass level",
        description: "You are now at the grass level, full of greenery.",
        levels: [
          {
            name: "bug level",
            description:
              "This is the bug level. Watch out for the tiny creatures!",
            levels: [
              {
                name: "sky level",
                description:
                  "You've reached the sky level. Enjoy the view!",
                levels: [
                  {
                    name: "space level",
                    description:
                      "Welcome to the space level. The universe is yours to explore!",
                    levels: [], // Further nesting can be added
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const Level = ({ level, depth = 0 }) => {
  return (
    <div
      className={`level-container`}
      style={{ transform: `scale(${1 - depth * 0.1})` }}
    >
      <h2>{level.name}</h2>
      <p>{level.description}</p>
      {level.levels && level.levels.length > 0 && (
        <div>
          {level.levels.map((subLevel, index) => (
            <Level key={index} level={subLevel} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <Level level={levels[0]} />
    </div>
  );
}

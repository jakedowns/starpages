let data = {
    colors: [
        "#FF0000", 
        "#008000", 
        "#0000FF", 
        "#FFFF00"
    ],
    shapes: [
        "circle",
        "square",
        "triangle",
        "star"
    ]
}

if(typeof window !== "undefined"){
    window.data = data;
}

if(typeof module !== "undefined"){
    module.exports = data;
}
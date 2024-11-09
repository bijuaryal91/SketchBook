// Selecting elements from the HTML document
const toolBtns = document.querySelectorAll(".tool"); // Selecting all tool buttons
const canvas = document.querySelector("canvas"); // Selecting the canvas element
const colorFill = document.querySelector("#fill-color"); // Selecting the fill color checkbox
const sizeSlider = document.querySelector("#size-slider"); // Selecting the size slider input
const colorBtns = document.querySelectorAll(".colors .option"); // Selecting all color buttons
const colorPicker = document.querySelector("#color-picker"); // Selecting the color picker input
const clearCanvas = document.querySelector(".clear-board"); // Selecting the clear board button
const saveCanvas = document.querySelector(".save-board"); // Selecting the save board button
const redoCanvas = document.querySelector(".redo-board"); // Selecting the redo board button
const undoCanvas = document.querySelector(".undo-board"); // Selecting the undo board button

const ctx = canvas.getContext("2d"); // Getting the 2D rendering context of the canvas

let selectedTool = "brush"; // Default selected tool
let brushWidth = 5; // Default brush width
let selectedColor = "black"; // Default selected color
let isDrawing = false; // Flag to track if the user is currently drawing
let prevMouseX; // Previous mouse X position
let prevMouseY; // Previous mouse Y position
let snapshot; // Canvas snapshot for undo/redo functionality
let undoStack = []; // Stack to store canvas states for undo
let redoStack = []; // Stack to store canvas states for redo

const setCanvasBackground = () => {
  // Set the whole canvas background to white, so the downloaded image background will be white
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor; // Set fillstyle back to the selectedColor, it will be the brush color
};

window.addEventListener("load", () => {
  // Set canvas width/height based on the offset width/height of the canvas element
  canvas.width = canvas.offsetWidth;
  canvas.style.cursor = "crosshair";
  canvas.height = canvas.offsetHeight;
  setCanvasBackground(); // Set the canvas background
});

const drawRect = (e) => {
  // Draw a rectangle based on the mouse pointer coordinates
  if (!colorFill.checked) {
    // If fillColor is not checked, draw a rectangle with only border
    ctx.strokeRect(
      e.offsetX,
      e.offsetY,
      prevMouseX - e.offsetX,
      prevMouseY - e.offsetY
    );
  } else {
    // If fillColor is checked, draw a rectangle with background
    ctx.fillRect(
      e.offsetX,
      e.offsetY,
      prevMouseX - e.offsetX,
      prevMouseY - e.offsetY
    );
  }
};

const drawCircle = (e) => {
  ctx.beginPath(); // Create a new path to draw a circle
  const radius = Math.sqrt(
    Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
  ); // Calculate the radius for the circle based on the mouse pointer coordinates
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI); // Create a circle based on the mouse pointer coordinates and radius
  if (colorFill.checked) {
    // If fillColor is checked, fill the circle
    ctx.fill();
  } else {
    // If fillColor is not checked, draw only the border of the circle
    ctx.stroke();
  }
};

const drawTriangle = (e) => {
  ctx.beginPath(); // Create a new path to draw a triangle
  ctx.moveTo(prevMouseX, prevMouseY); // Move to the starting point of the triangle (previous mouse position)
  ctx.lineTo(e.offsetX, e.offsetY); // Draw the first line of the triangle based on the mouse pointer coordinates
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); // Draw the bottom line of the triangle
  ctx.closePath(); // Close the path of the triangle to automatically draw the third line
  if (colorFill.checked) {
    // If fillColor is checked, fill the triangle
    ctx.fill();
  } else {
    // If fillColor is not checked, draw only the border of the triangle
    ctx.stroke();
  }
};

// Adding click event listeners to all tool buttons
toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove the active class from the previous option and add it to the currently clicked option
    document.querySelector(".options .active").classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id; // Store the selected tool ID
  });
});

// Adding click event listeners to all color buttons
colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove the selected class from the previous option and add it to the currently clicked option
    document.querySelector(".options .selected").classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window
      .getComputedStyle(btn)
      .getPropertyValue("background-color"); // Get the selected button's background color and store it as the selectedColor value
  });
});

// Adding change event listener to the color picker
colorPicker.addEventListener("change", () => {
  // Set the picked color value from the color picker as the background color of the last color button
  colorPicker.parentElement.style.background = colorPicker.value;
  colorPicker.parentElement.click(); // Trigger a click event on the color button to update the selected color
});

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX; // Store the current mouseX position as the prevMouseX value
  prevMouseY = e.offsetY; // Store the current mouseY position as the prevMouseY value
  ctx.beginPath(); // Create a new path to draw
  ctx.lineWidth = brushWidth; // Set the brush size as the line width
  ctx.strokeStyle = selectedColor; // Set the selected color as the stroke style
  ctx.fillStyle = selectedColor; // Set the selected color as the fill style
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height); // Copy the canvas data and store it as the snapshot value to avoid dragging the image
  redoStack = []; // Clear the redo stack when starting a new drawing
};
let zoomLevel = 1; // Initial zoom level
const container = canvas.parentElement; // Get the container element of the canvas

const drawing = (e) => {
  if (!isDrawing) return; // If isDrawing is false, return from the function
  ctx.putImageData(snapshot, 0, 0); // Add the copied canvas data back to this canvas

  if (selectedTool === "brush" || selectedTool === "eraser") {
    canvas.style.cursor = "crosshair";
    // If the selected tool is brush or eraser
    ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor; // If the selected tool is eraser, set the stroke style to white (to paint white color on the canvas), otherwise set it to the selected color
    ctx.lineTo(e.offsetX, e.offsetY); // Create a line from the previous mouse position to the current mouse position
    ctx.stroke(); // Draw/fill the line with color
  } else if (selectedTool === "rectangle") {
    drawRect(e); // Call the drawRect function to draw a rectangle
  } else if (selectedTool === "circle") {
    drawCircle(e); // Call the drawCircle function to draw a circle
  }else if (selectedTool === "zoomin") {
    canvas.style.cursor = "zoom-in";
  zoomLevel += 0.02; // Increase the zoom level by 20%
  canvas.style.transform = `scale(${zoomLevel})`;
  } else if (selectedTool === "zoomout") {
    canvas.style.cursor = "zoom-out";
    zoomLevel -= 0.02; // Decrease the zoom level by 20%
    canvas.style.transform = `scale(${zoomLevel})`;
    if (zoomLevel <= 1) {
        canvas.style.transform="scale(1)";
      container.style.overflow = "hidden"; // Disable scrollbars if zoom level is back to 1 or below
    }
  } else {
    drawTriangle(e); // Call the drawTriangle function to draw a triangle
  }
};

const saveSnapshot = () => {
  redoStack = [];
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); // Save the current canvas state as ImageData in the undo stack
};

undoCanvas.addEventListener("click", () => {
  if (undoStack.length > 1) {
    redoStack.push(undoStack.pop()); // Move the current canvas state to the redo stack
    const prevImageData = undoStack[undoStack.length - 1];
    ctx.putImageData(prevImageData, 0, 0); // Restore the previous canvas state from the undo stack
  }
});

redoCanvas.addEventListener("click", () => {
  if (redoStack.length > 0) {
    undoStack.push(redoStack.pop()); // Move the next canvas state to the undo stack
    const nextImageData = undoStack[undoStack.length - 1];
    ctx.putImageData(nextImageData, 0, 0); // Restore the next canvas state from the undo stack
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  saveSnapshot(); // Save the canvas state after each drawing action
});

sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value)); // Set the brush width based on the slider value

clearCanvas.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the whole canvas
  setCanvasBackground(); // Set the canvas background to white
});

saveCanvas.addEventListener("click", () => {
  const link = document.createElement("a"); // Create an <a> element
  link.download = `${Date.now()}.jpg`; // Set the download attribute of the link to the current date as the file name
  link.href = canvas.toDataURL(); // Set the canvas data as the href value of the link
  link.click(); // Click the link to download the image
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => (isDrawing = false));

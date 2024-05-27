let dots = [];
let numDots = 5; // Change the number of dots here
let minDistance = 100; // Adjust this value to control the minimum distance between dots for collisions
let soundInstances = [];
let maxInstances = 10;
let instanceIndex = 0;
let isPlaying = false;
let maxAmplitude = 0.2; // Adjust this value to control the maximum volume
let minAmplitude = 0.1; // Adjust this value to control the minimum volume
let clippingThreshold = 0.8; // Adjust this value to control the clipping threshold
let skullImage;

function preload() {
  for (let i = 0; i < maxInstances; i++) {
    soundInstances[i] = loadSound('music.mp3');
  }
  skullImage = loadImage('Scull.png');
}

function setup() {
  // Set canvas to be centered
  let canvas = createCanvas(700, 700);
  let canvasX = (windowWidth - width) / 2;
  let canvasY = (windowHeight - height) / 2;
  canvas.position(canvasX, canvasY);

  // Set background color to white
  background(255);

  // Draw the skull image in the center of the canvas
  let imgX = (width - skullImage.width) / 2;
  let imgY = (height - skullImage.height) / 2;
  image(skullImage, imgX, imgY);

  for (let i = 0; i < numDots; i++) {
    let x = random(width);
    let y = random(height);
    let valid = true;
    for (let dot of dots) {
      let d = dist(x, y, dot.pos.x, dot.pos.y);
      if (d < minDistance) {
        valid = false;
        break;
      }
    }
    if (valid) {
      dots.push(new Dot(x, y));
    }
  }

  // Calculate the button positions
  let buttonX = canvasX + width / 2 - 40; // Center of the canvas
  let buttonY = canvasY - 40; // Above the canvas

  // Request user interaction to enable sound
  let startButton = createButton('sound');
  startButton.position(buttonX - 40, buttonY); // Adjusted for button width
  startButton.mousePressed(enableSound);
  
  // Add a stop button
  let stopButton = createButton('silence');
  stopButton.position(buttonX + 40, buttonY); // Adjusted for button width
  stopButton.mousePressed(disableSound);
}

function draw() {
  // Set background color to white
  background(255);

  // Draw the skull image in the center of the canvas
  let imgX = (width - skullImage.width) / 2;
  let imgY = (height - skullImage.height) / 2;
  image(skullImage, imgX, imgY);

  for (let dot of dots) {
    dot.move();
    dot.checkWalls();
    dot.display();
  }
  checkCollisions();
}

function enableSound() {
  if (!isPlaying) {
    isPlaying = true;
    console.log("Sound enabled");
  }
}

function disableSound() {
  if (isPlaying) {
    for (let i = 0; i < maxInstances; i++) {
      soundInstances[i].stop();
    }
    isPlaying = false;
    console.log("Sound disabled");
  }
}

function checkCollisions() {
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      if (dots[i].intersects(dots[j])) {
        playSound();
        dots[i].changeColor();
        dots[j].changeColor();
        // Simple elastic collision
        let temp = dots[i].vel.copy();
        dots[i].vel = dots[j].vel;
        dots[j].vel = temp;
      }
    }
  }
}

class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 1));  // Slower movement
    this.radius = 20;
    this.changeColor(); // Initialize with a random color
  }

  move() {
    this.pos.add(this.vel);
  }

  checkWalls() {
    if (this.pos.x < this.radius) {
      this.vel.x *= -1;
      this.pos.x = this.radius; // Add offset to prevent sticking
      playSound();
    } else if (this.pos.x > width - this.radius) {
      this.vel.x *= -1;
      this.pos.x = width - this.radius; // Add offset to prevent sticking
      playSound();
    }
    if (this.pos.y < this.radius) {
      this.vel.y *= -1;
      this.pos.y = this.radius; // Add offset to prevent sticking
      playSound();
    } else if (this.pos.y > height - this.radius) {
      this.vel.y *= -1;
      this.pos.y = height - this.radius; // Add offset to prevent sticking
      playSound();
    }
  }

  display() {
    noStroke();
    fill(this.color);
    drawingContext.shadowBlur = 20; // Increase this value for more blur
    drawingContext.shadowColor = this.color;
    ellipse(this.pos.x, this.pos.y, this.radius * 2);
  }

  intersects(other) {
    let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
    return d < this.radius + other.radius;
  }

  changeColor() {
    let pinkOrOrange = random([color(255, 105, 180), color(255, 165, 0)]); // Choose pink or orange
    let hueVariation = random(-20, 20); // Slightly vary the hue
    this.color = color(
      red(pinkOrOrange) + hueVariation,
      green(pinkOrOrange) + hueVariation,
      blue(pinkOrOrange) + hueVariation
    );
  }
}

function playSound() {
  if (isPlaying) {
    let sound = soundInstances[instanceIndex];
    let randomAmplitude = random(minAmplitude, maxAmplitude); // Random volume between min and max
    let clippedAmplitude = softClip(randomAmplitude, clippingThreshold); // Apply soft clipping
    sound.setVolume(clippedAmplitude);
    sound.play();
    instanceIndex = (instanceIndex + 1) % maxInstances;
  }
}

// Soft clipping function
function softClip(input, threshold) {
  let clipped;
  if (input > threshold) {
    clipped = threshold + (1 - threshold) * (1 - Math.exp(-(input - threshold) * 5));
  } else if (input < -threshold) {
    clipped = -threshold - (1 - threshold) * (1 - Math.exp((input + threshold) * 5));
  } else {
    clipped = input;
  }
  return clipped;
}

let stars = [];
let asteroids = [];
let nebulae = [];
let speed;
let galaxyMusic;
let spaceshipModel;
let spaceshipTexture;
let shipZ;
let userInteracted = false;
let modelIsLoaded = false;
let textureIsLoaded = false;
let soundIsLoaded = false;

// Nebula settings
const NUM_NEBULAE = 5;
const NEBULA_MAX_SIZE = 800;
const NEBULA_MIN_Z = -5000;
const NEBULA_MAX_Z = -10000;

// Asteroid settings
const NUM_ASTEROIDS = 50;
const ASTEROID_MAX_SIZE = 30;
const ASTEROID_MIN_SIZE = 5;

function preload() {
  console.log("Preloading assets...");
  soundFormats("mp3");
  galaxyMusic = loadSound("galaxy_music.mp3", soundLoaded, soundLoadError);
  spaceshipModel = loadModel("E-45-Aircraft/E 45 Aircraft_obj.obj", true, modelLoaded, modelLoadError);
  spaceshipTexture = loadImage("E-45-Aircraft/textures/E-45 _col.jpg", textureLoaded, textureLoadError);
  console.log("Preload function finished initiating loads.");
}

// --- Loading callbacks ---
function soundLoaded() { console.log("Galaxy Music loaded successfully."); soundIsLoaded = true; }
function soundLoadError(err) { console.error("Error loading sound:", err); }
function modelLoaded() { console.log("Spaceship model loaded successfully."); modelIsLoaded = true; }
function modelLoadError(err) { console.error("Error loading model:", err); }
function textureLoaded() { console.log("Spaceship texture loaded successfully."); textureIsLoaded = true; }
function textureLoadError(err) { console.error("Error loading texture:", err); }
// --- End loading callbacks ---

function setup() {
  console.log("Setting up canvas...");
  try {
      createCanvas(windowWidth, windowHeight, WEBGL);
      console.log("Canvas created in WEBGL mode.");
  } catch (e) {
      console.error("Error creating WebGL canvas:", e);
      createCanvas(windowWidth, windowHeight);
      console.log("Fell back to 2D canvas.");
      background(0); fill(255); textAlign(CENTER);
      text("WebGL not supported or failed to initialize.", width/2, height/2);
      noLoop(); return;
  }

  // Create stars
  for (let i = 0; i < 800; i++) { stars.push(new Star()); }
  console.log("Stars created.");

  // Create nebulae
  for (let i = 0; i < NUM_NEBULAE; i++) { nebulae.push(new Nebula()); }
  console.log("Nebulae created.");

  // Create asteroids
  for (let i = 0; i < NUM_ASTEROIDS; i++) { asteroids.push(new Asteroid()); }
  console.log("Asteroids created.");

  shipZ = -2000;
  textureMode(NORMAL);
  colorMode(HSB, 360, 100, 100, 100); // Use HSB for easier color manipulation
  console.log("Setup complete.");
}

function draw() {
  try {
    background(0, 50); // Keep trailing effect

    // Set up camera
    camera(0, -height * 0.2, height / tan(PI / 6), 0, 0, 0, 0, 1, 0);

    // Lighting
    ambientLight(60, 60, 60);
    directionalLight(255, 255, 255, 0.5, 0.5, -1);

    // Draw Nebulae (far background)
    for (let nebula of nebulae) {
        nebula.show();
    }

    if (userInteracted) {
      speed = map(mouseX, 0, width, 0, 20);

      // Draw Stars
      push();
      for (let i = stars.length - 1; i >= 0; i--) {
        stars[i].update();
        stars[i].show();
        if (stars[i].isOffscreen()) {
          stars.splice(i, 1);
          stars.push(new Star());
        }
      }
      pop();

      // Draw Asteroids
      push();
      for (let i = asteroids.length - 1; i >= 0; i--) {
        asteroids[i].update();
        asteroids[i].show();
        if (asteroids[i].isOffscreen()) {
          asteroids.splice(i, 1);
          asteroids.push(new Asteroid());
        }
      }
      pop();

      // Draw and animate spaceship
      push();
      translate(0, 0, shipZ);
      rotateZ(PI); rotateY(PI);
      scale(2);
      noStroke();
      if (textureIsLoaded) { texture(spaceshipTexture); } else { fill(150); }
      if (modelIsLoaded) { model(spaceshipModel); } else { console.log("Model not loaded yet, skipping draw."); }
      pop();

      shipZ += 5;
      if (shipZ > height) { shipZ = -2000; }

    } else {
      // Instruction text
      push();
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(32);
      translate(0, 0, 100);
      rotateX(0);
      text("Click to start", 0, 0);
      pop();
    }
  } catch (e) {
    console.error("Error in draw loop:", e);
    noLoop();
  }
}

// --- Classes ---

class Star {
  constructor() {
    this.x = random(-width * 2, width * 2);
    this.y = random(-height * 2, height * 2);
    this.z = random(-width, width);
    this.pz = this.z;
    this.hue = random(180, 300);
    this.saturation = random(70, 100);
    this.brightness = random(80, 100);
    this.col = color(this.hue, this.saturation, this.brightness);
  }
  update() {
    this.z += speed;
    if (this.z > width) {
      this.z = random(-width, 0);
      this.x = random(-width * 2, width * 2);
      this.y = random(-height * 2, height * 2);
      this.pz = this.z;
    }
  }
  show() {
    push();
    fill(this.col);
    noStroke();
    translate(this.x, this.y, this.z);
    let r = map(this.z, 0, width, 5, 0);
    sphere(max(0.1, r)); // Ensure sphere radius is positive
    this.pz = this.z;
    pop();
  }
  isOffscreen() { return this.z > width; }
}

class Nebula {
    constructor() {
        this.x = random(-width * 3, width * 3);
        this.y = random(-height * 3, height * 3);
        this.z = random(NEBULA_MIN_Z, NEBULA_MAX_Z);
        this.size = random(NEBULA_MAX_SIZE / 2, NEBULA_MAX_SIZE);
        this.hue = random(200, 340); // Purples, pinks, blues
        this.saturation = random(60, 90);
        this.brightness = random(20, 50); // Dimmer background elements
        this.alpha = random(10, 40); // Low alpha for transparency
        this.noiseSeedX = random(1000);
        this.noiseSeedY = random(1000);
        this.noiseDetail = random(0.001, 0.005);
        this.rotation = random(TWO_PI);
    }

    show() {
        push();
        translate(this.x, this.y, this.z);
        rotateY(this.rotation); // Give some orientation
        noStroke();

        // Draw multiple transparent ellipses to simulate gas cloud
        for (let i = 0; i < 10; i++) {
            let offsetX = (noise(this.noiseSeedX + i * 0.1) - 0.5) * this.size * 0.5;
            let offsetY = (noise(this.noiseSeedY + i * 0.1) - 0.5) * this.size * 0.5;
            let currentSize = this.size * (1 - i * 0.05) * random(0.8, 1.2);
            let currentHue = this.hue + random(-20, 20);
            let currentSaturation = this.saturation + random(-10, 10);
            let currentBrightness = this.brightness + random(-5, 5);
            let currentAlpha = this.alpha * random(0.5, 1.0);

            fill(currentHue % 360, constrain(currentSaturation, 0, 100), constrain(currentBrightness, 0, 100), currentAlpha);
            ellipse(offsetX, offsetY, currentSize, currentSize * random(0.4, 0.7));
        }
        pop();
    }
}

class Asteroid {
    constructor() {
        this.reset();
        this.z = random(-width * 2, width); // Start some closer, some further
    }

    reset() {
        this.x = random(-width * 1.5, width * 1.5);
        this.y = random(-height * 1.5, height * 1.5);
        this.z = random(-width * 2, -width); // Start far away
        this.size = random(ASTEROID_MIN_SIZE, ASTEROID_MAX_SIZE);
        this.speedFactor = random(0.1, 0.5); // Slower than stars
        this.rotationX = random(TWO_PI);
        this.rotationY = random(TWO_PI);
        this.rotationZ = random(TWO_PI);
        this.rotSpeedX = random(-0.01, 0.01);
        this.rotSpeedY = random(-0.01, 0.01);
        this.rotSpeedZ = random(-0.01, 0.01);
        // Simple procedural geometry for asteroid shape (optional)
        this.vertices = [];
        let radius = this.size / 2;
        for (let i = 0; i < 20; i++) { // Create some random vertices on a sphere
            let theta = random(TWO_PI);
            let phi = random(PI);
            let r = radius * random(0.8, 1.2);
            let vx = r * sin(phi) * cos(theta);
            let vy = r * sin(phi) * sin(theta);
            let vz = r * cos(phi);
            this.vertices.push(createVector(vx, vy, vz));
        }
    }

    update() {
        this.z += speed * this.speedFactor; // Move based on global speed but slower
        this.rotationX += this.rotSpeedX;
        this.rotationY += this.rotSpeedY;
        this.rotationZ += this.rotSpeedZ;

        if (this.z > width * 1.5) { // Reset if it goes too far past camera
            this.reset();
        }
    }

    show() {
        push();
        translate(this.x, this.y, this.z);
        rotateX(this.rotationX);
        rotateY(this.rotationY);
        rotateZ(this.rotationZ);
        fill(50, 0, 30); // Dark greyish color (adjust saturation/brightness in HSB)
        noStroke();
        // Draw a simple sphere for now, procedural geometry is more complex
        sphere(this.size / 2);
        /* // Attempt at procedural mesh (requires more work for proper faces)
        fill(100);
        noStroke();
        beginShape(TRIANGLE_STRIP); // Or other modes, needs careful vertex ordering
        for(let v of this.vertices) {
            vertex(v.x, v.y, v.z);
        }
        endShape(CLOSE);
        */
        pop();
    }

    isOffscreen() {
        // Use the update logic for resetting
        return false; // Let update handle resetting
    }
}

// --- Event Handlers ---

function mousePressed() {
  console.log("Mouse pressed.");
  if (!userInteracted) {
    userInteracted = true;
    console.log("User interaction detected, starting animation and music.");
    if (soundIsLoaded) {
       galaxyMusic.loop();
       console.log("Music loop started.");
    } else {
      console.log("Music not loaded yet or failed to load.");
    }
  }
}

function windowResized() {
  console.log("Window resized.");
  resizeCanvas(windowWidth, windowHeight);
}


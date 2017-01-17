var cells = [];
var foods = [];
var NumOfCells = 32;
var NumOfFoods = 16;

function setup() {
  createCanvas(900, 550);

  // Add an initial set of cells into the systems
  for (var i = 0; i < NumOfCells; i++) {
    //puts cells in random places on screen
    cells[i] = new Cells(random(width), random(height));
  }
  //makes the foods dude, mm food explicit retail dude, get dat beef rapp.
  for (var i = 0; i < NumOfFoods; i++){
      foods[i] = new Foods(random(width), random(height))
  }

  //creates slider which is used to determine desiredseparation
  Slider = createSlider(0,50,[25],[1]);
  Slider.position(20, 20);
}


//VISUAL UPDATE FUNCTION draws everything to the screen
function draw() {
  background(204, 255, 255);
  // Run all the cells
  for (var i = 0; i < cells.length; i++) {
    cells[i].run(cells);
  }

  //display/run all the foods
  for (var i = 0; i < foods.length; i++){
        foods[i].run(foods);
  }

//   for (var i = 0; i < NumOfCells; i++) {
//     collideCirclePoly(Foods.position.x,Foods.position.y,Foods.size,cells[i].position)
// }

  //collision detection
  for (var i = 0; i < foods.length; i++) {
    var distBetweenFoodandCell = p5.Vector.dist(foods[i].position, cells[i].position);
    //if ((distBetweenFoodandCell >= 0) && (distBetweenFoodandCell <= (foods[i].size))){
      if (distBetweenFoodandCell <= (foods[i].size/2 + 12)){

        //_size+ast_size*size
        console.log(distBetweenFoodandCell)
        foods[i].size = (foods[i].size - 10)
      }
}
}

var interval = setInterval(Cells.respawn, 1000);
Cells.prototype.respawn = function() {
    this.timeTillDeath = this.timeTillDeath - 1;

    if (this.timeTillDeath == 0){
      for (var i = 0; i < NumOfCells; i++) {
      new Cells(random(width), random(height));
    }
}
}

//when a food is eaten create another

Foods.prototype.respawn = function(){
  for (var i = 0; i < foods.length; i++) {
    if ((foods[i].size) <= (20)){
      //console.log("respawn foods")
      foods[i] = new Foods(random(width), random(height))
    }
}
}

//function used to create regular polygons, used for hexagons here
function polygon(x, y, radius, npoints) {
  var angle = TWO_PI / npoints;
  beginShape();
  for (var a = 0; a < TWO_PI; a += angle) {
    var sx = x + cos(a) * radius;
    var sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

//Foods class
function Foods(x, y){
	this.color = color(random(255),random(255),random(255))
  this.position = createVector(x, y);
  this.size = int(random(30,100))
}
//function for foods that calls all other functions
Foods.prototype.run = function(foods){
  this.render();
  this.respawn();
}

// Cells class
// Methods for Separation, Cohesion, Alignment added
function Cells(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = p5.Vector.random2D();
  this.position = createVector(x, y);
  this.r = 1.0;
  this.maxspeed = 5;    // Maximum speed
  this.maxforce = 0.05; // Maximum steering force
  this.timeTillDeath = int(random(60, 80))
}

//run all cells function
Cells.prototype.run = function(cells) {
  this.flock(cells);
  this.update();
  this.borders();
  this.render();
  this.respawn();
}

// Forces go into acceleration
Cells.prototype.applyForce = function(force) {
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Cells.prototype.flock = function(cells) {
  var sep = this.separate(cells); // Separation
  var ali = this.align(cells);    // Alignment
  var coh = this.cohesion(cells); // Cohesion
  // Arbitrarily weigh these forces
  sep.mult(2.5);
  ali.mult(1.0);
  coh.mult(1.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

// Method to update location
Cells.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset acceleration to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Cells.prototype.seek = function(target) {
  var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  var steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxforce); // Limit to maximum steering force
  return steer;
}

// Draw cell as a hexagon
Cells.prototype.render = function() {
  //colour of cells
  fill(204, 204);
  stroke(10);
  polygon(this.position.x, this.position.y, 24, 6);
  //ellipse(this.position.x, this.position.y, 23, 23)
  textSize(12);
  fill('red');
  text(this.timeTillDeath, this.position.x, this.position.y);
}

//function to draw foods as a black hexagon
Foods.prototype.render = function(){
   fill(0,0,0);
   stroke(10);
   ellipse(this.position.x, this.position.y, this.size, this.size);
}

// Wraparound
Cells.prototype.borders = function() {
  if (this.position.x < -this.r) this.position.x = width + this.r;
  if (this.position.y < -this.r) this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
  // if(this.position.x > width-25 || this.position.x < 25) {
  //    this.direction.x *=-1;
  //  }
  //  if(this.position.y > height-25 || this.position.y < 25) {
  //    this.direction.y *=-1;
  //  }

}

// Separation
// Method checks for nearby cells and steers away
Cells.prototype.separate = function(cells) {
  //25 is good value for desiredseparation
  var desiredseparation = Slider.value();
  var steer = createVector(0, 0);
  var count = 0;
  // For every cell in the system, check if it's too close
  for (var i = 0; i < cells.length; i++) {
    var d = p5.Vector.dist(this.position, cells[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      var diff = p5.Vector.sub(this.position, cells[i].position);
      diff.normalize();
      diff.div(d); // Weight by distance
      steer.add(diff);
      count++; // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Cells.prototype.align = function(cells) {
  var neighbordist = 50;
  var sum = createVector(0, 0);
  var count = 0;
  for (var i = 0; i < cells.length; i++) {
    var d = p5.Vector.dist(this.position, cells[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(cells[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    var steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby cells, calculate steering vector towards that location
Cells.prototype.cohesion = function(cells) {
  var neighbordist = 50;
  var sum = createVector(0, 0); // Start with empty vector to accumulate all locations
  var count = 0;
  for (var i = 0; i < cells.length; i++) {
    var d = p5.Vector.dist(this.position, cells[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(cells[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum); // Steer towards the location
  } else {
    return createVector(0, 0);
  }
}

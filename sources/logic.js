// TODO: add linear gradient the sky
let c = document.createElement("canvas");
let ctx = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight;
let yMod = 0;
const originFloor = c.height * 0.9
floor = originFloor
document.body.appendChild(c); 
let hitBoxHandicap = 5;
const maxHeight = c.height/6;
let score = 0;

var perm = [];
while (perm.length < 255) {
    while (perm.includes(val = Math.floor(Math.random() * 255)));
    perm.push(val);
}

var lerp = (a, b, t) => a + (b - a);
// Background mountains (noise)
var noise = x => {
    x = x * 0.01 % 254;
    return lerp(perm[Math.floor(x)], perm[Math.ceil(x)], x - Math.floor(x));
}

var getRandomInt = x => {
    return Math.floor(Math.random() * Math.floor(x));
}

const bounceThreshold = 50;
let currentBounceThreshold = 0;

var isAbove = function(player, platform) {
    let yRay = player.y < platform.y + currentBounceThreshold;
    let xRay = player.x > platform.x && player.x < platform.x + platform.width;
    return yRay && xRay;
}
var isUnder = function(player, platform) {
    let yRay = player.y > platform.y + currentBounceThreshold;
    let xRay = player.x > platform.x && player.x < platform.x + platform.width;
    return yRay && xRay;
}

var getCurrentGround = function(player, platforms) {
    let minDiff = 10000;
    let closestPlatY = originFloor;
    platforms.forEach(p => {
        if(isAbove(player, p)){
            console.log("is above", p.color)
            if(minDiff > (p.y - player.y)){
                minDiff = p.y - player.y;
                closestPlatY = p.y;
            }
        }
    });
    return closestPlatY;
}
var getCurrentCeiling = function(player, platforms) {
    let minDiff = 10000;
    let closestPlatY = 0;
    platforms.forEach(p => {
        if(isUnder(player, p)){
            if(minDiff > (p.y - player.y)){
                minDiff = p.y - player.y;
                closestPlatY = p.y;
            }
        }
    });
    return closestPlatY;
}

// not in use yet
var isColliding = function(player, platform) {
    let yColliding = player.y + player.height >= platform.y && 
        player.y + player.height <= platform.y + platform.height;
    let xColliding = player.x + player.width <= platform.x + platform.width &&
        player.x + player.width >= platform.x;
    return yColliding && xColliding;
}

var printScore = function() {
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);
}

var PlatformSimple = function (width, height, color, heightFactor) {
    this.heightFactor = heightFactor;
    this.originY = c.height/this.heightFactor - getRandomInt(400);
    this.y = this.originY;
    this.originX = c.width + 10;
    this.x = this.originX;
    this.width = width;
    this.height = height;
    this.color = color;
    this.distance = 0;
    this.isAbovePlayer = false;
    this.isUnderPlayer = false;
    
    this.draw = function (x, y) {
        this.x = x;
        this.y = y;
        ctx.beginPath();
        ctx.lineWidth = "6";
        ctx.strokeStyle = this.color;
        //  if(this.y > c.height) {
        //      this.y -= (this.y - c.height)
        //  }
        // ctx.rect(this.x, this.y - yMod, this.width, this.height);
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
        ctx.fill();
    }

    this.respawn = function() {
        this.y = c.height/this.heightFactor - getRandomInt(400)
        this.x = this.platformOriginX;
    }
}

var Player = function () {
    this.x = c.width / 2;
    this.y = 0;
    this.ySpeed = 0;
    this.rot = 0;
    //this.rSpeed = 0;
    this.yOffset = 25; 
    this.bouncePower = 0.75;
    this.resting = false;
    this.isFalling = true;
    this.width = this.height = 10;
    this.color = "orange";
    this.ground = floor;
    this.ceiling = 0;
    this.grounded = 0;
    //this.img = new Image();
    //this.img.src = document.getElementsByTagName("template")[0].innerHTML;

    this.draw = function () {
        // jump platform
        var g = this.ground;
        // ceiling platform
        var c = this.ceiling;

        if (g - this.yOffset > this.y) {
            // positive gravity
            this.ySpeed += 0.1;
        } else if (g - this.yOffset - yMod < this.y) {
            // if hitting the ground
            this.ySpeed -= (this.y - (g - this.yOffset));  
            this.ySpeed *= this.bouncePower;
            score++;
            // if not set to 0 -> a player cant "die"
            //grounded = 1;
        } else if(this.ySpeed < 0.01 && this.ySpeed > -0.01) {
            // todo: improve this..
            // resting ball
            this.resting = true;
            console.log("game over");
            return;
        }  

        if (this.y < c + this.yOffset) {
            this.ySpeed += (this.y - (c - this.yOffset));  
            this.ySpeed *= this.bouncePower * 0.15
        }

        this.isFalling = this.ySpeed > 0;
        //var angle = Math.atan2((p2 - 12) - this.y, (this.x + 5) - this.x);
        this.y += this.ySpeed;

        if (!playing || this.grounded && Math.abs(this.rot) > Math.PI * 0.5) {
            playing = false;
            //this.rSpeed = 5;
            touches.ontouchdown = 0;
            touches.ontouchup = 0;
            this.x -= speed * 5;
        }

        if (this.grounded && playing) {
            //this.rot -= (this.rot - angle) * 0.65;
            //this.rSpeed = this.rSpeed - (angle - this.rot);
            // if(this.ySpeed < 0.01 && this.ySpeed > -0.01){
            //     // resting ball
            //     this.resting = true;
            //     console.log("game over")
            //     return;
            // }
        }

        // If reaching max height
        if(this.y < maxHeight) {
            this.y = maxHeight;
            yMod += this.ySpeed;
        } else if (this.ySpeed > 0 && yMod < 0){
            this.y = maxHeight;
            yMod += this.ySpeed;
            // when falling 
            //yMod = this.ySpeed;           
            //floor = originFloor;
        }
        //console.log("speed", this.ySpeed)

        this.ySpeed += (touches.ontouchdown - touches.ontouchup) ;

        //this.rSpeed += (touches.ontouchdown - touches.ontouchup) * 0.05
        this.rot -= this.rSpeed * 0.1;
        //if (this.rot > Math.PI) this.rot = -Math.PI;
        //if (this.rot < -Math.PI) this.rot = Math.PI;
        ctx.beginPath();
        ctx.lineWidth = "4";
        ctx.strokeStyle = this.color;
        ctx.fillStyle = "white";
        ctx.ellipse(this.x, this.y, this.width, this.height, 0, 0, 180);
        ctx.stroke();
        ctx.fill();
        ctx.save();
        //ctx.translate(this.x, this.y - 3);
        //ctx.rotate(this.rot);
        //ctx.drawImage(this.img, -15, -15, 30, 30);
        //ctx.restore();
    }
    
    let trailWideness = 1;
    let isFalling = false;
    this.drawTail = function() {
        isFalling = this.ySpeed > 0;
        trailWideness = isFalling ?
         ((this.ySpeed * 0.1) > 3 ? 3 : this.ySpeed * 0.1) :
         ((this.ySpeed * 0.1) < -3 ? -3 : this.ySpeed * 0.1);
        ctx.beginPath();
        ctx.lineWidth = "3";
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.moveTo(this.x, this.y);
        let upperLeftX = isFalling ? this.x - trailWideness : this.x + trailWideness;
        let lowerRightX = isFalling ? this.x + trailWideness : this.x - trailWideness;
        ctx.lineTo(upperLeftX, this.y + trailWideness);
        ctx.lineTo(this.x - 15, this.y - (this.ySpeed));
        ctx.lineTo(lowerRightX, this.y - trailWideness);
        ctx.lineTo(this.x, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

var player = new Player();
var platformSimple = new PlatformSimple(200, 30, "green", 1.5);
var platformMedium = new PlatformSimple(200, 30, "yellow", 10);
var platformHard = new PlatformSimple(120, 40, "red", 1.3);
let platforms = [platformSimple , platformMedium];
//var platformMedium = new PlatformSimple();
// total distance traveled 
var totalDistance = 0;
// relative distance traveled
var relDistance = 0;
var speed = 0;
var relSpeed = 0;
var playing = true;
var touches = {ontouchdown: 0, ontouchup: 0}
function loop() {
    //speed -= (speed - (touches.ontouchdown - touches.ontouchup)) * 0.01;
    // static platform movement speed
    relSpeed = 0.7;
    totalDistance += 10 * relSpeed;
    // platform speed 
    // relDistance += 5 * relSpeed;
    // background sky color
    ctx.fillStyle = "#99f";
    ctx.fillRect(0, 0, c.width, c.height);

    // background city color
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.moveTo(0, c.height);
    // Background
    for (let i = 0; i < c.width; i++)
        ctx.lineTo(i, (c.height * 0.3 - noise(totalDistance + i * 5) * 0.25) - yMod * 0.25);
    // adding 1000 to prevent dropoff
    ctx.lineTo(c.width + 1000, c.height);
    ctx.fill();

    // ground color
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.moveTo(0, c.height);
    // Floor
    for (let i = 0; i < c.width; i++) {
        ctx.lineTo(i, floor - yMod);
    }
    ctx.lineTo(c.width + 1000, c.height);
    ctx.fill();   

    platforms.forEach(platform => { 
        platform.distance += 5 * relSpeed; 
        let platformXPos = platform.originX - (platform.distance * 2);
        let platformY = platform.originY - yMod;

        if(platformXPos > 0 - platform.width) {
            platform.draw(platformXPos, platformY);
            // platform.hitBoxDraw();
        } else {
            // loading new platform
            platform.distance = 0;
            platform.respawn();
        }
    });

    player.ground = getCurrentGround(player, platforms);
    player.ceiling = getCurrentCeiling(player, platforms);
   
    printScore();
    player.drawTail();
    player.draw();
    if (player.resting)
        restart();
    requestAnimationFrame(loop);
}

onmousedown = d => {touches.ontouchdown = 1; touches.ontouchup = 0};
onmouseup = d => {touches.ontouchdown = 0 ;touches.ontouchup = 0};

function restart() {
    player = new Player();
    totalDistance = speed = relSpeed = yMod = score = 0;
    playing = true;
    touches = {ontouchdown: 0, ontouchup: 0}
}
loop();

//var instructions = document.createElement("div");
//instructions.innerHTML += "swipe to sling";
//document.body.appendChild(instructions);

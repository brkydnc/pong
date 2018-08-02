const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("canvas");
const context : CanvasRenderingContext2D = canvas.getContext("2d");

declare interface Math {
	clamp : (value,min,max) => number;
	randomFloatBetween : (min,max) => number;
}

Math.clamp = function(value,min,max) : number {
	return Math.min(max,Math.max(min,value));
}
Math.randomFloatBetween = function(min,max) : number {
	return eval((Math.random() * (max - min) + min).toFixed(4));
}

enum Color {
	White = "rgb(255,255,255)",
	Black = "rgb(0,0,0)"
}

enum KeyCode {
	W = 87,
	S = 83,
	UpArrow = 38,
	DownArraw = 40
}

class Vector {
	
	public x : number;
	public y : number;

	public static up : Vector = new Vector(0,-1);
	public static down : Vector = new Vector(0,1);
	public static right : Vector = new Vector(1,0);
	public static left : Vector = new Vector(-1,0);

	constructor(x: number, y: number){
		this.x = x;
		this.y = y;
	}

	public add(vector: Vector) : Vector {
		this.x += vector.x;
		this.y += vector.y;
		return this;
	}
	public multiply(number: number) : Vector {
		this.x *= number;
		this.y *= number;
		return this;
	}
	public distance(vector: Vector) : number {
		return Math.sqrt(Math.pow((this.x - vector.x),2) + Math.pow((this.y - vector.y),2));
	}
	public clone() : Vector {
		return new Vector(this.x,this.y);
	}
	public static random() : Vector {
		let x = Math.random() * ((Math.random() > .5) ? -1 : 1);
		let y = Math.random() * ((Math.random() > .5) ? -1 : 1);
		return (new Vector(x,y));
	}
	public static isInArea(vector: Vector, topLeft:Vector, bottomRight:Vector) : boolean {
		if(vector.x >= topLeft.x && vector.x <= bottomRight.x && vector.y >= topLeft.y && vector.y <= 	bottomRight.y){
			return true;
		}else {
			return false;
		}
	}
	public static fromAngle(radian: number) : Vector {
		return new Vector(Math.cos(radian), Math.sin(radian));
	}

}

class Input {
	
	public static keyStates : {[key:number]:boolean} = {};

	public static getKeyDown(keyCode) : boolean {
		return this.keyStates[keyCode];
	}
	public static trigger(keyCode) : void {
		this.keyStates[keyCode] = true;
	}
	public static unTrigger(keyCode) : void {
		this.keyStates[keyCode] = false;		
	}

}

class Ball {

	public startLocation : Vector;
	public location : Vector;
	public velocity : Vector;
	public radius : number;

	constructor(x: number, y: number, r?: number){
		this.startLocation = new Vector(x,y);
		this.radius = r || 10;
		this.reset();
	}

	public update() : void {
		this.location.add(this.velocity);
	}
	public render() : void {
		context.beginPath();
		context.arc(this.location.x, this.location.y, this.radius, 0, Math.PI * 2);
		context.fillStyle = Color.White;
		context.fill();
		context.closePath();
	}
	public reset() : void {
		this.location = this.startLocation.clone();
		let angle = Math.atan2(canvas.height/2,canvas.width/2) * 180 / Math.PI;
		let randomAngle = Math.randomFloatBetween(-angle,angle);
		console.log(randomAngle)
		this.velocity = Vector.fromAngle((randomAngle) * Math.PI / 180).multiply(8 * ((Math.random() > 0.5) ? -1 : 1));
	}

}

class Paddle {

	public startLocation : Vector;
	public location : Vector;
	public width : number;
	public height : number;
	public controls : {up: number,down: number};

	constructor(x: number, y: number, w: number, h: number, ctrlup: number, ctrldown: number){
		this.startLocation = new Vector(x,y);
		this.location = new Vector(x,y);
		this.width = w;
		this.height = h;
		this.controls = {
			up:	ctrlup,
			down: ctrldown
		}	
	}

	public render() : void {
		context.beginPath();
		context.rect(this.location.x - this.width/2, this.location.y - this.height/2, this.width, this.height);
		context.fillStyle = Color.White;
		context.fill();
		context.closePath();
	}
	public reset() : void {
		this.location = this.startLocation.clone();
	}
	public control() {
		let paddleSpeed = 10;
		if(Input.getKeyDown(this.controls.up)){
			this.location.y = (this.height/2 + Math.clamp(this.location.y - this.height/2, 0, canvas.height)) - paddleSpeed;
		}else if(Input.getKeyDown(this.controls.down)){
			this.location.y = (Math.clamp(this.location.y + this.height/2, 0, canvas.height) - this.height/2) + paddleSpeed;
		}
	}
	
}

class Game {

	public static ball = new Ball(canvas.width/2,canvas.height/2,10);
	public static paddle1 = new Paddle(10, canvas.height/2, 10, 100, KeyCode.W, KeyCode.S);
	public static paddle2 = new Paddle(canvas.width-10, canvas.height/2, 10, 100, KeyCode.UpArrow, KeyCode.DownArraw);
	public static scrores = {
		paddle1: 0,
		paddle2: 0
	}

	public static setBackGround(color: Color) : void {
		context.beginPath();
		context.rect(0,0,canvas.width,canvas.height);
		context.fillStyle = color;
		context.fill();
		context.closePath();
	}
	public static updateComponents() : void {
		this.ball.update();
	}
	public static renderComponents() : void {
		this.ball.render();
		this.paddle1.render();
		this.paddle2.render();		
	}
	public static checkForCollisions() : void { 
		let ballTop = this.ball.location.y - this.ball.radius;
		let ballBottom = this.ball.location.y + this.ball.radius;
		let ballLeft = this.ball.location.x - this.ball.radius;
		let ballRight = this.ball.location.x + this.ball.radius;

		if(ballTop <= 0){
			this.ball.velocity.y *= -1;
		}if(ballBottom >= canvas.height){
			this.ball.velocity.y *= -1;
		}if(ballRight <= 0){
			this.scrores.paddle2 += 1;
			this.ball.reset();
			this.paddle1.reset();
			this.paddle2.reset();
		}if(ballLeft >= canvas.width){
			this.scrores.paddle1 += 1;			
			this.ball.reset();
			this.paddle1.reset();
			this.paddle2.reset();
		}

		//Paddle1
		let clampedX = Math.clamp(this.ball.location.x,this.paddle1.location.x - this.paddle1.width/2,this.paddle1.location.x + this.paddle1.width/2);
		let clampedY = Math.clamp(this.ball.location.y,this.paddle1.location.y - this.paddle1.height/2,this.paddle1.location.y + this.paddle1.height/2);
		if(this.ball.velocity.x < 0 && this.ball.location.distance(new Vector(clampedX,clampedY)) <= this.ball.radius){
			this.ball.velocity.x *= -1.05;
		}
		//Paddle2
		clampedX = Math.clamp(this.ball.location.x,this.paddle2.location.x - this.paddle2.width/2,this.paddle2.location.x + this.paddle2.width/2);
		clampedY = Math.clamp(this.ball.location.y,this.paddle2.location.y - this.paddle2.height/2,this.paddle2.location.y + this.paddle2.height/2);
		if(this.ball.velocity.x > 0 && this.ball.location.distance(new Vector(clampedX,clampedY)) <= this.ball.radius){
			this.ball.velocity.x *= -1.05;
		}
		// debugger;
	}
	public static controlPaddles() : void {
		this.paddle1.control();
		this.paddle2.control();
	}
	public static printScores() : void {
		context.beginPath();
		context.moveTo(canvas.width/2, 0);
		context.lineTo(canvas.width/2, canvas.height);
		context.strokeStyle = Color.White;
		context.stroke();
		context.fillStyle = Color.White;
		context.textAlign = "center";
		context.font = "40px Consolas"
		context.fillText(this.scrores.paddle1.toString(), canvas.width/4, 100);
		context.fillText(this.scrores.paddle2.toString(), canvas.width - canvas.width/4, 100);
		context.closePath();
	}

}

window.addEventListener('keydown',function(e){
	Input.trigger(e.keyCode);
});

window.addEventListener('keyup',function(e){
	Input.unTrigger(e.keyCode);
});

function loop() : void {
	Game.setBackGround(Color.Black);
	Game.renderComponents();
	Game.printScores();
	Game.controlPaddles()
	Game.checkForCollisions();
	Game.updateComponents();

	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

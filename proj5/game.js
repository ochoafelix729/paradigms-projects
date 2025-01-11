let game = null;
const id = Math.floor(Math.random() * 10000000);
let last_update_time = new Date();

const parseISOString = (s) => {
    let b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
  }


// Represents a moving image
class Sprite {
	constructor(x, y, image_url) {
		this.x = x;
		this.y = y;
        this.speed = 120; // pixels-per-second
		this.image = new Image();
		this.image.src = image_url;

        // Set some default event handlers
		this.update = Sprite.prototype.update_stop;
		this.onleftclick = Sprite.prototype.onclick_ignore;
        this.onrightclick = Sprite.prototype.onclick_ignore;
        this.arrive = Sprite.prototype.update_stop;
	}

    // The default update behavior
	update_stop(elapsed_time) {
        delete this.dist_remaining; // causes the object to stop having the property
	}

    // Move forward
	update_travel(elapsed_time) {
		if(this.dist_remaining === undefined)
			return; // No destination to travel toward
        let dist_step = Math.min(this.dist_remaining, elapsed_time * this.speed);
        this.x += dist_step * this.component_x;
        this.y += dist_step * this.component_y;
        this.dist_remaining = this.dist_remaining - dist_step;
        if (this.dist_remaining === 0)
           this.arrive();
	}

    // Remove "this" from the list of sprites
    update_disappear(elapsed_time) {
        for (let i = 0; i < game.model.sprites.length; i++) {
            if (game.model.sprites[i] === this) {
                game.model.sprites.splice(i, 1); // remove this sprite from the list
                return;
            }
        }
        console.log('uh oh, I could not find this sprite in model.sprites!');
    }

    // Do nothing
	onclick_ignore(x, y) {
	}

    // Start travelling to the spot clicked
	onclick_set_destination(x, y) {
        let delta_x = x - this.x;
        let delta_y = y - this.y;
        this.dist_remaining = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
		this.component_x = delta_x / this.dist_remaining;
		this.component_y = delta_y / this.dist_remaining;
	}

    // Throw a fireball toward the spot clicked
    onclick_throw_fireball(x, y) {
		let fireball = new Sprite(this.x, this.y, "fireball.png");
        fireball.speed = 300; // pixels-per-second
        fireball.update = Sprite.prototype.update_travel;
        fireball.arrive = Sprite.prototype.update_disappear;
        let delta_x = x - this.x;
        let delta_y = y - this.y;
        fireball.dist_remaining = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
        fireball.component_x = delta_x / fireball.dist_remaining;
        fireball.component_y = delta_y / fireball.dist_remaining;
		game.model.sprites.push(fireball);
    }
}




class Model {
	constructor() {
		this.sprites = [];

        // Make the avatar
		this.avatar = new Sprite(500, 250, "robot.png");
        this.avatar.update = Sprite.prototype.update_travel;
        this.avatar.onleftclick = Sprite.prototype.onclick_set_destination;
        this.avatar.onrightclick = Sprite.prototype.onclick_throw_fireball;
		this.sprites.push(this.avatar);

        this.last_update_time = new Date();
	}

	update() {
        let now = new Date();
        let elapsed_time = (now - this.last_update_time) / 1000; // seconds
        
        // Update all the sprites
		for (const sprite of this.sprites) {
			sprite.update(elapsed_time);
		}

        this.last_update_time = now;
	}

	onleftclick(x, y) {
		this.avatar.onleftclick(x, y);
	}

    onrightclick(x, y) {
		this.avatar.onrightclick(x, y);
    }
}




class View
{
	constructor(model) {
		this.model = model;
		this.canvas = document.getElementById("myCanvas");
	}

	update() {
        // Clear the screen
		let ctx = this.canvas.getContext("2d");
		ctx.clearRect(0, 0, 1000, 500);

        // Sort the sprites by their y-value to create a pseudo-3D effect
        this.model.sprites.sort((a,b) => a.y - b.y );

        // Draw all the sprites
		for (const sprite of this.model.sprites) {
			ctx.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height);
		}
	}
}




class Controller
{
	constructor(model, view) {
		this.model = model;
		this.view = view;
		let self = this;

        // Add event listeners
		view.canvas.addEventListener("click", function(event) { self.onLeftClick(event); return false; });
		view.canvas.addEventListener("contextmenu", function(event) { self.onRightClick(event); return false; });
	}

	onLeftClick(event) {
        event.preventDefault(); 
		const x = event.pageX - this.view.canvas.offsetLeft;
		const y = event.pageY - this.view.canvas.offsetTop;
		this.model.onleftclick(x, y);

        const payload = {
            action: 'left_click',
            type: 'robot',
            id: id,
            x: x,
            y: y,
            time: new Date().toISOString(),
            x_curr: this.model.avatar.x,
            y_curr: this.model.avatar.y
        }


        fetch('/left_click', {
            body: JSON.stringify(payload),
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });

	}

    onRightClick(event) {
        event.preventDefault(); // Suppress the context menu
		const x = event.pageX - this.view.canvas.offsetLeft;
		const y = event.pageY - this.view.canvas.offsetTop;
		this.model.onrightclick(x, y);

        const fireball_id = `${id}-${Math.floor(Math.random() * 10000000)}`;

        const payload = {
            action: 'right_click',
            type: 'fireball',
            id: fireball_id,
            x: x,
            y: y,
            time: new Date().toISOString(),
            x_curr: this.model.avatar.x,
            y_curr: this.model.avatar.y
        }

        fetch('/right_click', {
            body: JSON.stringify(payload),
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }

	update() {
        let now = new Date();
        if (now - last_update_time > 500) {
            last_update_time = now;
            
            fetch('/update', {
                cache: 'no-cache',
                headers: {
                'Content-Type': 'application/json'
            },
                method: 'GET'
            })
                .then(response => response.json())
                .then(data => {

                    for (let update of data) {
                        let sprite = this.model.sprites.find(s => s.id === update.id);
    
                        if (update.id !== id) { 
    
                            if (!sprite) {

                                if (update.type === 'robot') {

                                    sprite = new Sprite(update.x_curr, update.y_curr, 'robot.png');
                                    sprite.id = update.id;
                                    this.model.sprites.push(sprite);

                                } else if (update.type === 'fireball') {

                                    sprite = new Sprite(update.x_curr, update.y_curr, 'fireball.png');
                                    sprite.id = update.id;
                                    sprite.update = Sprite.prototype.update_travel;
                                    sprite.arrive = Sprite.prototype.update_disappear;
                                    this.model.sprites.push(sprite);

                                }
                            }
    
                            // update robot position
                            if (update.type === 'robot') {


                                sprite.x = update.x_curr;
                                sprite.y = update.y_curr;
                                sprite.update = Sprite.prototype.update_travel;
                                
                                sprite.onclick_set_destination(update.x, update.y);         

                                let elapsed_time = (now - parseISOString(update.time)) / 1000;
                                sprite.update_travel(elapsed_time); 

                            }
    
                            // update fireball travel
                            else if (update.type === 'fireball') {

                                sprite.update = Sprite.prototype.update_travel;

                                sprite.speed = 300;
                                sprite.arrive = Sprite.prototype.update_disappear;
                                let delta_x = update.x - sprite.x;
                                let delta_y = update.y - sprite.y;
                                sprite.dist_remaining = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
                                sprite.component_x = delta_x / sprite.dist_remaining;
                                sprite.component_y = delta_y / sprite.dist_remaining;

                                let elapsed_time = (now - parseISOString(update.time)) / 1000;
                                sprite.update(elapsed_time);

                            }
                        }
                    }

                });

        }
    }
    
}



class Game {
	constructor() {
		this.model = new Model();
		this.view = new View(this.model);
		this.controller = new Controller(this.model, this.view);
	}

	onTimer() {
		this.controller.update();
		this.model.update();
		this.view.update();
	}
}


game = new Game();
let timer = setInterval(() => { game.onTimer(); }, 30);

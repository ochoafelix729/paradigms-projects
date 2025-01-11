let game = null;
const id = Math.floor(Math.random() * 10000000);
let playerName = undefined;
let score = 0;

let last_update_time = new Date();

const parseISOString = (s) => {
    let b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
  }


// Represents a moving image
class Sprite {
	constructor(x, y, image_url, name, type) {
		this.x = x;
		this.y = y;
        this.name = name;
        this.type = type;
        this.speed = 120; // pixels-per-second
		this.image = new Image();

        //placeholder dimensions
        // this.image.width = 50;
        // this.image.height = 50;

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
        if (this.dist_remaining <= 0.01)
           this.arrive();
	}

    mkHitBox() {

        this.top = this.y;
		this.bottom = this.y + this.image.height;
		this.left = this.x;
		this.right = this.x + this.image.width;

        // console.log(`top: ${this.top}`);
        // console.log(`bottom: ${this.bottom}`);
        // console.log(`left: ${this.left}`);
        // console.log(`right: ${this.right}`);
    }

    collideswith(b) {

        if (this.speed === 0) return;

        this.mkHitBox();
        b.mkHitBox();

        if (this.right <= b.left)
            return false;
          if (this.left >= b.right)
            return false;
          if (this.bottom <= b.top)
            return false;
          if (this.top >= b.bottom)
            return false;

        // console.log('collides');
        return true;
        
      }

    

    // Remove "this" from the list of sprites
    update_disappear() {

        if (this.type === 'fireball')
            console.log('works');

        let fireballIndex = -1;

        // find fireball
        for (let i = 0; i < game.model.sprites.length; i++) {
            if (game.model.sprites[i] === this) {
                fireballIndex = i;
                break;
            }
        }

        if (fireballIndex === -1) {
            console.log('Could not find fireball in list of sprites.');
            return;
        }

        for (let j = 0; j < game.model.sprites.length; j++) {
            let item = game.model.sprites[j];
            if (this.collideswith(item) && this.speed !== 0) {

                if (item.type === 'robot' && item.id !== id)
                    score++;
                
                else if (item.type === 'mapItem') {
                    game.model.sprites.splice(j, 1);
                    this.speed = 0;
                    game.model.sprites.splice(fireballIndex, 1);
                    score--;
                    return;
                }

                
            }
        }

        game.model.sprites.splice(fireballIndex, 1);

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
		let fireball = new Sprite(this.x, this.y, "fireball.png", null, 'fireball');
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
	constructor(name) {
		this.sprites = [];
        this.name = name;

        // Make the avatar
		this.avatar = new Sprite(500, 250, "robot.png", this.name, 'robot');
        this.avatar.update = Sprite.prototype.update_travel;
        this.avatar.onleftclick = Sprite.prototype.onclick_set_destination;
        this.avatar.onrightclick = Sprite.prototype.onclick_throw_fireball;
		this.sprites.push(this.avatar);

        this.scrollx = 0;
        this.scrolly = 0;

        this.last_update_time = new Date();
	}

    async getMapItems() {
        
        try {
            const response = await fetch('/getItems', {
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'GET'
            });

            const data = await response.json();

            // push map items onto list 
            for (let item of data) {
                let sprite = new Sprite(item.x, item.y, item.image_url, null, 'mapItem');
                sprite.speed = 0;

                this.sprites.push(sprite);
            }

            // console.log(this.sprites);
        }

        catch (error) {
            console.error(`fetch failed: ${error}`);
        }


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

        this.model.scrollx = this.model.avatar.x - 500;
        this.model.scrolly = this.model.avatar.y - 250;

        // Clear the screen
		let ctx = this.canvas.getContext("2d");
		ctx.clearRect(0, 0, 1000, 500);

        // Sort the sprites by their y-value to create a pseudo-3D effect
        this.model.sprites.sort((a,b) => a.y - b.y);


        // Draw all the sprites
        for (const sprite of this.model.sprites) {
            ctx.drawImage(
                sprite.image, 
                sprite.x - sprite.image.width / 2 - this.model.scrollx, 
                sprite.y - sprite.image.height - this.model.scrolly
            );

            if (sprite.type === 'robot') {


                // draw name
                ctx.textAlign = 'center';
                const textX = sprite.x - this.model.scrollx;
                const textY = sprite.y - sprite.image.height - 20 - this.model.scrolly;
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'white';
                ctx.fillText(sprite.name, textX, textY);

                // draw score

                ctx.font = '12px Arial';  // You can adjust the size or style for the score
                ctx.fillStyle = 'yellow'; // Optionally change color for the score

                // Draw the user's score below the name
                ctx.fillText(`Score: ${score}`, textX, textY + 15);

                

            }

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
		this.model.onleftclick(x + this.model.scrollx, y + this.model.scrolly);

        const payload = {
            action: 'left_click',
            name: playerName,
            type: 'robot',
            id: id,
            x: x + this.model.scrollx,
            y: y + this.model.scrolly,
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
		this.model.onrightclick(x + this.model.scrollx, y + this.model.scrolly);

        const fireball_id = `${id}-${Math.floor(Math.random() * 10000000)}`;

        const payload = {
            action: 'right_click',
            name: playerName,
            type: 'fireball',
            id: fireball_id,
            x: x + this.model.scrollx,
            y: y + this.model.scrolly,
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

    

	async update() {
        let now = new Date();
        if (now - last_update_time > 500) {
            last_update_time = now;
            
            try {
                const response = await fetch('/update', {
                    cache: 'no-cache',
                    headers: {
                    'Content-Type': 'application/json'
                },
                    method: 'GET'
                });

                const data = await response.json();

                for (let update of data) {

                    let sprite = this.model.sprites.find(s => s.id === update.id);
                    
                    if (update.id === id) {
                        continue;
                    }
                
                    // if sprite doesn't exist, create a new one
                    if (!sprite) {

                        if (update.type === 'robot') {

                            sprite = new Sprite(update.x_curr, update.y_curr, 'robot.png', update.name, 'robot');
                            sprite.id = update.id;
                            this.model.sprites.push(sprite);
                        } 
                        
                        else if (update.type === 'fireball') {

                            sprite = new Sprite(update.x_curr, update.y_curr, 'fireball.png', null, 'fireball');
                            sprite.id = update.id;
                            sprite.speed = 300;
                            sprite.update = Sprite.prototype.update_travel;
                            sprite.arrive = Sprite.prototype.update_disappear;
                            this.model.sprites.push(sprite);
                        }
                    }
                
                    // update robot travel
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

            catch (error) {
                console.error(`fetch failed: ${error}`);
            }

        }
    }
    
}



class Game {
	constructor(name) {
		this.model = new Model(name);
		this.view = new View(this.model);
		this.controller = new Controller(this.model, this.view);
	}

	onTimer() {
		this.controller.update();
		this.model.update();
		this.view.update();
	}
}


function startGame() {

    const name = document.getElementById('name').value;
    playerName = name;

    const textbox = document.getElementById('textbox');
    textbox.style.display = "none";

    const canvas = document.getElementById('myCanvas');
    canvas.style.display = "block";

    game = new Game(playerName);
    game.model.getMapItems();
    let timer = setInterval(() => { game.onTimer(); }, 30);

}

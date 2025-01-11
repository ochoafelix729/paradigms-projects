let game: Game | null = null;
const id = Math.floor(Math.random() * 10000000);
let playerName: string | undefined = undefined;
let score = 0;

let last_update_time = new Date();

const parseISOString = (s: string): Date => {
    let b = s.split(/\D+/).map(Number);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

// Sprite types for clarity
type SpriteType = 'robot' | 'fireball' | 'mapItem';

// Represents a moving image
class Sprite {
    x: number;
    y: number;
    name: string | null;
    type: SpriteType;
    speed: number;
    image: HTMLImageElement;
    dist_remaining?: number;
    component_x?: number;
    component_y?: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;

    update: (elapsed_time: number) => void;
    onleftclick: (x: number, y: number) => void;
    onrightclick: (x: number, y: number) => void;
    arrive: () => void;

    constructor(x: number, y: number, image_url: string, name: string | null, type: SpriteType) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.type = type;
        this.speed = 120; // pixels-per-second
        this.image = new Image();
        this.image.src = image_url;

        // Default event handlers
        this.update = this.update_stop;
        this.onleftclick = this.onclick_ignore;
        this.onrightclick = this.onclick_ignore;
        this.arrive = this.update_stop;
    }

    update_stop(): void {
        delete this.dist_remaining;
    }

    update_travel(elapsed_time: number): void {
        if (this.dist_remaining === undefined) return;
        let dist_step = Math.min(this.dist_remaining, elapsed_time * this.speed);
        this.x += dist_step * (this.component_x || 0);
        this.y += dist_step * (this.component_y || 0);
        this.dist_remaining -= dist_step;
        if (this.dist_remaining <= 0.01) this.arrive();
    }

    mkHitBox(): void {
        this.top = this.y;
        this.bottom = this.y + this.image.height;
        this.left = this.x;
        this.right = this.x + this.image.width;
    }

    collideswith(b: Sprite): boolean {
        if (this.speed === 0) return false;

        this.mkHitBox();
        b.mkHitBox();

        return !(
            this.right! <= b.left! ||
            this.left! >= b.right! ||
            this.bottom! <= b.top! ||
            this.top! >= b.bottom!
        );
    }

    update_disappear(): void {
        if (this.type === 'fireball') console.log('works');

        const fireballIndex = game?.model.sprites.indexOf(this) ?? -1;

        if (fireballIndex === -1) {
            console.log('Could not find fireball in list of sprites.');
            return;
        }

        game?.model.sprites.forEach((item, j) => {
            if (this.collideswith(item) && this.speed !== 0) {
                if (item.type === 'robot' && item !== this) score++;
                else if (item.type === 'mapItem') {
                    game!.model.sprites.splice(j, 1);
                    this.speed = 0;
                    game!.model.sprites.splice(fireballIndex, 1);
                    score--;
                    return;
                }
            }
        });
        game?.model.sprites.splice(fireballIndex, 1);
    }

    onclick_ignore(x: number, y: number): void {}

    onclick_set_destination(x: number, y: number): void {
        let delta_x = x - this.x;
        let delta_y = y - this.y;
        this.dist_remaining = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
        this.component_x = delta_x / this.dist_remaining;
        this.component_y = delta_y / this.dist_remaining;
    }

    onclick_throw_fireball(x: number, y: number): void {
        let fireball = new Sprite(this.x, this.y, "fireball.png", null, 'fireball');
        fireball.speed = 300;
        fireball.update = fireball.update_travel;
        fireball.arrive = fireball.update_disappear;
        let delta_x = x - this.x;
        let delta_y = y - this.y;
        fireball.dist_remaining = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
        fireball.component_x = delta_x / fireball.dist_remaining;
        fireball.component_y = delta_y / fireball.dist_remaining;
        game?.model.sprites.push(fireball);
    }
}

class Model {
    sprites: Sprite[] = [];
    avatar: Sprite;
    scrollx: number = 0;
    scrolly: number = 0;
    last_update_time: Date;

    constructor(name: string) {
        this.avatar = new Sprite(500, 250, "robot.png", name, 'robot');
        this.avatar.update = this.avatar.update_travel;
        this.avatar.onleftclick = this.avatar.onclick_set_destination;
        this.avatar.onrightclick = this.avatar.onclick_throw_fireball;
        this.sprites.push(this.avatar);

        this.last_update_time = new Date();
    }

    async getMapItems(): Promise<void> {
        try {
            const response = await fetch('/getItems', {
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                method: 'GET'
            });

            const data = await response.json();
            data.forEach((item: any) => {
                let sprite = new Sprite(item.x, item.y, item.image_url, null, 'mapItem');
                sprite.speed = 0;
                this.sprites.push(sprite);
            });
        } catch (error) {
            console.error(`fetch failed: ${error}`);
        }
    }

    update(): void {
        let now = new Date();
        let elapsed_time = (now.getTime() - this.last_update_time.getTime()) / 1000;
        this.sprites.forEach(sprite => sprite.update(elapsed_time));
        this.last_update_time = now;
    }

    onleftclick(x: number, y: number): void {
        this.avatar.onleftclick(x, y);
    }

    onrightclick(x: number, y: number): void {
        this.avatar.onrightclick(x, y);
    }
}

class View {
    model: Model;
    canvas: HTMLCanvasElement;

    constructor(model: Model) {
        this.model = model;
        this.canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    }

    update(): void {
        this.model.scrollx = this.model.avatar.x - 500;
        this.model.scrolly = this.model.avatar.y - 250;

        let ctx = this.canvas.getContext("2d")!;
        ctx.clearRect(0, 0, 1000, 500);

        this.model.sprites.sort((a, b) => a.y - b.y);

        this.model.sprites.forEach(sprite => {
            ctx.drawImage(
                sprite.image,
                sprite.x - sprite.image.width / 2 - this.model.scrollx,
                sprite.y - sprite.image.height - this.model.scrolly
            );

            if (sprite.type === 'robot') {
                const textX = sprite.x - this.model.scrollx;
                const textY = sprite.y - sprite.image.height - 20 - this.model.scrolly;

                ctx.textAlign = 'center';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'white';
                ctx.fillText(sprite.name ?? "", textX, textY);

                ctx.font = '12px Arial';
                ctx.fillStyle = 'yellow';
                ctx.fillText(`Score: ${score}`, textX, textY + 15);
            }
        });
    }
}

class Controller {
    model: Model;
    view: View;

    constructor(model: Model, view: View) {
        this.model = model;
        this.view = view;

        this.view.canvas.addEventListener("click", event => this.onLeftClick(event));
        this.view.canvas.addEventListener("contextmenu", event => this.onRightClick(event));
    }

    onLeftClick(event: MouseEvent): void {
        event.preventDefault();
        const x = event.pageX - this.view.canvas.offsetLeft;
        const y = event.pageY - this.view.canvas.offsetTop;
        this.model.onleftclick(x + this.model.scrollx, y + this.model.scrolly);
        // Send a request to backend (omitted here for brevity)
    }

    onRightClick(event: MouseEvent): void {
        event.preventDefault();
        const x = event.pageX - this.view.canvas.offsetLeft;
        const y = event.pageY - this.view.canvas.offsetTop;
        this.model.onrightclick(x + this.model.scrollx, y + this.model.scrolly);
        // Send a request to backend (omitted here for brevity)
    }

    async update(): Promise<void> {
        let now = new Date();
        if (now.getTime() - last_update_time.getTime() > 500) {
            last_update_time = now;
            // Fetch updates from server (omitted here for brevity)
        }
    }
}

class Game {
    model: Model;
    view: View;
    controller: Controller;

    constructor(name: string) {
        this.model = new Model(name);
        this.view = new View(this.model);
        this.controller = new Controller(this.model, this.view);
    }

    onTimer(): void {
        this.controller.update();
        this.model.update();
        this.view.update();
    }
}

function startGame(): void {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    playerName = name;

    (document.getElementById('textbox') as HTMLDivElement).style.display = "none";
    (document.getElementById('myCanvas') as HTMLCanvasElement).style.display = "block";

    game = new Game(playerName);
    game.model.getMapItems();
    setInterval(() => { game!.onTimer(); }, 30);
}

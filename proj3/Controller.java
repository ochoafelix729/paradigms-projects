import java.awt.event.MouseListener;
import java.io.FileWriter;
import java.io.IOException;
import java.awt.event.MouseEvent;
import java.awt.event.ActionListener;
import java.awt.event.ActionEvent;
import java.awt.event.KeyListener;
import java.awt.event.KeyEvent;
import java.nio.file.Paths;
import java.nio.file.Files;

class Controller implements ActionListener, MouseListener, KeyListener
{
	View view;
	Model model;
	MapItem mapitem;
	boolean keyLeft;
	boolean keyRight;
	boolean keyUp;
	boolean keyDown;
	int imagesOnMap = 0;

	Controller(Model m, View v)
	{
		this.model = m;
		this.view = v;
		this.view.addMouseListener(this);
		this.view.save.addActionListener(this);
		this.view.load.addActionListener(this);
	}

	public void actionPerformed(ActionEvent e)
	{
		if(e.getSource() == this.view.save)
		{
			this.model.tempx = this.view.scrollx;
			this.model.tempy = this.view.scrolly;
			try {
				FileWriter writer = new FileWriter("map.json");
				writer.write(this.model.marshal().toString());
				writer.close();
			} catch (IOException exception) {
				exception.printStackTrace();
				System.exit(1);
			  }
		}
		else if (e.getSource() == this.view.load)
		{
			this.view.scrollx = this.model.tempx;
			this.view.scrolly = this.model.tempy;
			model.items.clear();
			imagesOnMap = 0;
			try {
				String content = new String(Files.readAllBytes(Paths.get("map.json")));
				Json map = Json.parse(content);
				this.model.unmarshal(map);
			} catch (IOException exception) {
				exception.printStackTrace();
				System.exit(1);
			}
		} else {
			throw new RuntimeException("An unrecognized button was pushed");
		  }
	}

	public void mousePressed(MouseEvent e)
	{
		this.model.setDestination(e.getX(), e.getY());

		if (e.getX() < 200 && e.getY() < 200) {
			
			this.model.change_item();
			return;
		}
		else{
			if (e.getButton() == 1){
				this.model.addMapItem(e.getX() + this.view.scrollx, e.getY() + this.view.scrolly);
				imagesOnMap++;
			}

			//remove nearest item
			else if (e.getButton() == 3 && imagesOnMap >= 1){

				double nearest = Double.MAX_VALUE;
				double distance;
				int index = 0;

				for (int i = 0; i < imagesOnMap; i++){
					distance = Math.sqrt(
						Math.pow(model.items.get(i).x - (e.getX() + this.view.scrollx), 2) +
						Math.pow(model.items.get(i).y - (e.getY() + this.view.scrolly), 2)
					);

					if (distance < nearest){
						nearest = distance;
						index = i;
					}
					
				}
				model.items.remove(index);
				imagesOnMap--;
				
			}
			
		}
		
	}

	public void mouseReleased(MouseEvent e) 
	{	}
	
	public void mouseEntered(MouseEvent e) 
	{	}
	
	public void mouseExited(MouseEvent e) 
	{	}
	
	public void mouseClicked(MouseEvent e) 
	{	}
	
	public void keyPressed(KeyEvent e)
	{
		switch(e.getKeyCode())
		{
			case KeyEvent.VK_RIGHT: 
				this.keyRight = true;
				break;
			case KeyEvent.VK_LEFT: 
				this.keyLeft = true; 
				break;
			case KeyEvent.VK_UP: 
				this.keyUp = true; 
				break;
			case KeyEvent.VK_DOWN: 
				this.keyDown = true; 
				break;
		}
	}

	public void keyReleased(KeyEvent e)
	{
		switch(e.getKeyCode())
		{
			case KeyEvent.VK_RIGHT: 
				this.keyRight = false;
				break;
			case KeyEvent.VK_LEFT: 
				this.keyLeft = false; 
				break;
			case KeyEvent.VK_UP: 
				this.keyUp = false; 
				break;
			case KeyEvent.VK_DOWN: 
				this.keyDown = false; 
				break;
			case KeyEvent.VK_ESCAPE:
				System.exit(0);
		}
		char c = Character.toLowerCase(e.getKeyChar());
		if(c == 'q')
			System.exit(0);
        if(c == 'r')
            this.model.change_item();
	}

	public void keyTyped(KeyEvent e)
	{	}

	void update()
	{
		if(this.keyRight){
			this.model.dest_x -= Model.speed;
			this.view.scrollx += Model.speed;
		}
			
		if(this.keyLeft){
			this.model.dest_x += Model.speed;
			this.view.scrollx -= Model.speed;
		}
			
		if(this.keyDown){
			this.model.dest_y -= Model.speed;
			this.view.scrolly += Model.speed;
		}
			
		if(this.keyUp){
			this.model.dest_y += Model.speed;
			this.view.scrolly -= Model.speed;
		}
			
	}
}
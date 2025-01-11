import java.awt.event.MouseListener;
import java.awt.event.MouseEvent;
import java.awt.event.ActionListener;
import java.awt.event.ActionEvent;
import java.awt.event.KeyListener;
import java.awt.event.KeyEvent;

class Controller implements ActionListener, MouseListener, KeyListener
{
	View view;
	Model model;
	boolean keyLeft;
	boolean keyRight;
	boolean keyUp;
	boolean keyDown;

	Controller(Model m, View v)
	{
		this.model = m;
		this.view = v;
		this.view.addMouseListener(this);
	}

	public void actionPerformed(ActionEvent e)
	{
		System.out.println("Hey! I said never push that button!");
	}

	public void mousePressed(MouseEvent e)
	{
		this.model.setDestination(e.getX(), e.getY());
		if (e.getX() < 200 && e.getY() < 200) {
			this.model.change_item();
			return;
		}
		else{
			this.model.addMapItem(e.getX(), e.getY());
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
		if(this.keyRight) 
            this.model.dest_x += Model.speed;
		if(this.keyLeft) 
			this.model.dest_x -= Model.speed;
		if(this.keyDown) 
			this.model.dest_y += Model.speed;
		if(this.keyUp)
			this.model.dest_y -= Model.speed;
	}
}

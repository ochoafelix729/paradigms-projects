import javax.swing.JPanel;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.io.File;
import java.awt.Color;

class View extends JPanel
{
	BufferedImage[] item_images;
	Model model;

	View(Model m)
	{
		this.model = m;

		// Make a button

		// Load the turtle image
		// Load the images
		this.item_images = new BufferedImage[Main.MapItemTypes.length];
		for (int i = 0; i < Main.MapItemTypes.length; i++) {
			BufferedImage image = null;
			try
			{
				image = ImageIO.read(new File("images/" + Main.MapItemTypes[i] + ".png"));
			} catch(Exception e) {
				e.printStackTrace(System.err);
				System.exit(1);
			}
			this.item_images[i] = image;
		}
	}

	public void paintComponent(Graphics g)
	{
		// Clear the background
		g.setColor(new Color(64, 255, 128));
		g.fillRect(0, 0, this.getWidth(), this.getHeight());


		// Draw all the item images
		for (int i = 0; i < model.items.size(); i++) {
			MapItem item = model.items.get(i);
			BufferedImage image = this.item_images[item.type];
			int w = image.getWidth();
			int h = image.getHeight();

			// Draw the image with the bottom center at (x, y)
			g.drawImage(image, item.x - w / 2, item.y - h, null);
		}
		
		g.setColor(new Color(255, 0, 255));
		g.fillRect(0, 0, 200, 200);

		BufferedImage purple = this.item_images[model.current_item];
		int w = purple.getWidth();
		int h = purple.getHeight();
		g.drawImage(purple, 100 - w/2, 100 - h/2, null);

	}
	
	void removeButton()
	{
		this.repaint();
	}
}

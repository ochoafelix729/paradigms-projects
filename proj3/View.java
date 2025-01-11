import javax.swing.JPanel;
import java.awt.Graphics;
import java.awt.Point;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.io.File;
import java.awt.Color;
import javax.swing.JButton;
import java.util.Collections;

class View extends JPanel
{
	BufferedImage[] item_images;
	Model model;
	Jumper jumper;
	int scrollx;
	int scrolly;
	static int time = 0;
	JButton save;
	JButton load;

	View(Model m, int h, int v)
	{
		this.model = m;
		this.scrollx = h;
		this.scrolly = v;

		//create buttons
		save = new JButton("Save");
		this.add(save);
		
		load = new JButton("Load");
		this.add(load);

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

		time++;

		//sort item images
		Collections.sort(model.items, new ItemYComparator());

		// Draw all the item images
		for (int i = 0; i < model.items.size(); i++) {
			MapItem item = model.items.get(i);
			Point p = item.pos(time);
			BufferedImage image = this.item_images[item.type];

			int w = image.getWidth();
			int h = image.getHeight();

			double sw = (double)w * item.scale;
			double sh = (double)h * item.scale;

			g.drawImage(image, (int)(p.x - sw/2), (int)(p.y - sh), (int)(p.x + sw/2), p.y, 0, 0, w, h, null);
			
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


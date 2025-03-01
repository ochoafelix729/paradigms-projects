import javax.swing.JFrame;
import java.awt.Toolkit;

public class Main extends JFrame
{
	Model model;
	Controller controller;
	View view;

	public Main()
	{
		// Instantiate the three main objects
		model = new Model();
		view = new View(model);
		controller = new Controller(model, view);

		// Set some window properties
		this.setTitle("Turtle Attack!");
		this.setSize(1500, 800);
		this.setFocusable(true);
		this.getContentPane().add(view);
		this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		this.setVisible(true);
		this.addKeyListener(controller);

	}

	public static final String[] MapItemTypes = {
		"chair",
		"lamp",
		"mushroom",
		"outhouse",
		"pillar",
		"pond",
		"rock",
		"statue",
		"tree",
		"turtle",
	};

	public void run()
	{
		// Main loop
		while(true)
		{
			controller.update();
			model.update();
			view.repaint(); // Indirectly calls View.paintComponent
			Toolkit.getDefaultToolkit().sync(); // Updates screen

			// Go to sleep for a brief moment
			try
			{
				Thread.sleep(25);
			} catch(Exception e) {
				e.printStackTrace();
				System.exit(1);
			}
		}
	}

	public static void main(String[] args)
	{
		Main m = new Main();
		m.run();
	}
}

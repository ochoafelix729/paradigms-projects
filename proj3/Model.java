import java.util.ArrayList;
import java.util.Comparator;
import java.awt.Point;
import java.lang.Math;


class Model
{
	int dest_x;
	int dest_y;
	int tempx;
	int tempy;
	View view;
	ArrayList<MapItem> items;
	Comparator<MapItem> ycompare = new ItemYComparator();
	public int current_item;
	static int speed = 10;

	double scale = 1.0;

	Model()
	{
		this.dest_x = 20000;
		this.dest_y = 20000;
		this.items = new ArrayList<>();
	}

   public void change_item(){
		this.current_item = (this.current_item + 1) % 10;
   }

	public void setDestination(int x, int y)
	{
		this.dest_x = x;
		this.dest_y = y;
	}

	public void addMapItem(int x, int y)
	{
		MapItem i = MapItem.newItem(x, y, this.current_item, scale);
		this.items.add(i);
	}

	public Json marshal()
	{
		Json map = Json.newObject();
		Json list_of_map_items = Json.newList();
		map.add("items", list_of_map_items);
		for (MapItem item : this.items)
		{
			list_of_map_items.add(item.marshal());
		}
		
		return map;
	}

	public void unmarshal(Json map)
	{
		Json mapItems = map.get("items");
		for(int i = 0; i < mapItems.size(); i++){
			MapItem mapitem = MapItem.unmarshal(mapItems.get(i));
			this.items.add(mapitem);
		}

	}

	

}


class MapItem
{
	protected int x;
	protected int y;
	public int type;
	public double scale;
	Model model;
	View view;

	protected MapItem(int x, int y, int type, double scale)
	{
		this.x = x;
		this.y = y;
		this.type = type;
		this.scale = scale;
	}

	Json marshal()
	{
		Json ob = Json.newObject();
		ob.add("type", this.type);
		ob.add("x", this.x);
		ob.add("y", this.y);
		return ob;
	}

	public static MapItem unmarshal(Json ob) {
		return newItem((int)ob.getLong("x"), (int)ob.getLong("y"), (int)ob.getLong("type"), 1.0);
	}

	Point pos(int time)
	{
		return new Point(this.x, this.y);
	}

	public static MapItem newItem(int x, int y, int type, double scale) {
		if (type == 3 || type == 9) {
			return new Jumper(x, y, type, scale);
		}

		else if (type == 4 || type == 7) {
			return new Strafer(x, y, type, scale);
		}

		else if (type == 2) {
			return new Mushroom(x, y, type, scale);
		}

		else {
			return new MapItem(x, y, type, scale);
		}
			
	}

}

class ItemYComparator implements Comparator<MapItem>
{
	// Returns a negative value if a.y > b.y
	// Returns zero if a.y == b.y
	// Returns a positive value if a.y < b.y
	public int compare(MapItem a, MapItem b) {
		return a.y - b.y;
    }

}

class Jumper extends MapItem
{
	
	Jumper(int x, int y, int type, double scale)
	{
		super(x, y, type, scale);
		pos(View.time);
		
	}

	Point pos(int time)
	{

		return new Point(this.x, this.y - (int)Math.max(0., 50 * Math.sin(((double)time) * 2 * Math.PI / 30)));
	}
}

class Strafer extends MapItem
{

	Strafer(int x, int y, int type, double scale)
	{
		super(x, y, type, scale);
		pos(View.time);
	}

	Point pos(int time)
	{
		return new Point(this.x - (int)Math.max(0., 50 * Math.sin(((double)time) * 2 * Math.PI / 30)), this.y);
	}
}

class Mushroom extends MapItem
{
	
	Mushroom(int x, int y, int type, double scale)
	{
		super(x, y, type, scale);
		pos(View.time);
	}


	Point pos(int time)
	{
		this.scale = 2.0 + 1.25 * Math.sin(((double)time) * 2 * Math.PI / 30);  

		return new Point(this.x, this. y);
	}
		
}

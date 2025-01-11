import java.util.ArrayList;
import java.util.Comparator;


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
		MapItem i = new MapItem(x, y, this.current_item);
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
	public int x;
	public int y;
	public int type;
	Model model;

	MapItem(int x, int y, int type)
	{
		this.x = x;
		this.y = y;
		this.type = type;
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
		return new MapItem((int)ob.getLong("x"), (int)ob.getLong("y"), (int)ob.getLong("type"));
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

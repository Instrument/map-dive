Dive Editor
-----------

The dive editor is built into the control console.  


Keyboard Commands
-----------------

	ESCAPE        - Toggle edit mode.


The following keyboard commands are active when in edit mode.


	1             - Set camera to chase mode (same mode as normal game play)
	2             - Set camera to close up chase mode (with no wobble)
	3             - Set camera to top-down mode
	4             - Set camera to side mode

	TAB           - Toggle between zero-gravity and game-play controls, this is useful for doing quick test runs through sections of a dive.

	Arrow Keys    - move player
	Page Up/Down  - adjust altitude

	Spacebar      - Add an entity at the player's current location

	Delete        - Delete the currently selected entity



Saving Levels
-------------

When you click "save level" in the edit mode UI, a .json file will be created in the `common/levels` folder.  Saving will over-write existing files without prompting, so if you are unsure about your changes you should specify a unique name for the level or keep backups.  If you are adding a new level, you will need to edit the index.html files for the viewport and control nodes and add your new .json file to the list of scripts included in each page.


Creating a new Level
--------------------

The recommended workflow is to start with the desired landing zone, then pick a starting location, then add gates, then add stars.  This typically results in the least amount of re-work later on in the process.  Here's a basic walkthrough of the process used to make a new dive.


### Set up the start and end point

1. Select "EMPTY" from the course drop-down, this will load a special empty course.
2. Enter an address, search term, or latitude/longitude in the "find location or Lat/Lng" text field and click "search" or "lat/lng".
3. If you are happy with the result, click "Set Origin at Player" to move the starting point of the new level to the current player location.
4. Move your player to the location that you'd like to use for the final landmark, and add a landmark, and drop-zone entity.  You can always move these later, so just get them close to where you'd like the dive to end.

_now is a good time to save your work_

5. Pick a name for your level and type it into the level name field, click "save level"
6. In the map view, drag the origin marker (a skinny yellow triangle) to the location where you'd like the dive to begin.  Note that when you drag the origin marker, a green circle will appear around the drop zone, this circle is just a helpful visual indicator for a good starting distance.


### Set up the rough course

1. Select "gate" from the "entities" drop-down list.
2. Click "move player to origin" to set pegman at the starting point.
3. Press TAB to switch into gameplay controls.  Pegman will now fall as if you're playing the dive, use the arrow keys to fly around.
4. As you fall, press the space bar to drop gates along your path.  Most dives include between 10 to 14 gates.
5. Press TAB again to switch back to zero-gravity mode.

_now is another good time to save your work_


### Add Stars

1. Select "Star" from the "entities" drop-down list.
2. Click "move player to origin" to set pegman at the starting point.
3. Press TAB to switch into gameplay controls.
4. As you fly, press the space bar to drop stars. Try to keep to the path of gates you created in the previous section.
5. Press TAB again to switch back to zero-gravity mode.


### Refine the Course

After you've added gates and stars, it's a good idea to do a few test runs of the dive and tweak things as needed.  You can always switch between dive and zero-gravity modes with the TAB key to test specific parts of the course.  All of the items you've placed can be dragged around in the map view (zoom in for precise control).  The altitude and rotation of each item can also be adjusted via the controls under the list of entities.  You can also double-click any entity in the list box and the map view will center on that entity.
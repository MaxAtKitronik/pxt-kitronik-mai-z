## pxt-kitronik-Mai-Z
Custom blocks for the Kitronik Mai-Z the Mouse Bot.
These blocks are divided into five separate categories - Movement, LEDs, Sensors, Buzzer, Units.

The Movement blocks include movement functionalities such as forwards, backwards and rotation.
The LEDs blocks include changing colours and brightness of the LEDs, along with functional LED blocks such as indicators and break lights.
The Sensors blocks include all functionalities for the front distance sensor and trio of line following sensors,including the option for automatic cliff detection.
The Buzzer blocks allow for specific buzzer function such as beeping the horn.
The units blocks allow for the user to choose between cm or inches, this relates to specific movement distances and the front distance sensor.

For more information and educational resources, please visit the [product page here].

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open **[https://makecode.microbit.org/](https://makecode.microbit.org/)**
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for ** GITHUB LINK HERE ** and import

# Movement Mai-Z Blocks

The following blocks are available under the Movement tab

The following blocks can be found specifically under the Movement - Move subcategory

### move [direction] at [speed] for [distance]

Moves Mai-Z in the requested direction (forwards/backwards) at the requested speed (0-100%) over the requested distance (1-1000 cm/inches or continuously).
The direction can be selected from a drop down menu.
The speed can be selected using a slider bar or by being manually typed in.
The distance can be selected from a drop down menu in specific increments (1,2,3,4,5,10,15,20,25,50,100,200,500,1000,continuously).

In this example, Mai-Z would move forwards at 50% speed for 100 units:
```blocks
kitronikMaiZ.maizMove(kitronikMaiZ.MoveDirection.Forwards, 50, kitronikMaiZ.MoveDistance.OneHundredUnits)
```

The following blocks can be found specifically under the Movement - Rotate subcategory

### rotate [direction] continuously at [speed]

Rotates Mai-Z in the requested direction (clockwise/anticlockwise) continuously at the requested speed (0-100%).
The direction can be selected from a drop down menu.
The speed can be selected using a slider bar or by being manually typed in.

In this example, Mai-Z would rotate clockwise continuously at 50% speed:
```blocks
kitronikMaiZ.maizRotateContinuous(kitronikMaiZ.RotateDirection.Clockwise, 50)
```

### rotate [angle] at [speed]

Rotates Mai-Z over the request angle in the relevant direction (decided by the angle +/clockwise, -/anticlockwise) at the requested speed (0-100%).
The angle can be selected using a rotate ratio slider.
The speed can be selected using a slider bar or by being manually typed in.

In this example, Mai-Z would rotate clockwise for degrees at 50% speed:
```blocks
kitronikMaiZ.maizRotateAngle(90, 50)
```

The following blocks can be found specifically under the Movement - Stop subcategory

### instantly stop Mai-Z movement

Brings Mai-Z movement/motors to a halt once called
In this example, Mai-Z would be brought to a stop from any previous movement being used
```blocks
kitronikMaiZ.maizStop()
```

### gradually stop maiz by steadily decreasing speed to zero

Slowly brings Mai-Z movement/motors to a halt once called
In this example, Mai-Z would slowly be brought to a stop from any previous movement being used
```blocks
kitronikMaiZ.maizGradualStop()
```

The following blocks can be found specifically under the Movement - Tiles subcategory

### move mai-z over [number of tiles] at [speed]: moves mai-z over the selected number of tiles at the relevant speed

Moves Mai-Z forwards over the requested number of tiles (13.5 cm each) at the requested speed (0-100%).
The number of tiles can be selected using a drop down menu.
The speed can be selected using a slider bar or by being manually typed in.

In this example, Mai-Z would move forwards 5 tiles at 50% speed:
```blocks
kitronikMaiZ.maizMoveTiles(kitronikMaiZ.MoveXTiles.FiveTiles, 50)
```

### turn [direction]

Turns Mai-Z 90 degrees in the relevant direction (left/anticlockwise, right/clockwise)
The direction can be selected using a drop down menu.

In this example, Mai-Z would turn 90 degrees to the right/clockwise:
```blocks
kitronikMaiZ.maizTurnTiles(kitronikMaiZ.TurnTiles.TurnRight)
```

### u turn

Turns Mai-Z 180 degrees back on itself

In this example, Mai-Z would turn 180 degrees back on itself:
```blocks
kitronikMaiZ.maizUTurn()
```

# LEDs Mai-Z Blocks

The following blocks are available under the Mai-Z LEDs tab

The following blocks can be found specifically under the LEDs - LEDs subcategory

### set LEDs to [colour]

Sets Mai-Z four LEDs to the relevant colour (red, orange, yellow, pink, green, lilac, cyan, light blue, brown, dark blue, purple, pink, pink, white, grey, black/off)
The colour can be selected using the colour picker, a drop down menu with all 16 colours visually shown.

In this example, Mai-Z LEDs would be set to yellow:
```blocks
kitronikMaiZ.setLEDs(0xffff00)
```

### set LED [LED ID] to [colour]

Sets the relevant Mai-Z LED to the relevant colour (red, orange, yellow, pink, green, lilac, cyan, light blue, brown, dark blue, purple, pink, pink, white, grey, black/off)
The colour can be selected using the colour picker, a drop down menu with all 16 colours visually shown.

In this example, Mai-Z LED three would be set to green:
```blocks
kitronikMaiZ.setLED(kitronikMaiZ.LedID.ledThree, 0x00ff00)
```

### set LED brightness to [LED brightness]

Sets Mai-Z LEDs to the relevant brightness level (0 - 100%), this is set to 25% by default on Mai-Z
The brightness level can be selected using a slider bar or by being manually typed in.

In this example, Mai-Z LED brightness would be set to 50%:
```blocks
kitronikMaiZ.setLEDBrightness(50)
```

The following blocks can be found specifically under the LEDs - Functional Lighting subcategory

### set indicator lights to [indicator status]

Sets Mai-Z LEDs to the relevant indicator status (left indicators, right indicators, hazard lights, off)
The indicator status can be selected using a drop down menu.

In this example, Mai-Z LEDs will be set to right indicators:
```blocks
kitronikMaiZ.setIndicatorLights(kitronikMaiZ.IndicatorStatus.Right)
```

### set brake lights to [brake status]

Sets Mai-Z LEDs to the relevant brake status (on, off)
The brake status can be selected using a drop down menu.

In this example, Mai-Z LEDs will be set to brake lights on:
```blocks
kitronikMaiZ.setBrakeLights(kitronikMaiZ.BrakeStatus.On)
```

# Sensors Mai-Z Blocks

The following blocks can be found under the Mai-Z Sensors tab

The following blocks can be found specifically under the Sensors - Line Follow subcategory

### return [line follow sensor ID] line follow sensor status

Returns Mai-Z relevant line follow sensor (left, centre, right) status as a boolean (true/false)
The line follow sensor status can be selected using a drop down menu.

In this example, a variable is set to Mai-Z centre line follow sensor status:
```blocks
centreLFStatus = kitronikMaiZ.lineFollowStatus(kitronikMaiZ.LineFollowSensor.Centre)
```

### return cliff detection status

Returns Mai-Z cliff detection status as a boolean (true/false)

In this example, a variable is set to Mai-Z cliff detection status:
```blocks
cliffDetectionStatus = kitronikMaiZ.cliffDetectionStatus()
```

### auto cliff detection [status]

Enables/disbales Mai-Z automatic cliff detection (disabled by default), which when enabled will stop any current movement and further commands being processed until the cliff is no longer detected
The automatic cliff detection status can be selected using a drop down menu.

In this example, Mai-Z automatic cliff detection will be enabled:
```blocks
kitronikMaiZ.autoCliffDetection(kitronikMaiZ.AutoCliffStatus.Enabled)
```

The following blocks can be found specifically under the Sensors - Front Distance subcategory

### measure front distance

Returns Mai-Z front distance sensor reading

In this example, a variable will be set to Mai-Z front distance sensor reading:
```blocks
frontDistance = kitronikMaiZ.measureFrontDistance()
```

# Buzzer Mai-Z Blocks

The following blocks can be found under the Buzzer tab

### sound horn

Sounds a double short beep on Mai-Z buzzer

In this example, a variable will be set to Mai-Z front distance sensor reading:
```blocks
frontDistance = kitronikMaiZ.measureFrontDistance()
```

# Units Mai-Z Blocks

The following blocks can be found under the Units tab

### measure in [units]

Selects what units for Mai-Z to measure in (cm/inches, cm by default), this relates to the distances being requested and the values returned from the front distance sensor

In this example, a variable will be set to Mai-Z front distance sensor reading:
```blocks
frontDistance = kitronikMaiZ.measureFrontDistance()
```


> Open this page at [https://maxatkitronik.github.io/pxt-kitronik-mai-z/](https://maxatkitronik.github.io/pxt-kitronik-mai-z/)

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/maxatkitronik/pxt-kitronik-mai-z** and import

## Edit this project

To edit this repository in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **Import** then click on **Import URL**
* paste **https://github.com/maxatkitronik/pxt-kitronik-mai-z** and click import

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>

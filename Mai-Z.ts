/**
 * Blocks for driving the kitronik Mai-Z the MouseBot for micro:bit
 */
//% weight=100 color=#00A654 icon="\uf1b9" block="Mai-Z the MouseBot"
// subcategory=["More"]
//% group = '["Move", "Rotate", "Stop", "Tiles", "LEDs", "Functional Lighting", "Line Follow", "Front Distance", "Software Version"]'

namespace kitronikMaiZ {
	// Global Variables
	// Movement
	let distanceValue: number = 0; // Variable To Store Distance Value
	const INCHES_CONSTANT: number = 2.54; // Inches To Centimeters Conversion Constant
	const DISTANCE_CONSTANT: number = 100; // This Is To Avoid Decimals Not Being Sent As Parameters Are Sent At A Byte Level
	let forwardContFlag: boolean = false; // Flag To Track Whether Forward Continuous Has Already Been Sent To Avoid Duplicate Messages Being Sent Over The I2C Comms
	let leftContFlag: boolean = false; // Flag To Track Whether Left / Anti Clockwise Continuous Has Already Been Sent To Avoid Duplicate Messages Being Sent Over The I2C Comms
	let rightContFlag: boolean = false; // Flag To Track Whether Right / Clockwise Continuous Has Already Been Sent To Avoid Duplicate Messages Being Sent Over The I2C Comms
	// Sensors
	let lineFollowValue: number = 0x00; // Line Following
	let frontDistanceValue: number = 0x00; // Front Distance
	let autoCliffEnabled: boolean = false; // Flag To Track Whether Auto CLif Detection Is Enabled, Used In The Logic To Avoid Duplicate Continuous Movement Commands
	// Buzzer
	let maizBuzzerPin: number = DigitalPin.P16 // On Board Mai-Z Buzzer Pin
	// Errors
	let errorStatus: number = 0x00; // Variable To Store Current Error Code
	const ERROR_CONSTANT: number = 111;
	// Manoeuvre Complete
	let commandCompletedStatus: number = 0x00; // Variable To Store Command Completion Status
	const COMMAND_OUTSTANDING: number = 0x01; // Command Outstanding Constant
	// Units
	let inchesFlag: boolean = false; // Flag To Track Whether Inches Is Requested
	// Communication Retries
	const MAX_RETRIES: number = 3; // Number Of Max Retries
	// Communication Reset
	let successfulCommsReset: boolean = false; // Flag To Track Whether Communication Is Successful After Failed Retries
	// Software Version
	let softwareVersion: number = 0; // Variable To Store The Back End Software Version
	
	// Look Up Tables
	// Colour Picker IDs
	const colourID: { [key: number]: number } = {
		// Didn't Link When Formatted In Hexadecimal?
		16711680: 0x01, // Red - 0xFF0000
		16744448: 0x02, // Orange - 0xFF8000
		16776960: 0x03, // Yellow - 0xFFFF00
		16752037: 0x04, // Light Pink - 0xFF9DA5
		65280: 0x05, // Green - 0x00FF00
		11575039: 0x06, // Lilac - 0xB09EFF
		65535: 0x07, // Cyan - 0x00FFFF
		32767: 0x08, // Light Blue - 0x007FFF
		6637343: 0x09, // Brown - 0x65471F
		255: 0x0A, // Blue - 0x0000FF
		8323327: 0x0B, // Violet - 0x7F00FF
		16711808: 0x0C, // Pink - 0xFF0080
		16711935: 0x0D, // Magenta - 0xFF00FF
		16777215: 0x0E, // White - 0xFFFFFF
		10066329: 0x0F, // Gray - 0x999999
		0: 0x00  // Off/Black - 0x000000
	};

	// Colour Picker ID Mapper function
	function colourIDMapper(colour: number): number {
		return colourID[colour] || 0x00; // Return 0x00 If No Match
	}
	
	// General Enums
	// Command IDs
	export enum CommandID {
		// Movement / Motor Driver
		MOVE = 0x01,
		SPIN = 0x02,
		STOP = 0x03,
		GRADUAL_STOP = 0x04,
		TURN_ROVER = 0x05,
		// ZIP LEDs
		TURN_ALL_ZIP_LEDS = 0x10,
		SET_ZIP_LED = 0x11,
		SET_ZIP_LED_BRIGHTNESS = 0x12,
		INDICATOR_LIGHT = 0x13,
		BREAK_LIGHT = 0x14,
		// Line Follow
		LINE_FOLLOWING_DETECT = 0x20,
		AUTO_CLIFF_DETECT = 0x22,
		// Forward Distance
		MEASURE_DISTANCE_FRONT = 0x21,
		// Buzzer
		SOUND_HORN = 0x30,
		// Read Types
		ERROR_READ = 0x40,
		COMMAND_FINISHED_READ = 0x41,
		// Comms Reset
		COMMS_RESET = 0x50,
		// Start Key
		START_KEY = 0x60,
		// Software Version
		SOFTWARE_VERSION = 0x80
	}
	
	// Command Types
	export enum CommandType {
		TxCommand = 0x00, // Transmit - micro:bit To Mai-Z
		RxCommand = 0x01 // Receive - Mai-Z To micro:bit
	}
	
	// Error Codes
	export enum ErrorCode {
		// Mai-Z Side 
		NO_ERROR = 0x00,
		TIMEOUT_ERROR = 0x01,
		TX_CHECK_BYTE_ERROR = 0x02,
		UNKOWN_COMMAND_ERROR = 0x03,
		INVALID_DATA_ERROR = 0x04,
		READ_ERROR = 0x05,
		START_KEY_ERROR = 0x06,
		CLIFF_DETECTED = 0x07,
		// micro:bit Side
		RX_CHECKBYTE_ERROR = 0x08,
		RX_COMMAND_ERROR = 0x09,
	}
	
	// Block Enums
	// Movement
	/**
	 * Move Direction
	 */
	export enum MoveDirection {
		//% block="forwards"
		Forwards = 0x01,
		//%block="reverse"
		Reverse = 0x02
	}
	
	/**
	 * Move Distance Options
	 */
	export enum MoveDistance {
		//% block="continuous"
		Continuous = 0x00,
		//%block="1"
		OneUnit = 0x01,
		//%block="2"
		TwoUnits = 0x02,
		//%block="3"
		ThreeUnits = 0x03,
		//%block="4"
		FourUnits = 0x04,
		//%block="5"
		FiveUnits = 0x05,
		//%block="10"
		TenUnits = 0x0A,
		//%block="15"
		FifteenUnits = 0x0E,
		//%block="20"
		TwentyUnits = 0x14,
		//%block="25"
		TwentyFiveUnits = 0x19,
		//%block="50"
		FiftyUnits = 0x32,
		//%block="100"
		OneHundredUnits = 0x64,
		//%block="200"
		TwoHundredUnits = 0xC8,
		//%block="500"
		FiveHundredUnits = 0x01F4,
		//%block="1000"
		OneThousandUnits = 0x03E8,
	}
	
	/**
	 * Rotate Direction
	 */
	export enum RotateDirection {
		//% block="clockwise"
		Clockwise = 0x01,
		//%block="anticlockwise"
		Anticlockwise = 0x02
	}
	
	// LEDs
	/**
	 * LED ID
	 */
	export enum LedID {
		//% block="LED one"
		ledOne = 0x00,
		//%block="LED two"
		ledTwo = 0x01,
		//% block="LED three"
		ledThree = 0x02,
		//%block="LED four"
		ledFour = 0x03,
	}
	
	/**
	 * LED Colours
	 */
	export enum LedColours {
		//% block="off" 
		Off = 0x00,
		//%block="red" color="#FF0000"
		Red = 0x01,
		//% block="yellow" color="#FFFF00"
		Yellow = 0x02,
		//%block="green" color="#00FF00"
		Green = 0x03,
		//% block="blue" color="#0000FF"
		Blue = 0x04,
		//%block="indigo" color="#4B0082"
		Indigo = 0x05,
		//% block="violet" color="#8F00FF"
		Violet = 0x06,
		//%block="purple" color="#800080"
		Purple = 0x07,
		//%block="white" color="#FFFFFF"
		White = 0x08,
	}
	
	/**
	 * Indicator Status
	 */
	export enum IndicatorStatus {
		//% block="off"
		Off = 0x00,
		//%block="left"
		Left = 0x01,
		//%block="right"
		Right = 0x02,
		//%block="hazards"
		Hazards = 0x03
	}
	
	/**
	 * Brake Status
	 */
	export enum BrakeStatus {
		//% block="off"
		Off = 0x00,
		//%block="on"
		On = 0x01,
	}
	
	// Sensors
	/**
	 * Line Follow Status
	 */
	export enum LineFollowSensor {
		//% block="right"
		Right = 0x01,
		//%block="centre"
		Centre = 0x02,
		//%block="left"
		Left = 0x04
	}
	
	/**
	 * Auto Cliff Detection Status
	 */
	export enum AutoCliffStatus {
		//% block="enabled"
		Enabled = 0x01,
		//%block="disabled"
		Disabled = 0x00
	}
	
	// Tile Movement
	/**
	 * Move Forwards X Tiles
	 */
	export enum MoveXTiles {
		//% block="one"
		OneTile = 0x01,
		//%block="two"
		TwoTiles = 0x02,
		//% block="three"
		ThreeTiles = 0x03,
		//%block="four"
		FourTiles = 0x04,
		//% block="five"
		FiveTiles = 0x05,
		//% block="six"
		SixTiles = 0x06,
		//%block="seven"
		SevenTiles = 0x07,
		//% block="eight"
		EightTiles = 0x08,
		//%block="nine"
		NineTiles = 0x09,
		//% block="ten"
		TenTiles = 0x10,
		//% block="eleven"
		ElevenTiles = 0x11,
		//%block="twelve"
		TwelveTiles = 0x12
	}
	/**
	 * Turn For Tiles
	 */
	export enum TurnTiles {
		//% block="right"
		TurnRight = 0x01,
		//%block="left"
		TurnLeft = 0x02,
	}
	
	// Units
	/**
	 * Select Units
	 */
	export enum SelectUnits {
		//% block="cm"
		Cm = 0x00,
		//%block="inches"
		Inches = 0x01
	}
	
	
	// Buzzer Set Up
	pins.setAudioPin(maizBuzzerPin); // Set Buzzer To Mai-Z Buzzer Pin
	// Start Key Initialisation
	txMessage(CommandID.START_KEY, []); // Send Start Key Over Comms
	
	
	// Blocks
	
	// Movement
	////////////////
	///Move-MaiZ///
	////////////////
	
	/**
	 * move mai-z [direction], [speed], [distance]: moves mai-z in the relevant direction, at the relevant speed, over the relevant distance
	 * @param direction : forwards - moves mai-z motors forwards. reverse - moves mai-z motors in reverse / backwards.
	 * @param distance: 0 / continuous - infinitely moves mai-z. distance to move in cm/inches.
	 * @param speed: speed in terms of a percentage e.g. 1 - 100.
	 */
	//% blockId=maiz_move
	//% block="move $movedirection at $speed\\% speed for $distance"
	//% weight=100 
	//% blockGap=8
	//% color=#00A654
	//% group="Move"
	//% subcategory="Movement"
	//% speed.min=1 speed.max=100 speed.defl=50
	//% speed.fieldOptions.precision=1
	export function maizMove(movedirection: MoveDirection, speed: number, distance: MoveDistance): void {
		// Extract Distance Value
		distanceValue = ((distance as number) * DISTANCE_CONSTANT);
		// Check If Continuous Is Entered
		if (distanceValue == MoveDistance.Continuous){
			// Check If Command Has Already Been Set
			if (!forwardContFlag){
				// Send Move Command And Parameters
				commsRetries(CommandID.MOVE, [(movedirection as number), speed, distanceValue], CommandType.TxCommand);
				// Set Forwards Continuous Flag
				forwardContFlag = true; // Reset On Stop Commands / New Movement Commands Auto Cliff Detection Handled Separately (If Statement Below)
			}
			else if (autoCliffEnabled)
			{
				// Send Error Read To Check For Cliff Status
				rxMessage(CommandID.ERROR_READ)
				// If No Error
				if (errorStatus === ErrorCode.NO_ERROR) {
					return;  // Continuous Movement Still Okay, Do Not Send Duplicate Command 
				}
				// If A Cliff Detected
				if (errorStatus === ErrorCode.CLIFF_DETECTED) {
					// Re Send Move Continuous Command As Auto Cliff Stopped Movement, Flag Can Stay Set As Movement Being Re Called
					commsRetries(CommandID.MOVE, [(movedirection as number), speed, distanceValue], CommandType.TxCommand); 
				}
			}
		}
		// If Distance Entered
		else{
			// Check If Inches Unit Is Set	
			if (inchesFlag){
				distanceValue = distanceValue * INCHES_CONSTANT;
			}
			// Convert Distance To Bytes
			const distanceArray = intToByte(distanceValue);
			// Send MoveCommand And Parameters
			commsRetries(CommandID.MOVE, [(movedirection as number), speed].concat(distanceArray), CommandType.TxCommand);
			// Reset Continuous Flags
			forwardContFlag = false;
			rightContFlag = false;
			leftContFlag = false;
			// Send Manoeuvre Complete Read Command 
			commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
			// 10ms Delay - Prevent Overload
			basic.pause(10);
			// Wait Until Manoeuvre Complete Signal Received
			while (commandCompletedStatus == COMMAND_OUTSTANDING){
				// Send Manoeuvre Complete Read Command  
				commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
				// 10ms Delay - Prevent Overload
				basic.pause(10);
			}
		}
		// Short Pause
		basic.pause(100); // Allows For Movements / Motors To Be Completely Stopped Before Any Subsequent Commands Are Called
	}
	
	/////////////////////////////
	///Rotate-MaiZ-Continuous///
	/////////////////////////////
	
	/**
	 * rotate mai-z [direction], [speed], [angle]: Rotates mai-z in the relevant direction, at the relevant speed, over the relevant angle
	 * @param direction : left - rotates mai-z left. right - rotates mai-z right.
	 * @param speed: speed in terms of a percentage e.g. 1 - 100.
	 * @param angle: 0 / continuous - infinetly rotates mai-z. angle to move in degrees.
	 */
	//% blockId=maiz_rotate_continuous
	//% block="rotate $rotatedirection continuously at $speed\\% speed"
	//% weight=90 
	//% blockGap=8
	//% color=#00A654
	//% group="Rotate"
	//% subcategory="Movement"
	//% speed.min=1 speed.max=100 speed.defl=50
	//% speed.fieldOptions.precision=1
	export function maizRotateContinuous(rotatedirection: RotateDirection, speed: number): void {
		// Check Requested Direction
		const clockwiseFlag = (rotatedirection === RotateDirection.Clockwise);
		// Check If Requested Direction Is Already Active
		const activeFlag = clockwiseFlag ? rightContFlag : leftContFlag;
		// If Requested Direction Not Active Call Movement As Normal
		if (!activeFlag){
			// Check If The Requested Command Has Already Been Sent, If So Return To Avoid Duplicate Commands Being Sent Over The I2C Line
			if (rotatedirection === RotateDirection.Clockwise && rightContFlag) return;
			if (rotatedirection === RotateDirection.Anticlockwise && leftContFlag) return;
			// Reset Flags For The New Command Call
			rightContFlag = false;
			leftContFlag = false;
			// Send Rotate (Spin) Command And Parameters
			commsRetries(CommandID.SPIN, [(rotatedirection as number), speed, MoveDistance.Continuous], CommandType.TxCommand);
			// Set Flag Based On New Command Sent
			if (rotatedirection === RotateDirection.Clockwise){
				rightContFlag = true; // Reset On Stop Commands / New Direction
			}
			else{
				leftContFlag = true; // Reset On Stop Commands / New Direction
			}
		}
		else if (autoCliffEnabled)
			{
				// Send Error Read To Check For Cliff Status
				rxMessage(CommandID.ERROR_READ)
				// If No Error
				if (errorStatus === ErrorCode.NO_ERROR) {
					return;  // Continuous Movement Still Okay, Do Not Send Duplicate Command 
				}
				// If A Cliff Detected
				if (errorStatus === ErrorCode.CLIFF_DETECTED) {
					// Re Send Move Continuous Command As Auto Cliff Stopped Movement, Flag Can Stay Set As Movement Being Re Called
					commsRetries(CommandID.SPIN, [(rotatedirection as number), speed, MoveDistance.Continuous], CommandType.TxCommand);
				}
			}
		// Short Pause
		basic.pause(100); // Allows For Movements / Motors To Be Completely Stopped Before Any Subsequent Commands Are Called
	}
	
	////////////////////////
	///Rotate-MaiZ-Angle///
	////////////////////////
	
	/**
	 * rotate mai-z [anlge], [speed]: Rotates mai-z over the relevant angle in the relevant direction (decided by the angle), at the relevant speed
	 * @param direction : left - rotates mai-z left. right - rotates mai-z right.
	 * @param speed: speed in terms of a percentage e.g. 1 - 100.
	 * @param angle: 0 / continuous - infinitely rotates mai-z. angle to move in degrees.
	 */
	//% blockId=maiz_rotate_angle
	//% block="rotate $rotateratio at $speed\\% speed"
	//% weight=80 
	//% blockGap=8
	//% color=#00A654
	//% group="Rotate"
	//% subcategory="Movement"
	//% rotateratio.min=-180 rotateratio.max=180 
	//% rotateratio.fieldOptions.precision=10
	//% rotateratio.shadow=turnRatioPicker
	//% speed.min=1 speed.max=100 speed.defl=50
	//% speed.fieldOptions.precision=1
	export function maizRotateAngle(rotateratio: number, speed: number): void {
		// Extract Direction Based On If rotateratio Is + or -
		let rotateDirection = rotateratio > 0 ? RotateDirection.Clockwise : RotateDirection.Anticlockwise;
		// Extract Distance Value
		distanceValue = (Math.abs(rotateratio) * DISTANCE_CONSTANT);
		// Check If Inches Unit Is Set	
		if (inchesFlag){
			distanceValue = distanceValue * INCHES_CONSTANT;
		}
		// Convert Distance To Bytes
		const distanceArray = intToByte(distanceValue);
		// Send Rotate (Spin) Command And Parameters
		commsRetries(CommandID.SPIN, [(rotateDirection as number), speed].concat(distanceArray), CommandType.TxCommand); // Pass The Angle As A Positive Number/Unsigned Integer
		// Reset Continuous Flags
		forwardContFlag = false;
		rightContFlag = false;
		leftContFlag = false;
		// Send Manoeuvre Complete Read Command 
		commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
		// 10ms Delay - Prevent Overload
		basic.pause(10);
		// Wait Until Manoeuvre Complete Signal Received
		while (commandCompletedStatus == COMMAND_OUTSTANDING){
			// Send Manoeuvre Complete Read Command  
			commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
			// 10ms Delay - Prevent Overload
			basic.pause(10);
		}
		// Short Pause
		basic.pause(100); // Allows For Movements / Motors To Be Completely Stopped Before Any Subsequent Commands Are Called
	}
	
	/////////////////////////
	///Full-Mai-Z-Rotation///
	/////////////////////////
	
	/**
	 * 360 rotation: turns mai-z a full 360 degree rotation in the chosen direction at the chosen speed
	 * @param direction : left - rotates mai-z left/anticlockwise. right - rotates mai-z right/clockwise.
	 */
	//% blockId=maiz_360_rotation
	//% block="rotate 360 degrees in $rotatedirection direction at $speed\\% speed"
	//% weight=70                    
	//% blockGap=8
	//% color=#00A654
	//% group="Rotate"
	//% subcategory="Movement"
	export function maiz360Rotation(rotatedirection: RotateDirection, speed: number): void {
		// Send Turn Command And Parameters
		commsRetries(CommandID.SPIN, [(rotatedirection as number), speed, 0xA0, 0x8c], CommandType.TxCommand); // Pass The Chosen Direction With A Angle Of 360 (0xA0, 0x8C = 18000 In Hex) And A Speed Of 1%
		// Reset Continuous Flags
		forwardContFlag = false;
		rightContFlag = false;
		leftContFlag = false;
		// Send Manoeuvre Complete Read Command 
		commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
		// 10ms Delay - Prevent Overload
		basic.pause(10);
		// Wait Until Manoeuvre Complete Signal Received
		while (commandCompletedStatus == COMMAND_OUTSTANDING){
			// Send Manoeuvre Complete Read Command  
			commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
			// 10ms Delay - Prevent Overload
			basic.pause(10);
		}
		// Short Pause
		basic.pause(100); // Allows For Movements / Motors To Be Completely Stopped Before Any Subsequent Commands Are Called
	}
	
	////////////////
	///Stop-MaiZ///
	////////////////
	
	/**
	 * instantly stop maiz movement
	 */
	//% blockId=maiz_stop
	//% block="stop"
	//% weight=100 
	//% blockGap=8
	//% color=#00A654
	//% group="Stop"
	//% subcategory="Movement"
	export function maizStop(): void {
		// Send Stop Command
		commsRetries(CommandID.STOP, [], CommandType.TxCommand);
		// Reset Continuous Flags
		rightContFlag = false;
		leftContFlag = false;
		forwardContFlag = false;
		// Short Pause
		basic.pause(100); // Allows For Movements / Motors To Be Completely Stopped Before Any Subsequent Commands Are Called
	}
	
	////////////////////////
	///Gradual-Stop-MaiZ///
	////////////////////////
	
	/**
	 * gradually stop maiz by steadily decreasing speed to zero
	 */
	//% blockId=maiz_gradual_stop
	//% block="gradual stop"
	//% weight=90 
	//% blockGap=8
	//% color=#00A654
	//% group="Stop"
	//% subcategory="Movement"
	export function maizGradualStop(): void {
		// Send Gradual Stop Command
		commsRetries(CommandID.GRADUAL_STOP, [], CommandType.TxCommand);
		// Reset Continuous Flags
		rightContFlag = false;
		leftContFlag = false;
		forwardContFlag = false;
		// Send Manoeuvre Complete Read Command 
		commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
		// 10ms Delay - Prevent Overload
		basic.pause(10);
		// Wait Until Manoeuvre Complete Signal Received
		while (commandCompletedStatus == COMMAND_OUTSTANDING){
		// Send Manoeuvre Complete Read Command  
		commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
		// 10ms Delay - Prevent Overload
		basic.pause(10);
		}
		
		// Short Pause
		basic.pause(100); // Allows For Movements / Motors To Be Completely Stopped Before Any Subsequent Commands Are Called
	}
	
	////////////////
	///Move-Tiles///
	////////////////
	
	/**
	 * move mai-z over [number of tiles] at [speed]: moves mai-z over the selected number of tiles at the relevant speed
	 * @param number of tiles : amount of tiles to move across.
	 * @param speed: speed in terms of a percentage e.g. 1 - 100.
	 */
	//% blockId=maiz_move_tiles
	//% block="move $movextiles tiles at $speed\\% speed"
	//% weight=100 
	//% blockGap=8
	//% color=#00A654
	//% group="Tiles"
	//% subcategory="Movement"
	//% speed.min=1 speed.max=100 speed.defl=50
	//% speed.fieldOptions.precision=1
	export function maizMoveTiles(movextiles: MoveXTiles, speed: number): void {
		// Extract Distance Value
		distanceValue = ((movextiles as number) * 13.5 * DISTANCE_CONSTANT); // 13.5 - Distance Of One Tile
		// Convert Distance To Bytes
		const distanceArray = intToByte(distanceValue);
		// Send MoveCommand And Parameters
		commsRetries(CommandID.MOVE, [(MoveDirection.Forwards), speed].concat(distanceArray), CommandType.TxCommand);
		// Reset Continuous Flags
		forwardContFlag = false;
		rightContFlag = false;
		leftContFlag = false;
		// Send Manoeuvre Complete Read Command 
		commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
		// 10ms Delay - Prevent Overload
		basic.pause(10);
		// Wait Until Manoeuvre Complete Signal Received
		while (commandCompletedStatus == COMMAND_OUTSTANDING){
			// Send Manoeuvre Complete Read Command  
			commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
			// 10ms Delay - Prevent Overload
			basic.pause(10);
		}
		// Short Pause
		basic.pause(100); // Allows For Movements / Motors To Be Completely Stopped Before Any Subsequent Commands Are Called
	}
	
	////////////////
	///Turn-Tiles///
	////////////////
	
	/**
	 * turn [direction]: turns mai-z ninety degrees left or right, for use with tiles set
	 * @param direction : left - rotates mai-z left/anticlockwise. right - rotates Mai-z right/clockwise.
	 */
	//% blockId=maiz_turn_tiles
	//% block="turn $tileturndirection"
	//% weight=90 
	//% blockGap=8
	//% color=#00A654
	//% group="Tiles"
	//% subcategory="Movement"
	export function maizTurnTiles(tileturndirection: TurnTiles): void {
		// Send Turn Command And Parameters
		commsRetries(CommandID.SPIN, [(tileturndirection as number), 1, 0x28, 0x23], CommandType.TxCommand); // Pass The Chosen Direction With A Angle Of 90 (0x28, 0x23 = 900 In Hex) And A Speed Of 1%
		// Reset Continuous Flags
		forwardContFlag = false;
		rightContFlag = false;
		leftContFlag = false;
		// Send Manoeuvre Complete Read Command 
		commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
		// 10ms Delay - Prevent Overload
		basic.pause(10);
		// Wait Until Manoeuvre Complete Signal Received
		while (commandCompletedStatus == COMMAND_OUTSTANDING){
			// Send Manoeuvre Complete Read Command  
			commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
			// 10ms Delay - Prevent Overload
			basic.pause(10);
		}
		// Short Pause
		basic.pause(100); // Allows For Movements / Motors To Be Completely Stopped Before Any Subsequent Commands Are Called
	}
	
	//////////////////
	///U-Turn-Tiles///
	//////////////////
	
	/**
	 * u turn: turns mai-z one hundred and eighty degrees, for use with the tile set
	 * @param direction : left - rotates mai-z left/anticlockwise. right - rotates mai-z right/clockwise.
	 */
	//% blockId=maiz_u_turn
	//% block="u turn"
	//% weight=80 
	//% blockGap=8
	//% color=#00A654
	//% group="Tiles"
	//% subcategory="Movement"
	export function maizUTurn(): void {
		// Send Turn Command And Parameters
		commsRetries(CommandID.SPIN, [(RotateDirection.Clockwise), 1, 0x50, 0x46], CommandType.TxCommand); // Pass The Chosen Direction With A Angle Of 180 (0x50, 0x46 = 1800 In Hex) And A Speed Of 1%
		// Reset Continuous Flags
		forwardContFlag = false;
		rightContFlag = false;
		leftContFlag = false;
		// Send Manoeuvre Complete Read Command 
		commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
		// 10ms Delay - Prevent Overload
		basic.pause(10);
		// Wait Until Manoeuvre Complete Signal Received
		while (commandCompletedStatus == COMMAND_OUTSTANDING){
			// Send Manoeuvre Complete Read Command  
			commsRetries(CommandID.COMMAND_FINISHED_READ, [], CommandType.RxCommand);
			// 10ms Delay - Prevent Overload
			basic.pause(10);
		}
		// Short Pause
		basic.pause(100); // Allows For Movements / Motors To Be Completely Stopped Before Any Subsequent Commands Are Called
	}
	
	// LEDs
	//////////////
	///Set-LEDs///
	//////////////
	
	/**
	 * set LEDs to [colour]: sets the relevant LED to the relevant colour
	 * @param colour: colour of led (8 colours, off)
	 */
	//% blockId=set_leds
	//% block="set LEDs to $ledcolours"
	//% weight=100 
	//% blockGap=8
	//% color=#996DAD
	//% group="LEDs"
	//% subcategory="LEDs"
	//% ledcolours.shadow="colorNumberPicker"
	export function setLEDs(ledcolours: number): void {
		// Send Set LEDs Command And Parameter
		commsRetries(CommandID.TURN_ALL_ZIP_LEDS, [colourIDMapper(ledcolours)], CommandType.TxCommand);  // Pass The Colour Number Mapped As A Command ID
	}
	
	/////////////
	///Set-LED///
	/////////////
	
	/**
	 * set LED [LedID] to [colour]: sets the relevant LED to the relevant colour
	 * @param LedID: id of led (1-4)
	 * @param colour: colour of led (8 colours, off)
	 */
	//% blockId=set_led
	//% block="set $ledid to $ledcolours"
	//% weight=90 
	//% blockGap=8
	//% color=#996DAD
	//% group="LEDs"
	//% subcategory="LEDs"
	//% ledcolours.shadow="colorNumberPicker"
	export function setLED(ledid: LedID, ledcolours: number): void {
		// Send Set LED Command And Parameters
		commsRetries(CommandID.SET_ZIP_LED, [(ledid as number), colourIDMapper(ledcolours)], CommandType.TxCommand); // Pass The Colour Number Mapped As A Command ID
	}
	
	////////////////////
	///Set-Brightness///
	////////////////////
	
	/**
	 * set LED brightness [LedBrightness]
	 * @param LedBrightness: brightness of led as a percentage (1-100)
	 */
	//% blockId=set_led_brightness
	//% block="set LED brightness to $ledbrightness\\%"
	//% weight=80 
	//% blockGap=8
	//% color=#996DAD
	//% group="LEDs"
	//% subcategory="LEDs"
	//% ledbrightness.min=1 ledbrightness.max=100
	//% ledid.fieldOptions.precision=1
	export function setLEDBrightness(ledbrightness: number): void {
		// Map Brightness To 0 - 255 Scale
		let mappedBrightness = ((ledbrightness * 128)/100);
		// Send LED Brightness Command And Mapped Parameter
		commsRetries(CommandID.SET_ZIP_LED_BRIGHTNESS, [mappedBrightness], CommandType.TxCommand);
	}
	
	//////////////////////////
	///Set-Indicator-Lights///
	//////////////////////////
	
	/**
	 * set indicator lights to [indicatorstatus]
	 * @param indicatorstatus: status of indicator lights (left, right, hazards, off)
	 */
	//% blockId=set_indicator_lights
	//% block="set indicator lights to $indicatorstatus"
	//% weight=70 
	//% blockGap=8
	//% color=#996DAD
	//% group="Functional Lighting"
	//% subcategory="LEDs"
	export function setIndicatorLights(indicatorstatus: IndicatorStatus): void {
		// Send Indicator Command
		commsRetries(CommandID.INDICATOR_LIGHT, [indicatorstatus as number], CommandType.TxCommand);
	}
	
	//////////////////////
	///Set-Brake-Lights///
	//////////////////////
	
	/**
	 * set brake lights to [breakstatus]
	 * @param brakestatus: status of break lights (on, off)
	 */
	//% blockId=set_break_lights
	//% block="set brake lights to $brakestatus"
	//% weight=60 
	//% blockGap=8
	//% color=#996DAD
	//% group="Functional Lighting"
	//% subcategory="LEDs"
	export function setBrakeLights(brakestatus: BrakeStatus): void {
		// Send Break Light Command
		commsRetries(CommandID.BREAK_LIGHT, [brakestatus as number], CommandType.TxCommand);
	}
	
	//Sensors
	////////////////////////
	///Line-Follow-Status///
	////////////////////////
	
	/**
	 * return [linefollowsensor] status as true or false
	 * @param linefollowsensor: select which line follow sensor status to return (left, centre, right)
	 */
	//% blockId=line_follow_status
	//% block="$linefollowsensor line follow sensor status"
	//% weight=100 
	//% blockGap=8
	//% color=#00ADE5
	//% group="Line Follow"
	//% subcategory="Sensors"
	export function lineFollowStatus(linefollowsensor: LineFollowSensor): boolean {
		// Send Line Follow Command (Returns Status Of 3 Line Detect And Cliff Detection)
		commsRetries(CommandID.LINE_FOLLOWING_DETECT, [], CommandType.RxCommand);
		// Extract Which Sensor User Has Selected
		let sensorSelect = linefollowsensor as number;
		// Extract Cliff Detection Bit Using Bit Mask
		let lineFollowStatus = (lineFollowValue & sensorSelect);
		// Return Boolean Cast Of Bit
		return !!lineFollowStatus;
	}
	
	////////////////////////////
	///Cliff-Detection-Status///
	////////////////////////////
	
	/**
	 * return cliff detection status as true or false
	 */
	 //% blockId=cliff_detection_status
	//% block="cliff detection status"
	//% weight=90
	//% blockGap=8
	//% color=#00ADE5
	//% group="Line Follow"
	//% subcategory="Sensors"
	export function cliffDetectionStatus(): boolean {
		// Send Line Follow Command (Returns Status Of 3 Line Detect And Cliff Detection) 
		commsRetries(CommandID.LINE_FOLLOWING_DETECT, [], CommandType.RxCommand);
		// Extract Cliff Detection Bit Using Bit Mask
		let cliffDetectStatus = (lineFollowValue >> 3) & 0x01;
		// Return Boolean Cast Of Bit
		return !!cliffDetectStatus
	}
	
	////////////////////////////
	///Auto-Cliff-Detection///
	////////////////////////////
	
	/**
	 * automatic cliff detection status. when enabled this automatically stops the motors and further command processing once a cliff is detected
	 */
	
	//% blockId=auto_cliff_detection
	//% block="auto cliff detection $autocliffstatus"
	//% weight=80 
	//% blockGap=8
	//% color=#00ADE5
	//% group="Line Follow"
	//% subcategory="Sensors"
	export function autoCliffDetection(autocliffstatus: AutoCliffStatus): void {
		// Send Auto Cliff Detection Status
		commsRetries(CommandID.AUTO_CLIFF_DETECT, [autocliffstatus as number], CommandType.TxCommand);
		// Set Flag Based On The Auto Cliff Status
		if (autocliffstatus === AutoCliffStatus.Enabled) autoCliffEnabled = true;
		else autoCliffEnabled = false;
	}
	
	////////////////////
	///Front-Distance///
	////////////////////
	
	/**
	 * measure front distance (2 - 200 cm)
	 */
	//% blockId=front_distance
	//% block="measure front distance"
	//% weight=100 
	//% blockGap=8
	//% color=#00ADE5
	//% group="Front Distance"
	//% subcategory="Sensors"
	export function measureFrontDistance(): number {
		// Send Forward Distance Command
		commsRetries(CommandID.MEASURE_DISTANCE_FRONT, [], CommandType.RxCommand);
		// Check If Inches Is Required
		if (inchesFlag){
			// Return Distance Value In Inches
			return Math.trunc(frontDistanceValue / INCHES_CONSTANT);
		}
		// Return Front Distance Value
		return Math.trunc(frontDistanceValue);
	}
	
	// Buzzer
	////////////////
	///Sound-Horn///
	////////////////
	/**
	 * sound mai-z buzzer, double beep
	 */
	//% blockId=sound_horn
	//% block="beep horn"
	//% weight=100 
	//% blockGap=8
	//% color=#00A79D
	//% subcategory="Buzzer"
	export function soundBuzzer(): void {
		// Send Sound Horn Command
		commsRetries(CommandID.SOUND_HORN, [], CommandType.TxCommand);
	}
	
	// Units
	//////////////////
	///Units-Select///
	//////////////////
	
	/**
	 * measure in [units] (cm by default)
	 * @param units: select what units to measure in (cm, inches)
	 */
	//% blockId=units_select
	//% block="measure in $selectunits"
	//% weight=100 
	//% blockGap=8
	//% color=#EE3D96
	//% subcategory="Units"
	export function unitsSelect(selectunits: SelectUnits): void {
		// Set Flag To Boolean Cast Of Input
		inchesFlag = !!selectunits;
	}
	
	// Miscellaneous
	//////////////////////
	///Software-Version///
	//////////////////////
	
	/**
	 * returns the back end mai-z software version number 
	 */
	//% blockId=software_version
	//% block="return mai-z software version"
	//% weight=100 
	//% blockGap=8
	//% color=#EB944A
	//% group="Software Version"
	//% subcategory="Miscellaneous"
	export function returnSoftwareVersion(): number {
		// Send Forward Distance Command
		commsRetries(CommandID.SOFTWARE_VERSION, [], CommandType.RxCommand);
		// Return Software Version Number
		return softwareVersion;
	}
	
	// General Functions
	
	// Int to Byte Function - Convert Integers To Bytes
	// ---------------------------------------------------------
	// Purpose: Take Parameter Values and Convert To Bytes Ready
	// To Be Processed Into An I2C Message
	// ---------------------------------------------------------
	// Inputs: Parameter Value
	// ---------------------------------------------------------
	// Outputs: Array Of Bytes 
	// ---------------------------------------------------------
	
	export function intToByte(parameterValue: number): number[]{
		// Define Array To Store Bytes in
		let parameterArray = [];
		// Loop Until Parameter Value Completely Processed
		while (parameterValue > 0){
			// Extract The Least Significant Byte And Push To Array
			parameterArray.push(parameterValue & 0xFF);
			// Shift The Parameter Value Right By A Byte/8Bits
			parameterValue >>= 8;
		}
		// Return Byte Array
		return parameterArray;
	}
	
	// Calculate Check Byte Function - Calculate I2C Message Check Bytes
	// ------------------------------------------------------------------
	// Purpose: Calculate Message Check Byte By Taking The Total Of The 
	// Message Bytes And Inverting The Value, The Least Significant Byte 
	// Is Then Taken
	// ------------------------------------------------------------------
	// Inputs: Message Array
	// ------------------------------------------------------------------
	// Outputs: Check Byte
	// ------------------------------------------------------------------
	
	export function calculateCheckByte(message: number[]): number{
		// Calculate Check Byte
		let checkByte = 0;
		// Total Message Array Bytes
		for (let i = 0; i < message.length; i++){ // Loop Through Message Array
			// Sum Current Message Array Byte
			checkByte += message[i];
		}
		// Invert Check Byte And Extract Least Significant Byte
		checkByte = ~checkByte & 0xFF;
		// Return Calculated Check Byte
		return checkByte;
	}
	
	// Tx Function - Prepare and Send I2C Communication Messages
	// ---------------------------------------------------------
	// Purpose: Take Commands and Relevant Parameters and Format 
	// Into an Array, Then Send The Message To Mai-Z
	// ---------------------------------------------------------
	// Inputs: Command ID, Relevant Parameters
	// ---------------------------------------------------------
	// Outputs: Void / Send Prepared Message To Mai-Z Over I2C 
	// ---------------------------------------------------------
	
	export function txMessage(commandID: number, commandParameters: number[]){
		// Calculate Message Length
		const txMessageLength = (commandParameters.length + 2); // Number Of Parameters + 1 For Command ID + 1 For Check Byte
		// Initialise Message Array With Data
		const messageArray = [txMessageLength, commandID];
		// Push Command Parameters To The End Of The Message Array
		for (let i = 0; i < commandParameters.length; i++){// Loop Through All Command Parameters
			messageArray.push(commandParameters[i]); // Push Current Command Parameter To End Of Message Array
		}
		// Calculate Check Byte
		let txCheckByte = calculateCheckByte(messageArray);
		// Add Calculated Check Byte To End Of Message Array
		messageArray.push(txCheckByte);
		// Send Message Over I2C
		pins.i2cWriteBuffer(23, pins.createBufferFromArray(messageArray));
	}
	
	// Rx Function - Receive and Process I2C Communication Messages
	// ------------------------------------------------------------
	// Purpose: Take Receive Commands And Request Relevant Data 
	// From Mai-Z, Then Process The Data And Store In 
	// Corresponding Global Variables
	// ---------------------------------------------------------
	// Inputs: Command ID
	// ---------------------------------------------------------
	// Outputs: Void / Save Relevant Data To Global Variables 
	// ---------------------------------------------------------
	
	export function rxMessage(readID: number){
		// Send Read Command Message
		txMessage(readID, []);
		// Declare Rx Data Buffer
		let rxDataBuffer: Buffer;
		// Check Command ID For Front Distance
		if (readID == CommandID.MEASURE_DISTANCE_FRONT){ // Front Distance Requires 5 Bytes
			// Request And Store Rx Data
			rxDataBuffer = pins.i2cReadBuffer(23, 5, false)// Request 5 Bytes
		}
		else{
			// Request And Store Rx Data
			rxDataBuffer = pins.i2cReadBuffer(23, 4, false)// Request 4 Bytes (All Other Read Types Require 4 Bytes Of Data)
		}
		// Process Received Data
		// Extract Received Message Length
		const rxMessageLength = rxDataBuffer.length;
		// Extract All Data Apart From Check Byte
		let rxCheckByteData: number[] = []; // Initialise Empty Array
		for (let i = 0; i <= rxMessageLength - 2; i++){
			rxCheckByteData.push(rxDataBuffer[i]); // Push All Data Apart From Check Byte
		}
		
		// Calculate Check Byte  
		const rxCheckByte = calculateCheckByte(rxCheckByteData); // Send Rx Message Without Check Byte
		// Compare Calculated and Received Check Bytes
		if (rxCheckByte != rxDataBuffer[rxMessageLength - 1]){
			// Set Error Status To Check Byte Error
			errorStatus = ErrorCode.RX_CHECKBYTE_ERROR;
			// Stop Processing
			return;
		}
		// Extract Packet Type/Command ID
		const rxCommandID = rxDataBuffer[1];
		// Check Expected Command ID Was Received
		if (rxCommandID != readID){
			// Set Error Status To Command Error
			errorStatus = ErrorCode.RX_COMMAND_ERROR;
			return;
		}
		// Extract Relevant Data Based On Command ID
		switch(rxCommandID){
			// Line Follow Status
			case CommandID.LINE_FOLLOWING_DETECT:{
				// Extract Command Completed Status
				lineFollowValue = rxDataBuffer[2]; // 3rd Byte Is Where Relevant Data Is Stored
				return;
			}
			// Front Distance Value
			case CommandID.MEASURE_DISTANCE_FRONT:{
				// Extract Command Completed Status
				frontDistanceValue = ((((rxDataBuffer[3] << 8) | rxDataBuffer[2]) / 100) - 2); // 3rd Byte Is Where Relevant Data Is Stored
				return;
			}
			// Error Status
			case CommandID.ERROR_READ:{
				// Extract Command Completed Status
				errorStatus = rxDataBuffer[2]; // 3rd Byte Is Where Relevant Data Is Stored
				return;
			}
			// Command Completed Status
			case CommandID.COMMAND_FINISHED_READ:{
				// Extract Command Completed Status
				commandCompletedStatus = rxDataBuffer[2]; // 3rd Byte Is Where Relevant Data Is Stored
				return;
			}
			// Command Comms Reset
			case CommandID.COMMS_RESET:{
				// Check If Comms Reset Was Successful
				if (rxDataBuffer[2] == 0x02)
				{
					// Set Comms Reset Flag
					successfulCommsReset = true;
					return;
				}
			}
			// Software Version
			case CommandID.SOFTWARE_VERSION:{
				softwareVersion = rxDataBuffer[2];
			}
		}
	}
	
	// Communication Retries Function - 
	// Send/Receive Commands With Retries Where Applicable To Avoid Errors
	// ------------------------------------------------------------------
	// Purpose: Take Commands And Parameters And Send To Mai-Z, If 
	// Errors Are Returned Retry To A Max Of 3 Tries
	// ------------------------------------------------------------------
	// Inputs: Command ID, Parameters, Tx/Rx 
	// ------------------------------------------------------------------
	// Outputs: Void / Error Codes
	// ------------------------------------------------------------------
	export function commsRetries(commandID: number, commandParameters: number[], commsType: CommandType){
		// Define Variables
		let retriesCounter: number = 0; // Retries Counter
		// Retries Loop
		while (retriesCounter <= MAX_RETRIES){
			// Check Command Type And Send Command To Relevant Function
			if (commsType == CommandType.TxCommand){ // Tx Command
				// Send Command And Parameters To Tx Function
				txMessage(commandID, commandParameters);
			}
			else if (commsType == CommandType.RxCommand){ // Rx Command
				// Send Command And Parameters To Rx Function
				rxMessage(commandID);
			}
			// Send Error Read Command
			rxMessage(CommandID.ERROR_READ); 
			// Check Error Status
			if (errorStatus == ErrorCode.NO_ERROR){ // Command Sent With No Errors
				// Return/Break Out Of Function
				return;
			}
			else if (errorStatus == ErrorCode.START_KEY_ERROR){
				// Reset Error Status
				errorStatus = ErrorCode.NO_ERROR;
				// Reset Micro:bit
				control.reset();
			}
			else if (errorStatus == ErrorCode.CLIFF_DETECTED){
				// Loop Until Cliff Is Not Detected/Floor Detected
				while (errorStatus == ErrorCode.CLIFF_DETECTED){
					// Short Pause Between Retry Attempts
					basic.pause(5); 
					// Retry Error Read
					rxMessage(CommandID.ERROR_READ); // Send Error Read Command
				}
				// Short Pause Before Carrying On Commands
				basic.pause(500); // 500 mS
				// Reset Retries Counter To Give Full Amount Of Retries
				retriesCounter = 0;
				// Retry Original Command
				continue;
			}
			else{ // Errors Returned
				// Increment Retries Counter
				retriesCounter++;
				// Short Pause Between Retry Attempts
				basic.pause(5); // Was 200 mS
			}
		}
		// What To Do If Comms Are Unsuccessful Still ?
	}
}

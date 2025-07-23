// Test program for the Kitronik Mai-Z the Mouse Bot
// This exercises all features on Mai-Z, along with all the blocks in the Mai-Z extension.

// Test Variables
let RightLineFollowSensor = false
let CliffDetectionStatus = false
let FrontDistance = 0
let SoftwareVersion = 0

// Infinite Test Loop
basic.forever(function () {
    // Movement Commands
    kitronikMaiZ.maizMove(kitronikMaiZ.MoveDirection.Forwards, 50, kitronikMaiZ.MoveDistance.TenUnits)
    kitronikMaiZ.maizRotateAngle(90, 50)
    kitronikMaiZ.maizRotateContinuous(kitronikMaiZ.RotateDirection.Clockwise, 50)
    basic.pause(2000)
    kitronikMaiZ.maizStop()
    kitronikMaiZ.maizMove(kitronikMaiZ.MoveDirection.Forwards, 50, kitronikMaiZ.MoveDistance.Continuous)
    basic.pause(2000)
    kitronikMaiZ.maizGradualStop()
    kitronikMaiZ.maizMoveTiles(kitronikMaiZ.MoveXTiles.OneTile, 50)
    kitronikMaiZ.maizTurnTiles(kitronikMaiZ.TurnTiles.TurnRight)
    kitronikMaiZ.maizUTurn()
    
    // LED Commands
    kitronikMaiZ.setLEDs(0x0000ff)
    kitronikMaiZ.setLED(kitronikMaiZ.LedID.ledOne, 0xff0000)
    kitronikMaiZ.setLEDBrightness(50)
    kitronikMaiZ.setIndicatorLights(kitronikMaiZ.IndicatorStatus.Left)
    kitronikMaiZ.setBrakeLights(kitronikMaiZ.BrakeStatus.On)
    basic.pause(2000)
    kitronikMaiZ.setIndicatorLights(kitronikMaiZ.IndicatorStatus.Off)
    kitronikMaiZ.setBrakeLights(kitronikMaiZ.BrakeStatus.Off)
    
    // Sensor Commands
    RightLineFollowSensor = kitronikMaiZ.lineFollowStatus(kitronikMaiZ.LineFollowSensor.Right)
    CliffDetectionStatus = kitronikMaiZ.cliffDetectionStatus()
    kitronikMaiZ.autoCliffDetection(kitronikMaiZ.AutoCliffStatus.Disabled)
    FrontDistance = kitronikMaiZ.measureFrontDistance()
    
    // Buzzer Commands
    kitronikMaiZ.soundBuzzer()
    
    // Units Commands
    kitronikMaiZ.unitsSelect(kitronikMaiZ.SelectUnits.Centimeters)

    //Software Version 
    SoftwareVersion = kitronikMaiZ.returnSoftwareVersion()
})

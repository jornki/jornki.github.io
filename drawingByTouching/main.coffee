DrawingApp =

  init: () ->
    # Default to mouse pointer mode
    @mode = 'mouse'

    # Check if we're on a touch enabled device
    if 'ontouchstart' of window
      # .. then switch to touch mode
      @mode = 'touch'

    # Prevent the window itself from scrolling when on a touch device
    if @mode is 'touch'
      document.addEventListener 'touchmove', (e) ->
        e.preventDefault()
      ,false

    # Calculate the scale factor
    # We do this to compensate for retina devices sunch as an iPad
    # which have a higher pixel density
    @scaleFactor = window.devicePixelRatio || 1;

    @createCanvas()


  createCanvas: () ->
    # Create the DOM canvas and add it to the body
    canvas = document.createElement 'canvas'
    canvas.width = window.innerWidth * @scaleFactor
    canvas.height = window.innerHeight * @scaleFactor
    document.body.appendChild canvas

    # Create the drawing context for the canvas DOM element
    @ctx = canvas.getContext '2d'
    @ctx.strokeStyle = 'rgba(255,0,0,1)' # Red stroke
    @ctx.lineWidth = 5 * @scaleFactor # The thinkness of the stroke
    @ctx.lineCap = 'round' # How the "edge" of the line is drawn
    @ctx.scale @scaleFactor, @scaleFactor

    # Add listeners to the canvas
    if @mode is 'touch'
      canvas.addEventListener 'touchstart', @, false
      canvas.addEventListener 'touchmove', @, false
      canvas.addEventListener 'touchcancel', @, false
    else
      canvas.addEventListener 'mousedown', @, false
      canvas.addEventListener 'mouseup', @, false

  # This method is automatically called for all attached to "this"
  handleEvent:(event) ->
    switch event.type
      when 'touchstart' then @touchStartHandler event
      when 'touchmove' then @touchMoveHandler event
      when 'touchcancel' then @touchCancelHandler event
      when 'mousedown' then @mouseDownHandler event
      when 'mouseup' then @mouseUpHandler event
      when 'mousemove' then @mouseMoveHandler event

  touchStartHandler: (e) ->
    # Move the drawing pointer to the location of the finger
    @ctx.moveTo e.touches[0].pageX * @scaleFactor, e.touches[0].pageY * @scaleFactor

  touchMoveHandler: (e) ->
    # Draw a line from the previous position to the current position
    @ctx.lineTo e.touches[0].pageX * @scaleFactor, e.touches[0].pageY * @scaleFactor
    # Paint the line
    @ctx.stroke()

  touchCancelHandler: (e) ->
    alert 'The application was paused'

  mouseDownHandler: (e) ->
    # Move the drawing pointer to the location of the cursor
    @ctx.moveTo e.layerX * @scaleFactor, e.layerY * @scaleFactor
    # Start listening for cursor movement
    e.target.addEventListener 'mousemove', @, false

  mouseUpHandler: (e) ->
    # When the mose is no longer pressed, stop tracking movements
    e.target.removeEventListener 'mousemove', @, false

  mouseMoveHandler: (e) ->
    # Draw a line from the previous position to the current position
    @ctx.lineTo e.layerX * @scaleFactor, e.layerY * @scaleFactor
    # Paint the line
    @ctx.stroke()


DrawingApp.init()
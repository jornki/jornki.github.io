# SimpleTextEditor by Jørn Kinderås 2014
# A simple demonstration of using Content Editable

SimpleTextEditor =

  init: () ->
    # Grab the main content holder
    @contentHolder = document.querySelector '#editbox'
    if not @contentHolder
      throw new Error 'The editbox element has not been defined'

    # Listen for key presses
    @contentHolder.addEventListener 'keyup', @, false

    # Grab the bold button and listen for clicks
    boldBtn = document.querySelector '#bold'
    if boldBtn
      boldBtn.addEventListener 'click', @, false

    # Grab the itealic button and listen for clicks
    italicBtn = document.querySelector '#italic'
    if italicBtn
      italicBtn.addEventListener 'click', @, false

    # Load any previously saved data
    @restoreDocument()

  # Saves any data after a delay
  saveData: () ->
    # wait a bit to avoid constant i/o
    timeout = window.setTimeout () =>
      window.clearTimeout timeout

      # Grab the data to save
      data = @contentHolder.innerHTML

      # Save the data to local storage
      window.localStorage.setItem 'content', data
    , 1000

  # Load any existing content and stick it into the
  # content holder
  restoreDocument: () ->
    if window.localStorage.content
      @contentHolder.innerHTML = window.localStorage.content

  # Handle any events
  handleEvent: (e) ->
    # If this is a typing event
    if e.type is 'keyup'
      # .. just save any typed data
      return @saveData null

    # If the user clicked the italic button
    if e.target.id is 'italic'
      # ..set the selection to be italic
      document.execCommand 'italic'
    # it the user clicked the bold button
    else if e.target.id is 'bold'
      # .. set the selection to bold
      document.execCommand 'bold'
    # Then save the changes
    @saveData null

# Start the whole shit
SimpleTextEditor.init()
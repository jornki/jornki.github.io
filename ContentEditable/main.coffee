SimpleTextEditor =
  init: () ->
    @editbox = document.querySelector '#editbox'
    if not @editbox
      throw new Error 'The editbox element has not been defined'

    @editbox.addEventListener 'keyup', @saveData, false

    boldBtn = document.querySelector '#bold'
    if boldBtn
      boldBtn.addEventListener 'click', (e) =>
        @toggleBold(e)

    italicBtn = document.querySelector '#italic'
    if italicBtn
      italicBtn.addEventListener 'click', (e) =>
        @toggleItalic(e)

    @restoreDocument()

  saveData: () ->
    timeout = window.setTimeout () =>
      window.clearTimeout timeout

      data = @editbox.innerHTML

      window.localStorage.setItem 'content', data
    , 2000

  restoreDocument: () ->
    if window.localStorage.content
      @editbox.innerHTML = window.localStorage.content

  toggleItalic: () ->
    document.execCommand 'italic'
    @saveData null

  toggleBold: () ->
    document.execCommand 'bold'
    @saveData null


SimpleTextEditor.init()
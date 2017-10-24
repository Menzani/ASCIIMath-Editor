const DEFAULT_PAGE_COUNT = 1
const DEFAULT_EDITOR_VALUE_DATA = '[""]', DEFAULT_EDITOR_VALUE = ""
const DEFAULT_EDITOR_HEIGHT_DATA = '["200px"]', DEFAULT_EDITOR_HEIGHT = "200px"
const DEFAULT_EDITOR_SELECTION_START_DATA = "[0]", DEFAULT_EDITOR_SELECTION_START = 0
const DEFAULT_EDITOR_SELECTION_END_DATA = "[0]", DEFAULT_EDITOR_SELECTION_END = 0
const DEFAULT_EDITOR_SCROLL_TOP_DATA = "[0]", DEFAULT_EDITOR_SCROLL_TOP = 0
const DEFAULT_VIEW_SCROLL_TOP_DATA = "[0]", DEFAULT_VIEW_SCROLL_TOP = 0
const DEFAULT_VIEW_SCROLL_LEFT_DATA = "[0]", DEFAULT_VIEW_SCROLL_LEFT = 0
const DEFAULT_CURRENT_PAGE_INDEX = 0
const DEFAULT_WINDOW_SCROLL_Y = 0

var pages = []

var pageCount
var editorsValueData
var editorsHeightData
var editorsSelectionStartData
var editorsSelectionEndData
var editorsScrollTopData
var viewsScrollTopData
var viewsScrollLeftData
var currentPageIndex
var windowScrollY

window.onscroll = function() {
	windowScrollY = window.scrollY
	saveDocument()
}

function openDocument() {
	pageCount = JSON.parse(localStorage.pageCount || DEFAULT_PAGE_COUNT)
	editorsValueData = JSON.parse(localStorage.editorsValueData || DEFAULT_EDITOR_VALUE_DATA)
	editorsHeightData = JSON.parse(localStorage.editorsHeightData || DEFAULT_EDITOR_HEIGHT_DATA)
	editorsSelectionStartData = JSON.parse(localStorage.editorsSelectionStartData || DEFAULT_EDITOR_SELECTION_START_DATA)
	editorsSelectionEndData = JSON.parse(localStorage.editorsSelectionEndData || DEFAULT_EDITOR_SELECTION_END_DATA)
	editorsScrollTopData = JSON.parse(localStorage.editorsScrollTopData || DEFAULT_EDITOR_SCROLL_TOP_DATA)
	viewsScrollTopData = JSON.parse(localStorage.viewsScrollTopData || DEFAULT_VIEW_SCROLL_TOP_DATA)
	viewsScrollLeftData = JSON.parse(localStorage.viewsScrollLeftData || DEFAULT_VIEW_SCROLL_LEFT_DATA)
	currentPageIndex = JSON.parse(localStorage.currentPageIndex || DEFAULT_CURRENT_PAGE_INDEX)
	windowScrollY = JSON.parse(localStorage.windowScrollY || DEFAULT_WINDOW_SCROLL_Y)
	
	for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
		addPage(pageIndex, false)
	}
	jumpTo(pages[currentPageIndex])
    window.scrollTo(0, windowScrollY)
}

function addPage(pageIndex, animate) {
	var page = document.createElement("div")
	page.classList.add("card", "page")
	if (animate) {
		page.classList.add("pageAppearAnimation")
	}
	var editor = document.createElement("textarea")
	editor.className = "editor"
	var view = document.createElement("div")
	view.className = "view"
	var mathmlOutput = document.createElement("div")
	mathmlOutput.className = "mathmlOutput"
	
	view.appendChild(mathmlOutput)
	page.appendChild(editor)
	page.appendChild(view)
	page.index = pageIndex
	page.editor = editor
	page.mathmlOutput = mathmlOutput
	
	editor.value = editorsValueData[page.index]
	editor.style.height = editorsHeightData[page.index]
	editor.selectionStart = editorsSelectionStartData[page.index]
	editor.selectionEnd = editorsSelectionEndData[page.index]
	editor.scrollTop = editorsScrollTopData[page.index]
	render(page)
	// Delay is needed because rendering may not have finished
	window.requestAnimationFrame(function() {
		view.scrollTop = viewsScrollTopData[page.index]
		view.scrollLeft = viewsScrollLeftData[page.index]
	})
	
	page.onclick = function() {
		jumpTo(page)
	}
	editor.onchange = function() {
		editorsValueData[page.index] = editor.value
		saveDocument()
	}
	editor.onkeyup = function() { onInteract(page) }
	editor.onmouseup = function() { onInteract(page) }
	editor.oncut = function() { onInteract(page) }
	editor.onpaste = function() { onInteract(page) }
	editor.onscroll = function() {
		editorsScrollTopData[page.index] = editor.scrollTop
		saveDocument()
	}
	view.onscroll = function() {
		viewsScrollTopData[page.index] = view.scrollTop
		viewsScrollLeftData[page.index] = view.scrollLeft
		saveDocument()
	}
	
	if (page.index == pages.length) {
		pages.push(page)
		document.body.appendChild(page)
	} else {
		pages.splice(page.index, 0, page)
		document.body.insertBefore(page, pages[page.index + 1])
	}
	return page
}

function doAddPage() {
	pageCount++
	currentPageIndex++
	editorsValueData.splice(currentPageIndex, 0, DEFAULT_EDITOR_VALUE)
	editorsHeightData.splice(currentPageIndex, 0, DEFAULT_EDITOR_HEIGHT)
	editorsSelectionStartData.splice(currentPageIndex, 0, DEFAULT_EDITOR_SELECTION_START)
	editorsSelectionEndData.splice(currentPageIndex, 0, DEFAULT_EDITOR_SELECTION_END)
	editorsScrollTopData.splice(currentPageIndex, 0, DEFAULT_EDITOR_SCROLL_TOP)
	viewsScrollTopData.splice(currentPageIndex, 0, DEFAULT_VIEW_SCROLL_TOP)
	viewsScrollLeftData.splice(currentPageIndex, 0, DEFAULT_VIEW_SCROLL_LEFT)
	
	var page = addPage(currentPageIndex, true)
	jumpTo(page)
	saveDocument()
}

function removePage(pageIndex) {
	var page = pages.splice(pageIndex, 1)[0]
	for (newPageIndex = 0; newPageIndex < pages.length; newPageIndex++) {
		pages[newPageIndex].index = newPageIndex
	}
	
	page.classList.remove("pageAppearAnimation")
	page.classList.add("pageDisappearAnimation")
	page.onanimationend = function() {
		document.body.removeChild(page)
		
		if (currentPageIndex == 0) {
			if (pageCount == 0) {
				currentPageIndex = -1
			} else {
				jumpTo(pages[0])
			}
		} else {
			jumpTo(pages[--currentPageIndex])
		}
		saveDocument()
	}
}

function doRemovePage() {
	if (pageCount == 0) {
		return
	}
	pageCount--
	editorsValueData.splice(currentPageIndex, 1)
	editorsHeightData.splice(currentPageIndex, 1)
	editorsSelectionStartData.splice(currentPageIndex, 1)
	editorsSelectionEndData.splice(currentPageIndex, 1)
	editorsScrollTopData.splice(currentPageIndex, 1)
	viewsScrollTopData.splice(currentPageIndex, 1)
	viewsScrollLeftData.splice(currentPageIndex, 1)
	
	removePage(currentPageIndex)
	saveDocument()
}

function render(page) {
	var result = ""
    for (line of page.editor.value.split(/\r?\n/)) {
    	if (line.startsWith("#")) {
        	result += ("<p class='noteParagraph'><i>" + line.slice(1) + "</i></p>")
        } else if (line.startsWith("*")) {
            result += ("<p class='noteParagraph'><b>" + line.slice(1) + "</b></p>")
        } else if (line.trim().length > 0) {
        	result += ("<div class='mathParagraph'>°" + line + "°</div>")
        }
    }
	page.mathmlOutput.innerHTML = result
 	asciimath.AMprocesssNode(page.mathmlOutput)
}

function onInteract(page) {
	if (page.index >= pages.length) {
		return
	}
	render(page)
	editorsHeightData[page.index] = page.editor.style.height
	editorsSelectionStartData[page.index] = page.editor.selectionStart
	editorsSelectionEndData[page.index] = page.editor.selectionEnd
	currentPageIndex = page.index
	saveDocument()
}

function jumpTo(page) {
	page.editor.focus()
}

function saveDocument() {
	localStorage.pageCount = JSON.stringify(pageCount)
	localStorage.editorsValueData = JSON.stringify(editorsValueData)
	localStorage.editorsHeightData = JSON.stringify(editorsHeightData)
	localStorage.editorsSelectionStartData = JSON.stringify(editorsSelectionStartData)
	localStorage.editorsSelectionEndData = JSON.stringify(editorsSelectionEndData)
	localStorage.editorsScrollTopData = JSON.stringify(editorsScrollTopData)
	localStorage.viewsScrollTopData = JSON.stringify(viewsScrollTopData)
	localStorage.viewsScrollLeftData = JSON.stringify(viewsScrollLeftData)
	localStorage.currentPageIndex = JSON.stringify(currentPageIndex)
	localStorage.windowScrollY = JSON.stringify(windowScrollY)
}

function deleteDocument() {
	localStorage.clear()
	location.reload()
}
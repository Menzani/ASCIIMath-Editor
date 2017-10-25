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
	log("addPage", pageIndex)
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
	
	page.appendChild(editor)
	view.appendChild(mathmlOutput)
	page.appendChild(view)
	page.editor = editor
	page.view = view
	page.mathmlOutput = mathmlOutput
	
	editor.value = editorsValueData[pageIndex]
	editor.style.height = editorsHeightData[pageIndex]
	editor.selectionStart = editorsSelectionStartData[pageIndex]
	editor.selectionEnd = editorsSelectionEndData[pageIndex]
	editor.scrollTop = editorsScrollTopData[pageIndex]
	render(page)
	window.requestAnimationFrame(function() {
		view.scrollTop = viewsScrollTopData[pageIndex]
		view.scrollLeft = viewsScrollLeftData[pageIndex]
	})
	
	page.onclick = function() {
		log("page.onclick", pageIndex)
		jumpTo(page)
	}
	editor.onchange = function() {
		log("editor.onchange", pageIndex)
		editorsValueData[pageIndex] = editor.value
		saveDocument()
	}
	editor.onkeyup = function() {
		log("editor.onkeyup", pageIndex, "onInteract")
		onInteract(page, pageIndex)
	}
	editor.onmouseup = function() {
		log("editor.onmouseup", pageIndex, "onInteract")
		onInteract(page, pageIndex)
	}
	editor.oncut = function() {
		log("editor.oncut", pageIndex, "onInteract")
		onInteract(page, pageIndex)
	}
	editor.onpaste = function() {
		log("editor.onpaste", pageIndex, "onInteract")
		onInteract(page, pageIndex)
	}
	editor.onscroll = function() {
		log("editor.onscroll", pageIndex)
		editorsScrollTopData[page.index] = editor.scrollTop
		saveDocument()
	}
	view.onscroll = function() {
		log("view.onscroll", pageIndex)
		viewsScrollTopData[pageIndex] = view.scrollTop
		viewsScrollLeftData[pageIndex] = view.scrollLeft
		saveDocument()
	}
	
	if (pageIndex == pages.length) {
		pages.push(page)
		document.body.appendChild(page)
	} else {
		pages.splice(pageIndex, 0, page)
		document.body.insertBefore(page, pages[pageIndex + 1])
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
	log("removePage", pageIndex)
	var page = pages.splice(pageIndex, 1)[0]
	page.classList.remove("pageAppearAnimation")
	page.onclick = null
	page.editor.onchange = null
	page.editor.onkeyup = null
	page.editor.onmouseup = null
	page.editor.oncut = null
	page.editor.onpaste = null
	page.editor.onscroll = null
	page.view.onscroll = null
	
	if (pageIndex == 0) {
		if (pageCount == 0) {
			currentPageIndex = -1
		} else {
			currentPageIndex = 0
		}
	} else {
		currentPageIndex = --pageIndex
	}
	
	page.classList.add("pageDisappearAnimation")
	page.onanimationend = function() {
		log("page.onanimationend", pageIndex)
		document.body.removeChild(page)
		if (currentPageIndex != -1) {
			jumpTo(pages[currentPageIndex])
		}
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
 	asciimath.AMprocessNode(page.mathmlOutput)
}

function onInteract(page, pageIndex) {
	render(page)
	editorsHeightData[pageIndex] = page.editor.style.height
	editorsSelectionStartData[pageIndex] = page.editor.selectionStart
	editorsSelectionEndData[pageIndex] = page.editor.selectionEnd
	currentPageIndex = pageIndex
	saveDocument()
}

function jumpTo(page) {
	// Scroll into view
	page.editor.focus()
}

function saveDocument() {
	var oldPageCount = localStorage.pageCount
	var oldEditorsValueData = localStorage.editorsValueData
	var oldEditorsHeightData = localStorage.editorsHeightData
	var oldEditorsSelectionStartData = localStorage.editorsSelectionStartData
	var oldEditorsSelectionEndData = localStorage.editorsSelectionEndData
	var oldEditorsScrollTopData = localStorage.editorsScrollTopData
	var oldViewsScrollTopData = localStorage.viewsScrollTopData
	var oldViewsScrollLeftData = localStorage.viewsScrollLeftData
	var oldCurrentPageIndex = localStorage.currentPageIndex
	var oldWindowScrollY = localStorage.windowScrollY
	try {
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
	} catch (e) {
		localStorage.pageCount = oldPageCount
		localStorage.editorsValueData = oldEditorsValueData
		localStorage.editorsHeightData = oldEditorsHeightData
		localStorage.editorsSelectionStartData = oldEditorsSelectionStartData
		localStorage.editorsSelectionEndData = oldEditorsSelectionEndData
		localStorage.editorsScrollTopData = oldEditorsScrollTopData
		localStorage.viewsScrollTopData = oldViewsScrollTopData
		localStorage.viewsScrollLeftData = oldViewsScrollLeftData
		localStorage.currentPageIndex = oldCurrentPageIndex
		localStorage.windowScrollY = oldWindowScrollY
		if (e.name == "NS_ERROR_DOM_QUOTA_REACHED") {
			showErrorMessage(ERROR_DOCUMENT_SAVE_OUT_OF_STORAGE_SPACE)
		} else {
			console.error(e)
			showErrorMessage(ERROR_DOCUMENT_SAVE_UNKNOWN)
		}
	}
}

function deleteDocument() {
	if (!debug.popupOpen) {
		return
	}
	localStorage.clear()
	location.reload()
}

function log(methodName, pageIndex, calledMethodName) {
	if (!debugLog.checked) {
		return
	}
	var result = methodName + "(pageIndex = " + pageIndex + ")"
	if (calledMethodName) {
		result += " -> " + calledMethodName + "()"
	}
	console.log(result)
}
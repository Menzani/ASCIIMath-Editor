// ASCIIMath Editor | (C) 2017 Francesco Menzani – francescomenzani99@gmail.com | https://goo.gl/L1rTj9
"use strict"

const DEFAULT_PAGE_COUNT = 1
const DEFAULT_EDITOR_VALUE_DATA = "[\"\"]", DEFAULT_EDITOR_VALUE = ""
const DEFAULT_EDITOR_HEIGHT_DATA = "[\"200px\"]", DEFAULT_EDITOR_HEIGHT = "200px"
const DEFAULT_EDITOR_SELECTION_START_DATA = "[0]", DEFAULT_EDITOR_SELECTION_START = 0
const DEFAULT_EDITOR_SELECTION_END_DATA = "[0]", DEFAULT_EDITOR_SELECTION_END = 0
const DEFAULT_EDITOR_SCROLL_TOP_DATA = "[0]", DEFAULT_EDITOR_SCROLL_TOP = 0
const DEFAULT_VIEW_SCROLL_TOP_DATA = "[0]", DEFAULT_VIEW_SCROLL_TOP = 0
const DEFAULT_VIEW_SCROLL_LEFT_DATA = "[0]", DEFAULT_VIEW_SCROLL_LEFT = 0
const DEFAULT_CURRENT_PAGE_INDEX = 0
const DEFAULT_WINDOW_SCROLL_Y = 0

let pages = []

let windowScrollY
let pageCount
let currentPageIndex
let editorsValueData
let editorsHeightData
let editorsSelectionStartData
let editorsSelectionEndData
let editorsScrollTopData
let viewsScrollTopData
let viewsScrollLeftData

window.onscroll = function () {
    windowScrollY = window.scrollY
    saveDocument()
}

function openDocument() {
    windowScrollY = JSON.parse(localStorage.windowScrollY || DEFAULT_WINDOW_SCROLL_Y)
    pageCount = JSON.parse(localStorage.pageCount || DEFAULT_PAGE_COUNT)
    currentPageIndex = JSON.parse(localStorage.currentPageIndex || DEFAULT_CURRENT_PAGE_INDEX)
    editorsValueData = JSON.parse(localStorage.editorsValueData || DEFAULT_EDITOR_VALUE_DATA)
    editorsHeightData = JSON.parse(localStorage.editorsHeightData || DEFAULT_EDITOR_HEIGHT_DATA)
    editorsSelectionStartData = JSON.parse(localStorage.editorsSelectionStartData || DEFAULT_EDITOR_SELECTION_START_DATA)
    editorsSelectionEndData = JSON.parse(localStorage.editorsSelectionEndData || DEFAULT_EDITOR_SELECTION_END_DATA)
    editorsScrollTopData = JSON.parse(localStorage.editorsScrollTopData || DEFAULT_EDITOR_SCROLL_TOP_DATA)
    viewsScrollTopData = JSON.parse(localStorage.viewsScrollTopData || DEFAULT_VIEW_SCROLL_TOP_DATA)
    viewsScrollLeftData = JSON.parse(localStorage.viewsScrollLeftData || DEFAULT_VIEW_SCROLL_LEFT_DATA)

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        addPage(pageIndex, false)
    }
    if (currentPageIndex !== -1) {
        jumpTo(pages[currentPageIndex])
    }
    window.scrollTo(0, windowScrollY)
}

function addPage(pageIndex, animate) {
    logEvent("addPage", pageIndex)

    let page = document.createElement("div")
    page.classList.add("card", "page")
    if (animate) {
        page.classList.add("pageAppearAnimation")
    }
    let editor = document.createElement("textarea")
    editor.className = "editor"
    let view = document.createElement("div")
    view.className = "view"
    let viewOutput = document.createElement("div")
    viewOutput.className = "viewOutput"

    page.appendChild(editor)
    view.appendChild(viewOutput)
    page.appendChild(view)
    page.editor = editor
    page.view = view
    page.viewOutput = viewOutput

    editor.value = editorsValueData[pageIndex]
    editor.style.height = editorsHeightData[pageIndex]
    editor.selectionStart = editorsSelectionStartData[pageIndex]
    editor.selectionEnd = editorsSelectionEndData[pageIndex]
    editor.scrollTop = editorsScrollTopData[pageIndex]
    refreshView(page)
    window.requestAnimationFrame(function () {
        view.scrollTop = viewsScrollTopData[pageIndex]
        view.scrollLeft = viewsScrollLeftData[pageIndex]
    })

    page.onclick = function () {
        logEvent("page.onclick", pageIndex)

        jumpTo(page)
    }
    editor.onchange = function () {
        logEvent("editor.onchange", pageIndex)

        editorsValueData[pageIndex] = editor.value
        saveDocument()
    }
    editor.onkeyup = function () {
        logEvent("editor.onkeyup", pageIndex, "onEditorInteract")

        onEditorInteract(page, pageIndex)
    }
    editor.onmouseup = function () {
        logEvent("editor.onmouseup", pageIndex, "onEditorInteract")

        onEditorInteract(page, pageIndex)
    }
    editor.oncut = function () {
        logEvent("editor.oncut", pageIndex, "onEditorInteract")

        onEditorInteract(page, pageIndex)
    }
    editor.onpaste = function () {
        logEvent("editor.onpaste", pageIndex, "onEditorInteract")

        onEditorInteract(page, pageIndex)
    }
    editor.onscroll = function () {
        logEvent("editor.onscroll", pageIndex)

        editorsScrollTopData[page.index] = editor.scrollTop
        saveDocument()
    }
    view.onscroll = function () {
        logEvent("view.onscroll", pageIndex)

        viewsScrollTopData[pageIndex] = view.scrollTop
        viewsScrollLeftData[pageIndex] = view.scrollLeft
        saveDocument()
    }

    if (pageIndex === pages.length) {
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

    let page = addPage(currentPageIndex, true)
    jumpTo(page)
    saveDocument()
}

function removePage(pageIndex) {
    logEvent("removePage", pageIndex)

    let page = pages.splice(pageIndex, 1)[0]
    page.classList.remove("pageAppearAnimation")
    page.onclick = null
    page.editor.onchange = null
    page.editor.onkeyup = null
    page.editor.onmouseup = null
    page.editor.oncut = null
    page.editor.onpaste = null
    page.editor.onscroll = null
    page.view.onscroll = null

    if (pageIndex === 0) {
        if (pageCount === 0) {
            currentPageIndex = -1
        } else {
            currentPageIndex = 0
        }
    } else {
        currentPageIndex = --pageIndex
    }

    page.classList.add("pageDisappearAnimation")
    page.onanimationend = function () {
        logEvent("page.onanimationend", pageIndex)

        document.body.removeChild(page)
        if (currentPageIndex !== -1) {
            jumpTo(pages[currentPageIndex])
        }
    }
}

function doRemovePage() {
    if (pageCount === 0) {
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

function refreshView(page) {
    let result = ""
    for (let line of page.editor.value.split(/\r?\n/)) {
        line = stripHTMLTags(line.trim())
        if (/^# */.test(line)) {
            result += ("<p class=\"viewOutputText\"><i>" + line.slice(1) + "</i></p>")
        } else if (/^\* */.test(line)) {
            result += ("<p class=\"viewOutputText\"><b>" + line.slice(1) + "</b></p>")
        } else if (line.length > 0) {
            line = line.replace(/°/g, "\\°").replace(/\\*$/, "")
            result += ("<div class=\"viewOutputMath\">°" + line + "°</div>")
        }
    }
    page.viewOutput.innerHTML = result
    asciimath.AMprocessNode(page.viewOutput)
}

function stripHTMLTags(text) {
    let dummyBody = document.implementation.createHTMLDocument().body
    dummyBody.innerHTML = text
    return dummyBody.textContent
}

function onEditorInteract(page, pageIndex) {
    refreshView(page)
    editorsHeightData[pageIndex] = page.editor.style.height
    editorsSelectionStartData[pageIndex] = page.editor.selectionStart
    editorsSelectionEndData[pageIndex] = page.editor.selectionEnd
    currentPageIndex = pageIndex
    saveDocument()
}

function jumpTo(page) {
    page.editor.focus()
}

function doJumpUp() {
    if (currentPageIndex === 0) {
        return
    }
    jumpTo(pages[currentPageIndex - 1])
}

function doJumpDown() {
    if (currentPageIndex === pageCount - 1) {
        return
    }
    jumpTo(pages[currentPageIndex + 1])
}

function downloadPageSource() {
    if (currentPageIndex === -1) {
        return
    }

    let dummyLink = document.createElement("a")
    dummyLink.style.display = "none"
    let url = URL.createObjectURL(new Blob([pages[currentPageIndex].editor.value], {type: "text/plain"}))
    dummyLink.href = url
    dummyLink.download = "Source.txt"

    document.body.appendChild(dummyLink)
    dummyLink.click()
    document.body.removeChild(dummyLink)
    URL.revokeObjectURL(url)
}

function saveDocument() {
    let oldWindowScrollY = localStorage.windowScrollY
    let oldPageCount = localStorage.pageCount
    let oldCurrentPageIndex = localStorage.currentPageIndex
    let oldEditorsValueData = localStorage.editorsValueData
    let oldEditorsHeightData = localStorage.editorsHeightData
    let oldEditorsSelectionStartData = localStorage.editorsSelectionStartData
    let oldEditorsSelectionEndData = localStorage.editorsSelectionEndData
    let oldEditorsScrollTopData = localStorage.editorsScrollTopData
    let oldViewsScrollTopData = localStorage.viewsScrollTopData
    let oldViewsScrollLeftData = localStorage.viewsScrollLeftData
    try {
        localStorage.windowScrollY = JSON.stringify(windowScrollY)
        localStorage.pageCount = JSON.stringify(pageCount)
        localStorage.currentPageIndex = JSON.stringify(currentPageIndex)
        localStorage.editorsValueData = JSON.stringify(editorsValueData)
        localStorage.editorsHeightData = JSON.stringify(editorsHeightData)
        localStorage.editorsSelectionStartData = JSON.stringify(editorsSelectionStartData)
        localStorage.editorsSelectionEndData = JSON.stringify(editorsSelectionEndData)
        localStorage.editorsScrollTopData = JSON.stringify(editorsScrollTopData)
        localStorage.viewsScrollTopData = JSON.stringify(viewsScrollTopData)
        localStorage.viewsScrollLeftData = JSON.stringify(viewsScrollLeftData)
    } catch (e) {
        localStorage.clear()
        localStorage.windowScrollY = oldWindowScrollY
        localStorage.pageCount = oldPageCount
        localStorage.currentPageIndex = oldCurrentPageIndex
        localStorage.editorsValueData = oldEditorsValueData
        localStorage.editorsHeightData = oldEditorsHeightData
        localStorage.editorsSelectionStartData = oldEditorsSelectionStartData
        localStorage.editorsSelectionEndData = oldEditorsSelectionEndData
        localStorage.editorsScrollTopData = oldEditorsScrollTopData
        localStorage.viewsScrollTopData = oldViewsScrollTopData
        localStorage.viewsScrollLeftData = oldViewsScrollLeftData
        if (e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
            showErrorMessage(ERROR_DOCUMENT_SAVE_STORAGE)
        } else {
            console.error(e)
            showErrorMessage(ERROR_DOCUMENT_SAVE)
        }
    }
}

function deleteDocument() {
    localStorage.clear()
    location.reload(true)
}

function logEvent(name, pageIndex, calledMethodName) {
    if (!debugDocumentEvents.checked) {
        return
    }
    let result = name + "(pageIndex = " + pageIndex + ")"
    if (calledMethodName) {
        result += " -> " + calledMethodName + "()"
    }
    console.log(result)
}
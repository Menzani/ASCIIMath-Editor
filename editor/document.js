// ASCIIMath Editor | (C) 2017 Francesco Menzani – francescomenzani99@gmail.com | https://www.gnu.org/licenses/agpl-3.0.txt
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
    if (pageIndex === 0) {
        page.style.marginTop = "100px"
    }
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
    updateView(page)
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

function updateView(page) {
    page.viewOutput.innerHTML = ""
    for (let line of page.editor.value.split(/\r?\n/)) {
        let trimmedLine = line.trim()
        let lineElement
        let processLineElement = true
        if (trimmedLine.startsWith("#")) {
            lineElement = document.createElement("p")
            lineElement.classList.add("viewOutputText", "viewOutputParagraph")
            lineElement.textContent = trimmedLine.slice(1)
        } else if (trimmedLine.startsWith("*")) {
            lineElement = document.createElement("p")
            lineElement.classList.add("viewOutputText", "viewOutputHeading")
            lineElement.textContent = trimmedLine.slice(1)
        } else if (trimmedLine === "-=-=-") {
            lineElement = document.createElement("hr")
            processLineElement = false
        } else if (line.startsWith(" ")) { // Always at the end before outline math
            lineElement = document.createElement("p")
            lineElement.classList.add("viewOutputText", "viewOutputQuote")
            lineElement.textContent = line.slice(1)
        } else if (trimmedLine.length > 0) {
            lineElement = document.createElement("div")
            lineElement.className = "viewOutputMath"
            lineElement.appendChild(asciimath.parseMath(trimmedLine))
            processLineElement = false
        }
        if (lineElement !== undefined) {
            if (processLineElement) {
                asciimath.AMprocessNode(lineElement)
            }
            page.viewOutput.appendChild(lineElement)
        }
    }
}

function onEditorInteract(page, pageIndex) {
    updateView(page)
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
    downloadFile(new Blob([pages[currentPageIndex].editor.value], {type: "text/plain"}), "Source.txt")
}

function downloadPagePreview() {
    if (currentPageIndex === -1) {
        return
    }

    let pageViewOutput = pages[currentPageIndex].viewOutput
    let previewWidth = pageViewOutput.offsetWidth + "px"
    let previewHeight = pageViewOutput.offsetHeight + "px"
    let svg = document.createElement("svg")
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    svg.setAttribute("width", previewWidth)
    svg.setAttribute("height", previewHeight)
    getResource("document.css").then(function (data) {
        let style = document.createElement("style")
        style.textContent = data
        svg.appendChild(style)
    }).then(function () {
        let foreignObject = document.createElement("foreignObject")
        foreignObject.setAttribute("width", "100%")
        foreignObject.setAttribute("height", "100%")
        let pageViewOutputClone = pageViewOutput.cloneNode(true)
        pageViewOutputClone.setAttribute("xmlns", "http://www.w3.org/1998/Math/MathML")
        foreignObject.appendChild(pageViewOutputClone)
        svg.appendChild(foreignObject)

        let image = new Image()
        let data = svg.outerHTML.replace(/foreignobject/g, "foreignObject")
        let url = URL.createObjectURL(new Blob([data], {type: "image/svg+xml"}))
        image.onload = function () {
            let canvas = document.createElement("canvas")
            canvas.setAttribute("width", previewWidth)
            canvas.setAttribute("height", previewHeight)
            canvas.getContext("2d").drawImage(image, 0, 0)
            canvas.toBlob(function (blob) {
                downloadFile(blob, "Preview.png")
            })
            URL.revokeObjectURL(url)
        }
        image.src = url
    })
}

function downloadFile(blob, fileName) {
    let dummyLink = document.createElement("a")
    dummyLink.style.display = "none"
    let url = URL.createObjectURL(blob)
    dummyLink.href = url
    dummyLink.download = fileName
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

function openTestDocument() {
    getResource("resources/test-document-data.txt").then(function (data) {
        deleteDocument(function () {
            let lines = data.split(/\r?\n/)
            localStorage.windowScrollY = lines[0]
            localStorage.pageCount = lines[1]
            localStorage.currentPageIndex = lines[2]
            localStorage.editorsValueData = lines[3]
            localStorage.editorsHeightData = lines[4]
            localStorage.editorsSelectionStartData = lines[5]
            localStorage.editorsSelectionEndData = lines[6]
            localStorage.editorsScrollTopData = lines[7]
            localStorage.viewsScrollTopData = lines[8]
            localStorage.viewsScrollLeftData = lines[9]
        })
    })
}

function deleteDocument(initTask) {
    localStorage.clear()
    if (initTask) {
        initTask()
    }
    location.reload(true)
}

function getResource(url) {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest()
        request.open("GET", url)
        request.onreadystatechange = function () {
            if (request.readyState !== 4 || (request.status !== 200 && request.status !== 0)) {
                return
            }
            resolve(request.response)
        }
        request.onerror = function () {
            reject(request.statusText)
        }
        request.send()
    })
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
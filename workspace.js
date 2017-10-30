/*
 *  ASCIIMath Editor – Online document editor for ASCIIMath that runs on Firefox
 *  Copyright (C) 2017  Francesco Menzani – francescomenzani99@gmail.com
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict"

const BACKGROUNDS = [
    "linear-gradient(to top, rgba(30, 144, 255, 0), rgba(30, 144, 255, 1))",
    "linear-gradient(to top, rgba(255, 140, 0, 0), rgba(255, 127, 80, 1))",
    "linear-gradient(to top, rgba(0, 250, 154, 0), rgba(46, 139, 87, 1))"
]
const WALLPAPERS = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg"]

const ERROR_DOCUMENT_SAVE_STORAGE = "document_save_storage"
const ERROR_DOCUMENT_SAVE = "document_save"

let currentBackgroundLayer = false
let currentWallpaperIndex

let backgroundLayer1
let backgroundLayer2
let browserMessage
let errorMessage
let errorMessageText
let syntax
let tour
let tourDownload
let about
let donate
let tutorial
let debug
let debugConsole
let debugDocumentEvents
let debugKeyPress
let contact

document.addEventListener("DOMContentLoaded", function () {
    backgroundLayer1 = document.getElementById("backgroundLayer1")
    backgroundLayer2 = document.getElementById("backgroundLayer2")
    browserMessage = document.getElementById("browserMessage")
    errorMessage = document.getElementById("errorMessage")
    errorMessageText = document.getElementById("errorMessageText")
    syntax = document.getElementById("syntax")
    tour = document.getElementById("tour")
    tourDownload = document.getElementById("tourDownload")
    about = document.getElementById("about")
    donate = document.getElementById("donate")
    tutorial = document.getElementById("tutorial")
    debug = document.getElementById("debug")
    debugConsole = document.getElementById("debugConsole")
    debugDocumentEvents = document.getElementById("debugDocumentEvents")
    debugKeyPress = document.getElementById("debugKeyPress")
    contact = document.getElementById("contact")

    document.body.style.background = selectRandomly(BACKGROUNDS)
    document.body.style.backgroundAttachment = "fixed"
})

function onBodyLoad() {
    if (navigator.userAgent.indexOf("Firefox") === -1) {
        showBrowserMessage()
    }

    currentWallpaperIndex = nextRandomNumber(0, WALLPAPERS.length)
    loadWallpaper()
    WALLPAPERS.loadTaskId = setInterval(loadWallpaper, 5 * 60 * 1000)

    openDocument()
}

function loadWallpaper() {
    setWallpaper("resources/wallpapers/" + WALLPAPERS[currentWallpaperIndex])
    if (++currentWallpaperIndex === WALLPAPERS.length) {
        currentWallpaperIndex = 0
    }
}

function loadCustomWallpaper() {
    let url = prompt("Please set the wallpaper image URL:", "resources/wallpapers/")
    if (url) {
        if (WALLPAPERS.loadTaskId) {
            clearInterval(WALLPAPERS.loadTaskId)
            delete WALLPAPERS.loadTaskId
        }
        setWallpaper(url)
    }
}

function setWallpaper(url) {
    if (currentBackgroundLayer) {
        backgroundLayer2.classList.remove("backgroundLayerAnimation")
        backgroundLayer2.src = url
    } else {
        backgroundLayer1.classList.remove("backgroundLayerAnimation")
        backgroundLayer1.src = url
    }
    currentBackgroundLayer = !currentBackgroundLayer
}

function showWallpaper() {
    setTimeout(function () {
        if (currentBackgroundLayer) {
            backgroundLayer1.classList.add("backgroundLayerAnimation")
            backgroundLayer1.style.zIndex = -1
            backgroundLayer2.style.zIndex = -2
        } else {
            backgroundLayer2.classList.add("backgroundLayerAnimation")
            backgroundLayer2.style.zIndex = -1
            backgroundLayer1.style.zIndex = -2
        }
    }, 3000)
}

function downloadFirefox(event) {
    location.href = "https://www.mozilla.org/it/firefox/new"
    if (event) {
        event.preventDefault()
    }
}

function hidePopup(popup) {
    popup.classList.remove("popupAppearAnimation")
    popup.classList.add("popupDisappearAnimation")
    popup.popupOpen = false
}

function showPopup(popup) {
    popup.classList.remove("popupDisappearAnimation")
    popup.classList.add("popupAppearAnimation")
    popup.popupOpen = true
}

function showBrowserMessage() {
    showPopup(browserMessage)
}

function hideErrorMessage(event) {
    hidePopup(errorMessage)
    event.preventDefault()
}

function showErrorMessage(id) {
    let text
    switch (id) {
        case ERROR_DOCUMENT_SAVE_STORAGE:
            text = "The document is too long. Please delete some content or <a class=\"messageLink\" href=\"\">adjust Firefox's settings</a>."
            break
        case ERROR_DOCUMENT_SAVE:
            text = "The document cannot be saved."
            break
        default:
            console.error("Unknown error message ID: " + id)
            return
    }
    errorMessageText.innerHTML = text
    showPopup(errorMessage)
}

function showCustomErrorMessage() {
    let id = prompt("Please set the error message ID:")
    if (id) {
        showErrorMessage(id)
    }
}

function toggleSyntax() {
    if (syntax.popupOpen) {
        hidePopup(syntax)
    } else {
        showPopup(syntax)
    }
}

function hideTour(event) {
    hidePopup(tour)
    event.preventDefault()
}

function showTour(includeDownload, event) {
    if (includeDownload) {
        tourDownload.style.display = "block"
    } else {
        tourDownload.style.display = "none"
    }
    showPopup(tour)
    event.preventDefault()
}

function hideAbout(event) {
    for (let aboutLink of about.querySelectorAll(".aboutLink")) {
        aboutLink.classList.remove("aboutLinkAnimation")
    }
    hidePopup(about)
    event.preventDefault()
}

function showAbout(event) {
    for (let aboutLink of about.querySelectorAll(".aboutLink")) {
        aboutLink.classList.add("aboutLinkAnimation")
    }
    showPopup(about)
    event.preventDefault()
}

function hideDonate(event) {
    hidePopup(donate)
    event.preventDefault()
}

function showDonate(event) {
    showPopup(donate)
    event.preventDefault()
}

function toggleTutorial() {
    if (tutorial.popupOpen) {
        hidePopup(tutorial)
    } else {
        showPopup(tutorial)
    }
}

function toggleDebug() {
    if (debug.popupOpen) {
        clearInterval(debugConsole.refreshTaskId)
        hidePopup(debug)
    } else {
        refreshDebugConsole()
        showPopup(debug)
        debugConsole.refreshTaskId = setInterval(refreshDebugConsole, 100)
    }
}

function hideContact(event) {
    hidePopup(contact)
    if (event) {
        event.preventDefault()
    }
}

function showContact(event) {
    showPopup(contact)
    event.preventDefault()
}

function refreshDebugConsole() {
    let result = ""
    for (let {key, value, separator} of [
        {key: "currentBackgroundLayer", value: currentBackgroundLayer},
        {key: "currentWallpaperIndex", value: currentWallpaperIndex},
        {separator: true},
        {key: "windowScrollY", value: windowScrollY},
        {key: "pageCount", value: pageCount},
        {separator: true},
        {key: "currentPageIndex", value: currentPageIndex},
        {key: "editorsValueData", value: editorsValueData},
        {key: "editorsHeightData", value: editorsHeightData},
        {key: "editorsSelectionStartData", value: editorsSelectionStartData},
        {key: "editorsSelectionEndData", value: editorsSelectionEndData},
        {key: "editorsScrollTopData", value: editorsScrollTopData},
        {key: "viewsScrollTopData", value: viewsScrollTopData},
        {key: "viewsScrollLeftData", value: viewsScrollLeftData}]) {
        if (separator) {
            result += "<br>"
        } else {
            result += (key + " = " + debugConsole_format(value) + "<br>")
        }
    }
    debugConsole.innerHTML = result + "<br><br>"
}

function debugConsole_format(value) {
    if (value === null) {
        return "null"
    }
    if (value === undefined) {
        return "undefined"
    }
    if (typeof value === "string") {
        return "\"" + value + "\""
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return "[]"
        }
        let result = "["
        for (let e of value) {
            result += (debugConsole_format(e) + ", ")
        }
        return result.slice(0, result.length - 2) + "]"
    }
    return value.toString()
}

function resolveShortcut(event) {
    if (debugKeyPress.checked) {
        console.group()
        console.info("charCode = " + event.charCode)
        console.info("keyCode = " + event.keyCode)
        console.groupEnd()
    }

    if (event.ctrlKey && event.altKey) {
        switch (event.charCode) {
            case 100:
                doRemovePage()
                break
            case 105:
                toggleDebug()
                break
            case 110:
                doAddPage()
                break
            case 113:
                toggleSyntax()
                break
            case 115:
                downloadPageSource()
                break
            case 116:
                toggleTutorial()
                break
        }
        switch (event.keyCode) {
            case 38:
                doJumpUp()
                break
            case 40:
                doJumpDown()
                break
        }
    }
}

function selectRandomly(array) {
    return array[nextRandomNumber(0, array.length)]
}

function nextRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}
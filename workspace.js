const BACKGROUNDS = [
	"linear-gradient(to top, rgba(30, 144, 255, 0), rgba(30, 144, 255, 1))",
	"linear-gradient(to top, rgba(255, 140, 0, 0), rgba(255, 127, 80, 1))",
	"linear-gradient(to top, rgba(0, 250, 154, 0), rgba(46, 139, 87, 1))"
]
const WALLPAPERS = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"]

var currentLayer = false
var currentWallpaper

var workspaceLayer1
var workspaceLayer2
var browserWarning
var reference
var referenceFrame
var presentation
var presentationDownload
var debug
var debugInfo
var debugVerboseCheckbox

document.addEventListener("DOMContentLoaded", function() {
	workspaceLayer1 = document.getElementById("workspaceLayer1")
	workspaceLayer2 = document.getElementById("workspaceLayer2")
	browserWarning = document.getElementById("browserWarning")
	reference = document.getElementById("reference")
	referenceFrame = document.getElementById("referenceFrame")
	presentation = document.getElementById("presentation")
	presentationDownload = document.getElementById("presentationDownload")
	debug = document.getElementById("debug")
	debugInfo = document.getElementById("debugInfo")
	debugVerboseCheckbox = document.getElementById("debugVerboseCheckbox")
	reference.popupOpen = false
	presentation.popupOpen = false
	debug.popupOpen = false
	
	document.body.style.background = selectRandomly(BACKGROUNDS)
	document.body.style.backgroundAttachment = "fixed"
})

function createWorkspace() {
	if (navigator.userAgent.indexOf("Firefox") == -1) {
		showBrowserWarning()
	}
	
	currentWallpaper = nextRandomNumber(0, WALLPAPERS.length)
   	loadWallpaper()
    setInterval(loadWallpaper, 5 * 60 * 1000)
}

function loadWallpaper() {
	var wallpaper = "resources/wallpapers/" + WALLPAPERS[currentWallpaper]
	if (++currentWallpaper == WALLPAPERS.length) {
    	currentWallpaper = 0
    }
	if (currentLayer) {
		workspaceLayer2.classList.remove("workspaceLayerAnimation")
		workspaceLayer2.src = wallpaper
	} else {
		workspaceLayer1.classList.remove("workspaceLayerAnimation")
		workspaceLayer1.src = wallpaper
	}
	currentLayer = !currentLayer
}

function showWallpaper() {
	if (currentLayer) {
		workspaceLayer1.classList.add("workspaceLayerAnimation")
		workspaceLayer1.style.zIndex = -1
		workspaceLayer2.style.zIndex = -2
	} else {
		workspaceLayer2.classList.add("workspaceLayerAnimation")
		workspaceLayer2.style.zIndex = -1
		workspaceLayer1.style.zIndex = -2
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

function showBrowserWarning() {
	showPopup(browserWarning)
}

function toggleReference() {
	if (reference.popupOpen) {
		hidePopup(reference)
	} else {
		if (!referenceFrame.src) {
			referenceFrame.src = "http://asciimath.org/#syntax"
		}
		showPopup(reference)
	}
}

function togglePresentation(includeDownload) {
	if (presentation.popupOpen) {
		hidePopup(presentation)
	} else {
		if (includeDownload) {
			presentationDownload.style.display = "block"
		} else {
			presentationDownload.style.display = "none"
		}
		showPopup(presentation)
	}
	return false
}

function toggleDebug() {
	if (debug.popupOpen) {
		clearInterval(debug.popupIntervalId)
		hidePopup(debug)
	} else {
		updateDebugInfo()
		showPopup(debug)
		debug.popupIntervalId = setInterval(updateDebugInfo, 100)
	}
}

function updateDebugInfo() {
	var result = ""
	for ({key, value, valueFunction} of [
			{ key: "pageCount", value: pageCount },
			{ key: "editorsValueData", value: editorsValueData },
			{ key: "editorsHeightData", value: editorsHeightData },
			{ key: "editorsSelectionStartData", value: editorsSelectionStartData },
			{ key: "editorsSelectionEndData", value: editorsSelectionEndData },
			{ key: "editorsScrollTopData", value: editorsScrollTopData },
			{ key: "viewsScrollTopData", value: viewsScrollTopData },
			{ key: "viewsScrollLeftData", value: viewsScrollLeftData },
			{ key: "currentPageIndex", value: currentPageIndex },
			{ key: "windowScrollY", value: windowScrollY },
			{ key: "pages (indices)", valueFunction: function() {
				var pageIndices = []
				for (page of pages) {
					pageIndices.push(page.index)
				}
				return pageIndices
			}},
			{ key: "currentLayer", value: currentLayer },
			{ key: "currentWallpaper", value: currentWallpaper }]) {
		if (valueFunction) {
			value = valueFunction()
		}
		result += (key + " = " + format(value) + "<br>")
	}
	debugInfo.innerHTML = result + "<br><br>"
}

function format(value) {
	if (value === null) {
		return "null"
	}
	if (value === undefined) {
		return "undefined"
	}
	if (typeof value === "string") {
		return '"' + value + '"'
	}
	if (Array.isArray(value)) {
		if (value.length == 0) {
			return "[]"
		}
		var result = "["
		for (e of value) {
			result += (format(e) + ", ")
		}
		return result.slice(0, result.length - 2) + "]"
	}
	return value.toString()
}

function resolveShortcut(event) {
	if (debugVerboseCheckbox.checked) {
		console.info("charcode = " + event.charCode)
		console.info("keyCode = " + event.keyCode)
	}
	
	if (event.ctrlKey && event.altKey) {
		switch (event.charCode) {
			case 110: doAddPage()
			break
			case 100: doRemovePage()
			break
			case 115: doSavePageSource()
			break
			case 116: toggleTutorial()
			break
			case 113: toggleReference()
			break
			case 105: toggleDebug()
			break
		}
		switch (event.keyCode) {
			case 38: doJumpUp()
			break
			case 40: doJumpDown()
			break;
		}
	}
}

function doSavePageSource() {
	var link = document.createElement("a")
	link.style.display = "none"
	var url = URL.createObjectURL(new Blob([pages[currentPageIndex].editor.value], {type: "text/plain"}))
	link.href = url
	link.download = "ASCIIMath Source.txt"
	
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}

function doJumpUp() {
	if (currentPageIndex == 0) {
		return
	}
	jumpTo(pages[currentPageIndex - 1])
}

function doJumpDown() {
	if (currentPageIndex == pages.length - 1) {
		return
	}
	jumpTo(pages[currentPageIndex + 1])
}

function selectRandomly(array) {
	return array[nextRandomNumber(0, array.length)]
}

function nextRandomNumber(min, max) {
	return min + Math.floor(Math.random() * max)
}
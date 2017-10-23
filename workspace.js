const DEBUG_SESSION = true

const WALLPAPERS = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"]

var currentLayer = false
var currentWallpaper

var message
var workspaceLayer1
var workspaceLayer2
var debug
var debugInfo
var debugVerboseCheckbox
var presentation
var presentationDownload
var reference
var referenceFrame

document.addEventListener("DOMContentLoaded", function() {
	message = document.getElementById("message")
	workspaceLayer1 = document.getElementById("workspaceLayer1")
	workspaceLayer2 = document.getElementById("workspaceLayer2")
	debug = document.getElementById("debug")
	debugInfo = document.getElementById("debugInfo")
	debugVerboseCheckbox = document.getElementById("debugVerboseCheckbox")
	presentation = document.getElementById("presentation")
	presentationDownload = document.getElementById("presentationDownload")
	reference = document.getElementById("reference")
	referenceFrame = document.getElementById("referenceFrame")
})

function createWorkspace() {
	var isSupportedBrowser = navigator.userAgent.indexOf("Firefox") != -1
	if (!isSupportedBrowser || DEBUG_SESSION) {
		message.style.display = "block"
	} else {
		workspaceLayer1.style.top = "0px"
		workspaceLayer2.style.top = "0px"
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
	if (!currentLayer) {
		workspaceLayer2.classList.add("workspaceLayerAnimation")
		workspaceLayer2.style.zIndex = -1
		workspaceLayer1.style.zIndex = -2
	} else {
		workspaceLayer1.classList.add("workspaceLayerAnimation")
		workspaceLayer1.style.zIndex = -1
		workspaceLayer2.style.zIndex = -2
	}
}

function setupDebugSession() {
	if (DEBUG_SESSION) {
		showReference()
		showDebug()
		showPresentation(true)
	}
}

function hidePopup(event, popup) {
	if (event.target.dataset.interceptHide) {
		return
	}
	popup.classList.add("popupAnimation")
}

function showPopup(popup) {
	popup.classList.remove("popupAnimation")
	popup.style.visibility = "visible"
}

function showDebug() {
	updateDebugInfo()
	showPopup(debug)
	setInterval(updateDebugInfo, 100)
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
		if (Array.isArray(value)) {
			var valueResult = "["
			for (e of value) {
				if (e === null) {
					valueResult += "null"
				} else if (e === undefined) {
					valueResult += "undefined"
				} else if (typeof e === "string" && e.length == 0) {
					valueResult += '""'
				} else {
					valueResult += e.toString()
				}
				valueResult += ", "
			}
			if (valueResult == "[") {
				value = "[]"
			} else {
				value = valueResult.slice(0, valueResult.length - 2) + "]"
			}
		} else if (typeof value === "string" && value == "") {
			value = '""'
		}
		result += (key + " = " + value + "<br>")
	}
	debugInfo.innerHTML = result
}

function showPresentation(includeDownload) {
	presentationDownload.style.display = includeDownload ? "block" : "none"
	showPopup(presentation)
	return false
}

function showReference() {
	referenceFrame.src = "http://asciimath.org/#syntax"
	showPopup(reference)
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
			case 113: showReference()
			break
			case 116: showDebug()
			break
		}
		switch (event.keyCode) {
			case 38: doJumpPageUp()
			break
			case 40: doJumpPageDown()
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

function doJumpPageUp() {
	if (currentPageIndex == 0) {
		return
	}
	jumpTo(pages[currentPageIndex - 1])
}

function doJumpPageDown() {
	if (currentPageIndex == pages.length - 1) {
		return
	}
	jumpTo(pages[currentPageIndex + 1])
}

function selectRandomly(array) {
	return array[Math.floor(Math.random() * array.length)]
}

function nextRandomNumber(min, max) {
	return min + Math.floor(Math.random() * max)
}
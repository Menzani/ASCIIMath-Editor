const WALLPAPERS = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"]
const DEBUG_SESSION = true

var workspaceLayer1
var workspaceLayer2
var debug
var debugInfo
var debugVerboseCheckbox
var presentation

var currentLayer = false
var currentWallpaper

document.addEventListener("DOMContentLoaded", function() {
	workspaceLayer1 = document.getElementById("workspaceLayer1")
	workspaceLayer2 = document.getElementById("workspaceLayer2")
	debug = document.getElementById("debug")
	debugInfo = document.getElementById("debugInfo")
	debugVerboseCheckbox = document.getElementById("debugVerboseCheckbox")
	presentation = document.getElementById("presentation")
	
	workspaceLayer1.onload = function() { setTimeout(function() {
		workspaceLayer1.classList.add("workspaceLayerAnimation")
		workspaceLayer1.style.zIndex = -1
		workspaceLayer2.style.zIndex = -2
	}, 2000)}
	workspaceLayer2.onload = function() { setTimeout(function() {
		workspaceLayer2.classList.add("workspaceLayerAnimation")
		workspaceLayer2.style.zIndex = -1
		workspaceLayer1.style.zIndex = -2
	}, 2000)}
	
	if (DEBUG_SESSION) {
		showDebug()
	}
})

function updateDebugInfo() {
	var temp = format("pageCount", pageCount)
	temp += format("editorsValueData", editorsValueData)
	temp += format("editorsHeightData", editorsHeightData)
	temp += format("editorsSelectionStartData", editorsSelectionStartData)
	temp += format("editorsSelectionEndData", editorsSelectionEndData)
	temp += format("editorsScrollTopData", editorsScrollTopData)
	temp += format("viewsScrollLeftData", viewsScrollLeftData)
	temp += format("currentPageIndex", currentPageIndex)
	temp += format("windowScrollY", windowScrollY)
	var pageIndeces = []
	for (page of pages) {
		pageIndeces.push(page.index)
	}
	debugInfo.innerHTML = temp + format("pages (indeces)", pageIndeces)
}

function format(key, value) {
	if (Array.isArray(value)) {
		var temp = "["
		for (e of value) {
			if (e === null) {
				temp += "null"
			} else if (e === undefined) {
				temp += "undefined"
			} else if (typeof e === 'string' && e.length == 0) {
				temp += '""'
			} else {
				temp += e.toString()
			}
			temp += ", "
		}
		if (temp == "[") {
			value = "[]"
		} else {
			value = temp.slice(0, temp.length - 2) + "]"
		}
	}
	return key + ": " + value + "<br>"
}

function createWorkspace() {
	var isSupportedBrowser = navigator.userAgent.indexOf("Firefox") == -1
	if (!isSupportedBrowser || DEBUG_SESSION) {
		var message = document.createElement("p")
		message.id = "message"
		message.innerHTML = "This app is designed to run on <a href='\
				https://www.mozilla.org/it/firefox/new'>Firefox</a> and likely won't support other browsers. \
				<a onclick='showPresentation()' href='#'>Discover why</a>"
		document.body.insertBefore(message, workspaceLayer1)
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

function hidePopup(event, popup) {
	if (event && event.target != popup) {
		return
	}
	popup.classList.add("popupAnimation")
}

function showPopup(popup) {
	popup.classList.remove("popupAnimation")
	popup.style.visibility = "visible"
}

function showDebug() {
	showPopup(debug)
	setInterval(updateDebugInfo, 100)
}

function showPresentation() {
	showPopup(presentation)
	presentation.style.top = nextRandomNumber(100, 300) + "px"
	presentation.style.right = nextRandomNumber(50, 100) + "px"
	return false
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
			case 116: showDebug()
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

function doJumpUp() {
	if (currentPageIndex == 0) return
	jumpTo(pages[currentPageIndex - 1])
}

function doJumpDown() {
	if (currentPageIndex == pages.length - 1) return
	jumpTo(pages[currentPageIndex + 1])
}
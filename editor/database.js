// ASCIIMath Editor | (C) 2017 Francesco Menzani – francescomenzani99@gmail.com | https://www.gnu.org/licenses/agpl-3.0.txt
"use strict"

let dataSource

function initializeDataModel() {
    let request = window.indexedDB.open("ASCIIMath Editor", 1)
    request.onerror = function() {
        notifyError("We are unable to save your data in Firefox.")
    }
    request.onsuccess = function() {
        dataSource = request.result
        dataSource.onerror = function () {
            notifyError("Some changes may not be saved.", dataSource.errorCode)
        }
    }
    request.onupgradeneeded = upgradeSchema
}

// See DB_SCHEMA.md for more information
function upgradeSchema(event) {
    if (event.oldVersion < 1) {
        dataSource.createObjectStore("document", {autoIncrement: true})
        dataSource.createObjectStore("page", {autoIncrement: true})
        dataSource.createObjectStore("page_source", {autoIncrement: true})
    }
}

function documentStore(level) {
    return dataSource.transaction("document", level).objectStore("document")
}

function pageStore(level) {
    return dataSource.transaction("page", level).objectStore("page")
}

function pageSourceStore(level) {
    return dataSource.transaction("page_source", level).objectStore("page_source")
}
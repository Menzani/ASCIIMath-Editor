// ASCIIMath Editor | (C) 2017 Francesco Menzani – francescomenzani99@gmail.com | https://www.gnu.org/licenses/agpl-3.0.txt
"use strict"

const DATABASE_NAME = "ASCIIMath Editor"
const SCHEMA_VERSION = 1
const DOCUMENT_OBJECT_STORE_NAME = "document"
const PAGE_OBJECT_STORE_NAME = "page"
const PAGE_SOURCE_OBJECT_STORE_NAME = "page_source"

let dataSource

function openDatabase() {
    let request = indexedDB.open(DATABASE_NAME, SCHEMA_VERSION)
    request.onerror = function () {
        notifyError("We are unable to save your data in Firefox.")
    }
    request.onupgradeneeded = upgradeSchema
    request.onsuccess = function () {
        dataSource = request.result
        dataSource.onerror = function () {
            notifyError("Some changes may not be saved.", dataSource.errorCode)
        }
    }
}

// See DB_SCHEMA.md for more information
function upgradeSchema(event) {
    let dataSource = event.target.result
    if (event.oldVersion < 1) {
        dataSource.createObjectStore(DOCUMENT_OBJECT_STORE_NAME, {autoIncrement: true})
        dataSource.createObjectStore(PAGE_OBJECT_STORE_NAME, {autoIncrement: true})
        dataSource.createObjectStore(PAGE_SOURCE_OBJECT_STORE_NAME, {autoIncrement: true})
    }
}

function documents(level) {
    return dataSource.transaction(DOCUMENT_OBJECT_STORE_NAME, level).objectStore(DOCUMENT_OBJECT_STORE_NAME)
}

function pages(level) {
    return dataSource.transaction(PAGE_OBJECT_STORE_NAME, level).objectStore(PAGE_OBJECT_STORE_NAME)
}

function pageSources(level) {
    return dataSource.transaction(PAGE_SOURCE_OBJECT_STORE_NAME, level).objectStore(PAGE_SOURCE_OBJECT_STORE_NAME)
}

function deleteDatabase() {
    indexedDB.deleteDatabase(DATABASE_NAME)
    location.reload(true)
}
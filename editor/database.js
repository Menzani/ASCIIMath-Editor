// ASCIIMath Editor | (C) 2017 Francesco Menzani – francescomenzani99@gmail.com | https://www.gnu.org/licenses/agpl-3.0.txt
"use strict"

const DATABASE_NAME = "ASCIIMath Editor"
const SCHEMA_VERSION = 1
const DOCUMENTS = "document"
const PAGES = "page"
const PAGE_SOURCES = "page_source"

let dataSource

function openDatabase() {
    let request = indexedDB.open(DATABASE_NAME, {version: SCHEMA_VERSION, storage: "persistent"})
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
        dataSource.createObjectStore(DOCUMENTS, {autoIncrement: true})
        dataSource.createObjectStore(PAGES, {autoIncrement: true})
        dataSource.createObjectStore(PAGE_SOURCES, {autoIncrement: true})
    }
}

function createTransaction(scope, modifiable) {
    let transaction = dataSource.transaction(scope, modifiable ? "readwrite" : "readonly")
    return {
        documents: function () {
            return transaction.objectStore(DOCUMENTS)
        },
        pages: function () {
            return transaction.objectStore(PAGES)
        },
        pageSources: function () {
            return transaction.objectStore(PAGE_SOURCES)
        }
    }
}

function deleteDatabase() {
    indexedDB.deleteDatabase(DATABASE_NAME)
    location.reload(true)
}
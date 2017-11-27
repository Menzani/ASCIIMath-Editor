// ASCIIMath Editor | (C) 2017 Francesco Menzani – francescomenzani99@gmail.com | https://www.gnu.org/licenses/agpl-3.0.txt
"use strict"

const DATABASE_NAME = "ASCIIMath Editor"
const SCHEMA_VERSION = 1
const DOCUMENTS = "document"
const PAGES = "page"
const PAGE_SOURCES = "page_source"

// See DB_SCHEMA.md for more information
const DEFAULT_DOCUMENT = {
    focusedPage: -1,
    pageKeys: [],
    scroll: {
        top: 0
    }
}
const DEFAULT_PAGE = {
    value: ""
}
const DEFAULT_PAGE_SOURCE = {
    pageSourceKey: undefined,
    editor: {
        height: 200,
        selection: {
            start: 0,
            end: 0
        },
        scroll: {
            top: 0
        }
    },
    view: {
        scroll: {
            left: 0,
            top: 0
        }
    }
}

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
// ASCIIMath Editor | © 2017 Francesco Menzani – francescomenzani99@gmail.com | https://www.gnu.org/licenses/agpl-3.0.txt
"use strict"

const LINE_SEPARATOR = /\r?\n/

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

function getResource(url) {
    return new Promise((resolve, reject) => {
        window.fetch(url).then(function (response) {
            if (response.status !== 200) {
                reject("Bad response status code: " + response.status)
                return
            }
            resolve(response.text())
        }).catch(function (e) {
            reject(e)
        })
    })
}

function selectRandomly(array) {
    return array[nextRandomNumber(0, array.length)]
}

function nextRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}